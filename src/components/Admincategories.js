import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import logo from "../assets/klon-logo-white.png";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../api";

import { FaHome } from "react-icons/fa";
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

function Admincategories() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [createCategoryError, setCreateCategoryError] = useState("");

  const [categories, setCategories] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");
  const [editCategoryError, setEditCategoryError] = useState("");
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showCreateCategory) {
          setShowCreateCategory(false);
        }
        if (showEditModal) {
          setShowEditModal(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCreateCategory, showEditModal]);
  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };

  const handleAddCategory = async () => {
    try {
      setCreateCategoryError("");

      if (!categoryName.trim()) {
        setCreateCategoryError("Category name is required.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryName.trim(),
          description: categoryDescription.trim(),
          isActive: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create category: ${res.status}`);
      }

      const created = await res.json();
      setCategories((prev) => [...prev, created]);

      setCategoryName("");
      setCategoryDescription("");
      setShowCreateCategory(false);
    } catch (err) {
      setCreateCategoryError(err.message || "Error creating category");
    }
  };

  const openActionsMenu = (categoryId) => {
    setMenuOpenId((prev) => (prev === categoryId ? null : categoryId));
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/categories/${categoryId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to delete category: ${res.status}`);
      }
      setCategories((prev) =>
        prev.filter((c) => (c.id || c._id) !== categoryId)
      );
    } catch (err) {
      console.error("Delete category failed", err);
    } finally {
      setMenuOpenId(null);
    }
  };

  const handleEditCategoryClick = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name || "");
    setEditCategoryDescription(category.description || "");
    setEditCategoryError("");
    setShowEditModal(true);
    setMenuOpenId(null);
  };

  const handleSaveCategory = async () => {
    if (!editingCategory) return;
    try {
      setEditCategoryError("");

      const editingId = editingCategory.id || editingCategory._id;

      const res = await fetch(
        `${API_BASE_URL}/api/admin/categories/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editCategoryName.trim(),
            description: editCategoryDescription.trim(),
            isActive: editingCategory.isActive ?? true,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to update category: ${res.status}`);
      }

      const updated = await res.json();
      const updatedId = updated.id || updated._id;

      setCategories((prev) =>
        prev.map((c) =>
          (c.id || c._id) === updatedId ? updated : c
        )
      );
      setShowEditModal(false);
    } catch (err) {
      setEditCategoryError(err.message || "Error updating category");
    }
  };

  return (
    <div className="dashboard-root admin-dashboard">
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
              <FaHome className="nav-icon" />
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
        <div className="main-content category-page">
          {/* BREADCRUMB */}
          <div className="breadcrumb">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/admin/dashboard")}  // or "/admin/dashboard" in admin pages
            >
              Home
            </span>
            {" > Categories"}
          </div>

          {/* HEADER + BUTTON IN ONE LINE */}
          <div className="page-header">
            <h2 className="page-title">Categories</h2>

            <button
              className="primary-btn"
              onClick={() => setShowCreateCategory(true)}
            >
              + Add Category
            </button>
          </div>
          <div className="main-wrapper">
          {/* TABLE ACTION BAR + TABLE */}
          <div className="table-wrapper">
            {/* ADD CATEGORY MODAL */}
            {showCreateCategory && (
              <div className="modal-overlay admin-modal-overlay">
                <div className="modal-card admin-modal-card">
                  <div className="modal-header">
                    <h3>
                      <span className="modal-icon">
                        <RiShapesLine />
                      </span>
                      Add Category
                    </h3>
                    <span
                      className="modal-close"
                      onClick={() => setShowCreateCategory(false)}
                    >
                      ×
                    </span>
                  </div>

                  <div className="modal-body">
                    {createCategoryError && (
                      <div style={{ color: "red", marginBottom: 8 }}>
                        {createCategoryError}
                      </div>
                    )}

                    <div className="modal-field">
                      <label>
                        Category Name <span>*</span>
                      </label>
                      <input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                      />
                    </div>

                    <div className="modal-field">
                      <label>Description</label>
                      <input
                        type="text"
                        value={categoryDescription}
                        onChange={(e) =>
                          setCategoryDescription(e.target.value)
                        }
                      />
                    </div>

                    <div className="modal-actions">
                      <button
                        className="primary-btn"
                        type="button"
                        onClick={handleAddCategory}
                      >
                        Add Category
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EDIT CATEGORY MODAL */}
            {showEditModal && editingCategory && (
              <div className="modal-overlay admin-modal-overlay">
                <div className="modal-card admin-modal-card">
                  <div className="modal-header">
                    <h3>Edit Category</h3>
                    <span
                      className="modal-close"
                      onClick={() => setShowEditModal(false)}
                    >
                      ×
                    </span>
                  </div>

                  <div className="modal-body">
                    {editCategoryError && (
                      <div style={{ color: "red", marginBottom: 8 }}>
                        {editCategoryError}
                      </div>
                    )}

                    <div className="modal-field">
                      <label>Category Name</label>
                      <input
                        type="text"
                        value={editCategoryName}
                        onChange={(e) =>
                          setEditCategoryName(e.target.value)
                        }
                      />
                    </div>

                    <div className="modal-field">
                      <label>Description</label>
                      <input
                        type="text"
                        value={editCategoryDescription}
                        onChange={(e) =>
                          setEditCategoryDescription(e.target.value)
                        }
                      />
                    </div>

                    <div className="modal-actions">
                      <button
                        className="primary-btn"
                        type="button"
                        onClick={handleSaveCategory}
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
                    <th>Category Name</th>
                    <th>Description</th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={3}>No categories found.</td>
                    </tr>
                  ) : (
                    categories.map((category) => {
                      const categoryKey = category.id || category._id;
                      return (
                        <tr key={categoryKey}>
                          <td>{category.name}</td>
                          <td>{category.description}</td>
                          <td className="actions-col">
                            <div className="actions-wrapper">
                              <button
                                className="actions-dot-btn"
                                type="button"
                                onClick={() =>
                                  openActionsMenu(categoryKey)
                                }
                              >
                                ⋮
                              </button>

                              {menuOpenId === categoryKey && (
                                <div className="actions-menu">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleEditCategoryClick(category)
                                    }
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteCategory(categoryKey)
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
    </div>
  );
}

export default Admincategories;