import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const [menuOpen, setMenuOpen] = useState(false); // ✅ NEW

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2 className="logo">
        <Link to="/home" style={{ textDecoration: "none", color: "inherit" }}>
          🌱 Carbon Tracker
        </Link>
      </h2>

      {/* 🍔 Hamburger */}
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
        <li><Link to="/home" onClick={() => setMenuOpen(false)}>Home</Link></li>
        <li><Link to="/calculator" onClick={() => setMenuOpen(false)}>Calculator</Link></li>
        <li><Link to="/history" onClick={() => setMenuOpen(false)}>History</Link></li>
        <li><Link to="/graph" onClick={() => setMenuOpen(false)}>Graph</Link></li>
        <li><Link to="/challenges" onClick={() => setMenuOpen(false)}>Challenges</Link></li>
        <li><Link to="/tips" onClick={() => setMenuOpen(false)}>Tips</Link></li>
        <li><Link to="/records" onClick={() => setMenuOpen(false)}>Records</Link></li>

        {/* Theme Toggle */}
        <li>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </li>

        {/* Logout */}
        <li>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}