// src/components/ProjectBacklinksPage.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./AdminDashboard.css";
import { API_BASE_URL } from "../api";

import logo from "../assets/klonlogo.png";

import { FaHome } from "react-icons/fa";
import { FaLink, FaDesktop } from "react-icons/fa6";
import { VscTools } from "react-icons/vsc";
import { LuCalendar, LuArrowUpDown } from "react-icons/lu";
import { FiBell, FiCopy } from "react-icons/fi";
import { HiOutlineExternalLink } from "react-icons/hi";
import { IoIosArrowDown } from "react-icons/io";

function ProjectBacklinksPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { projectId } = useParams(); // this is what /user/projects/:projectId/backlinks gives you
  const projectName = location.state?.projectName || "Project";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminUsers, setAdminUsers] = useState([]);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDaRange, setSelectedDaRange] = useState("");
  const [selectedSs, setSelectedSs] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  // Modal for "+N More urls"
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [urlModalUrls, setUrlModalUrls] = useState([]);

  const handleOpenUrlModal = (urls) => {
    setUrlModalUrls(urls || []);
    setUrlModalOpen(true);
  };

  const handleCloseUrlModal = () => {
    setUrlModalOpen(false);
    setUrlModalUrls([]);
  };

  const handleCopyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const renderUrlCell = (urlValue) => {
    if (!urlValue) return "-";
    const maxLen = 40;
    const display =
      urlValue.length > maxLen ? urlValue.slice(0, maxLen) + "..." : urlValue;

    return (
      <a href={urlValue} target="_blank" rel="noopener noreferrer">
        {display}
      </a>
    );
  };

  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/users`);
        if (!res.ok) return;
        const data = await res.json();
        setAdminUsers(data || []);
      } catch (e) {
        console.error("Failed to load admin users", e);
      }
    };

    fetchAdminUsers();
  }, []);

  useEffect(() => {
    const fetchBacklinks = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (projectId) {
          params.append("projectId", projectId);
        }

        const res = await fetch(
          `${API_BASE_URL}/api/user/backlinks?${params.toString()}`
        );
        if (!res.ok) {
          throw new Error(`Failed to load backlinks: ${res.status}`);
        }
        const data = await res.json();
        console.log("Backlinks for project", projectName, data);

        // GROUP BY domain + category + project, collect multiple URLs and sublinks
        const groupedMap = data.reduce((acc, b) => {
          const key = `${b.domain}__${b.categoryId}__${b.projectId || ""}`;

          if (!acc[key]) {
            acc[key] = {
              id: b.id || b._id,
              domain: b.domain,
              category: b.categoryId,
              da: b.da,
              ss: b.ss,
              urls: [],
              subUrls: [],
              contributors: new Set(),
            };
          }

          // main URL
          if (b.url) {
            acc[key].urls.push(b.url);
          }

          // contributions on this document – add once per subUrl
          if (b.contributions && b.contributions.length) {
            b.contributions.forEach((c) => {
              if (c.subUrl) {
                acc[key].subUrls.push({
                  url: c.subUrl,
                  userName: c.userName || "", // adjust to your real field
                });
                if (c.userName) {
                  acc[key].contributors.add(c.userName);
                }
              }
            });
          }

          return acc;
        }, {});

        // Convert map to array and dedupe subUrls, flatten contributors
        const mapped = Object.values(groupedMap).map((row) => ({
          ...row,
          subUrls: Array.from(
            new Map(
              row.subUrls.map((su) => [su.url, su]) // dedupe by URL
            ).values()
          ),
          contributors: Array.from(row.contributors || []),
        }));

        setRows(mapped);
      } catch (err) {
        console.error("Error loading project backlinks", err);
        setError(err.message || "Error loading backlinks");
      } finally {
        setLoading(false);
      }
    };

    if (projectName) {
      fetchBacklinks();
    }
  }, [projectId, projectName]);

  // Derived options for filters
  const categoryOptions = Array.from(
    new Set(rows.map((r) => r.category).filter(Boolean))
  );
  const ssOptions = Array.from(new Set(rows.map((r) => r.ss))).sort(
    (a, b) => a - b
  );
  const userOptions = Array.from(
    new Set((adminUsers || []).map((u) => u.name).filter(Boolean))
  );

  // Apply filters
  const filteredRows = rows.filter((row) => {
    if (selectedCategory && row.category !== selectedCategory) {
      return false;
    }

    if (selectedDaRange) {
      const [minStr, maxStr] = selectedDaRange.split("-");
      const min = Number(minStr);
      const max = Number(maxStr);
      const daValue = Number(row.da ?? 0);
      if (!(daValue >= min && daValue <= max)) {
        return false;
      }
    }

    if (selectedSs && Number(row.ss ?? 0) !== Number(selectedSs)) {
      return false;
    }

    if (selectedUser) {
      const contributors = row.contributors || [];
      if (!contributors.includes(selectedUser)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="dashboard-root user-dashboard">
      {/* TOP BAR – same as UserProjects */}
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
        {/* SIDEBAR – View Projects stays active for this page */}
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

        {/* MAIN CONTENT – Project Backlinks */}
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
            {" > "}
            {projectName}
          </div>

          <div className="main-wrapper">
            {/* Title */}
            <h2 className="page-title">{projectName}</h2>

            {/* Filters */}
            <div
              className="backlink-filters"
              style={{ marginTop: 12, marginBottom: 12 }}
            >
              {/* Searchable Categories dropdown */}
              <input
                list="projectCategoryOptions"
                className="filter-select"
                placeholder="Categories"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              />
              <datalist id="projectCategoryOptions">
                {categoryOptions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>

              <select
                className="filter-select"
                value={selectedDaRange}
                onChange={(e) => setSelectedDaRange(e.target.value)}
              >
                <option value=""> DA</option>
                <option value="0-10">0–10</option>
                <option value="10-20">10–20</option>
                <option value="20-30">20–30</option>
                <option value="30-40">30–40</option>
                <option value="40-50">40–50</option>
                <option value="50-60">50–60</option>
                <option value="60-70">60–70</option>
                <option value="70-80">70–80</option>
                <option value="80-90">80–90</option>
                <option value="90-100">90–100</option>
              </select>

              <select
                className="filter-select"
                value={selectedSs}
                onChange={(e) => setSelectedSs(e.target.value)}
              >
                <option value="">SS</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                {ssOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Users</option>
                {userOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Table section */}
            {loading && <p>Loading backlinks...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && !error && (
              <div
                className="table-container user-projects-table"
                style={{ marginTop: 8 }}
              >
                <table className="user-backlinks-table">
                  <thead>
                    <tr>
                      <th>Domain Name</th>
                      <th>Category</th>
                      <th style={{ paddingRight: 8 }}>
                        <span className="sortable-header">
                          DA <LuArrowUpDown className="sort-icon" />
                        </span>
                      </th>
                      <th style={{ paddingLeft: 8 }}>
                        <span className="sortable-header">
                          SS <LuArrowUpDown className="sort-icon" />
                        </span>
                      </th>
                      <th>URL</th>
                      <th>Sub Backlink URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center" }}>
                          No backlinks found for this project.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, index) => (
                        <tr key={row.id || `${row.domain}-${index}`}>
                          <td>{row.domain}</td>
                          <td>{row.category}</td>
                          <td style={{ paddingRight: 8 }}>
                            <span className="da-badge">{row.da}</span>
                          </td>
                          <td style={{ paddingLeft: 8 }}>
                            <span className="ss-badge">{row.ss}</span>
                          </td>
                          <td>
                            {row.urls && row.urls.length > 0 ? (
                              <>
                                {row.urls.slice(0, 2).map((u, idx) => (
                                  <div key={idx} className="url-row">
                                    <button
                                      type="button"
                                      className="url-icon-btn"
                                      onClick={() => handleCopyUrl(u)}
                                    >
                                      <FiCopy />
                                    </button>
                                    <a
                                      href={u}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="url-icon-btn"
                                    >
                                      <HiOutlineExternalLink />
                                    </a>
                                    <span className="url-text">
                                      {renderUrlCell(u)}
                                    </span>
                                  </div>
                                ))}

                                {row.urls.length > 2 && (
                                  <button
                                    type="button"
                                    className="more-urls-btn"
                                    onClick={() => handleOpenUrlModal(row.urls)}
                                  >
                                    +{row.urls.length - 2} More urls
                                  </button>
                                )}
                              </>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            {row.subUrls && row.subUrls.length > 0 ? (
                              <>
                                {row.subUrls.slice(0, 2).map((su, idx) => (
                                  <div key={idx} className="url-row">
                                    <span className="url-text">
                                      {renderUrlCell(su.url)}
                                      {su.userName && (
                                        <span
                                          style={{
                                            marginLeft: 4,
                                            color: "#6b7280",
                                            fontSize: 12,
                                          }}
                                        >
                                          ({su.userName})
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                ))}

                                {row.subUrls.length > 2 && (
                                  <button
                                    type="button"
                                    className="more-urls-btn"
                                    onClick={() =>
                                      handleOpenUrlModal(
                                        row.subUrls.map((su) => su.url)
                                      )
                                    }
                                  >
                                    +{row.subUrls.length - 2} More urls
                                  </button>
                                )}
                              </>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* URL LIST MODAL FOR "+N More urls" */}
            {urlModalOpen && (
              <div className="modal-overlay">
                <div className="small-url-modal-card">
                  <div className="modal-header">
                    <h3>All URLs</h3>
                    <span className="modal-close" onClick={handleCloseUrlModal}>
                      ×
                    </span>
                  </div>
                  <div className="modal-body url-list-modal-body">
                    {urlModalUrls.map((u, idx) => (
                      <div key={idx} className="url-row">
                        <button
                          type="button"
                          className="url-icon-btn"
                          onClick={() => handleCopyUrl(u)}
                        >
                          <FiCopy />
                        </button>
                        <a
                          href={u}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="url-icon-btn"
                        >
                          <HiOutlineExternalLink />
                        </a>
                        <span className="url-text">{renderUrlCell(u)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectBacklinksPage;