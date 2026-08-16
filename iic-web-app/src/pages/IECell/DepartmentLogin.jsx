import { useState } from "react";
import { useNavigate } from "react-router-dom";

const departments = [
  {
    username: "mca",
    password: "mca123",
    department: "MCA",
  },
  {
    username: "mba",
    password: "mba123",
    department: "MBA",
  },
  {
    username: "cse",
    password: "cse123",
    department: "CSE",
  },
  {
    username: "cseaiml",
    password: "aiml123",
    department: "CSE-AIML",
  },
  {
    username: "basicscience",
    password: "basic123",
    department: "Basic Science",
  },
  {
    username: "aids",
    password: "aids123",
    department: "AI&DS",
  },
  {
    username: "ece",
    password: "ece123",
    department: "ECE",
  },
  {
    username: "ise",
    password: "ise123",
    department: "ISE",
  },
  {
    username: "aiml",
    password: "aimldept123",
    department: "AIML",
  },
];
const iicUsers = [
  {
    username: "president",
    password: "president123",
    role: "President",
  },
  {
    username: "vicepresident",
    password: "vice123",
    role: "Vice President",
  },
];

function DepartmentLogin() {
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState("department");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    // ==========================================
    // IIC PRESIDENT / VICE PRESIDENT LOGIN
    // ==========================================

    if (loginType === "president" || loginType === "vicepresident") {
      const user = iicUsers.find(
        (person) =>
          person.username.toLowerCase() === username.trim().toLowerCase() &&
          person.password === password.trim() &&
          ((loginType === "president" && person.role === "President") ||
            (loginType === "vicepresident" &&
              person.role === "Vice President")),
      );

      if (!user) {
        alert("Invalid Credentials");
        return;
      }

      // Store IIC login information
      localStorage.setItem("iicLoggedIn", "true");
      localStorage.setItem("iicRole", user.role);
      localStorage.setItem("iicUsername", user.username);

      // Go to IIC Dashboard
      navigate("/iic-dashboard");

      return;
    }

    // ==========================================
    // DEPARTMENT LOGIN
    // ==========================================

    const user = departments.find(
      (dept) =>
        dept.username.trim().toLowerCase() === username.trim().toLowerCase() &&
        dept.password === password.trim(),
    );

    if (!user) {
      alert("Invalid Credentials");
      return;
    }

    // Store department information
    localStorage.setItem("department", user.department);

    // Go to Department Dashboard
    navigate("/department-dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-[420px]">
        {/* TITLE */}

        <h1 className="text-3xl font-bold text-center mb-2">I&E Login</h1>

        <p className="text-center text-gray-500 mb-8">
          Innovation & Entrepreneurship Cell
        </p>

        {/* LOGIN TYPE */}

        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Login As
        </label>

        <select
          value={loginType}
          onChange={(e) => {
            setLoginType(e.target.value);
            setUsername("");
            setPassword("");
          }}
          className="w-full border border-gray-300 rounded-xl p-3 mb-5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="department">Department</option>

          <option value="president">IIC President</option>

          <option value="vicepresident">IIC Vice President</option>
        </select>

        {/* USERNAME */}

        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Username
        </label>

        <input
          type="text"
          placeholder="Enter username"
          className="w-full border border-gray-300 rounded-xl p-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* PASSWORD */}

        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Password
        </label>

        <input
          type="password"
          placeholder="Enter password"
          className="w-full border border-gray-300 rounded-xl p-3 mb-6 outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              login();
            }
          }}
        />

        {/* LOGIN BUTTON */}

        <button
          onClick={login}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-xl p-3 font-semibold transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default DepartmentLogin;
