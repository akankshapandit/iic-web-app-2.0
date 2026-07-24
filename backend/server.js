import dotenv from "dotenv";
dotenv.config(); 
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import fileUpload from 'express-fileupload';
import startScheduler from "./utils/scheduler.js";

connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/events", eventRoutes);

app.get("/", (req, res) => {
  res.send("🚀 API is active");
});

// Initialize Background Job
startScheduler();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Gemini Key Status:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
});