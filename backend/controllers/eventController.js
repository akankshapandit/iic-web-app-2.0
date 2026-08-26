
import Event from "../models/Event.js";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

/*
============================================================
UPLOAD DIRECTORY
============================================================
*/

const getUploadsDirectory = () => {
  const uploadsDir = path.join(
    process.cwd(),
    "uploads",
    "events"
  );

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, {
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
PDF.JS NODE CANVAS FACTORY

PDF.js needs a canvas factory when rendering PDFs in Node.

We explicitly use node-canvas instead of relying on PDF.js
to discover the canvas package automatically.
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

IMPORTANT:

We render the WHOLE page instead of extracting individual
embedded images.

This avoids problems with unresolved PDF image objects such
as:

Requesting object that isn't resolved yet
Image or Canvas expected

The complete rendered page is then sent to Gemini.
============================================================
*/

const renderPdfPageAsPng = async (
  page,
  uploadsDir,
  pageNumber
) => {
  const canvasFactory =
    new NodeCanvasFactory();

  /*
  Higher resolution helps Gemini read poster text.
  */

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

  /*
  White background.
  */

  context.save();

  context.fillStyle = "#ffffff";

  context.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  context.restore();

  /*
  Render PDF page.
  */

  const renderContext = {
    canvasContext: context,
    viewport,

    /*
    Give PDF.js the same factory so that any
    additional canvases it needs can be created.
    */

    canvasFactory,
  };

  try {
    const renderTask =
      page.render(renderContext);

    await renderTask.promise;

    /*
    Convert rendered page to PNG.
    */

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

    fs.writeFileSync(
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

Returns:

poster
event_photo
other

If Gemini fails, we return "unknown" rather than
incorrectly treating the image as an event photo.

This is VERY important.
============================================================
*/

const classifyImageWithGemini =
  async (filePath) => {
    try {
      const apiKey =
        process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.warn(
          "GEMINI_API_KEY is not configured."
        );

        return {
          classification: "unknown",
          hasFace: false,
          faceCount: 0,
        };
      }

      if (
        !fs.existsSync(filePath)
      ) {
        console.error(
          "Image does not exist:",
          filePath
        );

        return {
          classification: "unknown",
          hasFace: false,
          faceCount: 0,
        };
      }

      const imageBuffer =
        fs.readFileSync(filePath);

      const base64Image =
        imageBuffer.toString("base64");

      const prompt = `
You are analyzing one complete page from a college
event report PDF.

Your job is to determine whether the page is:

1. poster
2. event_photo
3. other

Return ONLY valid JSON.

Required format:

{
  "classification": "poster",
  "hasFace": true,
  "faceCount": 1
}

classification MUST be exactly one of:

"poster"
"event_photo"
"other"

============================================================
POSTER
============================================================

Use "poster" when the page is primarily an event
announcement or promotional design.

Examples:

- Event poster
- Workshop poster
- Seminar poster
- FDP poster
- Conference poster
- Hackathon poster
- Invitation
- Promotional event graphic

A poster can contain photographs of people.

The presence of a face DOES NOT make something an
event_photo.

Ask:

"Was this designed to announce or promote the event?"

If yes:

poster

============================================================
EVENT PHOTO
============================================================

Use "event_photo" when the page/image is an actual
photograph taken during the event.

Examples:

- Students attending an event
- Audience
- Speaker on stage
- Faculty and students
- Workshop activity
- Group photograph
- Certificate distribution
- Award ceremony
- Laboratory activity
- Guest lecture photograph

Ask:

"Does this look like a real photograph taken during
the event?"

If yes:

event_photo

============================================================
OTHER
============================================================

Use "other" for:

- Feedback forms
- Screenshots
- Emails
- WhatsApp screenshots
- Website screenshots
- Tables
- Charts
- Text-only pages
- Attendance sheets
- Certificates
- Logos
- Decorative graphics
- Blank pages
- Irrelevant documents
- Anything that is neither a poster nor an event photo

============================================================
FACE DETECTION
============================================================

hasFace:

true if clearly visible human faces exist.

false if there are no visible human faces.

faceCount:

Approximate number of clearly visible human faces.

Do not count:

- Cartoon faces
- Logos
- Drawings
- Extremely tiny/unrecognizable faces

If a poster contains a photograph of a person's face,
that DOES count as a face.

IMPORTANT:

Face detection does NOT determine classification.

A poster containing faces is still:

"poster"

============================================================
PRIMARY PURPOSE RULE
============================================================

Ask:

"What is the PRIMARY PURPOSE of this page?"

Designed to announce/promote an event:
poster

Actual photograph taken during an event:
event_photo

Everything else:
other

Return ONLY JSON.
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

      /*
      --------------------------------------------------------
      GEMINI HTTP ERROR
      --------------------------------------------------------
      */

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          "Gemini classification failed:",
          errorText
        );

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
        console.error(
          "Gemini returned empty response."
        );

        return {
          classification: "unknown",
          hasFace: false,
          faceCount: 0,
        };
      }

      /*
      --------------------------------------------------------
      REMOVE MARKDOWN CODE FENCES
      --------------------------------------------------------
      */

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

      /*
      --------------------------------------------------------
      PARSE JSON
      --------------------------------------------------------
      */

      let parsed;

      try {
        parsed =
          JSON.parse(result);
      } catch (error) {
        console.error(
          "Could not parse Gemini JSON:",
          result
        );

        return {
          classification: "unknown",
          hasFace: false,
          faceCount: 0,
        };
      }

      /*
      --------------------------------------------------------
      VALIDATE CLASSIFICATION
      --------------------------------------------------------
      */

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

      /*
      --------------------------------------------------------
      FACE INFORMATION
      --------------------------------------------------------
      */

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

      console.log(
        "Gemini result:",
        {
          classification,
          hasFace,
          faceCount,
        }
      );

      return {
        classification,
        hasFace,
        faceCount,
      };
    } catch (error) {
      console.error(
        "Gemini image classification error:",
        error.message
      );

      /*
      NEVER classify an API failure as event_photo.
      */

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
        !fs.existsSync(filePath)
      ) {
        return;
      }

      /*
      --------------------------------------------------------
      HASH IMAGE
      --------------------------------------------------------
      */

      const imageBuffer =
        fs.readFileSync(
          filePath
        );

      const hash =
        getBufferHash(
          imageBuffer
        );

      /*
      --------------------------------------------------------
      DUPLICATE CHECK
      --------------------------------------------------------
      */

      if (
        seenHashes.has(hash)
      ) {
        console.log(
          `Duplicate rendered page skipped: ${pageNumber}`
        );

        try {
          fs.unlinkSync(
            filePath
          );
        } catch {}

        return;
      }

      seenHashes.add(hash);

      console.log(
        "--------------------------------------------------"
      );

      console.log(
        `Classifying rendered PDF page ${pageNumber}`
      );

      console.log(
        `Image: ${filePath}`
      );

      /*
      --------------------------------------------------------
      GEMINI
      --------------------------------------------------------
      */

      const result =
        await classifyImageWithGemini(
          filePath
        );

      console.log(
        `Classification: ${result.classification}`
      );

      console.log(
        `Has face: ${result.hasFace}`
      );

      console.log(
        `Face count: ${result.faceCount}`
      );

      /*
      --------------------------------------------------------
      GEMINI FAILURE
      --------------------------------------------------------
      */

      if (
        result.classification ===
        "unknown"
      ) {
        console.log(
          `Gemini could not classify page ${pageNumber}. Keeping file for debugging.`
        );

        return;
      }

      const filename =
        path.basename(
          filePath
        );

      const url =
        `/uploads/events/${filename}`;

      /*
      --------------------------------------------------------
      POSTER
      --------------------------------------------------------
      */

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

          console.log(
            "POSTER FOUND:",
            url
          );
        } else {
          console.log(
            "Additional poster detected. Ignoring it."
          );
        }

        return;
      }

      /*
      --------------------------------------------------------
      EVENT PHOTO
      --------------------------------------------------------
      */

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

        console.log(
          "EVENT PHOTO FOUND:",
          url
        );

        return;
      }

      /*
      --------------------------------------------------------
      OTHER
      --------------------------------------------------------
      */

      console.log(
        `Page ${pageNumber} classified as OTHER. Ignoring.`
      );

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

NEW PIPELINE:

PDF
 ↓
PDF page
 ↓
Render complete page
 ↓
Hash
 ↓
Gemini
 ↓
poster / event_photo / other
 ↓
Database

We intentionally DO NOT extract PDF internal image
XObjects anymore.
============================================================
*/

const extractImagesFromPDF =
  async (
    pdfPath,
    uploadsDir
  ) => {
    const pdfData =
      new Uint8Array(
        fs.readFileSync(
          pdfPath
        )
      );

    /*
    --------------------------------------------------------
    CANVAS FACTORY
    --------------------------------------------------------
    */

    const canvasFactory =
      new NodeCanvasFactory();

    /*
    --------------------------------------------------------
    LOAD PDF
    --------------------------------------------------------
    */

    const loadingTask =
      pdfjsLib.getDocument({
        data: pdfData,

        /*
        Explicitly tell PDF.js which canvas factory to use.
        */

        canvasFactory,
      });

    const pdf =
      await loadingTask.promise;

    console.log(
      `PDF loaded successfully. Pages: ${pdf.numPages}`
    );

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

    /*
    --------------------------------------------------------
    PROCESS ONE PAGE
    --------------------------------------------------------
    */

    const processPage =
      async (pageNumber) => {
        let page = null;

        try {
          console.log(
            "=================================================="
          );

          console.log(
            `Processing PDF page ${pageNumber}/${pdf.numPages}`
          );

          console.log(
            "=================================================="
          );

          page =
            await pdf.getPage(
              pageNumber
            );

          /*
          --------------------------------------------------
          RENDER COMPLETE PAGE
          --------------------------------------------------
          */

          const rendered =
            await renderPdfPageAsPng(
              page,
              uploadsDir,
              pageNumber
            );

          console.log(
            `Rendered page ${pageNumber}: ${rendered.filePath}`
          );

          /*
          --------------------------------------------------
          CLASSIFY COMPLETE PAGE
          --------------------------------------------------
          */

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

          console.error(
            error.stack
          );
        } finally {
          /*
          PDF.js page cleanup.
          */

          if (page) {
            try {
              page.cleanup();
            } catch {}
          }
        }
      };

    /*
    --------------------------------------------------------
    PROCESS ALL PAGES SEQUENTIALLY
    --------------------------------------------------------

    Sequential processing is intentional.

    Gemini requests are already expensive and sequential
    processing prevents multiple pages from competing for
    resources at the same time.
    --------------------------------------------------------
    */

    for (
      let pageNumber = 1;
      pageNumber <= pdf.numPages;
      pageNumber++
    ) {
      await processPage(
        pageNumber
      );
    }

    /*
    --------------------------------------------------------
    CLEANUP PDF
    --------------------------------------------------------
    */

    try {
      await pdf.cleanup();
    } catch {}

    try {
      await pdf.destroy();
    } catch {}

    console.log(
      "=================================================="
    );

    console.log(
      "PDF EXTRACTION COMPLETE"
    );

    console.log(
      `Event photos found: ${extractedPhotos.length}`
    );

    console.log(
      `Poster found: ${Boolean(posterHolder.url)}`
    );

    console.log(
      "=================================================="
    );

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
UPDATE EVENT
============================================================
*/

export const updateEvent =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

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
        "videoLink",
        "photos",
        "collegePhoto",
        "eventPhoto",
        "source",
      ];

      const updateData = {};

      allowedFields.forEach(
        (field) => {
          if (
            req.body[field] !==
            undefined
          ) {
            updateData[field] =
              req.body[field];
          }
        }
      );

      const event =
        await Event.findByIdAndUpdate(
          id,
          updateData,
          {
            new: true,
            runValidators: true,
          }
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
        .json({
          message:
            "Event updated successfully!",

          event,
        });

    } catch (error) {
      console.error(
        "updateEvent Error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Failed to update event",

          error:
            error.message,
        });
    }
  };

/*
============================================================
UPDATE EVENT MEDIA
============================================================

Accepts:

report
videoLink
posterLink

The PDF is processed automatically.

The backend extracts:

poster
event photos
face information
============================================================
*/

export const updateEventMedia =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      /*
      --------------------------------------------------------
      FIND EVENT
      --------------------------------------------------------
      */

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

      /*
      --------------------------------------------------------
      UPLOAD DIRECTORY
      --------------------------------------------------------
      */

      const uploadsDir =
        getUploadsDirectory();

      /*
      --------------------------------------------------------
      VIDEO LINK
      --------------------------------------------------------
      */

      if (
        req.body.videoLink !==
        undefined
      ) {
        event.videoLink =
          String(
            req.body.videoLink
          ).trim();
      }

      /*
      --------------------------------------------------------
      MANUAL POSTER LINK
      --------------------------------------------------------
      */

      if (
        req.body.posterLink !==
        undefined
      ) {
        event.posterLink =
          String(
            req.body.posterLink
          ).trim();
      }

      /*
      --------------------------------------------------------
      REPORT FILE
      --------------------------------------------------------
      */

      const reportFile =
        req.files?.report;

      if (reportFile) {
        const extension =
          path
            .extname(
              reportFile.name
            )
            .toLowerCase();

        /*
        ------------------------------------------------------
        ONLY PDF
        ------------------------------------------------------
        */

        if (
          extension !==
          ".pdf"
        ) {
          return res
            .status(400)
            .json({
              message:
                "Please upload the event report as a PDF.",
            });
        }

        /*
        ------------------------------------------------------
        CREATE REPORT FILENAME
        ------------------------------------------------------
        */

        const filename =
          createFilename(
            `report_${event._id}`,
            ".pdf"
          );

        const filePath =
          path.join(
            uploadsDir,
            filename
          );

        /*
        ------------------------------------------------------
        SAVE REPORT
        ------------------------------------------------------
        */

        await reportFile.mv(
          filePath
        );

        const baseUrl =
          getServerBaseUrl(
            req
          );

        event.reportLink =
          `${baseUrl}/uploads/events/${filename}`;

        console.log(
          "========================================"
        );

        console.log(
          "EVENT REPORT SAVED"
        );

        console.log(
          event.reportLink
        );

        console.log(
          "========================================"
        );

        /*
        ------------------------------------------------------
        EXTRACT MEDIA
        ------------------------------------------------------
        */

        console.log(
          "Starting PDF image extraction..."
        );

        const extracted =
          await extractImagesFromPDF(
            filePath,
            uploadsDir
          );

        /*
        ------------------------------------------------------
        SAVE POSTER
        ------------------------------------------------------
        */

        if (
          extracted.poster
        ) {
          event.posterLink =
            `${baseUrl}${extracted.poster}`;

          console.log(
            "========================================"
          );

          console.log(
            "POSTER EXTRACTED"
          );

          console.log(
            event.posterLink
          );

          console.log(
            "========================================"
          );

        } else {
          console.log(
            "No poster was detected."
          );
        }

        /*
        ------------------------------------------------------
        SAVE EVENT PHOTOS
        ------------------------------------------------------
        */

        const extractedPhotoUrls =
          extracted.renderedPhotos.map(
            (item) =>
              `${baseUrl}${item.url}`
          );

        if (
          extractedPhotoUrls.length >
          0
        ) {
          event.photos =
            extractedPhotoUrls;

          console.log(
            `Saved ${extractedPhotoUrls.length} event photos.`
          );

          /*
          ----------------------------------------------------
          FACE INFORMATION
          ----------------------------------------------------
          */

          const totalFaces =
            extracted.renderedPhotos.reduce(
              (
                total,
                photo
              ) =>
                total +
                (
                  photo.faceCount ||
                  0
                ),
              0
            );

          console.log(
            `Total detected faces across event photos: ${totalFaces}`
          );

        } else {
          console.log(
            "No event photographs detected."
          );

          event.photos =
            [];
        }

        /*
        ------------------------------------------------------
        MARK SOURCE
        ------------------------------------------------------
        */

        event.source =
          "REPORT";
      }

      /*
      --------------------------------------------------------
      SAVE EVENT
      --------------------------------------------------------
      */

      await event.save();

      /*
      --------------------------------------------------------
      RETURN
      --------------------------------------------------------
      */

      res
        .status(200)
        .json({
          message:
            "Event report uploaded and media extracted successfully!",

          event,
        });

    } catch (error) {
      console.error(
        "updateEventMedia Error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Failed to upload report and extract media",

          error:
            error.message,
        });
    }
  };

/*
============================================================
DELETE EVENT
============================================================
*/

export const deleteEvent =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      const event =
        await Event.findByIdAndDelete(
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
        .json({
          message:
            "Event deleted successfully!",
        });

    } catch (error) {
      console.error(
        "deleteEvent Error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Failed to delete event",

          error:
            error.message,
        });
    }
  };

