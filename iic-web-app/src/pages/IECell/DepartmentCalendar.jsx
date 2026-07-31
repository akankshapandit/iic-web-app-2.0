import { useState } from "react";
import { departmentActivities } from "../../data/activities";

function DepartmentCalendar() {
  const today = new Date();

  const department = localStorage.getItem("department");

  const [activities, setActivities] = useState(
    departmentActivities[department] || []
  );

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);

  const [newActivity, setNewActivity] = useState({
    title: "",
    coordinator: "",
    date: "",
  });

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

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const daysInMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();

  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    cells.push(i);
  }

  const getActivitiesForDate = (day) => {
    return activities.filter((activity) => {
      if (!activity.date) return false;

      const [d, month, year] = activity.date.split(" ");

      return (
        parseInt(d) === day &&
        monthMap[month] === currentMonth &&
        parseInt(year) === currentYear
      );
    });
  };

  const handleDateClick = (day) => {
    const dayActivities = getActivitiesForDate(day);

    if (dayActivities.length > 0) {
      setSelectedActivities(dayActivities);
      setSelectedDate(day);
      setShowModal(true);
    }
  };

  const handleMarkCompleted = (id) => {
    setActivities((prev) => {
      const updated = prev.map((activity) =>
        activity.id === id
          ? { ...activity, status: "Completed" }
          : activity
      );

      setSelectedActivities(
        updated.filter((activity) =>
          selectedActivities.some((a) => a.id === activity.id)
        )
      );

      return updated;
    });
  };

  const handleReportUpload = (id, file) => {
    if (!file) return;

    const fileURL = URL.createObjectURL(file);

    setActivities((prev) => {
      const updated = prev.map((activity) =>
        activity.id === id
          ? {
              ...activity,
              reportUploaded: true,
              reportLink: fileURL,
            }
          : activity
      );

      setSelectedActivities(
        updated.filter((activity) =>
          selectedActivities.some((a) => a.id === activity.id)
        )
      );

      return updated;
    });
  };

  const handleAddActivity = () => {
    if (
      !newActivity.title ||
      !newActivity.coordinator ||
      !newActivity.date
    ) {
      alert("Please fill all fields.");
      return;
    }

    const activity = {
      id: Date.now(),
      title: newActivity.title,
      coordinator: newActivity.coordinator,
      date: newActivity.date,
      status: "Upcoming",
      reportUploaded: false,
      reportLink: "",
    };

    setActivities((prev) => [...prev, activity]);

    setShowAddModal(false);

    setNewActivity({
      title: "",
      coordinator: "",
      date: "",
    });
  };

  

        
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {months[currentMonth]} {currentYear}
          </h2>

          <p className="text-gray-500 mt-1">
            Click any highlighted date to view activity details.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
        >
          + Add Activity
        </button>

      </div>

      {/* Month Navigation */}

      <div className="flex justify-between items-center mb-8">

        <button
          onClick={() => {
            if (currentMonth === 0) {
              setCurrentMonth(11);
              setCurrentYear(currentYear - 1);
            } else {
              setCurrentMonth(currentMonth - 1);
            }
          }}
          className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
        >
          ◀
        </button>

        <h3 className="text-2xl font-bold">
          {months[currentMonth]} {currentYear}
        </h3>

        <button
          onClick={() => {
            if (currentMonth === 11) {
              setCurrentMonth(0);
              setCurrentYear(currentYear + 1);
            } else {
              setCurrentMonth(currentMonth + 1);
            }
          }}
          className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
        >
          ▶
        </button>

      </div>

      {/* Weekdays */}

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

      {/* Calendar */}

      <div className="grid grid-cols-7 gap-3">

        {cells.map((date, index) => {

          const dayActivities = date
            ? getActivitiesForDate(date)
            : [];

          return (
            <div
              key={index}
              onClick={() => date && handleDateClick(date)}
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

                    {dayActivities.length > 0 && (
                      <span
                        className={`w-3 h-3 rounded-full ${
                          dayActivities.every(
                            (a) => a.status === "Completed"
                          )
                            ? "bg-green-500"
                            : "bg-orange-500"
                        }`}
                      />
                    )}

                  </div>

                  {dayActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`mb-2 rounded-lg px-2 py-1 text-[10px] font-semibold break-words ${
                        activity.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {activity.title}
                    </div>
                  ))}

                </>
              )}

            </div>
          );

        })}

      </div>

            {/* ================= ACTIVITY DETAILS MODAL ================= */}

      {/* ================= PREMIUM ACTIVITY DETAILS MODAL ================= */}

{showModal && (
  <div className="
    fixed inset-0 
    bg-black/50 
    backdrop-blur-sm
    flex 
    items-center 
    justify-center 
    z-50 
    p-6
  ">

    <div className="
      bg-white
      rounded-3xl
      shadow-2xl
      w-full
      max-w-xl
      overflow-hidden
      animate-fadeIn
    ">


      {/* Header */}

      <div className="
        bg-gradient-to-r 
        from-blue-700 
        to-indigo-600
        p-6
        text-white
      ">

        <div className="flex justify-between items-center">

          <div>
            <h2 className="text-2xl font-bold">
              Activity Details
            </h2>

            <p className="text-blue-100 mt-1">
              {selectedDate} {months[currentMonth]} {currentYear}
            </p>
          </div>


          <button
            onClick={() => setShowModal(false)}
            className="
              bg-white/20
              hover:bg-white/30
              rounded-full
              w-10
              h-10
              text-xl
            "
          >
            ✕
          </button>

        </div>

      </div>



      {/* Content */}

      <div className="p-6">


        {selectedActivities.map((activity)=>(

          <div
            key={activity.id}
            className="
              border
              rounded-2xl
              p-5
              mb-5
              hover:shadow-lg
              transition
            "
          >


            <div className="flex justify-between items-start">


              <h3 className="
                text-xl
                font-bold
                text-gray-800
              ">
                {activity.title}
              </h3>


              <span
                className={`
                px-3
                py-1
                rounded-full
                text-sm
                font-semibold

                ${
                  activity.status === "Completed"
                  ?
                  "bg-green-100 text-green-700"
                  :
                  "bg-orange-100 text-orange-700"
                }
                `}
              >

                {activity.status}

              </span>


            </div>



            <div className="mt-4 space-y-2 text-gray-600">


              <p>
                👤 
                <span className="font-semibold">
                  Coordinator:
                </span>
                {" "}
                {activity.coordinator}
              </p>


              <p>
                📅
                <span className="font-semibold">
                  Date:
                </span>
                {" "}
                {activity.date}
              </p>


            </div>



            {/* Action Buttons */}

            <div className="flex flex-wrap gap-3 mt-5">


              {/* Complete Button */}

              {activity.status !== "Completed" && (

                <button
                  onClick={() =>
                    handleMarkCompleted(activity.id)
                  }

                  className="
                  bg-green-600
                  hover:bg-green-700
                  text-white
                  px-5
                  py-2
                  rounded-xl
                  font-semibold
                  shadow-md
                  transition
                  "
                >

                  ✓ Mark Completed

                </button>

              )}



              {/* Upload Report */}

              <label
                className="
                bg-purple-600
                hover:bg-purple-700
                text-white
                px-5
                py-2
                rounded-xl
                font-semibold
                cursor-pointer
                shadow-md
                "
              >

                📄 Upload Report


                <input
                  type="file"
                  hidden
                  onChange={(e)=>
                    handleReportUpload(
                      activity.id,
                      e.target.files[0]
                    )
                  }
                />

              </label>


            </div>



            {/* Report Available */}

            {activity.reportUploaded && (

              <a
                href={activity.reportLink}
                target="_blank"
                className="
                block
                mt-4
                text-blue-600
                font-semibold
                hover:underline
                "
              >

                View Uploaded Report →

              </a>

            )}


          </div>

        ))}


      </div>


    </div>


  </div>
)}

            {/* ================= ADD ACTIVITY MODAL ================= */}

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
                value={newActivity.title}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    title: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3"
              />

              <input
                type="text"
                placeholder="Coordinator"
                value={newActivity.coordinator}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    coordinator: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3"
              />

              <input
                type="text"
                placeholder="Date (Example: 15 Aug 2026)"
                value={newActivity.date}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    date: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3"
              />

            </div>

            <div className="flex justify-end gap-3 mt-8">

              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2 rounded-xl border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleAddActivity}
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

export default DepartmentCalendar;