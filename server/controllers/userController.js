// server/controllers/userController.js
const User = require("../ models/User");

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

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
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
