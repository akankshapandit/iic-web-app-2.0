import { useState } from "react";
import { API_BASE_URL } from "../../config";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    alert(data.link);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-6 rounded shadow">
        <h2>Forgot Password</h2>
        <input onChange={(e) => setEmail(e.target.value)} />
        <button onClick={handleSubmit}>Send</button>
      </div>
    </div>
  );
}

export default ForgotPassword;