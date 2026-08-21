import express from "express";
import {
  getEvents,
  createEvent,
  bulkUpload,
  updateReminderSettings,
  sendManualReminder,
  getDashboardStats,
  deleteEvent,
  celebrationBulkUpload
} from "../controllers/eventController.js";

const router = express.Router();

router.get("/", getEvents);
router.post("/", createEvent);
router.post("/bulk", bulkUpload);
router.post("/celebration-bulk", celebrationBulkUpload);
router.put("/:id/settings", updateReminderSettings);
router.post("/:id/manual-reminder", sendManualReminder);
router.get("/dashboard-stats", getDashboardStats);
router.delete("/:id", deleteEvent);

export default router;
