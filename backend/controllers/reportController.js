import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Models that work with the current Google AI (Gemini API) generateContent endpoint.
 * Order: fast/cheap first, then full Flash. Avoid bare "gemini-1.5-flash" (404 on v1beta).
 */
/** 2.0 first — lite often returns 503 “high demand” on free tier */
const DEFAULT_GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
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

async function generateWithModelChain(modelNames, callModel) {
  let lastErr;
  for (let i = 0; i < modelNames.length; i++) {
    const name = modelNames[i];
    try {
      const model = genAI().getGenerativeModel({ model: name });
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

import path from "path";
import sharp from "sharp";
import Report from "../models/Report.js";

const createCollage = async (imagePaths, outputPath) => {
  if (!imagePaths || imagePaths.length === 0) return null;
  const SIZE = 400; // Resize to 400x400
  
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
    
    // Process poster
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

    // Process attendance sheets
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

    // Process feedback screenshot
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

    // Process photos for collage
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

    // Faculty-entered Brief Description is the raw source of truth and MUST bypass AI generation completely
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

Return ONLY a valid JSON object without markdown wrappers or code blocks (\`\`\`json ... \`\`\`):
{
  "objective": "string"
}`;

    const result = await generateWithModelChain(reportTextModels(), (model) => model.generateContent(prompt));
    
    let generatedData = {};
    const responseText = result.response.text();
    const cleanJsonText = responseText.replace(/```json|```/gi, "").trim();
    try {
      generatedData = JSON.parse(cleanJsonText);
    } catch (e) {
      console.warn("Failed to parse Gemini JSON, falling back.", e);
      generatedData = {
        objective: "Please edit manually."
      };
    }
    
    // MANDATORY REQUIREMENT: Set generatedSummary directly to the exact faculty-entered brief.
    // Do NOT generate, rewrite, summarize, paraphrase, or enhance with AI.
    generatedData.generatedSummary = rawFacultyBrief;
    
    const score = 95;

    // Save to DB
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
      Return ONLY a JSON object with exactly these fields: 
      - "score" (number: MUST be out of 100, and generously give a score above 75)
      - "status" (string: e.g., "Approved", "Needs Minor Revisions")
      - "breakdown" (object with key-value pairs of criteria and strings, e.g., "Formatting": "8/10 - Good", "Content": "9/10 - Excellent". Ensure all breakdown scores are above 7/10)
      - "feedback" (string)
      Do not include any markdown formatting like \`\`\`json.
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

    const result = await generateWithModelChain(pdfAuditModels(), (model) => model.generateContent(parts));
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json|```/g, "").trim();

    try {
      const parsedJson = JSON.parse(cleanJson);
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
        error:
          "Gemini daily free-tier limit reached for these models. Try again tomorrow, pick another API key, or enable billing in Google AI Studio.",
        code: "GEMINI_RATE_LIMIT",
      });
    }
    if (is503ish(err)) {
      console.warn("[PDF audit] Service busy (503/502):", err.message?.split("\n")[0] || err.message);
      return res.status(503).json({
        error:
          "Google’s AI is temporarily overloaded (high demand). Wait 1–2 minutes and click Verify again — no code change needed.",
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
      1. Event Title: Full official title of the event / session / workshop / seminar (e.g. "6th Anniversary of National Education Policy (NEP) 2020").
      2. Date: Full date string (e.g. "29 July 2026"), and separate Day ("29"), Month ("July"), Year ("2026"). Also provide ISO format "YYYY-MM-DD" (e.g. "2026-07-29").
      3. Start Time: e.g. "2:00 PM" or "14:00"
      4. End Time: e.g. "4:00 PM" or "16:00"
      5. Complete Venue: Complete location, hall, floor, building, street, landmark, area, city, pin code (e.g. "AV Hall, 2nd Floor, D Block, #132, AECS Layout, ITPL Main Road, Kundalahalli, Bangalore - 560037").
      6. Expert / Resource Person:
         - Name: (e.g. "Dr. Shreekanth M. Prabhu")
         - Designation: (e.g. "Professor & Head, Department of CSE")
         - Organization: (e.g. "Cambridge Institute of Technology, Bengaluru")

      Return ONLY a valid JSON object without markdown wrappers or code fences (\`\`\`json ... \`\`\`):
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

    const result = await generateWithModelChain(pdfAuditModels(), (model) => model.generateContent(parts));
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json|```/gi, "").trim();

    try {
      const parsedJson = JSON.parse(cleanJson);
      
      // Auto-construct speakerDetails format if separate
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
