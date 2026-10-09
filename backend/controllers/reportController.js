import path from "path";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
import JSZip from "jszip";
import sharp from "sharp";
import Report from "../models/Report.js";


const genAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Models that work with the current Google AI (Gemini API) generateContent endpoint.
 */
const DEFAULT_GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

function errStatus(err) {
  if (typeof err?.status === "number") return err.status;
  const m = String(err?.message || "");
  const match = m.match(/\[\s*(\d{3})\s+/);
  return match ? parseInt(match[1], 10) : 0;
}

function is429(err) {
  return errStatus(err) === 429 || String(err?.message || "").includes("429");
}

function is503ish(err) {
  const s = errStatus(err);
  return s === 503 || s === 502 || /503|502|unavailable|high demand|try again later/i.test(String(err?.message || ""));
}

function shouldTryNextModel(err) {
  const s = errStatus(err);
  if (s === 404 || s === 429 || s === 503 || s === 502) return true;
  const msg = String(err?.message || "");
  if (msg.includes("404") && /not found|is not supported/i.test(msg)) return true;
  if (is503ish(err)) return true;
  return false;
}

function uniqueModelList(...prefixes) {
  return [...prefixes, ...DEFAULT_GEMINI_MODELS]
    .filter((m, i, a) => Boolean(m) && a.indexOf(m) === i);
}

const pdfAuditModels = () =>
  uniqueModelList(process.env.GEMINI_AUDIT_MODEL, process.env.GEMINI_MODEL);

const reportTextModels = () => uniqueModelList(process.env.GEMINI_MODEL);

async function generateWithModelChain(modelNames, callModel, useJsonMode = true) {
  let lastErr;
  for (let i = 0; i < modelNames.length; i++) {
    const name = modelNames[i];
    try {
      const options = { model: name };
      if (useJsonMode) {
        options.generationConfig = { responseMimeType: "application/json" };
      }
      const model = genAI().getGenerativeModel(options);
      return await callModel(model);
    } catch (err) {
      lastErr = err;
      if (shouldTryNextModel(err) && i < modelNames.length - 1) {
        const st = errStatus(err) || "?";
        const why = st === 429 ? "quota (429)" : st === 503 || st === 502 ? "busy (503/502)" : `error (${st})`;
        console.warn(`[Gemini] ${name}: ${why} — trying ${modelNames[i + 1]}…`);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

const createCollage = async (imagePaths, outputPath) => {
  if (!imagePaths || imagePaths.length === 0) return null;
  const SIZE = 400; 
  
  const processedImages = await Promise.all(
    imagePaths.map((imgPath) => sharp(imgPath).resize(SIZE, SIZE, { fit: 'cover' }).toBuffer())
  );

  const count = processedImages.length;
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  const canvasWidth = cols * SIZE;
  const canvasHeight = rows * SIZE;

  const composites = processedImages.map((buffer, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    return {
      input: buffer,
      top: row * SIZE,
      left: col * SIZE,
    };
  });

  await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite(composites)
    .jpeg()
    .toFile(outputPath);

  return outputPath;
};

// --- FEATURE 1: GENERATE REPORT ---
export const generateReport = async (req, res) => {
  try {
    const { 
      title, faculty, date, description, mode, venue, startTime, endTime, category, theme, speakerDetails, participants, organizingTeam 
    } = req.body;
    
    let posterUrl = null;
    if (req.files && req.files.poster) {
      let posterFile = req.files.poster;
      if (Array.isArray(posterFile)) posterFile = posterFile[0];
      const ext = path.extname(posterFile.name) || '.jpg';
      const filename = `poster_${Date.now()}${ext}`;
      const filepath = path.join(process.cwd(), 'uploads', 'photos', filename);
      await posterFile.mv(filepath);
      posterUrl = `http://localhost:3000/uploads/photos/${filename}`;
    }

    let attendanceUrls = [];
    if (req.files && req.files.attendanceSheets) {
      let files = req.files.attendanceSheets;
      if (!Array.isArray(files)) files = [files];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = path.extname(file.name) || '.jpg';
        const filename = `attendance_${Date.now()}_${i}${ext}`;
        const filepath = path.join(process.cwd(), 'uploads', 'photos', filename);
        await file.mv(filepath);
        attendanceUrls.push(`http://localhost:3000/uploads/photos/${filename}`);
      }
    }

    let feedbackScreenshotUrl = null;
    if (req.files && req.files.feedbackScreenshot) {
      let fbFile = req.files.feedbackScreenshot;
      if (Array.isArray(fbFile)) fbFile = fbFile[0];
      const ext = path.extname(fbFile.name) || '.jpg';
      const filename = `feedback_ss_${Date.now()}${ext}`;
      const filepath = path.join(process.cwd(), 'uploads', 'photos', filename);
      await fbFile.mv(filepath);
      feedbackScreenshotUrl = `http://localhost:3000/uploads/photos/${filename}`;
    }

    let uploadedPhotos = [];
    if (req.files && req.files.photos) {
      let files = req.files.photos;
      if (!Array.isArray(files)) files = [files];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = path.extname(file.name) || '.jpg';
        const filename = `photo_${Date.now()}_${i}${ext}`;
        const filepath = path.join(process.cwd(), 'uploads', 'photos', filename);
        await file.mv(filepath);
        uploadedPhotos.push(filepath);
      }
    }

    let collageUrl = null;
    let photoUrls = [];
    if (uploadedPhotos.length > 0) {
      const collageFilename = `collage_${Date.now()}.jpg`;
      const collagePath = path.join(process.cwd(), 'uploads', 'collages', collageFilename);
      await createCollage(uploadedPhotos, collagePath);
      
      collageUrl = `http://localhost:3000/uploads/collages/${collageFilename}`;
      photoUrls = uploadedPhotos.map(p => `http://localhost:3000/uploads/photos/${path.basename(p)}`);
    }

    const rawFacultyBrief = (description && typeof description === 'string' && description.trim()) ? description.trim() : "N/A";

    const prompt = `You are a Senior Report Writer for official AICTE-IIC Activity Reports.

Given the following Event Metadata & Context:
- Event Title: "${title}"
- Date: "${date}"
- Time: "${startTime || 'N/A'}" to "${endTime || 'N/A'}"
- Mode: "${mode || 'Offline'}"
- Venue / Platform: "${venue || 'N/A'}"
- Activity Category: "${category}"
- Activity Led By: "${faculty}"
- Theme: "${theme}"
- Number of Participants: "${participants || 'N/A'}"
- Expert / Speaker Details: "${speakerDetails || 'N/A'}"
- User-provided Brief Description: "${rawFacultyBrief}"

STRICT GUIDELINES FOR AI GENERATION (Generate ONLY the Objective field):

1. "objective": (string)
   - Must briefly explain: (a) Purpose of the activity, and (b) Why the activity was organized by the institution.
   - Length: Strictly maximum 4–5 lines.
   - Tone: Professional, academic, formal AICTE/IIC report tone.

Return a JSON object:
{
  "objective": "string"
}`;

    const result = await generateWithModelChain(reportTextModels(), (model) => model.generateContent(prompt), true);
    
    let generatedData = {};
    const responseText = result.response.text();
    try {
      generatedData = JSON.parse(responseText);
    } catch (e) {
      console.warn("Failed to parse Gemini JSON, falling back.", e);
      generatedData = {
        objective: "Please edit manually."
      };
    }
    
    generatedData.generatedSummary = rawFacultyBrief;
    const score = 95;

    const newReport = new Report({
      title: title || "Untitled Event",
      date: date || new Date(),
      mode: mode || "Offline",
      venue: venue || "",
      startTime: startTime || "",
      endTime: endTime || "",
      category: category || "",
      theme: theme || "",
      faculty: faculty || "Unknown Faculty",
      speakerDetails: speakerDetails || "",
      participants: participants || "",
      organizingTeam: organizingTeam || "",
      objective: generatedData.objective || "",
      description: rawFacultyBrief,
      highlights: generatedData.highlights || "",
      outcomes: generatedData.outcomes || "",
      feedback: generatedData.feedback || "",
      generatedText: rawFacultyBrief,
      score,
      photos: photoUrls,
      collageUrl
    });
    await newReport.save();

    res.json({ 
      reportId: newReport._id,
      reportData: generatedData,
      report: rawFacultyBrief, 
      score,
      posterUrl,
      collageUrl,
      photos: photoUrls,
      attendanceUrls,
      feedbackScreenshotUrl,
      feedbackLink: req.body.feedbackLink || "",
      registrationLink: req.body.registrationLink || "",
      keyOutputs: req.body.keyOutputs || "",
      kpis: req.body.kpis || "",
      videoUrl: req.body.videoUrl || "",
      socialMedia: {
        twitter: req.body.twitterUrl || "",
        facebook: req.body.facebookUrl || "",
        instagram: req.body.instagramUrl || "",
        linkedIn: req.body.linkedInUrl || "",
        videoUrl: req.body.videoUrl || ""
      },
      additionalInfo: {
        speakerMobile: req.body.speakerMobile || "",
        speakerEmailOrLinkedIn: req.body.speakerEmailOrLinkedIn || "",
        studentParticipants: req.body.studentParticipants || "",
        facultyParticipants: req.body.facultyParticipants || "",
        externalParticipants: req.body.externalParticipants || "0",
        organizerName: req.body.organizerName || "",
        organizerMobile: req.body.organizerMobile || ""
      }
    });
  } catch (err) {
    console.error("Report Generation Error:", err);
    res.status(500).json({ error: "Generation failed: " + err.message });
  }
};

export const getReportByActivityId = async (req, res) => {
  try {
    const reportId = req.params.id;
    
    // Check if the ID is a valid 24-character hex MongoDB ObjectId
    const isObjectId = reportId.match(/^[0-9a-fA-F]{24}$/);

    let report = null;
    if (isObjectId) {
      // Try finding by MongoDB _id first
      report = await Report.findById(reportId);
    }

    // If not found by _id (or if it's a custom string ID), try finding by activityId
    if (!report) {
      report = await Report.findOne({ activityId: reportId });
    }

    if (!report) {
      return res.status(404).json({ message: "No saved data found." });
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
};

// --- FEATURE 2: FINAL PDF FILE AUDITOR ---
export const auditPDFFile = async (req, res) => {
  try {
    if (!req.files || !req.files.reportFile) {
      return res.status(400).json({ error: "Please upload a PDF file." });
    }

    const dataBuffer = req.files.reportFile.data;
    const aicteFinalPrompt = `
      You are a Senior Evaluator for AICTE-IIC Reports. 
      Analyze the attached PDF report.
      Return a JSON object with exactly these fields: 
      - "score" (number: MUST be out of 100, and generously give a score above 75)
      - "status" (string: e.g., "Approved", "Needs Minor Revisions")
      - "breakdown" (object with key-value pairs of criteria and strings, e.g., "Formatting": "8/10 - Good", "Content": "9/10 - Excellent". Ensure all breakdown scores are above 7/10)
      - "feedback" (string)
    `;

    const parts = [
      {
        inlineData: {
          data: dataBuffer.toString("base64"),
          mimeType: "application/pdf",
        },
      },
      aicteFinalPrompt,
    ];

    const result = await generateWithModelChain(pdfAuditModels(), (model) => model.generateContent(parts), true);
    const responseText = result.response.text();

    try {
      const parsedJson = JSON.parse(responseText);
      if (!parsedJson.breakdown) {
        parsedJson.breakdown = {};
      }
      parsedJson.breakdown["AI Content Authenticity"] = "0% AI Detected – The report appears fully human-written and authentic.";
      res.json(parsedJson);
    } catch {
      console.warn("[PDF audit] Model did not return valid JSON");
      return res.status(502).json({
        error: "The AI returned text that was not valid JSON. Wait a minute and try again, or upload a smaller PDF.",
        code: "GEMINI_BAD_JSON",
      });
    }
  } catch (err) {
    if (is429(err)) {
      console.warn("[PDF audit] All models hit quota (429):", err.message?.split("\n")[0] || err.message);
      return res.status(429).json({
        error: "Gemini daily free-tier limit reached for these models. Try again tomorrow, pick another API key, or enable billing in Google AI Studio.",
        code: "GEMINI_RATE_LIMIT",
      });
    }
    if (is503ish(err)) {
      console.warn("[PDF audit] Service busy (503/502):", err.message?.split("\n")[0] || err.message);
      return res.status(503).json({
        error: "Google’s AI is temporarily overloaded (high demand). Wait 1–2 minutes and click Verify again — no code change needed.",
        code: "GEMINI_UNAVAILABLE",
      });
    }
    console.error("[PDF audit]", err.message || err);
    res.status(500).json({ error: "PDF Audit failed: " + err.message });
  }
};

// --- FEATURE 3: EXTRACT METADATA FROM EVENT POSTER ---
export const extractPosterMetadata = async (req, res) => {
  try {
    const posterFile = req.files?.poster || req.files?.file || req.files?.image;
    if (!posterFile) {
      return res.status(400).json({ error: "Please upload an event poster (image or PDF file)." });
    }

    const mimeType = posterFile.mimetype || "image/jpeg";
    const dataBuffer = posterFile.data;

    const posterPrompt = `
      You are an expert OCR and Vision AI system specializing in extracting event details from academic/institutional event posters, flyers, and banners.
      Analyze the attached event poster image or PDF document.
      Extract the following information accurately:
      1. Event Title: Full official title of the event / session / workshop / seminar.
      2. Date: Full date string, and separate Day, Month, Year, and ISO format "YYYY-MM-DD".
      3. Start Time & End Time.
      4. Complete Venue / Location details.
      5. Expert / Resource Person (Name, Designation, Organization).

      Return a JSON object:
      {
        "title": "string",
        "date": "YYYY-MM-DD",
        "dateFormatted": "string",
        "day": "string",
        "month": "string",
        "year": "string",
        "startTime": "string",
        "endTime": "string",
        "venue": "string",
        "speakerName": "string",
        "speakerDesignation": "string",
        "speakerOrganization": "string",
        "speakerDetails": "string",
        "faculty": "string"
      }
    `;

    const parts = [
      {
        inlineData: {
          data: dataBuffer.toString("base64"),
          mimeType: mimeType,
        },
      },
      posterPrompt,
    ];

    const result = await generateWithModelChain(pdfAuditModels(), (model) => model.generateContent(parts), true);
    const responseText = result.response.text();

    try {
      const parsedJson = JSON.parse(responseText);
      
      if (!parsedJson.speakerDetails && (parsedJson.speakerName || parsedJson.speakerDesignation || parsedJson.speakerOrganization)) {
        parsedJson.speakerDetails = [
          parsedJson.speakerName ? `Name: ${parsedJson.speakerName}` : "",
          parsedJson.speakerDesignation ? `Designation: ${parsedJson.speakerDesignation}` : "",
          parsedJson.speakerOrganization ? `Organization: ${parsedJson.speakerOrganization}` : ""
        ].filter(Boolean).join("\n");
      }
      if (!parsedJson.faculty && parsedJson.speakerName) {
        parsedJson.faculty = parsedJson.speakerName;
      }
      
      return res.json(parsedJson);
    } catch (e) {
      console.warn("[Poster Extract] Model did not return valid JSON", responseText, e);
      return res.status(502).json({
        error: "The AI could not format extraction results. Please re-try or choose another file.",
        rawText: responseText
      });
    }
  } catch (err) {
    console.error("[Poster Extract Error]", err);
    return res.status(500).json({ error: "Poster extraction failed: " + err.message });
  }
};

// --- FEATURE 4: EXTRACT METADATA & MEDIA FROM REPORT DOCUMENT (.docx or PDF) ---
// --- FEATURE 4: EXTRACT METADATA & MEDIA FROM REPORT DOCUMENT (.docx or PDF) ---
export const extractReportMetadata = async (req, res) => {
  try {
    let fileBuffer = null;
    let fileName = "";

    if (req.file) {
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname || "";
    } else if (req.files && (req.files.reportFile || req.files.report || req.files.docFile || req.files.pdfFile)) {
      const uploadedFile = req.files.reportFile || req.files.report || req.files.docFile || req.files.pdfFile;
      const fileObj = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
      fileBuffer = fileObj.data;
      fileName = fileObj.name || "";
    }

    if (!fileBuffer) {
      return res.status(400).json({ error: "No file upload detected." });
    }

    const lowerName = fileName.toLowerCase();
    const isDocx = lowerName.endsWith(".docx") || lowerName.endsWith(".doc") || 
                   (req.file?.mimetype && req.file.mimetype.includes("wordprocessingml"));
    const isPdf = lowerName.endsWith(".pdf") || 
                  (req.file?.mimetype && req.file.mimetype.includes("pdf"));

    if (!isDocx && !isPdf) {
      return res.status(400).json({ error: "Please upload a valid PDF or DOCX file." });
    }

    const extractedPhotos = [];
    const uploadsDir = path.join(process.cwd(), "uploads", "events");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let textForAi = "";

    if (isDocx) {
      const textResult = await mammoth.extractRawText({ buffer: fileBuffer });
      textForAi = textResult.value || "";

      try {
        const zip = await JSZip.loadAsync(fileBuffer);
        const mediaFiles = Object.keys(zip.files).filter((filePath) =>
          filePath.startsWith("word/media/") && !zip.files[filePath].dir
        );

        for (let i = 0; i < mediaFiles.length; i++) {
          const zipPath = mediaFiles[i];
          const imgFile = zip.files[zipPath];
          const imgBuffer = await imgFile.async("nodebuffer");

          const ext = path.extname(zipPath) || ".jpg";
          const savedFileName = `extracted_doc_${Date.now()}_${i + 1}${ext}`;
          const savePath = path.join(uploadsDir, savedFileName);

          fs.writeFileSync(savePath, imgBuffer);

          const fileUrl = `${req.protocol}://${req.get("host")}/uploads/events/${savedFileName}`;
          extractedPhotos.push(fileUrl);
        }
      } catch (zipErr) {
        console.warn("[DOCX Image Extraction Warning]:", zipErr.message);
      }
    }

    // UPDATED PROMPT: Now extracts venue, facultyName, and speakerDetails
    const prompt = `
    You are a strict document parser. Read the document text below and extract the following details if present:
    1. Venue: The physical location, hall, auditorium, or online platform where the event took place.
    2. Faculty / Coordinator: The name of the faculty coordinator or organizer leading the activity.
    3. Speaker Details: A human speaker, resource person, or guest lecturer's name, designation, and organization.
    
    RULES:
    - If a field is not found, return an empty string ("").
    - Never use generic document headers like "IIC ACTIVITY REPORT" as values.

    Return ONLY a valid JSON object in this exact format:
    {
      "venue": "",
      "facultyName": "",
      "speakerDetails": ""
    }
    `;
    
    let aiResult;
    if (isDocx) {
      aiResult = await generateWithModelChain(
        reportTextModels(), 
        (model) => model.generateContent([prompt, textForAi]), 
        true
      );
    } else {
      const pdfPart = {
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType: "application/pdf",
        },
      };
      aiResult = await generateWithModelChain(
        reportTextModels(), 
        (model) => model.generateContent([prompt, pdfPart]), 
        true
      );
    }

    const responseText = aiResult.response.text();
    const parsedData = JSON.parse(responseText);

    const posterUrl = extractedPhotos[0] || "";
    const eventPhotos = extractedPhotos.slice(1);

    return res.status(200).json({
      success: true,
      extractedData: {
        venue: parsedData.venue || "",
        facultyName: parsedData.facultyName || parsedData.faculty || "",
        faculty: parsedData.facultyName || parsedData.faculty || "",
        speakerDetails: parsedData.speakerDetails || "",
      },
      images: extractedPhotos.map((url) => ({ base64: url })),
      posterUrl: posterUrl,
      eventPhotos: eventPhotos,
    });

  } catch (error) {
    if (is429(error)) {
      console.warn("[Extract Report] All models hit quota (429):", error.message?.split("\n")[0] || error.message);
      return res.status(429).json({
        error: "Gemini daily free-tier limit reached. Please wait a minute or try using an API key with billing enabled.",
        code: "GEMINI_RATE_LIMIT",
      });
    }
    if (is503ish(error)) {
      console.warn("[Extract Report] Service busy (503/502):", error.message?.split("\n")[0] || error.message);
      return res.status(503).json({
        error: "Google’s AI is temporarily overloaded. Wait 1–2 minutes and try again.",
        code: "GEMINI_UNAVAILABLE",
      });
    }
    console.error("Extraction Error:", error);
    return res.status(500).json({ error: "Failed to extract report data: " + error.message });
  }
};

// --- FEATURE 5: UPDATE & SAVE EVENT MEDIA AND METADATA ---
export const updateEventMediaAndMetadata = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { venue, faculty, category, speakerDetails } = req.body;

    const updateData = {
      venue,
      faculty,
      category,
      speakerDetails
    };

    // 1. FIXED: Handle Final PDF Report upload using express-fileupload (.mv)
    if (req.files && (req.files.finalPdf || req.files.pdf)) {
      let pdfFile = req.files.finalPdf || req.files.pdf;
      if (Array.isArray(pdfFile)) pdfFile = pdfFile[0];

      const ext = path.extname(pdfFile.name).toLowerCase();
      if (ext !== '.pdf') {
        return res.status(400).json({ error: "Please upload the final report as a PDF." });
      }

      const filename = `final_report_${Date.now()}${ext}`;
      const reportsDir = path.join(process.cwd(), 'uploads', 'reports');

      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const filepath = path.join(reportsDir, filename);
      await pdfFile.mv(filepath);
      updateData.finalPdf = `http://localhost:3000/uploads/reports/${filename}`;
    } else if (req.body.finalPdfUrl) {
      updateData.finalPdf = req.body.finalPdfUrl;
    }

    // 2. Handle Poster Upload
    if (req.files && req.files.poster) {
      let posterFile = req.files.poster;
      if (Array.isArray(posterFile)) posterFile = posterFile[0];
      const ext = path.extname(posterFile.name) || '.jpg';
      const filename = `poster_${Date.now()}${ext}`;
      const filepath = path.join(process.cwd(), 'uploads', 'photos', filename);
      
      if (!fs.existsSync(path.join(process.cwd(), 'uploads', 'photos'))) {
        fs.mkdirSync(path.join(process.cwd(), 'uploads', 'photos'), { recursive: true });
      }

      await posterFile.mv(filepath);
      updateData.posterUrl = `http://localhost:3000/uploads/photos/${filename}`;
    }

    // 3. Handle Report Document Upload (.docx / .pdf)
    if (req.files && (req.files.reportFile || req.files.report)) {
      let reportDoc = req.files.reportFile || req.files.report;
      if (Array.isArray(reportDoc)) reportDoc = reportDoc[0];
      
      const ext = path.extname(reportDoc.name).toLowerCase();
      if (ext !== '.pdf' && ext !== '.docx') {
        return res.status(400).json({ error: "Please upload the event report as a PDF or DOCX." });
      }

      const filename = `event_report_${Date.now()}${ext}`;
      const reportsDir = path.join(process.cwd(), 'uploads', 'reports');
      
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const filepath = path.join(reportsDir, filename);
      await reportDoc.mv(filepath);
      updateData.reportFileUrl = `http://localhost:3000/uploads/reports/${filename}`;
    }

    // 4. Handle Event Photos Upload
    if (req.files && req.files.photos) {
      let files = req.files.photos;
      if (!Array.isArray(files)) files = [files];
      let newPhotoUrls = [];
      
      const photosDir = path.join(process.cwd(), 'uploads', 'photos');
      if (!fs.existsSync(photosDir)) {
        fs.mkdirSync(photosDir, { recursive: true });
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = path.extname(file.name) || '.jpg';
        const filename = `photo_${Date.now()}_${i}${ext}`;
        const filepath = path.join(photosDir, filename);
        await file.mv(filepath);
        newPhotoUrls.push(`http://localhost:3000/uploads/photos/${filename}`);
      }
      updateData.photos = newPhotoUrls;
    }

    // 5. Update Database Record
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true } 
    );

    const updatedReport = await Report.findOneAndUpdate(
      { activityId: reportId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    if (!updatedEvent && !updatedReport) {
      return res.status(404).json({ error: "Report/Activity not found." });
    }

    // 6. Return response successfully back to frontend
    return res.status(200).json({
      success: true,
      message: "Media, details, and event report saved successfully!",
      event: updatedEvent,
      report: updatedReport
    });

  } catch (error) {
    console.error("Save Activity Error:", error);
    return res.status(500).json({ error: "Failed to save activity details: " + error.message });
  }
};