import React from "react";
import { Link } from "react-router-dom";
import { Users, Award } from "lucide-react";

import principal from "../../assets/ipr/principal.png";
import vakula from "../../assets/ipr/vakula.png";
import sridevi from "../../assets/ipr/sridevi.png";
import meenakshi from "../../assets/ipr/meenakshi.png";
import seetha from "../../assets/ipr/seetha.png";
import satyabrata from "../../assets/ipr/satyabrata.png";
import rajesh from "../../assets/ipr/rajesh.png";
import mahesh from "../../assets/ipr/mahesh.png";

const members = [
  {
    name: "Dr. Vakula Rani J",
    designation: "Head - CMRIT IPR Cell",
    image: vakula,
    color: "from-blue-600 to-indigo-600",
  },
  {
    name: "Dr. Sridevi S",
    designation: "IPR Activity Coordinator",
    image: sridevi,
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Dr. Meenakshi",
    designation: "NISP Coordinator",
    image: meenakshi,
    color: "from-green-500 to-emerald-600",
  },
  {
    name: "Dr. S. Seetha",
    designation: "Member",
    image: seetha,
    color: "from-yellow-500 to-orange-500",
  },
  {
    name: "Dr. Satyabrata Das",
    designation: "Member",
    image: satyabrata,
    color: "from-cyan-500 to-sky-600",
  },
  {
    name: "Dr. Rajesh Gopal",
    designation: "Innovation Activity Coordinator",
    image: rajesh,
    color: "from-purple-500 to-violet-600",
  },
  {
    name: "Prof. Mahesh Kumar Jha",
    designation: "Member",
    image: mahesh,
    color: "from-red-500 to-pink-600",
  },
];

function IPRCellMembers() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}

      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 py-20">

        <div className="max-w-7xl mx-auto px-6 text-center text-white">

          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md mb-8">

            <Users className="w-12 h-12 text-yellow-400" />

          </div>

          <h1 className="text-5xl font-extrabold">

            CMRIT IPR Cell Committee

          </h1>

          <p className="mt-6 text-lg text-gray-200">

            Meet the team driving innovation,
            intellectual property and entrepreneurship.

          </p>

        </div>

      </section>

      {/* Navigation */}

      <div className="bg-white shadow-md sticky top-0 z-30">

        <div className="max-w-6xl mx-auto py-5 flex justify-center gap-6">

          <Link
  to="/patents"
  className="px-8 py-3 rounded-xl bg-white shadow hover:shadow-xl transition"
>
  🏠 Overview
</Link>

          <button className="px-8 py-3 rounded-xl bg-blue-700 text-white font-semibold">

            👥 Members

          </button>

          <Link
            to="/ipr-reports"
            className="px-8 py-3 rounded-xl bg-white shadow hover:shadow-xl transition"
          >
            📑 Reports
          </Link>

          <Link
            to="/patents"
            className="px-8 py-3 rounded-xl bg-white shadow hover:shadow-xl transition"
          >
            🎯 Activities
          </Link>

        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Principal */}

        <div className="max-w-3xl mx-auto">

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 py-4">

              <h2 className="text-center text-white text-2xl font-bold">

                Patron

              </h2>

            </div>

            <div className="p-10 text-center">

              <img
                src={principal}
                alt="Principal"
                className="w-44 h-44 rounded-full object-cover mx-auto border-8 border-blue-100 shadow-lg"
              />

              <h2 className="text-3xl font-bold mt-6">

                Principal

              </h2>

              <p className="text-xl text-blue-700 mt-2">

                Head of Institution

              </p>

              <p className="text-gray-500 mt-2">

                CMR Institute of Technology, Bangalore

              </p>

            </div>

          </div>

        </div>

        {/* Committee */}

        <div className="mt-20">

          <div className="flex items-center gap-4 mb-10">

            <Award className="w-10 h-10 text-blue-700" />

            <h2 className="text-4xl font-bold">

              Committee Members

            </h2>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

  {members.map((member, index) => (
    <div
      key={index}
      className="group relative bg-white rounded-3xl shadow-lg overflow-hidden 
      hover:shadow-2xl transition-all duration-500 hover:-translate-y-3"
    >

      {/* Gradient Header */}
      <div
        className={`h-28 bg-gradient-to-r ${member.color}`}
      />

      {/* Image */}
      <div className="absolute top-14 left-1/2 transform -translate-x-1/2">

        <div
          className="w-28 h-28 rounded-full bg-white p-2 
          shadow-xl group-hover:scale-110 transition duration-500"
        >

          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full rounded-full object-cover"
          />

        </div>

      </div>


      {/* Details */}

      <div className="pt-20 pb-8 px-6 text-center">

        <h3
          className="text-xl font-bold text-gray-800 
          group-hover:text-blue-700 transition"
        >
          {member.name}
        </h3>


        <p
          className="mt-3 inline-block px-4 py-2 rounded-full 
          text-sm font-semibold bg-blue-50 text-blue-700"
        >
          {member.designation}
        </p>


        <div
          className="mt-6 h-1 w-16 mx-auto rounded-full 
          bg-gradient-to-r from-blue-500 to-indigo-600 
          group-hover:w-32 transition-all duration-500"
        />

      </div>


      {/* Hover Glow Effect */}

      <div
        className="absolute inset-0 rounded-3xl 
        bg-gradient-to-r from-blue-500/10 to-purple-500/10 
        opacity-0 group-hover:opacity-100 
        transition duration-500 pointer-events-none"
      />

    </div>
  ))}

</div>


{/* Innovation Activity Coordinator - Center Card */}

<div className="mt-12 flex justify-center">

  <div
    className="w-full md:w-1/2 lg:w-1/3 
    bg-white rounded-3xl shadow-lg overflow-hidden
    group hover:shadow-2xl hover:-translate-y-3
    transition-all duration-500"
  >

    


    <div className="absolute">
    </div>


    


    

  </div>

</div>


</div>

</div>





</div>
);
}

export default IPRCellMembers;