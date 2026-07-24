import React from "react";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
        <button
          onClick={onClose}
          className="float-right text-gray-500 hover:text-black"
        >
          ✖
        </button>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
