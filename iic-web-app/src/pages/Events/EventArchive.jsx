import React, { useMemo, useState } from "react";
import { Search, Calendar, User, Building2, CheckCircle2, Clock } from "lucide-react";

const events = [
  {
    title: "Awareness Workshop",
    faculty: "Dr. Jayanthi",
    department: "CSE",
    date: "26-10-2025",
    status: "Completed",
  },
  {
    title: "My Story Session",
    faculty: "Dr. Sam Gilvine",
    department: "AIDS",
    date: "29-10-2025",
    status: "Completed",
  },
  {
    title: "My Story Session",
    faculty: "Dr. Sridevi S",
    department: "ECE",
    date: "27-11-2025",
    status: "Completed",
  },
  {
    title: "Boot Camp",
    faculty: "Dr. S. Seetha",
    department: "ISE",
    date: "20-11-2025",
    status: "Completed",
  },
  {
    title: "Workshop on AI",
    faculty: "Ms. Keka",
    department: "ECE",
    date: "29-11-2025",
    status: "Completed",
  },
  {
    title: "Workshop on AI",
    faculty: "Ms. Lynsha",
    department: "CSE",
    date: "18-12-2025",
    status: "Completed",
  },
  {
    title: "Workshop on AI",
    faculty: "Dr. Naveen Kumar",
    department: "ECE",
    date: "27-12-2025",
    status: "Completed",
  },
  {
    title: "Workshop on AI",
    faculty: "Ms. Moumita Roy",
    department: "MCA",
    date: "06-12-2025",
    status: "Completed",
  },
  {
    title: "IPR Basics",
    faculty: "Dr. Vakula Rani",
    department: "MCA",
    date: "13-12-2026",
    status: "Completed",
  },
  {
    title: "Problem-Solution Fit Session",
    faculty: "Prof. Komala Devi",
    department: "ISE",
    date: "11-12-2025",
    status: "Completed",
  },
  {
    title: "Hackathon",
    faculty: "Mr. Praveen D Jadhav",
    department: "BS / Startup & Incubation",
    date: "09-10-2025",
    status: "Completed",
  },
  {
    title: "Demo Day",
    faculty: "Dr. Rajesh Gopal",
    department: "BS - Physics",
    date: "27-11-2025",
    status: "Completed",
  },
  {
    title: "Design Thinking Workshop",
    faculty: "Dr. Vakula Rani / Ms.",
    department: "MCA",
    date: "07-01-2026",
    status: "Completed",
  },
  {
    title: "Design Thinking Workshop",
    faculty: "Dr. Vakula Rani / Ms.",
    department: "MCA",
    date: "08-01-2026",
    status: "Completed",
  },
  {
    title: "Outreach Program",
    faculty: "Dr. Meenakshi K",
    department: "BS - Math",
    date: "28-01-2026",
    status: "Planned",
  },
  {
    title: "AI Innovation Sprint",
    faculty: "Dr. Sam Gilvine",
    department: "AIDS",
    date: "25-02-2026",
    status: "Planned",
  },
  {
    title: "Expert Talk on TRL/IP",
    faculty: "Prof. Lynsha",
    department: "CSE",
    date: "05-02-2026",
    status: "Planned",
  },
  {
    title: "Marketing Workshop",
    faculty: "Dr. Chandrika",
    department: "MBA",
    date: "24-01-2026",
    status: "Completed",
  },
  {
    title: "Field Visit",
    faculty: "Mr. Praveen D Jadhav",
    department: "BS / Startup & Incubation",
    date: "05-02-2026",
    status: "Planned",
  },
  {
    title: "Field Visit",
    faculty: "Dr. Rajesh Gopal",
    department: "BS - Physics",
    date: "24-02-2026",
    status: "Planned",
  },
  {
    title: "Innovation Competition",
    faculty: "Dr. Mohan Kumar & Dr. Vakula Rani",
    department: "MBA / MCA",
    date: "05-02-2026",
    status: "Planned",
  },
  {
    title: "Innovation Showcase",
    faculty: "Prof. Novy Jacob",
    department: "AI ML",
    date: "24-12-2025",
    status: "Completed",
  },
  {
    title: "Product-Market Fit Workshop",
    faculty: "Dr. Seetha",
    department: "ISE",
    date: "-",
    status: "Completed",
  },
  {
    title: "BMC Workshop",
    faculty: "Dr. Rajesh Gopal",
    department: "BS",
    date: "19-03-2026",
    status: "Completed",
  },
  {
    title: "AI Solution Expo",
    faculty: "Dr. Sam G",
    department: "AI DS",
    date: "-",
    status: "Completed",
  },
  {
    title: "Field Visit",
    faculty: "Prof. Komala Devi",
    department: "ISE",
    date: "26-03-2026",
    status: "Completed",
  },
  {
    title: "Legal & Ethical Session",
    faculty: "Prof. Novy Jacob",
    department: "AIML",
    date: "18-03-2026",
    status: "Completed",
  },
  {
    title: "Fundraising Workshop",
    faculty: "Dr. Chandrika",
    department: "MBA",
    date: "28-03-2026",
    status: "Completed",
  },
  {
    title: "IPR Management Workshop",
    faculty: "Dr. Sridevi",
    department: "ECE",
    date: "-",
    status: "Completed",
  },
  {
    title: "B-Plan Competition",
    faculty: "Prof. Moumita Roy",
    department: "MCA",
    date: "-",
    status: "Completed",
  },
  {
    title: "Mentoring Event",
    faculty: "Mr. Praveen D Jadhav",
    department: "BS / Startup & Incubation",
    date: "09-05-2026",
    status: "Completed",
  },
  {
    title: "Validation Session",
    faculty: "Prof. Komala Devi",
    department: "ISE",
    date: "24-06-2026",
    status: "Completed",
  },
  {
    title: "AI Fundraising Workshop",
    faculty: "Prof. Novy Jacob",
    department: "AIML",
    date: "10-06-2026",
    status: "Completed",
  },
  {
    title: "Incubation Session",
    faculty: "Dr. Meenakshi Patil & Dr. Sridevi",
    department: "ECE",
    date: "-",
    status: "Completed",
  },
  {
    title: "Lean Startup Boot Camp",
    faculty: "Dr. Chandrika",
    department: "MBA",
    date: "25-07-2026",
    status: "Completed",
  },
  {
    title: "VC Funding Session",
    faculty: "Dr. Sam Gilvine",
    department: "AIDS",
    date: "-",
    status: "Completed",
  },
  {
    title: "Startup Panel Discussion",
    faculty: "Dr. Praveen Jadav & Prof. Lynsha",
    department: "BS / Startup & Incubation",
    date: "11-07-2026",
    status: "Completed",
  },
  {
    title: "Outreach Program",
    faculty: "Dr. Meenakshi K",
    department: "BS - Math",
    date: "-",
    status: "Completed",
  },
  {
    title: "Outreach Program",
    faculty: "Dr. Rajesh Gopal",
    department: "BS - Physics",
    date: "16-07-2026",
    status: "Completed",
  },
  {
    title: "Startup Competition",
    faculty: "Dr. Praveen Jadav & Dr. Vakula Rani",
    department: "BS / Startup & Incubation & MCA",
    date: "13-06-2026",
    status: "Completed",
  },
];

