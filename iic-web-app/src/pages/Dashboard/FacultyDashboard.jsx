import React from "react";
import AssignedEvents from "../../components/dashboard/AssignedEvents";
import UploadImages from "../../components/dashboard/UploadImages";

function FacultyDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Faculty Dashboard</h1>

      <AssignedEvents />
      <UploadImages />
    </div>
  );
}

export default FacultyDashboard;
