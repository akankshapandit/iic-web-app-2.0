import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Papa from "papaparse";
import EventDetailsModal from "./EventDetailsModal";

const DEPARTMENT_PALETTE = [
  "#0f172a", "#1e1b4b", "#14532d", "#4c1d95", "#7f1d1d",
  "#164e63", "#831843", "#312e81", "#713f12", "#134e4a",
  "#422006", "#1c1917",
];

const CELEBRATION_COLOR = "#d946ef";

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

function CalendarView() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date("2026-08-01"));
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleDeleteEvent = async (eventId, eventTitle) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this event?\n\n"${eventTitle || "Event"}"`
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent(null);
        }
        alert("Event deleted successfully.");
      } else {
        const errorRes = await res.json().catch(() => ({}));
        alert(`Failed to delete event: ${errorRes.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("deleteEvent Error:", err);
      alert("Error deleting event. Please check backend server connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      
      const rawData = await res.json();
      
      // Deduplicate events based on title and date
      const uniqueEventsMap = new Map();
      rawData.forEach(r => {
        const dateStr = new Date(r.date).toDateString();
        const titleKey = (r.title || "Event").trim().toLowerCase();
        const key = `${titleKey}-${dateStr}`;
        if (!uniqueEventsMap.has(key)) {
          uniqueEventsMap.set(key, r);
        }
      });
      const data = Array.from(uniqueEventsMap.values());
      
      const uniqueDepartments = [...new Set(data.map(d => d.department || "N/A"))];
      const departmentColors = {};
      uniqueDepartments.forEach((dept, i) => {
        departmentColors[dept] = DEPARTMENT_PALETTE[i % DEPARTMENT_PALETTE.length];
      });

      const formattedEvents = data.map((r) => {
        const isCelebration = r.isCelebration || r.category === "Celebration Event";
        const eventColor = isCelebration ? CELEBRATION_COLOR : departmentColors[r.department || "N/A"];

        return {
          id: r._id,
          rawDate: r.date,
          title: r.title,
          start: new Date(r.date),
          extendedProps: {
            faculty: r.facultyName,
            facultyEmail: r.facultyEmail,
            department: r.department,
            status: r.status,
            venue: r.venue,
            category: r.category,
            level: r.level || "",
            isCelebration: isCelebration,
            autoReminder: r.autoReminder,
            reminderSent: r.reminderSent
          },
          backgroundColor: eventColor,
          borderColor: eventColor,
          textColor: "#ffffff",
        };
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedRows = results.data
          .map((row) => {
            const normalizedRow = {};
            Object.keys(row).forEach((key) => {
              normalizedRow[key.trim().toLowerCase()] = row[key];
            });

            const rawDate = normalizedRow["date"];
            if (!rawDate) return null;

            const parsedDate = new Date(rawDate);
            if (isNaN(parsedDate)) return null;

            return {
              title: normalizedRow["title"] || "Event",
              date: parsedDate,
              department: (normalizedRow["department"] || "N/A").trim() || "N/A",
              status: normalizedRow["status"] || "Planned",
              venue: normalizedRow["venue"] || "TBD",
              facultyName: normalizedRow["faculty"] || "Unknown"
            };
          })
          .filter(Boolean);

        if (parsedRows.length === 0) {
          alert("No valid events found in CSV");
          return;
        }

        try {
          setLoading(true);
          const res = await fetch("http://localhost:3000/api/events/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsedRows)
          });

          if (res.ok) {
            alert("Events uploaded successfully!");
            fetchEvents();
          } else {
            alert("Failed to upload events.");
          }
        } catch (error) {
          console.error(error);
          alert("Error uploading events");
        } finally {
          setLoading(false);
        }
      },
    });
    e.target.value = "";
  };

  const handleCelebrationFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedRows = results.data
          .map((row) => {
            const normalizedRow = {};
            Object.keys(row).forEach((key) => {
              normalizedRow[key.trim().toLowerCase()] = row[key];
            });

            const rawDate =
              normalizedRow["date"] ||
              normalizedRow["event date"] ||
              normalizedRow["event_date"] ||
              normalizedRow["activity date"] ||
              normalizedRow["start date"] ||
              normalizedRow["date (yyyy-mm-dd)"] ||
              normalizedRow["date(yyyy-mm-dd)"];

            const title =
              normalizedRow["activity title"] ||
              normalizedRow["activity_title"] ||
              normalizedRow["title"] ||
              normalizedRow["activity"] ||
              normalizedRow["event title"] ||
              normalizedRow["event_title"] ||
              normalizedRow["event"] ||
              normalizedRow["name"] ||
              normalizedRow["celebration"];

            if (!rawDate || !title) return null;

            const parsedDate = parseDDMMYYYYDate(rawDate);
            if (!parsedDate || isNaN(parsedDate.getTime())) return null;

            return {
              title: String(title).trim(),
              date: parsedDate.toISOString(),
              status: (normalizedRow["status"] || normalizedRow["state"] || "Active").trim(),
              level: (normalizedRow["level"] || normalizedRow["tier"] || "").trim(),
            };
          })
          .filter(Boolean);

        if (parsedRows.length === 0) {
          alert("No valid celebration events found in CSV. Please check date and title column formats.");
          return;
        }

        try {
          setLoading(true);
          const res = await fetch("http://localhost:3000/api/events/celebration-bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsedRows)
          });

          if (res.ok) {
            const data = await res.json();
            let msg = `${data.imported || 0} Celebration Events imported successfully.`;
            if (data.skipped > 0) {
              msg += ` (${data.skipped} duplicates skipped)`;
            }
            if (data.invalidCount > 0) {
              msg += ` (${data.invalidCount} invalid rows skipped)`;
            }
            alert(msg);
            fetchEvents();
          } else {
            const errData = await res.json().catch(() => ({}));
            alert(`Failed to upload celebration events: ${errData.message || "Unknown error"}`);
          }
        } catch (error) {
          console.error(error);
          alert("Error uploading celebration events");
        } finally {
          setLoading(false);
        }
      },
    });
    e.target.value = "";
  };

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEventData, setNewEventData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    facultyName: "Dr. Rajesh Gopal",
    facultyEmail: "",
    department: "CSE",
    category: "Workshop",
    venue: "Main Auditorium",
    message: "You are assigned as the coordinating faculty for this upcoming event. Please review all schedule details and prepare necessary arrangements.",
    autoReminder: false,
  });

  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    if (!newEventData.title || !newEventData.date) {
      alert("Please provide an event title and date.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEventData),
      });

      if (res.ok) {
        alert("Event created successfully!");
        setIsCreateOpen(false);
        setNewEventData({
          title: "",
          date: new Date().toISOString().split("T")[0],
          time: "10:00 AM",
          facultyName: "Dr. Rajesh Gopal",
          facultyEmail: "",
          department: "CSE",
          category: "Workshop",
          venue: "Main Auditorium",
          message: "You are assigned as the coordinating faculty for this upcoming event. Please review all schedule details and prepare necessary arrangements.",
          autoReminder: false,
        });
        fetchEvents();
      } else {
        const errorRes = await res.json().catch(() => ({}));
        alert(`Failed to create event: ${errorRes.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error creating event");
    } finally {
      setLoading(false);
    }
  };

  const currentViewMonth = currentDate.getMonth();
  const currentViewYear = currentDate.getFullYear();

  // Helper to extract year and 0-indexed month safely without timezone offset shift
  const getEventMonthAndYear = (rawDate, startDate) => {
    if (typeof rawDate === "string") {
      const dateOnly = rawDate.split("T")[0];
      const parts = dateOnly.split("-");
      if (parts.length >= 2) {
        return {
          year: parseInt(parts[0], 10),
          month: parseInt(parts[1], 10) - 1,
        };
      }
    }
    const d = startDate ? new Date(startDate) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  };

  // Filter events so ONLY events belonging to the currently displayed month & year are rendered
  const visibleEvents = events.filter((event) => {
    const { month, year } = getEventMonthAndYear(event.rawDate, event.start);
    return month === currentViewMonth && year === currentViewYear;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-100 p-6 space-y-6">

      {/* 📤 Upload & Create Actions */}
      <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/30 hover:shadow-2xl transition flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-blue-700 mb-1">
            Faculty Event Scheduler
          </h2>
          <p className="text-xs text-gray-500">Create scheduled events, assign faculty members, and configure email reminders.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow transition flex items-center gap-2 text-sm"
          >
            <span>➕</span> Create New Event
          </button>

          <label className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl shadow-sm transition cursor-pointer text-sm flex items-center gap-2">
            <span>📤</span> Upload CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={loading}
            />
          </label>

          <label className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold rounded-xl shadow transition cursor-pointer text-sm flex items-center gap-2">
            <span>🎉</span> Upload Celebration CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleCelebrationFileUpload}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>
      </div>

      {/* ➕ Create Event Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              &times;
            </button>

            <h3 className="text-xl font-extrabold text-gray-800 mb-4 flex items-center gap-2">
              <span>📅</span> Schedule New Event
            </h3>

            <form onSubmit={handleCreateEventSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Innovation & Startup Workshop"
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newEventData.title}
                  onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newEventData.date}
                    onChange={(e) => setNewEventData({ ...newEventData, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Event Start Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00 AM"
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newEventData.time}
                    onChange={(e) => setNewEventData({ ...newEventData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Faculty Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rajesh Gopal"
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newEventData.facultyName}
                    onChange={(e) => setNewEventData({ ...newEventData, facultyName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Faculty Gmail Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. faculty@cmrit.ac.in"
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newEventData.facultyEmail}
                    onChange={(e) => setNewEventData({ ...newEventData, facultyEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                  <select
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={newEventData.department}
                    onChange={(e) => setNewEventData({ ...newEventData, department: e.target.value })}
                  >
                    <option value="CSE">CSE</option>
                    <option value="ISE">ISE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="MBA">MBA</option>
                    <option value="BS-Phy">BS-Phy</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category / Type</label>
                  <select
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={newEventData.category}
                    onChange={(e) => setNewEventData({ ...newEventData, category: e.target.value })}
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Boot Camp">Boot Camp</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Expert Talk">Expert Talk</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Auditorium"
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newEventData.venue}
                    onChange={(e) => setNewEventData({ ...newEventData, venue: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Personalized Reminder Note / Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe event objectives, responsibilities, or specific instructions for this day..."
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newEventData.message}
                  onChange={(e) => setNewEventData({ ...newEventData, message: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border">
                <div>
                  <p className="font-semibold text-gray-800 text-xs">Enable Auto Reminder</p>
                  <p className="text-[11px] text-gray-500">Automatically trigger automated email 3 days before event.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={newEventData.autoReminder}
                    onChange={(e) => setNewEventData({ ...newEventData, autoReminder: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🎯 Month + Year Controls */}
      <div className="flex gap-4 justify-end">
        <select
          className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur border shadow hover:shadow-md outline-none font-semibold text-gray-700"
          value={currentDate.getMonth()}
          onChange={(e) => {
            const newDate = new Date(currentDate.getFullYear(), parseInt(e.target.value), 1);
            setCurrentDate(newDate);
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i}>
              {new Date(2026, i, 1).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur border shadow hover:shadow-md outline-none font-semibold text-gray-700"
          value={currentDate.getFullYear()}
          onChange={(e) => {
            const newDate = new Date(parseInt(e.target.value), currentDate.getMonth(), 1);
            setCurrentDate(newDate);
          }}
        >
          {[2024, 2025, 2026, 2027, 2028].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* 📅 Calendar */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/30 relative">
        <FullCalendar
          key={`${currentViewYear}-${currentViewMonth}`}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={currentDate}
          datesSet={(dateInfo) => {
            const viewStart = dateInfo.view.currentStart;
            if (
              viewStart.getMonth() !== currentDate.getMonth() ||
              viewStart.getFullYear() !== currentDate.getFullYear()
            ) {
              setCurrentDate(new Date(viewStart.getFullYear(), viewStart.getMonth(), 1));
            }
          }}
          events={visibleEvents}
          height="auto"
          eventDidMount={(info) => {
            const bg = info.event.backgroundColor || "#0f172a";
            const el = info.el;
            el.style.setProperty("background-color", bg, "important");
            el.style.setProperty("border-color", bg, "important");
            el.style.setProperty("color", "#ffffff", "important");
            const main = el.querySelector(".fc-event-main");
            if (main) {
              main.style.setProperty("background-color", "transparent", "important");
              main.style.setProperty("color", "#ffffff", "important");
            }
          }}
          eventContent={(eventInfo) => {
            const bg = eventInfo.backgroundColor || eventInfo.event.backgroundColor || "#0f172a";
            const { autoReminder, reminderSent, isCelebration, status, level } = eventInfo.event.extendedProps;
            const isCelebrationType = isCelebration || eventInfo.event.extendedProps.category === "Celebration Event";

            if (isCelebrationType) {
              const statusText = status || "Active";
              const levelText = level || "";
              return (
                <div
                  className="w-full min-h-full px-2 py-2 rounded-md text-white cursor-pointer hover:opacity-90 transition relative group shadow-sm"
                  style={{ backgroundColor: bg, color: "#ffffff" }}
                >
                  <div className="text-[12px] font-extrabold flex justify-between items-start gap-1 pr-6 leading-snug">
                    <span className="line-clamp-2">🎉 {eventInfo.event.title}</span>
                  </div>
                  <div className="text-[10px] opacity-95 mt-1 font-medium leading-tight">
                    Status: {statusText}
                  </div>
                  {levelText && (
                    <div className="text-[10px] opacity-95 font-medium leading-tight mt-0.5">
                      Level: {levelText}
                    </div>
                  )}

                  {/* 🗑️ Delete Button */}
                  <button
                    type="button"
                    title="Delete Event"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEvent(eventInfo.event.id, eventInfo.event.title);
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-700 text-white rounded text-[11px] opacity-80 group-hover:opacity-100 transition shadow-sm"
                  >
                    🗑️
                  </button>
                </div>
              );
            }

            const eventMonth = new Date(eventInfo.event.start).getMonth();
            const isJuneOrJuly = eventMonth === 5 || eventMonth === 6;

            let indicator = null;
            if (isJuneOrJuly) {
              if (reminderSent) indicator = "✅";
              else if (autoReminder) indicator = "🟢";
              else indicator = "🔴";
            } else if (reminderSent || autoReminder) {
              indicator = reminderSent ? "✅" : "🟢";
            }

            return (
              <div
                className="w-full min-h-full px-2 py-2 rounded-md text-white cursor-pointer hover:opacity-90 transition relative group"
                style={{ backgroundColor: bg, color: "#ffffff" }}
              >
                <div className="text-[12px] font-bold flex justify-between items-start gap-1 pr-6">
                  <span className="line-clamp-2 leading-tight">{eventInfo.event.title}</span>
                  {indicator && (
                    <span className="text-xs shrink-0" title={reminderSent ? "Sent" : autoReminder ? "Enabled" : "Disabled"}>{indicator}</span>
                  )}
                </div>
                <div className="text-[10px] truncate opacity-95 mt-1">
                  {eventInfo.event.extendedProps.department}
                </div>
                <div className="flex items-center justify-between gap-1 mt-1 text-[11px] truncate opacity-95">
                  <div className="flex items-center gap-1 truncate">
                    <span className="text-lg shrink-0">👨‍🏫</span>
                    <span className="truncate">{eventInfo.event.extendedProps.faculty}</span>
                  </div>
                </div>

                {/* 🗑️ Delete Button */}
                <button
                  type="button"
                  title="Delete Event"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEvent(eventInfo.event.id, eventInfo.event.title);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-700 text-white rounded text-[11px] opacity-80 group-hover:opacity-100 transition shadow-sm"
                >
                  🗑️
                </button>
              </div>
            );
          }}
          eventClick={(info) => {
            const event = info.event;
            setSelectedEvent({
              id: event.id,
              title: event.title,
              start: event.startStr,
              ...event.extendedProps,
            });
          }}
        />
      </div>

      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
          onUpdate={fetchEvents}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}

export default CalendarView;