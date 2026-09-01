import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const [showIECellMenu, setShowIECellMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { memberUser, logoutMember } = useAuth();

  const handleLogoClick = () => {
    if (memberUser) {
      logoutMember();
    }
  };

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 min-w-0">

        {/* LEFT LOGO - CLICK TO HOME & AUTO-LOGOUT */}
        <div className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight flex-shrink-0">
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-90 transition cursor-pointer"
            title="CMRIT IIC Home"
          >
            <span>CMRIT IIC</span>
          </Link>
        </div>

        {/* CENTER NAV LINKS - NON-OVERLAPPING & BALANCED */}
        <div className="hidden lg:flex items-center justify-center gap-2.5 xl:gap-4 2xl:gap-5 text-gray-700 font-semibold text-xs xl:text-sm whitespace-nowrap min-w-0">

          <Link to="/" onClick={handleLogoClick} className="px-2 py-1 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg transition">Home</Link>

          {/* I&E CELL DROPDOWN */}
          <div
            className="relative py-1"
            onMouseEnter={() => setShowIECellMenu(true)}
            onMouseLeave={() => setShowIECellMenu(false)}
          >
            <Link
              to="/ie-cell"
              className="px-2 py-1 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg transition flex items-center gap-1"
            >
              <span>I&E Cell</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            {showIECellMenu && (
              <div className="absolute top-full left-0 bg-white shadow-xl rounded-xl border border-gray-100 w-52 overflow-hidden z-50 py-1">
                <Link
                  to="/ie-cell/login"
                  className="block px-4 py-2.5 hover:bg-blue-50 hover:text-blue-600 text-sm font-medium transition"
                >
                  Department Login
                </Link>
              </div>
            )}
          </div>
          
          {/* Report Auditor Link */}
          <Link to="/final-audit" className="px-2 py-1 text-blue-600 font-bold hover:text-blue-800 hover:bg-blue-50/60 rounded-lg transition flex items-center gap-1">
            🔍 Report Auditor
          </Link>

          <Link to="/patents" className="px-2 py-1 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg transition">Patents</Link>

          {/* STARTUPS DROPDOWN */}
          <div className="relative group py-1">
            <button className="px-2 py-1 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg transition flex items-center gap-1">
              <span>Startups</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute top-full left-0 hidden group-hover:flex flex-col bg-white shadow-xl rounded-xl border border-gray-100 w-48 overflow-hidden z-50 py-1">
              <Link to="/startups" className="px-4 py-2.5 hover:bg-blue-50 hover:text-blue-600 text-sm font-medium transition border-b border-gray-50">Student Startups</Link>
              <Link to="/faculty-startups" className="px-4 py-2.5 hover:bg-blue-50 hover:text-blue-600 text-sm font-medium transition">Faculty Startups</Link>
            </div>
          </div>

          <Link to="/achievements" className="px-2 py-1 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg transition">Achievements</Link>
          <Link to="/events/calendar" className="px-2 py-1 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg transition">Events</Link>
          <Link to="/incubation" className="px-2 py-1 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg transition">Incubation</Link>
          <Link to="/events/archive" className="px-2 py-1 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg transition">Archive</Link>
          <Link to="/members" className="px-2.5 py-1 text-blue-700 font-bold hover:text-blue-800 hover:bg-blue-50 rounded-lg transition">Members</Link>
        </div>

        {/* RIGHT SIDE BUTTONS (DESKTOP) */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 flex-shrink-0">

          {/* REPORT GENERATOR BUTTON */}
          <Link to="/generate-report">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-xs xl:text-sm rounded-lg font-bold transition shadow-sm flex items-center gap-1 whitespace-nowrap">
              <span>🤖</span> AI Generator
            </button>
          </Link>

          {/* LOGIN */}
          <Link to="/login">
            <button className="border border-gray-300 text-gray-700 px-3 py-1.5 text-xs xl:text-sm rounded-lg font-semibold hover:bg-gray-50 transition whitespace-nowrap">
              Login
            </button>
          </Link>

          {/* SIGNUP */}
          <Link to="/signup">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs xl:text-sm rounded-lg font-semibold transition shadow-sm whitespace-nowrap">
              Sign Up
            </button>
          </Link>

        </div>

        {/* MOBILE / TABLET MENU TOGGLE BUTTON */}
        <div className="flex lg:hidden items-center gap-2">
          <Link to="/generate-report">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1.5 text-xs rounded-xl font-bold transition shadow-sm flex items-center gap-1 whitespace-nowrap">
              <span>🤖</span> AI Generator
            </button>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* MOBILE / TABLET DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="flex flex-col space-y-1 text-sm font-semibold text-gray-700">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 hover:bg-blue-50 rounded-lg transition"
            >
              Home
            </Link>
            <Link
              to="/ie-cell"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 hover:bg-blue-50 rounded-lg transition"
            >
              I&E Cell
            </Link>
            <Link
              to="/final-audit"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-blue-600 font-bold hover:bg-blue-50 rounded-lg transition"
            >
              🔍 Report Auditor
            </Link>
            <Link
              to="/patents"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 hover:bg-blue-50 rounded-lg transition"
            >
              Patents
            </Link>
            <Link
              to="/startups"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 hover:bg-blue-50 rounded-lg transition"
            >
              Student Startups
            </Link>
            <Link
              to="/faculty-startups"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 hover:bg-blue-50 rounded-lg transition"
            >
              Faculty Startups
            </Link>
            <Link
              to="/achievements"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 hover:bg-blue-50 rounded-lg transition"
            >
              Achievements
            </Link>
            <Link
              to="/events/calendar"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 hover:bg-blue-50 rounded-lg transition"
            >
              Events
            </Link>
            <Link
              to="/incubation"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 hover:bg-blue-50 rounded-lg transition"
            >
              Incubation
            </Link>
            <Link
              to="/events/archive"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 hover:bg-blue-50 rounded-lg transition"
            >
              Archive
            </Link>
            <Link
              to="/members"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-blue-700 font-bold hover:bg-blue-50 rounded-lg transition"
            >
              Members
            </Link>
          </div>

          <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
              <button className="w-full border border-gray-300 text-gray-700 py-2 text-sm rounded-xl font-semibold hover:bg-gray-50 transition">
                Login
              </button>
            </Link>
            <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm rounded-xl font-semibold transition shadow-sm">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;