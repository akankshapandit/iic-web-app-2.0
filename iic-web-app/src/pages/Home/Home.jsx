import React from "react";
import { Link } from "react-router-dom";
import heroImg from "../../assets/images/icc-group.png";
import logo from "../../assets/images/iic-logo.png";

function Home() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 box-border">
      {/* HERO SECTION */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg w-full">
        {/* IMAGE */}
        <img
          src={heroImg}
          alt="IIC Team"
          className="w-full h-[400px] sm:h-[480px] lg:h-[520px] object-cover"
        />

        {/* GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent"></div>

        {/* TEXT CONTENT */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-12 text-white z-10 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 leading-tight tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            <span className="text-white">CMRIT</span>{" "}
            <span className="text-yellow-400">
              Institution Innovation Council
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-100 max-w-xl mb-6 font-normal drop-shadow-md leading-relaxed">
            Empowering students and faculty through innovation, startups, and
            entrepreneurship.
          </p>

          <Link
            to="/events/calendar"
            className="w-fit bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2.5 rounded-lg font-bold transition shadow-md text-sm sm:text-base"
          >
            Explore Events
          </Link>
        </div>
      </div>

      {/* FEATURE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Event Calendar</h2>
          <p className="text-gray-500 text-sm">Track all IIC events in one place.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Faculty Allocation</h2>
          <p className="text-gray-500 text-sm">
            Manage faculty event assignments easily.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <h2 className="text-xl font-bold text-gray-900 mb-2">AI Report Generator</h2>
          <p className="text-gray-500 text-sm">
            Generate AICTE formatted reports automatically.
          </p>
        </div>
      </div>

      {/* PURPOSE OF IIC */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm w-full">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-blue-700 mb-8">
          Purpose of IIC
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* LEFT SIDE (LOGO) */}
          <div className="flex justify-center">
            <img src={logo} alt="IIC Logo" className="w-48 sm:w-60 max-w-full h-auto object-contain" />
          </div>

          {/* RIGHT SIDE TEXT */}
          <div className="text-gray-700 leading-relaxed space-y-4 text-sm sm:text-base">
            <p>
              IICs’ role is to engage a large number of faculty, students, and
              staff in various innovation and entrepreneurship-related
              activities such as Ideation, Problem-solving, Proof of Concept
              development, Design Thinking, IPR, project handling, and
              management at the Pre Incubation/Incubation center.
            </p>

            <p>
              It ensures that the innovation and entrepreneurship ecosystem gets
              established and stabilized in HEIs.
            </p>

            <p>
              The IIC model is designed to address the existing
              challenges/issues in HEIs such as fewer numbers, occasional and
              unplanned Innovation & Entrepreneurship activities, lack of
              coherence, and absence of synergy in resource mobilization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
