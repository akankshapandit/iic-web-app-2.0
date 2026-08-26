import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function IICDashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState("iic");
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

      const response = await fetch(
        "http://localhost:3000/api/events"
      );

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

      const response = await fetch(
        "http://localhost:3000/api/members/list"
      );

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
  // FILTER EVENTS
  // =========================================================

  const filteredEvents = useMemo(() => {
    if (activeTab === "members") {
      return [];
    }

    // IIC EVENTS
    // Self Driven events are also considered IIC events
    if (activeTab === "iic") {
      return events.filter(
        (event) =>
          (
            event.activityType === "IIC" ||
            event.activityType === "SELF_DRIVEN" ||
            event.source === "SELF_DRIVEN"
          ) &&
          !event.isCelebration &&
          event.activityType !== "CELEBRATION"
      );
    }

    // CELEBRATION EVENTS
    if (activeTab === "celebration") {
      return events.filter(
        (event) =>
          event.isCelebration ||
          event.activityType === "CELEBRATION"
      );
    }

    // SELF DRIVEN EVENTS
    if (activeTab === "self") {
      return events.filter(
        (event) =>
          event.activityType === "SELF_DRIVEN" ||
          event.source === "SELF_DRIVEN"
      );
    }

    // MIC EVENTS
    if (activeTab === "mic") {
      return events.filter(
        (event) =>
          event.activityType === "MIC"
      );
    }

    // MIC LEVELS
    if (
      [
        "basic",
        "advanced",
        "reskilling",
        "upskilling",
      ].includes(activeTab)
    ) {
      return events.filter(
        (event) =>
          event.activityType === "MIC" &&
          (
            event.level ||
            event.micLevel ||
            ""
          ).toUpperCase() ===
            activeTab.toUpperCase()
      );
    }

    return [];
  }, [events, activeTab]);

  // =========================================================
  // EVENT STATS
  // =========================================================

  const stats = {
    total: events.length,

    iic: events.filter(
      (event) =>
        (
          event.activityType === "IIC" ||
          event.activityType === "SELF_DRIVEN" ||
          event.source === "SELF_DRIVEN"
        ) &&
        !event.isCelebration &&
        event.activityType !== "CELEBRATION"
    ).length,

    celebration: events.filter(
      (event) =>
        event.isCelebration ||
        event.activityType === "CELEBRATION"
    ).length,

    selfDriven: events.filter(
      (event) =>
        event.activityType === "SELF_DRIVEN" ||
        event.source === "SELF_DRIVEN"
    ).length,

    mic: events.filter(
      (event) =>
        event.activityType === "MIC"
    ).length,
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

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // MEMBER NAME NORMALIZATION
  // =========================================================

  const getMemberName = (member) => {
    return (
      member.facultyName ||
      member.name ||
      member.faculty ||
      "Unknown Faculty"
    );
  };

  // =========================================================
  // MEMBER EVENTS
  // =========================================================

  const getMemberEvents = (member) => {
    const memberName = getMemberName(member)
      .trim()
      .toLowerCase();

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
        (
          event.activityType === "IIC" ||
          event.activityType === "SELF_DRIVEN" ||
          event.source === "SELF_DRIVEN"
        ) &&
        !event.isCelebration &&
        event.activityType !== "CELEBRATION"
    );

    const celebrationEvents = memberEvents.filter(
      (event) =>
        event.isCelebration ||
        event.activityType === "CELEBRATION"
    );

    const selfDrivenEvents = memberEvents.filter(
      (event) =>
        event.activityType === "SELF_DRIVEN" ||
        event.source === "SELF_DRIVEN"
    );

    const completedEvents = memberEvents.filter(
      (event) =>
        String(event.status || "")
          .toUpperCase() === "COMPLETED"
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
  // GO DIRECTLY TO MEMBER DASHBOARD
  // =========================================================

  const openMemberDashboard = (member) => {
    const facultyName = getMemberName(member);

    /*
      We store the selected faculty temporarily.

      MemberDashboard will read this value and show
      the selected faculty's dashboard without requiring
      the faculty member to log in again.
    */

    localStorage.setItem(
      "selectedMemberForIIC",
      facultyName
    );

    navigate("/member-dashboard");
  };

  // =========================================================
  // LINK BUTTON
  // =========================================================

  const LinkButton = ({ url, text }) => {
    if (!url) {
      return (
        <span className="text-gray-400 text-sm">
          —
        </span>
      );
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

  const SidebarButton = ({
    id,
    children,
    count,
    onClick,
  }) => {
    const active = activeTab === id;

    return (
      <button
        onClick={
          onClick ||
          (() => setActiveTab(id))
        }
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

        {/* LOGO / TITLE */}

        <div className="px-6 py-7 border-b border-slate-200">

          <h1 className="text-2xl font-bold text-blue-700">
            IIC Dashboard
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            {role}
          </p>

        </div>

        {/* NAVIGATION */}

        <div className="p-4 space-y-2">

          <p className="text-xs uppercase font-bold text-slate-400 px-3 mb-3">
            Events
          </p>

          <SidebarButton
            id="iic"
            count={stats.iic}
          >
            IIC Events
          </SidebarButton>

          <SidebarButton
            id="celebration"
            count={stats.celebration}
          >
            Celebration Events
          </SidebarButton>

          <SidebarButton
            id="self"
            count={stats.selfDriven}
          >
            Self Driven Events
          </SidebarButton>

          <SidebarButton
            id="mic"
            count={stats.mic}
          >
            MIC Events
          </SidebarButton>

          {/* MIC SUBMENU */}

          {activeTab === "mic" && (
            <div className="ml-4 pl-3 border-l-2 border-blue-100 space-y-1">

              <SidebarButton id="basic">
                Basic
              </SidebarButton>

              <SidebarButton id="advanced">
                Advanced
              </SidebarButton>

              <SidebarButton id="reskilling">
                Reskilling
              </SidebarButton>

              <SidebarButton id="upskilling">
                Upskilling
              </SidebarButton>

            </div>
          )}

          {/* MEMBERS */}

          <div className="pt-6">

            <p className="text-xs uppercase font-bold text-slate-400 px-3 mb-3">
              Members
            </p>

            <SidebarButton
              id="members"
              onClick={openMemberTracker}
            >
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

            <p className="text-xs text-slate-500">
              {role}
            </p>

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

              <p className="text-sm text-blue-100">
                Logged in as
              </p>

              <p className="font-bold text-lg">
                {role}
              </p>

            </div>

          </div>

        </header>

        <div className="p-8">

          {/* ================================================= */}
          {/* MEMBER TRACKER */}
          {/* ================================================= */}

          {activeTab === "members" ? (

            <div>

              {/* MEMBER TRACKER HEADER */}

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

              {/* LOADING */}

              {membersLoading ? (

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">

                  <div className="text-3xl mb-3">
                    🌀
                  </div>

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

                          const memberName =
                            getMemberName(member);

                          const memberStats =
                            getMemberStats(member);

                          return (

                            <tr
                              key={
                                member._id ||
                                member.id ||
                                index
                              }
                              className="hover:bg-blue-50/50 transition"
                            >

                              {/* S.NO */}

                              <td className="px-5 py-4 text-sm font-medium text-slate-600">
                                {index + 1}
                              </td>

                              {/* FACULTY */}

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

                              {/* DEPARTMENT */}

                              <td className="px-5 py-4">

                                <span className="inline-flex px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                                  {member.department || "CMRIT"}
                                </span>

                              </td>

                              {/* TOTAL */}

                              <td className="px-5 py-4 text-center">

                                <span className="inline-flex min-w-9 justify-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold">
                                  {memberStats.total}
                                </span>

                              </td>

                              {/* IIC */}

                              <td className="px-5 py-4 text-center">

                                <span className="font-bold text-blue-600">
                                  {memberStats.iic}
                                </span>

                              </td>

                              {/* CELEBRATION */}

                              <td className="px-5 py-4 text-center">

                                <span className="font-bold text-purple-600">
                                  {memberStats.celebration}
                                </span>

                              </td>

                              {/* SELF DRIVEN */}

                              <td className="px-5 py-4 text-center">

                                <span className="font-bold text-green-600">
                                  {memberStats.selfDriven}
                                </span>

                              </td>

                              {/* COMPLETED */}

                              <td className="px-5 py-4 text-center">

                                <span className="font-bold text-emerald-600">
                                  {memberStats.completed}
                                </span>

                              </td>

                              {/* DASHBOARD */}

                              <td className="px-5 py-4 text-center">

                                <button
                                  onClick={() =>
                                    openMemberDashboard(member)
                                  }
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
              {/* STAT CARDS */}
              {/* ================================================= */}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">

                {/* TOTAL */}

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

                  <p className="text-slate-500 text-sm">
                    Total Events
                  </p>

                  <p className="text-4xl font-bold mt-2">
                    {stats.total}
                  </p>

                </div>

                {/* IIC */}

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

                  <p className="text-slate-500 text-sm">
                    IIC Events
                  </p>

                  <p className="text-4xl font-bold text-blue-600 mt-2">
                    {stats.iic}
                  </p>

                </div>

                {/* CELEBRATIONS */}

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

                  <p className="text-slate-500 text-sm">
                    Celebrations
                  </p>

                  <p className="text-4xl font-bold text-purple-600 mt-2">
                    {stats.celebration}
                  </p>

                </div>

                {/* SELF DRIVEN */}

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

                  <p className="text-slate-500 text-sm">
                    Self Driven
                  </p>

                  <p className="text-4xl font-bold text-green-600 mt-2">
                    {stats.selfDriven}
                  </p>

                </div>

                {/* MIC */}

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

                  <p className="text-slate-500 text-sm">
                    MIC Events
                  </p>

                  <p className="text-4xl font-bold text-orange-500 mt-2">
                    {stats.mic}
                  </p>

                </div>

              </div>

              {/* ERROR */}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
                  {error}
                </div>
              )}

              {/* ================================================= */}
              {/* EVENTS TABLE */}
              {/* ================================================= */}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                <div className="px-6 py-5 border-b border-slate-200">

                  <h2 className="text-2xl font-bold text-slate-800">

                    {activeTab === "iic" &&
                      "IIC Events"}

                    {activeTab === "celebration" &&
                      "Celebration Events"}

                    {activeTab === "self" &&
                      "Self Driven Events"}

                    {activeTab === "mic" &&
                      "MIC Events"}

                    {activeTab === "basic" &&
                      "MIC - Basic"}

                    {activeTab === "advanced" &&
                      "MIC - Advanced"}

                    {activeTab === "reskilling" &&
                      "MIC - Reskilling"}

                    {activeTab === "upskilling" &&
                      "MIC - Upskilling"}

                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {filteredEvents.length} event(s)
                  </p>

                </div>

                <div className="overflow-x-auto">

                  <table className="min-w-[1400px] w-full">

                    <thead className="bg-slate-50">

                      <tr>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                          S.No
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                          Title
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                          Date
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                          Faculty / Coordinator
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                          Department
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                          Report
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                          Poster
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                          Video
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                          Photos
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {filteredEvents.length === 0 ? (

                        <tr>

                          <td
                            colSpan="9"
                            className="text-center py-16 text-slate-500"
                          >
                            No events found.
                          </td>

                        </tr>

                      ) : (

                        filteredEvents.map(
                          (event, index) => (

                            <tr
                              key={event._id}
                              className="hover:bg-slate-50"
                            >

                              <td className="px-5 py-4 font-medium">
                                {index + 1}
                              </td>

                              <td className="px-5 py-4">

                                <div className="font-semibold text-slate-800">
                                  {event.title}
                                </div>

                                {event.category && (
                                  <div className="text-xs text-slate-400 mt-1">
                                    {event.category}
                                  </div>
                                )}

                              </td>

                              <td className="px-5 py-4 whitespace-nowrap">
                                {formatDate(event.date)}
                              </td>

                              <td className="px-5 py-4">
                                {event.facultyName || "N/A"}
                              </td>

                              <td className="px-5 py-4">
                                {event.department || "N/A"}
                              </td>

                              <td className="px-5 py-4">

                                <LinkButton
                                  url={event.reportLink}
                                  text="View Report"
                                />

                              </td>

                              <td className="px-5 py-4">

                                <LinkButton
                                  url={event.posterLink}
                                  text="View Poster"
                                />

                              </td>

                              <td className="px-5 py-4">

                                <LinkButton
                                  url={event.videoLink}
                                  text="Watch Video"
                                />

                              </td>

                              <td className="px-5 py-4">

                                {event.photos?.length > 0 ? (

                                  <a
                                    href={event.photos[0]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    View Photos
                                  </a>

                                ) : event.eventPhoto ? (

                                  <a
                                    href={event.eventPhoto}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    View Photos
                                  </a>

                                ) : (

                                  <span className="text-gray-400">
                                    —
                                  </span>

                                )}

                              </td>

                            </tr>

                          )
                        )

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </>

          )}

        </div>

      </main>

    </div>
  );
}

export default IICDashboard;