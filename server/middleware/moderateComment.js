const { getPerspectiveScores } = require('../utils/perspective');
const { detectLanguage } = require('../utils/languageDetection');
// Assuming these are your configured thresholds
const {
    TOX_MID, TOX_HIGH,
    SPAM_MID, SPAM_HIGH
} = require('../config/moderation');

module.exports = async function moderateComment(req, res, next) {
    const text = req.body.comment;

    // --- 1. Basic Validation ---
    if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'No comment text!' });
    }
    if (text.length > 1000) {
        return res.status(400).json({
            success: false,
            error: 'Comment cannot exceed 1000 characters.',
        });
    }

    // --- 2. Initialize Defaults (Fail-Safe State) ---
    // If the API fails, we rely on these default values.
    // 'needsReview' ensures bad comments don't slip through during an outage.
    let toxicity = 0;
    let spam = 0;
    let status = 'needsReview'; 
    let autoModerationFailed = false; 

    try {
        // --- 3. Attempt API Call ---
        const language = detectLanguage(text);
        
        // This awaits the response. If 429 (Rate Limit) occurs, it jumps to catch{}.
        const scores = await getPerspectiveScores(text, language);
        
        toxicity = scores.toxicity;
        spam = scores.spam;

        // --- 4. Apply Moderation Logic (Only if API succeeded) ---
        // Reset status to approved, then downgrade based on scores
        status = 'approved'; 

        if (toxicity > TOX_MID || spam > SPAM_MID) status = 'needsReview';
        if (toxicity > TOX_HIGH || spam > SPAM_HIGH) status = 'rejected';

    } catch (error) {
        // --- 5. Error Handling (Graceful Fallback) ---
        autoModerationFailed = true;
        status = 'needsReview'; // Force manual review on error

        if (error.response) {
            // The request was made and the server responded with a status code
            if (error.response.status === 429) {
                console.warn(`[Moderation] Perspective API Rate Limit (429) hit. Defaulting to 'needsReview'.`);
            } else {
                console.error(`[Moderation] Perspective API Error: ${error.response.status}`, error.response.data);
            }
        } else if (error.request) {
            // The request was made but no response was received (Network down)
            console.error('[Moderation] Perspective API Network Error (No Response).');
        } else {
            console.error('[Moderation] Setup Error:', error.message);
        }
    }

    // --- 6. Attach Results to Request ---
    // These values are now safe to use in your controller
    req.body.toxicityScore = toxicity;
    req.body.spamScore = spam;
    req.body.status = status;
    
    // Optional: Useful for showing a warning icon in your Admin Dashboard
    req.body.autoModerationFailed = autoModerationFailed;

    next();
};