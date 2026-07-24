import React from "react";
import { Link } from "react-router-dom";

function Events() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Events Management</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <Link
          to="/events/calendar"
          className="bg-white shadow-lg p-6 rounded-lg hover:shadow-xl transition"
        >
          <h2 className="text-xl font-semibold mb-2">Event Calendar</h2>
          <p>View upcoming and past events.</p>
        </Link>

        <Link
          to="/events/faculty-allocation"
          className="bg-white shadow-lg p-6 rounded-lg hover:shadow-xl transition"
        >
          <h2 className="text-xl font-semibold mb-2">Faculty Allocation</h2>
          <p>Assign faculty coordinators.</p>
        </Link>

        <Link
          to="/events/archive"
          className="bg-white shadow-lg p-6 rounded-lg hover:shadow-xl transition"
        >
          <h2 className="text-xl font-semibold mb-2">Event Archive</h2>
          <p>Browse completed events.</p>
        </Link>
      </div>
    </div>
  );
}

export default Events;
