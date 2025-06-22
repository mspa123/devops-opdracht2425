// score-service/config/database.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('[Score] MongoDB connected');
  } catch (err) {
    console.error('[Score] MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;
