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

function CalendarView() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date("2025-09-01"));
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

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

      const formattedEvents = data.map((r) => ({
        id: r._id,
        title: r.title,
        start: new Date(r.date),
        extendedProps: {
          faculty: r.facultyName,
          facultyEmail: r.facultyEmail,
          department: r.department,
          status: r.status,
          venue: r.venue,
          autoReminder: r.autoReminder,
          reminderSent: r.reminderSent
        },
        backgroundColor: departmentColors[r.department || "N/A"],
        borderColor: departmentColors[r.department || "N/A"],
        textColor: "#ffffff",
      }));

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
          className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur border shadow hover:shadow-md outline-none"
          value={currentDate.getMonth()}
          onChange={(e) => {
            const newDate = new Date(currentDate);
            newDate.setMonth(parseInt(e.target.value));
            setCurrentDate(newDate);
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur border shadow hover:shadow-md outline-none"
          value={currentDate.getFullYear()}
          onChange={(e) => {
            const newDate = new Date(currentDate);
            newDate.setFullYear(parseInt(e.target.value));
            setCurrentDate(newDate);
          }}
        >
          {[2025, 2026, 2027].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* 📅 Calendar */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/30 relative">
        <FullCalendar
          key={currentDate.toISOString()}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={currentDate}
          events={events}
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
            const { autoReminder, reminderSent } = eventInfo.event.extendedProps;
            const eventMonth = new Date(eventInfo.event.start).getMonth();
            const isJuneOrJuly = eventMonth === 5 || eventMonth === 6;

            let indicator = null;
            if (isJuneOrJuly) {
              if (reminderSent) indicator = "✅";
              else if (autoReminder) indicator = "🟢";
              else indicator = "🔴";
            } else if (reminderSent || autoReminder) {
              // Still show green/check if they manually enabled it outside of June/July just in case
              indicator = reminderSent ? "✅" : "🟢";
            }

            return (
              <div
                className="w-full min-h-full px-2 py-2 rounded-md text-white cursor-pointer hover:opacity-90 transition"
                style={{ backgroundColor: bg, color: "#ffffff" }}
              >
                <div className="text-[12px] font-bold flex justify-between items-start gap-1">
                  <span className="line-clamp-2 leading-tight">{eventInfo.event.title}</span>
                  {indicator && (
                    <span className="text-xs shrink-0" title={reminderSent ? "Sent" : autoReminder ? "Enabled" : "Disabled"}>{indicator}</span>
                  )}
                </div>
                <div className="text-[10px] truncate opacity-95 mt-1">
                  {eventInfo.event.extendedProps.department}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[11px] truncate opacity-95">
                  <span className="text-lg shrink-0">👨‍🏫</span>
                  <span className="truncate">{eventInfo.event.extendedProps.faculty}</span>
                </div>
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
        />
      )}
    </div>
  );
}

export default CalendarView;