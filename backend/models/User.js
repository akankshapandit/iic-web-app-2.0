import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  facultyName: { type: String },
  department: { type: String, default: "N/A" },
  role: { type: String, default: "faculty" },
  isFirstLogin: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("User", userSchema);