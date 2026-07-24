import React from "react";

function MemberCard({ name, role }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold">{name}</h3>
      <p className="text-gray-600">{role}</p>
    </div>
  );
}

export default MemberCard;
