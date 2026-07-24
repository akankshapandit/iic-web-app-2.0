import React from "react";
import StartupCard from "../../components/startups/StartupCard";

function StudentStartups() {
  const startups = [{ name: "EduAI", founder: "Student Team" }];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Student Startups</h1>

      <div className="grid md:grid-cols-3 gap-4">
        {startups.map((s, i) => (
          <StartupCard key={i} {...s} />
        ))}
      </div>
    </div>
  );
}

export default StudentStartups;
