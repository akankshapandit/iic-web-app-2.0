import { useState, useEffect } from "react";

function DepartmentCalendar() {
  const today = new Date();

  const department = localStorage.getItem("department");

  const [activities, setActivities] = useState([]);

  const [currentMonth, setCurrentMonth] = useState(
    today.getMonth()
  );

  const [currentYear, setCurrentYear] = useState(
    today.getFullYear()
  );

  const [selectedActivities, setSelectedActivities] =
    useState([]);

  const [selectedDate, setSelectedDate] =
    useState(null);

  const [showModal, setShowModal] =
    useState(false);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [newActivity, setNewActivity] =
    useState({
      title: "",
      coordinator: "",
      date: "",
    });

  /*
  ============================================================
  FETCH EVENTS
  ============================================================
  */

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/events"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const events = await response.json();

      const departmentEvents = events
        .filter((event) => {
          if (!department) {
            return true;
          }

          return (
            String(event.department || "")
              .trim()
              .toLowerCase() ===
            String(department)
              .trim()
              .toLowerCase()
          );
        })
        .map((event) => ({
          id: event._id,

          title: event.title,

          coordinator:
            event.facultyName ||
            "Not Assigned",

          department:
            event.department ||
            department ||
            "N/A",

          date: new Date(
            event.date
          ).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),

          status: String(
            event.status || "UPCOMING"
          ).toUpperCase(),

          /*
          ======================================================
          MEDIA
          ======================================================
          */

          reportUploaded:
            !!event.reportLink,

          reportLink:
            event.reportLink || "",

          posterLink:
            event.posterLink || "",

          videoLink:
            event.videoLink || "",

          photos:
            Array.isArray(event.photos)
              ? event.photos
              : [],

          collegePhoto:
            event.collegePhoto || "",

          eventPhoto:
            event.eventPhoto || "",

          /*
          ======================================================
          OTHER EVENT INFORMATION
          ======================================================
          */

          time:
            event.time || "",

          venue:
            event.venue || "",

          activityType:
            event.activityType || "IIC",

          category:
            event.category || "Workshop",

          level:
            event.level || "",

          message:
            event.message || "",

          source:
            event.source || "",
        }));

      setActivities(departmentEvents);
    } catch (error) {
      console.error(
        "Failed to fetch events:",
        error
      );
    }
  };

  /*
  ============================================================
  INITIAL FETCH
  ============================================================
  */

  useEffect(() => {
    fetchEvents();
  }, [department]);

  /*
  ============================================================
  MONTH DATA
  ============================================================
  */

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  const monthMap = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  const firstDay = new Date(
    currentYear,
    currentMonth,
    1
  ).getDay();

  const daysInMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();

  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }

  for (
    let i = 1;
    i <= daysInMonth;
    i++
  ) {
    cells.push(i);
  }

  /*
  ============================================================
  GET ACTIVITIES FOR DATE
  ============================================================
  */

  const getActivitiesForDate = (day) => {
    return activities.filter(
      (activity) => {
        if (!activity.date) {
          return false;
        }

        const [d, month, year] =
          activity.date.split(" ");

        return (
          parseInt(d) === day &&
          monthMap[month] ===
            currentMonth &&
          parseInt(year) ===
            currentYear
        );
      }
    );
  };

  /*
  ============================================================
  DATE CLICK
  ============================================================
  */

  const handleDateClick = (day) => {
    const dayActivities =
      getActivitiesForDate(day);

    if (dayActivities.length > 0) {
      setSelectedActivities(
        dayActivities
      );

      setSelectedDate(day);

      setShowModal(true);
    }
  };

  /*
  ============================================================
  MARK COMPLETED
  ============================================================
  */

  const handleMarkCompleted =
    async (id) => {
      try {
        const response =
          await fetch(
            `http://localhost:3000/api/events/${id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                status: "COMPLETED",
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update event"
          );
        }

        await fetchEvents();

        setSelectedActivities(
          (prev) =>
            prev.map((activity) =>
              activity.id === id
                ? {
                    ...activity,
                    status:
                      "COMPLETED",
                  }
                : activity
            )
        );
      } catch (error) {
        console.error(
          "Failed to mark event completed:",
          error
        );

        alert(
          error.message ||
            "Failed to update event."
        );
      }
    };

  /*
  ============================================================
  SAVE REPORT / MEDIA
  ============================================================
  */

  const handleMediaUpload =
    async (
      activityId,
      files,
      posterLink,
      videoLink
    ) => {
      try {
        setUploading(true);

        const formData =
          new FormData();

        /*
        ======================================================
        TEXT LINKS
        ======================================================
        */

        formData.append(
          "posterLink",
          posterLink || ""
        );

        formData.append(
          "videoLink",
          videoLink || ""
        );

        /*
        ======================================================
        REPORT
        ======================================================
        */

        if (files.report) {
          formData.append(
            "report",
            files.report
          );
        }

        /*
        ======================================================
        POSTER
        ======================================================
        */

        if (files.poster) {
          formData.append(
            "poster",
            files.poster
          );
        }

        /*
        ======================================================
        EVENT PHOTOS
        ======================================================
        */

        if (
          files.photos &&
          files.photos.length > 0
        ) {
          files.photos.forEach(
            (photo) => {
              formData.append(
                "photos",
                photo
              );
            }
          );
        }

        /*
        ======================================================
        SEND TO BACKEND
        ======================================================
        */

        const response =
          await fetch(
            `http://localhost:3000/api/events/${activityId}/media`,
            {
              method: "PUT",
              body: formData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to upload media"
          );
        }

        /*
        ======================================================
        BACKEND RETURNS UPDATED EVENT
        ======================================================
        */

        const updatedEvent =
          data.event;

        const updatedActivity =
          {
            id: updatedEvent._id,

            title:
              updatedEvent.title,

            coordinator:
              updatedEvent.facultyName ||
              "Not Assigned",

            department:
              updatedEvent.department ||
              department ||
              "N/A",

            date: new Date(
              updatedEvent.date
            ).toLocaleDateString(
              "en-GB",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            ),

            status: String(
              updatedEvent.status ||
                "UPCOMING"
            ).toUpperCase(),

            reportUploaded:
              !!updatedEvent.reportLink,

            reportLink:
              updatedEvent.reportLink ||
              "",

            posterLink:
              updatedEvent.posterLink ||
              "",

            videoLink:
              updatedEvent.videoLink ||
              "",

            photos:
              Array.isArray(
                updatedEvent.photos
              )
                ? updatedEvent.photos
                : [],

            collegePhoto:
              updatedEvent.collegePhoto ||
              "",

            eventPhoto:
              updatedEvent.eventPhoto ||
              "",

            time:
              updatedEvent.time ||
              "",

            venue:
              updatedEvent.venue ||
              "",

            activityType:
              updatedEvent.activityType ||
              "IIC",

            category:
              updatedEvent.category ||
              "Workshop",

            level:
              updatedEvent.level ||
              "",

            message:
              updatedEvent.message ||
              "",

            source:
              updatedEvent.source ||
              "",
          };

        /*
        ======================================================
        UPDATE CALENDAR STATE
        ======================================================
        */

        setActivities(
          (prev) =>
            prev.map(
              (activity) =>
                activity.id ===
                activityId
                  ? updatedActivity
                  : activity
            )
        );

        /*
        ======================================================
        UPDATE MODAL STATE
        ======================================================
        */

        setSelectedActivities(
          (prev) =>
            prev.map(
              (activity) =>
                activity.id ===
                activityId
                  ? updatedActivity
                  : activity
            )
        );

        alert(
          "Report and event media saved successfully!"
        );
      } catch (error) {
        console.error(
          "Media upload failed:",
          error
        );

        alert(
          error.message ||
            "Failed to save report/media."
        );
      } finally {
        setUploading(false);
      }
    };

  /*
  ============================================================
  ADD ACTIVITY
  ============================================================
  */

  const handleAddActivity =
    async () => {
      if (
        !newActivity.title ||
        !newActivity.coordinator ||
        !newActivity.date
      ) {
        alert(
          "Please fill all fields."
        );

        return;
      }

      try {
        const response =
          await fetch(
            "http://localhost:3000/api/events",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                title:
                  newActivity.title,

                department:
                  department,

                date:
                  newActivity.date,

                facultyName:
                  newActivity.coordinator,

                category:
                  "Workshop",

                activityType:
                  "IIC",

                status:
                  "UPCOMING",

                source:
                  "CALENDAR",
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to create event"
          );
        }

        setShowAddModal(false);

        setNewActivity({
          title: "",
          coordinator: "",
          date: "",
        });

        await fetchEvents();

        alert(
          "Activity added successfully!"
        );
      } catch (error) {
        console.error(
          "Failed to add activity:",
          error
        );

        alert(
          error.message ||
            "Failed to save activity. Please try again."
        );
      }
    };

  /*
  ============================================================
  RETURN
  ============================================================
  */

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {months[currentMonth]}{" "}
            {currentYear}
          </h2>

          <p className="text-gray-500 mt-1">
            Click any highlighted date to
            view activity details.
          </p>
        </div>

        <button
          onClick={() =>
            setShowAddModal(true)
          }
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
        >
          + Add Activity
        </button>

      </div>

      {/* MONTH NAVIGATION */}

      <div className="flex justify-between items-center mb-8">

        <button
          onClick={() => {
            if (currentMonth === 0) {
              setCurrentMonth(11);

              setCurrentYear(
                currentYear - 1
              );
            } else {
              setCurrentMonth(
                currentMonth - 1
              );
            }
          }}
          className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
        >
          ◀
        </button>

        <h3 className="text-2xl font-bold">
          {months[currentMonth]}{" "}
          {currentYear}
        </h3>

        <button
          onClick={() => {
            if (currentMonth === 11) {
              setCurrentMonth(0);

              setCurrentYear(
                currentYear + 1
              );
            } else {
              setCurrentMonth(
                currentMonth + 1
              );
            }
          }}
          className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
        >
          ▶
        </button>

      </div>

      {/* WEEKDAYS */}

      <div className="grid grid-cols-7 gap-3 mb-3">

        {days.map((day) => (
          <div
            key={day}
            className="text-center bg-blue-50 rounded-xl py-3 font-bold text-blue-700"
          >
            {day}
          </div>
        ))}

      </div>

      {/* CALENDAR */}

      <div className="grid grid-cols-7 gap-3">

        {cells.map(
          (date, index) => {
            const dayActivities =
              date
                ? getActivitiesForDate(
                    date
                  )
                : [];

            return (
              <div
                key={index}
                onClick={() =>
                  date &&
                  handleDateClick(
                    date
                  )
                }
                className={`border rounded-2xl h-36 p-2 overflow-y-auto transition ${
                  date
                    ? "cursor-pointer hover:bg-blue-50 hover:shadow-lg"
                    : "bg-gray-50"
                }`}
              >

                {date && (
                  <>
                    <div className="flex justify-between items-center mb-2">

                      <span className="font-bold text-gray-700">
                        {date}
                      </span>

                      {dayActivities.length >
                        0 && (
                        <span
                          className={`w-3 h-3 rounded-full ${
                            dayActivities.every(
                              (a) =>
                                a.status ===
                                "COMPLETED"
                            )
                              ? "bg-green-500"
                              : "bg-orange-500"
                          }`}
                        />
                      )}

                    </div>

                    {dayActivities.map(
                      (activity) => (
                        <div
                          key={
                            activity.id
                          }
                          className={`mb-2 rounded-lg px-2 py-1 text-[10px] font-semibold break-words ${
                            activity.status ===
                            "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {
                            activity.title
                          }
                        </div>
                      )
                    )}
                  </>
                )}

              </div>
            );
          }
        )}

      </div>

      {/* ================================================= */}
      {/* ACTIVITY DETAILS MODAL */}
      {/* ================================================= */}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto">

            {/* HEADER */}

            <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white">

              <div className="flex justify-between items-center">

                <div>

                  <h2 className="text-2xl font-bold">
                    Activity Details
                  </h2>

                  <p className="text-blue-100 mt-1">
                    {selectedDate}{" "}
                    {months[currentMonth]}{" "}
                    {currentYear}
                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                  className="bg-white/20 hover:bg-white/30 rounded-full w-10 h-10 text-xl"
                >
                  ✕
                </button>

              </div>

            </div>

            {/* CONTENT */}

            <div className="p-6">

              {selectedActivities.map(
                (activity) => (
                  <ActivityMediaCard
                    key={
                      activity.id
                    }
                    activity={
                      activity
                    }
                    uploading={
                      uploading
                    }
                    onMarkCompleted={
                      handleMarkCompleted
                    }
                    onUploadMedia={
                      handleMediaUpload
                    }
                  />
                )
              )}

            </div>

          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* ADD ACTIVITY MODAL */}
      {/* ================================================= */}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">

            <h2 className="text-2xl font-bold mb-6">
              Add New Activity
            </h2>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Activity Title"
                value={
                  newActivity.title
                }
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    title:
                      e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3"
              />

              <input
                type="text"
                placeholder="Coordinator"
                value={
                  newActivity.coordinator
                }
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    coordinator:
                      e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3"
              />

              <input
                type="date"
                value={
                  newActivity.date
                }
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    date:
                      e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3"
              />

            </div>

            <div className="flex justify-end gap-3 mt-8">

              <button
                onClick={() =>
                  setShowAddModal(
                    false
                  )
                }
                className="px-5 py-2 rounded-xl border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleAddActivity
                }
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-xl"
              >
                Add Activity
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/*
================================================================
ACTIVITY MEDIA CARD
================================================================
*/

function ActivityMediaCard({
  activity,
  uploading,
  onMarkCompleted,
  onUploadMedia,
}) {
  const [reportFile, setReportFile] =
    useState(null);

  const [posterFile, setPosterFile] =
    useState(null);

  const [photoFiles, setPhotoFiles] =
    useState([]);

  const [posterLink, setPosterLink] =
    useState(
      activity.posterLink || ""
    );

  const [videoLink, setVideoLink] =
    useState(
      activity.videoLink || ""
    );

  /*
  ============================================================
  SAVE MEDIA
  ============================================================
  */

  const handleSave = () => {
    if (
      !reportFile &&
      !posterFile &&
      !photoFiles.length &&
      !posterLink.trim() &&
      !videoLink.trim()
    ) {
      alert(
        "Please select a file or enter a link."
      );

      return;
    }

    onUploadMedia(
      activity.id,
      {
        report: reportFile,
        poster: posterFile,
        photos: photoFiles,
      },
      posterLink,
      videoLink
    );
  };

  return (
    <div className="border rounded-2xl p-5 mb-5 hover:shadow-lg transition">

      {/* TITLE */}

      <div className="flex justify-between items-start gap-4">

        <h3 className="text-xl font-bold text-gray-800">
          {activity.title}
        </h3>

        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
            activity.status ===
            "COMPLETED"
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {activity.status}
        </span>

      </div>

      {/* DETAILS */}

      <div className="mt-4 space-y-2 text-gray-600">

        <p>
          👤{" "}
          <span className="font-semibold">
            Coordinator:
          </span>{" "}
          {activity.coordinator}
        </p>

        <p>
          🏢{" "}
          <span className="font-semibold">
            Department:
          </span>{" "}
          {activity.department}
        </p>

        <p>
          📅{" "}
          <span className="font-semibold">
            Date:
          </span>{" "}
          {activity.date}
        </p>

        {activity.time && (
          <p>
            ⏰{" "}
            <span className="font-semibold">
              Time:
            </span>{" "}
            {activity.time}
          </p>
        )}

        {activity.venue && (
          <p>
            📍{" "}
            <span className="font-semibold">
              Venue:
            </span>{" "}
            {activity.venue}
          </p>
        )}

      </div>

      {/* ================================================= */}
      {/* EXISTING MEDIA */}
      {/* ================================================= */}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">

        {activity.reportLink && (
          <a
            href={
              activity.reportLink
            }
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-3 rounded-xl font-semibold"
          >
            📄 View Report
          </a>
        )}

        {activity.posterLink && (
          <a
            href={
              activity.posterLink
            }
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-3 rounded-xl font-semibold"
          >
            🖼️ View Poster
          </a>
        )}

        {activity.videoLink && (
          <a
            href={
              activity.videoLink
            }
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-50 text-purple-700 border border-purple-200 px-4 py-3 rounded-xl font-semibold"
          >
            🎥 View Event Video
          </a>
        )}

        {activity.photos &&
          activity.photos.length >
            0 && (
            <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-3 rounded-xl font-semibold">
              📷{" "}
              {activity.photos.length}{" "}
              Photo
              {activity.photos.length >
              1
                ? "s"
                : ""}{" "}
              Uploaded
            </div>
          )}

      </div>

      {/* ================================================= */}
      {/* COLLEGE / EVENT PHOTOS */}
      {/* ================================================= */}

      {(activity.collegePhoto ||
        activity.eventPhoto) && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">

          {activity.collegePhoto && (
            <div>
              <p className="text-xs font-bold text-gray-600 mb-2">
                🏛️ College Photo
              </p>

              <a
                href={
                  activity.collegePhoto
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={
                    activity.collegePhoto
                  }
                  alt="College"
                  className="w-full h-40 object-cover rounded-xl border hover:opacity-90"
                />
              </a>
            </div>
          )}

          {activity.eventPhoto && (
            <div>
              <p className="text-xs font-bold text-gray-600 mb-2">
                📸 Event Photo
              </p>

              <a
                href={
                  activity.eventPhoto
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={
                    activity.eventPhoto
                  }
                  alt="Event"
                  className="w-full h-40 object-cover rounded-xl border hover:opacity-90"
                />
              </a>
            </div>
          )}

        </div>
      )}

      {/* ================================================= */}
      {/* MEDIA UPLOAD */}
      {/* ================================================= */}

      <div className="mt-6 border-t pt-6">

        <h4 className="text-lg font-bold text-gray-800 mb-4">
          📁 Event Report & Media
        </h4>

        {/* REPORT */}

        <div className="mb-5">

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📄 Upload Report
          </label>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) =>
              setReportFile(
                e.target.files?.[0] ||
                  null
              )
            }
            className="w-full border rounded-xl p-3"
          />

          {reportFile && (
            <p className="text-xs text-green-600 mt-2">
              Selected:{" "}
              {reportFile.name}
            </p>
          )}

        </div>

        {/* POSTER LINK */}

        <div className="mb-5">

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🖼️ Poster Link
          </label>

          <input
            type="url"
            value={posterLink}
            onChange={(e) =>
              setPosterLink(
                e.target.value
              )
            }
            placeholder="Paste Google Drive / poster link"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />

        </div>

        {/* POSTER FILE */}

        <div className="mb-5">

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🖼️ Or Upload Poster
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setPosterFile(
                e.target.files?.[0] ||
                  null
              )
            }
            className="w-full border rounded-xl p-3"
          />

          {posterFile && (
            <p className="text-xs text-green-600 mt-2">
              Selected:{" "}
              {posterFile.name}
            </p>
          )}

        </div>

        {/* VIDEO */}

        <div className="mb-5">

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🎥 Event Video Link
          </label>

          <input
            type="url"
            value={videoLink}
            onChange={(e) =>
              setVideoLink(
                e.target.value
              )
            }
            placeholder="Paste Google Drive / YouTube video link"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          />

        </div>

        {/* PHOTOS */}

        <div className="mb-5">

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📷 Event Photos
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) =>
              setPhotoFiles(
                Array.from(
                  e.target.files || []
                )
              )
            }
            className="w-full border rounded-xl p-3"
          />

          {photoFiles.length >
            0 && (
            <p className="text-xs text-green-600 mt-2">
              {photoFiles.length} photo
              {photoFiles.length >
              1
                ? "s"
                : ""}{" "}
              selected
            </p>
          )}

        </div>

        {/* SAVE */}

        <button
          onClick={handleSave}
          disabled={uploading}
          className={`w-full ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          } text-white px-5 py-3 rounded-xl font-semibold shadow-md transition`}
        >
          {uploading
            ? "Saving Media..."
            : "💾 Save Report & Media"}
        </button>

      </div>

      {/* ================================================= */}
      {/* COMPLETION */}
      {/* ================================================= */}

      <div className="mt-6">

        {activity.status ===
        "COMPLETED" ? (
          <div className="inline-block bg-green-100 text-green-700 px-5 py-3 rounded-xl font-semibold">
            ✔ Activity Completed
          </div>
        ) : (
          <button
            onClick={() =>
              onMarkCompleted(
                activity.id
              )
            }
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
          >
            ✓ Mark Completed
          </button>
        )}

      </div>

    </div>
  );
}

export default DepartmentCalendar;