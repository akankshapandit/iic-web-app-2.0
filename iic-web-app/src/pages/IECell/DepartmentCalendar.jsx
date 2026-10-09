import { useState, useEffect } from "react";
import axios from 'axios';

function DepartmentCalendar() {
  const today = new Date();
  const department = localStorage.getItem("department");

  const [activities, setActivities] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
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
      return departmentEvents; // Return parsed events for chain use
    } catch (error) {
      console.error("Failed to fetch events:", error);
      return [];
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

      const updatedList = await fetchEvents();
      // Sync selected activities popup list instantly
      if (selectedDate) {
        const refreshedDayActivities = updatedList.filter((activity) => {
          if (!activity.date) return false;
          const [d, month, year] = activity.date.split(" ");
          return (
            parseInt(d) === selectedDate &&
            monthMap[month] === currentMonth &&
            parseInt(year) === currentYear
          );
        });
        setSelectedActivities(refreshedDayActivities);
      }
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
        /*if (extractedForm.venue) formData.append("venue", extractedForm.venue);*/
        /*if (extractedForm.coordinator) formData.append("facultyName", extractedForm.coordinator);*/
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

      // Fetch fresh global list and update modal state immediately so data persists on re-open
      const updatedActivitiesList = await fetchEvents();

      if (selectedDate) {
        const refreshedDayActivities = updatedActivitiesList.filter((activity) => {
          if (!activity.date) return false;
          const [d, month, year] = activity.date.split(" ");
          return (
            parseInt(d) === selectedDate &&
            monthMap[month] === currentMonth &&
            parseInt(year) === currentYear
          );
        });
        setSelectedActivities(refreshedDayActivities);
      }

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
    <div className="bg-white rounded-3xl shadow-xl p-8 relative">
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
      <div className="grid grid-cols-7 gap-3 mb-8">
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

      {/* ACTIVITY DETAILS POPUP MODAL */}
      {selectedDate && selectedActivities.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
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

            {/* Modal Content Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
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
   ACTIVITY MEDIA CARD (WITH PROP SYNCHRONIZATION)
================================================================ */
function ActivityMediaCard({ activity = {}, uploading, onMarkCompleted, fetchEvents }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [reportFile, setReportFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [finalPdfFile, setFinalPdfFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDeletingMedia, setIsDeletingMedia] = useState(false);
  
  const activityId = activity?.id || activity?._id; 

  const getSavedPdfFromActivity = (act) => {
    return (
      act?.finalPdf || 
      act?.finalPdfUrl || 
      act?.pdfUrl || 
      act?.pdf || 
      act?.pdfPath || 
      act?.signedPdf || 
      act?.final_pdf ||
      act?.reportPdf ||
      act?.document
    );
  };

  // Keep state fully synchronized with incoming activity prop updates from parent
  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || "",
        /*venue: activity.venue || "",
        facultyName: activity.facultyName || activity.faculty || activity.coordinator || "",*/
        category: activity.category || "Workshop",
        speakerDetails: activity.speakerDetails || "",
      });

      if (Array.isArray(activity.photos) && activity.photos.length > 0) {
        setPhotoFiles(activity.photos);
      } else {
        setPhotoFiles([]); 
      }

      const savedReport = activity.reportFileUrl || activity.report || activity.reportFile || activity.reportUrl;
      if (savedReport) {
        let reportUrl = "";
        let reportName = "Saved_Report";

        if (typeof savedReport === "string") {
          reportUrl = savedReport;
          reportName = savedReport.split("/").pop() || "Saved_Report";
        } else if (typeof savedReport === "object" && savedReport !== null) {
          reportUrl = savedReport.url || savedReport.path || "";
          reportName = savedReport.name || reportUrl.split("/").pop() || "Saved_Report";
        }

        setReportFile((prev) => (prev instanceof File ? prev : { name: reportName, url: reportUrl, isSaved: true }));
      } else {
        setReportFile((prev) => (prev instanceof File ? prev : null));
      }

      const savedPdf = getSavedPdfFromActivity(activity);
      if (savedPdf) {
        let pdfUrl = "";
        let pdfName = "Saved_Final_Report.pdf";

        if (typeof savedPdf === "string") {
          pdfUrl = savedPdf;
          pdfName = savedPdf.split("/").pop() || "Saved_Final_Report.pdf";
        } else if (typeof savedPdf === "object" && savedPdf !== null) {
          pdfUrl = savedPdf.url || savedPdf.path || "";
          pdfName = savedPdf.name || pdfUrl.split("/").pop() || "Saved_Final_Report.pdf";
        }

        if (pdfUrl) {
          setFinalPdfFile((prev) => (prev instanceof File ? prev : { 
            name: pdfName, 
            url: pdfUrl, 
            isSaved: true 
          }));
        }
      } else {
        setFinalPdfFile((prev) => (prev instanceof File ? prev : prev));
      }

      const savedPoster = activity.posterUrl || activity.poster;
      if (savedPoster && !posterFile) {
        setPosterFile(savedPoster);
      }
    }
  }, [activity]);

  const [formData, setFormData] = useState({
    title: activity?.title || "",
    /*venue: activity?.venue || "",
    facultyName: activity?.facultyName || activity?.faculty || activity?.coordinator || "", */
    category: activity?.category || "Workshop",
    speakerDetails: activity?.speakerDetails || "",
  });

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
    setPhotoFiles([]);
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
          // Extract venue from document data (falls back to existing state if not found)
          venue: data.extractedData.venue || prev.venue,
          // Extract faculty/coordinator name from document data (supports common field variations)
          facultyName: data.extractedData.facultyName || data.extractedData.coordinator || prev.facultyName,
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

              let score = 0;
              if (aspectRatio > 1.1) score += 40;
              if (aspectRatio > 1.3) score += 30;
              if (area > 50000) score += 20;
              if (area > 150000) score += 20;
              if (width > height) score -= 100;

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

        alert(`Successfully processed document images and metadata!`);
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

  // Handler to clear / delete all media files to start fresh
  const handleDeleteAllMedia = async () => {
    if (!window.confirm("Are you sure you want to delete all uploaded media and files for this activity? This will clear local state and remove them from the server.")) {
      return;
    }

    setIsDeletingMedia(true);
    try {
      // Optional: Call a backend endpoint to wipe media if you have one, or just clear frontend state & save empty
      const response = await axios.put(
        `http://localhost:3000/api/events/${activityId}/media`,
        {
          venue: "",
          faculty: "",
          category: formData.category,
          speakerDetails: "",
          clearMedia: true // flag for backend if needed
        }
      );

      // Clear local states
      setFinalPdfFile(null);
      setReportFile(null);
      setPosterFile(null);
      setPhotoFiles([]);
      setFormData((prev) => ({
        ...prev,
        venue: "",
        facultyName: "",
        speakerDetails: "",
      }));

      alert("All media and files have been cleared successfully!");
      if (typeof fetchEvents === "function") {
        fetchEvents();
      }
    } catch (err) {
      console.error("Failed to delete media:", err);
      // Fallback: Clear client state even if backend route isn't configured for a full delete
      setFinalPdfFile(null);
      setReportFile(null);
      setPosterFile(null);
      setPhotoFiles([]);
      alert("Cleared local media state.");
    } finally {
      setIsDeletingMedia(false);
    }
  };

  const handleSave = async () => {
    try {
      const data = new FormData();
      
      data.append("venue", formData.venue);
      data.append("faculty", formData.facultyName);
      data.append("category", formData.category);
      data.append("speakerDetails", formData.speakerDetails);

      if (finalPdfFile) {
        if (finalPdfFile instanceof File) {
          data.append("finalPdf", finalPdfFile);
        } else if (finalPdfFile.url) {
          data.append("finalPdfUrl", finalPdfFile.url);
        }
      }

      if (reportFile) {
        if (reportFile instanceof File) {
          data.append("reportFile", reportFile);
        } else if (reportFile.url) {
          data.append("reportUrl", reportFile.url);
        }
      }

      if (posterFile && posterFile instanceof File) {
        data.append("poster", posterFile);
      }
      
      if (photoFiles && photoFiles.length > 0) {
        photoFiles.forEach((photo) => {
          if (photo instanceof File) {
            data.append("photos", photo);
          }
        });
      }

      const response = await axios.put(
        `http://localhost:3000/api/events/${activityId}/media`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        alert("Activity, PDF, and media saved successfully!");
        if (typeof fetchEvents === "function") {
          fetchEvents();
        }
      }
    } catch (err) {
      console.error("Failed to save activity card:", err);
      alert(err.response?.data?.message || "Failed to save media.");
    }
  };

  return (
    <div className="border rounded-2xl p-5 mb-4 hover:shadow-md transition bg-white">
      {/* TITLE & STATUS */}
      <div className="flex justify-between items-start gap-4">
        <h3 className="text-xl font-bold text-gray-800">{formData.title}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
              activity?.status === "COMPLETED"
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {activity?.status || "UPCOMING"}
          </span>
          {activity?.status !== "COMPLETED" && activityId && (
            <button
              onClick={() => onMarkCompleted(activityId)}
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-bold"
            >
              Mark Completed
            </button>
          )}
        </div>
      </div>

      {/* FORM & MEDIA UPLOAD SECTION */}
      <div className="mt-6 border-t pt-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h4 className="text-lg font-bold text-gray-800">
            📁 Event Report, Media & Metadata
          </h4>
          
          {/* DELETE / CLEAR MEDIA BUTTON */}
          <button
            type="button"
            onClick={handleDeleteAllMedia}
            disabled={isDeletingMedia}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5"
            title="Remove all uploaded files and media to start fresh"
          >
            <span>🗑️ {isDeletingMedia ? "Clearing..." : "Delete All Media"}</span>
          </button>
        </div>
        
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

            {finalPdfFile ? (
              <div className="flex items-center gap-2 bg-white border border-emerald-200 px-3 py-1.5 rounded-xl shadow-sm">
                <span className="text-sm text-gray-700 font-medium truncate max-w-[220px]">
                  {finalPdfFile.name}
                </span>
                {finalPdfFile.url && (
                  <a
                    href={finalPdfFile.url.startsWith("http") ? finalPdfFile.url : `http://localhost:3000${finalPdfFile.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-600 hover:underline ml-1"
                  >
                    View
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setFinalPdfFile(null)}
                  className="text-xs font-bold text-red-500 hover:text-red-700 ml-1 bg-red-50 px-1.5 py-0.5 rounded-md"
                  title="Remove PDF"
                >
                  ✕
                </button>
              </div>
            ) : (
              <span className="text-sm text-gray-500 font-medium">No PDF chosen</span>
            )}
          </div>
        </div>

        {/* REPORT UPLOAD WITH DYNAMIC PDF/DOCX EXTRACTION */}
        <div className="mb-5 p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200">
          <label className="block text-sm font-bold text-indigo-900 mb-1">
            📝 Upload Report Document (.docx for Images)
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleReportUpload}
              className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:font-semibold hover:file:bg-indigo-700 cursor-pointer"
            />
            {reportFile && reportFile.name && (
              <div className="flex items-center gap-2 bg-white border border-indigo-200 px-3 py-1.5 rounded-xl shadow-sm">
                <span className="text-sm text-gray-700 font-medium truncate max-w-[180px]">
                  {reportFile.name}
                </span>
                {reportFile.url && (
                  <a
                    href={reportFile.url.startsWith("http") ? reportFile.url : `http://localhost:3000${reportFile.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-600 hover:underline ml-1"
                  >
                    View
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setReportFile(null)}
                  className="text-xs font-bold text-red-500 hover:text-red-700 ml-1 bg-red-50 px-1.5 py-0.5 rounded-md"
                  title="Remove Report"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
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
              value={formData.facultyName}
              onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
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
                  const photoUrl = typeof photo === "string" 
                    ? (photo.startsWith("http") ? photo : `http://localhost:3000${photo}`) 
                    : URL.createObjectURL(photo);
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