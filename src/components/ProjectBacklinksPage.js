// src/components/ProjectBacklinksPage.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import { API_BASE_URL } from "../api";

import logo from "../assets/klonlogo.png";

import { HiOutlineHome } from "react-icons/hi";
import { FaLink, FaDesktop } from "react-icons/fa6";
import { VscTools } from "react-icons/vsc";
import { LuCalendar, LuArrowUpDown } from "react-icons/lu";
import { FiBell, FiCopy } from "react-icons/fi";
import { HiOutlineExternalLink } from "react-icons/hi";
import { IoIosArrowDown } from "react-icons/io";

function ProjectBacklinksPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Project name passed from UserProjects via navigate state
  const projectName = location.state?.projectName || "Project";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    const fetchBacklinks = async () => {
      setLoading(true);
      setError("");
      try {
        // Filter using projectName, because in backlinks projectId = project name
        const res = await fetch(
          `${API_BASE_URL}/api/user/backlinks?projectId=${encodeURIComponent(
            projectName
          )}`
        );
        if (!res.ok) {
          throw new Error(`Failed to load backlinks: ${res.status}`);
        }
        const data = await res.json();
        console.log("Backlinks for project", projectName, data);

        // GROUP BY domain + category + project, collect multiple URLs
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
            };
          }

          // main URL
          if (b.url) {
            acc[key].urls.push(b.url);
          }

          // contributions on this document – add once
          if (b.contributions && b.contributions.length) {
            const extraSubs = b.contributions
              .map((c) => c.subUrl)
              .filter(Boolean);
            acc[key].subUrls.push(...extraSubs);
          }

          return acc;
        }, {});

        // Convert map to array and dedupe subUrls per domain
        const mapped = Object.values(groupedMap).map((row) => ({
          ...row,
          subUrls: Array.from(new Set(row.subUrls)),
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
  }, [projectName]);

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

        {/* MAIN CONTENT – Project Backlinks */}
        <div className="main-content">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            Home &gt; View Projects &gt; {projectName}
          </div>

          {/* Title */}
          <h2 className="page-title">{projectName}</h2>

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
                    <th>
                      <span className="sortable-header">
                        DA <LuArrowUpDown className="sort-icon" />
                      </span>
                    </th>
                    <th>
                      <span className="sortable-header">
                        SS <LuArrowUpDown className="sort-icon" />
                      </span>
                    </th>
                    <th>URL</th>
                    <th>Sub Backlink URL</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center" }}>
                        No backlinks found for this project.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr key={row.id || `${row.domain}-${index}`}>
                        <td>{row.domain}</td>
                        <td>{row.category}</td>
                        <td>
                          <span className="da-badge">{row.da}</span>
                        </td>
                        <td>
                          <span className="ss-badge">{row.ss}</span>
                        </td>
                        <td>
                          {row.urls && row.urls.length > 0 ? (
                            row.urls.map((u, idx) => (
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
                            ))
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          {row.subUrls && row.subUrls.length > 0 ? (
                            row.subUrls.map((su, idx) => (
                              <div key={idx} className="url-row">
                                <span className="url-text">
                                  {renderUrlCell(su)}
                                </span>
                              </div>
                            ))
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
        </div>
      </div>
    </div>
  );
}

export default ProjectBacklinksPage;