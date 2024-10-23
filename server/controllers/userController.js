// server/controllers/userController.js
const User = require("../models/User");

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, age, rank, sex, homeCountry, favoriteChampions } = req.body;

    const newUser = new User({
      username,
      email,
      age,
      rank,
      sex,
      homeCountry,
      favoriteChampions,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUser = async (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user })
  } else {
    res.status(401).json({ user: null });
  }
}

// Get user by ID
exports.getUser = (req, res) => {
  try {
    const user = req.user; // Access the user from the request object (already populated by deserializeUser)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user); // Send the user data as a response
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// Update favorite champions
exports.updateFavoriteChampions = async (req, res) => {
  try {
    const { favoriteChampions } = req.body;
    const user = await User.findById(req.user.id);

    if (!Array.isArray(favoriteChampions) || favoriteChampions.length > 5) {
      return res.status(400).json({ message: 'Invalid favorite champions list. Max 5 allowed.' });
    }

    user.favoriteChampions = favoriteChampions;
    await user.save();

    res.json({ message: 'Favorite champions updated successfully', favoriteChampions: user.favoriteChampions });
  } catch (error) {
    console.error('Error updating favorite champions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
