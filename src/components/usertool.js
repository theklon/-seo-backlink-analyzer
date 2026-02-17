import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import { useNavigate, useLocation } from "react-router-dom";

import logo from "../assets/klonlogo.png";

import { HiOutlineHome } from "react-icons/hi";
import { FaLink, FaDesktop } from "react-icons/fa6";
import { VscTools } from "react-icons/vsc";

import { LuCalendar } from "react-icons/lu";
import { FiBell, FiInfo } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
function getShortUrl(url) {
  if (!url) return "-";
  const maxLen = 25; // adjust length as you like
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen) + "...";
}
function UserTools() {
  const navigate = useNavigate();
  const location = useLocation();

  const [toolName, setToolName] = useState("");
  const [link, setLink] = useState("");
  const [benefits, setBenefits] = useState("");
  const [accessType, setAccessType] = useState("paid"); // "paid" | "free" | "trial"
  const [error, setError] = useState("");

  // local list of saved tools (for now, in-memory only)
  const [savedTools, setSavedTools] = useState([]);

  // for popup
  const [selectedTool, setSelectedTool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setSelectedTool(null);
      }
    };

    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);
  useEffect(() => {
    localStorage.setItem("userTools", JSON.stringify(savedTools));
  }, [savedTools]);
  const handleSaveTool = (e) => {
    e.preventDefault();
    if (!toolName.trim() || !link.trim()) {
      setError("Tool name and link are required.");
      return;
    }

    const newTool = {
      id: Date.now(),
      toolName: toolName.trim(),
      link: link.trim(),
      benefits: benefits.trim(),
      accessType,
    };

    // TODO: POST to backend when a tools API exists.
    console.log("Saving tool:", newTool);

    // update local list so it shows on the right
    setSavedTools((prev) => [newTool, ...prev]);

    setError("");
    setToolName("");
    setLink("");
    setBenefits("");
    setAccessType("paid");
  };

  return (
    <div className="dashboard-root user-dashboard">
      {/* TOP BAR */}
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
          <div className="breadcrumb">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/user/dashboard")} // or "/admin/dashboard" in admin pages
            >
              Home
            </span>
            {" > Tool Collections"}
          </div>

          <h2 className="page-title">Tool Collections</h2>

          {/* Two‑column layout: left card, right scrollable list */}
          <div className="tool-page">
            {/* LEFT: Add Tool card */}
            <div className="tool-form-card tool-card">
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

                <div
                  className="modal-actions"
                  style={{ justifyContent: "flex-end" }}
                >
                  <button className="primary-btn" type="submit">
                    Save Tool
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT: Scrollable list of saved tools */}
            <div className="saved-tools-panel">
              <h3 className="admin-section-title">Saved Tools</h3>

              <div className="saved-tools-list">
                {savedTools.length === 0 && (
                  <div className="saved-tool-item">
                    <div>No tools saved yet. Add a tool on the left.</div>
                  </div>
                )}

                {savedTools.map((tool) => (
                  <div key={tool.id} className="saved-tool-item">
                    <div className="saved-tool-header">
                      {/* Tool name as clickable hidden link */}
                      <button
                        type="button"
                        className="saved-tool-name-button"
                        title={tool.link}
                        onClick={() => {
                          if (tool.link) {
                            window.open(
                              tool.link,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }
                        }}
                      >
                        {tool.toolName}
                        <span className="saved-tool-link-hint">
                          Open link
                        </span>
                      </button>

                      {/* Info icon opens popup */}
                      <button
                        type="button"
                        className="saved-tool-info-btn"
                        onClick={() => {
                          setSelectedTool(tool);
                          setIsModalOpen(true);
                        }}
                        aria-label="View tool details"
                      >
                        <FiInfo />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* end .tool-page */}

          {/* MODAL for tool details */}
          {isModalOpen && selectedTool && (
            <div
              className="tool-modal-backdrop"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedTool(null);
              }}
            >
              <div
                className="tool-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="tool-modal-header">
                  <h4>{selectedTool.toolName}</h4>
                  <button
                    type="button"
                    className="tool-modal-close"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedTool(null);
                    }}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <div className="tool-modal-body">
                  <div className="tool-modal-row">
                    <span className="tool-modal-label">URL:</span>
                    {selectedTool.link ? (
                      <a
                        href={selectedTool.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                         {getShortUrl(selectedTool.link)}
                      </a>
                    ) : (
                      <span>-</span>
                    )}
                  </div>

                  <div className="tool-modal-row">
                    <span className="tool-modal-label">Access Type:</span>
                    <span>
                      {selectedTool.accessType
                        ? selectedTool.accessType
                            .charAt(0)
                            .toUpperCase() +
                          selectedTool.accessType.slice(1)
                        : "-"}
                    </span>
                  </div>

                  <div className="tool-modal-row">
                    <span className="tool-modal-label">Description:</span>
                    <span>{selectedTool.benefits || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserTools;