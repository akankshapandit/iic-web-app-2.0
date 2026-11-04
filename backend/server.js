import dotenv from "dotenv";
dotenv.config(); 
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import fileUpload from 'express-fileupload';
import startScheduler from "./utils/scheduler.js";
import { seedCSVData } from "./utils/csvSeeder.js";
import mammoth from "mammoth";
import { GoogleGenAI } from "@google/genai";

connectDB().then(() => {
  seedCSVData();
});

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size limit
}));
// Skip express-fileupload for /api/reports so multer can handle Word document text and image extraction
app.use((req, res, next) => {
  if (req.path.startsWith("/api/reports")) {
    return next();
  }
  return fileUpload()(req, res, next);
});



// Initialize Google Gen AI client safely with the API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Combined Word Document Handler (Extracts text using Gemini & images using Mammoth)
app.post("/api/reports/extract-doc-media", async (req, res) => {
  try {
    // Use express-fileupload syntax for req.files instead of multer's req.file
    const docFile = req.files?.docFile || req.files?.report;

    if (!docFile || !docFile.data) {
      return res.status(400).json({ error: "No document file uploaded." });
    }

    const fileBuffer = docFile.data;
    const extractedImages = [];

    // 1. Extract embedded media/images correctly using Mammoth base64 reader
    await mammoth.convertToHtml(
      { buffer: fileBuffer },
      {
        convertImage: mammoth.images.inline((element) => {
          return element.read("base64").then((imageBuffer) => {
            const src = `data:${element.contentType};base64,${imageBuffer}`;
            extractedImages.push({
              contentType: element.contentType,
              base64: src,
            });
            return { src };
          });
        }),
      }
    );

    // 2. Extract raw text from Word document buffer
    const textResult = await mammoth.extractRawText({ buffer: fileBuffer });
    const rawText = textResult.value || "";

    // 3. Intelligent Field Extraction using Gemini AI
    let extractedFields = {
      title: "",
      venue: "",
      coordinator: "",
      category: "Workshop",
      speakerDetails: rawText.substring(0, 300),
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following event report document text and extract the event metadata. Return ONLY a valid JSON object with these exact keys: "title", "venue", "coordinator", "category", "speakerDetails". If a field cannot be found, leave its value as an empty string.

Document Text:
${rawText.substring(0, 4000)}`,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        extractedFields = {
          title: parsed.title || "",
          venue: parsed.venue || "",
          coordinator: parsed.coordinator || "",
          category: parsed.category || "Workshop",
          speakerDetails: parsed.speakerDetails || rawText.substring(0, 300),
        };
      }
    } catch (aiError) {
      console.warn("Gemini AI extraction skipped due to high demand (503). Proceeding with manual save.");
    }

    // 4. Automatically flag the poster from extracted images
    let posterFlagged = false;
    const processedImagesForClient = extractedImages.map((img) => {
      let isPoster = false;
      if (!posterFlagged && extractedImages.indexOf(img) === 0) {
        isPoster = true;
        posterFlagged = true;
      }

      return {
        base64: img.base64,
        isPoster: isPoster,
      };
    });

    // 5. Send consolidated response back to frontend
    return res.json({
      success: true,
      extractedData: extractedFields,
      imageCount: extractedImages.length,
      images: processedImagesForClient,
    });

  } catch (error) {
    console.error("Docx Extraction Error:", error);
    res.status(500).json({ error: "Failed to process Word document." });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/members", memberRoutes);

app.get("/", (req, res) => {
  res.send("🚀 API is active");
});

// Initialize Background Job
startScheduler();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Gemini Key Status:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
});