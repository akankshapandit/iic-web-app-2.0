import React from "react";

function Dropdown({ options, onChange }) {
  return (
    <select onChange={onChange} className="border p-2 rounded-lg">
      {options.map((opt, index) => (
        <option key={index} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export default Dropdown;
