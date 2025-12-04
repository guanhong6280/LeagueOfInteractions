// server/controllers/userController.js
const User = require('../../models/User');

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

// Get the currently logged in user
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

// Update user information
exports.updateUserInfo = async (req, res) => {
  try {
    const { username, age, rank, sex, timeJoinedTheGame } = req.body;
    console.log(req.body);
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields only if provided
    if (username !== undefined) user.username = username;
    if (age !== undefined) user.age = age;
    if (rank !== undefined) user.rank = rank;
    if (sex !== undefined && sex !== '') user.sex = sex;
    if (timeJoinedTheGame !== undefined) user.timeJoinedTheGame = timeJoinedTheGame;

    await user.save();

    res.status(200).json({ message: 'User information updated successfully', user });
  } catch (error) {
    console.error('Error updating user information:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
