import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function IICDashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState("iic");
  const [selectedQuarter, setSelectedQuarter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState("");

  const role = localStorage.getItem("iicRole") || "President";

  // =========================================================
  // FETCH EVENTS
  // =========================================================

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:3000/api/events");

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();

      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("IIC Dashboard Error:", err);
      setError("Unable to load events.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH MEMBERS
  // =========================================================

  const fetchMembers = async () => {
    try {
      setMembersLoading(true);

      const response = await fetch("http://localhost:3000/api/members/list");

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const data = await response.json();

      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Member Tracker Error:", err);
      setError("Unable to load member information.");
    } finally {
      setMembersLoading(false);
    }
  };

  // =========================================================
  // OPEN MEMBER TRACKER
  // =========================================================

  const openMemberTracker = () => {
    setActiveTab("members");

    if (members.length === 0) {
      fetchMembers();
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    localStorage.removeItem("iicLoggedIn");
    localStorage.removeItem("iicRole");
    localStorage.removeItem("iicUsername");

    navigate("/ie-cell/login");
  };

  // =========================================================
  // GET QUARTER FROM EVENT DATE
  // =========================================================
  const getQuarter = (dateValue) => {
    if (!dateValue) {
      return null;
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const month = date.getMonth() + 1;

    if ([9, 10, 11].includes(month)) {
      return 1;
    }

    if ([12, 1, 2].includes(month)) {
      return 2;
    }

    if ([3, 4, 5].includes(month)) {
      return 3;
    }

    if ([6, 7, 8].includes(month)) {
      return 4;
    }

    return null;
  };

  // =========================================================
  // FILTER EVENTS BY QUARTER
  // =========================================================

  const quarterFilteredEvents = useMemo(() => {
    if (selectedQuarter === "all") {
      return events;
    }

    return events.filter(
      (event) => getQuarter(event.date) === Number(selectedQuarter)
    );
  }, [events, selectedQuarter]);

  // =========================================================
  // FILTER EVENTS BY CATEGORY
  // =========================================================

  const filteredEvents = useMemo(() => {
    if (activeTab === "members") {
      return [];
    }

    // IIC EVENTS
    if (activeTab === "iic") {
      return quarterFilteredEvents.filter(
        (event) =>
          (event.activityType === "IIC" ||
            event.activityType === "SELF_DRIVEN" ||
            event.source === "SELF_DRIVEN") &&
          !event.isCelebration &&
          event.activityType !== "CELEBRATION"
      );
    }

    // CELEBRATION EVENTS
    if (activeTab === "celebration") {
      return quarterFilteredEvents.filter(
        (event) => event.isCelebration || event.activityType === "CELEBRATION"
      );
    }

    // SELF DRIVEN EVENTS
    if (activeTab === "self") {
      return quarterFilteredEvents.filter(
        (event) =>
          event.activityType === "SELF_DRIVEN" || event.source === "SELF_DRIVEN"
      );
    }

    // MIC EVENTS
    if (activeTab === "mic") {
      return quarterFilteredEvents.filter(
        (event) => event.activityType === "MIC"
      );
    }

    // MIC LEVELS
    if (["basic", "advanced", "reskilling", "upskilling"].includes(activeTab)) {
      return quarterFilteredEvents.filter(
        (event) =>
          event.activityType === "MIC" &&
          (event.level || event.micLevel || "").toUpperCase() ===
            activeTab.toUpperCase()
      );
    }

    return [];
  }, [quarterFilteredEvents, activeTab]);

  // =========================================================
  // EVENT STATS
  // =========================================================

  const stats = {
    total: quarterFilteredEvents.length,

    iic: quarterFilteredEvents.filter(
      (event) =>
        (event.activityType === "IIC" ||
          event.activityType === "SELF_DRIVEN" ||
          event.source === "SELF_DRIVEN") &&
        !event.isCelebration &&
        event.activityType !== "CELEBRATION"
    ).length,

    celebration: quarterFilteredEvents.filter(
      (event) => event.isCelebration || event.activityType === "CELEBRATION"
    ).length,

    selfDriven: quarterFilteredEvents.filter(
      (event) =>
        event.activityType === "SELF_DRIVEN" || event.source === "SELF_DRIVEN"
    ).length,

    mic: quarterFilteredEvents.filter((event) => event.activityType === "MIC")
      .length,
  };

  // =========================================================
  // QUARTER COUNTS
  // =========================================================

  const quarterCounts = {
    1: events.filter((event) => getQuarter(event.date) === 1).length,
    2: events.filter((event) => getQuarter(event.date) === 2).length,
    3: events.filter((event) => getQuarter(event.date) === 3).length,
    4: events.filter((event) => getQuarter(event.date) === 4).length,
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // MEMBER NAME NORMALIZATION
  // =========================================================

  const getMemberName = (member) => {
    return (
      member.facultyName || member.name || member.faculty || "Unknown Faculty"
    );
  };

  // =========================================================
  // MEMBER EVENTS
  // =========================================================

  const getMemberEvents = (member) => {
    const memberName = getMemberName(member).trim().toLowerCase();

    return events.filter((event) => {
      const eventFaculty = (
        event.facultyName ||
        event.faculty ||
        event.name ||
        ""
      )
        .trim()
        .toLowerCase();

      return eventFaculty === memberName;
    });
  };

  // =========================================================
  // MEMBER STATS
  // =========================================================

  const getMemberStats = (member) => {
    const memberEvents = getMemberEvents(member);

    const iicEvents = memberEvents.filter(
      (event) =>
        (event.activityType === "IIC" ||
          event.activityType === "SELF_DRIVEN" ||
          event.source === "SELF_DRIVEN") &&
        !event.isCelebration &&
        event.activityType !== "CELEBRATION"
    );

    const celebrationEvents = memberEvents.filter(
      (event) => event.isCelebration || event.activityType === "CELEBRATION"
    );

    const selfDrivenEvents = memberEvents.filter(
      (event) =>
        event.activityType === "SELF_DRIVEN" || event.source === "SELF_DRIVEN"
    );

    const completedEvents = memberEvents.filter(
      (event) => String(event.status || "").toUpperCase() === "COMPLETED"
    );

    return {
      total: memberEvents.length,
      iic: iicEvents.length,
      celebration: celebrationEvents.length,
      selfDriven: selfDrivenEvents.length,
      completed: completedEvents.length,
    };
  };

  // =========================================================
  // GO TO MEMBER DASHBOARD
  // =========================================================

  const openMemberDashboard = (member) => {
    const facultyName = getMemberName(member);

    localStorage.setItem("selectedMemberForIIC", facultyName);

    navigate("/member-dashboard");
  };

  // =========================================================
  // LINK BUTTON
  // =========================================================

  const LinkButton = ({ url, text }) => {
    if (!url) {
      return <span className="text-gray-400 text-sm">—</span>;
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
      >
        {text}
      </a>
    );
  };

  // =========================================================
  // SIDEBAR BUTTON
  // =========================================================

  const SidebarButton = ({ id, children, count, onClick }) => {
    const active = activeTab === id;

    return (
      <button
        onClick={onClick || (() => setActiveTab(id))}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition ${
          active
            ? "bg-blue-600 text-white shadow-md"
            : "text-slate-700 hover:bg-blue-50"
        }`}
      >
        <span>{children}</span>

        {count !== undefined && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              active
                ? "bg-white/20 text-white"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-xl font-semibold text-slate-600">
          Loading IIC Dashboard...
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <aside className="w-72 bg-white border-r border-slate-200 min-h-screen fixed left-0 top-0">
        <div className="px-6 py-7 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-blue-700">IIC Dashboard</h1>

          <p className="text-sm text-slate-500 mt-1">{role}</p>
        </div>

        <div className="p-4 space-y-2">
          <p className="text-xs uppercase font-bold text-slate-400 px-3 mb-3">
            Events
          </p>

          <SidebarButton id="iic" count={stats.iic}>
            IIC Events
          </SidebarButton>

          <SidebarButton id="celebration" count={stats.celebration}>
            Celebration Events
          </SidebarButton>

          <SidebarButton id="self" count={stats.selfDriven}>
            Self Driven Events
          </SidebarButton>

          <SidebarButton id="mic" count={stats.mic}>
            MIC Events
          </SidebarButton>

          {/* MIC SUBMENU */}

          {activeTab === "mic" && (
            <div className="ml-4 pl-3 border-l-2 border-blue-100 space-y-1">
              <SidebarButton id="basic">Basic</SidebarButton>

              <SidebarButton id="advanced">Advanced</SidebarButton>

              <SidebarButton id="reskilling">Reskilling</SidebarButton>

              <SidebarButton id="upskilling">Upskilling</SidebarButton>
            </div>
          )}

          {/* MEMBERS */}

          <div className="pt-6">
            <p className="text-xs uppercase font-bold text-slate-400 px-3 mb-3">
              Members
            </p>

            <SidebarButton id="members" onClick={openMemberTracker}>
              Member Tracker
            </SidebarButton>
          </div>
        </div>

        {/* USER / LOGOUT */}

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="mb-3">
            <p className="font-semibold text-slate-800">
              {localStorage.getItem("iicUsername")}
            </p>

            <p className="text-xs text-slate-500">{role}</p>
          </div>

          <button
            onClick={logout}
            className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <main className="ml-72 flex-1">
        {/* HEADER */}

        <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-10 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">
                Innovation & Entrepreneurship Cell
              </p>

              <h1 className="text-4xl font-bold mt-2">
                {activeTab === "members"
                  ? "Member Tracker"
                  : role === "President"
                  ? "President Dashboard"
                  : "Vice President Dashboard"}
              </h1>

              <p className="text-blue-100 mt-2">
                {activeTab === "members"
                  ? "View faculty activity information and access individual member dashboards."
                  : "Monitor institutional innovation activities, reports and events."}
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl px-6 py-4">
              <p className="text-sm text-blue-100">Logged in as</p>

              <p className="font-bold text-lg">{role}</p>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* ================================================= */}
          {/* MEMBER TRACKER */}
          {/* ================================================= */}

          {activeTab === "members" ? (
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      IIC Faculty Member Tracker
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      View each member's event participation and open their personalized dashboard.
                    </p>
                  </div>

                  <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl font-semibold text-sm">
                    {members.length} Members
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
                  {error}
                </div>
              )}

              {membersLoading ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                  <div className="text-3xl mb-3">🌀</div>

                  <p className="font-semibold text-slate-600">
                    Loading member information...
                  </p>
                </div>
              ) : members.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                  <p className="text-lg font-bold text-slate-700">
                    No members found.
                  </p>

                  <p className="text-sm text-slate-500 mt-2">
                    Make sure the backend member list is available.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-[1200px] w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                            S.No
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                            Faculty Name
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                            Department
                          </th>

                          <th className="px-5 py-4 text-center text-xs font-bold uppercase text-slate-500">
                            Total Events
                          </th>

                          <th className="px-5 py-4 text-center text-xs font-bold uppercase text-slate-500">
                            IIC
                          </th>

                          <th className="px-5 py-4 text-center text-xs font-bold uppercase text-slate-500">
                            Celebration
                          </th>

                          <th className="px-5 py-4 text-center text-xs font-bold uppercase text-slate-500">
                            Self Driven
                          </th>

                          <th className="px-5 py-4 text-center text-xs font-bold uppercase text-slate-500">
                            Completed
                          </th>

                          <th className="px-5 py-4 text-center text-xs font-bold uppercase text-slate-500">
                            Dashboard
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {members.map((member, index) => {
                          const memberName = getMemberName(member);

                          const memberStats = getMemberStats(member);

                          return (
                            <tr
                              key={member._id || member.id || index}
                              className="hover:bg-blue-50/50 transition"
                            >
                              <td className="px-5 py-4 text-sm font-medium text-slate-600">
                                {index + 1}
                              </td>

                              <td className="px-5 py-4">
                                <div className="font-bold text-slate-800">
                                  {memberName}
                                </div>

                                {member.email && (
                                  <div className="text-xs text-slate-400 mt-1">
                                    {member.email}
                                  </div>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <span className="inline-flex px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                                  {member.department || "CMRIT"}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-center">
                                <span className="inline-flex min-w-9 justify-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold">
                                  {memberStats.total}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-center">
                                <span className="font-bold text-blue-600">
                                  {memberStats.iic}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-center">
                                <span className="font-bold text-purple-600">
                                  {memberStats.celebration}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-center">
                                <span className="font-bold text-green-600">
                                  {memberStats.selfDriven}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-center">
                                <span className="font-bold text-emerald-600">
                                  {memberStats.completed}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-center">
                                <button
                                  onClick={() => openMemberDashboard(member)}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                                >
                                  Go to Dashboard →
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* ================================================= */}
              {/* QUARTER BANNERS */}
              {/* ================================================= */}

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Events by Quarter
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Select a quarter to view its events.
                    </p>
                  </div>

                  {selectedQuarter !== "all" && (
                    <button
                      onClick={() => setSelectedQuarter("all")}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Show All Events
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* QUARTER 1 */}
                  <button
                    onClick={() => setSelectedQuarter("1")}
                    className={`text-left rounded-2xl p-6 border transition-all duration-200 ${
                      selectedQuarter === "1"
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-[1.02]"
                        : "bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            selectedQuarter === "1"
                              ? "text-blue-100"
                              : "text-slate-500"
                          }`}
                        >
                          QUARTER
                        </p>

                        <h3 className="text-2xl font-bold mt-1">Quarter 1</h3>
                      </div>

                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                          selectedQuarter === "1"
                            ? "bg-white/20 text-white"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        Q1
                      </div>
                    </div>

                    <p
                      className={`mt-4 text-sm font-medium ${
                        selectedQuarter === "1"
                          ? "text-blue-100"
                          : "text-slate-500"
                      }`}
                    >
                      {quarterCounts[1]} event(s)
                    </p>
                  </button>

                  {/* QUARTER 2 */}
                  <button
                    onClick={() => setSelectedQuarter("2")}
                    className={`text-left rounded-2xl p-6 border transition-all duration-200 ${
                      selectedQuarter === "2"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg scale-[1.02]"
                        : "bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            selectedQuarter === "2"
                              ? "text-indigo-100"
                              : "text-slate-500"
                          }`}
                        >
                          QUARTER
                        </p>

                        <h3 className="text-2xl font-bold mt-1">Quarter 2</h3>
                      </div>

                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                          selectedQuarter === "2"
                            ? "bg-white/20 text-white"
                            : "bg-indigo-50 text-indigo-600"
                        }`}
                      >
                        Q2
                      </div>
                    </div>

                    <p
                      className={`mt-4 text-sm font-medium ${
                        selectedQuarter === "2"
                          ? "text-indigo-100"
                          : "text-slate-500"
                      }`}
                    >
                      {quarterCounts[2]} event(s)
                    </p>
                  </button>

                  {/* QUARTER 3 */}
                  <button
                    onClick={() => setSelectedQuarter("3")}
                    className={`text-left rounded-2xl p-6 border transition-all duration-200 ${
                      selectedQuarter === "3"
                        ? "bg-purple-600 text-white border-purple-600 shadow-lg scale-[1.02]"
                        : "bg-white text-slate-800 border-slate-200 hover:border-purple-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            selectedQuarter === "3"
                              ? "text-purple-100"
                              : "text-slate-500"
                          }`}
                        >
                          QUARTER
                        </p>

                        <h3 className="text-2xl font-bold mt-1">Quarter 3</h3>
                      </div>

                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                          selectedQuarter === "3"
                            ? "bg-white/20 text-white"
                            : "bg-purple-50 text-purple-600"
                        }`}
                      >
                        Q3
                      </div>
                    </div>

                    <p
                      className={`mt-4 text-sm font-medium ${
                        selectedQuarter === "3"
                          ? "text-purple-100"
                          : "text-slate-500"
                      }`}
                    >
                      {quarterCounts[3]} event(s)
                    </p>
                  </button>

                  {/* QUARTER 4 */}
                  <button
                    onClick={() => setSelectedQuarter("4")}
                    className={`text-left rounded-2xl p-6 border transition-all duration-200 ${
                      selectedQuarter === "4"
                        ? "bg-orange-500 text-white border-orange-500 shadow-lg scale-[1.02]"
                        : "bg-white text-slate-800 border-slate-200 hover:border-orange-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            selectedQuarter === "4"
                              ? "text-orange-100"
                              : "text-slate-500"
                          }`}
                        >
                          QUARTER
                        </p>

                        <h3 className="text-2xl font-bold mt-1">Quarter 4</h3>
                      </div>

                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                          selectedQuarter === "4"
                            ? "bg-white/20 text-white"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        Q4
                      </div>
                    </div>

                    <p
                      className={`mt-4 text-sm font-medium ${
                        selectedQuarter === "4"
                          ? "text-orange-100"
                          : "text-slate-500"
                      }`}
                    >
                      {quarterCounts[4]} event(s)
                    </p>
                  </button>
                </div>
              </div>

              {/* ================================================= */}
              {/* EVENT TABLE */}
              {/* ================================================= */}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
                    {activeTab} Events List ({filteredEvents.length})
                  </h3>

                  {selectedQuarter !== "all" && (
                    <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                      Filtering by Quarter {selectedQuarter}
                    </span>
                  )}
                </div>

                {filteredEvents.length === 0 ? (
                  <div className="p-16 text-center text-slate-500">
                    No events found for this selection.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                            Title / Event
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                            Faculty / Dept
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                            Date & Venue
                          </th>
                          <th className="px-5 py-4 text-center text-xs font-bold uppercase text-slate-500">
                            Report
                          </th>
                          <th className="px-5 py-4 text-center text-xs font-bold uppercase text-slate-500">
                            Media Link
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredEvents.map((event, idx) => (
                          <tr
                            key={event._id || idx}
                            className="hover:bg-slate-50/80 transition"
                          >
                            <td className="px-5 py-4">
                              <p className="font-bold text-slate-800">
                                {event.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-semibold">
                                  {event.category || "Workshop"}
                                </span>
                                {event.level && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-600 font-semibold">
                                    {event.level}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-slate-700">
                                {event.facultyName || "Unknown"}
                              </p>
                              <p className="text-xs text-slate-400">
                                {event.department || "N/A"}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-slate-700">
                                {formatDate(event.date)}
                              </p>
                              <p className="text-xs text-slate-400">
                                {event.venue || "TBD"}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-center">
                              <LinkButton
                                url={event.reportLink}
                                text="View Report"
                              />
                            </td>

                            <td className="px-5 py-4 text-center">
                              <LinkButton
                                url={event.videoLink || (event.videoLinks && event.videoLinks[0])}
                                text="Watch Media"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default IICDashboard;