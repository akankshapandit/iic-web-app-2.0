import express from "express";

import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventMedia,
  deleteEvent,
} from "../controllers/eventController.js";

const router = express.Router();

/*
============================================================
GET ALL EVENTS
============================================================
*/
router.get("/", getEvents);

/*
============================================================
GET ONE EVENT
============================================================
*/
router.get("/:id", getEventById);

/*
============================================================
CREATE EVENT
============================================================
*/
router.post("/", createEvent);

/*
============================================================
UPDATE EVENT MEDIA (MUST come before generic /:id route)
============================================================
*/
router.put("/:id/media", updateEventMedia);

/*
============================================================
UPDATE EVENT (Generic /:id)
============================================================
*/
router.put("/:id", updateEvent);

/*
============================================================
DELETE EVENT
============================================================
*/
router.delete("/:id", deleteEvent);

export default router;