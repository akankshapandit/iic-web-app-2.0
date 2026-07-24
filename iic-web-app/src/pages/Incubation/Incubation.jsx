import React from "react";
import { motion } from "framer-motion";

function Incubation() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      {/* TITLE */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center text-blue-700"
      >
        Pre-Incubation & Incubation Center
      </motion.h1>

      {/* INTRO CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-lg p-6 space-y-4"
      >
        <p className="text-gray-700 leading-relaxed">
          CMRIT, one of the most forward-thinking institutions, has established
          an incubation center to promote innovation and entrepreneurship among
          students. It provides support including workspace, mentoring,
          training, networking, and funding guidance.
        </p>

        <p className="text-gray-700 leading-relaxed">
          Just like a library or sports facility, an incubation center is
          essential in today’s fast-changing world. Students gain hands-on
          experience and are nurtured by faculty, management, and industry
          experts.
        </p>

        <p className="text-gray-700 leading-relaxed">
          The CMRIT Incubation Center, along with the MakerSpace, aims to become
          a hub for innovative and impactful ventures across multiple domains.
        </p>
      </motion.div>

      {/* FEATURES */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          What We Offer
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            "Mentorship from experts",
            "Startup funding guidance",
            "Workspace & infrastructure",
            "Networking opportunities",
            "Training programs",
            "Industry exposure",
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl p-5 text-center"
            >
              <p className="text-gray-700 font-medium">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Incubation;
