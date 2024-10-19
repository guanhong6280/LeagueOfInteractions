// server/controllers/videoController.js
const Video = require("../ models/Video");

exports.uploadVideo = async (req, res) => {
  try {
    let {
      champion1,
      ability1,
      champion2,
      ability2,
      videoURL,
      contributorId,
      title,
      description,
      tags,
    } = req.body;

    // Convert champion names to lowercase for consistency
    champion1 = champion1.toLowerCase();
    champion2 = champion2.toLowerCase();

    // Determine the order based on champion names
    if (champion1 > champion2) {
      // Swap champions and abilities
      [champion1, champion2] = [champion2, champion1];
      [ability1, ability2] = [ability2, ability1];
    }

    const newVideo = new Video({
      champion1,
      ability1,
      champion2,
      ability2,
      videoURL,
      contributor: contributorId,
      title,
      description,
      tags,
    });

    await newVideo.save();

    res.status(201).json({ message: 'Video uploaded successfully', video: newVideo });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// server/controllers/videoController.js

exports.getVideoByInteraction = async (req, res) => {
  let { champion1, ability1, champion2, ability2 } = req.query;

  if (!champion1 || !ability1 || !champion2 || !ability2) {
    return res.status(400).json({ message: 'Missing query parameters' });
  }

  // Convert to lowercase
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
