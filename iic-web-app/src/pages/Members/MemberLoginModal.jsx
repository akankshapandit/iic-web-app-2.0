import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function MemberLoginModal({ isOpen, onClose }) {
  const [password, setPassword] = useState("CMRIT@2026");
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { loginMember } = useAuth();
  const navigate = useNavigate();

  const DEFAULT_FACULTY_LIST = [
    { facultyName: "Dr. Seetha", department: "ISE" },
    { facultyName: "Dr. Jayanthi", department: "CSE" },
    { facultyName: "Dr. Sam Gilvine", department: "AIDS" },
    { facultyName: "Dr.Sridevi S", department: "ECE" },
    { facultyName: "Ms. Keka", department: "ECE" },
    { facultyName: "Ms. Lynsha", department: "CSE" },
    { facultyName: "Dr. Naveen Kumar", department: "ECE" },
    { facultyName: "Dr. Rajesh Gopal", department: "BS Phy" },
    { facultyName: "Ms. Moumita Roy", department: "MCA" },
    { facultyName: "Dr. Vakula Rani", department: "MCA" },
    { facultyName: "Prof.Komala Devi", department: "ISE" },
    { facultyName: "Mr. Praveen D Jadhav", department: "BS / Startup & Incubation" },
    { facultyName: "Dr. Meenakshi K", department: "BS MATH" },
    { facultyName: "Dr. Chandrika", department: "MCA" },
    { facultyName: "Dr. Mohan Kumar", department: "MBA" },
    { facultyName: "Prof. Novy Jacob", department: "AIML" },
    { facultyName: "Dr. Satyabrata Das", department: "BS CHEM" },
    { facultyName: "Dr.Meenakshi R Patil", department: "ECE" },
    { facultyName: "Prof. Manjunatha Babu", department: "AIDS" }
  ];

  const [facultyList, setFacultyList] = useState(DEFAULT_FACULTY_LIST);
  const [selectedFaculty, setSelectedFaculty] = useState(DEFAULT_FACULTY_LIST[0].facultyName);

  useEffect(() => {
    if (isOpen) {
      fetchFacultyList();
    }
  }, [isOpen]);

  const fetchFacultyList = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/members/list");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setFacultyList(data);
          setSelectedFaculty(data[0].facultyName || data[0].name);
        }
      }
    } catch (err) {
      console.error("Failed to fetch faculty list from server, using default list:", err);
    }
  };

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (isSetupMode) {
        if (newPassword !== confirmPassword) {
          setErrorMsg("Passwords do not match!");
          setLoading(false);
          return;
        }
        if (newPassword.length < 4) {
          setErrorMsg("Password must be at least 4 characters.");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:3000/api/members/setup-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            facultyName: selectedFaculty,
            newPassword
          })
        });

        const data = await res.json();
        if (res.ok) {
          loginMember(data.user, data.token);
          onClose();
          navigate("/member-dashboard");
        } else {
          setErrorMsg(data.message || "Password setup failed.");
        }
      } else {
        const res = await fetch("http://localhost:3000/api/members/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            facultyName: selectedFaculty,
            password
          })
        });

        const data = await res.json();
        if (res.ok) {
          loginMember(data.user, data.token);
          onClose();
          navigate("/member-dashboard");
        } else {
          setErrorMsg(data.message || "Login failed. Check your password.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Please make sure backend server is active.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative overflow-hidden">
        {/* Header Shape */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-t-2xl"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold z-10"
        >
          &times;
        </button>

        <div className="relative mt-4 bg-white rounded-xl p-5 shadow-lg flex flex-col gap-4 border">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-800">Faculty Member Login</h2>
            <p className="text-xs text-gray-500 mt-1">
              Select your faculty account to access your personalized IIC dashboard.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Select Faculty Member *</label>
              <select
                className="w-full border px-3 py-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-600 outline-none"
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
              >
                {facultyList.map((f, i) => {
                  const fname = f.facultyName || f.name;
                  return (
                    <option key={i} value={fname}>
                      {fname} ({f.department || "CMRIT"})
                    </option>
                  );
                })}
              </select>
            </div>

            {!isSetupMode ? (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-700">Password *</label>
                  <span className="text-[11px] text-blue-600 italic">Default: CMRIT@2026</span>
                </div>
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">New Secure Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 rounded-xl shadow transition disabled:opacity-50 text-sm mt-2"
            >
              {loading ? "Logging in..." : isSetupMode ? "Save Password & Login" : "Login to My Dashboard"}
            </button>
          </form>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setIsSetupMode(!isSetupMode);
                setErrorMsg("");
              }}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              {isSetupMode ? "← Back to Standard Login" : "First time login? Set your custom password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberLoginModal;
