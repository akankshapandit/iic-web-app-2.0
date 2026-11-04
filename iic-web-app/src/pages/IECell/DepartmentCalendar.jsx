import { useState, useEffect } from "react";

function DepartmentCalendar({ activities: propActivities = [], onSelectDate }) {
  const today = new Date();
  const department = localStorage.getItem("department");

  const [activities, setActivities] = useState(propActivities);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (propActivities && propActivities.length > 0) {
      setActivities(propActivities);
    }
  }, [propActivities]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push(i);
  }

  const getActivitiesForDate = (day) => {
    return activities.filter((activity) => {
      if (!activity.date) return false;

      if (typeof activity.date === "string" && activity.date.includes(" ")) {
        const parts = activity.date.trim().split(" ");
        if (parts.length >= 3) {
          const d = parseInt(parts[0], 10);
          const mStr = parts[1].substring(0, 3).toLowerCase();
          const y = parseInt(parts[2], 10);

          const monthsLower = [
            "jan", "feb", "mar", "apr", "may", "jun",
            "jul", "aug", "sep", "oct", "nov", "dec"
          ];
          const monthIndex = monthsLower.indexOf(mStr);

          return d === day && monthIndex === currentMonth && y === currentYear;
        }
      }

      const eventDate = new Date(activity.date);
      if (isNaN(eventDate.getTime())) return false;

      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear
      );
    });
  };

  const handleDateClick = (day) => {
    const dayActivities = getActivitiesForDate(day);
    if (dayActivities.length > 0) {
      if (typeof onSelectDate === "function") {
        onSelectDate(dayActivities[0]);
      }
      setSelectedActivities(dayActivities);
      setSelectedDate(day);
    }
  };

  const handleMarkCompleted = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update event");
      window.location.reload();
    } catch (error) {
      console.error("Failed to mark event completed:", error);
      alert(error.message || "Failed to update event.");
    }
  };

  const handleMediaUpload = async (currentActivity, files, extractedForm) => {
    try {
      setUploading(true);
      let targetId = currentActivity?.id || currentActivity?._id || currentActivity?.activityId;

      if (!targetId || typeof targetId === "number" || !String(targetId).match(/^[0-9a-fA-F]{24}$/)) {
        const createRes = await fetch("http://localhost:3000/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: extractedForm.title || currentActivity?.title || "Untitled Activity",
            department: department || "N/A",
            date: currentActivity?.date || `${selectedDate} ${months[currentMonth]} ${currentYear}`,
            facultyName: extractedForm.facultyName || "Unknown",
            category: extractedForm.category || "Workshop",
            venue: extractedForm.venue || "TBD",
            status: "Completed",
            source: "CALENDAR",
          }),
        });
        const createdData = await createRes.json();
        if (!createRes.ok) throw new Error(createdData.message || "Failed to initialize event in database");
        targetId = createdData.event?._id || createdData._id;
      }

      const formData = new FormData();
      if (extractedForm) {
        if (extractedForm.category) formData.append("category", extractedForm.category);
        if (extractedForm.speakerDetails) formData.append("speakerDetails", extractedForm.speakerDetails);
        if (extractedForm.venue) formData.append("venue", extractedForm.venue);
        if (extractedForm.facultyName) formData.append("facultyName", extractedForm.facultyName);
      }

      if (files.report) formData.append("report", files.report);
      if (files.finalPdf) formData.append("finalPdf", files.finalPdf);
      if (files.poster) formData.append("poster", files.poster);
      if (files.photos && files.photos.length > 0) {
        files.photos.forEach((photo) => formData.append("photos", photo));
      }

      const response = await fetch(`http://localhost:3000/api/events/${targetId}/media`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Failed to upload media");

      alert("Report, media, and metadata saved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Media upload failed:", error);
      alert(error.message || "Failed to save report/media.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 relative">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => {
            if (currentMonth === 0) {
              setCurrentMonth(11);
              setCurrentYear(currentYear - 1);
            } else {
              setCurrentMonth(currentMonth - 1);
            }
          }}
          className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold"
        >
          ◀
        </button>

        <h3 className="text-2xl font-bold text-gray-800">
          {months[currentMonth]} {currentYear}
        </h3>

        <button
          onClick={() => {
            if (currentMonth === 11) {
              setCurrentMonth(0);
              setCurrentYear(currentYear + 1);
            } else {
              setCurrentMonth(currentMonth + 1);
            }
          }}
          className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold"
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-3 mb-3">
        {days.map((day) => (
          <div key={day} className="text-center bg-blue-50 rounded-xl py-3 font-bold text-blue-700">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3 mb-8">
        {cells.map((date, index) => {
          const dayActivities = date ? getActivitiesForDate(date) : [];

          return (
            <div
              key={index}
              onClick={() => date && handleDateClick(date)}
              className={`border rounded-2xl h-36 p-2 overflow-y-auto transition ${
                date ? "cursor-pointer hover:bg-blue-50 hover:shadow-lg" : "bg-gray-50"
              }`}
            >
              {date && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-700">{date}</span>
                    {dayActivities.length > 0 && (
                      <span
                        className={`w-3 h-3 rounded-full ${
                          dayActivities.every((a) => String(a.status || "").toLowerCase() === "completed")
                            ? "bg-green-500"
                            : "bg-orange-500"
                        }`}
                      />
                    )}
                  </div>

                  {dayActivities.map((activity) => {
                    const isCompleted = String(activity.status || "").toLowerCase() === "completed";
                    return (
                      <div
                        key={activity.id || activity._id}
                        className={`mb-2 rounded-lg px-2 py-1 text-[10px] font-semibold break-words ${
                          isCompleted ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {activity.title}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && selectedActivities.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Activity Details — {selectedDate} {months[currentMonth]} {currentYear}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage metadata and upload reports for this date</p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {selectedActivities.map((act) => (
                <ActivityMediaCard
                  key={act.id || act._id}
                  activity={act}
                  uploading={uploading}
                  onMarkCompleted={handleMarkCompleted}
                  onUploadMedia={(files, form) => handleMediaUpload(act, files, form)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityMediaCard({ activity = {}, uploading, onMarkCompleted, onUploadMedia }) {
  const [reportFile, setReportFile] = useState(null);
  const [finalPdfFile, setFinalPdfFile] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);

  const [formData, setFormData] = useState({
    title: activity?.title || "",
    venue: activity?.venue || "",
    facultyName: activity?.facultyName || activity?.faculty || activity?.coordinator || "",
    category: activity?.category || "Workshop",
    speakerDetails: activity?.speakerDetails || "",
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || "",
        venue: activity.venue || "",
        facultyName: activity.facultyName || activity.faculty || activity.coordinator || "",
        category: activity.category || "Workshop",
        speakerDetails: activity.speakerDetails || "",
      });

      // Load already saved photos from database record
      if (Array.isArray(activity.photos) && activity.photos.length > 0) {
        setPhotoFiles(activity.photos);
      }
    }
  }, [activity]);

  const handleReportUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReportFile(file);
    setIsExtracting(true);

    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const endpoint = isPdf 
      ? "http://localhost:3000/api/reports/extract-pdf" 
      : "http://localhost:3000/api/reports/extract-doc-media";

    const uploadPayload = new FormData();
    uploadPayload.append(isPdf ? "pdfFile" : "docFile", file);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: uploadPayload,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to extract content");

      if (data.extractedData) {
        setFormData((prev) => ({
          ...prev,
          venue: data.extractedData.venue || prev.venue,
          facultyName: data.extractedData.facultyName || data.extractedData.coordinator || prev.facultyName,
          category: data.extractedData.category || prev.category,
          speakerDetails: data.extractedData.speakerDetails || prev.speakerDetails,
        }));
      }

      if (data.images && data.images.length > 0) {
        const imageBase64s = data.images.map(img => img.base64 || img);
        setPhotoFiles((prev) => [...prev, ...imageBase64s]);
      }

      alert(`Successfully extracted ${data.images?.length || 0} images from the document!`);
    } catch (error) {
      console.error("[Extraction Error]:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    // Only filter files that are true browser File objects
    const newFilesOnly = photoFiles.filter(p => p instanceof File);

    onUploadMedia(
      {
        report: reportFile instanceof File ? reportFile : null,
        finalPdf: finalPdfFile instanceof File ? finalPdfFile : null,
        photos: newFilesOnly,
      },
      formData
    );
  };

  const activityId = activity?.id || activity?._id;

  return (
    <div className="border rounded-2xl p-5 mb-4 hover:shadow-md transition bg-white">
      <div className="flex justify-between items-start gap-4">
        <h3 className="text-xl font-bold text-gray-800">{formData.title}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
              String(activity?.status || "").toLowerCase() === "completed"
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {activity?.status || "Upcoming"}
          </span>
          {String(activity?.status || "").toLowerCase() !== "completed" && activityId && (
            <button
              onClick={() => onMarkCompleted(activityId)}
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-bold"
            >
              Mark Completed
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 border-t pt-6 space-y-5">
        <h4 className="text-lg font-bold text-gray-800">
          📁 Event Report, Media & Metadata
        </h4>
        
        <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200">
          <label className="block text-sm font-bold text-indigo-900 mb-1">
            📝 Upload Report Document (.docx or .pdf)
          </label>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleReportUpload}
            className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:font-semibold hover:file:bg-indigo-700 cursor-pointer"
          />
          {reportFile && (
            <p className="mt-2 text-xs text-indigo-800 font-medium">Selected Document: {reportFile.name}</p>
          )}
          {isExtracting && (
            <p className="mt-2 text-xs text-indigo-700 font-semibold animate-pulse">
              ⚡ Processing document and extracting details...
            </p>
          )}
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
          <label className="block text-sm font-bold text-emerald-900 mb-2">
            📄 Upload Final Signed / Compiled Report PDF
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFinalPdfFile(e.target.files?.[0] || null)}
            className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white file:font-semibold hover:file:bg-emerald-700 cursor-pointer"
          />
          {finalPdfFile && (
            <p className="mt-2 text-xs text-emerald-800 font-medium">Selected Report PDF: {finalPdfFile.name}</p>
          )}
        </div>

        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
          <label className="block text-sm font-bold text-amber-900 mb-2">
            🖼️ Extracted Images Preview 
          </label>
          {photoFiles.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {photoFiles.map((photo, idx) => {
                const imageSource = typeof photo === "string" 
                  ? photo 
                  : (photo?.base64 || photo?.url || "");

                const imgSrc = imageSource.startsWith("http") || imageSource.startsWith("data:") 
                  ? imageSource 
                  : (imageSource ? `http://localhost:3000${imageSource}` : URL.createObjectURL(photo));

                return (
                  <div key={idx} className="relative group border rounded-xl overflow-hidden aspect-square bg-white shadow-sm">
                    <img src={imgSrc} alt={`Extracted ${idx}`} className="w-full h-full object-cover" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border-2 border-dashed border-amber-300 rounded-xl p-4 text-center text-amber-700 text-xs font-medium bg-white/50">
              No extracted images available yet. Images extracted from your document will appear here.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Event Title</label>
            <input
              type="text"
              value={formData.title}
              disabled
              className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Faculty / Coordinator</label>
            <input
              type="text"
              value={formData.facultyName}
              onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
              className="w-full border rounded-xl p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Venue</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full border rounded-xl p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border rounded-xl p-2.5 text-sm"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={uploading || isExtracting}
          onClick={handleSave}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-md transition"
        >
          {uploading ? "Saving..." : "Save Media & Activity"}
        </button>
      </div>
    </div>
  );
}

export default DepartmentCalendar;