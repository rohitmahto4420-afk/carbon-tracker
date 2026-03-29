import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Leaf } from "lucide-react";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://carbon-tracker-d2d8.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem(
          "currentUser",
          JSON.stringify({ name: data.name, email })
        );
        localStorage.setItem("isAuth", true);

        navigate("/home");
      } else {
        alert(data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error. Try again later.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(
        "https://carbon-tracker-d2d8.onrender.com/api/auth/google",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: credentialResponse.credential }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem(
          "currentUser",
          JSON.stringify({ name: data.name })
        );
        localStorage.setItem("isAuth", true);

        navigate("/home");
      } else {
        alert(data.message || "Google Login Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Google authentication error");
    }
  };

  return (
    <div className="auth-bg login">
      <nav className="auth-nav">
        <Link to="/" className="auth-logo">
          <Leaf size={24} color="#7FE57F" /> Carbon Footprint Tracker
        </Link>
      </nav>

      <div className="auth-container">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Continue your journey toward a sustainable lifestyle and track your daily impact.</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">

          <div className="form-group">
            <label>EMAIL ADDRESS</label>
            <input
              type="email"
              className="auth-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>
              PASSWORD
              <Link to="/reset-password">Forgot Password?</Link>
            </label>
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
            Log In
          </button>

          <div className="auth-divider">
            OR LOG IN WITH
          </div>

          <div className="social-auth">
            <div className="google-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log("Google Login Failed")}
                theme="filled_black"
                shape="rectangular"
                text="signin_with"
                size="large"
              />
            </div>
          </div>

          <div className="auth-footer">
            Don't have an account? <Link to="/signup">Sign Up</Link>
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