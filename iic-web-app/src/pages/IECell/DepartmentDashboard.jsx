import { useState } from "react";
import { departmentActivities } from "../../data/activities";
import DepartmentCalendar from "./DepartmentCalendar";
import { useNavigate } from "react-router-dom";

function DepartmentDashboard() {
  const navigate = useNavigate();

  const department = localStorage.getItem("department");

  
const getDepartmentActivities = (deptInput) => {
    if (!deptInput) return [];

    // 1. Normalize the input (e.g., "Basic Science" -> "basicscience")
    const cleanInput = deptInput.replace(/[\s-_]+/g, "").toLowerCase();

    // 2. Search keys in departmentActivities safely
    const matchedKey = Object.keys(departmentActivities).find(
      (key) => key.replace(/[\s-_]+/g, "").toLowerCase() === cleanInput
    );

    if (matchedKey && departmentActivities[matchedKey].length > 0) {
      return departmentActivities[matchedKey];
    }

    // 3. Fallback: If dictionary lookup fails or is empty, filter from iicActivities
    const fallbackActivities = iicActivities.filter(
      (act) => act.department && act.department.replace(/[\s-_]+/g, "").toLowerCase() === cleanInput
    );

    return fallbackActivities;
  };

  const activities = getDepartmentActivities(department);
  console.log("Resolved activities for department:", department, activities);

  const completed = activities.filter((a) => a.status === "Completed").length;
  const upcoming = activities.filter((a) => a.status === "Upcoming").length;
  const reports = activities.filter((a) => a.reportUploaded).length;
  // Selected Activity / Date state from Calendar
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // Form State for the selected activity modal
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    category: "",
    theme: "",
    faculty: "",
    speakerDetails: "",
    description: "",
    participants: "",
  });

  const [reportFile, setReportFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [eventPhotos, setEventPhotos] = useState([]);

  // =========================================================
  // CALENDAR CLICK HANDLER
  // =========================================================
  const handleDateSelect = (activityOrDate) => {
    setSelectedActivity(activityOrDate);
    setFormData({
      title: activityOrDate?.title || "",
      date: activityOrDate?.date || "",
      startTime: activityOrDate?.startTime || "",
      endTime: activityOrDate?.endTime || "",
      venue: activityOrDate?.venue || "",
      category: activityOrDate?.category || "",
      theme: activityOrDate?.theme || "",
      faculty: activityOrDate?.faculty || "",
      speakerDetails: activityOrDate?.speakerDetails || "",
      description: activityOrDate?.description || "",
      participants: activityOrDate?.participants || "",
    });
    setIsModalOpen(true);
  };

  // =========================================================
  // PDF REPORT AUTO-EXTRACT HANDLER
  // =========================================================
  const handleReportUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setReportFile(file);
    setIsExtracting(true);

    const uploadPayload = new FormData();
    uploadPayload.append("reportFile", file);

    try {
      const response = await fetch("http://localhost:3000/api/reports/extract-report-metadata", {
        method: "POST",
        body: uploadPayload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract metadata from report");
      }

      // Auto-populate form inputs directly from Gemini OCR/Extraction
      setFormData((prev) => ({
        ...prev,
        title: data.title || prev.title,
        date: data.date || prev.date,
        startTime: data.startTime || prev.startTime,
        endTime: data.endTime || prev.endTime,
        venue: data.venue || prev.venue,
        category: data.category || prev.category,
        theme: data.theme || prev.theme,
        faculty: data.faculty || prev.faculty,
        speakerDetails: data.speakerDetails || prev.speakerDetails,
        description: data.description || prev.description,
        participants: data.participants || prev.participants,
      }));
    } catch (error) {
      console.error("[Extraction Error]:", error);
      alert("Failed to extract metadata. Check console/logs.");
    } finally {
      setIsExtracting(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================
  const logout = () => {
    localStorage.removeItem("department");
    localStorage.removeItem("departmentLoggedIn");
    navigate("/ie-cell/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-10 py-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium">
              Innovation & Entrepreneurship Cell
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mt-2">
              {department} Dashboard
            </h1>
            <p className="mt-3 text-blue-100 text-lg">
              Innovation & Entrepreneurship Cell Activity Portal
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
              <p className="text-sm text-blue-100">Logged in as</p>
              <p className="font-bold text-lg">{department}</p>
            </div>

            <button
              onClick={logout}
              className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-10">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl shadow-lg p-7 hover:shadow-xl transition">
            <p className="text-gray-500">Total Activities</p>
            <h2 className="text-5xl font-bold mt-4">{activities.length}</h2>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-7 hover:shadow-xl transition">
            <p className="text-gray-500">Completed</p>
            <h2 className="text-5xl font-bold text-green-600 mt-4">{completed}</h2>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-7 hover:shadow-xl transition">
            <p className="text-gray-500">Upcoming</p>
            <h2 className="text-5xl font-bold text-orange-500 mt-4">{upcoming}</h2>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-7 hover:shadow-xl transition">
            <p className="text-gray-500">Reports Uploaded</p>
            <h2 className="text-5xl font-bold text-blue-700 mt-4">{reports}</h2>
          </div>
        </div>

        {/* CALENDAR SECTION */}
        <div className="mt-10 bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Department Activity Calendar</h2>
              <p className="text-gray-500 mt-2">
                Click on any date to open media upload and auto-extract metadata.
              </p>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-green-500"></span>
                <span className="text-gray-700">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-orange-500"></span>
                <span className="text-gray-700">Upcoming</span>
              </div>
            </div>
          </div>

          {/* Pass click handler into your Calendar component */}
          <DepartmentCalendar onSelectDate={handleDateSelect} />
        </div>
      </div>

      {/* ========================================================= */}
      {/* ACTIVITY UPLOAD & AUTO-EXTRACT MODAL */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b">
              <h3 className="text-2xl font-bold text-gray-800">
                Upload Report & Media for Event
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {/* Report Upload Trigger */}
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  📄 Upload Event Report PDF (Triggers Auto-Extraction)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleReportUpload}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white file:font-semibold hover:file:bg-blue-700"
                />
                {isExtracting && (
                  <p className="mt-2 text-sm text-blue-700 font-medium animate-pulse">
                    ⚡ Gemini AI is extracting event metadata...
                  </p>
                )}
              </div>

              {/* Auto-Populated Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-3 border rounded-xl"
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
                    className="w-full p-3 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Faculty Coordinator
                  </label>
                  <input
                    type="text"
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Speaker Details
                </label>
                <textarea
                  rows="2"
                  value={formData.speakerDetails}
                  onChange={(e) => setFormData({ ...formData, speakerDetails: e.target.value })}
                  className="w-full p-3 border rounded-xl"
                />
              </div>

              {/* Poster Upload & Event Photos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Upload Event Poster
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setPosterFile(e.target.files[0])}
                    className="w-full p-2 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Event Photos (Multiple)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setEventPhotos(Array.from(e.target.files))}
                    className="w-full p-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="w-1/2 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-md"
                >
                  Save Media & Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentDashboard;