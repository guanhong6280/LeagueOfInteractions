// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require("../middleware/auth");

// Routes for user operations
router.post('/register', userController.registerUser);
router.get('/:id', userController.getUserById);
router.put("/favorite-champions", ensureAuthenticated, userController.updateFavoriteChampions);
// Add more routes as needed

module.exports = router;
