import Event from "../models/Event.js";
import path from "path";
import fs from 'fs/promises';
import fsSync from 'fs';
import crypto from "crypto";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

/*
============================================================
FIND EVENT SAFELY
============================================================
*/

const findEventSafely = async (id, title, date) => {
  if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
    let event = await Event.findById(id);
    if (event) return event;
  }
  
  if (title) {
    let event = await Event.findOne({ title: { $regex: new RegExp(`^${title.trim()}$`, "i") } });
    if (event) return event;

    event = new Event({
      title: title.trim(),
      date: date ? new Date(date) : new Date(),
      status: "Completed",
      source: "CALENDAR"
    });
    await event.save();
    return event;
  }
  
  return null;
};

/*
============================================================
UPLOADS DIRECTORY
============================================================
*/

const getUploadsDirectory = () => {
  const uploadsDir = path.join(
    process.cwd(),
    "uploads",
    "events"
  );

  if (!fsSync.existsSync(uploadsDir)) {
    fsSync.mkdirSync(uploadsDir, {
      recursive: true,
    });
  }

  return uploadsDir;
};

/*
============================================================
UNIQUE FILENAME
============================================================
*/

const createFilename = (prefix, extension) => {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 8)}${extension}`;
};

/*
============================================================
BUFFER HASH
============================================================
*/

const getBufferHash = (buffer) => {
  return crypto
    .createHash("sha256")
    .update(buffer)
    .digest("hex");
};

/*
============================================================
SERVER BASE URL
============================================================
*/

const getServerBaseUrl = (req) => {
  if (process.env.SERVER_URL) {
    return process.env.SERVER_URL.replace(/\/$/, "");
  }

  const protocol =
    req.headers["x-forwarded-proto"] ||
    req.protocol ||
    "http";

  const host =
    req.get("host") ||
    "localhost:3000";

  return `${protocol}://${host}`;
};

/*
============================================================
HELPER - EXTRACT VIDEO AND SOCIAL MEDIA LINKS FROM PDF
============================================================
*/

