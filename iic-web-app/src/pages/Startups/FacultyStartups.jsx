import React from "react";
import { motion } from "framer-motion";

// IMPORT IMAGES
import agriharaa from "../../assets/facultystartup/agriharaa.png";
import artrium from "../../assets/facultystartup/artrium.png";
import rootery from "../../assets/facultystartup/rootery.png";
import ryanam from "../../assets/facultystartup/ryanam.png";
import uShiksha from "../../assets/facultystartup/u-shiksha.png";
import sunshrub from "../../assets/facultystartup/sunshrub.png";
import sampradaa from "../../assets/facultystartup/sampradaa.png";
import triggerExam from "../../assets/facultystartup/trigger-exam.png";
import koushalya from "../../assets/facultystartup/koushalya.png";
import aiTech from "../../assets/facultystartup/ai-tech.png";

function FacultyStartups() {
  const startups = [
    { title: "ROOTERY", image: rootery },
    { title: "RYANAM", image: ryanam },
    { title: "AGRIHARAA", image: agriharaa },
    { title: "ARTRIUM", image: artrium },
    { title: "U-SHIKSHA", image: uShiksha },
    { title: "SUNSHRUB", image: sunshrub },
    { title: "SAMPRADAA", image: sampradaa },
    { title: "TRIGGER EXAM", image: triggerExam },
    { title: "KOUSHALYA", image: koushalya },
    { title: "AI TECH", image: aiTech },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center text-blue-700 mb-12"
      >
        Faculty Startups
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-10">
        {startups.map((startup, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03 }}
            transition={{ delay: index * 0.08 }}
            className="bg-white/70 backdrop-blur-lg border rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="relative">
              <img
                src={startup.image}
                alt={startup.title}
                className="w-full h-80 object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-xl font-bold">{startup.title}</h2>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default FacultyStartups;
