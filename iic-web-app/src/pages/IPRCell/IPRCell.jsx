import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Lightbulb,
  BookOpen,
  Users,
  FileText,
} from "lucide-react";

import kscst1 from "../../assets/ipr/kscst1.png";
import kscst2 from "../../assets/ipr/kscst2.png";

const objectives = [
  {
    title: "Promoting Innovation",
    icon: <Lightbulb className="w-8 h-8 text-yellow-500" />,
    description:
      "Create an intellectual environment among the staff, students and researchers of the institution and promote the culture of creating new inventions and protecting them in the form of Intellectual Property.",
    color: "from-yellow-100 to-yellow-50",
  },
  {
    title: "Intellectual Property Awareness",
    icon: <BookOpen className="w-8 h-8 text-blue-600" />,
    description:
      "Encourage the CMRIT community about the importance of Intellectual Property Rights through seminars, webinars and awareness campaigns.",
    color: "from-blue-100 to-blue-50",
  },
  {
    title: "Facilitating Patent Filings",
    icon: <FileText className="w-8 h-8 text-green-600" />,
    description:
      "Support innovators in protecting their ideas and inventions through the patent filing process.",
    color: "from-green-100 to-green-50",
  },
  {
    title: "Creating a Knowledge Hub",
    icon: <Users className="w-8 h-8 text-purple-600" />,
    description:
      "Develop educational schemes, models and methodologies to improve the teaching-learning process and groom quality engineering graduates.",
    color: "from-purple-100 to-purple-50",
  },
];

function IPRCell() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">

        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center text-white">

          <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center mx-auto mb-8">

            <ShieldCheck className="w-12 h-12 text-yellow-400" />

          </div>

          <h1 className="text-5xl lg:text-6xl font-extrabold">
            CMRIT Intellectual Property
            <br />
            Rights Cell
          </h1>

          <p className="mt-8 text-lg text-gray-200 max-w-3xl mx-auto leading-8">
            Promoting Innovation • Protecting Intellectual Property •
            Encouraging Entrepreneurship
          </p>

        </div>

      </section>

      {/* Navigation */}

      <div className="bg-white shadow-md sticky top-0 z-30">

  <div className="max-w-6xl mx-auto py-5 flex justify-center gap-6 flex-wrap">

    <button
      className="px-8 py-3 rounded-xl bg-blue-700 text-white shadow-lg font-semibold"
    >
      🏠 Overview
    </button>


    <Link
      to="/ipr-members"
      className="px-8 py-3 rounded-xl bg-white shadow hover:shadow-xl transition hover:-translate-y-1 font-semibold"
    >
      👥 Members
    </Link>


    <Link
      to="/ipr-reports"
      className="px-8 py-3 rounded-xl bg-white shadow hover:shadow-xl transition hover:-translate-y-1 font-semibold"
    >
      📑 Reports
    </Link>


    <Link
      to="/ipr-activities"
      className="px-8 py-3 rounded-xl bg-white shadow hover:shadow-xl transition hover:-translate-y-1 font-semibold"
    >
      🎯 Activities
    </Link>


  </div>

