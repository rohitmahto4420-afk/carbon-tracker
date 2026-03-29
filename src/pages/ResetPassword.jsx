import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import "./Auth.css";

export default function ResetPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleReset = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("https://carbon-tracker-d2d8.onrender.com/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Password reset successfully! You can now login.");
                navigate("/login");
            } else {
                alert(data.message || "Password reset failed");
            }
        } catch (error) {
            console.error("Reset error:", error);
            alert("Something went wrong. Is your backend running?");
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
                    <h1>Reset Password</h1>
                    <p>Enter your email and a new password below.</p>
                </div>

                <form onSubmit={handleReset} className="auth-form">
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
                        <label>NEW PASSWORD</label>
                        <input
                            type="password"
                            className="auth-input"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-submit">
                        Update Password
                    </button>

                    <div className="auth-footer">
                        Remembered your password? <Link to="/login">Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}