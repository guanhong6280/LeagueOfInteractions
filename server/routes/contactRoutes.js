const express = require('express');
const router = express.Router();
const contactController = require('../controllers/user/contactController');

router.post('/', contactController.sendContactEmail);

module.exports = router;

