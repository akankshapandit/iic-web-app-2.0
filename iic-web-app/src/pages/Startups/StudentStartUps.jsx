import React from "react";
import { motion } from "framer-motion";

// Adjust these file names if your actual asset names differ
import spireaArch from "../../assets/studentstartup/spirea_arch.png";
import grobStone from "../../assets/studentstartup/grob_stone.png";
import octakaigonBock from "../../assets/studentstartup/octakaigon_bock.png";
import sprooxSoftware from "../../assets/studentstartup/sproox_software.png";
import infatozTech from "../../assets/studentstartup/infatoz_technologies.png";

function StudentStartups() {
  const startups = [
    {
      title: "Spirea Arch Pvt. Ltd.",
      image: spireaArch,
    },
    {
      title: "Grob Stone Pvt. Ltd.",
      image: grobStone,
    },
    {
      title: "Octakaigon Bock Pvt. Ltd.",
      image: octakaigonBock,
    },
    {
      title: "Sproox Software Pvt. Ltd.",
      image: sprooxSoftware,
    },
    {
      title: "Infatoz Technologies LLP Pvt. Ltd.",
      image: infatozTech,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 tracking-tight">
            Student Startups
          </h1>
          <p className="mt-3 text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            A showcase of student-led ventures nurtured through the innovation
            ecosystem at CMRIT.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          {startups.map((startup, index) => (
            <motion.div
              key={startup.title}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="group rounded-3xl overflow-hidden border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_18px_55px_rgba(37,99,235,0.18)] transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={startup.image}
                  alt={startup.title}
                  className="w-full h-[340px] md:h-[380px] object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="inline-flex items-center rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-medium text-white mb-3">
                    Student Venture
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-snug drop-shadow">
                    {startup.title}
                  </h2>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentStartups;