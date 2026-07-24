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

const startScheduler = async () => {
  await initTransporter();
  // Run every minute for testing. In production, '0 0 * * *'
  cron.schedule("* * * * *", async () => {
    console.log("[Scheduler] Running event reminder check...");
    try {
      if (!transporter) {
        console.log("[Scheduler] Transporter not ready yet, skipping tick.");
        return;
      }

      // Find events that have autoReminder enabled, reminder not sent, and have an email
      const events = await Event.find({
        autoReminder: true,
        reminderSent: false,
        facultyEmail: { $nin: ["", null] },
      });

      if (events.length === 0) {
        console.log("[Scheduler] No pending reminders found for valid events.");
        return;
      }

      for (const event of events) {
        const eventDate = new Date(event.date);
        const today = new Date();
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        // Trigger only if the event is 3 days or less away (and hasn't passed)
        if (diffDays >= 0 && diffDays <= 3) {
          const mailOptions = {
            from: `"CMRIT IIC Admin" <${senderEmail || process.env.EMAIL_USER || "admin@cmrit-iic.test"}>`,
            to: event.facultyEmail,
            subject: "Reminder: Upcoming IIC Event at CMRIT",
            html: `
              <h2>Event Reminder</h2>
              <p>Dear ${event.facultyName},</p>
              <p>This is an automated reminder that you are assigned to an upcoming event.</p>
              <ul>
                <li><strong>Event Name:</strong> ${event.title}</li>
                <li><strong>Event Date:</strong> ${eventDate.toDateString()}</li>
                <li><strong>Venue:</strong> ${event.venue}</li>
                <li><strong>Department:</strong> ${event.department}</li>
              </ul>
              <p>Please ensure all necessary preparations are complete.</p>
              <br/>
              <p>Best regards,<br/>CMRIT IIC Admin Team</p>
            `,
          };

          try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`[Scheduler] Reminder sent for event: ${event.title} to ${event.facultyEmail}`);
            
            event.reminderSent = true;
            event.lastReminderDate = new Date();
            await event.save();
          } catch (mailError) {
            console.error(`[Scheduler] Failed to send email for event ${event.title}:`, mailError.message);
          }
        }
      }
    } catch (error) {
      console.error("[Scheduler] Error running background job:", error.message);
    }
  });

  console.log("Scheduler initialized. Looking for events within 3 days with auto-reminder enabled.");
};

export default startScheduler;
