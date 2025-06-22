// clock-service/config/database.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('[Clock] MongoDB connected');
  } catch (err) {
    console.error('[Clock] MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;