const extractLinksFromPDF = async (pdfPath) => {
  const result = {
    videoLinks: [],
    socialMediaLinks: [],
  };

  try {
    const pdfData = new Uint8Array(
      fsSync.readFileSync(pdfPath)
    );

    const pdf = await pdfjsLib
      .getDocument({
        data: pdfData,
      })
      .promise;

    const allLinks = new Set();

    for (
      let pageNumber = 1;
      pageNumber <= pdf.numPages;
      pageNumber++
    ) {
      try {
        const page = await pdf.getPage(
          pageNumber
        );

        const annotations =
          await page.getAnnotations();

        for (const annotation of annotations) {
          if (
            annotation.subtype === "Link" &&
            annotation.url
          ) {
            allLinks.add(
              annotation.url.trim()
            );
          }

          if (
            annotation.action === "URI" &&
            annotation.url
          ) {
            allLinks.add(
              annotation.url.trim()
            );
          }
        }

        const textContent =
          await page.getTextContent();

        const pageText =
          textContent.items
            .map(
              (item) =>
                item.str || ""
            )
            .join(" ");

        const urlRegex =
          /(?:https?:\/\/|www\.)[^\s<>"')]+/gi;

        const textUrls =
          pageText.match(
            urlRegex
          ) || [];

        for (let url of textUrls) {
          url = url
            .trim()
            .replace(
              /[.,;:!?]+$/,
              ""
            );

          if (url.startsWith("www.")) {
            url = `https://${url}`;
          }

          allLinks.add(url);
        }
      } catch (pageError) {
        console.error(
          `Could not extract links from PDF page ${pageNumber}:`,
          pageError.message
        );
      }
    }

    for (const rawUrl of allLinks) {
      try {
        const url = new URL(rawUrl);

        const hostname =
          url.hostname
            .toLowerCase()
            .replace(/^www\./, "");

        const isVideo =
          hostname === "youtube.com" ||
          hostname === "youtu.be" ||
          hostname === "youtube-nocookie.com" ||
          hostname === "vimeo.com" ||
          hostname === "dailymotion.com" ||
          hostname === "drive.google.com";

        if (isVideo) {
          result.videoLinks.push(
            url.href
          );
          continue;
        }

        let platform = null;

        if (
          hostname === "instagram.com"
        ) {
          platform = "Instagram";
        } else if (
          hostname === "facebook.com" ||
          hostname === "fb.com"
        ) {
          platform = "Facebook";
        } else if (
          hostname === "linkedin.com"
        ) {
          platform = "LinkedIn";
        } else if (
          hostname === "twitter.com" ||
          hostname === "x.com"
        ) {
          platform = "X";
        } else if (
          hostname === "tiktok.com"
        ) {
          platform = "TikTok";
        }

        if (platform) {
          result.socialMediaLinks.push({
            platform,
            url: url.href,
          });
        }
      } catch (urlError) {
        console.log(
          "Invalid URL skipped:",
          rawUrl
        );
      }
    }

    result.videoLinks = [
      ...new Set(
        result.videoLinks
      ),
    ];

    const socialMap =
      new Map();

    for (
      const social of
        result.socialMediaLinks
    ) {
      socialMap.set(
        social.url,
        social
      );
    }

    result.socialMediaLinks =
      [...socialMap.values()];

    return result;
  } catch (error) {
    console.error(
      "PDF link extraction failed:",
      error.message
    );

    return result;
  }
};

/*
============================================================
PDF.JS NODE CANVAS FACTORY
============================================================
*/

class NodeCanvasFactory {
  async create(width, height) {
    const { createCanvas } = await import("canvas");

    const canvas = createCanvas(
      Math.ceil(width),
      Math.ceil(height)
    );

    const context = canvas.getContext("2d");

    return {
      canvas,
      context,
    };
  }

  reset(canvasAndContext, width, height) {
    if (!canvasAndContext) {
      return;
    }

    canvasAndContext.canvas.width =
      Math.ceil(width);

    canvasAndContext.canvas.height =
      Math.ceil(height);
  }

  destroy(canvasAndContext) {
    if (!canvasAndContext) {
      return;
    }

    if (canvasAndContext.canvas) {
      canvasAndContext.canvas.width = 0;
      canvasAndContext.canvas.height = 0;
    }

    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

/*
============================================================
RENDER COMPLETE PDF PAGE
============================================================
*/

const renderPdfPageAsPng = async (
  page,
  uploadsDir,
  pageNumber
) => {
  const canvasFactory =
    new NodeCanvasFactory();

  const scale = 2;

  const viewport =
    page.getViewport({
      scale,
    });

  const canvasAndContext =
    await canvasFactory.create(
      viewport.width,
      viewport.height
    );

  const {
    canvas,
    context,
  } = canvasAndContext;

  context.save();
  context.fillStyle = "#ffffff";
  context.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
  context.restore();

  const renderContext = {
    canvasContext: context,
    viewport,
    canvasFactory,
  };

  try {
    const renderTask =
      page.render(renderContext);

    await renderTask.promise;

    const buffer =
      canvas.toBuffer("image/png");

    const filename =
      createFilename(
        `pdf_page_${pageNumber}`,
        ".png"
      );

    const filePath =
      path.join(
        uploadsDir,
        filename
      );

    fsSync.writeFileSync(
      filePath,
      buffer
    );

    return {
      filePath,
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    canvasFactory.destroy(
      canvasAndContext
    );
  }
};

/*
============================================================
GEMINI IMAGE CLASSIFICATION
============================================================
*/

const classifyImageWithGemini =
  async (filePath) => {
    try {
      const apiKey =
        process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return {
          classification: "unknown",
          hasFace: false,
          faceCount: 0,
        };
      }

      if (
        !fsSync.existsSync(filePath)
      ) {
        return {
          classification: "unknown",
          hasFace: false,
          faceCount: 0,
        };
      }

      const imageBuffer =
        fsSync.readFileSync(filePath);

      const base64Image =
        imageBuffer.toString("base64");

      const prompt = `
You are analyzing one complete page from a college event report PDF.
Determine whether the page is:
1. poster
2. event_photo
3. other

Return ONLY valid JSON:
{
  "classification": "poster",
  "hasFace": true,
  "faceCount": 1
}
`;

      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const response =
        await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                  {
                    inline_data: {
                      mime_type:
                        "image/png",
                      data:
                        base64Image,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0,
              responseMimeType:
                "application/json",
            },
          }),
        });

      if (!response.ok) {
        return {
          classification: "unknown",
          hasFace: false,
          faceCount: 0,
        };
      }

      const data =
        await response.json();

      let result =
        data?.candidates?.[0]
          ?.content?.parts?.[0]
          ?.text
          ?.trim();

      if (!result) {
        return {
          classification: "unknown",
          hasFace: false,
          faceCount: 0,
        };
      }

      result = result
        .replace(
          /^```json\s*/i,
          ""
        )
        .replace(
          /^```\s*/i,
          ""
        )
        .replace(
          /\s*```$/i,
          ""
        )
        .trim();

      let parsed;

      try {
        parsed =
          JSON.parse(result);
      } catch (error) {
        return {
          classification: "unknown",
          hasFace: false,
          faceCount: 0,
        };
      }

      let classification =
        String(
          parsed.classification ||
            ""
        )
          .trim()
          .toLowerCase();

      if (
        ![
          "poster",
          "event_photo",
          "other",
        ].includes(
          classification
        )
      ) {
        classification =
          "unknown";
      }

      const hasFace =
        Boolean(
          parsed.hasFace
        );

      let faceCount =
        Number(
          parsed.faceCount
        );

      if (
        !Number.isFinite(
          faceCount
        ) ||
        faceCount < 0
      ) {
        faceCount = 0;
      }

      faceCount =
        Math.round(
          faceCount
        );

      if (!hasFace) {
        faceCount = 0;
      }

      return {
        classification,
        hasFace,
        faceCount,
      };
    } catch (error) {
      return {
        classification: "unknown",
        hasFace: false,
        faceCount: 0,
      };
    }
  };

/*
============================================================
PROCESS AND CLASSIFY RENDERED PAGE
============================================================
*/

const processAndClassifyImage =
  async ({
    filePath,
    pageNumber,
    width,
    height,
    seenHashes,
    extractedPhotos,
    posterHolder,
  }) => {
    try {
      if (
        !filePath ||
        !fsSync.existsSync(filePath)
      ) {
        return;
      }

      const imageBuffer =
        fsSync.readFileSync(
          filePath
        );

      const hash =
        getBufferHash(
          imageBuffer
        );

      if (
        seenHashes.has(hash)
      ) {
        try {
          fsSync.unlinkSync(
            filePath
          );
        } catch {}

        return;
      }

      seenHashes.add(hash);

      const result =
        await classifyImageWithGemini(
          filePath
        );

      if (
        result.classification ===
        "unknown"
      ) {
        return;
      }

      const filename =
        path.basename(
          filePath
        );

      const url =
        `/uploads/events/${filename}`;

      if (
        result.classification ===
        "poster"
      ) {
        if (
          !posterHolder.url
        ) {
          posterHolder.url =
            url;
          posterHolder.filePath =
            filePath;
          posterHolder.width =
            width || 0;
          posterHolder.height =
            height || 0;
        }
        return;
      }

      if (
        result.classification ===
        "event_photo"
      ) {
        extractedPhotos.push({
          page:
            pageNumber,
          url,
          width:
            width || 0,
          height:
            height || 0,
          hasFace:
            result.hasFace,
          faceCount:
            result.faceCount,
        });
        return;
      }
    } catch (error) {
      console.error(
        `Could not process page ${pageNumber}:`,
        error.message
      );
    }
  };

/*
============================================================
EXTRACT MEDIA FROM PDF
============================================================
*/

const extractImagesFromPDF =
  async (
    pdfPath,
    uploadsDir
  ) => {
    const pdfData =
      new Uint8Array(
        fsSync.readFileSync(
          pdfPath
        )
      );

    const canvasFactory =
      new NodeCanvasFactory();

    const loadingTask =
      pdfjsLib.getDocument({
        data: pdfData,
        canvasFactory,
      });

    const pdf =
      await loadingTask.promise;

    const extractedPhotos =
      [];

    const posterHolder = {
      url: "",
      filePath: "",
      width: 0,
      height: 0,
    };

    const seenHashes =
      new Set();

    const processPage =
      async (pageNumber) => {
        let page = null;

        try {
          page =
            await pdf.getPage(
              pageNumber
            );

          const rendered =
            await renderPdfPageAsPng(
              page,
              uploadsDir,
              pageNumber
            );

          await processAndClassifyImage({
            filePath:
              rendered.filePath,
            pageNumber,
            width:
              rendered.width,
            height:
              rendered.height,
            seenHashes,
            extractedPhotos,
            posterHolder,
          });

        } catch (error) {
          console.error(
            `Could not process PDF page ${pageNumber}:`,
            error.message
          );
        } finally {
          if (page) {
            try {
              page.cleanup();
            } catch {}
          }
        }
      };

    for (
      let pageNumber = 1;
      pageNumber <= pdf.numPages;
      pageNumber++
    ) {
      await processPage(
        pageNumber
      );
    }

    try {
      await pdf.cleanup();
    } catch {}

    try {
      await pdf.destroy();
    } catch {}

    return {
      renderedPhotos:
        extractedPhotos,
      poster:
        posterHolder.url,
    };
  };

/*
============================================================
GET ALL EVENTS
============================================================
*/

export const getEvents =
  async (req, res) => {
    try {
      const events =
        await Event.find({})
          .sort({
            date: -1,
          })
          .lean();

      res
        .status(200)
        .json(events);

    } catch (error) {
      console.error(
        "getEvents Error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Failed to fetch events",
          error:
            error.message,
        });
    }
  };

/*
============================================================
GET SINGLE EVENT
============================================================
*/

export const getEventById =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      const event =
        await Event.findById(
          id
        );

      if (!event) {
        return res
          .status(404)
          .json({
            message:
              "Event not found",
          });
      }

      res
        .status(200)
        .json(event);

    } catch (error) {
      console.error(
        "getEventById Error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Failed to fetch event",
          error:
            error.message,
        });
    }
  };

/*
============================================================
CREATE EVENT
============================================================
*/

export const createEvent =
  async (req, res) => {
    try {
      const {
        title,
        department,
        date,
        time,
        venue,
        facultyName,
        facultyEmail,
        activityType,
        category,
        level,
        isCelebration,
        message,
        status,
        reportLink,
        posterLink,
        videoLink,
        photos,
        collegePhoto,
        eventPhoto,
        source,
      } = req.body;

      if (
        !title ||
        !date
      ) {
        return res
          .status(400)
          .json({
            message:
              "Title and date are required.",
          });
      }

      const event =
        new Event({
          title:
            title.trim(),
          department:
            department ||
            "N/A",
          date:
            new Date(date),
          time:
            time ||
            "10:00 AM",
          venue:
            venue ||
            "TBD",
          facultyName:
            facultyName ||
            "Unknown",
          facultyEmail:
            facultyEmail ||
            "",
          activityType:
            activityType ||
            "IIC",
          category:
            category ||
            "Workshop",
          level:
            level ||
            "",
          isCelebration:
            Boolean(
              isCelebration
            ),
          message:
            message || "",
          status:
            status ||
            "UPCOMING",
          reportLink:
            reportLink || "",
          posterLink:
            posterLink || "",
          videoLink:
            videoLink || "",
          photos:
            Array.isArray(
              photos
            )
              ? photos
              : [],
          collegePhoto:
            collegePhoto ||
            "",
          eventPhoto:
            eventPhoto ||
            "",
          source:
            source ||
            "CALENDAR",
        });

      await event.save();

      res
        .status(201)
        .json({
          message:
            "Event created successfully!",
          event,
        });

    } catch (error) {
      console.error(
        "createEvent Error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Failed to create event",
          error:
            error.message,
        });
    }
  };

/*
============================================================
UPDATE EVENT (INCLUDING MEDIA & PHOTOS)
============================================================
*/

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await findEventSafely(id, req.body.title, req.body.date);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const allowedFields = [
      "title",
      "department",
      "date",
      "time",
      "venue",
      "facultyName",
      "facultyEmail",
      "activityType",
      "category",
      "level",
      "isCelebration",
      "message",
      "status",
      "reportLink",
      "posterLink",
      "videoLink"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    const uploadsDir = getUploadsDirectory();
    
    if (req.files && req.files.photos) {
      const photoArray = Array.isArray(req.files.photos) ? req.files.photos : [req.files.photos];
      const savedPhotos = [];

      for (const photo of photoArray) {
        if (typeof photo === "string" && photo.startsWith("http")) {
          savedPhotos.push(photo);
          continue;
        }

        if (photo.name && photo.mv) {
          const filename = createFilename(`photo_${event._id}`, path.extname(photo.name));
          const filePath = path.join(uploadsDir, filename);
          await photo.mv(filePath);

          const baseUrl = getServerBaseUrl(req);
          savedPhotos.push(`${baseUrl}/uploads/events/${filename}`);
        }
      }

      if (savedPhotos.length > 0) {
        event.photos = [...(event.photos || []), ...savedPhotos];
      }
    }

    if (req.body.photos) {
      let parsedPhotos = [];
      try {
        parsedPhotos = typeof req.body.photos === "string" ? JSON.parse(req.body.photos) : req.body.photos;
      } catch {
        parsedPhotos = Array.isArray(req.body.photos) ? req.body.photos : [req.body.photos];
      }
      
      if (Array.isArray(parsedPhotos)) {
        const combined = new Set([...(event.photos || []), ...parsedPhotos]);
        event.photos = Array.from(combined);
      }
    }

    await event.save();

    res.status(200).json({
      message: "Event updated successfully!",
      event,
    });

  } catch (error) {
    console.error("updateEvent Error:", error);
    res.status(500).json({
      message: "Failed to update event",
      error: error.message,
    });
  }
};

/*
============================================================
UPDATE EVENT MEDIA
============================================================
*/

export const updateEventMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await findEventSafely(id, req.body.title, req.body.date);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (req.body.venue !== undefined) {
      event.venue = String(req.body.venue).trim();
    }
    if (req.body.facultyName !== undefined) {
      event.facultyName = String(req.body.facultyName).trim();
    }
    if (req.body.category !== undefined) {
      event.category = String(req.body.category).trim();
    }
    if (req.body.speakerDetails !== undefined) {
      event.speakerDetails = String(req.body.speakerDetails).trim();
    }
    if (req.body.message !== undefined) {
      event.message = String(req.body.message).trim();
    }
    if (req.body.videoLink !== undefined) {
      event.videoLink = String(req.body.videoLink).trim();
    }
    if (req.body.posterLink !== undefined) {
      event.posterLink = String(req.body.posterLink).trim();
    }

    const uploadsDir = getUploadsDirectory();
    const baseUrl = getServerBaseUrl(req);

    const reportFile = req.files?.report;
    const finalPdfFile = req.files?.finalPdf;
    const posterFile = req.files?.poster;
    const photoFiles = req.files?.photos;

    if (reportFile) {
      const extension = path.extname(reportFile.name).toLowerCase();
      if (extension !== ".pdf" && extension !== ".docx") {
        return res.status(400).json({ message: "Please upload the event report as a PDF or DOCX." });
      }

      const filename = createFilename(`report_${event._id}`, extension === ".docx" ? ".docx" : ".pdf");
      const filePath = path.join(uploadsDir, filename);
      await reportFile.mv(filePath);

      event.reportLink = `${baseUrl}/uploads/events/${filename}`;
      event.source = "REPORT";

      if (extension === ".pdf") {
        try {
          const extractedLinks = await extractLinksFromPDF(filePath);
          event.videoLinks = extractedLinks.videoLinks || [];
          event.socialMediaLinks = extractedLinks.socialMediaLinks || [];
        } catch (err) {
          console.log("PDF link extraction failed:", err.message);
        }

        try {
          const extracted = await extractImagesFromPDF(filePath, uploadsDir);
          if (extracted && extracted.poster) {
            event.posterLink = `${baseUrl}${extracted.poster}`;
          }
          const extractedPhotoUrls = extracted && extracted.renderedPhotos
            ? extracted.renderedPhotos.map((item) => `${baseUrl}${item.url}`)
            : [];
          if (extractedPhotoUrls.length > 0) {
            event.photos = extractedPhotoUrls;
          }
        } catch (err) {
          console.log("PDF image extraction failed:", err.message);
        }
      }
    }

    if (finalPdfFile) {
      const filename = createFilename(`final_report_${event._id}`, ".pdf");
      const filePath = path.join(uploadsDir, filename);
      await finalPdfFile.mv(filePath);
      event.reportLink = `${baseUrl}/uploads/events/${filename}`;
    }

    if (posterFile) {
      const extension = path.extname(posterFile.name).toLowerCase();
      const filename = createFilename(`poster_${event._id}`, extension);
      const filePath = path.join(uploadsDir, filename);
      await posterFile.mv(filePath);
      event.posterLink = `${baseUrl}/uploads/events/${filename}`;
    }

    if (photoFiles) {
      const photosArray = Array.isArray(photoFiles) ? photoFiles : [photoFiles];
      const savedPhotoUrls = [];

      for (let i = 0; i < photosArray.length; i++) {
        const photo = photosArray[i];
        const extension = path.extname(photo.name).toLowerCase();
        const filename = createFilename(`event_photo_${event._id}_${i + 1}`, extension);
        const filePath = path.join(uploadsDir, filename);
        await photo.mv(filePath);
        savedPhotoUrls.push(`${baseUrl}/uploads/events/${filename}`);
      }

      event.photos = [...(event.photos || []), ...savedPhotoUrls];
    }

    await event.save();

    res.status(200).json({
      message: "Event metadata and media updated successfully!",
      event,
    });

  } catch (error) {
    console.error("updateEventMedia Error:", error);
    res.status(500).json({
      message: "Failed to update event media and metadata",
      error: error.message,
    });
  }
};

/*
============================================================
DELETE EVENT
============================================================
*/

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.status(200).json({
      message: "Event deleted successfully!",
    });

  } catch (error) {
    console.error("deleteEvent Error:", error);

    res.status(500).json({
      message: "Failed to delete event",
      error: error.message,
    });
  }
}; 