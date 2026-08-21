import express from "express";
import {
  getFacultyMembers,
  memberLogin,
  setupPassword,
  getMemberEvents,
  createSelfDrivenEvent,
  updateReportLink,
  uploadEventPhoto
} from "../controllers/memberController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/list", getFacultyMembers);
router.post("/login", memberLogin);
router.post("/setup-password", setupPassword);

// Protected routes (require JWT)
router.get("/events", protect, getMemberEvents);
router.post("/events/self-driven", protect, createSelfDrivenEvent);
router.put("/events/:id/report-link", protect, updateReportLink);
router.post("/events/:id/upload-photo", protect, uploadEventPhoto);

export default router;
