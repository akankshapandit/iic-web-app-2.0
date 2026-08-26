import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import EventDetailModal from "./EventDetailModal";
import CreateSelfDrivenModal from "./CreateSelfDrivenModal";

function MemberDashboard() {

  const { memberUser, memberToken, logoutMember } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // =====================================================
  // CHECK IF PRESIDENT / VICE PRESIDENT IS VIEWING MEMBER
  // =====================================================

  const viewedFaculty = searchParams.get("faculty");
  const viewAs = searchParams.get("viewAs");

  const isAdminView =
    !!viewedFaculty &&
    (viewAs === "President" || viewAs === "Vice President");

  // =====================================================
  // STATE
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    upcoming: 0,
    distribution: {}
  });

  const [events, setEvents] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [filterType, setFilterType] =
    useState("All Events");

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] =
    useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  useEffect(() => {

    /*
      Normal member login:
      /member-dashboard

      President / Vice President:
      /member-dashboard?faculty=NAME&viewAs=President
    */

    if (isAdminView) {
      fetchAdminMemberDashboard();
    } else {

      if (!memberToken || !memberUser) {
        navigate("/members");
        return;
      }

      fetchDashboardData();
    }

  }, [
    memberToken,
    memberUser,
    isAdminView,
    viewedFaculty,
    viewAs
  ]);

  // =====================================================
  // NORMAL MEMBER DASHBOARD
  // =====================================================

  const fetchDashboardData = async () => {

    setLoading(true);

    try {

      const res = await fetch(
        "http://localhost:3000/api/members/events",
        {
          headers: {
            Authorization: `Bearer ${memberToken}`
          }
        }
      );

      if (res.ok) {

        const data = await res.json();

        setProfile(data.facultyProfile);

        setStats(
          data.stats || {
            total: 0,
            completed: 0,
            upcoming: 0,
            distribution: {}
          }
        );

        setEvents(
          Array.isArray(data.events)
            ? data.events
            : []
        );

      } else if (res.status === 401) {

        logoutMember();

        navigate("/members");

      }

    } catch (err) {

      console.error(
        "Error fetching member events:",
        err
      );

    } finally {

      setLoading(false);

    }
  };

  // =====================================================
  // PRESIDENT / VICE PRESIDENT MEMBER VIEW
  // =====================================================

  const fetchAdminMemberDashboard = async () => {

    setLoading(true);

    try {

      /*
        We use the common events endpoint because
        President / Vice President already have access
        to the IIC dashboard data.

        Then we filter the events belonging to the
        selected faculty member.
      */

      const res = await fetch(
        "http://localhost:3000/api/events"
      );

      if (!res.ok) {
        throw new Error(
          "Failed to fetch events"
        );
      }

      const data = await res.json();

      const allEvents =
        Array.isArray(data)
          ? data
          : [];

      // =================================================
      // MATCH FACULTY NAME
      // =================================================

      const normalizeName = (name) => {

        if (!name) return "";

        return name
          .replace(/\u00a0/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();

      };

      const selectedName =
        normalizeName(viewedFaculty);

      const memberEvents =
        allEvents.filter((event) => {

          const eventFaculty =
            normalizeName(
              event.facultyName ||
              event.faculty ||
              event.coordinator ||
              ""
            );

          return eventFaculty === selectedName;
        });

      // =================================================
      // BUILD PROFILE
      // =================================================

      const firstEvent =
        memberEvents.length > 0
          ? memberEvents[0]
          : null;

      const department =
        firstEvent?.department ||
        "CMRIT";

      setProfile({
        name: viewedFaculty,
        facultyName: viewedFaculty,
        department
      });

      setEvents(memberEvents);

      // =================================================
      // CALCULATE STATS
      // =================================================

      const completed =
        memberEvents.filter(
          (event) =>
            String(event.status)
              .toUpperCase() ===
            "COMPLETED"
        ).length;

      const upcoming =
        memberEvents.filter(
          (event) =>
            String(event.status)
              .toUpperCase() !==
            "COMPLETED"
        ).length;

      const distribution = {};

      memberEvents.forEach((event) => {

        const type =
          event.activityType ||
          event.category ||
          "IIC";

        let displayType = "IIC";

        if (
          String(type)
            .toUpperCase()
            .includes("MIC")
        ) {
          displayType = "MIC Event";
        }

        else if (
          String(type)
            .toUpperCase()
            .includes("CELEBRATION")
        ) {
          displayType = "Celebration";
        }

        else if (
          String(type)
            .toUpperCase()
            .includes("SELF") ||
          event.source === "SELF_DRIVEN"
        ) {
          displayType = "Self Driven";
        }

        else {
          displayType = "IIC";
        }

        distribution[displayType] =
          (distribution[displayType] || 0) + 1;

      });

      setStats({
        total: memberEvents.length,
        completed,
        upcoming,
        distribution
      });

    } catch (err) {

      console.error(
        "Error loading admin member dashboard:",
        err
      );

    } finally {

      setLoading(false);

    }
  };

  // =====================================================
  // FILTER EVENTS
  // =====================================================

  const filteredEvents = events.filter((evt) => {

    const actType =
      (
        evt.activityType ||
        evt.category ||
        "IIC"
      ).toUpperCase();

    // TYPE FILTER

    let matchesType = true;

    if (filterType === "MIC Event") {

      matchesType =
        actType.includes("MIC");

    }

    else if (
      filterType === "Celebration"
    ) {

      matchesType =
        actType.includes("CELEBRATION");

    }

    else if (
      filterType === "IIC"
    ) {

      matchesType =
        actType === "IIC";

    }

    else if (
      filterType === "Self Driven"
    ) {

      matchesType =
        actType.includes("SELF") ||
        evt.source === "SELF_DRIVEN";

    }

    // SEARCH

    let matchesSearch = true;

    if (searchTerm.trim() !== "") {

      const query =
        searchTerm
          .toLowerCase()
          .trim();

      const titleMatch =
        (evt.title || "")
          .toLowerCase()
          .includes(query);

      const typeMatch =
        (
          evt.activityType ||
          evt.category ||
          ""
        )
          .toLowerCase()
          .includes(query);

      const dateMatch =
        new Date(evt.date)
          .toLocaleDateString()
          .includes(query);

      matchesSearch =
        titleMatch ||
        typeMatch ||
        dateMatch;
    }

    return (
      matchesType &&
      matchesSearch
    );

  });

  // =====================================================
  // DISPLAY NAME
  // =====================================================

  const facultyDisplayName =
    isAdminView
      ? viewedFaculty
      : profile?.name ||
        memberUser?.facultyName ||
        memberUser?.name ||
        "Faculty Member";

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-slate-50">

        <div className="text-center">

          <div className="text-4xl mb-3">
            🌀
          </div>

          <p className="text-sm font-semibold text-gray-500">
            Loading {isAdminView
              ? `${viewedFaculty}'s`
              : "your"} personalized dashboard...
          </p>

        </div>

      </div>

    );

  }

  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">

      {/* ================================================= */}
      {/* ADMIN VIEW NOTICE */}
      {/* ================================================= */}

      {isAdminView && (

        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

          <div>

            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {viewAs} View
            </p>

            <p className="text-sm font-semibold text-blue-900 mt-1">
              Viewing {viewedFaculty}'s faculty dashboard
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/iic-dashboard")
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
          >
            ← Back to {viewAs} Dashboard
          </button>

        </div>

      )}

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">

        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 skew-x-12 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 backdrop-blur-md rounded-full text-blue-200 text-xs font-semibold border border-blue-400/30 mb-3">

              <span>🏛️</span>

              Institutional Innovation Council (IIC)

            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">

              {isAdminView
                ? facultyDisplayName
                : `Welcome, ${facultyDisplayName}`}

            </h1>

            <p className="text-blue-200 text-sm mt-1 flex items-center gap-4 flex-wrap">

              <span>
                🏢 Department:
                <strong className="text-white ml-1">
                  {profile?.department || "CMRIT"}
                </strong>
              </span>

              <span>
                •
              </span>

              <span>

                {isAdminView
                  ? `👁️ Viewed by ${viewAs}`
                  : `📧 Account: ${memberUser?.email || "Faculty Account"}`}

              </span>

            </p>

          </div>

          <div className="flex items-center gap-3">

            {!isAdminView && (

              <button
                onClick={() =>
                  setIsCreateModalOpen(true)
                }
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg transition text-xs sm:text-sm flex items-center gap-2"
              >
                <span>✨</span>
                Add Self-Driven Event
              </button>

            )}

            {isAdminView ? (

              <button
                onClick={() =>
                  navigate("/iic-dashboard")
                }
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition border border-white/20"
              >
                Back
              </button>

            ) : (

              <button
                onClick={() => {

                  logoutMember();

                  navigate("/members");

                }}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition border border-white/20"
              >
                Logout
              </button>

            )}

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* STATS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* TOTAL */}

        <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between">

          <div>

            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Events
            </p>

            <p className="text-3xl font-black text-blue-900 mt-1">
              {stats.total}
            </p>

          </div>

          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold">
            📅
          </div>

        </div>

        {/* COMPLETED */}

        <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between">

          <div>

            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Completed
            </p>

            <p className="text-3xl font-black text-green-600 mt-1">
              {stats.completed}
            </p>

          </div>

          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-xl font-bold">
            ✅
          </div>

        </div>

        {/* UPCOMING */}

        <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between">

          <div>

            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Upcoming / Pending
            </p>

            <p className="text-3xl font-black text-amber-500 mt-1">
              {stats.upcoming}
            </p>

          </div>

          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl font-bold">
            ⏳
          </div>

        </div>

        {/* DISTRIBUTION */}

        <div className="bg-white p-5 rounded-2xl border shadow-sm">

          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Event Distribution
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">

            <div className="bg-blue-50 p-1.5 rounded-lg font-semibold text-blue-800 flex justify-between">

              <span>IIC:</span>

              <span>
                {stats.distribution?.["IIC"] || 0}
              </span>

            </div>

            <div className="bg-indigo-50 p-1.5 rounded-lg font-semibold text-indigo-800 flex justify-between">

              <span>MIC:</span>

              <span>
                {stats.distribution?.["MIC Event"] || 0}
              </span>

            </div>

            <div className="bg-pink-50 p-1.5 rounded-lg font-semibold text-pink-800 flex justify-between">

              <span>Celeb:</span>

              <span>
                {stats.distribution?.["Celebration"] || 0}
              </span>

            </div>

            <div className="bg-purple-50 p-1.5 rounded-lg font-semibold text-purple-800 flex justify-between">

              <span>Self:</span>

              <span>
                {stats.distribution?.["Self Driven"] || 0}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* SEARCH + FILTER */}
      {/* ================================================= */}

      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">

        <div className="relative w-full md:w-96">

          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search events by title, type, date..."
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 outline-none"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">

          <label className="text-xs font-bold text-gray-600 whitespace-nowrap">
            Filter by Event Type:
          </label>

          <select
            className="w-full md:w-56 border px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-50 focus:ring-2 focus:ring-blue-600 outline-none"
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value)
            }
          >

            <option value="All Events">
              All Events
            </option>

            <option value="MIC Event">
              MIC Event
            </option>

            <option value="Celebration">
              Celebration
            </option>

            <option value="IIC">
              IIC
            </option>

            <option value="Self Driven">
              Self Driven
            </option>

          </select>

        </div>

      </div>

      {/* ================================================= */}
      {/* EVENTS */}
      {/* ================================================= */}

      <div className="space-y-4">

        <div className="flex items-center justify-between">

          <h2 className="text-lg font-extrabold text-gray-800">
            {isAdminView
              ? `${facultyDisplayName}'s Events`
              : `My Events`
            }

            {" "}({filteredEvents.length})

          </h2>

          <span className="text-xs text-gray-500">

            Showing events for
            {" "}
            {facultyDisplayName}

          </span>

        </div>

        {filteredEvents.length === 0 ? (

          <div className="bg-white p-12 text-center rounded-2xl border shadow-sm">

            <p className="text-base font-bold text-gray-700">
              No events found.
            </p>

            <p className="text-xs text-gray-500 mt-1">
              This faculty member currently has no events matching the selected filter.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-4">

            {filteredEvents.map((evt) => {

              const formattedDate =
                new Date(evt.date)
                  .toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    }
                  );

              const actType =
                evt.activityType ||
                evt.category ||
                "IIC";

              return (

                <div
                  key={evt._id}
                  className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >

                  <div className="space-y-2 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 uppercase">
                        {actType}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          String(evt.status)
                            .toUpperCase() ===
                          "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {evt.status || "COMPLETED"}
                      </span>

                      {evt.source ===
                        "SELF_DRIVEN" && (

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                          Self Driven
                        </span>

                      )}

                    </div>

                    <h3 className="text-base font-extrabold text-gray-800 leading-snug">
                      {evt.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500 font-medium">

                      <span>
                        🏢 Department:
                        <strong className="text-gray-800 ml-1">
                          {evt.department}
                        </strong>
                      </span>

                      <span>
                        📅 Date:
                        <strong className="text-gray-800 ml-1">
                          {formattedDate}
                        </strong>
                      </span>

                      <span>
                        📍 Venue:
                        <strong className="text-gray-800 ml-1">
                          {evt.venue || "CMRIT Campus"}
                        </strong>
                      </span>

                    </div>

                    <div className="flex items-center gap-3 pt-1">

                      {evt.reportLink ? (

                        <a
                          href={evt.reportLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                        >
                          <span>🔗</span>
                          View Report ↗
                        </a>

                      ) : (

                        <span className="text-[11px] text-gray-400">
                          No Report Link
                        </span>

                      )}

                      <span className="text-gray-300">
                        •
                      </span>

                      {evt.eventPhoto ||
                      evt.collegePhoto ? (

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                          <span>📷</span>
                          Photo Uploaded
                        </span>

                      ) : (

                        <span className="text-[11px] text-gray-400">
                          No Photo
                        </span>

                      )}

                    </div>

                  </div>

                  <div className="flex items-center gap-3 shrink-0">

                    <button
                      onClick={() => {

                        setSelectedEvent(evt);

                        setIsDetailModalOpen(true);

                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition shadow"
                    >
                      View Details
                    </button>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>

      {/* ================================================= */}
      {/* MODALS */}
      {/* ================================================= */}

      {selectedEvent && (

        <EventDetailModal
          event={selectedEvent}
          isOpen={isDetailModalOpen}
          onClose={() => {

            setIsDetailModalOpen(false);

            setSelectedEvent(null);

          }}
          onUpdate={
            isAdminView
              ? fetchAdminMemberDashboard
              : fetchDashboardData
          }
        />

      )}

      {!isAdminView && (

        <CreateSelfDrivenModal
          isOpen={isCreateModalOpen}
          onClose={() =>
            setIsCreateModalOpen(false)
          }
          onCreated={fetchDashboardData}
        />

      )}

    </div>

  );
}

export default MemberDashboard;