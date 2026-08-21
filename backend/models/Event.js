import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    department: { type: String, default: "N/A" },
    date: { type: Date, required: true },
    time: { type: String, default: "10:00 AM" },
    venue: { type: String, default: "TBD" },
    facultyName: { type: String, default: "Unknown" },
    facultyEmail: { type: String, default: "" },
    activityType: { type: String, default: "IIC" },
    category: { type: String, default: "Workshop" },
    message: { type: String, default: "" },
    status: { type: String, default: "COMPLETED" },
    level: { type: String, default: "" },
    isCelebration: { type: Boolean, default: false },
    reportLink: { type: String, default: "" },
    collegePhoto: { type: String, default: "" },
    eventPhoto: { type: String, default: "" },
    source: { type: String, enum: ["CSV", "SELF_DRIVEN"], default: "CSV" },
    autoReminder: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
    addedDayReminderSent: { type: Boolean, default: false },
    threeWeekReminderSent: { type: Boolean, default: false },
    lastReminderDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
