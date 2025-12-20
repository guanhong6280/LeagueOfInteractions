// server/controllers/userController.js
const User = require('../../models/User');
const ChampionRating = require('../../models/ChampionRating');
const ChampionComment = require('../../models/ChampionComment');
const SkinRating = require('../../models/SkinRating');
const SkinComment = require('../../models/SkinComment');
const Skin = require('../../models/Skin');

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
    const { 
      username, age, rank, sex, timeJoinedTheGame, homeCountry, profilePictureURL,
      mainRoles, preferredGameModes, favoriteSkins, favoriteChampions 
    } = req.body;
    console.log(req.body);
    const user = await User.findById(req.user._id);
    console.log('user debug info');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields only if provided
    if (username !== undefined) user.username = username;
    if (age !== undefined) user.age = age;
    if (rank !== undefined) user.rank = rank;
    if (sex !== undefined && sex !== '') user.sex = sex;
    if (timeJoinedTheGame !== undefined) user.timeJoinedTheGame = timeJoinedTheGame;
    if (homeCountry !== undefined) user.homeCountry = homeCountry;
    if (profilePictureURL !== undefined) user.profilePictureURL = profilePictureURL;
    
    // New fields
    if (mainRoles !== undefined) user.mainRoles = mainRoles;
    if (preferredGameModes !== undefined) user.preferredGameModes = preferredGameModes;
    if (favoriteSkins !== undefined) user.favoriteSkins = favoriteSkins;
    if (favoriteChampions !== undefined) user.favoriteChampions = favoriteChampions;

    console.log('user debug info', user);

    await user.save();

    res.status(200).json({ message: 'User information updated successfully', user });
  } catch (error) {
    console.error('Error updating user information:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile by username
exports.getUserProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username }).select('-email -googleId -isAdministrator')
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper function: Get champion ratings
async function getChampionRatings(userId, limit) {
  const ratings = await ChampionRating.find({ userId })
    .sort({ lastUpdated: -1 })
    .limit(limit)
    .lean();
    
  return ratings.map(r => ({
    type: 'championRating',
    championId: r.championId,
    date: r.lastUpdated,
    data: r
  }));
}

// Helper function: Get skin ratings
async function getSkinRatings(userId, limit) {
  const ratings = await SkinRating.find({ userId })
    .sort({ dateUpdated: -1 })
    .limit(limit)
    .lean();

  // Batch-resolve skin names (avoid N+1 queries)
  const skinIds = [...new Set(ratings.map(r => r.skinId))];
  const skins = skinIds.length
    ? await Skin.find({ skinId: { $in: skinIds } }).select('skinId name championId').lean()
    : [];
  const skinById = new Map(skins.map(s => [s.skinId, s]));

  return ratings.map(r => {
    const skin = skinById.get(r.skinId);
    return ({
    type: 'skinRating',
    skinId: r.skinId,
    skinName: skin?.name,
    championId: skin?.championId,
    date: r.dateUpdated,
    data: r
    });
  });
}

// Helper function: Get champion comments
async function getChampionComments(userId, limit) {
  const comments = await ChampionComment.find({ userId, status: 'approved' })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
    
  return comments.map(c => ({
    type: 'championComment',
    championId: c.championId,
    date: c.updatedAt,
    data: c
  }));
}

// Helper function: Get skin comments
async function getSkinComments(userId, limit) {
  const comments = await SkinComment.find({ userId, status: 'approved' })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
    
  return comments.map(c => ({
    type: 'skinComment',
    skinId: c.skinId,
    date: c.updatedAt,
    data: c
  }));
}

// Helper function: Get all activities combined
async function getAllActivities(userId, limit) {
  // Fetch from all sources with a proportional limit
  const perTypeLimit = Math.ceil(limit / 4);
  
  const [championRatings, skinRatings, championComments, skinComments] = await Promise.all([
    getChampionRatings(userId, perTypeLimit),
    getSkinRatings(userId, perTypeLimit),
    getChampionComments(userId, perTypeLimit),
    getSkinComments(userId, perTypeLimit)
  ]);
  
  // Merge all activities
  const allActivities = [
    ...championRatings,
    ...skinRatings,
    ...championComments,
    ...skinComments
  ];
  
  // Sort by date (newest first)
  allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Return only up to the limit
  return allActivities.slice(0, limit);
}

// Get user activity (ratings and comments)
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Query parameters with defaults
    const type = req.query.type || 'all';
    const limit = parseInt(req.query.limit) || 20;
    const maxLimit = 100;
    
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Cap the limit for safety
    const safeLimit = Math.min(limit, maxLimit);
    
    let activities = [];
    
    switch (type) {
      case 'championRatings':
        activities = await getChampionRatings(userId, safeLimit);
        break;
        
      case 'skinRatings':
        activities = await getSkinRatings(userId, safeLimit);
        break;
        
      case 'championComments':
        activities = await getChampionComments(userId, safeLimit);
        break;
        
      case 'skinComments':
        activities = await getSkinComments(userId, safeLimit);
        break;

      case 'allRatings':
        {
          const [champRatings, skinRatings] = await Promise.all([
            getChampionRatings(userId, safeLimit),
            getSkinRatings(userId, safeLimit)
          ]);
          activities = [...champRatings, ...skinRatings].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, safeLimit);
        }
        break;

      case 'allComments':
        {
          const [champComments, skinComments] = await Promise.all([
            getChampionComments(userId, safeLimit),
            getSkinComments(userId, safeLimit)
          ]);
          activities = [...champComments, ...skinComments].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, safeLimit);
        }
        break;
        
      case 'all':
      default:
        activities = await getAllActivities(userId, safeLimit);
        break;
    }
    
    res.json({
      success: true,
      type,
      count: activities.length,
      data: activities
    });
    
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
