import React from "react";
import { useLocation } from "react-router-dom";

function EventDetailsPage() {
  const location = useLocation();
  const event = location.state;

  if (!event) {
    return (
      <div className="text-center mt-10 text-gray-500">
        No event data found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-blue-700">{event.title}</h1>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <p>
          <strong>Date:</strong> {event.date}
        </p>
        <p>
          <strong>Department:</strong> {event.department}
        </p>
        <p>
          <strong>Status:</strong> {event.status}
        </p>

        <p>
          <strong>Description:</strong>
          <br />
          {event.description}
        </p>
      </div>
    </div>
  );
}

export default EventDetailsPage;
