import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Adminlogin.css";
import klonLogo from "../assets/klonlogo.png";
import { API_BASE_URL } from "../api";

function Adminlogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      if (!otpStep) {
        // Step 1: username + password -> request OTP
        const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Invalid username or password");
        }

        const data = await res.json();
        if (data.otp_required) {
          setOtpStep(true);
        }
      } else {
        // Step 2: verify OTP
        const res = await fetch(`${API_BASE_URL}/api/admin/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "OTP verification failed");
        }

        await res.json();

        // Mark admin as logged in (used by ProtectedRoute)
        localStorage.setItem("isAdminLoggedIn", "true");
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(err.message || "Error during login");
    } finally {
      setLoading(false);
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

          <form onSubmit={handleSubmit}>
            {!otpStep ? (
              <>
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
              </>
            ) : (
              <>
                <p style={{ marginBottom: "8px", fontSize: "13px" }}>
                  An OTP has been sent to{" "}
                  <strong>ajay@nextwebi.com</strong>. Please enter it below.
                </p>

                <div className="field">
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </>
            )}

            <button
              className="login-btn"
              type="submit"
              disabled={loading}
              style={{ marginTop: "10px" }}
            >
              {loading
                ? "Please wait..."
                : !otpStep
                ? "Send OTP"
                : "Verify OTP"}
            </button>
          </form>

          {!otpStep && <div className="forgot">Forgot Password?</div>}
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