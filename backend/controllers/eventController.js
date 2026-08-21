import Event from "../models/Event.js";
import nodemailer from "nodemailer";

// Helper function to obtain Nodemailer Gmail transporter
const getTransporter = async () => {
  const emailUser = (process.env.EMAIL_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "").trim();

  if (!emailUser || !emailPass) {
    const configError = new Error("Missing EMAIL_USER or EMAIL_PASS in backend/.env file. Please add your Gmail address and 16-character App Password to backend/.env.");
    configError.code = "CONFIG_MISSING";
    throw configError;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  return {
    transporter,
    fromEmail: emailUser,
    isTest: false,
  };
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("getEvents Error:", error);
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      department,
      date,
      time,
      venue,
      facultyName,
      facultyEmail,
      category,
      message,
      autoReminder,
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: "Title and Date are required fields." });
    }

    const newEvent = new Event({
      title,
      department: department || "N/A",
      date: new Date(date),
      time: time || "10:00 AM",
      venue: venue || "TBD",
      facultyName: facultyName || "Unknown",
      facultyEmail: facultyEmail || "",
      category: category || "Workshop",
      message: message || "",
      autoReminder: !!autoReminder,
    });

    await newEvent.save();

    // Trigger initial notification on the day event is added to calendar if faculty email is assigned
    if (newEvent.facultyEmail && typeof newEvent.facultyEmail === "string" && newEvent.facultyEmail.trim()) {
      try {
        const mailClient = await getTransporter();
        const { transporter, fromEmail } = mailClient;
        const eventDateStr = new Date(newEvent.date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const eventTimeStr = newEvent.time || "10:00 AM";
        const customMessage = newEvent.message && newEvent.message.trim()
          ? newEvent.message.trim()
          : "You have been assigned as the coordinating faculty for this event added to the calendar.";

        const mailOptions = {
          from: `"CMRIT IIC Admin" <${fromEmail}>`,
          to: newEvent.facultyEmail.trim(),
          subject: `New Calendar Event Assigned: ${newEvent.title} - ${eventDateStr}`,
          text: `Dear ${newEvent.facultyName || "Faculty Member"},\n\nThis is an official notification to inform you that you have been assigned to an event added to the calendar:\n\nEvent Name: ${newEvent.title}\nCategory: ${newEvent.category || "Workshop"}\nDate: ${eventDateStr}\nTime: ${eventTimeStr}\n\nNote / Description:\n${customMessage}\n\nPlease ensure all preparations are complete.\n\nBest regards,\nCMRIT IIC Admin Team`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f9; color: #333333;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f9; padding: 20px 0;">
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
                      <tr>
                        <td style="background-color: #1e3a8a; padding: 25px 30px; text-align: left;">
                          <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0;">CMRIT Institution's Innovation Council</h1>
                          <p style="color: #93c5fd; font-size: 13px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 600;">Faculty Event Assignment Notification</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 30px 30px 15px 30px;">
                          <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 10px 0;">Dear ${newEvent.facultyName || "Faculty Member"},</p>
                          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
                            This is an official notification to inform you that you have been assigned to an event added to the CMRIT calendar today.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 30px 20px 30px;">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 15px;">
                            <tr>
                              <td style="padding: 8px 12px; font-size: 13px; font-weight: 700; color: #475569; width: 30%;">Event Title:</td>
                              <td style="padding: 8px 12px; font-size: 14px; font-weight: 700; color: #0f172a;">${newEvent.title}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 12px; font-size: 13px; font-weight: 700; color: #475569; border-top: 1px solid #e2e8f0;">Date:</td>
                              <td style="padding: 8px 12px; font-size: 14px; font-weight: 600; color: #2563eb; border-top: 1px solid #e2e8f0;">📅 ${eventDateStr}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 12px; font-size: 13px; font-weight: 700; color: #475569; border-top: 1px solid #e2e8f0;">Time:</td>
                              <td style="padding: 8px 12px; font-size: 14px; font-weight: 600; color: #d97706; border-top: 1px solid #e2e8f0;">⏰ ${eventTimeStr}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 12px; font-size: 13px; font-weight: 700; color: #475569; border-top: 1px solid #e2e8f0;">Category:</td>
                              <td style="padding: 8px 12px; font-size: 14px; color: #334155; border-top: 1px solid #e2e8f0;">🏷️ ${newEvent.category || "Workshop"}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 30px 25px 30px;">
                          <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; border-radius: 4px;">
                            <h4 style="margin: 0 0 6px 0; font-size: 13px; text-transform: uppercase; color: #1e40af; font-weight: 700;">Personalized Event Note:</h4>
                            <p style="margin: 0; font-size: 14px; color: #1e3a8a; line-height: 1.5; font-style: italic;">
                              "${customMessage}"
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px 30px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
                          <p style="margin: 0 0 4px 0; font-weight: 600;">CMR Institute of Technology - IIC Admin Office</p>
                          <p style="margin: 0;">This is an automated operational notification.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        };

        await transporter.sendMail(mailOptions);
        newEvent.addedDayReminderSent = true;
        newEvent.lastReminderDate = new Date();
        await newEvent.save();
        console.log(`[Event Creation] Initial email sent to ${newEvent.facultyEmail} for event "${newEvent.title}"`);
      } catch (emailErr) {
        console.error("[Event Creation] Failed to send creation email:", emailErr.message);
      }
    }

    res.status(201).json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    console.error("createEvent Error:", error);
    res.status(500).json({ message: "Failed to create event", error: error.message });
  }
};

