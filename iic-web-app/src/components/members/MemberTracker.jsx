import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MemberTracker() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("All Departments");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(
        "http://localhost:3000/api/members/list"
      );

      if (!res.ok) {
        throw new Error("Failed to fetch members");
      }

      const data = await res.json();

      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching members:", error);

      setErrorMsg(
        "Unable to load member list. Please make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // OPEN SELECTED FACULTY MEMBER'S DASHBOARD
  // =========================================================

  const handleMemberClick = (member) => {
  const facultyName = member.facultyName || member.name;

  if (!facultyName) {
    alert("Faculty name not available.");
    return;
  }

  const currentRole =
    localStorage.getItem("iicAdminRole") || "President";

  navigate(
    `/member-dashboard?faculty=${encodeURIComponent(
      facultyName
    )}&viewAs=${encodeURIComponent(currentRole)}`
  );
};

  // =========================================================
  // DEPARTMENTS
  // =========================================================

  const departments = [
    "All Departments",
    ...Array.from(
      new Set(
        members
          .map((member) => member.department)
          .filter(Boolean)
      )
    ).sort()
  ];

  // =========================================================
  // FILTER MEMBERS
  // =========================================================

  const filteredMembers = members.filter((member) => {
    const facultyName =
      member.facultyName ||
      member.name ||
      "";

    const department =
      member.department ||
      "";

    const query =
      searchTerm.toLowerCase().trim();

    const matchesSearch =
      facultyName.toLowerCase().includes(query) ||
      department.toLowerCase().includes(query);

    const matchesDepartment =
      departmentFilter === "All Departments" ||
      department === departmentFilter;

    return (
      matchesSearch &&
      matchesDepartment
    );
  });

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 rounded-3xl p-8 text-white shadow-xl mb-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-blue-200 text-xs font-semibold border border-white/20 mb-3">
              <span>👥</span>
              Institutional Innovation Council
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold">
              Member Tracker
            </h1>

            <p className="text-blue-200 mt-2">
              View IIC members and access their individual dashboards.
            </p>

          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-center">

            <p className="text-xs text-blue-200 uppercase tracking-wider font-bold">
              Total Members
            </p>

            <p className="text-4xl font-black mt-1">
              {members.length}
            </p>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* SEARCH + FILTER */}
      {/* ================================================= */}

      <div className="bg-white rounded-2xl border shadow-sm p-5 mb-6">

        <div className="flex flex-col md:flex-row gap-4">

          {/* SEARCH */}

          <div className="relative flex-1">

            <span className="absolute left-4 top-3 text-gray-400">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search member by name or department..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />

          </div>


          {/* DEPARTMENT FILTER */}

          <select
            value={departmentFilter}
            onChange={(e) =>
              setDepartmentFilter(e.target.value)
            }
            className="md:w-64 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
          >

            {departments.map((department) => (
              <option
                key={department}
                value={department}
              >
                {department}
              </option>
            ))}

          </select>

        </div>

      </div>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-6 text-sm font-semibold">
          {errorMsg}
        </div>
      )}


      {/* ================================================= */}
      {/* MEMBER TABLE */}
      {/* ================================================= */}

      <div className="bg-white rounded-3xl border shadow-lg overflow-hidden">

        {/* TABLE HEADER */}

        <div className="px-6 py-5 border-b bg-slate-50">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-extrabold text-gray-800">
                IIC Members
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Click on any member to view their personalized dashboard.
              </p>

            </div>

            <span className="text-sm font-bold text-blue-700">
              {filteredMembers.length} member
              {filteredMembers.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

        </div>


        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading ? (

          <div className="py-16 text-center">

            <div className="text-4xl animate-spin mb-3">
              🌀
            </div>

            <p className="text-sm font-semibold text-gray-500">
              Loading members...
            </p>

          </div>

        ) : filteredMembers.length === 0 ? (

          <div className="py-16 text-center">

            <div className="text-5xl mb-4">
              👤
            </div>

            <h3 className="text-lg font-bold text-gray-700">
              No members found
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Try changing your search or department filter.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="bg-gray-50 border-b">

                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    #
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Faculty Name
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Department
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Activities
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Upcoming
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>

                  <th className="text-right px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Dashboard
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {filteredMembers.map(
                  (member, index) => {

                    const facultyName =
                      member.facultyName ||
                      member.name ||
                      "Unknown Faculty";

                    const department =
                      member.department ||
                      "CMRIT";

                    const activityCount =
                      member.activityCount ??
                      member.totalActivities ??
                      member.totalEvents ??
                      member.activities?.length ??
                      0;

                    const completedEvents =
                      member.completedEvents ??
                      0;

                    const upcomingEvents =
                      member.upcomingEvents ??
                      0;

                    return (

                      <tr
                        key={
                          member._id ||
                          member.id ||
                          `${facultyName}-${department}-${index}`
                        }
                        onClick={() =>
                          handleMemberClick(member)
                        }
                        className="group cursor-pointer hover:bg-blue-50 transition"
                      >

                        {/* NUMBER */}

                        <td className="px-6 py-5">

                          <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-sm font-bold text-gray-600 group-hover:text-blue-700 transition">
                            {index + 1}
                          </div>

                        </td>


                        {/* FACULTY NAME */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-sm">

                              {facultyName
                                .trim()
                                .charAt(0)
                                .toUpperCase()}

                            </div>

                            <div>

                              <p className="font-extrabold text-gray-800 group-hover:text-blue-700 transition">
                                {facultyName}
                              </p>

                              <p className="text-xs text-gray-400 mt-0.5">
                                IIC Faculty Member
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* DEPARTMENT */}

                        <td className="px-6 py-5">

                          <span className="inline-flex px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
                            {department}
                          </span>

                        </td>


                        {/* ACTIVITIES */}

                        <td className="px-6 py-5">

                          <span className="inline-flex items-center justify-center min-w-[40px] px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-extrabold">
                            {activityCount}
                          </span>

                        </td>


                        {/* COMPLETED */}

                        <td className="px-6 py-5">

                          <span className="inline-flex items-center justify-center min-w-[40px] px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-extrabold">
                            {completedEvents}
                          </span>

                        </td>


                        {/* UPCOMING */}

                        <td className="px-6 py-5">

                          <span className="inline-flex items-center justify-center min-w-[40px] px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 text-sm font-extrabold">
                            {upcomingEvents}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td className="px-6 py-5">

                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold">

                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>

                            Active

                          </span>

                        </td>


                        {/* OPEN DASHBOARD */}

                        <td className="px-6 py-5 text-right">

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMemberClick(member);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                          >
                            View Dashboard
                            <span>→</span>
                          </button>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      {!loading &&
        filteredMembers.length > 0 && (

          <div className="mt-5 flex items-center justify-center text-xs text-gray-500">

            <span>
              Click a member row or "View Dashboard"
              to open that member's dashboard.
            </span>

          </div>

        )}

    </div>
  );
}

export default MemberTracker;