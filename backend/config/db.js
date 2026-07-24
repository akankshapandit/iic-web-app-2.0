import mongoose from "mongoose";
import dns from "dns";

const connectDB = async () => {
  try {
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch (e) {
      console.log("DNS setServers warning:", e.message);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected (Atlas)");
  } catch (err) {
    console.error("MongoDB Atlas connection failed:", err.message);
    console.log("Attempting fallback to local MongoDB...");
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/major_project");
      console.log("MongoDB Connected (Local)");
    } catch (localErr) {
      console.error("Local MongoDB connection also failed:", localErr.message);
      console.warn("⚠️ Server started without active MongoDB connection. Please verify MONGO_URI in .env or ensure MongoDB server is running.");
    }
  }
};

export default connectDB;