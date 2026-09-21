import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js"; 
import { 
  generateReport, 
  auditPDFFile, 
  extractPosterMetadata, 
  extractReportMetadata,
  updateEventMediaAndMetadata
} from "../controllers/reportController.js";

const router = express.Router();

// Memory storage for parsing files in memory without saving to disk
const upload = multer({ storage: multer.memoryStorage() });
router.put("/events/:id/media", updateEventMediaAndMetadata);
// Route for extracting metadata from uploaded event poster (image / PDF)
router.post("/extract-poster", extractPosterMetadata);

// Route for extracting metadata directly from uploaded report PDF
router.post(
  "/extract-report-metadata", 
  upload.single("reportFile"), 
  extractReportMetadata
);

// Route for generating a new report (Protected)
router.post("/generate", protect, generateReport);

// Route for auditing the final PDF file
router.post("/audit-pdf", auditPDFFile);

export default router;