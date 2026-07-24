import React, { useState } from "react";
import axios from "axios";

/** Green if score is 7+ on a N/10 scale, or Pass; red only if parsed score is below 7 */
function isBreakdownScoreOk(val) {
  const s = String(val).trim();
  if (s.toLowerCase() === "pass") return true;
  const m = s.match(/(\d+(?:\.\d+)?)\s*\/\s*10\b/);
  if (!m) return true;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return true;
  return n >= 7;
}

const FinalAuditPage = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF file first!");

    const formData = new FormData();
    formData.append("reportFile", file);

    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:3000/api/report/audit-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      const body = err.response?.data;
      const msg =
        (typeof body === "object" && body?.error) ||
        err.message ||
        "Request failed. Is the backend running on port 3000?";
      if (status === 503 || body?.code === "GEMINI_UNAVAILABLE") {
        alert(msg + "\n\nTip: wait 1–2 minutes and try again — Google’s AI was temporarily busy.");
      } else if (status === 429 || body?.code === "GEMINI_RATE_LIMIT") {
        alert(msg + "\n\nTip: free tier resets daily; try again later or enable billing in Google AI Studio.");
      } else {
        alert(`Analysis failed (${status || "error"}): ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-900">IIC Official Auditor</h2>
          <p className="text-gray-600 mt-2">Upload your final PDF to get an AICTE-aligned Compliance Score</p>
        </div>

        <div className="border-4 border-dashed border-blue-100 rounded-2xl p-12 text-center transition-hover hover:border-blue-300">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {file && <p className="mt-4 text-sm font-medium text-blue-600">Selected: {file.name}</p>}
        </div>

        <button
          onClick={handleUpload}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "AI is Analyzing Report..." : "Verify Report Compliance"}
        </button>

        {result && (
          <div className="mt-10 animate-fade-in">
            <hr className="mb-8" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center">
                <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Final Score</p>
                <div className={`text-6xl font-black ${result.score >= 80 ? "text-green-500" : "text-red-500"}`}>
                  {result.score}
                  <span className="text-2xl text-gray-400">/100</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.breakdown || {}).map(([key, val]) => {
                    const ok = isBreakdownScoreOk(val);
                    return (
                      <div
                        key={key}
                        className="bg-gray-50 p-4 rounded-lg flex flex-col gap-2 border border-gray-100 shadow-sm"
                      >
                        <span className="capitalize text-sm font-bold text-gray-800">{key}:</span>
                        <span
                          className={`text-sm leading-relaxed ${
                            ok ? "text-green-700 font-medium" : "text-red-600 font-semibold"
                          }`}
                        >
                          {val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className={`mt-6 p-4 rounded-lg border-l-4 ${
                result.score >= 80 ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"
              }`}
            >
              <h4 className="font-bold text-gray-800">Auditor Verdict: {result.status}</h4>
              <p className="text-gray-700 mt-1 italic">{result.feedback}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalAuditPage;
