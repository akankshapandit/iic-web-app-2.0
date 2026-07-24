import React from "react";
import { motion } from "framer-motion";

function IECell() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      {/* TITLE */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center text-blue-700"
      >
        Innovation & Entrepreneurship Cell
      </motion.h1>

      {/* INTRO */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-lg p-6"
      >
        <p className="text-gray-700 text-lg leading-relaxed">
          CMRIT has an Innovation & Entrepreneurship (I&E) Cell in every
          department. The I&E cell creates an ecosystem for student
          entrepreneurs including ethics, values, funding, start-up support,
          mentoring, emotional intelligence, academic mentoring, and real-world
          exposure.
        </p>
      </motion.div>

      {/* ACTIVITIES */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Key Activities
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            "Design thinking workshops across departments",
            "Patent drafting and filing workshops",
            "Startup training programs",
            "Participation in national hackathons like SIH, Toycathon",
            "Mentoring innovative projects",
            "Guiding students to become entrepreneurs",
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl p-5 flex gap-3"
            >
              <span className="text-blue-600 font-bold">✔</span>
              <p className="text-gray-700">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IECell;
