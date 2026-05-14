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

// --- FEATURE 1: GENERATE REPORT ---
export const generateReport = async (req, res) => {
  try {
    const { title, faculty, date, description } = req.body;
    const prompt = `Generate a professional IIC Activity Report for: ${title}. Context: ${description}`;
    const result = await generateWithModelChain(reportTextModels(), (model) => model.generateContent(prompt));
    res.json({ report: result.response.text(), score: 95 });
  } catch (err) {
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
      res.json(JSON.parse(cleanJson));
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
