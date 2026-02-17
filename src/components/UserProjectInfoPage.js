import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./AdminDashboard.css";
import { API_BASE_URL } from "../api";

import logo from "../assets/klonlogo.png";

import { HiOutlineHome } from "react-icons/hi";
import { FaLink, FaDesktop } from "react-icons/fa6";
import { VscTools } from "react-icons/vsc";
import { LuCalendar } from "react-icons/lu";
import { FiBell } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";

function UserProjectInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [domain, setDomain] = useState("");
  const [bio, setBio] = useState("");
  const [contact, setContact] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(true); // first time allow editing

  const projectNameFromState = location.state?.projectName;

  // Load project + info
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        setLoadError("");
        setSaveSuccess("");

        const res = await fetch(`${API_BASE_URL}/api/projects`);
        if (!res.ok) {
          throw new Error(`Failed to load projects: ${res.status}`);
        }
        const data = await res.json();
        const found = data.find((p) => (p.id || p._id) === projectId);

        setProject(found || null);

        const domainVal = found?.infoDomain ?? found?.domain ?? "";
        const bioVal = found?.infoBio ?? found?.bio ?? found?.description ?? "";
        const contactVal = found?.infoContact ?? found?.contact ?? "";

        setDomain(domainVal);
        setBio(bioVal);
        setContact(contactVal);
      } catch (err) {
        setLoadError(err.message || "Error loading project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSave = async () => {
    if (!projectId) return;
    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess("");

      const body = {
        infoDomain: domain.trim(),
        infoBio: bio.trim(),
        infoContact: contact.trim(),
      };

      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Failed to update project info: ${res.status}`);
      }

      const updated = await res.json();
      setProject(updated);
      setSaveSuccess("Project info saved successfully.");
      setIsEditing(false); // switch to view mode after save
    } catch (err) {
      setSaveError(err.message || "Error saving project info");
    } finally {
      setSaving(false);
    }
  };

  const displayProjectName =
    projectNameFromState || project?.name || "Project Info";

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
                location.pathname.startsWith("/user/projects") ? "active" : ""
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

        {/* MAIN CONTENT */}
        <div className="main-content">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/user/dashboard")}
            >
              Home
            </span>
            {" > "}
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/user/projects")}
            >
              View Projects
            </span>
            {" > Info"}
          </div>

          {/* Title */}
          <h2 className="page-title">Project Info – {displayProjectName}</h2>

          {loadError && (
            <div style={{ color: "red", marginBottom: 10 }}>{loadError}</div>
          )}
          {saveError && (
            <div style={{ color: "red", marginBottom: 10 }}>{saveError}</div>
          )}
          {saveSuccess && (
            <div style={{ color: "green", marginBottom: 10 }}>
              {saveSuccess}
            </div>
          )}

          {loading && <div>Loading project...</div>}

          {!loading && project && (
            <div>
              {/* Edit/View toggle (you can replace text with a pencil icon later) */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 8,
                }}
              >
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setIsEditing((prev) => !prev)}
                >
                  {isEditing ? "View" : "Edit"}
                </button>
              </div>

              <div className="tool-card">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                >
                  <div className="modal-field">
                    <label>Project Domain Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="e.g. example.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                      />
                    ) : (
                      <div>{domain || "-"}</div>
                    )}
                  </div>

                  <div className="modal-field">
                    <label>Project Bio</label>
                    {isEditing ? (
                      <textarea
                        rows={6} // bigger box
                        placeholder="Describe this project..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {bio || "-"}
                      </div>
                    )}
                  </div>

                  <div className="modal-field">
                    <label>Contact</label>
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="Email / phone / contact URL"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                      />
                    ) : (
                      <div>{contact || "-"}</div>
                    )}
                  </div>

                  {isEditing && (
                    <div
                      className="modal-actions"
                      style={{ justifyContent: "flex-end", marginTop: 16 }}
                    >
                      <button
                        className="primary-btn"
                        type="submit"
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProjectInfoPage;