import React from "react";
import { useLocation } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const location = useLocation();

  // hide navbar/footer only on auth pages
  const hideLayout = ["/login", "/signup"].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">

      {/* Navbar */}
      {!hideLayout && <Navbar />}

      {/* Main Content */}
      <main className="flex-grow">
        <AppRoutes />
      </main>

      {/* Footer */}
      {!hideLayout && <Footer />}

    </div>
  );
}

export default App;