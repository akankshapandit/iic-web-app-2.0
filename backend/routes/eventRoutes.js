import express from "express";
import {
  getEvents,
  createEvent,
  bulkUpload,
  updateReminderSettings,
  sendManualReminder,
  getDashboardStats
} from "../controllers/eventController.js";

const router = express.Router();

router.get("/", getEvents);
router.post("/", createEvent);
router.post("/bulk", bulkUpload);
router.put("/:id/settings", updateReminderSettings);
router.post("/:id/manual-reminder", sendManualReminder);
router.get("/dashboard-stats", getDashboardStats);

export default router;
