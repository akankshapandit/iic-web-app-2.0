import express from "express";

import {
  getEvents,
  getIICDashboardEvents,
  createEvent,
  bulkUpload,
  updateEvent,
  deleteEvent,
  getDashboardStats,
  celebrationBulkUpload,
  sendManualReminder,
} from "../controllers/eventController.js";

const router =
  express.Router();

// ============================================================
// GET ALL EVENTS
// GET /api/events
// ============================================================

router.get(
  "/",
  getEvents
);

// ============================================================
// IIC DASHBOARD
// GET /api/events/iic-dashboard
// ============================================================

router.get(
  "/iic-dashboard",
  getIICDashboardEvents
);

// ============================================================
// DASHBOARD STATS
// GET /api/events/stats
// ============================================================

router.get(
  "/stats",
  getDashboardStats
);

// ============================================================
// CREATE EVENT
// POST /api/events
// ============================================================

router.post(
  "/",
  createEvent
);

// ============================================================
// BULK UPLOAD
// POST /api/events/bulk-upload
// ============================================================

router.post(
  "/bulk-upload",
  bulkUpload
);

// ============================================================
// CELEBRATION BULK UPLOAD
// POST /api/events/celebration-bulk-upload
// ============================================================

router.post(
  "/celebration-bulk-upload",
  celebrationBulkUpload
);

// ============================================================
// UPDATE EVENT
// PUT /api/events/:id
// ============================================================

router.put(
  "/:id",
  updateEvent
);

// ============================================================
// MANUAL REMINDER
// POST /api/events/:id/reminder
// ============================================================

router.post(
  "/:id/reminder",
  sendManualReminder
);

// ============================================================
// DELETE EVENT
// DELETE /api/events/:id
// ============================================================

router.delete(
  "/:id",
  deleteEvent
);

export default router;