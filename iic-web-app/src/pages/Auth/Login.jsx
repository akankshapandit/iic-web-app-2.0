import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/authService";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const res = await loginUser(form);
      login(res);
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f0f5fa] relative overflow-hidden font-sans">
      {/* Modern abstract animated background shapes */}
      <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }}></div>
      
      {/* Main Login Card */}
      <div className="relative z-10 bg-white/80 backdrop-blur-2xl border border-white p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(29,78,216,0.08)] w-full max-w-md transition-all duration-500 hover:shadow-[0_20px_50px_rgba(29,78,216,0.12)] my-8">
        
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 mt-2 font-medium">Please enter your details to sign in</p>
        </div>
        
        <div className="space-y-5">
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
          
          <div className="flex justify-between items-center text-sm px-1">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-medium hover:text-gray-900 transition-colors">
              <input type="checkbox" className="accent-blue-600 w-4 h-4 rounded cursor-pointer" />
              Remember me
            </label>
            <span onClick={() => navigate("/forgot-password")} className="cursor-pointer text-blue-600 font-semibold hover:text-blue-800 transition-colors">
              Forgot Password?
            </span>
          </div>

          <button onClick={handleLogin} className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.24)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 mt-2">
            Sign In
          </button>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">Or continue with</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          
          <div className="flex justify-center w-full">
            <GoogleLogin onSuccess={(res) => console.log(res)} />
          </div>

          <p className="text-center text-gray-600 font-medium mt-6">
            Don't have an account?{" "}
            <span onClick={() => navigate("/signup")} className="text-blue-600 font-bold cursor-pointer hover:text-blue-800 transition-colors">
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;