import React from "react";
import MemberCard from "../../components/members/MemberCard";

function IPRCellMembers() {
  const members = [
    { name: "Dr. XYZ", role: "Coordinator" },
    { name: "Prof. ABC", role: "Member" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">IPR Members</h1>

      <div className="grid md:grid-cols-3 gap-4">
        {members.map((m, i) => (
          <MemberCard key={i} {...m} />
        ))}
      </div>
    </div>
  );
}

export default IPRCellMembers;
