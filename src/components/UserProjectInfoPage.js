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
import { FaInstagram } from "react-icons/fa";
import { FaFacebookSquare } from "react-icons/fa";
import { FaSquareTwitter } from "react-icons/fa6";
import { FiCopy } from "react-icons/fi";
import { HiOutlineExternalLink } from "react-icons/hi";

function UserProjectInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Instagram counts
  const [instagramPosts, setInstagramPosts] = useState("");
  const [instagramFollowers, setInstagramFollowers] = useState("");
  const [instagramFollowing, setInstagramFollowing] = useState("");

  // Facebook counts
  const [facebookPosts, setFacebookPosts] = useState("");
  const [facebookFollowers, setFacebookFollowers] = useState("");
  const [facebookFollowing, setFacebookFollowing] = useState("");

  // Twitter counts
  const [twitterPosts, setTwitterPosts] = useState("");
  const [twitterFollowers, setTwitterFollowers] = useState("");
  const [twitterFollowing, setTwitterFollowing] = useState("");

  const projectNameFromState = location.state?.projectName;

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        setLoadError("");
        setSaveSuccess("");

        // Fetch all projects and find the one matching projectId
        const res = await fetch(`${API_BASE_URL}/api/projects`);
        if (!res.ok) {
          throw new Error(`Failed to load projects: ${res.status}`);
        }
        const data = await res.json();
        const found = data.find((p) => (p.id || p._id) === projectId);

        setProject(found || null);

        setInstagramUrl(found?.instagramUrl || "");
        setFacebookUrl(found?.facebookUrl || "");
        setTwitterUrl(found?.twitterUrl || "");

        setInstagramPosts(
          found?.instagramPosts !== undefined ? String(found.instagramPosts) : ""
        );
        setInstagramFollowers(
          found?.instagramFollowers !== undefined
            ? String(found.instagramFollowers)
            : ""
        );
        setInstagramFollowing(
          found?.instagramFollowing !== undefined
            ? String(found.instagramFollowing)
            : ""
        );

        setFacebookPosts(
          found?.facebookPosts !== undefined ? String(found.facebookPosts) : ""
        );
        setFacebookFollowers(
          found?.facebookFollowers !== undefined
            ? String(found.facebookFollowers)
            : ""
        );
        setFacebookFollowing(
          found?.facebookFollowing !== undefined
            ? String(found.facebookFollowing)
            : ""
        );

        setTwitterPosts(
          found?.twitterPosts !== undefined ? String(found.twitterPosts) : ""
        );
        setTwitterFollowers(
          found?.twitterFollowers !== undefined
            ? String(found.twitterFollowers)
            : ""
        );
        setTwitterFollowing(
          found?.twitterFollowing !== undefined
            ? String(found.twitterFollowing)
            : ""
        );
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
        instagramUrl: instagramUrl.trim(),
        facebookUrl: facebookUrl.trim(),
        twitterUrl: twitterUrl.trim(),
        instagramPosts: Number(instagramPosts) || 0,
        instagramFollowers: Number(instagramFollowers) || 0,
        instagramFollowing: Number(instagramFollowing) || 0,
        facebookPosts: Number(facebookPosts) || 0,
        facebookFollowers: Number(facebookFollowers) || 0,
        facebookFollowing: Number(facebookFollowing) || 0,
        twitterPosts: Number(twitterPosts) || 0,
        twitterFollowers: Number(twitterFollowers) || 0,
        twitterFollowing: Number(twitterFollowing) || 0,
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
      {/* TOP BAR – same as other user pages */}
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
            <div className="project-info-container">
              {/* Basic project info */}
              <div className="project-info-card">
                <h3>Basic Details</h3>
                <p>
                  <strong>Name: </strong>
                  {project.name}
                </p>
                {project.url && (
                  <p>
                    <strong>Website: </strong>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {project.url}
                    </a>
                  </p>
                )}
              </div>

              {/* Instagram Card */}
              <div className="project-info-card">
                <h3>
                  <FaInstagram style={{ marginRight: 8 }} />
                  Instagram
                </h3>

                <div className="social-row-content">
                  <label className="field-label">Profile URL</label>
                  <input
                    type="url"
                    placeholder="Instagram profile URL"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                  />
                  {instagramUrl.trim() && (
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
                      </div>
                    </div>
                  )}
                </div>

                <div className="counts-row">
                  <div className="count-field">
                    <label className="field-label">Posts</label>
                    <input
                      type="number"
                      value={instagramPosts}
                      onChange={(e) => setInstagramPosts(e.target.value)}
                    />
                  </div>
                  <div className="count-field">
                    <label className="field-label">Followers</label>
                    <input
                      type="number"
                      value={instagramFollowers}
                      onChange={(e) => setInstagramFollowers(e.target.value)}
                    />
                  </div>
                  <div className="count-field">
                    <label className="field-label">Following</label>
                    <input
                      type="number"
                      value={instagramFollowing}
                      onChange={(e) => setInstagramFollowing(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Facebook Card */}
              <div className="project-info-card">
                <h3>
                  <FaFacebookSquare style={{ marginRight: 8 }} />
                  Facebook
                </h3>

                <div className="social-row-content">
                  <label className="field-label">Page URL</label>
                  <input
                    type="url"
                    placeholder="Facebook page URL"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                  />
                  {facebookUrl.trim() && (
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
                      </div>
                    </div>
                  )}
                </div>

                <div className="counts-row">
                  <div className="count-field">
                    <label className="field-label">Posts</label>
                    <input
                      type="number"
                      value={facebookPosts}
                      onChange={(e) => setFacebookPosts(e.target.value)}
                    />
                  </div>
                  <div className="count-field">
                    <label className="field-label">Followers</label>
                    <input
                      type="number"
                      value={facebookFollowers}
                      onChange={(e) => setFacebookFollowers(e.target.value)}
                    />
                  </div>
                  <div className="count-field">
                    <label className="field-label">Following</label>
                    <input
                      type="number"
                      value={facebookFollowing}
                      onChange={(e) => setFacebookFollowing(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Twitter / X Card */}
              <div className="project-info-card">
                <h3>
                  <FaSquareTwitter style={{ marginRight: 8 }} />
                  Twitter / X
                </h3>

                <div className="social-row-content">
                  <label className="field-label">Profile URL</label>
                  <input
                    type="url"
                    placeholder="Twitter / X profile URL"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                  />
                  {twitterUrl.trim() && (
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
                      </div>
                    </div>
                  )}
                </div>

                <div className="counts-row">
                  <div className="count-field">
                    <label className="field-label">Posts</label>
                    <input
                      type="number"
                      value={twitterPosts}
                      onChange={(e) => setTwitterPosts(e.target.value)}
                    />
                  </div>
                  <div className="count-field">
                    <label className="field-label">Followers</label>
                    <input
                      type="number"
                      value={twitterFollowers}
                      onChange={(e) => setTwitterFollowers(e.target.value)}
                    />
                  </div>
                  <div className="count-field">
                    <label className="field-label">Following</label>
                    <input
                      type="number"
                      value={twitterFollowing}
                      onChange={(e) => setTwitterFollowing(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProjectInfoPage;