import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Adminlogin.css";
import klonLogo from "../assets/klonlogo.png";

function Adminlogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {
    // TEMP frontend credentials
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("isAdminLoggedIn", "true");
      navigate("/admin/dashboard");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-page">
      {/* LEFT SECTION */}
      <div className="left-section">
        <div className="logo-block">
          <img src={klonLogo} alt="Klon Logo" className="main-logo" />
          <div className="logo-subtitle">by nextwebi</div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="right-section">
        <div className="login-card">
          <h2>Admin Login</h2>

          <div className="field">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Eye Icon */}
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#546270"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12s3.2-5 8-5 8 5 8 5-3.2 5-8 5-8-5-8-5z" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </span>
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div
              style={{
                color: "red",
                fontSize: "13px",
                marginBottom: "10px",
              }}
            >
              {error}
            </div>
          )}

          <button className="login-btn" onClick={handleLogin}>
            Login
          </button>

          <div className="forgot">Forgot Password?</div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="login-footer">
        <span className="footer-link">Privacy Policy</span>
        <span className="footer-separator">|</span>
        <span className="footer-copy">
          © 2026 Nextwebi IT Solutions. All Rights Reserved
        </span>
      </div>
    </div>
  );
}

export default Adminlogin;