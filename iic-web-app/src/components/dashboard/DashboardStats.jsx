import React from "react";

function DashboardStats() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Total Events</h3>
        <p className="text-2xl font-bold">25</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Reports Generated</h3>
        <p className="text-2xl font-bold">12</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Startups</h3>
        <p className="text-2xl font-bold">8</p>
      </div>
    </div>
  );
}

export default DashboardStats;
