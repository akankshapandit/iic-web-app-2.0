import cron from "node-cron";
import nodemailer from "nodemailer";
import Event from "../models/Event.js";

let transporter;
let senderEmail;

async function initTransporter() {
  try {
    const emailUser = (process.env.EMAIL_USER || "").trim();
    const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "").trim();

    if (emailUser && emailPass) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
      senderEmail = emailUser;
      console.log("[Mailer] Gmail transporter initialized successfully.");
    } else {
      console.log("[Mailer] Gmail credentials missing in backend/.env (EMAIL_USER or EMAIL_PASS). Automated mailer idle.");
    }
  } catch (err) {
    console.error("[Mailer] Failed to initialize mail transporter:", err.message);
  }
}

const buildEmailHtml = (event, eventDateStr, eventTimeStr, customMessage, reminderTypeLabel) => `
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
              <p style="color: #93c5fd; font-size: 13px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 600;">${reminderTypeLabel || "Official Faculty Event Reminder"}</p>
            </td>
          </tr>

          <!-- Greeting & Introductory Text -->
          <tr>
            <td style="padding: 30px 30px 15px 30px;">
              <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 10px 0;">Dear ${event.facultyName || "Faculty Member"},</p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
                This is an official notification regarding your scheduled faculty event responsibility at CMR Institute of Technology.
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
`;

const startScheduler = async () => {
  await initTransporter();
  
  // Cron schedule: runs every minute to check pending reminders
  cron.schedule("* * * * *", async () => {
    console.log("[Scheduler] Running event reminder check...");
    try {
      if (!transporter) {
        console.log("[Scheduler] Transporter not ready yet, skipping tick.");
        return;
      }

      // 1. Initial Notification: For events added to calendar where addedDayReminderSent is false
      const pendingAddedEvents = await Event.find({
        facultyEmail: { $nin: ["", null] },
        addedDayReminderSent: false,
      });

      for (const event of pendingAddedEvents) {
        const eventDateStr = new Date(event.date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const eventTimeStr = event.time || "10:00 AM";
        const customMessage = event.message && event.message.trim()
          ? event.message.trim()
          : "You have been assigned as the coordinating faculty for this event added to the calendar.";

        const mailOptions = {
          from: `"CMRIT IIC Admin" <${senderEmail || process.env.EMAIL_USER}>`,
          to: event.facultyEmail,
          subject: `Event Assignment: ${event.title} - ${eventDateStr}`,
          text: `Dear ${event.facultyName || "Faculty Member"},\n\nThis is an official notification regarding your assigned event added to the calendar:\n\nEvent Name: ${event.title}\nCategory: ${event.category || "Workshop"}\nDate: ${eventDateStr}\nTime: ${eventTimeStr}\n\nNote / Description:\n${customMessage}\n\nPlease ensure all preparations are complete.\n\nBest regards,\nCMRIT IIC Admin Team`,
          html: buildEmailHtml(event, eventDateStr, eventTimeStr, customMessage, "Event Calendar Assignment"),
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`[Scheduler] Initial calendar assignment email sent for: "${event.title}" to ${event.facultyEmail}`);
          event.addedDayReminderSent = true;
          event.lastReminderDate = new Date();
          await event.save();
        } catch (mailError) {
          console.error(`[Scheduler] Failed to send creation email for ${event.title}:`, mailError.message);
        }
      }

      // 2. 3 Weeks Advance Reminder: For events where autoReminder is true and 3-week reminder not yet sent
      const pendingThreeWeekEvents = await Event.find({
        autoReminder: true,
        threeWeekReminderSent: false,
        facultyEmail: { $nin: ["", null] },
      });

      for (const event of pendingThreeWeekEvents) {
        const eventDate = new Date(event.date);
        const today = new Date();
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Trigger if event is 3 weeks (21 days) or less away (and not passed)
        if (diffDays >= 0 && diffDays <= 21) {
          const eventDateStr = eventDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const eventTimeStr = event.time || "10:00 AM";
          const customMessage = event.message && event.message.trim()
            ? event.message.trim()
            : "This is a 3-week advance reminder for your upcoming assigned event. Please review all details and ensure preparations are underway.";

          const mailOptions = {
            from: `"CMRIT IIC Admin" <${senderEmail || process.env.EMAIL_USER}>`,
            to: event.facultyEmail,
            subject: `3-Week Reminder: ${event.title} - ${eventDateStr}`,
            text: `Dear ${event.facultyName || "Faculty Member"},\n\nThis is an official 3-week reminder regarding your assigned event:\n\nEvent Name: ${event.title}\nCategory: ${event.category || "Workshop"}\nDate: ${eventDateStr}\nTime: ${eventTimeStr}\n\nNote / Description:\n${customMessage}\n\nPlease ensure all preparations are complete.\n\nBest regards,\nCMRIT IIC Admin Team`,
            html: buildEmailHtml(event, eventDateStr, eventTimeStr, customMessage, "3-Week Advance Event Reminder"),
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`[Scheduler] 3-Week reminder sent for event: "${event.title}" to ${event.facultyEmail}`);
            event.threeWeekReminderSent = true;
            event.reminderSent = true;
            event.lastReminderDate = new Date();
            await event.save();
          } catch (mailError) {
            console.error(`[Scheduler] Failed to send 3-week reminder for ${event.title}:`, mailError.message);
          }
        }
      }

    } catch (error) {
      console.error("[Scheduler] Error running background job:", error.message);
    }
  });

  console.log("[Scheduler] Initialized. Monitoring calendar addition emails and 3-week event reminders.");
};

export default startScheduler;
