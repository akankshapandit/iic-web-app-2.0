import React from "react";

function InputField({ placeholder, type = "text", value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

export default InputField;
