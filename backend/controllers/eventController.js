import Event from "../models/Event.js";
import nodemailer from "nodemailer";

// ============================================================
// EMAIL TRANSPORTER
// ============================================================

const getTransporter = async () => {
  const emailUser = (process.env.EMAIL_USER || "").trim();

  const emailPass = (process.env.EMAIL_PASS || "")
    .replace(/\s+/g, "")
    .trim();

  if (!emailUser || !emailPass) {
    const configError = new Error(
      "Missing EMAIL_USER or EMAIL_PASS in backend/.env file."
    );

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

// ============================================================
// GET ALL EVENTS
// ============================================================

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({
      date: -1,
    });

    res.status(200).json(events);
  } catch (error) {
    console.error("getEvents Error:", error);

    res.status(500).json({
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

// ============================================================
// GET IIC DASHBOARD DATA
//
// SELF_DRIVEN IS ALSO AN IIC EVENT
// ============================================================

export const getIICDashboardEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({
      date: -1,
    });

    // ========================================================
    // IIC EVENTS
    //
    // Normal IIC events + Self Driven events
    // ========================================================

    const iicEvents = events.filter(
      (event) =>
        (
          event.activityType === "IIC" ||
          event.activityType === "SELF_DRIVEN" ||
          event.source === "SELF_DRIVEN"
        ) &&
        !event.isCelebration
    );

    // ========================================================
    // CELEBRATION EVENTS
    // ========================================================

    const celebrationEvents = events.filter(
      (event) =>
        event.activityType === "CELEBRATION" ||
        event.isCelebration === true
    );

    // ========================================================
    // SELF DRIVEN EVENTS
    //
    // Kept separately so the dashboard can optionally
    // display them as a subsection of IIC.
    // ========================================================

    const selfDrivenEvents = events.filter(
      (event) =>
        event.activityType === "SELF_DRIVEN" ||
        event.source === "SELF_DRIVEN"
    );

    // ========================================================
    // MIC EVENTS
    // ========================================================

    const micEvents = events.filter(
      (event) =>
        event.activityType === "MIC"
    );

    const micBasic = micEvents.filter(
      (event) =>
        event.level === "BASIC"
    );

    const micAdvanced = micEvents.filter(
      (event) =>
        event.level === "ADVANCED"
    );

    const micReskilling = micEvents.filter(
      (event) =>
        event.level === "RESKILLING"
    );

    const micUpskilling = micEvents.filter(
      (event) =>
        event.level === "UPSKILLING"
    );

    // ========================================================
    // RESPONSE
    // ========================================================

    res.status(200).json({
      iicEvents,

      celebrationEvents,

      selfDrivenEvents,

      mic: {
        all: micEvents,
        basic: micBasic,
        advanced: micAdvanced,
        reskilling: micReskilling,
        upskilling: micUpskilling,
      },

      totals: {
        iic: iicEvents.length,
        celebration: celebrationEvents.length,
        selfDriven: selfDrivenEvents.length,
        mic: micEvents.length,
      },
    });
  } catch (error) {
    console.error(
      "getIICDashboardEvents Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch IIC dashboard events",

      error: error.message,
    });
  }
};

// ============================================================
// CREATE EVENT
// ============================================================

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
      activityType,
      category,
      level,
      message,
      autoReminder,
      source,
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        message:
          "Title and Date are required fields.",
      });
    }

    const normalizedActivityType =
      activityType || "IIC";

    const normalizedSource =
      source || "CALENDAR";

    const newEvent = new Event({
      title,

      department:
        department || "N/A",

      date:
        new Date(date),

      time:
        time || "10:00 AM",

      venue:
        venue || "TBD",

      facultyName:
        facultyName || "Unknown",

      facultyEmail:
        facultyEmail || "",

      activityType:
        normalizedActivityType,

      category:
        category || "Workshop",

      level:
        level || "",

      message:
        message || "",

      source:
        normalizedSource,

      autoReminder:
        !!autoReminder,

      isCelebration:
        normalizedActivityType ===
        "CELEBRATION",
    });

    await newEvent.save();

    // ========================================================
    // SEND INITIAL FACULTY EMAIL
    // ========================================================

    if (
      newEvent.facultyEmail &&
      typeof newEvent.facultyEmail ===
        "string" &&
      newEvent.facultyEmail.trim()
    ) {
      try {
        const mailClient =
          await getTransporter();

        const {
          transporter,
          fromEmail,
        } = mailClient;

        const eventDateStr =
          new Date(
            newEvent.date
          ).toLocaleDateString(
            "en-US",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          );

        const eventTimeStr =
          newEvent.time ||
          "10:00 AM";

        const customMessage =
          newEvent.message &&
          newEvent.message.trim()
            ? newEvent.message.trim()
            : "You have been assigned as the coordinating faculty for this event added to the calendar.";

        const mailOptions = {
          from:
            `"CMRIT IIC Admin" <${fromEmail}>`,

          to:
            newEvent.facultyEmail.trim(),

          subject:
            `New Calendar Event Assigned: ${newEvent.title} - ${eventDateStr}`,

          text: `
Dear ${newEvent.facultyName || "Faculty Member"},

This is an official notification to inform you that you have been assigned to an event added to the calendar.

Event Name: ${newEvent.title}

Category: ${newEvent.category || "Workshop"}

Date: ${eventDateStr}

Time: ${eventTimeStr}

Department: ${newEvent.department || "N/A"}

Note / Description:

${customMessage}

Please ensure all preparations are complete.

Best regards,

CMRIT IIC Admin Team
          `,

          html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">

  <div style="background:#1e3a8a;color:white;padding:25px;">

    <h2>
      CMRIT Institution's Innovation Council
    </h2>

    <p>
      Faculty Event Assignment Notification
    </p>

  </div>

  <div style="padding:25px;background:#ffffff;">

    <p>
      Dear
      <strong>
        ${newEvent.facultyName || "Faculty Member"}
      </strong>,
    </p>

    <p>
      You have been assigned as the coordinating
      faculty for the following event.
    </p>

    <table
      style="width:100%;border-collapse:collapse;"
    >

      <tr>
        <td><strong>Event</strong></td>
        <td>${newEvent.title}</td>
      </tr>

      <tr>
        <td><strong>Date</strong></td>
        <td>${eventDateStr}</td>
      </tr>

      <tr>
        <td><strong>Time</strong></td>
        <td>${eventTimeStr}</td>
      </tr>

      <tr>
        <td><strong>Department</strong></td>
        <td>${newEvent.department}</td>
      </tr>

      <tr>
        <td><strong>Category</strong></td>
        <td>${newEvent.category}</td>
      </tr>

    </table>

    <div
      style="
        margin-top:20px;
        padding:15px;
        background:#eff6ff;
        border-left:4px solid #2563eb;
      "
    >
      ${customMessage}
    </div>

  </div>

  <div
    style="
      background:#f1f5f9;
      padding:20px;
      text-align:center;
    "
  >
    CMR Institute of Technology - IIC Admin Office
  </div>

</div>
          `,
        };

        await transporter.sendMail(
          mailOptions
        );

        newEvent.addedDayReminderSent =
          true;

        newEvent.lastReminderDate =
          new Date();

        await newEvent.save();

        console.log(
          `[Event Creation] Initial email sent to ${newEvent.facultyEmail}`
        );
      } catch (emailErr) {
        console.error(
          "[Event Creation] Failed to send creation email:",
          emailErr.message
        );
      }
    }

    res.status(201).json({
      message:
        "Event created successfully",

      event:
        newEvent,
    });
  } catch (error) {
    console.error(
      "createEvent Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create event",

      error:
        error.message,
    });
  }
};

// ============================================================
// BULK UPLOAD
// ============================================================

export const bulkUpload = async (
  req,
  res
) => {
  try {
    const events = req.body;

    if (
      !Array.isArray(events) ||
      events.length === 0
    ) {
      return res.status(400).json({
        message:
          "Invalid event data",
      });
    }

    for (const evt of events) {
      const eventData = {
        ...evt,

        activityType:
          evt.activityType ||
          "IIC",

        source:
          evt.source ||
          "CSV",

        isCelebration:
          evt.activityType ===
            "CELEBRATION" ||
          evt.isCelebration === true,
      };

      await Event.updateOne(
        {
          title:
            eventData.title,

          date:
            eventData.date,
        },

        {
          $set:
            eventData,
        },

        {
          upsert:
            true,
        }
      );
    }

    res.status(201).json({
      message:
        "Events uploaded successfully",
    });
  } catch (error) {
    console.error(
      "bulkUpload Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to upload events",

      error:
        error.message,
    });
  }
};

// ============================================================
// UPDATE EVENT
// ============================================================

export const updateEvent = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const updateData = {
      ...req.body,
    };

    if (updateData.status) {
      updateData.status =
        updateData.status.toUpperCase();
    }

    if (
      updateData.activityType ===
      "CELEBRATION"
    ) {
      updateData.isCelebration =
        true;
    }

    if (
      updateData.activityType &&
      updateData.activityType !==
        "CELEBRATION"
    ) {
      updateData.isCelebration =
        false;
    }

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
      return res.status(404).json({
        message:
          "Event not found",
      });
    }

    res.status(200).json({
      message:
        "Event updated successfully",

      event,
    });
  } catch (error) {
    console.error(
      "updateEvent Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update event",

      error:
        error.message,
    });
  }
};

// ============================================================
// DELETE EVENT
// ============================================================

export const deleteEvent = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const deletedEvent =
      await Event.findByIdAndDelete(
        id
      );

    if (!deletedEvent) {
      return res.status(404).json({
        message:
          "Event not found",
      });
    }

    res.status(200).json({
      message:
        "Event deleted successfully",

      id,
    });
  } catch (error) {
    console.error(
      "deleteEvent Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete event",

      error:
        error.message,
    });
  }
};

// ============================================================
// DASHBOARD STATS
// ============================================================

export const getDashboardStats =
  async (req, res) => {
    try {
      const events =
        await Event.find();

      const pending =
        events.filter(
          (e) =>
            e.autoReminder &&
            !e.reminderSent
        );

      const sent =
        events.filter(
          (e) =>
            e.reminderSent
        );

      const upcoming =
        events.filter(
          (e) => {
            const eventDate =
              new Date(e.date);

            return (
              eventDate >=
              new Date()
            );
          }
        );

      const iicEvents =
        events.filter(
          (e) =>
            (
              e.activityType === "IIC" ||
              e.activityType === "SELF_DRIVEN" ||
              e.source === "SELF_DRIVEN"
            ) &&
            !e.isCelebration
        );

      res.status(200).json({
        pending,

        sent,

        upcoming,

        total:
          events.length,

        iic:
          iicEvents.length,

        celebration:
          events.filter(
            (e) =>
              e.activityType ===
                "CELEBRATION" ||
              e.isCelebration
          ).length,

        selfDriven:
          events.filter(
            (e) =>
              e.activityType ===
                "SELF_DRIVEN" ||
              e.source ===
                "SELF_DRIVEN"
          ).length,

        mic:
          events.filter(
            (e) =>
              e.activityType ===
              "MIC"
          ).length,
      });
    } catch (error) {
      console.error(
        "getDashboardStats Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch stats",

        error:
          error.message,
      });
    }
  };

// ============================================================
// DATE PARSER
// ============================================================

const parseDDMMYYYYDate = (
  raw
) => {
  if (!raw) return null;

  const str =
    String(raw).trim();

  if (!str) return null;

  const parts =
    str.split(/[-/.]/);

  if (parts.length >= 3) {
    const p1 =
      parseInt(parts[0], 10);

    const p2 =
      parseInt(parts[1], 10);

    const p3 =
      parseInt(parts[2], 10);

    if (
      !isNaN(p1) &&
      !isNaN(p2) &&
      !isNaN(p3) &&
      p3 > 1000
    ) {
      return new Date(
        Date.UTC(
          p3,
          p2 - 1,
          p1
        )
      );
    }

    if (
      !isNaN(p1) &&
      !isNaN(p2) &&
      !isNaN(p3) &&
      p1 > 1000
    ) {
      return new Date(
        Date.UTC(
          p1,
          p2 - 1,
          p3
        )
      );
    }
  }

  const d =
    new Date(str);

  return !isNaN(
    d.getTime()
  )
    ? d
    : null;
};

// ============================================================
// CELEBRATION BULK UPLOAD
// ============================================================

export const celebrationBulkUpload =
  async (req, res) => {
    try {
      const rows =
        req.body;

      if (
        !Array.isArray(rows) ||
        rows.length === 0
      ) {
        return res.status(400).json({
          message:
            "Invalid celebration event data provided",
        });
      }

      let importedCount = 0;

      const invalidRows = [];

      for (
        let i = 0;
        i < rows.length;
        i++
      ) {
        const rawRow =
          rows[i];

        if (
          !rawRow ||
          typeof rawRow !==
            "object"
        ) {
          continue;
        }

        const row = {};

        Object.keys(
          rawRow
        ).forEach(
          (key) => {
            row[
              key
                .trim()
                .toLowerCase()
            ] =
              rawRow[key];
          }
        );

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
        )
          .toString()
          .trim();

        const rawDate =
          row["date"] ||
          row["event date"] ||
          row["event_date"] ||
          row["activity date"] ||
          row["start date"] ||
          row["date (yyyy-mm-dd)"] ||
          row["date(yyyy-mm-dd)"];

        if (
          !title ||
          !rawDate
        ) {
          invalidRows.push({
            rowIndex:
              i + 1,

            row:
              rawRow,

            reason:
              "Missing required Title or Date",
          });

          continue;
        }

        const parsedDate =
          parseDDMMYYYYDate(
            rawDate
          );

        if (
          !parsedDate ||
          isNaN(
            parsedDate.getTime()
          )
        ) {
          invalidRows.push({
            rowIndex:
              i + 1,

            row:
              rawRow,

            reason:
              `Unparseable Date: "${rawDate}"`,
          });

          continue;
        }

        const statusVal = (
          row["status"] ||
          row["state"] ||
          "Active"
        )
          .toString()
          .trim()
          .toUpperCase();

        const levelVal = (
          row["level"] ||
          row["tier"] ||
          ""
        )
          .toString()
          .trim()
          .toUpperCase();

        const startOfDay =
          new Date(
            parsedDate
          );

        startOfDay.setUTCHours(
          0,
          0,
          0,
          0
        );

        const endOfDay =
          new Date(
            parsedDate
          );

        endOfDay.setUTCHours(
          23,
          59,
          59,
          999
        );

        const escapedTitle =
          title.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );

        const existing =
          await Event.findOne({
            title: {
              $regex:
                new RegExp(
                  `^${escapedTitle}$`,
                  "i"
                ),
            },

            date: {
              $gte:
                startOfDay,

              $lte:
                endOfDay,
            },
          });

        if (existing) {
          existing.status =
            statusVal;

          existing.level =
            levelVal;

          existing.category =
            "Celebration Event";

          existing.activityType =
            "CELEBRATION";

          existing.isCelebration =
            true;

          await existing.save();

          importedCount++;
        } else {
          await Event.create({
            title,

            date:
              parsedDate,

            status:
              statusVal,

            level:
              levelVal,

            category:
              "Celebration Event",

            activityType:
              "CELEBRATION",

            isCelebration:
              true,

            source:
              "CSV",

            department:
              "General",

            venue:
              "Main Campus",

            facultyName:
              "Event Coordinator",
          });

          importedCount++;
        }
      }

      res.status(201).json({
        message:
          `${importedCount} Celebration Events imported successfully.`,

        imported:
          importedCount,

        invalidCount:
          invalidRows.length,

        invalidRows,
      });
    } catch (error) {
      console.error(
        "celebrationBulkUpload Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to upload celebration events",

        error:
          error.message,
      });
    }
  };

// ============================================================
// SEND MANUAL REMINDER
// ============================================================

export const sendManualReminder =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        facultyEmail,
        time,
        message,
      } = req.body;

      const event =
        await Event.findById(id);

      if (!event) {
        return res.status(404).json({
          message:
            "Event not found",
        });
      }

      if (facultyEmail) {
        event.facultyEmail =
          facultyEmail;
      }

      if (time) {
        event.time =
          time;
      }

      if (
        message !== undefined
      ) {
        event.message =
          message;
      }

      if (
        !event.facultyEmail ||
        typeof event.facultyEmail !==
          "string" ||
        !event.facultyEmail.trim()
      ) {
        return res.status(400).json({
          message:
            "Faculty email address is required.",
        });
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          event.facultyEmail.trim()
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid email address.",
        });
      }

      const mailClient =
        await getTransporter();

      const {
        transporter,
        fromEmail,
      } = mailClient;

      const eventDateStr =
        new Date(
          event.date
        ).toLocaleDateString(
          "en-US",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        );

      const eventTimeStr =
        event.time ||
        "10:00 AM";

      const customMessage =
        event.message &&
        event.message.trim()
          ? event.message.trim()
          : "You are assigned as the coordinating faculty for this upcoming event.";

      const mailOptions = {
        from:
          `"CMRIT IIC Admin" <${fromEmail}>`,

        replyTo:
          fromEmail,

        to:
          event.facultyEmail.trim(),

        subject:
          `Reminder: ${event.title} - ${eventDateStr} at ${eventTimeStr}`,

        text: `
Dear ${event.facultyName || "Faculty Member"},

This is an official reminder regarding your assigned event.

Event Name: ${event.title}

Category: ${event.category || "Workshop"}

Date: ${eventDateStr}

Time: ${eventTimeStr}

Department: ${event.department || "N/A"}

Note:

${customMessage}

Best regards,

CMRIT IIC Admin Team
        `,

        html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">

  <div style="background:#1e3a8a;color:white;padding:25px;">

    <h2>
      CMRIT Institution's Innovation Council
    </h2>

    <p>
      Official Faculty Event Reminder
    </p>

  </div>

  <div style="padding:25px;">

    <p>
      Dear
      <strong>
        ${event.facultyName || "Faculty Member"}
      </strong>,
    </p>

    <p>
      This is an official reminder regarding
      your scheduled event responsibility.
    </p>

    <table
      style="
        width:100%;
        border-collapse:collapse;
      "
    >

      <tr>
        <td><strong>Event</strong></td>
        <td>${event.title}</td>
      </tr>

      <tr>
        <td><strong>Date</strong></td>
        <td>${eventDateStr}</td>
      </tr>

      <tr>
        <td><strong>Time</strong></td>
        <td>${eventTimeStr}</td>
      </tr>

      <tr>
        <td><strong>Department</strong></td>
        <td>${event.department}</td>
      </tr>

    </table>

    <div
      style="
        margin-top:20px;
        padding:15px;
        background:#eff6ff;
      "
    >
      ${customMessage}
    </div>

  </div>

</div>
        `,
      };

      const info =
        await transporter.sendMail(
          mailOptions
        );

      event.reminderSent =
        true;

      event.lastReminderDate =
        new Date();

      await event.save();

      res.status(200).json({
        message:
          "Reminder email sent successfully.",

        event,

        messageId:
          info.messageId,
      });
    } catch (error) {
      console.error(
        "[Email Dispatch Error]",
        error
      );

      res.status(400).json({
        message:
          `Failed to send email: ${error.message}`,

        error:
          error.message,

        code:
          error.code ||
          "EMAIL_SEND_ERROR",
      });
    }
  };