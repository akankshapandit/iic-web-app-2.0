import React from "react";
import { motion } from "framer-motion";

// ===== IMPORT IMAGES =====
import shyam from "../../assets/images/shyam.png";
import vakula from "../../assets/images/vakula.jpg";
import seetha from "../../assets/images/seetha.jpg";
import viji from "../../assets/images/viji.jpg";
import chitra from "../../assets/images/chitra.jpg";
import praveen from "../../assets/images/praveen.jpg";

import lynsha from "../../assets/images/lynsha.png";
import komala from "../../assets/images/komala.png";
import chandrike from "../../assets/images/chandrika.png";
import rajesh from "../../assets/images/rajesh.png";
import novby from "../../assets/images/novby.png";

import sam from "../../assets/images/sam.png";
import sridevi from "../../assets/images/sridevi.png";
import keka from "../../assets/images/keka.png";
import satyabrata from "../../assets/images/satyabrata.png";
import naveen from "../../assets/images/naveen.png";
import momita from "../../assets/images/momita.png";

import meenakshi from "../../assets/images/meenakshi.png";
import gomathi from "../../assets/images/gomathi.png";
import pappa from "../../assets/images/pappa.png";
import fazlur from "../../assets/images/fazlur.png";
import kashif from "../../assets/images/kashif.png";

function Members() {
  const members = [
    { name: "Dr. Shyam P Joy", role: "Chair Person", image: shyam },
    { name: "Dr. Vakula Rani J", role: "President", image: vakula },
    { name: "Dr. S. Seetha", role: "Vice President", image: seetha },
    { name: "Dr. Viji K", role: "Convener", image: viji },
    { name: "Dr. Chitra K", role: "Coordinator", image: chitra },
    { name: "Dr. Praveen D Jadhav", role: "Head Incubation", image: praveen },

    { name: "Prof. Ms Lynsha Helena", role: "Member", image: lynsha },
    { name: "Prof. K Komala Devi", role: "Member", image: komala },
    { name: "Dr. N Chandrika", role: "Member", image: chandrike },
    { name: "Dr. Rajesh Gopal", role: "Member", image: rajesh },
    { name: "Prof. Novby Jacob", role: "Member", image: novby },

    { name: "Dr. Sam Givhino Samuel", role: "I&E Head", image: sam },
    { name: "Dr. Sridevi S", role: "IPR Coordinator", image: sridevi },
    { name: "Prof. Keka Mukopadya", role: "UBA Coordinator", image: keka },
    { name: "Dr. Satyabrata Das", role: "Member", image: satyabrata },
    { name: "Dr. Naveen Kumar", role: "Coordinator", image: naveen },
    { name: "Prof. Moumita Roy", role: "Member", image: momita },

    { name: "Dr. Meenakshi K", role: "Coordinator", image: meenakshi },
    { name: "Dr. Gomathi T", role: "Member", image: gomathi },
    { name: "Dr. Pappa M", role: "Member", image: pappa },
    { name: "Dr. Fazlur Rahaman", role: "Member", image: fazlur },
    { name: "Prof. Kasif Ahmed", role: "Social Media", image: kashif },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center text-blue-700 mb-10"
      >
        IIC Members
      </motion.h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {members.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/70 backdrop-blur-lg border rounded-2xl shadow-lg p-5 text-center group"
          >
            <div className="overflow-hidden rounded-xl mb-4">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-56 object-cover group-hover:scale-110 transition duration-500"
              />
            </div>

            <h2 className="font-semibold text-gray-800">{member.name}</h2>

            <p className="text-sm text-gray-500 mt-1">{member.role}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Members;
