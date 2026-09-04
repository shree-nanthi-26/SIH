const mongoose = require('mongoose');
const config = require('./env');

/**
 * Connect to MongoDB with retry logic.
 * Retries up to 5 times with a 5-second delay between attempts.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 5000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(config.mongoUri);
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(
        `❌ MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`
      );
      if (attempt === MAX_RETRIES) {
        console.error('All MongoDB connection attempts exhausted. Exiting.');
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
};

module.exports = connectDB;