export const bulkUpload = async (req, res) => {
  try {
    const events = req.body;
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ message: "Invalid event data" });
    }
    for (const evt of events) {
      await Event.updateOne(
        { title: evt.title, date: evt.date },
        { $set: evt },
        { upsert: true }
      );
    }
    res.status(201).json({ message: "Events uploaded successfully" });
  } catch (error) {
    console.error("bulkUpload Error:", error);
    res.status(500).json({ message: "Failed to upload events", error: error.message });
  }
};

export const updateReminderSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { autoReminder, facultyEmail, time, message, category, venue, department, facultyName } = req.body;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (autoReminder !== undefined) event.autoReminder = autoReminder;
    if (facultyEmail !== undefined) event.facultyEmail = facultyEmail;
    if (time !== undefined) event.time = time;
    if (message !== undefined) event.message = message;
    if (category !== undefined) event.category = category;
    if (venue !== undefined) event.venue = venue;
    if (department !== undefined) event.department = department;
    if (facultyName !== undefined) event.facultyName = facultyName;
    
    if (autoReminder) {
      event.reminderSent = false;
    }
    
    await event.save();
    res.status(200).json({ message: "Settings updated successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Failed to update settings", error: error.message });
  }
};

export const sendManualReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { facultyEmail, time, message } = req.body;
    
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    
    if (facultyEmail) event.facultyEmail = facultyEmail;
    if (time) event.time = time;
    if (message !== undefined) event.message = message;
    
    // 1. Input Data & Email Format Validation
    if (!event.facultyEmail || typeof event.facultyEmail !== 'string' || !event.facultyEmail.trim()) {
      return res.status(400).json({ message: "Faculty email address is required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(event.facultyEmail.trim())) {
      return res.status(400).json({ 
        message: `Invalid email format: "${event.facultyEmail}". Please provide a valid recipient email address.` 
      });
    }

    // 2. Transporter Initialization
    let mailClient;
    try {
      mailClient = await getTransporter();
    } catch (transporterErr) {
      console.error("[Email Dispatch Error] Transporter Initialization:", transporterErr);
      return res.status(400).json({
        message: "Email Service Unconfigured: Missing EMAIL_USER or EMAIL_PASS in backend/.env file."
      });
    }

    const { transporter, fromEmail, isTest } = mailClient;

    const eventDateStr = new Date(event.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const eventTimeStr = event.time || "10:00 AM";
    const customMessage = event.message && event.message.trim()
      ? event.message.trim()
      : "You are assigned as the coordinating faculty for this upcoming event. Please review all schedule details and prepare the necessary arrangements.";

    // 3. Email Template & Anti-Spam Headers Construction
    const mailOptions = {
      from: `"CMRIT IIC Admin" <${fromEmail}>`,
      replyTo: fromEmail,
      to: event.facultyEmail.trim(),
      subject: `Reminder: ${event.title} - ${eventDateStr} at ${eventTimeStr}`,
      // Plain text fallback (critical for passing Gmail spam & promotions filters)
      text: `Dear ${event.facultyName || "Faculty Member"},\n\nThis is an official reminder regarding your assigned event:\n\nEvent Name: ${event.title}\nCategory: ${event.category || "Workshop"}\nDate: ${eventDateStr}\nTime: ${eventTimeStr}\n\nNote / Description:\n${customMessage}\n\nPlease ensure all preparations are complete.\n\nBest regards,\nCMRIT IIC Admin Team`,
      // Clean, professional HTML layout matching standard Inbox design guidelines
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f9; color: #333333;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f9; padding: 20px 0;">
            <tr>
              <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
                  
                  <!-- Header Banner -->
                  <tr>
                    <td style="background-color: #1e3a8a; padding: 25px 30px; text-align: left;">
                      <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 0.5px;">CMRIT Institution's Innovation Council</h1>
                      <p style="color: #93c5fd; font-size: 13px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 600;">Official Faculty Event Reminder</p>
                    </td>
                  </tr>

                  <!-- Greeting & Introductory Text -->
                  <tr>
                    <td style="padding: 30px 30px 15px 30px;">
                      <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 10px 0;">Dear ${event.facultyName || "Faculty Member"},</p>
                      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
                        This is an official notification to remind you of your scheduled faculty event responsibility at CMR Institute of Technology.
                      </p>
                    </td>
                  </tr>

                  <!-- Detailed Event Card Table -->
                  <tr>
                    <td style="padding: 0 30px 20px 30px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 15px;">
                        <tr>
                          <td style="padding: 8px 12px; font-size: 13px; font-weight: 700; color: #475569; width: 30%;">Event Title:</td>
                          <td style="padding: 8px 12px; font-size: 14px; font-weight: 700; color: #0f172a;">${event.title}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 12px; font-size: 13px; font-weight: 700; color: #475569; border-top: 1px solid #e2e8f0;">Date:</td>
                          <td style="padding: 8px 12px; font-size: 14px; font-weight: 600; color: #2563eb; border-top: 1px solid #e2e8f0;">📅 ${eventDateStr}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 12px; font-size: 13px; font-weight: 700; color: #475569; border-top: 1px solid #e2e8f0;">Time:</td>
                          <td style="padding: 8px 12px; font-size: 14px; font-weight: 600; color: #d97706; border-top: 1px solid #e2e8f0;">⏰ ${eventTimeStr}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 12px; font-size: 13px; font-weight: 700; color: #475569; border-top: 1px solid #e2e8f0;">Category:</td>
                          <td style="padding: 8px 12px; font-size: 14px; color: #334155; border-top: 1px solid #e2e8f0;">🏷️ ${event.category || "Workshop"}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Personalized Message Box -->
                  <tr>
                    <td style="padding: 0 30px 25px 30px;">
                      <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; border-radius: 4px;">
                        <h4 style="margin: 0 0 6px 0; font-size: 13px; text-transform: uppercase; color: #1e40af; font-weight: 700;">Personalized Event Note:</h4>
                        <p style="margin: 0; font-size: 14px; color: #1e3a8a; line-height: 1.5; font-style: italic;">
                          "${customMessage}"
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer / Signature -->
                  <tr>
                    <td style="padding: 20px 30px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                      <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569;">CMR Institute of Technology - IIC Admin Office</p>
                      <p style="margin: 0;">This is an automated operational notification. Please contact the IIC Coordinator for schedule adjustments.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // 4. Send Email via Mail Transport
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = isTest ? nodemailer.getTestMessageUrl(info) : null;

    console.log(`[Email Dispatch Success] Sent reminder for "${event.title}" to ${event.facultyEmail}. MessageID: ${info.messageId}`);
    if (previewUrl) {
      console.log(`[Ethereal Test Mail Preview] ${previewUrl}`);
    }

    event.reminderSent = true;
    event.lastReminderDate = new Date();
    await event.save();

    res.status(200).json({ 
      message: isTest 
        ? `Reminder email simulated via Ethereal Test Service! (Preview: ${previewUrl})`
        : "Reminder email sent successfully to Gmail inbox!", 
      event,
      previewUrl
    });

  } catch (error) {
    console.error("[Email Dispatch Error]", {
      code: error.code,
      command: error.command,
      message: error.message,
      stack: error.stack
    });

    if (error.code === 'EAUTH' || error.message.includes('Invalid login') || error.message.includes('Username and Password not accepted')) {
      return res.status(401).json({
        message: "SMTP Authentication Failed: Invalid credentials or missing Gmail App Password in EMAIL_PASS.",
        details: error.message
      });
    }

    if (['ESOCKET', 'ETIMEDOUT', 'ECONNREFUSED', 'EDNS'].includes(error.code) || error.message.includes('connect ETIMEDOUT')) {
      return res.status(502).json({
        message: "SMTP Host Connection Failed: Unable to reach mail server. Check firewall settings for port 587/465.",
        details: error.message
      });
    }

    if (error.responseCode === 429 || error.message.includes('Quota exceeded') || error.message.includes('rate limit')) {
      return res.status(429).json({
        message: "Email Service Rate Limit Exceeded: Daily quota reached or provider rate limiting active.",
        details: error.message
      });
    }

    if (error.code === 'EENVELOPE' || error.responseCode === 550) {
      return res.status(422).json({
        message: "Email Address Rejected by Mail Server: Recipient inbox does not exist or mailbox full.",
        details: error.message
      });
    }

    res.status(400).json({ 
      message: `Failed to send email: ${error.message}`,
      error: error.message,
      code: error.code || "EMAIL_SEND_ERROR"
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const events = await Event.find();
    
    const pending = events.filter(e => e.autoReminder && !e.reminderSent);
    const sent = events.filter(e => e.reminderSent);
    const upcoming = events.filter(e => {
      const isJune = new Date(e.date).getMonth() === 5; // Month is 0-indexed, June is 5
      const isJuly = new Date(e.date).getMonth() === 6;
      return (isJune || isJuly) && !e.reminderSent;
    });

    res.status(200).json({
      pending,
      sent,
      upcoming
    });
  } catch (error) {
    console.error("getDashboardStats Error:", error);
    res.status(500).json({ message: "Failed to fetch stats", error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully", id });
  } catch (error) {
    console.error("deleteEvent Error:", error);
    res.status(500).json({ message: "Failed to delete event", error: error.message });
  }
};

const parseDDMMYYYYDate = (raw) => {
  if (!raw) return null;
  const str = String(raw).trim();
  if (!str) return null;

  // Explicit DD-MM-YYYY parsing (Day = parts[0], Month = parts[1], Year = parts[2])
  const parts = str.split(/[-/.]/);
  if (parts.length >= 3) {
    const p1 = parseInt(parts[0], 10);
    const p2 = parseInt(parts[1], 10);
    const p3 = parseInt(parts[2], 10);

    // If p3 is 4-digit year e.g. "15-10-2025" -> Day=p1, Month=p2, Year=p3
    if (!isNaN(p1) && !isNaN(p2) && !isNaN(p3) && p3 > 1000) {
      return new Date(Date.UTC(p3, p2 - 1, p1));
    }

    // If p1 is 4-digit year e.g. "2025-10-15" -> Year=p1, Month=p2, Day=p3
    if (!isNaN(p1) && !isNaN(p2) && !isNaN(p3) && p1 > 1000) {
      return new Date(Date.UTC(p1, p2 - 1, p3));
    }
  }

  const d = new Date(str);
  return !isNaN(d.getTime()) ? d : null;
};

export const celebrationBulkUpload = async (req, res) => {
  try {
    const rows = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: "Invalid celebration event data provided" });
    }

    let importedCount = 0;
    const invalidRows = [];

    for (let i = 0; i < rows.length; i++) {
      const rawRow = rows[i];
      if (!rawRow || typeof rawRow !== "object") continue;

      // Normalize row keys to lower case
      const row = {};
      Object.keys(rawRow).forEach((key) => {
        row[key.trim().toLowerCase()] = rawRow[key];
      });

      const title = (
        row["activity title"] ||
        row["activity_title"] ||
        row["title"] ||
        row["activity"] ||
        row["event title"] ||
        row["event_title"] ||
        row["event"] ||
        row["name"] ||
        row["celebration"] ||
        ""
      ).trim();

      const rawDate =
        row["date"] ||
        row["event date"] ||
        row["event_date"] ||
        row["activity date"] ||
        row["start date"] ||
        row["date (yyyy-mm-dd)"] ||
        row["date(yyyy-mm-dd)"];

      if (!title || !rawDate) {
        invalidRows.push({ rowIndex: i + 1, row: rawRow, reason: "Missing required Title or Date" });
        continue;
      }

      const parsedDate = parseDDMMYYYYDate(rawDate);
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        invalidRows.push({ rowIndex: i + 1, row: rawRow, reason: `Unparseable Date: "${rawDate}"` });
        continue;
      }

      const statusVal = (row["status"] || row["state"] || "Active").trim();
      const levelVal = (row["level"] || row["tier"] || row["category"] || "").trim();

      const startOfDay = new Date(parsedDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const existing = await Event.findOne({
        title: { $regex: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      if (existing) {
        existing.status = statusVal;
        existing.level = levelVal;
        existing.category = "Celebration Event";
        existing.isCelebration = true;
        await existing.save();
        importedCount++;
      } else {
        await Event.create({
          title,
          date: parsedDate,
          status: statusVal,
          level: levelVal,
          category: "Celebration Event",
          isCelebration: true,
          department: "General",
          venue: "Main Campus",
          facultyName: "Event Coordinator",
        });
        importedCount++;
      }
    }

    res.status(201).json({
      message: `${importedCount} Celebration Events imported successfully.`,
      imported: importedCount,
      invalidCount: invalidRows.length,
      invalidRows,
    });
  } catch (error) {
    console.error("celebrationBulkUpload Error:", error);
    res.status(500).json({ message: "Failed to upload celebration events", error: error.message });
  }
};
