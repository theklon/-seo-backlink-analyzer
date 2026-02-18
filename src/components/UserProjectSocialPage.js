import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./AdminDashboard.css";
import { API_BASE_URL } from "../api";

import logo from "../assets/klonlogo.png";

import { FaHome } from "react-icons/fa";
import { FaLink, FaDesktop } from "react-icons/fa6";
import { VscTools } from "react-icons/vsc";
import { LuCalendar } from "react-icons/lu";
import { FiBell } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { FaInstagram } from "react-icons/fa";

function UserProjectSocialPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [instagramUrl, setInstagramUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Instagram counts
  const [instagramPosts, setInstagramPosts] = useState("");
  const [instagramFollowers, setInstagramFollowers] = useState("");
  const [instagramFollowing, setInstagramFollowing] = useState("");

  // per-platform loading for metrics (we only use instagram now)
  const [metricsLoading, setMetricsLoading] = useState({
    instagram: false,
  });

  const projectNameFromState = location.state?.projectName;

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

        setInstagramUrl(found?.instagramUrl || "");
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
      } catch (err) {
        setLoadError(err.message || "Error loading project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const fetchSocialMetrics = async (platform, url) => {
    if (!url || !url.trim()) return;

    try {
      setMetricsLoading((prev) => ({ ...prev, [platform]: true }));

      const res = await fetch(`${API_BASE_URL}/api/social/metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, url }),
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch ${platform} metrics: ${res.status}`);
      }

      const data = await res.json();

      if (platform === "instagram") {
        setInstagramPosts(String(data.posts ?? ""));
        setInstagramFollowers(String(data.followers ?? ""));
        setInstagramFollowing(String(data.following ?? ""));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMetricsLoading((prev) => ({ ...prev, [platform]: false }));
    }
  };

  const handleSave = async () => {
    if (!projectId) return;
    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess("");

      const body = {
        instagramUrl: instagramUrl.trim(),
        instagramPosts: Number(instagramPosts) || 0,
        instagramFollowers: Number(instagramFollowers) || 0,
        instagramFollowing: Number(instagramFollowing) || 0,
      };

      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Failed to update project social info: ${res.status}`);
      }

      const updated = await res.json();
      setProject(updated);
      setSaveSuccess("Instagram details saved successfully.");
    } catch (err) {
      setSaveError(err.message || "Error saving Instagram details");
    } finally {
      setSaving(false);
    }
  };

  const displayProjectName =
    projectNameFromState || project?.name || "Project Social";

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
              <FaHome className="nav-icon" />
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
            {" > Social"}
          </div>

          {/* Title + content inside main-wrapper */}
          <div className="main-wrapper">
            <h2 className="page-title">
              Project – {displayProjectName}
            </h2>

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
                <div className="social-cards-row">
                  {/* Instagram only */}
                  <div className="social-card-large social-card-instagram">
                    <p className="social-card-title">
                      <FaInstagram style={{ marginRight: 8 }} />
                      Instagram
                    </p>

                    <div className="social-row-content">
                      <label className="field-label">Profile URL</label>
                      <input
                        type="url"
                        placeholder="Instagram profile URL"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        onBlur={() =>
                          fetchSocialMetrics("instagram", instagramUrl)
                        }
                      />
                      {metricsLoading.instagram && (
                        <div className="social-metric-loading">
                          Fetching Instagram stats...
                        </div>
                      )}
                    </div>

                    <div className="social-counts-row">
                      <div className="social-count-field">
                        <label className="field-label">Posts</label>
                        <input
                          type="number"
                          value={instagramPosts}
                          onChange={(e) => setInstagramPosts(e.target.value)}
                        />
                      </div>
                      <div className="social-count-field">
                        <label className="field-label">Followers</label>
                        <input
                          type="number"
                          value={instagramFollowers}
                          onChange={(e) =>
                            setInstagramFollowers(e.target.value)
                          }
                        />
                      </div>
                      <div className="social-count-field">
                        <label className="field-label">Following</label>
                        <input
                          type="number"
                          value={instagramFollowing}
                          onChange={(e) =>
                            setInstagramFollowing(e.target.value)
                          }
                        />
                      </div>
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
    </div>
  );
}

export default UserProjectSocialPage;