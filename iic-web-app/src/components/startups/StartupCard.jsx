import React from "react";

function StartupCard({ name, founder }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold">{name}</h3>
      <p className="text-gray-600">Founder: {founder}</p>
    </div>
  );
}

export default StartupCard;
