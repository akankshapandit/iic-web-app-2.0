import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    // ============================================================
    // BASIC EVENT INFORMATION
    // ============================================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      default: "N/A",
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      default: "10:00 AM",
    },

    venue: {
      type: String,
      default: "TBD",
    },

    // ============================================================
    // COORDINATOR INFORMATION
    // ============================================================

    facultyName: {
      type: String,
      default: "Unknown",
      trim: true,
    },

    facultyEmail: {
      type: String,
      default: "",
      trim: true,
    },

    // ============================================================
    // EVENT CLASSIFICATION
    // ============================================================

    activityType: {
      type: String,
      enum: ["IIC", "CELEBRATION", "SELF_DRIVEN", "MIC"],
      default: "IIC",
    },

    category: {
      type: String,
      default: "Workshop",
      trim: true,
    },

    // ============================================================
    // MIC LEVEL
    // ============================================================

    level: {
      type: String,
      enum: ["", "BASIC", "ADVANCED", "RESKILLING", "UPSKILLING"],
      default: "",
    },

    isCelebration: {
      type: Boolean,
      default: false,
    },

    // ============================================================
    // EVENT DESCRIPTION
    // ============================================================

    message: {
      type: String,
      default: "",
    },

    speakerDetails: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "COMPLETED",
    },

    // ============================================================
    // REPORT / MEDIA & EXTRACTION PIPELINE
    // ============================================================

    reportLink: {
      type: String,
      default: "",
    },

    // Automatically extracted poster
    posterLink: {
      type: String,
      default: "",
    },

    // Existing single video link (kept for backward compatibility)
    videoLink: {
      type: String,
      default: "",
    },

    // Automatically extracted video links
    videoLinks: {
      type: [String],
      default: [],
    },

    // Automatically extracted social-media links
    socialMediaLinks: {
      type: [
        {
          platform: {
            type: String,
            trim: true,
          },
          url: {
            type: String,
            trim: true,
          },
        },
      ],
      default: [],
    },

    // Extraction processing status
    extractionStatus: {
      type: String,
      enum: ["NOT_STARTED", "PROCESSING", "COMPLETED", "FAILED"],
      default: "NOT_STARTED",
    },

    extractionError: {
      type: String,
      default: "",
    },

    extractedAt: {
      type: Date,
      default: null,
    },

    // ============================================================
    // EVENT PHOTOS
    // ============================================================

    photos: {
      type: [String],
      default: [],
    },

    // ============================================================
    // OLD PHOTO FIELDS
    // ============================================================

    collegePhoto: {
      type: String,
      default: "",
    },

    eventPhoto: {
      type: String,
      default: "",
    },

    // ============================================================
    // SOURCE
    // ============================================================

    source: {
      type: String,
      enum: ["CSV", "SELF_DRIVEN", "CALENDAR", "REPORT"],
      default: "CSV",
    },

    // ============================================================
    // REMINDERS
    // ============================================================

    autoReminder: {
      type: Boolean,
      default: false,
    },

    reminderSent: {
      type: Boolean,
      default: false,
    },

    addedDayReminderSent: {
      type: Boolean,
      default: false,
    },

    threeWeekReminderSent: {
      type: Boolean,
      default: false,
    },

    lastReminderDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ================================================================
// NORMALIZE ARRAY FIELDS BEFORE VALIDATION
// ================================================================

eventSchema.pre("validate", function () {
  // --------------------------------------------------------------
  // NORMALIZE PHOTOS
  // --------------------------------------------------------------

  if (typeof this.photos === "string") {
    this.photos = this.photos.trim() ? [this.photos.trim()] : [];
  } else if (Array.isArray(this.photos)) {
    this.photos = this.photos.filter(
      (p) => typeof p === "string" && p.trim() !== ""
    );
  } else {
    this.photos = [];
  }

  // --------------------------------------------------------------
  // NORMALIZE VIDEO LINKS
  // --------------------------------------------------------------

  if (typeof this.videoLinks === "string") {
    this.videoLinks = this.videoLinks.trim()
      ? [this.videoLinks.trim()]
      : [];
  } else if (Array.isArray(this.videoLinks)) {
    this.videoLinks = this.videoLinks.filter(
      (v) => typeof v === "string" && v.trim() !== ""
    );
  } else {
    this.videoLinks = [];
  }

  // --------------------------------------------------------------
  // SYNC OLD videoLink WITH videoLinks
  // --------------------------------------------------------------

  if (this.videoLink && !this.videoLinks.includes(this.videoLink)) {
    this.videoLinks.unshift(this.videoLink);
  }
});

export default mongoose.model("Event", eventSchema);