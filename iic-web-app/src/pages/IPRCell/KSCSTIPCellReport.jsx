import React from "react";
import { Link } from "react-router-dom";
import { FileText, BarChart3 } from "lucide-react";

import graph1 from "../../assets/ipr/graph1.png";
import graph2 from "../../assets/ipr/graph2.png";


const reports = [
  {
    title: "IPR Cell Activity Report 2024-25",
    link: "https://drive.google.com/file/d/1U1fq0ZK7CyzjllL5Z-tZ-GgQgVBggnfw/view",
  },
  {
    title: "IPR Cell Activity Report 2023-24",
    link: "https://drive.google.com/file/d/1lmMfa-vstfVzKaMsPU4GPzJ0IiHNmTZA/view",
  },
  {
    title: "IPR Cell Activity Report 2022-23",
    link: "https://drive.google.com/file/d/1IvkMQgyiLnkGg8u13jdngxDvcqEC9bX2/view",
  },
];


function KSCSTIPCellReport() {

  return (

    <div className="min-h-screen bg-slate-50">


      {/* Hero Section */}

      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 py-20">

        <div className="max-w-7xl mx-auto px-6 text-center text-white">


          <div
            className="inline-flex items-center justify-center 
            w-24 h-24 rounded-full bg-white/10 
            backdrop-blur-md mb-8"
          >

            <FileText className="w-12 h-12 text-yellow-400" />

          </div>


          <h1 className="text-5xl font-extrabold">

            IPR Cell Reports

          </h1>


          <p className="mt-6 text-lg text-gray-200">

            Reports showcasing innovation activities,
            achievements and intellectual property initiatives.

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
          <Link
            to="/ipr-members"
            className="px-8 py-3 rounded-xl bg-white 
            shadow hover:shadow-xl transition"
          >

            👥 Members

          </Link>



          <button
            className="px-8 py-3 rounded-xl 
            bg-blue-700 text-white font-semibold"
          >

            📑 Reports

          </button>



          <Link
            to="/patents"
            className="px-8 py-3 rounded-xl bg-white 
            shadow hover:shadow-xl transition"
          >

            🎯 Activities

          </Link>


        </div>


      </div>






      {/* Main Content */}

      <div className="max-w-7xl mx-auto px-6 py-16">



        {/* Graph Section */}


        <div className="flex items-center gap-4 mb-10">


          <BarChart3 className="w-10 h-10 text-blue-700" />


          <h2 className="text-4xl font-bold">

            IPR Cell Overview

          </h2>


        </div>





        <div className="grid md:grid-cols-2 gap-10 mb-20">


          <div
            className="bg-white rounded-3xl shadow-lg p-6
            hover:shadow-2xl transition duration-500"
          >

            <img
              src={graph1}
              alt="IPR Graph 1"
              className="w-full rounded-2xl"
            />

          </div>




          <div
            className="bg-white rounded-3xl shadow-lg p-6
            hover:shadow-2xl transition duration-500"
          >

            <img
              src={graph2}
              alt="IPR Graph 2"
              className="w-full rounded-2xl"
            />

          </div>


        </div>







        {/* Reports Section */}


        <div className="flex items-center gap-4 mb-10">


          <FileText className="w-10 h-10 text-blue-700" />


          <h2 className="text-4xl font-bold">

            Activity Reports

          </h2>


        </div>






        <div className="grid md:grid-cols-3 gap-8">



          {reports.map((report, index) => (


            <div
              key={index}
              className="group relative bg-white 
              rounded-3xl shadow-lg p-8 text-center
              hover:shadow-2xl hover:-translate-y-3
              transition-all duration-500"
            >


              {/* Icon */}

              <div
                className="w-20 h-20 mx-auto rounded-full
                bg-gradient-to-r from-blue-600 to-indigo-600
                flex items-center justify-center
                group-hover:scale-110 transition duration-500"
              >

                <FileText className="w-10 h-10 text-white" />

              </div>




              <h3
                className="text-xl font-bold text-gray-800 
                mt-6"
              >

                {report.title}

              </h3>





              <a
                href={report.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 px-7 py-3
                rounded-xl bg-blue-700 text-white
                font-semibold hover:bg-blue-800
                transition"
              >

                View PDF

              </a>





              {/* Hover Effect */}

              <div
                className="absolute inset-0 rounded-3xl
                bg-gradient-to-r from-blue-500/10 
                to-indigo-500/10 opacity-0
                group-hover:opacity-100
                transition duration-500
                pointer-events-none"
              />


            </div>


          ))}


        </div>



      </div>







      {/* Footer */}

      <footer
        className="bg-slate-900 text-white text-center py-8 mt-16"
      >

        <p className="text-gray-300">

          CMRIT IPR Cell | Promoting Innovation and Intellectual Property

        </p>


      </footer>



    </div>

  );

}


export default KSCSTIPCellReport;