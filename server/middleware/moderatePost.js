const { getPerspectiveScores } = require('../utils/perspective');
const { detectLanguage } = require('../utils/languageDetection');
// Assuming these are your configured thresholds
const {
    TOX_MID, TOX_HIGH,
    SPAM_MID, SPAM_HIGH
} = require('../config/moderation');

module.exports = async function moderatePost(req, res, next) {
    const title = req.body.title;
    const body = req.body.body;

    // --- 1. Basic Validation ---
    if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: 'No title provided!' });
    }
    if (!body || body.trim().length === 0) {
        return res.status(400).json({ error: 'No body text provided!' });
    }
    if (title.length > 200) {
        return res.status(400).json({
            success: false,
            error: 'Title cannot exceed 200 characters.',
        });
    }
    if (body.length > 5000) {
        return res.status(400).json({
            success: false,
            error: 'Body cannot exceed 5000 characters.',
        });
    }

    // --- 2. Combine title and body for moderation ---
    // We moderate the combined text since both are user-generated content
    const combinedText = `${title} ${body}`;

    // --- 3. Initialize Defaults (Fail-Safe State) ---
    // If the API fails, we rely on these default values.
    // 'needsReview' ensures bad posts don't slip through during an outage.
    let toxicity = 0;
    let spam = 0;
    let status = 'needsReview'; 
    let autoModerationFailed = false; 

    try {
        // --- 4. Attempt API Call ---
        const language = detectLanguage(combinedText);
        
        // This awaits the response. If 429 (Rate Limit) occurs, it jumps to catch{}.
        const scores = await getPerspectiveScores(combinedText, language);
        
        toxicity = scores.toxicity;
        spam = scores.spam;

        // --- 5. Apply Moderation Logic (Only if API succeeded) ---
        // Reset status to approved, then downgrade based on scores
        status = 'approved'; 

        if (toxicity > TOX_MID || spam > SPAM_MID) status = 'needsReview';
        if (toxicity > TOX_HIGH || spam > SPAM_HIGH) status = 'rejected';

    } catch (error) {
        // --- 6. Error Handling (Graceful Fallback) ---
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

    // --- 7. Attach Results to Request ---
    // These values are now safe to use in your controller
    req.body.toxicityScore = toxicity;
    req.body.spamScore = spam;
    req.body.status = status;
    
    // Optional: Useful for showing a warning icon in your Admin Dashboard
    req.body.autoModerationFailed = autoModerationFailed;

    next();
};
