import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowLeft, Leaf } from "lucide-react";
import "./Auth.css";

export default function Signup() {
  const navigate = useNavigate();

  const BASE_URL = "https://carbon-tracker-d2d8.onrender.com";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        navigate("/login");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      console.log(err);
      alert("Signup failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("currentUser", JSON.stringify({ name: data.name }));
        localStorage.setItem("isAuth", true);
        navigate("/home");
      } else {
        alert(data.message || "Google Signup Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong with Google Auth");
    }
  };

  return (
    <div className="auth-bg signup">
      <nav className="auth-nav">
        <Link to="/" className="auth-logo">
          Carbon Footprint Tracker
        </Link>
      </nav>

      <div className="auth-container">
        <div className="auth-header">
          <span>STEP INTO THE ECOSYSTEM</span>
          <h1>Create Account</h1>
        </div>

        <form onSubmit={handleSignup} className="auth-form">

          <div className="form-group">
            <label>FULL NAME</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>EMAIL ADDRESS</label>
            <input
              type="email"
              className="auth-input"
              placeholder="nature@ecotrack.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>CREATE PASSWORD</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit">
            Sign Up
          </button>

          <div className="auth-divider">
            OR SIGN UP WITH
          </div>

          <div className="social-auth">
            <div className="google-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert("Google Auth Failed")}
                theme="filled_black"
                shape="rectangular"
                text="signin_with"
                size="large"
              />
            </div>
          </div>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </form>

        <div className="auth-terms">
          <div className="links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
