import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    mode: { type: String, default: "Offline" },
    venue: { type: String, default: "" },
    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" },
    category: { type: String, default: "" },
    theme: { type: String, default: "" },
    faculty: { type: String, required: true },
    speakerDetails: { type: String, default: "" },
    participants: { type: String, default: "" },
    organizingTeam: { type: String, default: "" },
    
    // AI Generated / Editable Fields
    objective: { type: String, default: "" },
    description: { type: String, required: true }, // The original context provided by user
    highlights: { type: String, default: "" },
    outcomes: { type: String, default: "" },
    feedback: { type: String, default: "" },
    activityId: { type: String, required: true, unique: true },
    generatedText: { type: String, required: true },
    score: { type: Number, required: true },
    photos: [{ type: String }],
    collageUrl: { type: String },

    // Files section properly nested inside the main schema object
    files: {
      reportPath: String,
      posterPath: String,
      finalPdfPath: String,
      photoPaths: [String],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);