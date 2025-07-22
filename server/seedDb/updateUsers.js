const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust the path if needed
require('dotenv').config();

async function updateExistingUsers() {
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true
    });

    const result = await User.updateMany({}, {
      $set: { timeJoinedTheGame: null, riotAccounts: [] },
    });

    console.log(`Updated ${result.modifiedCount} users with new fields.`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateExistingUsers();
