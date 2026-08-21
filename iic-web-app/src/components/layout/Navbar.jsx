import React, { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {

  const [showIECellMenu, setShowIECellMenu] = useState(false);
  return (
    <nav className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between min-w-0">

        {/* LEFT LOGO */}
        <div className="text-xl font-bold text-blue-700 flex-shrink-0">
          <Link to="/">CMRIT IIC</Link>
        </div>

        {/* CENTER NAV LINKS */}
        <div className="flex items-center gap-2 lg:gap-3 xl:gap-4 2xl:gap-6 text-gray-700 font-medium text-xs lg:text-sm 2xl:text-base flex-shrink min-w-0">

          <Link to="/" className="hover:text-blue-600 transition whitespace-nowrap">Home</Link>
          {/* I&E CELL DROPDOWN */}

          <div
            className="relative py-1"
            onMouseEnter={() => setShowIECellMenu(true)}
            onMouseLeave={() => setShowIECellMenu(false)}
          >

            {/* Main I&E Cell Link */}

            <Link
              to="/ie-cell"
              className="
                hover:text-blue-600 
                transition 
                whitespace-nowrap
                flex
                items-center
                gap-1
              "
            >
              I&E Cell

              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>

            </Link>



            {/* Dropdown Menu */}

            {showIECellMenu && (

              <div
                className="
                  absolute
                  top-full
                  left-0
                  bg-white
                  shadow-xl
                  rounded-lg
                  border
                  w-52
                  overflow-hidden
                  z-50
                "
              >

                <Link
                  to="/ie-cell/login"
                  className="
                    block
                    px-4
                    py-3
                    hover:bg-blue-50
                    hover:text-blue-600
                    text-sm
                  "
                >
                  Department Login
                </Link>


              </div>

            )}

          </div>
          
          {/* Report Auditor Link */}
          <Link to="/final-audit" className="text-blue-600 font-bold hover:text-blue-800 transition whitespace-nowrap flex items-center gap-1">
            🔍 Report Auditor
          </Link>

          <Link to="/patents" className="hover:text-blue-600 transition whitespace-nowrap">Patents</Link>
          {/* STARTUPS DROPDOWN */}
          <div className="relative group py-1">
            <button className="hover:text-blue-600 transition whitespace-nowrap flex items-center gap-1">
              Startups
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className="absolute top-[100%] left-0 hidden group-hover:flex flex-col bg-white shadow-xl rounded-lg border border-gray-100 w-48 overflow-hidden z-50">
              <Link to="/startups" className="px-4 py-3 hover:bg-blue-50 hover:text-blue-600 text-sm font-medium transition border-b border-gray-50">Student Startups</Link>
              <Link to="/faculty-startups" className="px-4 py-3 hover:bg-blue-50 hover:text-blue-600 text-sm font-medium transition">Faculty Startups</Link>
            </div>
          </div>

          <Link to="/achievements" className="hover:text-blue-600 transition whitespace-nowrap">Achievements</Link>
          <Link to="/events/calendar" className="hover:text-blue-600 transition whitespace-nowrap">Events</Link>
          <Link to="/incubation" className="hover:text-blue-600 transition whitespace-nowrap">Incubation</Link>
          <Link to="/events/archive" className="hover:text-blue-600 transition whitespace-nowrap">Archive</Link>
          <Link to="/members" className="hover:text-blue-600 transition whitespace-nowrap">Members</Link>


        </div>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

          {/* REPORT GENERATOR BUTTON */}
          <Link to="/generate-report">
            <button className="bg-purple-600 text-white px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-purple-700 transition flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
              🤖 AI Generator
            </button>
          </Link>

          {/* LOGIN */}
          <Link to="/login">
            <button className="border px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-gray-100 transition whitespace-nowrap">
              Login
            </button>
          </Link>

          {/* SIGNUP */}
          <Link to="/signup">
            <button className="bg-blue-600 text-white px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition whitespace-nowrap">
              Sign Up
            </button>
          </Link>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;