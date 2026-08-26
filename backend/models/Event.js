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
      enum: [
        "IIC",
        "CELEBRATION",
        "SELF_DRIVEN",
        "MIC",
      ],
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
      enum: [
        "",
        "BASIC",
        "ADVANCED",
        "RESKILLING",
        "UPSKILLING",
      ],
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

    status: {
      type: String,
      default: "COMPLETED",
    },

    // ============================================================
    // REPORT / MEDIA
    // ============================================================

    reportLink: {
      type: String,
      default: "",
    },

    posterLink: {
      type: String,
      default: "",
    },

    videoLink: {
      type: String,
      default: "",
    },

    photos: [
      {
        type: String,
      },
    ],

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
      enum: [
        "CSV",
        "SELF_DRIVEN",
        "CALENDAR",
        "REPORT",
      ],
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

export default mongoose.model("Event", eventSchema);