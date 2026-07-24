import React from "react";
import { Link } from "react-router-dom";
import heroImg from "../../assets/images/icc-group.png";
import logo from "../../assets/images/iic-logo.png";

function Home() {
  return (
    <div className="space-y-12">
      {/* HERO SECTION */}

      <div className="relative rounded-xl overflow-hidden shadow-lg">
        {/* IMAGE */}
        <img
          src={heroImg}
          alt="IIC Team"
          className="w-full h-[450px] object-cover"
        />

        {/* GRADIENT OVERLAY (BETTER THAN BLACK) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

        {/* TEXT CONTENT */}
        <div className="absolute inset-0 flex flex-col justify-center px-10 text-white z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            <span className="text-white">CMRIT</span>{" "}
            <span className="text-yellow-400">
              Institution Innovation Council
            </span>
          </h1>

          <p className="max-w-xl text-lg text-gray-200 mb-6 drop-shadow-md">
            Empowering students and faculty through innovation, startups, and
            entrepreneurship.
          </p>

          <Link
            to="/events"
            className="w-fit bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition shadow-lg"
          >
            Explore Events
          </Link>
        </div>
      </div>

      {/* FEATURE CARDS */}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition">
          <h2 className="text-xl font-semibold mb-2">Event Calendar</h2>
          <p className="text-gray-600">Track all IIC events in one place.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition">
          <h2 className="text-xl font-semibold mb-2">Faculty Allocation</h2>
          <p className="text-gray-600">
            Manage faculty event assignments easily.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition">
          <h2 className="text-xl font-semibold mb-2">AI Report Generator</h2>
          <p className="text-gray-600">
            Generate AICTE formatted reports automatically.
          </p>
        </div>
      </div>
      {/* PURPOSE OF IIC */}

      <div className="bg-white p-8 rounded-xl shadow">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Purpose of IIC
        </h2>

        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* LEFT SIDE (OPTIONAL LOGO) */}
          <div className="flex justify-center">
            <img src={logo} alt="IIC Logo" className="w-60" />
          </div>

          {/* RIGHT SIDE TEXT */}
          <div className="text-gray-700 leading-relaxed space-y-4">
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
