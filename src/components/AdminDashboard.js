import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../api";
import "./AdminDashboard.css";
import { useNavigate, useLocation } from "react-router-dom";

import logo from "../assets/klon-logo-white.png";
import banner from "../assets/admindashboardslide.png";

import { HiOutlineHome } from "react-icons/hi";
import { FiUsers, FiBell, FiUser, FiZap, FiSettings, FiLogOut } from "react-icons/fi";
import { FaDesktop } from "react-icons/fa6";
import { RiShapesLine } from "react-icons/ri";
import { LuCalendar } from "react-icons/lu";
import { IoIosArrowDown } from "react-icons/io";

function AdminDashboard() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalBacklinks: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };

  useEffect(() => {
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

    fetchStats();
  }, []);

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
          <div
            className="banner"
            style={{ backgroundImage: `url(${banner})` }}
          ></div>

          <div className="dots">
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>

          <div className="content-placeholder">
            {/* You can style these using your existing CSS */}
            {statsError && (
              <div style={{ color: "red", marginBottom: 12 }}>{statsError}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;