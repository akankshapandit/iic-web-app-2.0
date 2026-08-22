import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";

function CreateSelfDrivenModal({ isOpen, onClose, onCreated }) {
  const { memberUser, memberToken } = useAuth();

  const facultyName = memberUser?.facultyName || memberUser?.name || "Faculty Member";
  const facultyDept = memberUser?.department || "N/A";

  const [formData, setFormData] = useState({
    title: "",
    department: facultyDept,
    activityType: "Self Driven",
    status: "COMPLETED",
    date: new Date().toISOString().split("T")[0],
    venue: "CMRIT Campus",
    time: "10:00 AM",
    message: "",
    reportLink: ""
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.title || !formData.date) {
      setErrorMsg("Please provide an event title and date.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/members/events/self-driven`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${memberToken}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        onCreated();
        onClose();
        setFormData({
          title: "",
          department: facultyDept,
          activityType: "Self Driven",
          status: "COMPLETED",
          date: new Date().toISOString().split("T")[0],
          venue: "CMRIT Campus",
          time: "10:00 AM",
          message: "",
          reportLink: ""
        });
      } else {
        setErrorMsg(data.message || "Failed to create self-driven event.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error creating self-driven event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>

        <div className="border-b pb-3 mb-4">
          <h2 className="text-xl font-extrabold text-purple-800 flex items-center gap-2">
            <span>✨</span> Add Self-Driven Event
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Log a new self-driven initiative or activity under your faculty account.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-semibold mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Faculty Name</label>
              <input
                type="text"
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 font-bold text-gray-700 text-xs"
                value={facultyName}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Department *</label>
              <input
                type="text"
                required
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-xs"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Type of Activity</label>
              <input
                type="text"
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-purple-50 text-purple-900 font-bold text-xs"
                value="Self Driven"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Status *</label>
              <select
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-xs bg-white"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="COMPLETED">COMPLETED</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Event Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Workshop on Hands-on IoT & Sensor Interfacing"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-xs"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Event Date *</label>
              <input
                type="date"
                required
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-xs"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Venue</label>
              <input
                type="text"
                placeholder="e.g. Lab 4 / Seminar Hall"
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-xs"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Report Link (Optional)</label>
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-xs"
              value={formData.reportLink}
              onChange={(e) => setFormData({ ...formData, reportLink: e.target.value })}
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs shadow disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateSelfDrivenModal;
