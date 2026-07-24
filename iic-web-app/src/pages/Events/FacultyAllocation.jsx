import React from "react";

function FacultyAllocation() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Faculty Event Allocation</h1>

      <div className="bg-white p-6 rounded-lg shadow w-full max-w-md">
        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Event Name"
            className="border p-2 rounded"
          />

          <input type="date" className="border p-2 rounded" />

          <input
            type="text"
            placeholder="Faculty Name"
            className="border p-2 rounded"
          />

          <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Assign Faculty
          </button>
        </form>
      </div>
    </div>
  );
}

export default FacultyAllocation;
