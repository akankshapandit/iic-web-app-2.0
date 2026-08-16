import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { departmentActivities } from "../../data/activities";

function IICDashboard() {
  const navigate = useNavigate();

  const role = localStorage.getItem("iicRole");
  const username = localStorage.getItem("iicUsername");

  const [activities, setActivities] = useState([]);

  const [reportInputs, setReportInputs] = useState({});
  const [videoInputs, setVideoInputs] = useState({});

  const [editingReport, setEditingReport] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);

  const [showAddActivity, setShowAddActivity] = useState(false);

  const [newActivity, setNewActivity] = useState({
    title: "",
    date: "",
    coordinator: "",
    department: "",
    status: "Upcoming",
  });

  // =========================================================
  // LOAD ACTIVITIES
  // =========================================================

  useEffect(() => {
    const savedActivities = localStorage.getItem("iicActivities");

    if (savedActivities) {
      setActivities(JSON.parse(savedActivities));
    } else {
      const allActivities = [];

      Object.entries(departmentActivities).forEach(
        ([department, departmentEvents]) => {
          departmentEvents.forEach((activity) => {
            allActivities.push({
              ...activity,
              uniqueId: `${department}-${activity.id}`,
              department,
              reportLink: activity.reportLink || "",
              videoLink: activity.videoLink || "",
            });
          });
        }
      );

      setActivities(allActivities);

      localStorage.setItem(
        "iicActivities",
        JSON.stringify(allActivities)
      );
    }
  }, []);

  // =========================================================
  // SAVE ACTIVITIES
  // =========================================================

  const saveActivities = (updatedActivities) => {
    setActivities(updatedActivities);

    localStorage.setItem(
      "iicActivities",
      JSON.stringify(updatedActivities)
    );
  };

  // =========================================================
  // SAVE REPORT
  // =========================================================

  const saveReport = (activityId) => {
    const link = reportInputs[activityId]?.trim();

    if (!link) {
      alert("Please paste a Google Drive report link.");
      return;
    }

    if (!link.startsWith("http")) {
      alert("Please enter a valid Google Drive link.");
      return;
    }

    const updatedActivities = activities.map((activity) =>
      activity.uniqueId === activityId
        ? {
            ...activity,
            reportLink: link,
            reportUploaded: true,
          }
        : activity
    );

    saveActivities(updatedActivities);

    setReportInputs((prev) => ({
      ...prev,
      [activityId]: "",
    }));

    setEditingReport(null);
  };

  // =========================================================
  // SAVE VIDEO
  // =========================================================

  const saveVideo = (activityId) => {
    const link = videoInputs[activityId]?.trim();

    if (!link) {
      alert("Please paste a Google Drive event video link.");
      return;
    }

    if (!link.startsWith("http")) {
      alert("Please enter a valid Google Drive link.");
      return;
    }

    const updatedActivities = activities.map((activity) =>
      activity.uniqueId === activityId
        ? {
            ...activity,
            videoLink: link,
          }
        : activity
    );

    saveActivities(updatedActivities);

    setVideoInputs((prev) => ({
      ...prev,
      [activityId]: "",
    }));

    setEditingVideo(null);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("iicLoggedIn");
    localStorage.removeItem("iicRole");
    localStorage.removeItem("iicUsername");

    navigate("/ie-cell/login");
  };

  // =========================================================
  // ADD ACTIVITY
  // =========================================================

  const addActivity = () => {
    if (
      !newActivity.title.trim() ||
      !newActivity.date.trim() ||
      !newActivity.coordinator.trim() ||
      !newActivity.department.trim()
    ) {
      alert("Please fill all activity details.");
      return;
    }

    const newId = `custom-${Date.now()}`;

    const activity = {
      uniqueId: newId,
      id: newId,
      title: newActivity.title.trim(),
      date: newActivity.date.trim(),
      coordinator: newActivity.coordinator.trim(),
      department: newActivity.department.trim(),
      status: newActivity.status,
      reportUploaded: false,
      reportLink: "",
      videoLink: "",
    };

    const updatedActivities = [...activities, activity];

    saveActivities(updatedActivities);

    setNewActivity({
      title: "",
      date: "",
      coordinator: "",
      department: "",
      status: "Upcoming",
    });

    setShowAddActivity(false);
  };

  // =========================================================
  // MARK COMPLETED
  // =========================================================

  const markCompleted = (activityId) => {
    const updatedActivities = activities.map((activity) =>
      activity.uniqueId === activityId
        ? {
            ...activity,
            status: "Completed",
          }
        : activity
    );

    saveActivities(updatedActivities);
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalActivities = activities.length;

  const completedActivities = activities.filter(
    (activity) => activity.status === "Completed"
  ).length;

  const upcomingActivities = activities.filter(
    (activity) => activity.status === "Upcoming"
  ).length;

  const resourcesCount = activities.filter(
    (activity) => activity.reportLink || activity.videoLink
  ).length;

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white">

        <div className="max-w-7xl mx-auto px-6 py-8">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-blue-200 text-sm">
                Innovation & Entrepreneurship Cell
              </p>

              <h1 className="text-4xl font-bold mt-1">
                IIC Dashboard
              </h1>

              <p className="text-blue-100 mt-2">
                Welcome, {role || "IIC Member"}
              </p>

            </div>

            <div className="flex items-center gap-4">

              <div className="bg-white/10 px-5 py-3 rounded-xl">

                <p className="text-xs text-blue-200">
                  Logged in as
                </p>

                <p className="font-bold">
                  {role}
                </p>

              </div>

              <button
                onClick={handleLogout}
                className="bg-white text-blue-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
              >
                Logout
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* TITLE */}

        <div className="flex justify-between items-center mb-8">

          <div>

            <h2 className="text-3xl font-bold text-gray-800">
              IIC Activity Management
            </h2>

            <p className="text-gray-500 mt-2">
              Manage IIC events, reports and event videos.
            </p>

          </div>

          <button
            onClick={() => setShowAddActivity(true)}
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            + Add Activity
          </button>

        </div>


        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="grid md:grid-cols-4 gap-5 mb-10">

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">
              Total Activities
            </p>

            <p className="text-4xl font-bold text-blue-700 mt-2">
              {totalActivities}
            </p>
          </div>


          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-gray-500">
              Completed
            </p>

            <p className="text-4xl font-bold text-green-600 mt-2">
              {completedActivities}
            </p>

          </div>


          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-gray-500">
              Upcoming
            </p>

            <p className="text-4xl font-bold text-orange-500 mt-2">
              {upcomingActivities}
            </p>

          </div>


          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-gray-500">
              Reports / Videos
            </p>

            <p className="text-4xl font-bold text-purple-600 mt-2">
              {resourcesCount}
            </p>

          </div>

        </div>


        {/* =====================================================
            ACTIVITIES
        ===================================================== */}

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          <div className="p-7 border-b">

            <h2 className="text-2xl font-bold text-gray-800">
              IIC Activities
            </h2>

            <p className="text-gray-500 mt-1">
              All activities conducted by the Innovation & Entrepreneurship Cell.
            </p>

          </div>


          {/* ACTIVITY LIST */}

          {activities.length === 0 ? (

            <div className="p-12 text-center text-gray-500">
              No activities available.
            </div>

          ) : (

            activities.map((activity) => (

              <div
                key={activity.uniqueId}
                className="p-7 border-b last:border-b-0"
              >

                {/* ACTIVITY HEADER */}

                <div className="flex justify-between items-start gap-5">

                  <div>

                    <div className="flex items-center gap-3 flex-wrap">

                      <h3 className="text-2xl font-bold text-blue-700">
                        {activity.title}
                      </h3>

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          activity.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {activity.status}
                      </span>

                    </div>

                  </div>

                </div>


                {/* BASIC INFORMATION */}

                <div className="grid md:grid-cols-3 gap-6 mt-6">

                  <div>
                    <p className="text-gray-400 text-sm">
                      Date
                    </p>

                    <p className="font-semibold text-gray-800 mt-1">
                      {activity.date}
                    </p>
                  </div>


                  <div>
                    <p className="text-gray-400 text-sm">
                      Faculty / Coordinator
                    </p>

                    <p className="font-semibold text-gray-800 mt-1">
                      {activity.coordinator}
                    </p>
                  </div>


                  <div>
                    <p className="text-gray-400 text-sm">
                      Department
                    </p>

                    <p className="font-semibold text-gray-800 mt-1">
                      {activity.department}
                    </p>
                  </div>

                </div>


                {/* =================================================
                    REPORT + VIDEO
                ================================================= */}

                <div className="grid md:grid-cols-2 gap-4 mt-6">

                  {/* =================================================
                      EVENT REPORT
                  ================================================= */}

                  <div
                    className={`border border-gray-300 rounded-xl ${
                      activity.reportLink &&
                      editingReport !== activity.uniqueId
                        ? "p-3"
                        : "p-4"
                    }`}
                  >

                    <div className="flex items-center gap-2">

                      <span className="text-lg">
                        📄
                      </span>

                      <h4 className="font-bold text-base">
                        Event Report
                      </h4>

                    </div>


                    <p className="text-gray-500 text-xs mt-1">
                      Google Drive report
                    </p>


                    {/* SAVED REPORT */}

                    {activity.reportLink &&
                    editingReport !== activity.uniqueId ? (

                      <div className="flex gap-2 mt-3">

                        <a
                          href={activity.reportLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
                        >
                          View Report
                        </a>


                        <button
                          onClick={() => {
                            setEditingReport(activity.uniqueId);

                            setReportInputs((prev) => ({
                              ...prev,
                              [activity.uniqueId]: "",
                            }));
                          }}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
                        >
                          Upload Another Report
                        </button>

                      </div>

                    ) : (

                      /* UPLOAD REPORT */

                      <div className="mt-3">

                        <input
                          type="text"
                          value={
                            reportInputs[activity.uniqueId] || ""
                          }
                          onChange={(e) =>
                            setReportInputs((prev) => ({
                              ...prev,
                              [activity.uniqueId]:
                                e.target.value,
                            }))
                          }
                          placeholder="Paste Google Drive report link"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />


                        <div className="flex gap-2 mt-2">

                          <button
                            onClick={() =>
                              saveReport(activity.uniqueId)
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
                          >
                            Save Report
                          </button>


                          {activity.reportLink && (

                            <button
                              onClick={() => {
                                setEditingReport(null);

                                setReportInputs((prev) => ({
                                  ...prev,
                                  [activity.uniqueId]: "",
                                }));
                              }}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm"
                            >
                              Cancel
                            </button>

                          )}

                        </div>

                      </div>

                    )}

                  </div>


                  {/* =================================================
                      EVENT VIDEO
                  ================================================= */}

                  <div
                    className={`border border-gray-300 rounded-xl ${
                      activity.videoLink &&
                      editingVideo !== activity.uniqueId
                        ? "p-3"
                        : "p-4"
                    }`}
                  >

                    <div className="flex items-center gap-2">

                      <span className="text-lg">
                        🎥
                      </span>

                      <h4 className="font-bold text-base">
                        Event Video
                      </h4>

                    </div>


                    <p className="text-gray-500 text-xs mt-1">
                      Google Drive event video
                    </p>


                    {/* SAVED VIDEO */}

                    {activity.videoLink &&
                    editingVideo !== activity.uniqueId ? (

                      <div className="flex gap-2 mt-3">

                        <a
                          href={activity.videoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
                        >
                          View Event Video
                        </a>


                        <button
                          onClick={() => {
                            setEditingVideo(activity.uniqueId);

                            setVideoInputs((prev) => ({
                              ...prev,
                              [activity.uniqueId]: "",
                            }));
                          }}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
                        >
                          Upload Another Video
                        </button>

                      </div>

                    ) : (

                      /* UPLOAD VIDEO */

                      <div className="mt-3">

                        <input
                          type="text"
                          value={
                            videoInputs[activity.uniqueId] || ""
                          }
                          onChange={(e) =>
                            setVideoInputs((prev) => ({
                              ...prev,
                              [activity.uniqueId]:
                                e.target.value,
                            }))
                          }
                          placeholder="Paste Google Drive video link"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                        />


                        <div className="flex gap-2 mt-2">

                          <button
                            onClick={() =>
                              saveVideo(activity.uniqueId)
                            }
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
                          >
                            Save Video
                          </button>


                          {activity.videoLink && (

                            <button
                              onClick={() => {
                                setEditingVideo(null);

                                setVideoInputs((prev) => ({
                                  ...prev,
                                  [activity.uniqueId]: "",
                                }));
                              }}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm"
                            >
                              Cancel
                            </button>

                          )}

                        </div>

                      </div>

                    )}

                  </div>

                </div>


                {/* =================================================
                    COMPLETION
                ================================================= */}

                <div className="mt-5">

                  {activity.status === "Completed" ? (

                    <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold text-sm">
                      ✔ Activity Completed
                    </div>

                  ) : (

                    <button
                      onClick={() =>
                        markCompleted(activity.uniqueId)
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition"
                    >
                      Mark as Completed
                    </button>

                  )}

                </div>

              </div>

            ))

          )}

        </div>

      </div>


      {/* =====================================================
          ADD ACTIVITY MODAL
      ===================================================== */}

      {showAddActivity && (

        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-5">

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">
                Add IIC Activity
              </h2>

              <button
                onClick={() => setShowAddActivity(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>

            </div>


            <div className="space-y-4">

              {/* TITLE */}

              <div>

                <label className="block font-semibold mb-2">
                  Event Title
                </label>

                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter event title"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* DATE */}

              <div>

                <label className="block font-semibold mb-2">
                  Event Date
                </label>

                <input
                  type="text"
                  value={newActivity.date}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      date: e.target.value,
                    })
                  }
                  placeholder="Example: 16 Aug 2026"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* FACULTY */}

              <div>

                <label className="block font-semibold mb-2">
                  Faculty / Coordinator
                </label>

                <input
                  type="text"
                  value={newActivity.coordinator}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      coordinator: e.target.value,
                    })
                  }
                  placeholder="Enter faculty name"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* DEPARTMENT */}

              <div>

                <label className="block font-semibold mb-2">
                  Department
                </label>

                <input
                  type="text"
                  value={newActivity.department}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      department: e.target.value,
                    })
                  }
                  placeholder="Example: MCA"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* STATUS */}

              <div>

                <label className="block font-semibold mb-2">
                  Status
                </label>

                <select
                  value={newActivity.status}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      status: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="Upcoming">
                    Upcoming
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                </select>

              </div>

            </div>


            {/* BUTTONS */}

            <div className="flex gap-4 mt-8">

              <button
                onClick={addActivity}
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold"
              >
                Add Activity
              </button>

              <button
                onClick={() => setShowAddActivity(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default IICDashboard;