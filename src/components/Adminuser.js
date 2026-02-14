import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import logo from "../assets/klon-logo-white.png";
import { API_BASE_URL } from "../api";

import { useNavigate, useLocation } from "react-router-dom";

import { HiOutlineHome, HiOutlineUserGroup } from "react-icons/hi";
import {
  FiUsers,
  FiBell,
  FiUser,
  FiZap,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { FaDesktop } from "react-icons/fa6";
import { RiShapesLine, RiLinkM } from "react-icons/ri";
import { IoCube } from "react-icons/io5";
import { LuCalendar } from "react-icons/lu";
import { IoIosArrowDown } from "react-icons/io";
import { FiUserPlus } from "react-icons/fi";

function Adminuser() {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalBacklinks: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");

  // Create User modal form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [createUserError, setCreateUserError] = useState("");

  // Actions menu + Edit modal state
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editEmpId, setEditEmpId] = useState(0);
  const [editError, setEditError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setStatsError("");
      const res = await fetch(`${API_BASE_URL}/api/admin/stats`);
      if (!res.ok) {
        throw new Error(`Failed to load stats: ${res.status}`);
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setStatsError(err.message || "Error loading stats");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setUsersError("");
        const res = await fetch(`${API_BASE_URL}/api/admin/users`);
        if (!res.ok) {
          throw new Error(`Failed to load users: ${res.status}`);
        }
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setUsersError(err.message || "Error loading users");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
    fetchStats();
  }, []);

  // Create User button handler
  const handleCreateUser = async () => {
    try {
      setCreateUserError("");

      if (!newUserName.trim() || !newUserEmail.trim()) {
        setCreateUserError("User name and email are required.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          empId: 0,
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          role: "user",
          status: "active",
          points: 0,
          password: "changeme",
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create user: ${res.status}`);
      }

      const created = await res.json();
      setUsers((prev) => [...prev, created]);

      setNewUserName("");
      setNewUserEmail("");
      setShowCreateUser(false);

      // refresh stats after create
      await fetchStats();
    } catch (err) {
      setCreateUserError(err.message || "Error creating user");
    }
  };

  // Actions menu handlers
  const openActionsMenu = (userId) => {
    setMenuOpenId((prev) => (prev === userId ? null : userId));
  };

  const handleDeleteUser = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Failed to delete user: ${res.status}`);
      }
      setUsers((prev) =>
        prev.filter((u) => (u.id || u._id) !== userId)
      );

      // refresh stats after delete
      await fetchStats();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setMenuOpenId(null);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditEmpId(user.empId || 0);
    setEditError("");
    setShowEditModal(true);
    setMenuOpenId(null);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      setEditError("");

      const editingId = editingUser.id || editingUser._id;

      const res = await fetch(
        `${API_BASE_URL}/api/admin/users/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empId: Number(editEmpId),
            name: editName.trim(),
            email: editEmail.trim(),
            role: editingUser.role || "user",
            status: editingUser.status || "active",
            points: editingUser.points ?? 0,
            password: "changeme",
          }),
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to update user: ${res.status}`);
      }
      const updated = await res.json();
      const updatedId = updated.id || updated._id;

      setUsers((prev) =>
        prev.map((u) =>
          (u.id || u._id) === updatedId ? updated : u
        )
      );
      setShowEditModal(false);
    } catch (err) {
      setEditError(err.message || "Error updating user");
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
        <div className="main-content">
          {/* BREADCRUMB */}
          <div className="breadcrumb">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/admin/dashboard")}  // or "/admin/dashboard" in admin pages
            >
              Home
            </span>
            {" > Users"}
          </div>

          <h2 className="page-title">Users</h2>

          {/* STATS CARDS */}
          {statsError && (
            <div style={{ color: "red", marginBottom: 8 }}>{statsError}</div>
          )}
          <div className="stats-row">
            {/* TOTAL USERS */}
            <div className="stats-card">
              <p>Total Users</p>
              <div className="stats-icon blue">
                <HiOutlineUserGroup />
              </div>
              <h3 className="blue-text">
                {loadingStats ? "..." : `${stats.totalUsers} Users`}
              </h3>
            </div>

            {/* TOTAL PROJECTS */}
            <div className="stats-card active">
              <p>Total Projects</p>
              <div className="stats-icon orange">
                <IoCube />
              </div>
              <h3 className="orange-text">
                {loadingStats ? "..." : `${stats.totalProjects} Projects`}
              </h3>
            </div>

            {/* TOTAL BACKLINKS */}
            <div className="stats-card">
              <p>Total Number of Backlinks</p>
              <div className="stats-icon green">
                <RiLinkM />
              </div>
              <h3 className="green-text">
                {loadingStats ? "..." : `${stats.totalBacklinks} Backlinks`}
              </h3>
            </div>
          </div>

          {/* Create User button + modal */}
          <div className="table-header users-header">
            <button
              className="create-user-btn"
              onClick={() => setShowCreateUser(true)}
            >
              + Create User
            </button>

            {showCreateUser && (
              <div className="modal-overlay admin-modal-overlay">
                <div className="modal-card admin-modal-card">
                  <div className="modal-header">
                    <h3>
                      <span className="modal-icon">
                        <FiUserPlus />
                      </span>
                      Create User
                    </h3>
                    <span
                      className="modal-close"
                      onClick={() => setShowCreateUser(false)}
                    >
                      ×
                    </span>
                  </div>

                  <div className="modal-body">
                    {createUserError && (
                      <div style={{ color: "red", marginBottom: 8 }}>
                        {createUserError}
                      </div>
                    )}

                    <div className="modal-field">
                      <label>
                        User Name <span>*</span>
                      </label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                      />
                    </div>

                    <div className="modal-field">
                      <label>
                        Email <span>*</span>
                      </label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                    </div>

                    <div className="modal-actions">
                      <button
                        className="primary-btn"
                        type="button"
                        onClick={handleCreateUser}
                      >
                        Create User
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edit User modal */}
          {showEditModal && editingUser && (
            <div className="modal-overlay admin-modal-overlay">
              <div className="modal-card admin-modal-card">
                <div className="modal-header">
                  <h3>Edit User</h3>
                  <span
                    className="modal-close"
                    onClick={() => setShowEditModal(false)}
                  >
                    ×
                  </span>
                </div>

                <div className="modal-body">
                  {editError && (
                    <div style={{ color: "red", marginBottom: 8 }}>
                      {editError}
                    </div>
                  )}

                  <div className="modal-field">
                    <label>User Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>

                  <div className="modal-field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>

                  <div className="modal-field">
                    <label>Emp ID</label>
                    <input
                      type="number"
                      value={editEmpId}
                      onChange={(e) => setEditEmpId(e.target.value)}
                    />
                  </div>

                  <div className="modal-actions">
                    <button
                      className="primary-btn"
                      type="button"
                      onClick={handleSaveUser}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS TABLE */}
          {usersError && (
            <div style={{ color: "red", marginBottom: 8 }}>{usersError}</div>
          )}
          <div className="table-container users-table">
            <table>
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Emp ID</th>
                  <th>Projects</th>
                  <th>Backlinks</th>
                  <th>Points</th>
                  <th className="users-actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={6}>Loading users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No users found.</td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const userKey = user.id || user._id;
                    return (
                      <tr key={userKey}>
                        <td>{user.name}</td>
                        <td>{user.empId}</td>
                        <td>-</td>
                        <td>-</td>
                        <td>{user.points}</td>
                        <td className="users-actions-col">
                          <div className="actions-wrapper">
                            <button
                              className="actions-dot-btn"
                              type="button"
                              onClick={() => openActionsMenu(userKey)}
                            >
                              ⋮
                            </button>

                            {menuOpenId === userKey && (
                              <div className="actions-menu">
                                <button
                                  type="button"
                                  onClick={() => handleEditClick(user)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteUser(userKey)
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
  );
}

export default Adminuser;