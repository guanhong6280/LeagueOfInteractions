// server/controllers/videoController.js
const Video = require("../models/Video");

exports.uploadVideo = async (req, res) => {
  try {
    let { champion1, ability1, champion2, ability2, videoURL } = req.body;
    const userId = req.user._id;

    // Check for required fields
    if (!champion1 || !ability1 || !champion2 || !ability2 || !videoURL) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Convert champion names to lowercase for consistency
    champion1 = champion1.toLowerCase();
    champion2 = champion2.toLowerCase();

    // Determine the order based on champion names
    if (champion1 > champion2) {
      [champion1, champion2] = [champion2, champion1];
      [ability1, ability2] = [ability2, ability1];
    }

    // Check if a video for this interaction already exists
    const existingVideo = await Video.findOne({ champion1, ability1, champion2, ability2 });
    if (existingVideo) {
      return res.status(409).json({ message: 'A video for this interaction already exists' });
    }

    const title = `${champion1} ${ability1} VS ${champion2} ${ability2}`;
    const description = `The interaction between ${champion1} ${ability1} and ${champion2} ${ability2}`;

    const newVideo = new Video({
      champion1,
      ability1,
      champion2,
      ability2,
      videoURL,
      contributor: userId,
      title,
      description,
    });

    await newVideo.save();

    res.status(201).json({ message: 'Video uploaded successfully', video: newVideo });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Server error', error: error.message }); // Include error.message for more detail
  }
};


// server/controllers/videoController.js

exports.getVideoByInteraction = async (req, res) => {
  let { champion1, ability1, champion2, ability2 } = req.query;

  if (!champion1 || !ability1 || !champion2 || !ability2) {
    return res.status(400).json({ message: 'Missing query parameters' });
  }
  
  champion1 = champion1.toLowerCase();
  champion2 = champion2.toLowerCase();
  // Standardize the order
  if (champion1 > champion2) {
    [champion1, champion2] = [champion2, champion1];
    [ability1, ability2] = [ability2, ability1];
  }

  try {
    const query = { champion1, ability1, champion2, ability2 };

    const video = await Video.findOne(query).populate('contributor', 'username');

    if (video) {
      res.json(video);
    } else {
      res.status(404).json({ message: 'No video found for the selected interaction.' });
    }
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
