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
    category: { type: String, default: "Workshop" },
    message: { type: String, default: "" },
    status: { type: String, default: "Planned" },
    autoReminder: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
    lastReminderDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
