import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Users, Lightbulb } from "lucide-react";


import worldIPDay from "../../assets/ipr/world_ip_day.png";
import designRegistration from "../../assets/ipr/design_registration.png";
import innovateX from "../../assets/ipr/innovatEx.png";
import patentISE from "../../assets/ipr/patent_ise.png";
import patentAIML from "../../assets/ipr/patent_aiml.png";
import mbaDesign from "../../assets/ipr/mba_design.png";
import facultyBootcamp from "../../assets/ipr/faculty_bootcamp.png";



const events = [

  {
    title:
      "World IP Day Celebration : Two-Day Innovative Design Challenge",
    image: worldIPDay,
    date:
      "6th & 7th May 2026",
    venue:
      "AV Hall, D Block, CMRIT",
    people:
      "Dr. Vakula Rani J & Prof. Keka Mukhopadhyaya",
    label:
      "Coordinators",
  },


  {
    title:
      'Workshop "Design Registration Filing Procedures"',
    image: designRegistration,
    date:
      "16th April 2026",
    venue:
      "AV Hall, D Block, CMRIT",
    people:
      "Dr. Vakula Rani J & Dr. Rajesh Gopal",
    label:
      "Resource Persons",
  },


  {
    title:
      "InnovateX : Mini Project Exhibition for First Year Student Innovators",
    image: innovateX,
    date:
      "18th December 2025",
    venue:
      "Phy Lab, B Block, CMRIT",
  },


  {
    title:
      'Workshop on "Patent Drafting and Filing for 5th Sem ISE Students"',
    image: patentISE,
    date:
      "3rd & 4th September 2025",
    venue:
      "AV Hall, D Block, CMRIT",
    people:
      "Dr. S. Seetha & Prof. Komala Devi",
    label:
      "Resource Persons",
  },


  {
    title:
      'Workshop on "Patent Drafting and Filing for 5th Sem AI&ML Students"',
    image: patentAIML,
    date:
      "10th to 12th September 2025",
    venue:
      "AV Hall, D Block, CMRIT",
    people:
      "Ms. Novy Jacob & Dr. Sagar M. Baligidad",
    label:
      "Resource Persons",
  },


  {
    title:
      "Workshop on Design Thinking for I Sem MBA Students",
    image:
      mbaDesign,
    date:
      "22nd November 2025",
    venue:
      "AV Hall, A Block, CMRIT",
    people:
      "Dr. Chandrika",
    label:
      "Resource Person",
  },


  {
    title:
      "5 Day FDP - Faculty Innovation Bootcamp: Design Thinking & Patent Filing Essentials",
    image:
      facultyBootcamp,
    date:
      "28th August to 4th September 2025",
    venue:
      "AV Hall, D Block, CMRIT",
    people:
      "Dr. Vakula Rani J, Dr. Rajesh Gopal, Dr. Satyabrata Das, Dr. Meenakshi R Patil & Dr. Sridevi S",
    label:
      "Faculty Coordinators",

    highlights: [
      "Day 1: Introduction to IPR and Components of Patent Application with Prior Art Search by Dr. Vakula Rani J",
      "Day 2: Design Registration - Hands-on Session by Dr. Rajesh Gopal and Dr. Satyabrata Das",
      "Day 3: Patent Drafting – Complete Specification (Hands-on) by Dr. Meenakshi R Patil",
      "Day 4: Practical Patent Drafting, Forms, Filing Process & Assessment by Dr. Sridevi S",
      "Day 5: Filing Process & Assessment by Dr. Vakula Rani J and Dr. Sridevi S",
    ],
  },

];



function IPRActivities() {


  return (

    <div className="min-h-screen bg-slate-50">


      {/* Hero */}

      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 py-20">

        <div className="max-w-7xl mx-auto px-6 text-center text-white">


          <div className="inline-flex items-center justify-center 
          w-24 h-24 rounded-full bg-white/10 backdrop-blur-md mb-8">

            <Lightbulb className="w-12 h-12 text-yellow-400"/>

          </div>


          <h1 className="text-5xl font-extrabold">

            IPR Events

          </h1>


          <p className="mt-6 text-lg text-gray-200">

            Innovation activities, workshops and events conducted by CMRIT IPR Cell.

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
            className="px-8 py-3 rounded-xl bg-white shadow hover:shadow-xl transition"
          >
            👥 Members
          </Link>


          <Link
            to="/ipr-reports"
            className="px-8 py-3 rounded-xl bg-white shadow hover:shadow-xl transition"
          >
            📑 Reports
          </Link>


          <button
            className="px-8 py-3 rounded-xl bg-blue-700 text-white font-semibold"
          >
            🎯 Activities
          </button>


        </div>

      </div>





      {/* Events */}

      <div className="max-w-7xl mx-auto px-6 py-16">


        <div className="flex items-center gap-4 mb-12">

          <CalendarDays className="w-10 h-10 text-blue-700"/>

          <h2 className="text-4xl font-bold">
            IPR Events 2025-26
          </h2>

        </div>




        <div className="grid md:grid-cols-2 gap-10">


          {events.map((event,index)=>(


            <div
              key={index}
              className="bg-white rounded-3xl overflow-hidden shadow-lg
              hover:shadow-2xl hover:-translate-y-2 transition duration-500"
            >


              <img
                src={event.image}
                alt={event.title}
                className="w-full h-64 object-cover"
              />



              <div className="p-8">


                <h3 className="text-2xl font-bold text-gray-800">
                  {event.title}
                </h3>



                <div className="mt-5 space-y-3 text-gray-600">


                  <p className="flex gap-3">
                    <CalendarDays className="text-blue-600"/>
                    {event.date}
                  </p>


                  <p className="flex gap-3">
                    <MapPin className="text-red-600"/>
                    {event.venue}
                  </p>



                  {event.people && (

                    <p className="flex gap-3">
                      <Users className="text-green-600"/>
                      <span>
                        <b>{event.label}:</b> {event.people}
                      </span>
                    </p>

                  )}


                </div>




                {event.highlights && (

                  <div className="mt-6">

                    <h4 className="font-bold text-lg mb-3">
                      Program Highlights
                    </h4>


                    <ul className="list-disc pl-5 space-y-2 text-gray-600">

                      {event.highlights.map((item,i)=>(

                        <li key={i}>
                          {item}
                        </li>

                      ))}

                    </ul>

                  </div>

                )}


              </div>


            </div>


          ))}


        </div>


      </div>





      {/* Footer */}

      <footer className="bg-slate-900 text-white text-center py-8">

        <p className="text-gray-300">
          CMRIT IPR Cell | Promoting Innovation and Intellectual Property
        </p>

      </footer>



    </div>

  );

}


export default IPRActivities;