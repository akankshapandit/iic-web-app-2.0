// import React from "react";

// function EventCalendar() {
//   return (
//     <div className="max-w-7xl mx-auto">
//       <h1 className="text-4xl font-bold mb-6 text-gray-800">Event Calendar</h1>

//       <div className="grid md:grid-cols-3 gap-6">
//         <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition">
//           <h2 className="text-xl font-semibold mb-2">Innovation Workshop</h2>

//           <p className="text-gray-600">Department: CSE</p>

//           <p className="text-gray-600">Date: 20 Nov 2025</p>

//           <span className="inline-block mt-3 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
//             Completed
//           </span>
//         </div>

//         <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition">
//           <h2 className="text-xl font-semibold mb-2">
//             Design Thinking Bootcamp
//           </h2>

//           <p className="text-gray-600">Department: ISE</p>

//           <p className="text-gray-600">Date: 5 Dec 2025</p>

//           <span className="inline-block mt-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
//             Upcoming
//           </span>
//         </div>

//         <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition">
//           <h2 className="text-xl font-semibold mb-2">Startup Ideathon</h2>

//           <p className="text-gray-600">Department: MCA</p>

//           <p className="text-gray-600">Date: 12 Jan 2026</p>

//           <span className="inline-block mt-3 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
//             Planned
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default EventCalendar;
// import React from "react";
// import CalendarView from "../../components/calendar/CalendarView";

// function EventCalendar() {
//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6">Event Calendar</h1>

//       <CalendarView />
//     </div>
//   );
// }

// export default EventCalendar;

// import React from "react";
// import CalendarView from "../../components/calendar/CalendarView";

// function EventCalendar() {
//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6">IIC Event Calendar</h1>

//       <CalendarView />
//     </div>
//   );
// }

// export default EventCalendar;

// import React from "react";
// import { useLocation } from "react-router-dom";

// function EventDetailsPage() {
//   const location = useLocation();
//   const event = location.state;

//   if (!event) {
//     return <p className="text-center mt-10">No event data found.</p>;
//   }

//   return (
//     <div className="max-w-4xl mx-auto">
//       <h1 className="text-4xl font-bold mb-6 text-blue-700">{event.title}</h1>

//       <div className="bg-white p-6 rounded-lg shadow space-y-4">
//         <p>
//           <strong>Date:</strong> {event.date}
//         </p>

//         <p>
//           <strong>Department:</strong> {event.department}
//         </p>

//         <p>
//           <strong>Status:</strong> {event.status}
//         </p>

//         <p>
//           <strong>Description:</strong>
//           <br />
//           {event.description}
//         </p>
//       </div>
//     </div>
//   );
// }

// export default EventDetailsPage;

import React from "react";
import CalendarView from "../../components/calendar/CalendarView";

function EventCalendar() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">
        IIC Event Calendar
      </h1>

      <CalendarView />
    </div>
  );
}

export default EventCalendar;
