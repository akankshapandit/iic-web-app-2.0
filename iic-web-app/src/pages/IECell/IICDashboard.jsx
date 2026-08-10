import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { departmentActivities } from "../../data/activities";

function IICDashboard() {
  const navigate = useNavigate();

  // ==========================================
  // IIC USER INFORMATION
  // ==========================================

  const role = localStorage.getItem("iicRole") || "IIC Member";
  const username = localStorage.getItem("iicUsername") || "";

  // ==========================================
  // STATES
  // ==========================================

  const [activities, setActivities] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedActivity, setSelectedActivity] = useState(null);

  const [newActivity, setNewActivity] = useState({
    title: "",
    date: "",
    coordinator: "",
    department: "",
    reportLink: "",
    videoLink: "",
  });

  // ==========================================
  // CONVERT DEPARTMENT ACTIVITIES
  // INTO IIC ACTIVITIES
  // ==========================================

  const getInitialIICActivities = () => {
    const allActivities = [];

    Object.entries(departmentActivities).forEach(
      ([department, departmentEvents]) => {
        departmentEvents.forEach((activity) => {
          allActivities.push({
            ...activity,

            // Give every event a unique IIC ID
            id: `department-${department}-${activity.id}`,

            // Add department information
            department: department,

            // Keep Google Drive fields
            reportLink: activity.reportLink || "",
            videoLink: activity.videoLink || "",
          });
        });
      }
    );

    return allActivities;
  };

  // ==========================================
  // LOAD ACTIVITIES
  // ==========================================

  useEffect(() => {
    const savedActivities = localStorage.getItem("iicActivities");
    const initialized = localStorage.getItem(
      "iicActivitiesInitialized"
    );

    /*
      First time opening IIC Dashboard:
      Load all activities from activities.js
    */

    if (!initialized) {
      const initialActivities = getInitialIICActivities();

      setActivities(initialActivities);

      localStorage.setItem(
        "iicActivities",
        JSON.stringify(initialActivities)
      );

      localStorage.setItem(
        "iicActivitiesInitialized",
        "true"
      );

      return;
    }

    /*
      After initialization:
      Load activities from localStorage
    */

    if (savedActivities) {
      try {
        setActivities(JSON.parse(savedActivities));
      } catch (error) {
        console.error(
          "Error loading IIC activities:",
          error
        );

        const initialActivities =
          getInitialIICActivities();

        setActivities(initialActivities);
      }
    } else {
      const initialActivities =
        getInitialIICActivities();

      setActivities(initialActivities);
    }
  }, []);

  // ==========================================
  // SAVE ACTIVITIES
  // ==========================================

  useEffect(() => {
    if (activities.length > 0) {
      localStorage.setItem(
        "iicActivities",
        JSON.stringify(activities)
      );
    }
  }, [activities]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("iicLoggedIn");
    localStorage.removeItem("iicRole");
    localStorage.removeItem("iicUsername");

    navigate("/ie-cell/login");
  };

  // ==========================================
  // ADD ACTIVITY
  // ==========================================

  const handleAddActivity = () => {
    if (
      !newActivity.title.trim() ||
      !newActivity.date ||
      !newActivity.coordinator.trim() ||
      !newActivity.department.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const activity = {
      id: `iic-${Date.now()}`,

      title: newActivity.title.trim(),

      date: newActivity.date,

      coordinator:
        newActivity.coordinator.trim(),

      department:
        newActivity.department.trim(),

      status: "Upcoming",

      reportLink:
        newActivity.reportLink.trim(),

      videoLink:
        newActivity.videoLink.trim(),
    };

    setActivities((prev) => [
      ...prev,
      activity,
    ]);

    setNewActivity({
      title: "",
      date: "",
      coordinator: "",
      department: "",
      reportLink: "",
      videoLink: "",
    });

    setShowAddModal(false);
  };

  // ==========================================
  // MARK COMPLETED
  // ==========================================

  const handleMarkCompleted = (id) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id
          ? {
              ...activity,
              status: "Completed",
            }
          : activity
      )
    );

    if (selectedActivity?.id === id) {
      setSelectedActivity((prev) => ({
        ...prev,
        status: "Completed",
      }));
    }
  };

  // ==========================================
  // DELETE ACTIVITY
  // ==========================================

  const handleDeleteActivity = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this activity?"
    );

    if (!confirmDelete) return;

    setActivities((prev) =>
      prev.filter(
        (activity) => activity.id !== id
      )
    );

    setSelectedActivity(null);
  };

  // ==========================================
  // UPDATE REPORT LINK
  // ==========================================

  const handleUpdateReport = (id) => {
    const link = window.prompt(
      "Enter Google Drive Report Link:"
    );

    if (link === null) return;

    const updatedLink = link.trim();

    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id
          ? {
              ...activity,
              reportLink: updatedLink,
            }
          : activity
      )
    );

    setSelectedActivity((prev) =>
      prev
        ? {
            ...prev,
            reportLink: updatedLink,
          }
        : prev
    );
  };

  // ==========================================
  // UPDATE VIDEO LINK
  // ==========================================

  const handleUpdateVideo = (id) => {
    const link = window.prompt(
      "Enter Google Drive Event Video Link:"
    );

    if (link === null) return;

    const updatedLink = link.trim();

    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id
          ? {
              ...activity,
              videoLink: updatedLink,
            }
          : activity
      )
    );

    setSelectedActivity((prev) =>
      prev
        ? {
            ...prev,
            videoLink: updatedLink,
          }
        : prev
    );
  };

  // ==========================================
  // STATISTICS
  // ==========================================

  const completedCount =
    activities.filter(
      (activity) =>
        activity.status === "Completed"
    ).length;

  const upcomingCount =
    activities.filter(
      (activity) =>
        activity.status === "Upcoming"
    ).length;

  const reportsCount =
    activities.filter(
      (activity) =>
        activity.reportLink
    ).length;

  const videosCount =
    activities.filter(
      (activity) =>
        activity.videoLink
    ).length;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white shadow-lg">

        <div className="max-w-7xl mx-auto px-6 py-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <p className="text-blue-200 text-sm font-medium">
                Innovation & Entrepreneurship Cell
              </p>

              <h1 className="text-3xl md:text-4xl font-bold mt-1">
                IIC Dashboard
              </h1>

              <p className="text-blue-100 mt-2">
                Welcome, {role}
              </p>

            </div>

            <div className="flex items-center gap-4">

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3">

                <p className="text-xs text-blue-200">
                  Logged in as
                </p>

                <p className="font-semibold">
                  {role}
                </p>

              </div>

              <button
                onClick={handleLogout}
                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
              >
                Logout
              </button>

            </div>

          </div>

        </div>

      </header>

      {/* ======================================
          MAIN
      ====================================== */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ======================================
            WELCOME
        ====================================== */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-800">
            IIC Activity Management
          </h2>

          <p className="text-gray-500 mt-2">
            Manage IIC events, reports and event videos.
          </p>

        </div>

        {/* ======================================
            STATISTICS
        ====================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          {/* Total */}

          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-gray-500 text-sm">
              Total Activities
            </p>

            <p className="text-3xl font-bold text-blue-700 mt-2">
              {activities.length}
            </p>

          </div>

          {/* Completed */}

          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-gray-500 text-sm">
              Completed
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {completedCount}
            </p>

          </div>

          {/* Upcoming */}

          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-gray-500 text-sm">
              Upcoming
            </p>

            <p className="text-3xl font-bold text-orange-500 mt-2">
              {upcomingCount}
            </p>

          </div>

          {/* Reports / Videos */}

          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-gray-500 text-sm">
              Reports / Videos
            </p>

            <p className="text-3xl font-bold text-purple-600 mt-2">
              {reportsCount + videosCount}
            </p>

          </div>

        </div>

        {/* ======================================
            ADD ACTIVITY BUTTON
        ====================================== */}

        <div className="flex justify-end mb-6">

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition"
          >
            + Add Activity
          </button>

        </div>

        {/* ======================================
            ACTIVITY LIST
        ====================================== */}

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          <div className="p-6 border-b">

            <h3 className="text-2xl font-bold text-gray-800">
              IIC Activities
            </h3>

            <p className="text-gray-500 mt-1">
              All activities conducted by the Innovation & Entrepreneurship Cell.
            </p>

          </div>

          {activities.length === 0 ? (

            <div className="p-16 text-center">

              <div className="text-5xl mb-4">
                📅
              </div>

              <h3 className="text-xl font-semibold text-gray-700">
                No activities added yet
              </h3>

              <p className="text-gray-500 mt-2">
                Click "Add Activity" to create your first IIC event.
              </p>

            </div>

          ) : (

            <div className="divide-y">

              {activities.map((activity) => (

                <div
                  key={activity.id}
                  className="p-6 hover:bg-gray-50 transition"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    {/* Activity Information */}

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-3 mb-3">

                        <h3 className="text-xl font-bold text-blue-700">
                          {activity.title}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            activity.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {activity.status}
                        </span>

                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">

                        {/* Date */}

                        <div>

                          <p className="text-gray-400">
                            Date
                          </p>

                          <p className="font-semibold text-gray-700">
                            {activity.date}
                          </p>

                        </div>

                        {/* Faculty */}

                        <div>

                          <p className="text-gray-400">
                            Faculty / Coordinator
                          </p>

                          <p className="font-semibold text-gray-700">
                            {activity.coordinator}
                          </p>

                        </div>

                        {/* Department */}

                        <div>

                          <p className="text-gray-400">
                            Department
                          </p>

                          <p className="font-semibold text-gray-700">
                            {activity.department}
                          </p>

                        </div>

                        {/* Resources */}

                        <div>

                          <p className="text-gray-400">
                            Resources
                          </p>

                          <div className="flex gap-2 mt-1 flex-wrap">

                            {activity.reportLink && (

                              <span className="text-green-600 font-semibold">
                                📄 Report
                              </span>

                            )}

                            {activity.videoLink && (

                              <span className="text-purple-600 font-semibold">
                                🎥 Video
                              </span>

                            )}

                            {!activity.reportLink &&
                              !activity.videoLink && (

                                <span className="text-gray-400">
                                  None
                                </span>

                              )}

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* Actions */}

                    <div className="flex flex-wrap gap-2">

                      <button
                        onClick={() =>
                          setSelectedActivity(activity)
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition"
                      >
                        View
                      </button>

                      {activity.status === "Upcoming" && (

                        <button
                          onClick={() =>
                            handleMarkCompleted(
                              activity.id
                            )
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition"
                        >
                          Complete
                        </button>

                      )}

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

      {/* ======================================
          ADD ACTIVITY MODAL
      ====================================== */}

      {showAddModal && (

        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5">

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Header */}

            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-7 rounded-t-3xl">

              <h2 className="text-2xl font-bold">
                Add IIC Activity
              </h2>

              <p className="text-blue-100 mt-1">
                Enter the details of the event.
              </p>

            </div>

            {/* Form */}

            <div className="p-7 space-y-5">

              {/* Event Title */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Title *
                </label>

                <input
                  type="text"
                  placeholder="Enter event title"
                  value={newActivity.title}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      title: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Date */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Date *
                </label>

                <input
                  type="date"
                  value={newActivity.date}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      date: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Faculty */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Conducted By / Faculty Coordinator *
                </label>

                <input
                  type="text"
                  placeholder="Enter faculty name"
                  value={newActivity.coordinator}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      coordinator: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Department */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department *
                </label>

                <select
                  value={newActivity.department}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      department: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="">
                    Select Department
                  </option>

                  <option value="MCA">
                    MCA
                  </option>

                  <option value="MBA">
                    MBA
                  </option>

                  <option value="CSE">
                    CSE
                  </option>

                  <option value="CSE-AIML">
                    CSE-AIML
                  </option>

                  <option value="Basic Science">
                    Basic Science
                  </option>

                </select>

              </div>

              {/* Report Link */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Google Drive Report Link
                </label>

                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={newActivity.reportLink}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      reportLink: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <p className="text-xs text-gray-500 mt-2">
                  Paste the Google Drive link of the event report.
                </p>

              </div>

              {/* Video Link */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Google Drive Event Video Link
                </label>

                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={newActivity.videoLink}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      videoLink: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <p className="text-xs text-gray-500 mt-2">
                  Paste the Google Drive link of the event video.
                </p>

              </div>

              {/* Buttons */}

              <div className="flex gap-3 pt-3">

                <button
                  onClick={() =>
                    setShowAddModal(false)
                  }
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAddActivity}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold transition"
                >
                  Add Activity
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ======================================
          ACTIVITY DETAILS MODAL
      ====================================== */}

      {selectedActivity && (

        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5">

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            {/* Header */}

            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-7 rounded-t-3xl">

              <div className="flex justify-between items-start gap-4">

                <div>

                  <p className="text-blue-200 text-sm">
                    IIC Activity
                  </p>

                  <h2 className="text-2xl md:text-3xl font-bold mt-1">
                    {selectedActivity.title}
                  </h2>

                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                    selectedActivity.status === "Completed"
                      ? "bg-green-500"
                      : "bg-orange-500"
                  }`}
                >
                  {selectedActivity.status}
                </span>

              </div>

            </div>

            {/* Details */}

            <div className="p-7 space-y-6">

              {/* Information */}

              <div className="grid md:grid-cols-2 gap-4">

                <div className="bg-gray-50 rounded-xl p-5">

                  <p className="text-sm text-gray-500">
                    Event Date
                  </p>

                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {selectedActivity.date}
                  </p>

                </div>

                <div className="bg-gray-50 rounded-xl p-5">

                  <p className="text-sm text-gray-500">
                    Department
                  </p>

                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {selectedActivity.department}
                  </p>

                </div>

                <div className="bg-gray-50 rounded-xl p-5 md:col-span-2">

                  <p className="text-sm text-gray-500">
                    Conducted By / Faculty Coordinator
                  </p>

                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {selectedActivity.coordinator}
                  </p>

                </div>

              </div>

              {/* ==================================
                  REPORT
              ================================== */}

              <div className="border rounded-2xl p-5">

                <div className="mb-4">

                  <h3 className="text-lg font-bold text-gray-800">
                    📄 Event Report
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Google Drive report
                  </p>

                </div>

                {selectedActivity.reportLink ? (

                  <div className="flex flex-wrap gap-3">

                    <a
                      href={selectedActivity.reportLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-semibold transition"
                    >
                      View Report
                    </a>

                    <button
                      onClick={() =>
                        handleUpdateReport(
                          selectedActivity.id
                        )
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-xl font-semibold transition"
                    >
                      Change Report Link
                    </button>

                  </div>

                ) : (

                  <div>

                    <p className="text-orange-600 bg-orange-50 rounded-xl px-4 py-3 mb-3">
                      Report has not been added yet.
                    </p>

                    <button
                      onClick={() =>
                        handleUpdateReport(
                          selectedActivity.id
                        )
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold transition"
                    >
                      + Add Report Link
                    </button>

                  </div>

                )}

              </div>

              {/* ==================================
                  VIDEO
              ================================== */}

              <div className="border rounded-2xl p-5">

                <div className="mb-4">

                  <h3 className="text-lg font-bold text-gray-800">
                    🎥 Event Video
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Google Drive event video
                  </p>

                </div>

                {selectedActivity.videoLink ? (

                  <div className="flex flex-wrap gap-3">

                    <a
                      href={selectedActivity.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-semibold transition"
                    >
                      🎥 View Event Video
                    </a>

                    <button
                      onClick={() =>
                        handleUpdateVideo(
                          selectedActivity.id
                        )
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-xl font-semibold transition"
                    >
                      Change Video Link
                    </button>

                  </div>

                ) : (

                  <div>

                    <p className="text-orange-600 bg-orange-50 rounded-xl px-4 py-3 mb-3">
                      Event video has not been added yet.
                    </p>

                    <button
                      onClick={() =>
                        handleUpdateVideo(
                          selectedActivity.id
                        )
                      }
                      className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-semibold transition"
                    >
                      + Add Video Link
                    </button>

                  </div>

                )}

              </div>

              {/* ==================================
                  ACTIONS
              ================================== */}

              <div className="space-y-3">

                {selectedActivity.status === "Upcoming" && (

                  <button
                    onClick={() =>
                      handleMarkCompleted(
                        selectedActivity.id
                      )
                    }
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
                  >
                    ✅ Mark Activity as Completed
                  </button>

                )}

                {selectedActivity.status === "Completed" && (

                  <div className="w-full bg-green-100 text-green-700 py-3 rounded-xl text-center font-semibold">
                    ✔ Activity Completed
                  </div>

                )}

                <button
                  onClick={() =>
                    handleDeleteActivity(
                      selectedActivity.id
                    )
                  }
                  className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-xl font-semibold transition"
                >
                  🗑 Delete Activity
                </button>

                <button
                  onClick={() =>
                    setSelectedActivity(null)
                  }
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold transition"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default IICDashboard;