export default function EventArchive() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return events.filter((e) =>
      Object.values(e)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  const completed = events.filter((e) => e.status === "Completed").length;
  const planned = events.filter((e) => e.status === "Planned").length;

  return (
    <div className="min-h-screen bg-slate-100">

      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 text-white py-14 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold">
            Event Archive
          </h1>
          <p className="mt-3 text-lg text-blue-100">
            Complete archive of Institution Innovation Council activities.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-gray-500">Total Events</p>
            <h2 className="text-4xl font-bold mt-2">{events.length}</h2>
          </div>

          <div className="bg-green-50 rounded-2xl shadow-lg p-6">
            <p className="text-green-700">Completed</p>
            <h2 className="text-4xl font-bold">{completed}</h2>
          </div>

          <div className="bg-yellow-50 rounded-2xl shadow-lg p-6">
            <p className="text-yellow-700">Planned</p>
            <h2 className="text-4xl font-bold">{planned}</h2>
          </div>

        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 mb-8 flex items-center">
          <Search className="text-gray-400 mr-3" />
          <input
            placeholder="Search events..."
            className="w-full outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">

          {filtered.map((event, index) => (

            <div
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition duration-300 border border-gray-100 hover:-translate-y-1"
            >
              <div className="p-6">

                <div className="flex justify-between items-start">

                  <h2 className="text-xl font-bold text-gray-800">
                    {event.title}
                  </h2>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {event.status}
                  </span>

                </div>

                <div className="mt-5 space-y-3">

                  <div className="flex items-center gap-3 text-gray-600">
                    <User size={18} />
                    {event.faculty}
                  </div>

                  <div className="flex items-center gap-3 text-gray-600">
                    <Building2 size={18} />
                    {event.department}
                  </div>

                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar size={18} />
                    {event.date}
                  </div>

                </div>

              </div>
            </div>

          ))}

        </div>

      </div>

    </div>
  );
}