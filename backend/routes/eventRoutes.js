import express from "express";
import multer from "multer";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventMedia,
  deleteEvent,
} from "../controllers/eventController.js";

const router = express.Router();

// Initialize multer memory storage for handling file uploads in routes
const upload = multer({ storage: multer.memoryStorage() });

const uploadFields = upload.fields([
  { name: 'report', maxCount: 1 },
  { name: 'reportFile', maxCount: 1 },
  { name: 'finalPdf', maxCount: 1 },
  { name: 'poster', maxCount: 1 },
  { name: 'photos', maxCount: 10 }
]);

// Safe wrapper around uploadFields to catch empty body / busboy errors
const safeUploadFields = (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) {
      // If busboy fails due to an empty/missing form body, 
      // allow the request to proceed without files instead of crashing
      if (err.message && err.message.includes("Unexpected end of form")) {
        req.files = {};
        return next();
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};
router.put("/:id/media", updateEventMedia);
/*
============================================================
UPDATE EVENT MEDIA
============================================================
*/




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
UPDATE EVENT MEDIA (MUST include uploadFields middleware)
============================================================
*/
router.put("/:id/media", uploadFields, updateEventMedia);

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