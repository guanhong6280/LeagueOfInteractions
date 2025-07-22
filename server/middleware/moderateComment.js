const { getPerspectiveScores } = require('../utils/perspective');
const { detectLanguage } = require('../utils/languageDetection');
const {
    TOX_MID, TOX_HIGH,
    SPAM_MID, SPAM_HIGH
} = require('../config/moderation');

module.exports = async function moderateComment(req, res, next) {
    const text = req.body.comment;
    if (!text || text.trim().length === 0) return res.status(400).json({ error: 'No comment text!' });
    if (text.length > 1000) {
        return res.status(400).json({
            success: false,
            error: 'Comment cannot exceed 1000 characters.',
        });
    }
    const language = detectLanguage(text);
    const { toxicity, spam } = await getPerspectiveScores(text, language);

    // compute status
    let status = 'approved';
    if (toxicity > TOX_MID || spam > SPAM_MID) status = 'needsReview';
    if (toxicity > TOX_HIGH || spam > SPAM_HIGH) status = 'rejected';

    // attach to req for your controller
    req.body.toxicityScore = toxicity;
    req.body.spamScore = spam;
    req.body.status = status;

    next();
};