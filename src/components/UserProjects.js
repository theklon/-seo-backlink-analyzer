import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../api";

import logo from "../assets/klonlogo.png";

import { HiOutlineHome } from "react-icons/hi";
import { FaLink, FaDesktop } from "react-icons/fa6";
import { VscTools } from "react-icons/vsc";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { FiCopy } from "react-icons/fi";
import { HiOutlineExternalLink } from "react-icons/hi";
import { LuCalendar } from "react-icons/lu";
import { FiBell } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { IoMdSearch } from "react-icons/io";
import { FaInstagram } from "react-icons/fa";
import { FaFacebookSquare } from "react-icons/fa";
import { FaSquareTwitter } from "react-icons/fa6";

function UserProjects() {
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState("");

  // Backlinks modal state
  const [backlinksModalOpen, setBacklinksModalOpen] = useState(false);
  const [backlinksLoading, setBacklinksLoading] = useState(false);
  const [backlinksError, setBacklinksError] = useState("");
  const [backlinksForProject, setBacklinksForProject] = useState([]);
  const [backlinksProjectName, setBacklinksProjectName] = useState("");

  // Info (social links) modal state
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoProject, setInfoProject] = useState(null);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoError, setInfoError] = useState("");

  // per-field edit toggles: when true, show input even if URL exists
  const [editingInstagram, setEditingInstagram] = useState(false);
  const [editingFacebook, setEditingFacebook] = useState(false);
  const [editingTwitter, setEditingTwitter] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        setProjectsError("");
        const res = await fetch(`${API_BASE_URL}/api/projects`);
        if (!res.ok) {
          throw new Error(`Failed to load projects: ${res.status}`);
        }
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        setProjectsError(err.message || "Error loading projects");
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);


  const closeBacklinksModal = () => {
    setBacklinksModalOpen(false);
    setBacklinksForProject([]);
    setBacklinksError("");
    setBacklinksProjectName("");
  };

  // INFO modal handlers
  const openInfoModal = (project) => {
    setInfoProject(project);
    setInstagramUrl(project.instagramUrl || "");
    setFacebookUrl(project.facebookUrl || "");
    setTwitterUrl(project.twitterUrl || "");
    setInfoError("");
    // when opening, not in "editing" mode: show inputs only if empty
    setEditingInstagram(false);
    setEditingFacebook(false);
    setEditingTwitter(false);
    setInfoModalOpen(true);
  };

  const closeInfoModal = () => {
    setInfoModalOpen(false);
    setInfoProject(null);
    setInstagramUrl("");
    setFacebookUrl("");
    setTwitterUrl("");
    setInfoError("");
    setEditingInstagram(false);
    setEditingFacebook(false);
    setEditingTwitter(false);
  };

  const handleSaveProjectInfo = async () => {
    if (!infoProject) return;
    try {
      setInfoSaving(true);
      setInfoError("");

      const projectId = infoProject.id || infoProject._id;

      const body = {
        instagramUrl: instagramUrl.trim(),
        facebookUrl: facebookUrl.trim(),
        twitterUrl: twitterUrl.trim(),
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

      setProjects((prev) =>
        prev.map((p) =>
          (p.id || p._id) === (updated.id || updated._id) ? updated : p
        )
      );

      closeInfoModal();
    } catch (err) {
      setInfoError(err.message || "Error saving project info");
    } finally {
      setInfoSaving(false);
    }
  };

  return (
    <div className="dashboard-root user-dashboard">
      {/* TOP BAR – same as UserDashboard / UserBacklinks */}
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
        {/* SIDEBAR – View Projects active */}
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

        {/* MAIN CONTENT – View Projects */}
        <div className="main-content">
          {/* Breadcrumb */}
          <div className="breadcrumb">Home &gt; View Projects</div>

          {/* Title */}
          <h2 className="page-title">View Projects</h2>

          {/* Small search bar (not wired yet) */}
          <div className="backlink-filters">
            <div className="search-box">
              <span className="search-icon">
                <IoMdSearch />
              </span>
              <input type="text" placeholder="Search by Project name" />
            </div>
          </div>

          {/* Projects table */}
          {projectsError && (
            <div style={{ color: "red", marginBottom: 8 }}>{projectsError}</div>
          )}
          <div
            className="table-container user-projects-table"
            style={{ marginTop: 8 }}
          >
            <table>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th className="user-projects-actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingProjects ? (
                  <tr>
                    <td colSpan={2}>Loading projects...</td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={2}>No projects found.</td>
                  </tr>
                ) : (
                  projects.map((p) => (
                    <tr key={p.id || p._id || p.name}>
                      <td>
                        <div
                          style={{
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.name}
                        </div>
                      </td>
                      <td className="user-projects-actions-col">
                        <div className="user-projects-actions">
                          <button
                            className="user-project-btn user-project-btn-info"
                            type="button"
                            onClick={() => openInfoModal(p)}
                          >
                            Info
                          </button>
                          <button
                            className="user-project-btn user-project-btn-media"
                            onClick={() =>
                              navigate(`/user/projects/${p.id || p._id}/media`, {
                                state: { projectName: p.name },
                              })
                            }
                          >
                            Media
                          </button>
                          <button 
                            className="user-project-btn user-project-btn-backlinks"
                            type="button"
                            onClick={() => {
                              navigate(`/user/projects/${p.id}/backlinks`, {
                                state: {
                                  projectName: p.name,
                                },
                              });
                            }}
                          >
                            Backlink
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PROJECT INFO (SOCIAL LINKS) MODAL */}
      {infoModalOpen && infoProject && (
        <div className="modal-overlay">
          <div className="modal-card backlinks-modal-card">
            <div className="modal-header">
              <h3>Project Info – {infoProject.name}</h3>
              <span className="modal-close" onClick={closeInfoModal}>
                ×
              </span>
            </div>

            <div className="modal-body backlinks-modal-body">
              {infoError && (
                <div style={{ color: "red", marginBottom: 8 }}>{infoError}</div>
              )}

              {/* Instagram */}
              <div className="social-row">
                <div className="social-icon instagram">
                  <FaInstagram />
                </div>

                <div className="social-row-content">
                  {(editingInstagram || !instagramUrl.trim()) && (
                    <input
                      type="url"
                      placeholder="Instagram profile URL"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                    />
                  )}

                  {instagramUrl.trim() && !editingInstagram && (
                    <div className="social-link-row">
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link-url"
                      >
                        {instagramUrl}
                      </a>
                      <div className="social-link-actions">
                        <button
                          type="button"
                          className="social-link-btn"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                instagramUrl
                              );
                            } catch (e) {
                              console.error("Copy failed", e);
                            }
                          }}
                        >
                          <FiCopy />
                        </button>
                        <a
                          href={instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link-btn"
                        >
                          <HiOutlineExternalLink />
                        </a>
                        <button
                          type="button"
                          className="social-link-btn"
                          title="Edit link"
                          onClick={() => setEditingInstagram(true)}
                        >
                          <HiOutlinePencilAlt />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Facebook */}
              <div className="social-row">
                <div className="social-icon facebook">
                  <FaFacebookSquare />
                </div>

                <div className="social-row-content">
                  {(editingFacebook || !facebookUrl.trim()) && (
                    <input
                      type="url"
                      placeholder="Facebook page URL"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                    />
                  )}

                  {facebookUrl.trim() && !editingFacebook && (
                    <div className="social-link-row">
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link-url"
                      >
                        {facebookUrl}
                      </a>
                      <div className="social-link-actions">
                        <button
                          type="button"
                          className="social-link-btn"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                facebookUrl
                              );
                            } catch (e) {
                              console.error("Copy failed", e);
                            }
                          }}
                        >
                          <FiCopy />
                        </button>
                        <a
                          href={facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link-btn"
                        >
                          <HiOutlineExternalLink />
                        </a>
                        <button
                          type="button"
                          className="social-link-btn"
                          title="Edit link"
                          onClick={() => setEditingFacebook(true)}
                        >
                          <HiOutlinePencilAlt />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Twitter / X */}
              <div className="social-row">
                <div className="social-icon twitter">
                  <FaSquareTwitter />
                </div>

                <div className="social-row-content">
                  {(editingTwitter || !twitterUrl.trim()) && (
                    <input
                      type="url"
                      placeholder="Twitter / X profile URL"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                    />
                  )}

                  {twitterUrl.trim() && !editingTwitter && (
                    <div className="social-link-row">
                      <a
                        href={twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link-url"
                      >
                        {twitterUrl}
                      </a>
                      <div className="social-link-actions">
                        <button
                          type="button"
                          className="social-link-btn"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(twitterUrl);
                            } catch (e) {
                              console.error("Copy failed", e);
                            }
                          }}
                        >
                          <FiCopy />
                        </button>
                        <a
                          href={twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link-btn"
                        >
                          <HiOutlineExternalLink />
                        </a>
                        <button
                          type="button"
                          className="social-link-btn"
                          title="Edit link"
                          onClick={() => setEditingTwitter(true)}
                        >
                          <HiOutlinePencilAlt />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleSaveProjectInfo}
                  disabled={infoSaving}
                >
                  {infoSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BACKLINKS LIST MODAL */}
      {backlinksModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card backlinks-modal-card">
            <div className="modal-header">
              <h3>Backlinks for {backlinksProjectName || "Project"}</h3>
              <span className="modal-close" onClick={closeBacklinksModal}>
                ×
              </span>
            </div>

            <div className="modal-body backlinks-modal-body">
              {backlinksLoading && <p>Loading backlinks...</p>}
              {backlinksError && (
                <p style={{ color: "red", marginBottom: 8 }}>
                  {backlinksError}
                </p>
              )}

              {!backlinksLoading &&
                !backlinksError &&
                backlinksForProject.length === 0 && (
                  <p>No backlinks found for this project.</p>
                )}

              {!backlinksLoading &&
                !backlinksError &&
                backlinksForProject.length > 0 && (
                  <div className="backlinks-list">
                    {backlinksForProject.map((b) => (
                      <div
                        className="backlinks-list-item"
                        key={b.id || b._id || b.url}
                      >
                        <div className="backlinks-dot" />
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="backlinks-url"
                        >
                          {b.url}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProjects;