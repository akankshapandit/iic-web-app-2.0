import React from "react";

function UploadImages() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Upload Event Images</h2>

      <input type="file" multiple />
    </div>
  );
}

export default UploadImages;
