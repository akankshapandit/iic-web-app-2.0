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
];

function DepartmentLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
  console.log("Username:", `"${username}"`);
  console.log("Password:", `"${password}"`);
  console.log(departments);

  const user = departments.find(
    (dept) =>
      dept.username.trim().toLowerCase() === username.trim().toLowerCase() &&
      dept.password === password.trim()
  );

  console.log("Matched User:", user);

  if (!user) {
    alert("Invalid Credentials");
    return;
  }

  localStorage.setItem("department", user.department);

  navigate("/department-dashboard");
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white shadow-xl rounded-3xl p-10 w-[420px]">

        <h1 className="text-3xl font-bold text-center mb-8">
          Department Login
        </h1>

        <input
          placeholder="Username"
          className="w-full border rounded-xl p-3 mb-4"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-xl p-3 mb-6"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-blue-700 text-white rounded-xl p-3 hover:bg-blue-800"
        >
          Login
        </button>

      </div>

    </div>
  );
}

export default DepartmentLogin;