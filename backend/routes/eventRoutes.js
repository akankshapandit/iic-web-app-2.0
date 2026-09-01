import express from "express";

import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventMedia,
  deleteEvent,
} from "../controllers/eventController.js";

const router =
  express.Router();

/*
============================================================
GET ALL EVENTS
============================================================

Used by:

- Department Calendar
- President Dashboard
- Vice President Dashboard
- Member Dashboard admin view

Returns complete Event documents including:

reportLink
posterLink
videoLink
photos
collegePhoto
eventPhoto
*/

router.get(
  "/",
  getEvents
);

/*
============================================================
GET ONE EVENT
============================================================
*/

router.get(
  "/:id",
  getEventById
);

/*
============================================================
CREATE EVENT
============================================================
*/

router.post(
  "/",
  createEvent
);

/*
============================================================
UPDATE EVENT
============================================================

Example:

PUT /api/events/:id

Body:

{
  "status": "COMPLETED"
}
*/

router.put(
  "/:id",
  updateEvent
);

/*
============================================================
UPDATE EVENT MEDIA
============================================================

This MUST come before any generic route
that could potentially consume /:id.

Endpoint:

PUT /api/events/:id/media

FormData:

report
poster
photos
posterLink
videoLink
*/

router.put(
  "/:id/media",
  updateEventMedia
);

/*
============================================================
DELETE EVENT
============================================================
*/

router.delete(
  "/:id",
  deleteEvent
);

export default router;