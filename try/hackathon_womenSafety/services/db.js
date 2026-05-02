// services/db.js  —  FIXED
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = "mongodb://admin:pass@localhost:27017/women_safety?authSource=admin";
        await mongoose.connect(uri);
        console.log("✅ MongoDB Connected.");
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err.message);
        process.exit(1);
    }
};

export default connectDB;