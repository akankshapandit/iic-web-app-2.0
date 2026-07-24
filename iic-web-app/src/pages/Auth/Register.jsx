import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async () => {
    try {
      await registerUser(form);
      alert("Account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f0f5fa] relative overflow-hidden font-sans">
      {/* Modern abstract animated background shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }}></div>
      
      {/* Main Register Card */}
      <div className="relative z-10 bg-white/80 backdrop-blur-2xl border border-white p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(29,78,216,0.08)] w-full max-w-md transition-all duration-500 hover:shadow-[0_20px_50px_rgba(29,78,216,0.12)] my-8">
        
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
          <p className="text-gray-500 mt-2 font-medium">Join CMRIT IIC today</p>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Full Name</label>
            <input 
              placeholder="John Doe" 
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 px-5 py-3.5 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email Address</label>
            <input 
              placeholder="hello@cmrit.ac.in" 
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 px-5 py-3.5 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 px-5 py-3.5 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
            />
          </div>

          <button onClick={handleSubmit} className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.24)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 mt-6">
            Sign Up
          </button>

          <p className="text-center text-gray-600 font-medium mt-6">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} className="text-blue-600 font-bold cursor-pointer hover:text-blue-800 transition-colors">
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;