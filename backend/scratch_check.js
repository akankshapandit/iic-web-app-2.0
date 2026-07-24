import mongoose from "mongoose";

mongoose.connect("mongodb+srv://project_admin:MajorProject2026@cluster0.jzpseqk.mongodb.net/major_project?retryWrites=true&w=majority&appName=Cluster0").then(async () => {
  const Event = mongoose.model("Event", new mongoose.Schema({}, { strict: false }));
  const events = await Event.find({ autoReminder: true });
  console.log("Events with autoReminder: true:", JSON.stringify(events, null, 2));
  process.exit();
}).catch(console.error);
