import { useState, useEffect } from "react";

function DepartmentCalendar() {
  const today = new Date();
  const department = localStorage.getItem("department");

  const [activities, setActivities] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [newActivity, setNewActivity] = useState({
    title: "",
    coordinator: "",
    date: "",
  });

  /* ============================================================
     FETCH EVENTS
  ============================================================ */
  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/events");

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const events = await response.json();

      const departmentEvents = events
        .filter((event) => {
          if (!department) return true;
          return (
            String(event.department || "")
              .trim()
              .toLowerCase() === String(department).trim().toLowerCase()
          );
        })
        .map((event) => ({
          id: event._id,
          title: event.title,
          coordinator: event.facultyName || "Not Assigned",
          department: event.department || department || "N/A",
          date: new Date(event.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          status: String(event.status || "UPCOMING").toUpperCase(),
          reportUploaded: !!event.reportLink,
          photos: Array.isArray(event.photos) ? event.photos : [],
          time: event.time || "",
          venue: event.venue || "",
          activityType: event.activityType || "IIC",
          category: event.category || "Workshop",
          level: event.level || "",
          message: event.message || "",
          speakerDetails: event.speakerDetails || "",
          source: event.source || "",
        }));

      setActivities(departmentEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [department]);

  /* ============================================================
     MONTH / CALENDAR DATA
  ============================================================ */
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const monthMap = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };

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
      const [d, month, year] = activity.date.split(" ");
      return (
        parseInt(d) === day &&
        monthMap[month] === currentMonth &&
        parseInt(year) === currentYear
      );
    });
  };

  const handleDateClick = (day) => {
    const dayActivities = getActivitiesForDate(day);
    if (dayActivities.length > 0) {
      setSelectedActivities(dayActivities);
      setSelectedDate(day);
      setShowModal(true);
    }
  };

  /* ============================================================
     MARK COMPLETED
  ============================================================ */
  const handleMarkCompleted = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update event");

      await fetchEvents();
      setSelectedActivities((prev) =>
        prev.map((activity) =>
          activity.id === id ? { ...activity, status: "COMPLETED" } : activity
        )
      );
    } catch (error) {
      console.error("Failed to mark event completed:", error);
      alert(error.message || "Failed to update event.");
    }
  };

  /* ============================================================
     SAVE MEDIA & METADATA
  ============================================================ */
  const handleMediaUpload = async (activityId, files, extractedForm) => {
    try {
      setUploading(true);
      const formData = new FormData();

      if (extractedForm) {
        if (extractedForm.venue) formData.append("venue", extractedForm.venue);
        if (extractedForm.coordinator) formData.append("facultyName", extractedForm.coordinator);
        if (extractedForm.category) formData.append("category", extractedForm.category);
        if (extractedForm.speakerDetails) formData.append("speakerDetails", extractedForm.speakerDetails);
      }

      if (files.report) formData.append("report", files.report);
      if (files.poster) formData.append("poster", files.poster);
      if (files.finalPdf) formData.append("finalPdf", files.finalPdf);
      if (files.photos && files.photos.length > 0) {
        files.photos.forEach((photo) => formData.append("photos", photo));
      }

      const response = await fetch(`http://localhost:3000/api/events/${activityId}/media`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to upload media");

      const updatedEvent = data.event;
      const updatedActivity = {
        id: updatedEvent._id,
        title: updatedEvent.title,
        coordinator: updatedEvent.facultyName || "Not Assigned",
        department: updatedEvent.department || department || "N/A",
        date: new Date(updatedEvent.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: String(updatedEvent.status || "UPCOMING").toUpperCase(),
        reportUploaded: !!updatedEvent.reportLink,
        photos: Array.isArray(updatedEvent.photos) ? updatedEvent.photos : [],
        time: updatedEvent.time || "",
        venue: updatedEvent.venue || "",
        activityType: updatedEvent.activityType || "IIC",
        category: updatedEvent.category || "Workshop",
        level: updatedEvent.level || "",
        message: updatedEvent.message || "",
        speakerDetails: updatedEvent.speakerDetails || "",
        source: updatedEvent.source || "",
      };

      setActivities((prev) =>
        prev.map((a) => (a.id === activityId ? updatedActivity : a))
      );
      setSelectedActivities((prev) =>
        prev.map((a) => (a.id === activityId ? updatedActivity : a))
      );

      alert("Report, media, and metadata saved successfully!");
    } catch (error) {
      console.error("Media upload failed:", error);
      alert(error.message || "Failed to save report/media.");
    } finally {
      setUploading(false);
    }
  };

  /* ============================================================
     ADD ACTIVITY
  ============================================================ */
  const handleAddActivity = async () => {
    if (!newActivity.title || !newActivity.coordinator || !newActivity.date) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newActivity.title,
          department: department,
          date: newActivity.date,
          facultyName: newActivity.coordinator,
          category: "Workshop",
          activityType: "IIC",
          status: "UPCOMING",
          source: "CALENDAR",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create event");

      setShowAddModal(false);
      setNewActivity({ title: "", coordinator: "", date: "" });
      await fetchEvents();
      alert("Activity added successfully!");
    } catch (error) {
      console.error("Failed to add activity:", error);
      alert(error.message || "Failed to save activity.");
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {months[currentMonth]} {currentYear}
          </h2>
          <p className="text-gray-500 mt-1">
            Click any highlighted date to view activity details & upload reports.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
        >
          + Add Activity
        </button>
      </div>

      {/* MONTH NAVIGATION */}
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
          className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
        >
          ◀
        </button>

        <h3 className="text-2xl font-bold">
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
          className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
        >
          ▶
        </button>
      </div>

      {/* WEEKDAYS */}
      <div className="grid grid-cols-7 gap-3 mb-3">
        {days.map((day) => (
          <div
            key={day}
            className="text-center bg-blue-50 rounded-xl py-3 font-bold text-blue-700"
          >
            {day}
          </div>
        ))}
      </div>

      {/* CALENDAR CELLS */}
      <div className="grid grid-cols-7 gap-3">
        {cells.map((date, index) => {
          const dayActivities = date ? getActivitiesForDate(date) : [];

          return (
            <div
              key={index}
              onClick={() => date && handleDateClick(date)}
              className={`border rounded-2xl h-36 p-2 overflow-y-auto transition ${
                date
                  ? "cursor-pointer hover:bg-blue-50 hover:shadow-lg"
                  : "bg-gray-50"
              }`}
            >
              {date && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-700">{date}</span>
                    {dayActivities.length > 0 && (
                      <span
                        className={`w-3 h-3 rounded-full ${
                          dayActivities.every((a) => a.status === "COMPLETED")
                            ? "bg-green-500"
                            : "bg-orange-500"
                        }`}
                      />
                    )}
                  </div>

                  {dayActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`mb-2 rounded-lg px-2 py-1 text-[10px] font-semibold break-words ${
                        activity.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {activity.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ACTIVITY DETAILS & UPLOAD MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Activity Details</h2>
                  <p className="text-blue-100 mt-1">
                    {selectedDate} {months[currentMonth]} {currentYear}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-white/20 hover:bg-white/30 rounded-full w-10 h-10 text-xl flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedActivities.map((activity) => (
                <ActivityMediaCard
                  key={activity.id}
                  activity={activity}
                  uploading={uploading}
                  onMarkCompleted={handleMarkCompleted}
                  onUploadMedia={handleMediaUpload}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD ACTIVITY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Add New Activity</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Activity Title"
                value={newActivity.title}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, title: e.target.value })
                }
                className="w-full border rounded-xl p-3"
              />
              <input
                type="text"
                placeholder="Coordinator"
                value={newActivity.coordinator}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, coordinator: e.target.value })
                }
                className="w-full border rounded-xl p-3"
              />
              <input
                type="date"
                value={newActivity.date}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, date: e.target.value })
                }
                className="w-full border rounded-xl p-3"
              />
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2 rounded-xl border hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddActivity}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-xl"
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   ACTIVITY MEDIA CARD (WITH SMART HEURISTIC POSTER SCORER)
================================================================ */
function ActivityMediaCard({ activity, uploading, onMarkCompleted, onUploadMedia }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [reportFile, setReportFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [finalPdfFile, setFinalPdfFile] = useState(null);
  
  const [formData, setFormData] = useState({
    title: activity.title || "",
    coordinator: activity.coordinator || "",
    venue: activity.venue || "",
    category: activity.category || "Workshop",
    speakerDetails: activity.speakerDetails || "",
  });

  // Sync state if activity prop updates externally
  useEffect(() => {
    setFormData({
      title: activity.title || "",
      coordinator: activity.coordinator || "",
      venue: activity.venue || "",
      category: activity.category || "Workshop",
      speakerDetails: activity.speakerDetails || "",
    });
  }, [activity]);

  const base64ToFile = (base64String, filename) => {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

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
        let rawSpeaker = data.extractedData.speakerDetails;
        let formattedSpeakerDetails = "";

        if (typeof rawSpeaker === "object" && rawSpeaker !== null) {
          if (rawSpeaker.name) {
            formattedSpeakerDetails = `${rawSpeaker.name}${rawSpeaker.designation ? `, ${rawSpeaker.designation}` : ""}${rawSpeaker.organization ? `, ${rawSpeaker.organization}` : ""}`;
          } else if (Array.isArray(rawSpeaker)) {
            formattedSpeakerDetails = rawSpeaker
              .map((s) => (typeof s === "object" ? `${s.name || ""}${s.designation ? `, ${s.designation}` : ""}` : s))
              .join("; ");
          } else {
            formattedSpeakerDetails = JSON.stringify(rawSpeaker);
          }
        } else {
          formattedSpeakerDetails = rawSpeaker || "";
        }

        // --- CLEAN & FILTER BOILERPLATE & EMPTY LABELS ---
        let lines = formattedSpeakerDetails.split("\n").map(l => l.trim()).filter(l => {
          const lower = l.toLowerCase();
          return (
            l.length > 0 &&
            !lower.includes("iic activity report") &&
            !lower.includes("title of the session") &&
            !lower.includes("institutional innovation council") &&
            !lower.includes("date with month & year") &&
            !(l.endsWith(":") && l.length < 30)
          );
        });

        let finalSpeakerText = lines.join("\n");

        setFormData((prev) => ({
          ...prev,
          venue: data.extractedData.venue || prev.venue,
          coordinator: data.extractedData.coordinator || prev.coordinator,
          category: data.extractedData.category || prev.category,
          speakerDetails: finalSpeakerText || prev.speakerDetails,
        }));
      }

      if (!isPdf && data.images && data.images.length > 0) {
        const imagePromises = data.images.map((img, index) => {
          return new Promise((resolve) => {
            const imageObj = new Image();
            imageObj.src = img.base64;
            imageObj.onload = () => {
              const width = imageObj.width;
              const height = imageObj.height;
              const aspectRatio = height / width;
              const area = width * height;

              // --- SMART HEURISTIC SCORING SYSTEM ---
              let score = 0;
              if (aspectRatio > 1.1) score += 40;
              if (aspectRatio > 1.3) score += 30; // Flyer proportion
              if (area > 50000) score += 20;
              if (area > 150000) score += 20;
              if (width > height) score -= 100; // Landscape penalty

              resolve({
                file: base64ToFile(img.base64, `extracted_image_${index + 1}.png`),
                width,
                height,
                score,
              });
            };
          });
        });

        const processedImages = await Promise.all(imagePromises);

        // Sort images by calculated score (highest score wins)
        processedImages.sort((a, b) => b.score - a.score);

        let posterCandidate = null;
        if (processedImages.length > 0 && processedImages[0].score > 0) {
          posterCandidate = processedImages[0];
        }

        if (posterCandidate) {
          setPosterFile(posterCandidate.file);
        }

        const remainingImages = processedImages.filter((img) => img !== posterCandidate);
        setPhotoFiles(remainingImages.map((img) => img.file));

        alert(`Successfully processed and routed extracted images using smart scoring!`);
      } else if (isPdf) {
        alert("PDF text and metadata successfully extracted!");
      }
    } catch (error) {
      console.error("[Extraction Error]:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    onUploadMedia(
      activity.id,
      { report: reportFile, finalPdf: finalPdfFile, poster: posterFile, photos: photoFiles },
      formData
    );
  };

  const [posterPreviewUrl, setPosterPreviewUrl] = useState(null);

  useEffect(() => {
    if (!posterFile) {
      setPosterPreviewUrl(null);
      return;
    }

    if (typeof posterFile === "string") {
      setPosterPreviewUrl(posterFile);
      return;
    }

    const url = URL.createObjectURL(posterFile);
    setPosterPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [posterFile]);

  return (
    <div className="border rounded-2xl p-5 mb-5 hover:shadow-lg transition bg-white">
      {/* TITLE & STATUS */}
      <div className="flex justify-between items-start gap-4">
        <h3 className="text-xl font-bold text-gray-800">{formData.title}</h3>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
              activity.status === "COMPLETED"
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {activity.status}
          </span>
          {activity.status !== "COMPLETED" && (
            <button
              onClick={() => onMarkCompleted(activity.id)}
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-bold"
            >
              Mark Completed
            </button>
          )}
        </div>
      </div>

      {/* FORM & MEDIA UPLOAD SECTION */}
      <div className="mt-6 border-t pt-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">
          📁 Event Report, Media & Metadata
        </h4>
        
        {/* FINAL PDF REPORT UPLOAD OPTION */}
        <div className="mb-5 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
          <label className="block text-sm font-bold text-emerald-900 mb-2">
            📄 Upload Final PDF Report (Signed / Compiled)
          </label>
          
          <div className="flex items-center gap-3 flex-wrap">
            <label className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl cursor-pointer shadow-sm transition inline-flex items-center gap-2 text-sm">
              <span>Choose PDF</span>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFinalPdfFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>

            <span className="text-sm text-gray-700 font-medium truncate max-w-xs">
              {finalPdfFile ? finalPdfFile.name : "No PDF chosen"}
            </span>

          </div>
        </div>

        {/* REPORT UPLOAD WITH DYNAMIC PDF/DOCX EXTRACTION */}
        <div className="mb-5 p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200">
          <label className="block text-sm font-bold text-indigo-900 mb-1">
            📝 Upload Report Document (.docx for Images)
          </label>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleReportUpload}
            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:font-semibold hover:file:bg-indigo-700 cursor-pointer"
          />
          {isExtracting && (
            <p className="mt-2 text-xs text-indigo-700 font-semibold animate-pulse">
              ⚡ Processing document and extracting details...
            </p>
          )}
        </div>

        {/* AUTO-POPULATED EDITABLE FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
              title="Event title is locked to maintain calendar alignment"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Faculty / Coordinator
            </label>
            <input
              type="text"
              value={formData.coordinator}
              onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
              className="w-full border rounded-xl p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Venue
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full border rounded-xl p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border rounded-xl p-2.5 text-sm"
            />
          </div>
        </div>

        

        {/* MEDIA FILES WITH EMBEDDED PREVIEWS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Event Photos (Multiple Extracted Preview)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))}
              className="w-full border rounded-xl p-2 text-sm mb-2"
            />
            {photoFiles.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photoFiles.map((photo, idx) => {
                  const photoUrl = URL.createObjectURL(photo);
                  return (
                    <div 
                      key={idx} 
                      className="w-12 h-12 rounded-md overflow-hidden border flex-shrink-0 cursor-pointer hover:scale-105 transition relative group"
                      onClick={() => setPreviewImage(photoUrl)}
                      title="Click to view full image"
                    >
                      <img src={photoUrl} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition">
                        View
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

        {/* FULL SCREEN IMAGE PREVIEW MODAL */}
        {previewImage && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-10 right-0 text-white text-2xl font-bold bg-white/20 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/40 transition"
              >
                ✕
              </button>
              <img
                src={previewImage}
                alt="Full Preview"
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DepartmentCalendar;