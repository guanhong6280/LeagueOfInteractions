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

//Get the currently logged in user
exports.getUser = (req, res) => {
  console.log('Session data:', req.session);
  console.log('Authenticated user:', req.user);
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ message: 'Unauthorized' });
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
