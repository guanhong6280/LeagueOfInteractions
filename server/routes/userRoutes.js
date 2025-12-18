// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user/userController');
const { ensureAuthenticated } = require('../middleware/auth');

// Routes for user operations
router.post('/register', userController.registerUser);
router.get('/:id', userController.getUser);
router.put('/favorite-champions', ensureAuthenticated, userController.updateFavoriteChampions);
router.put('/updateUserInformation', ensureAuthenticated, userController.updateUserInfo);

// User profile routes
router.get('/profile/:username', userController.getUserProfileByUsername);
router.get('/:userId/activity', userController.getUserActivity);

module.exports = router;
