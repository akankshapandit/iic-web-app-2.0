import { departmentActivities } from "../../data/activities";
import DepartmentCalendar from "./DepartmentCalendar";
import { useNavigate } from "react-router-dom";

function DepartmentDashboard() {
  const navigate = useNavigate();

  const department = localStorage.getItem("department");
  const activities = departmentActivities[department] || [];

  const completed = activities.filter(
    (a) => a.status === "Completed"
  ).length;

  const upcoming = activities.filter(
    (a) => a.status === "Upcoming"
  ).length;

  const reports = activities.filter(
    (a) => a.reportUploaded
  ).length;

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("department");
    localStorage.removeItem("departmentLoggedIn");

    navigate("/ie-cell/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-10 py-8 shadow-lg">

        <div className="flex items-center justify-between">

          {/* TITLE */}

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

          {/* USER + LOGOUT */}

          <div className="flex items-center gap-5">

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">

              <p className="text-sm text-blue-100">
                Logged in as
              </p>

              <p className="font-bold text-lg">
                {department}
              </p>

            </div>

            <button
              onClick={logout}
              className="
                px-6
                py-3
                rounded-xl
                bg-red-500
                hover:bg-red-600
                text-white
                font-semibold
                shadow-md
                transition
              "
            >
              Logout
            </button>

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <div className="p-10">

        {/* ================================================= */}
        {/* STATS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* TOTAL */}

          <div className="bg-white rounded-3xl shadow-lg p-7 hover:shadow-xl transition">

            <p className="text-gray-500">
              Total Activities
            </p>

            <h2 className="text-5xl font-bold mt-4">
              {activities.length}
            </h2>

          </div>

          {/* COMPLETED */}

          <div className="bg-white rounded-3xl shadow-lg p-7 hover:shadow-xl transition">

            <p className="text-gray-500">
              Completed
            </p>

            <h2 className="text-5xl font-bold text-green-600 mt-4">
              {completed}
            </h2>

          </div>

          {/* UPCOMING */}

          <div className="bg-white rounded-3xl shadow-lg p-7 hover:shadow-xl transition">

            <p className="text-gray-500">
              Upcoming
            </p>

            <h2 className="text-5xl font-bold text-orange-500 mt-4">
              {upcoming}
            </h2>

          </div>

          {/* REPORTS */}

          <div className="bg-white rounded-3xl shadow-lg p-7 hover:shadow-xl transition">

            <p className="text-gray-500">
              Reports Uploaded
            </p>

            <h2 className="text-5xl font-bold text-blue-700 mt-4">
              {reports}
            </h2>

          </div>

        </div>

        {/* ================================================= */}
        {/* CALENDAR */}
        {/* ================================================= */}

        <div className="mt-10 bg-white rounded-3xl shadow-xl p-8">

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-3xl font-bold">
                Department Activity Calendar
              </h2>

              <p className="text-gray-500 mt-2">
                Click on any highlighted date to view the complete
                activity details.
              </p>

            </div>

            {/* CALENDAR LEGEND */}

            <div className="flex gap-6">

              <div className="flex items-center gap-2">

                <span className="w-4 h-4 rounded-full bg-green-500"></span>

                <span className="text-gray-700">
                  Completed
                </span>

              </div>

              <div className="flex items-center gap-2">

                <span className="w-4 h-4 rounded-full bg-orange-500"></span>

                <span className="text-gray-700">
                  Upcoming
                </span>

              </div>

            </div>

          </div>

          <DepartmentCalendar />

        </div>

      </div>

    </div>
  );
}

export default DepartmentDashboard;