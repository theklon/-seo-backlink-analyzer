import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import { useNavigate, useLocation } from "react-router-dom";

import logo from "../assets/klon-logo-white.png";
import { API_BASE_URL } from "../api";

import { HiOutlineHome } from "react-icons/hi";
import {
  FiUsers,
  FiBell,
  FiUser,
  FiZap,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { FaDesktop } from "react-icons/fa6";
import { RiShapesLine } from "react-icons/ri";
import { LuCalendar } from "react-icons/lu";
import { IoIosArrowDown } from "react-icons/io";
import { TbDeviceDesktopPlus } from "react-icons/tb";

function Adminproject() {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [createProjectError, setCreateProjectError] = useState("");

  const [projects, setProjects] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");
  const [editProjectError, setEditProjectError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };

  // Load existing projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/projects`);
        if (!res.ok) {
          throw new Error(`Failed to load projects: ${res.status}`);
        }
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Error loading projects", err);
      }
    };

    fetchProjects();
  }, []);

  const handleAddProject = async () => {
    try {
      setCreateProjectError("");

      if (!projectName.trim()) {
        setCreateProjectError("Project name is required.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName.trim(),
          url: "",
          description: projectDescription.trim(),
          ownerUserId: null,
          status: "active",
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create project: ${res.status}`);
      }

      const created = await res.json();
      setProjects((prev) => [...prev, created]);

      setProjectName("");
      setProjectDescription("");
      setShowCreateProject(false);
    } catch (err) {
      setCreateProjectError(err.message || "Error creating project");
    }
  };

  const openActionsMenu = (projectId) => {
    setMenuOpenId((prev) => (prev === projectId ? null : projectId));
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to delete project: ${res.status}`);
      }
      setProjects((prev) =>
        prev.filter((p) => (p.id || p._id) !== projectId)
      );
    } catch (err) {
      console.error("Delete project failed", err);
    } finally {
      setMenuOpenId(null);
    }
  };

  const handleEditProjectClick = (project) => {
    setEditingProject(project);
    setEditProjectName(project.name || "");
    setEditProjectDescription(project.description || "");
    setEditProjectError("");
    setShowEditModal(true);
    setMenuOpenId(null);
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;
    try {
      setEditProjectError("");

      const editingId = editingProject.id || editingProject._id;

      const res = await fetch(
        `${API_BASE_URL}/api/admin/projects/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editProjectName.trim(),
            url: editingProject.url || "",
            description: editProjectDescription.trim(),
            ownerUserId: editingProject.ownerUserId || null,
            status: editingProject.status || "active",
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to update project: ${res.status}`);
      }

      const updated = await res.json();
      const updatedId = updated.id || updated._id;

      setProjects((prev) =>
        prev.map((p) =>
          (p.id || p._id) === updatedId ? updated : p
        )
      );
      setShowEditModal(false);
    } catch (err) {
      setEditProjectError(err.message || "Error updating project");
    }
  };

  return (
    <div className="dashboard-root">
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

          {/* Admin profile + dropdown */}
          <div
            className="admin-info-wrapper"
            onClick={() => setShowProfileMenu((prev) => !prev)}
          >
            <div className="admin-info">
              <div className="admin-avatar">A</div>
              <div className="admin-text">
                <div className="admin-name">Nextwebi</div>
                <div className="admin-role">Admin</div>
              </div>
              <div className="topbar-icon">
                <IoIosArrowDown />
              </div>
            </div>

            {showProfileMenu && (
              <div className="profile-menu-card">
                <div className="profile-menu-header">
                  <div className="profile-avatar">A</div>
                  <div className="profile-text">
                    <div className="profile-name">Ajay</div>
                    <div className="profile-company">Nextwebi</div>
                    <div className="profile-email">ajay@nextwebi.com</div>
                  </div>
                </div>

                <div className="profile-menu-item">
                  <span className="profile-menu-icon">
                    <FiUser />
                  </span>
                  <span>Profile and Settings</span>
                </div>

                <div className="profile-menu-item">
                  <span className="profile-menu-icon">
                    <FiZap />
                  </span>
                  <span>Payment Management</span>
                </div>

                <div className="profile-menu-item">
                  <span className="profile-menu-icon">
                    <FiSettings />
                  </span>
                  <span>Admin Control</span>
                </div>

                <div
                  className="profile-menu-item profile-logout"
                  onClick={handleLogout}
                >
                  <span className="profile-menu-icon">
                    <FiLogOut />
                  </span>
                  <span>Logout</span>
                </div>
              </div>
            )}
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
                location.pathname === "/admin/dashboard" ? "active" : ""
              }`}
              onClick={() => navigate("/admin/dashboard")}
            >
              <HiOutlineHome className="nav-icon" />
              <span>Home</span>
            </li>

            <li
              className={`menu-item ${
                location.pathname === "/admin/users" ? "active" : ""
              }`}
              onClick={() => navigate("/admin/users")}
            >
              <FiUsers className="nav-icon" />
              <span>Users</span>
            </li>

            <li
              className={`menu-item ${
                location.pathname === "/admin/projects" ? "active" : ""
              }`}
              onClick={() => navigate("/admin/projects")}
            >
              <FaDesktop className="nav-icon" />
              <span>Projects</span>
            </li>

            <li
              className={`menu-item ${
                location.pathname === "/admin/categories" ? "active" : ""
              }`}
              onClick={() => navigate("/admin/categories")}
            >
              <RiShapesLine className="nav-icon" />
              <span>Categories</span>
            </li>
          </ul>
        </div>

        {/* MAIN CONTENT */}
        <div className="main-content project-page">
          {/* BREADCRUMB */}
          <div className="breadcrumb">Home &gt; Projects</div>

          {/* TITLE + BUTTON IN ONE LINE */}
          <div className="page-header">
            <h2 className="page-title">Projects</h2>

            <button
              className="primary-btn"
              onClick={() => setShowCreateProject(true)}
            >
              + Add Project
            </button>
          </div>

          <div className="table-wrapper">
            {/* CREATE PROJECT MODAL */}
            {showCreateProject && (
              <div className="modal-overlay admin-modal-overlay">
                <div className="modal-card admin-modal-card">
                  <div className="modal-header">
                    <h3>
                      <span className="modal-icon">
                        <TbDeviceDesktopPlus />
                      </span>
                      Create Project
                    </h3>
                    <span
                      className="modal-close"
                      onClick={() => setShowCreateProject(false)}
                    >
                      ×
                    </span>
                  </div>

                  <div className="modal-body">
                    {createProjectError && (
                      <div style={{ color: "red", marginBottom: 8 }}>
                        {createProjectError}
                      </div>
                    )}

                    <div className="modal-field">
                      <label>
                        Project Name <span>*</span>
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                      />
                    </div>

                    <div className="modal-field">
                      <label>
                        Description <span>*</span>
                      </label>
                      <input
                        type="text"
                        value={projectDescription}
                        onChange={(e) =>
                          setProjectDescription(e.target.value)
                        }
                      />
                    </div>

                    <div className="modal-actions">
                      <button
                        className="primary-btn"
                        type="button"
                        onClick={handleAddProject}
                      >
                        Add Project
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EDIT PROJECT MODAL */}
            {showEditModal && editingProject && (
              <div className="modal-overlay admin-modal-overlay">
                <div className="modal-card admin-modal-card">
                  <div className="modal-header">
                    <h3>Edit Project</h3>
                    <span
                      className="modal-close"
                      onClick={() => setShowEditModal(false)}
                    >
                      ×
                    </span>
                  </div>

                  <div className="modal-body">
                    {editProjectError && (
                      <div style={{ color: "red", marginBottom: 8 }}>
                        {editProjectError}
                      </div>
                    )}

                    <div className="modal-field">
                      <label>Project Name</label>
                      <input
                        type="text"
                        value={editProjectName}
                        onChange={(e) => setEditProjectName(e.target.value)}
                      />
                    </div>

                    <div className="modal-field">
                      <label>Description</label>
                      <input
                        type="text"
                        value={editProjectDescription}
                        onChange={(e) =>
                          setEditProjectDescription(e.target.value)
                        }
                      />
                    </div>

                    <div className="modal-actions">
                      <button
                        className="primary-btn"
                        type="button"
                        onClick={handleSaveProject}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TABLE */}
            <div className="table-container project-table">
              <table>
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={2}>No projects found.</td>
                    </tr>
                  ) : (
                    projects.map((project) => {
                      const projectKey = project.id || project._id;
                      return (
                        <tr key={projectKey}>
                          <td>{project.name}</td>
                          <td className="actions-col">
                            <div className="actions-wrapper">
                              <button
                                className="actions-dot-btn"
                                type="button"
                                onClick={() => openActionsMenu(projectKey)}
                              >
                                ⋮
                              </button>

                              {menuOpenId === projectKey && (
                                <div className="actions-menu">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleEditProjectClick(project)
                                    }
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteProject(projectKey)
                                    }
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Adminproject;