import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-blue-900 text-white min-h-screen p-5">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>

      <ul className="space-y-4">
        <li>
          <Link to="/" className="hover:text-yellow-300">
            Home
          </Link>
        </li>
        <li>
          <Link to="/events" className="hover:text-yellow-300">
            Events
          </Link>
        </li>
        <li>
          <Link to="/generate-report" className="hover:text-yellow-300">
            Reports
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