</div>

        

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">

        {/* About */}

        <section className="bg-white rounded-3xl shadow-xl overflow-hidden">

          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-8 py-5">

            <h2 className="text-3xl font-bold text-white">
              About CMRIT IPR Cell
            </h2>

          </div>

          <div className="p-8">

            <p className="text-gray-700 text-lg leading-9">

              The CMR Institute of Technology Intellectual Property (IP) Cell
              was established in the year <strong>2019</strong> with a clear
              and ambitious aim to promote innovation, protect Intellectual
              Property Rights, and foster a culture of entrepreneurship within
              the academic community of CMRIT.

            </p>

            <p className="mt-6 text-gray-700 text-lg leading-9">

              The cell encourages students, faculty members and researchers
              to transform innovative ideas into valuable intellectual assets,
              while providing guidance for patents, copyrights, trademarks,
              and other forms of Intellectual Property protection.

            </p>

          </div>

        </section>

        {/* Objectives */}

        <section>

          <div className="flex items-center gap-4 mb-10">

            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">

              <BookOpen className="w-8 h-8 text-blue-700" />

            </div>

            <div>

              <h2 className="text-4xl font-bold text-gray-800">
                Objectives of CMRIT IPR Cell
              </h2>

              <p className="text-gray-500 mt-2">
                Building an innovation ecosystem through awareness,
                protection and commercialization of ideas.
              </p>

            </div>

          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">

            {objectives.map((item, index) => (

              <div
                key={index}
                className={`bg-gradient-to-br ${item.color} rounded-3xl p-7 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300`}
              >

                <div className="mb-6">
                  {item.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {item.title}
                </h3>

                <p className="text-gray-700 leading-7">
                  {item.description}
                </p>

              </div>

            ))}

          </div>

        </section>
                {/* ================= KSCST ================= */}

        <section className="bg-white rounded-3xl shadow-xl overflow-hidden">

          <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-8 py-5">

            <h2 className="text-3xl font-bold text-white">
              A Brief Overview - KSCST
            </h2>

          </div>

          <div className="grid lg:grid-cols-2 gap-10 p-8">

            {/* Left Side */}

            <div>

              <p className="text-gray-700 leading-9 text-lg">

                The Karnataka State Council for Science and Technology
                (KSCST) was established in 1975 and is responsible for the
                development of the quality of life of the people of the
                state, especially in rural areas. It is one of the first
                State Science & Technology Councils established in India.

              </p>

              <p className="mt-6 text-gray-700 leading-9 text-lg">

                KSCST is an autonomous Science & Technology organization
                under the Department of Science & Technology,
                Government of Karnataka.

              </p>

              <p className="mt-6 text-gray-700 leading-9 text-lg">

                KSCST provides support to the Central and State Governments
                in formulation of Science & Technology based policies,
                scientific surveys, project implementation, evaluation,
                coordination, monitoring, organization of scientific meets
                and awareness campaigns.

              </p>

              <p className="mt-6 text-gray-700 leading-9 text-lg">

                The Department of Science and Technology,
                Government of India has advocated KSCST as a model for
                similar organizations across all states.

              </p>

            </div>

            {/* Right Side Images */}

            <div className="flex flex-col gap-6">

              <img
                src={kscst1}
                alt="KSCST"
                className="rounded-2xl shadow-xl w-full object-cover hover:scale-[1.02] transition duration-300"
              />

              <img
                src={kscst2}
                alt="KSCST"
                className="rounded-2xl shadow-xl w-full object-cover hover:scale-[1.02] transition duration-300"
              />

            </div>

          </div>

        </section>
                {/* ================= RESOURCES ================= */}

        <section>

          <div className="flex items-center gap-4 mb-10">

            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">

              <FileText className="w-8 h-8 text-red-600" />

            </div>

            <div>

              <h2 className="text-4xl font-bold text-gray-800">
                Resources
              </h2>

              <p className="text-gray-500 mt-2">
                Official policy documents, patent filing guidelines and forms.
              </p>

            </div>

          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {/* IPR Policy */}

            <a
              href="https://drive.google.com/file/d/1jq-a5rGyu1vq2nqxisNRLT16MN_CjWx-/view"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100"
            >

              <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

              <div className="p-8">

                <div className="text-5xl mb-6">
                  📄
                </div>

                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-700 transition">

                  CMRIT IPR Policy

                </h3>

                <p className="text-gray-600 mt-4 leading-7">

                  Institutional Intellectual Property Rights policy document
                  outlining innovation, ownership and commercialization
                  guidelines.

                </p>

                <div className="mt-8 font-semibold text-blue-700">

                  View Document →

                </div>

              </div>

            </a>

            {/* Patent Filing Manual */}

            <a
              href="https://drive.google.com/file/d/17KBBNviCStQhdHtXocATZG1kRLE08Mu5/view"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100"
            >

              <div className="h-2 bg-gradient-to-r from-green-600 to-emerald-600"></div>

              <div className="p-8">

                <div className="text-5xl mb-6">
                  📘
                </div>

                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-green-700 transition">

                  Patent Filing Manual

                </h3>

                <p className="text-gray-600 mt-4 leading-7">

                  Step-by-step guide for faculty and students to understand
                  the patent filing process and documentation.

                </p>

                <div className="mt-8 font-semibold text-green-700">

                  View Document →

                </div>

              </div>

            </a>

            {/* Forms */}

            <a
              href="https://drive.google.com/file/d/1eIDQXVSZoFAZOLJFyxbnWByfOJURvHbj/view"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100"
            >

              <div className="h-2 bg-gradient-to-r from-purple-600 to-pink-600"></div>

              <div className="p-8">

                <div className="text-5xl mb-6">
                  📝
                </div>

                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-purple-700 transition">

                  Forms for Patent Filing

                </h3>

                <p className="text-gray-600 mt-4 leading-7">

                  Download the required forms and templates needed during
                  patent submission.

                </p>

                <div className="mt-8 font-semibold text-purple-700">

                  View Document →

                </div>

              </div>

            </a>

          </div>

        </section>

      </div>

    </div>
  );
}

export default IPRCell;