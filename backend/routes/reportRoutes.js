import express from "express";
import { protect } from "../middleware/authMiddleware.js"; 
import { generateReport, auditPDFFile } from "../controllers/reportController.js";

const router = express.Router();

// Route for generating a new report (Protected)
router.post("/generate", protect, generateReport);

// Route for auditing the final PDF file
router.post("/audit-pdf", auditPDFFile);

export default router;