import React from "react";
import Button from "../common/Button";

function ReportGenerator() {
  return (
    <div className="space-y-4">
      <input className="w-full border p-2 rounded" placeholder="Event Title" />
      <textarea
        className="w-full border p-2 rounded"
        placeholder="Description"
      />

      <Button text="Generate Report" />
    </div>
  );
}

export default ReportGenerator;
