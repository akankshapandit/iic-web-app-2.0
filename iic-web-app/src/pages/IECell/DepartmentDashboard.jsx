import { departmentActivities } from "../../data/activities";
import DepartmentCalendar from "./DepartmentCalendar";

function DepartmentDashboard() {
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

  return (
    <div className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-10 py-10 shadow-lg">

        <h1 className="text-5xl font-bold">
          {department} Dashboard
        </h1>

        <p className="mt-3 text-blue-100 text-lg">
          Innovation & Entrepreneurship Cell Activity Portal
        </p>

      </div>

      <div className="p-10">

        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white rounded-3xl shadow-lg p-7 hover:shadow-xl transition">

            <p className="text-gray-500">
              Total Activities
            </p>

            <h2 className="text-5xl font-bold mt-4">
              {activities.length}
            </h2>

          </div>

          <div className="bg-white rounded-3xl shadow-lg p-7 hover:shadow-xl transition">

            <p className="text-gray-500">
              Completed
            </p>

            <h2 className="text-5xl font-bold text-green-600 mt-4">
              {completed}
            </h2>

          </div>

          <div className="bg-white rounded-3xl shadow-lg p-7 hover:shadow-xl transition">

            <p className="text-gray-500">
              Upcoming
            </p>

            <h2 className="text-5xl font-bold text-orange-500 mt-4">
              {upcoming}
            </h2>

          </div>

          <div className="bg-white rounded-3xl shadow-lg p-7 hover:shadow-xl transition">

            <p className="text-gray-500">
              Reports Uploaded
            </p>

            <h2 className="text-5xl font-bold text-blue-700 mt-4">
              {reports}
            </h2>

          </div>

        </div>

        {/* QUICK ACTIONS */}

        

        {/* CALENDAR */}

        <div className="mt-10 bg-white rounded-3xl shadow-xl p-8">

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-3xl font-bold">
                Department Activity Calendar
              </h2>

              <p className="text-gray-500 mt-2">
                Click on any highlighted date to view the complete activity details.
              </p>

            </div>

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