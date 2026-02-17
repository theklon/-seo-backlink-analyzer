import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Adminlogin.css";
import klonLogo from "../assets/klonlogo.png";
import { API_BASE_URL } from "../api";


function Adminlogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = email, 2 = otp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    document.title = "CEO Login of Klon";

    const description = "Klon Squad Manager Access";

    let metaTag = document.querySelector('meta[name="description"]');
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.setAttribute("name", "description");
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute("content", description);
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter Email");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        throw new Error(data.detail || "Failed to send OTP");
      }

      setMessage("OTP sent to your admin email. Please check your inbox.");
      setStep(2);
    } catch (err) {
      setError(err.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp.trim()) {
      setError("Please enter OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "OTP verification failed");
      }

      localStorage.setItem("isAdminLoggedIn", "true");
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const cardClass =
    step === 1
      ? "login-card user-login-card step-email"
      : "login-card user-login-card step-otp";

  return (
    <div className="login-page user-login-page">
      <div className="left-section">
        <div className="logo-block">
          <img src={klonLogo} alt="Klon Logo" className="main-logo" />
          <div className="logo-subtitle">by nextwebi</div>
        </div>
      </div>

      <div className="right-section">
        <div className={cardClass}>
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

          {message && (
            <div
              style={{
                color: "#15803d",
                fontSize: "13px",
                marginBottom: "10px",
              }}
            >
              {message}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter admin Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtpAndLogin}>
              <div className="field">
                <label>OTP</label>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>

              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Login"}
              </button>

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "13px",
                }}
              >
                Wrong email?
                <button
                  type="button"
                  style={{
                    border: "none",
                    background: "none",
                    color: "#4f46e5",
                    cursor: "pointer",
                    padding: 0,
                    marginLeft: 4,
                  }}
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setError("");
                    setMessage("");
                  }}
                >
                  Go back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

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