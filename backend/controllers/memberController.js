import User from "../models/User.js";
import Event from "../models/Event.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { normalizeFacultyName } from "../utils/csvSeeder.js";

// Helper to generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      name: user.name, 
      facultyName: user.facultyName || user.name,
      department: user.department,
      role: user.role || "faculty" 
    },
    process.env.JWT_SECRET || "CMRIT_MAJOR_PROJECT_SECRET_2026",
    { expiresIn: "30d" }
  );
};

// 1. Get Public List of Faculty Members for Selection/Login
export const getFacultyMembers = async (req, res) => {
  try {
    const users = await User.find({ role: "faculty" })
      .select("-password")
      .sort({ facultyName: 1, name: 1 });
    
    // Fallback if users empty, extract unique faculty from Events
    if (users.length === 0) {
      const distinctFaculty = await Event.distinct("facultyName");
      const list = distinctFaculty.filter(Boolean).map(name => ({
        _id: name,
        name,
        facultyName: name,
        department: "N/A"
      }));
      return res.status(200).json(list);
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("getFacultyMembers Error:", error);
    res.status(500).json({ message: "Failed to fetch faculty list", error: error.message });
  }
};

// 2. Member Login API
export const memberLogin = async (req, res) => {
  try {
    const { facultyName, email, password } = req.body;

    if (!facultyName && !email) {
      return res.status(400).json({ message: "Faculty selection or email is required." });
    }

    let user;
    if (email) {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    }
    
    if (!user && facultyName) {
      const normalized = normalizeFacultyName(facultyName);
      user = await User.findOne({
        $or: [
          { facultyName: normalized },
          { name: normalized },
          { facultyName: new RegExp(`^${normalized}$`, "i") }
        ]
      });
    }

    if (!user) {
      return res.status(404).json({ message: "Faculty member account not found." });
    }

    // Check if password provided
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    // Also support initial setup password "CMRIT@2026"
    if (!isMatch && password === "CMRIT@2026") {
      // Allow initial setup
    } else if (!isMatch) {
      return res.status(400).json({ message: "Invalid password. Default initial password is 'CMRIT@2026'." });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        facultyName: user.facultyName || user.name,
        email: user.email,
        department: user.department || "N/A",
        role: user.role,
        isFirstLogin: user.isFirstLogin
      }
    });

  } catch (error) {
    console.error("memberLogin Error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// 3. Setup / Update Password
export const setupPassword = async (req, res) => {
  try {
    const { facultyName, newPassword } = req.body;

    if (!facultyName || !newPassword || newPassword.length < 4) {
      return res.status(400).json({ message: "Password must be at least 4 characters." });
    }

    const normalized = normalizeFacultyName(facultyName);
    const user = await User.findOne({
      $or: [{ facultyName: normalized }, { name: normalized }]
    });

    if (!user) {
      return res.status(404).json({ message: "Faculty account not found." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isFirstLogin = false;
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      message: "Password set successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        facultyName: user.facultyName || user.name,
        email: user.email,
        department: user.department || "N/A",
        role: user.role,
        isFirstLogin: false
      }
    });
  } catch (error) {
    console.error("setupPassword Error:", error);
    res.status(500).json({ message: "Failed to set password", error: error.message });
  }
};

// 4. Get Logged-in Faculty's Personalized Events & Dashboard Stats
export const getMemberEvents = async (req, res) => {
  try {
    // SECURE AUTHORIZATION: Use req.user from JWT
    const userId = req.user.id;
    const user = await User.findById(userId);

    const facultyName = user?.facultyName || req.user.facultyName || req.user.name;

    if (!facultyName) {
      return res.status(400).json({ message: "Unable to identify faculty identity." });
    }

    const normalized = normalizeFacultyName(facultyName);

    // Fetch strictly only events matching this faculty name
    const events = await Event.find({
      $or: [
        { facultyName: normalized },
        { facultyName: new RegExp(`^${normalized}$`, "i") }
      ]
    }).sort({ date: -1 });

    // Calculate Summary Statistics
    const total = events.length;
    const completed = events.filter(e => String(e.status).toUpperCase() === "COMPLETED").length;
    const upcoming = total - completed;

    // Calculate Event Type Distribution
    const distribution = {
      "MIC Event": 0,
      "Celebration": 0,
      "IIC": 0,
      "Self Driven": 0
    };

    events.forEach(e => {
      const type = (e.activityType || e.category || "IIC").trim();
      if (type.toUpperCase().includes("MIC")) distribution["MIC Event"]++;
      else if (type.toUpperCase().includes("CELEBRATION")) distribution["Celebration"]++;
      else if (type.toUpperCase().includes("SELF")) distribution["Self Driven"]++;
      else distribution["IIC"]++;
    });

    res.status(200).json({
      facultyProfile: {
        name: normalized,
        department: user?.department || events[0]?.department || "N/A",
        email: user?.email || ""
      },
      stats: {
        total,
        completed,
        upcoming,
        distribution
      },
      events
    });

  } catch (error) {
    console.error("getMemberEvents Error:", error);
    res.status(500).json({ message: "Failed to fetch member events", error: error.message });
  }
};

// 5. Create Self-Driven Event
export const createSelfDrivenEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const facultyName = user?.facultyName || req.user.facultyName || req.user.name;

    if (!facultyName) {
      return res.status(403).json({ message: "Not authorized to create event." });
    }

    const { title, department, activityType, status, date, venue, time, message, reportLink } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: "Event title and date are required." });
    }

    const newEvent = new Event({
      title: title.trim(),
      department: department || user?.department || "N/A",
      activityType: activityType || "Self Driven",
      category: activityType || "Self Driven",
      facultyName: normalizeFacultyName(facultyName),
      status: (status || "COMPLETED").toUpperCase(),
      date: new Date(date),
      venue: venue || "CMRIT Campus",
      time: time || "10:00 AM",
      message: message || "",
      reportLink: reportLink || "",
      source: "SELF_DRIVEN"
    });

    await newEvent.save();

    res.status(201).json({
      message: "Self-driven event created successfully!",
      event: newEvent
    });

  } catch (error) {
    console.error("createSelfDrivenEvent Error:", error);
    res.status(500).json({ message: "Failed to create self-driven event", error: error.message });
  }
};

