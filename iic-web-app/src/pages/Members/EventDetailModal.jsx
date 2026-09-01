import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";

function EventDetailModal({
  event,
  isOpen,
  onClose,
  onUpdate,
}) {
  const { memberToken } = useAuth();

  /*
  ============================================================
  STATE
  ============================================================
  */

  const [reportLink, setReportLink] = useState(
    event?.reportLink || ""
  );

  const [posterLink, setPosterLink] = useState(
    event?.posterLink || ""
  );

  const [videoLink, setVideoLink] = useState(
    event?.videoLink || ""
  );

  const [photos, setPhotos] = useState(
    event?.photos || []
  );

  const [selectedReport, setSelectedReport] =
    useState(null);

  const [saving, setSaving] = useState(false);

  const [msg, setMsg] = useState({
    type: "",
    text: "",
  });

  /*
  ============================================================
  UPDATE STATE WHEN EVENT CHANGES
  ============================================================
  */

  useEffect(() => {
    if (event) {
      setReportLink(event.reportLink || "");

      setPosterLink(event.posterLink || "");

      setVideoLink(event.videoLink || "");

      setPhotos(
        Array.isArray(event.photos)
          ? event.photos
          : []
      );

      setSelectedReport(null);

      setMsg({
        type: "",
        text: "",
      });
    }
  }, [event]);

  /*
  ============================================================
  STOP IF MODAL CLOSED
  ============================================================
  */

  if (!isOpen || !event) {
    return null;
  }

  /*
  ============================================================
  UPLOAD REPORT + SAVE MEDIA
  ============================================================
  */

  const handleSaveMedia = async (e) => {
    e.preventDefault();

    setSaving(true);

    setMsg({
      type: "",
      text: "",
    });

    try {
      const formData = new FormData();

      if (selectedReport) {
        formData.append("report", selectedReport);
      }

      formData.append("videoLink", videoLink);
      formData.append("posterLink", posterLink);

      const res = await fetch(
        `${API_BASE_URL}/api/events/${event._id}/media`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${memberToken}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to save event media."
        );
      }

      /*
      --------------------------------------------------------
      UPDATE LOCAL UI IMMEDIATELY
      --------------------------------------------------------
      */

      if (data.event) {
        setReportLink(
          data.event.reportLink || ""
        );

        setPosterLink(
          data.event.posterLink || ""
        );

        setVideoLink(
          data.event.videoLink || ""
        );

        setPhotos(
          Array.isArray(data.event.photos)
            ? data.event.photos
            : []
        );
      }

      setSelectedReport(null);

      setMsg({
        type: "success",
        text:
          "Report uploaded and media extracted successfully!",
      });

      /*
      --------------------------------------------------------
      REFRESH PARENT EVENT DATA
      --------------------------------------------------------
      */

      if (onUpdate) {
        await onUpdate();
      }
    } catch (error) {
      console.error(
        "Save Event Media Error:",
        error
      );

      setMsg({
        type: "error",
        text:
          error.message ||
          "Failed to save event media.",
      });
    } finally {
      setSaving(false);
    }
  };

  /*
  ============================================================
  FILE SELECT HANDLER
  ============================================================
  */

  const handleReportSelection = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setMsg({
        type: "error",
        text:
          "Please select a PDF file.",
      });

      e.target.value = "";

      return;
    }

    setSelectedReport(file);

    setMsg({
      type: "",
      text: "",
    });
  };

  /*
  ============================================================
  REMOVE SELECTED PDF
  ============================================================
  */

  const removeSelectedReport = () => {
    setSelectedReport(null);
  };

  /*
  ============================================================
  FORMATTED DATE
  ============================================================
  */

  const formattedDate = new Date(
    event.date
  ).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  /*
  ============================================================
  NORMALIZE IMAGE URL
  ============================================================
  */

  const getImageUrl = (url) => {
    if (!url) {
      return "";
    }

    /*
    ----------------------------------------------------------
    Already a complete URL
    ----------------------------------------------------------
    */

    if (
      url.startsWith("http://") ||
      url.startsWith("https://")
    ) {
      return url;
    }

    /*
    ----------------------------------------------------------
    Backend relative URL
    ----------------------------------------------------------
    */

    return `http://localhost:3000${
      url.startsWith("/")
        ? url
        : `/${url}`
    }`;
  };

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative max-h-[92vh] overflow-y-auto my-6 border">

        {/* ================================================== */}
        {/* CLOSE BUTTON */}
        {/* ================================================== */}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
        >
          &times;
        </button>

        {/* ================================================== */}
        {/* TITLE */}
        {/* ================================================== */}

        <div className="border-b pb-4 mb-5 pr-8">

          <div className="flex flex-wrap items-center gap-2 mb-2">

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
              {event.activityType ||
                event.category ||
                "IIC Event"}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                String(event.status).toUpperCase() ===
                "COMPLETED"
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {event.status || "UPCOMING"}
            </span>

            {event.source ===
              "SELF_DRIVEN" && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                Self Driven
              </span>
            )}
          </div>

          <h2 className="text-2xl font-extrabold text-gray-800 leading-snug">
            {event.title}
          </h2>
        </div>

        {/* ================================================== */}
        {/* MESSAGE */}
        {/* ================================================== */}

        {msg.text && (
          <div
            className={`p-3 rounded-lg text-xs font-semibold mb-4 ${
              msg.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* ================================================== */}
        {/* BASIC INFORMATION */}
        {/* ================================================== */}

        <div className="bg-gray-50 rounded-xl p-4 border mb-6 space-y-3">

          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

            <div>
              <span className="text-gray-500 text-xs font-semibold block">
                Faculty Member
              </span>

              <span className="text-gray-900 font-bold">
                {event.facultyName ||
                  "Unknown"}
              </span>
            </div>

            <div>
              <span className="text-gray-500 text-xs font-semibold block">
                Department
              </span>

              <span className="text-gray-900 font-bold">
                {event.department ||
                  "N/A"}
              </span>
            </div>

            <div>
              <span className="text-gray-500 text-xs font-semibold block">
                Event Type
              </span>

              <span className="text-gray-900 font-bold">
                {event.activityType ||
                  event.category ||
                  "IIC"}
              </span>
            </div>

            <div>
              <span className="text-gray-500 text-xs font-semibold block">
                Scheduled Date
              </span>

              <span className="text-gray-900 font-bold">
                {formattedDate}
              </span>
            </div>

            <div>
              <span className="text-gray-500 text-xs font-semibold block">
                Venue
              </span>

              <span className="text-gray-900 font-bold">
                {event.venue ||
                  "CMRIT Campus"}
              </span>
            </div>

            <div>
              <span className="text-gray-500 text-xs font-semibold block">
                Status
              </span>

              <span className="text-gray-900 font-bold">
                {event.status ||
                  "UPCOMING"}
              </span>
            </div>

          </div>
        </div>

        {/* ================================================== */}
        {/* EVENT REPORT & MEDIA */}
        {/* ================================================== */}

        <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 mb-6">

          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2 mb-5">
            <span>📁</span>
            Event Report & Media
          </h3>

          <form
            onSubmit={handleSaveMedia}
            className="space-y-6"
          >

            {/* ============================================== */}
            {/* UPLOAD REPORT */}
            {/* ============================================== */}

            <div>

              <label className="block text-xs font-bold text-gray-700 mb-2">
                📄 Upload Report
              </label>

              <label className="block cursor-pointer">

                <div className="border-2 border-dashed border-blue-300 rounded-xl bg-white hover:bg-blue-50 transition p-5 text-center">

                  <div className="text-3xl mb-2">
                    📄
                  </div>

                  <div className="text-sm font-bold text-gray-700">
                    {selectedReport
                      ? "PDF selected"
                      : "Choose Event Report PDF"}
                  </div>

                  <div className="text-[11px] text-gray-500 mt-1">
                    The backend will automatically extract the poster and event photographs.
                  </div>

                </div>

                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  disabled={saving}
                  onChange={
                    handleReportSelection
                  }
                />

              </label>

              {/* SELECTED FILE */}

              {selectedReport && (
                <div className="mt-3 flex items-center justify-between bg-white border rounded-lg px-3 py-2">

                  <div className="flex items-center gap-2 min-w-0">

                    <span>
                      📄
                    </span>

                    <span className="text-xs font-semibold text-gray-700 truncate">
                      {selectedReport.name}
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={
                      removeSelectedReport
                    }
                    className="text-red-500 hover:text-red-700 text-xs font-bold ml-3"
                  >
                    Remove
                  </button>

                </div>
              )}

              {/* EXISTING REPORT */}

              {reportLink && (
                <div className="mt-3">

                  <a
                    href={getImageUrl(
                      reportLink
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow"
                  >
                    📄 View Uploaded Report ↗
                  </a>

                </div>
              )}

            </div>

            {/* ============================================== */}
            {/* POSTER */}
            {/* ============================================== */}

            <div>

              <label className="block text-xs font-bold text-gray-700 mb-2">
                🖼️ Poster
              </label>

              {posterLink ? (

                <div className="bg-white border rounded-xl p-3">

                  <div className="rounded-lg overflow-hidden border bg-gray-100">

                    <img
                      src={getImageUrl(
                        posterLink
                      )}
                      alt="Event Poster"
                      className="w-full max-h-[420px] object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />

                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">

                    <span className="text-[11px] text-green-700 font-bold">
                      ✓ Poster extracted from report
                    </span>

                    <a
                      href={getImageUrl(
                        posterLink
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                    >
                      Open ↗
                    </a>

                  </div>

                </div>

              ) : (

                <div className="h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-white">

                  <span className="text-4xl mb-2">
                    🖼️
                  </span>

                  <span className="text-xs">
                    Poster will appear here after uploading the report
                  </span>

                </div>

              )}

            </div>

            {/* ============================================== */}
            {/* MANUAL POSTER LINK */}
            {/* ============================================== */}

            <div>

              <label className="block text-xs font-bold text-gray-700 mb-2">
                🖼️ Poster Link
              </label>

              <input
                type="url"
                placeholder="https://... poster image URL"
                value={posterLink}
                onChange={(e) =>
                  setPosterLink(
                    e.target.value
                  )
                }
                className="w-full border px-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none bg-white"
              />

              <p className="text-[10px] text-gray-500 mt-1">
                If a report is uploaded, the automatically extracted poster will replace this value.
              </p>

            </div>

            {/* ============================================== */}
            {/* VIDEO LINK */}
            {/* ============================================== */}

            <div>

              <label className="block text-xs font-bold text-gray-700 mb-2">
                🎥 Event Video Link
              </label>

              <input
                type="url"
                placeholder="https://youtube.com/... or https://..."
                value={videoLink}
                onChange={(e) =>
                  setVideoLink(
                    e.target.value
                  )
                }
                className="w-full border px-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none bg-white"
              />

            </div>

            {/* ============================================== */}
            {/* EVENT PHOTOS */}
            {/* ============================================== */}

            <div>

              <div className="flex items-center justify-between mb-3">

                <label className="block text-xs font-bold text-gray-700">
                  📷 Event Photos
                </label>

                {photos.length > 0 && (
                  <span className="text-[10px] font-bold text-green-700">
                    {photos.length} photo
                    {photos.length !== 1
                      ? "s"
                      : ""} extracted
                  </span>
                )}

              </div>

              {photos.length > 0 ? (

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                  {photos.map(
                    (photo, index) => {
                      const imageUrl =
                        getImageUrl(
                          photo
                        );

                      return (
                        <div
                          key={`${photo}-${index}`}
                          className="group relative bg-white rounded-lg overflow-hidden border shadow-sm"
                        >

                          <img
                            src={imageUrl}
                            alt={`Event Photo ${
                              index + 1
                            }`}
                            className="w-full h-40 object-cover"
                            onError={(
                              e
                            ) => {
                              e.currentTarget.style.display =
                                "none";
                            }}
                          />

                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-semibold px-2 py-1 opacity-0 group-hover:opacity-100 transition">
                            Event Photo{" "}
                            {index + 1}
                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              ) : (

                <div className="h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-white">

                  <span className="text-3xl mb-2">
                    📷
                  </span>

                  <span className="text-xs">
                    Event photos will appear here after uploading the report
                  </span>

                </div>

              )}

            </div>

            {/* ============================================== */}
            {/* SAVE BUTTON */}
            {/* ============================================== */}

            <button
              type="submit"
              disabled={
                saving ||
                !selectedReport
              }
              className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? "Extracting Report Media..."
                : "💾 Save Report & Media"}
            </button>

            {/* ============================================== */}
            {/* COMPLETED */}
            {/* ============================================== */}

            {event.status &&
              String(
                event.status
              ).toUpperCase() ===
                "COMPLETED" && (
                <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg py-2 text-xs font-bold">
                  ✔ Activity Completed
                </div>
              )}

          </form>

        </div>

        {/* ================================================== */}
        {/* CLOSE */}
        {/* ================================================== */}

        <div className="pt-4 border-t flex justify-end">

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