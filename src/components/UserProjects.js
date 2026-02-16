import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../api";

import logo from "../assets/klonlogo.png";

import { HiOutlineHome } from "react-icons/hi";
import { FaLink, FaDesktop } from "react-icons/fa6";
import { VscTools } from "react-icons/vsc";
import { LuCalendar } from "react-icons/lu";
import { FiBell } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { IoMdSearch } from "react-icons/io";

function UserProjects() {
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        setProjectsError("");

        // Show all projects
        const url = `${API_BASE_URL}/api/projects`;

        const res = await fetch(url);
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
          <div className="breadcrumb">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/user/dashboard")}
            >
              Home
            </span>
            {" > View Projects"}
          </div>

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
                            onClick={() =>
                              navigate(`/user/projects/${p.id || p._id}/info`, {
                                state: { projectName: p.name },
                              })
                            }
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
    </div>
  );
}

export default UserProjects;