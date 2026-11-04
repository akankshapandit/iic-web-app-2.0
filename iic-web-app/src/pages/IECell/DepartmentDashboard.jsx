import { useState, useEffect } from "react";
import { departmentActivities, iicActivities } from "../../data/activities";
import DepartmentCalendar from "./DepartmentCalendar";
import { useNavigate } from "react-router-dom";

function DepartmentDashboard() {
  const navigate = useNavigate();
  const department = localStorage.getItem("department");
  const [activities, setActivities] = useState([]);

  // Fetch saved events from MongoDB database on mount
  useEffect(() => {
    const fetchSavedEvents = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/events");
        const dbEvents = await response.json();

        // Fallback to static activities if DB is empty or fails
        const cleanInput = (department || "").replace(/[\s-_]+/g, "").toLowerCase();
        let deptActivities = departmentActivities[department] || iicActivities.filter(
          (act) => act.department && act.department.replace(/[\s-_]+/g, "").toLowerCase() === cleanInput
        );

        // Merge DB events with static activities (DB takes precedence for uploaded files)
        if (Array.isArray(dbEvents) && dbEvents.length > 0) {
          deptActivities = deptActivities.map((staticAct) => {
            const foundDb = dbEvents.find(
              (e) => e.title?.trim().toLowerCase() === staticAct.title?.trim().toLowerCase()
            );
            return foundDb ? { ...staticAct, ...foundDb } : staticAct;
          });
        }

        setActivities(deptActivities);
      } catch (err) {
        console.error("Failed to fetch events from DB:", err);
      }
    };

    fetchSavedEvents();
  }, [department]);

  const completed = activities.filter((a) => String(a.status || "").toLowerCase() === "completed").length;
  const upcoming = activities.filter((a) => String(a.status || "").toLowerCase() === "upcoming" || !a.status).length;
  const reports = activities.filter((a) => a.reportUploaded || a.reportLink).length;

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
          <div className="bg-white rounded-3xl shadow-lg p-7">
            <p className="text-gray-500">Total Activities</p>
            <h2 className="text-5xl font-bold mt-4">{activities.length}</h2>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-7">
            <p className="text-gray-500">Completed</p>
            <h2 className="text-5xl font-bold text-green-600 mt-4">{completed}</h2>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-7">
            <p className="text-gray-500">Upcoming</p>
            <h2 className="text-5xl font-bold text-orange-500 mt-4">{upcoming}</h2>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-7">
            <p className="text-gray-500">Reports Uploaded</p>
            <h2 className="text-5xl font-bold text-blue-700 mt-4">{reports}</h2>
          </div>
        </div>

        {/* CALENDAR SECTION */}
        <div className="mt-10 bg-white rounded-3xl shadow-xl p-8">
          <DepartmentCalendar activities={activities} />
        </div>
      </div>
    </div>
  );
}

export default DepartmentDashboard;