import React, { useState } from "react";

function EventDetailsModal({ event, onClose, onUpdate }) {
  const [facultyEmail, setFacultyEmail] = useState(event.facultyEmail || "");
  const [eventTime, setEventTime] = useState(event.time || "10:00 AM");
  const [customMessage, setCustomMessage] = useState(
    event.message || "You are assigned as the coordinating faculty for this upcoming event. Please review all schedule details and prepare necessary arrangements."
  );
  const [autoReminder, setAutoReminder] = useState(event.autoReminder || false);
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/events/${event.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoReminder,
          facultyEmail,
          time: eventTime,
          message: customMessage,
        }),
      });
      if (res.ok) {
        alert("Settings updated successfully!");
        onUpdate();
        onClose();
      } else {
        alert("Failed to update settings.");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendManual = async () => {
    if (!facultyEmail) {
      alert("Please provide a faculty email address first.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/events/${event.id}/manual-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facultyEmail,
          time: eventTime,
          message: customMessage,
        }),
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok) {
        alert(resData.message || "Reminder email sent successfully!");
        onUpdate();
        onClose();
      } else {
        alert(`Failed to send reminder: ${resData.message || resData.error || "Check email configuration."}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error sending reminder.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header / Background Shape */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-2xl"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold z-10"
        >
          &times;
        </button>

        <div className="relative mt-6 bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wider">
              {event.extendedProps?.category || "Faculty Event"}
            </span>
            <h2 className="text-2xl font-extrabold text-gray-800 mt-1">{event.title}</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded-lg border">
            <div>
              <p className="text-gray-500 font-semibold text-xs">Event Date</p>
              <p className="text-gray-800 font-bold">📅 {new Date(event.start).toDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold text-xs">Venue</p>
              <p className="text-gray-800 font-bold">📍 {event.venue || "TBD"}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold text-xs">Department</p>
              <p className="text-gray-800 font-bold">🏢 {event.department}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold text-xs">Faculty Assigned</p>
              <p className="text-gray-800 font-bold">👤 {event.faculty || "Dr. Rajesh Gopal"}</p>
            </div>
          </div>

          <hr className="my-2 border-gray-200" />

          {/* Reminder Settings & Form Fields */}
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span>✉️</span> Configure & Send Reminder
          </h3>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Faculty Gmail Address *</label>
              <input 
                type="email" 
                placeholder="e.g. faculty@cmrit.ac.in"
                className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={facultyEmail}
                onChange={(e) => setFacultyEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Event Start Time *</label>
                <input 
                  type="text" 
                  placeholder="e.g. 10:00 AM"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Department</label>
                <input 
                  type="text" 
                  disabled
                  className="w-full border px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-600"
                  value={event.department || "General"}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Personalized Reminder Note *</label>
              <textarea 
                rows="3"
                placeholder="Write custom reminder instructions or session details..."
                className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border">
            <div>
              <p className="font-semibold text-sm text-gray-800">Auto Reminder</p>
              <p className="text-xs text-gray-500">Automatically dispatch email 3 days prior to event date.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={autoReminder}
                onChange={(e) => setAutoReminder(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 mt-2">
            <button 
              onClick={handleSendManual}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 rounded-xl transition shadow disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>📧</span> {loading ? "Sending Email..." : "Send Reminder Now"}
            </button>
            <button 
              onClick={handleSaveSettings}
              disabled={loading}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 rounded-xl transition shadow-sm disabled:opacity-50 text-sm"
            >
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>

          <div className="text-center mt-1">
            {event.reminderSent ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                ✅ Reminder already sent
              </span>
            ) : autoReminder ? (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                🟢 Auto-Reminder enabled (Pending)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
                🔴 No reminder scheduled
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailsModal;