// 6. Update Report Link for an Event
export const updateReportLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { reportLink } = req.body;
    
    const userId = req.user.id;
    const user = await User.findById(userId);
    const facultyName = normalizeFacultyName(user?.facultyName || req.user.facultyName || req.user.name);

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Security Authorization Check: Must be event owner
    if (normalizeFacultyName(event.facultyName) !== facultyName) {
      return res.status(403).json({ message: "Unauthorized: You can only edit your own events." });
    }

    event.reportLink = reportLink ? reportLink.trim() : "";
    await event.save();

    res.status(200).json({
      message: "Report link updated successfully!",
      event
    });
  } catch (error) {
    console.error("updateReportLink Error:", error);
    res.status(500).json({ message: "Failed to update report link", error: error.message });
  }
};

// 7. Upload Photo (College Photo / Event Photo)
export const uploadEventPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { photoType } = req.body; // "collegePhoto" or "eventPhoto"

    const userId = req.user.id;
    const user = await User.findById(userId);
    const facultyName = normalizeFacultyName(user?.facultyName || req.user.facultyName || req.user.name);

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Security Authorization Check: Must be event owner
    if (normalizeFacultyName(event.facultyName) !== facultyName) {
      return res.status(403).json({ message: "Unauthorized: You can only modify photos for your own events." });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No image file uploaded." });
    }

    const uploadedFile = req.files.file || req.files.photo || req.files.collegePhoto || req.files.eventPhoto;
    if (!uploadedFile) {
      return res.status(400).json({ message: "Image payload missing." });
    }

    // Save to backend/uploads/photos/
    const uploadsDir = path.join(process.cwd(), "uploads", "photos");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(uploadedFile.name) || ".png";
    const filename = `${photoType || "eventPhoto"}_${event._id}_${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await uploadedFile.mv(filePath);

    const fileUrl = `http://localhost:3000/uploads/photos/${filename}`;

    if (photoType === "collegePhoto") {
      event.collegePhoto = fileUrl;
    } else {
      event.eventPhoto = fileUrl;
    }

    await event.save();

    res.status(200).json({
      message: "Photo uploaded successfully!",
      fileUrl,
      event
    });

  } catch (error) {
    console.error("uploadEventPhoto Error:", error);
    res.status(500).json({ message: "Failed to upload photo", error: error.message });
  }
};
