import React from "react";

function Button({ text, onClick, type = "button", variant = "primary" }) {
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-black hover:bg-gray-300",
    success: "bg-green-600 text-white hover:bg-green-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition ${styles[variant]}`}
    >
      {text}
    </button>
  );
}

export default Button;
