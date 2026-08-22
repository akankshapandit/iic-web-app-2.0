import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to normalize faculty names
export const normalizeFacultyName = (rawName) => {
  if (!rawName) return "Unknown";
  return rawName.trim().replace(/\s+/g, " ");
};

// Helper function to parse DD-MM-YYYY dates
const parseCSVDate = (dateStr) => {
  if (!dateStr) return new Date();
  const trimmed = dateStr.trim();
  const parts = trimmed.split("-");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const year = parseInt(parts[2], 10);
    const dateObj = new Date(Date.UTC(year, month, day));
    if (!isNaN(dateObj.getTime())) return dateObj;
  }
  const fallback = new Date(trimmed);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
};

// Simple CSV parser supporting quotes
export const parseCSVContent = (content) => {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];
  
  const parseLine = (line) => {
    const fields = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current.trim());
    return fields.map(f => f.replace(/^"|"$/g, "").trim());
  };

  const headers = parseLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length >= 4) {
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });
      rows.push(row);
    }
  }
  return rows;
};

export const getCSVFilePath = () => {
  const candidatePaths = [
    path.join(__dirname, "..", "members-iic.csv"),
    path.join(process.cwd(), "backend", "members-iic.csv"),
    path.join(process.cwd(), "members-iic.csv")
  ];
  return candidatePaths.find(p => fs.existsSync(p));
};

export const seedCSVData = async () => {
  try {
    const csvPath = getCSVFilePath();
    if (!csvPath) {
      console.log("[CSV Seeder] members-iic.csv not found, skipping seed.");
      return;
    }

    const fileContent = fs.readFileSync(csvPath, "utf-8");
    const records = parseCSVContent(fileContent);

    if (records.length === 0) {
      console.log("[CSV Seeder] No valid records found in CSV.");
      return;
    }

    console.log(`[CSV Seeder] Found ${records.length} records in CSV. Seeding database...`);

    let eventsCreated = 0;
    const facultyMap = new Map(); // normalizedName -> department

    for (const record of records) {
      const rawFaculty = record["Name of the faculty"] || record["faculty"] || "";
      const rawDept = record["department"] || "";
      const rawActivity = record["Type of activity"] || record["activityType"] || "IIC";
      const rawTitle = record["title"] || "";
      const rawStatus = record["STATUS"] || record["status"] || "COMPLETED";
      const rawDate = record["DATE"] || record["date"] || "";

      if (!rawTitle) continue;

      const facultyName = normalizeFacultyName(rawFaculty);
      const department = rawDept.trim() || "N/A";
      const activityType = rawActivity.trim() || "IIC";
      const title = rawTitle.trim();
      const status = rawStatus.trim().toUpperCase() || "COMPLETED";
      const dateObj = parseCSVDate(rawDate);

      // Track unique faculty
      if (!facultyMap.has(facultyName) && facultyName !== "Unknown") {
        facultyMap.set(facultyName, department);
      }

      // Idempotent upsert by facultyName + title + date
      const existing = await Event.findOne({
        facultyName,
        title,
        date: dateObj
      });

      if (!existing) {
        await Event.create({
          title,
          department,
          activityType,
          category: activityType,
          facultyName,
          status,
          date: dateObj,
          source: "CSV"
        });
        eventsCreated++;
      } else {
        // Update existing record to preserve fields
        existing.department = department;
        existing.activityType = activityType;
        existing.status = status;
        if (!existing.source) existing.source = "CSV";
        await existing.save();
      }
    }

    console.log(`[CSV Seeder] Successfully seeded ${eventsCreated} new event records. Unique faculty found: ${facultyMap.size}`);

    // Create user accounts for all unique faculty members
    const defaultHashedPassword = await bcrypt.hash("CMRIT@2026", 10);
    let usersCreated = 0;

    for (const [fName, dept] of facultyMap.entries()) {
      // Create email slug
      const emailSlug = fName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ".")
        .replace(/\.+/g, ".")
        .replace(/^\.|\.$/g, "");
      const facultyEmail = `${emailSlug}@cmrit.ac.in`;

      const existingUser = await User.findOne({
        $or: [{ facultyName: fName }, { email: facultyEmail }]
      });

      if (!existingUser) {
        await User.create({
          name: fName,
          email: facultyEmail,
          facultyName: fName,
          department: dept,
          password: defaultHashedPassword,
          role: "faculty",
          isFirstLogin: true
        });
        usersCreated++;
      } else {
        if (!existingUser.facultyName) {
          existingUser.facultyName = fName;
          await existingUser.save();
        }
      }
    }

    console.log(`[CSV Seeder] Successfully provisioned ${usersCreated} new faculty user accounts.`);
  } catch (error) {
    console.error("[CSV Seeder Error]", error);
  }
};
