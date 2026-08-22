import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";

function EventDetailModal({ event, isOpen, onClose, onUpdate }) {
  const { memberToken } = useAuth();
  const [reportLink, setReportLink] = useState(event?.reportLink || "");
  const [collegePhoto, setCollegePhoto] = useState(event?.collegePhoto || "");
  const [eventPhoto, setEventPhoto] = useState(event?.eventPhoto || "");
  
  const [savingLink, setSavingLink] = useState(false);
  const [uploadingCollege, setUploadingCollege] = useState(false);
  const [uploadingEvent, setUploadingEvent] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (event) {
      setReportLink(event.reportLink || "");
      setCollegePhoto(event.collegePhoto || "");
      setEventPhoto(event.eventPhoto || "");
      setMsg({ type: "", text: "" });
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleSaveReportLink = async (e) => {
    e.preventDefault();
    setSavingLink(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await fetch(`${API_BASE_URL}/api/members/events/${event._id}/report-link`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${memberToken}`
        },
        body: JSON.stringify({ reportLink })
      });

      const data = await res.json();
      if (res.ok) {
        setMsg({ type: "success", text: "Report link saved successfully!" });
        onUpdate();
      } else {
        setMsg({ type: "error", text: data.message || "Failed to update report link." });
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "Network error saving report link." });
    } finally {
      setSavingLink(false);
    }
  };

  const handlePhotoUpload = async (file, photoType) => {
    if (!file) return;

    if (photoType === "collegePhoto") setUploadingCollege(true);
    else setUploadingEvent(true);

    setMsg({ type: "", text: "" });

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("photoType", photoType);

    try {
      const res = await fetch(`${API_BASE_URL}/api/members/events/${event._id}/upload-photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${memberToken}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        if (photoType === "collegePhoto") setCollegePhoto(data.fileUrl);
        else setEventPhoto(data.fileUrl);

        setMsg({ type: "success", text: `${photoType === "collegePhoto" ? "College Photo" : "Primary Event Photo"} uploaded successfully!` });
        onUpdate();
      } else {
        setMsg({ type: "error", text: data.message || "Failed to upload photo." });
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "Network error uploading photo." });
    } finally {
      if (photoType === "collegePhoto") setUploadingCollege(false);
      else setUploadingEvent(false);
    }
  };

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[92vh] overflow-y-auto my-6 border">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
        >
          &times;
        </button>

        {/* Title & Badge */}
        <div className="border-b pb-4 mb-5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
              {event.activityType || event.category || "IIC Event"}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              String(event.status).toUpperCase() === "COMPLETED"
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}>
              {event.status || "COMPLETED"}
            </span>
            {event.source === "SELF_DRIVEN" && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                Self Driven
              </span>
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 leading-snug">{event.title}</h2>
        </div>

        {msg.text && (
          <div className={`p-3 rounded-lg text-xs font-semibold mb-4 ${
            msg.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {msg.text}
          </div>
        )}

        {/* 1. Basic Information Table */}
        <div className="bg-gray-50 rounded-xl p-4 border mb-6 space-y-3">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 text-xs font-semibold block">Faculty Member</span>
              <span className="text-gray-900 font-bold">{event.facultyName}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs font-semibold block">Department</span>
              <span className="text-gray-900 font-bold">{event.department}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs font-semibold block">Event Type</span>
              <span className="text-gray-900 font-bold">{event.activityType || event.category}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs font-semibold block">Scheduled Date</span>
              <span className="text-gray-900 font-bold">{formattedDate}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs font-semibold block">Venue</span>
              <span className="text-gray-900 font-bold">{event.venue || "CMRIT Campus"}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs font-semibold block">Status</span>
              <span className="text-gray-900 font-bold">{event.status}</span>
            </div>
          </div>
        </div>

        {/* 2. Documentation & Report Link */}
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mb-6 space-y-3">
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
            <span>📄</span> Event Report
          </h3>

          <form onSubmit={handleSaveReportLink} className="space-y-2">
            <label className="block text-xs font-bold text-gray-700">Add / Edit Report Link</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://drive.google.com/file/... or https://..."
                className="w-full border px-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                value={reportLink}
                onChange={(e) => setReportLink(e.target.value)}
              />
              <button
                type="submit"
                disabled={savingLink}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shadow disabled:opacity-50 shrink-0"
              >
                {savingLink ? "Saving..." : "Save Link"}
              </button>
            </div>
          </form>

          {event.reportLink ? (
            <div className="pt-2 flex items-center gap-2">
              <span className="text-xs text-gray-600 font-medium">Status:</span>
              <a
                href={event.reportLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shadow"
              >
                <span>🔗</span> View Report ↗
              </a>
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No report link added yet.</p>
          )}
        </div>

        {/* 3. Photo Documentation Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* College Photo Section */}
          <div className="bg-gray-50 rounded-xl p-4 border flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>🏛️</span> College Photo
              </h4>
              <p className="text-[11px] text-gray-500 mb-3">Upload relevant college/event photograph.</p>

              {collegePhoto ? (
                <div className="rounded-lg overflow-hidden border bg-white mb-3">
                  <img
                    src={collegePhoto}
                    alt="College Photo"
                    className="w-full h-36 object-cover"
                  />
                </div>
              ) : (
                <div className="h-36 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs mb-3 bg-white">
                  No College Photo
                </div>
              )}
            </div>

            <label className="block">
              <span className="w-full px-3 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-lg text-xs transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5 text-center">
                <span>📷</span> {uploadingCollege ? "Uploading..." : collegePhoto ? "Replace College Photo" : "Upload College Photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingCollege}
                onChange={(e) => handlePhotoUpload(e.target.files[0], "collegePhoto")}
              />
            </label>
          </div>

          {/* Primary Event Photo Section */}
          <div className="bg-gray-50 rounded-xl p-4 border flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>📸</span> Primary Event Photo
              </h4>
              <p className="text-[11px] text-gray-500 mb-3">Upload 1 primary event photograph.</p>

              {eventPhoto ? (
                <div className="rounded-lg overflow-hidden border bg-white mb-3">
                  <img
                    src={eventPhoto}
                    alt="Primary Event Photo"
                    className="w-full h-36 object-cover"
                  />
                </div>
              ) : (
                <div className="h-36 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs mb-3 bg-white">
                  No Event Photo
                </div>
              )}
            </div>

            <label className="block">
              <span className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition shadow cursor-pointer flex items-center justify-center gap-1.5 text-center">
                <span>🖼️</span> {uploadingEvent ? "Uploading..." : eventPhoto ? "Replace Photo" : "Upload Photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingEvent}
                onChange={(e) => handlePhotoUpload(e.target.files[0], "eventPhoto")}
              />
            </label>
          </div>

        </div>

        {/* Action Controls */}
        <div className="mt-6 pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventDetailModal;
