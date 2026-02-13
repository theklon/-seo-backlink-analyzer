import React, { useState } from "react";
import "./AdminDashboard.css";
import { useNavigate, useLocation } from "react-router-dom";

import logo from "../assets/klonlogo.png";

import { HiOutlineHome } from "react-icons/hi";
import { FaLink, FaDesktop } from "react-icons/fa6";
import { VscTools } from "react-icons/vsc";

import { LuCalendar } from "react-icons/lu";
import { FiBell } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";

function UserTools() {
  const navigate = useNavigate();
  const location = useLocation();

  const [toolName, setToolName] = useState("");
  const [link, setLink] = useState("");
  const [benefits, setBenefits] = useState("");
  const [accessType, setAccessType] = useState("paid"); // "paid" | "free" | "trial"
  const [error, setError] = useState("");

  const handleSaveTool = (e) => {
    e.preventDefault();
    if (!toolName.trim() || !link.trim()) {
      setError("Tool name and link are required.");
      return;
    }

    const payload = {
      toolName: toolName.trim(),
      link: link.trim(),
      benefits: benefits.trim(),
      accessType,
    };

    // TODO: POST to backend when a tools API exists.
    console.log("Saving tool:", payload);

    setError("");
    setToolName("");
    setLink("");
    setBenefits("");
    setAccessType("paid");
  };

  return (
    <div className="dashboard-root user-dashboard">
      {/* TOP BAR (same as other user pages) */}
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="Klon" className="topbar-logo" />
        </div>

        <div className="topbar-right">
          <div className="topbar-icon">
            <LuCalendar />
          </div>
          <div className="topbar-icon">
            <FiBell />
          </div>

          <div className="topbar-divider"></div>

          <div className="admin-info">
            <div className="admin-avatar">U</div>
            <div className="admin-text">
              <div className="admin-name">Nextwebi</div>
              <div className="admin-role">User</div>
            </div>
            <div className="topbar-icon">
              <IoIosArrowDown />
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="dashboard-body">
        {/* SIDEBAR */}
        <div className="sidebar">
          <ul className="sidebar-menu">
            <li
              className={`menu-item ${
                location.pathname === "/user/dashboard" ? "active" : ""
              }`}
              onClick={() => navigate("/user/dashboard")}
            >
              <HiOutlineHome className="nav-icon" />
              <span>Home</span>
            </li>

            <li
              className={`menu-item ${
                location.pathname === "/user/backlink" ? "active" : ""
              }`}
              onClick={() => navigate("/user/backlink")}
            >
              <FaLink className="nav-icon" />
              <span>Backlinks</span>
            </li>

            <li
              className={`menu-item ${
                location.pathname === "/user/projects" ? "active" : ""
              }`}
              onClick={() => navigate("/user/projects")}
            >
              <FaDesktop className="nav-icon" />
              <span>View Projects</span>
            </li>

            <li
              className={`menu-item ${
                location.pathname === "/user/categories" ? "active" : ""
              }`}
              onClick={() => navigate("/user/categories")}
            >
              <VscTools className="nav-icon" />
              <span>Tool Collections</span>
            </li>
          </ul>
        </div>

        {/* MAIN CONTENT – Tool Collections */}
        <div className="main-content">
          <div className="breadcrumb">Home &gt; Tool Collections</div>

          <h2 className="page-title">Tool Collections</h2>

          <div className="tool-card">
            <div className="tool-card-header">
              <h3>Add Tool</h3>
              <p>Add tool details for reference and tracking.</p>
            </div>

            <form className="tool-form" onSubmit={handleSaveTool}>
              {error && (
                <div style={{ color: "red", marginBottom: 8 }}>{error}</div>
              )}

              <div className="modal-field">
                <label>
                  Tool Name <span>*</span>
                </label>
                <input
                  type="text"
                  placeholder="eg: Ahrefs"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                />
              </div>

              <div className="modal-field">
                <label>
                  Links <span>*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://toolwebsite.com"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              <div className="modal-field">
                <label>Benefits</label>
                <textarea
                  rows={4}
                  placeholder="Describe how this tool helps with backlinks"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                />
              </div>

              <div className="modal-field">
                <label>Access Type</label>
                <div className="tool-access-row">
                  <label className="tool-access-option">
                    <input
                      type="radio"
                      name="accessType"
                      value="paid"
                      checked={accessType === "paid"}
                      onChange={(e) => setAccessType(e.target.value)}
                    />
                    <span>Paid</span>
                  </label>

                  <label className="tool-access-option">
                    <input
                      type="radio"
                      name="accessType"
                      value="free"
                      checked={accessType === "free"}
                      onChange={(e) => setAccessType(e.target.value)}
                    />
                    <span>Free</span>
                  </label>

                  <label className="tool-access-option">
                    <input
                      type="radio"
                      name="accessType"
                      value="trial"
                      checked={accessType === "trial"}
                      onChange={(e) => setAccessType(e.target.value)}
                    />
                    <span>Trial</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions" style={{ justifyContent: "flex-end" }}>
                <button className="primary-btn" type="submit">
                  Save Tool
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserTools;