import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Calculator from "./pages/Calculator";
import History from "./pages/History";
import Tips from "./pages/Tips";
import Dashboard from "./components/Dashboard";
import Records from "./pages/Records";
import ResetPassword from "./pages/ResetPassword";
import Challenges from "./pages/Challenges";
import EcoChatbot from "./components/EcoChatbot";
import Graph from "./pages/Graph";
import Settings from "./pages/Settings";
import Search from "./pages/Search";
import Notifications from "./pages/Notifications";
import Simulator from "./pages/Simulator";
import SmartScanner from "./pages/SmartScanner";

// 🔹 Layout control component
function Layout({ children }) {
  const location = useLocation();

  const hideLayout =
    location.pathname === "/" ||
    location.pathname === "/signup" ||
    location.pathname === "/login" ||
    location.pathname === "/reset-password";

  if (hideLayout) {
    return (
      <>
        {children}
      </>
    );
  }

  return (
    <div className="ecology-app-layout">
      <Sidebar />
      <div className="ecology-main-content">
        <TopBar />
        <main className="ecology-page-container">
          {children}
        </main>
      </div>
      <EcoChatbot />
    </div>
  );
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
    }
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          {/* AUTH PAGES */}
          <Route path="/" element={<Signup />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* MAIN APP */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/history" element={<History />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/scanner" element={<SmartScanner />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/search" element={<Search />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/records" element={<Records />} />
          <Route path="/challenges" element={<Challenges />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;