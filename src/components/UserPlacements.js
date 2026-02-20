import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { useNavigate, useLocation } from "react-router-dom";

import logo from "../assets/klonlogo.png";
import { API_BASE_URL } from "../api";

import { FaHome } from "react-icons/fa";
import { FaLink, FaDesktop } from "react-icons/fa6";
import { VscTools } from "react-icons/vsc";
import { LuCalendar } from "react-icons/lu";
import { FiBell, FiEdit2, FiTrash2 } from "react-icons/fi";
import { IoIosArrowDown, IoMdAdd, IoMdSearch } from "react-icons/io";

function UserPlacements() {
  const navigate = useNavigate();
  const location = useLocation();

  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [placement, setPlacement] = useState("");
  const [uses, setUses] = useState("");
  const [type, setType] = useState("");
  const [industry, setIndustry] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = add, id = edit

  // Load placements from backend on mount
  useEffect(() => {
    const loadPlacements = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const res = await fetch(`${API_BASE_URL}/api/placements`);
        if (!res.ok) throw new Error("Failed to load placements");
        const data = await res.json();
        setPlacements(data || []);
      } catch (err) {
        console.error("Error loading placements", err);
        setLoadError(err.message || "Failed to load placements");
      } finally {
        setLoading(false);
      }
    };
    loadPlacements();
  }, []);

  const openModal = () => {
    setEditingId(null);
    setPlacement("");
    setUses("");
    setType("");
    setIndustry("");
    setSaveError("");
    setIsModalOpen(true);
  };

  const openEditPlacement = (p) => {
    setEditingId(p.id);
    setPlacement(p.placement || "");
    setUses(p.uses || "");
    setType(p.type || "");
    setIndustry(p.industry || "");
    setSaveError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSavePlacement = async (e) => {
    e.preventDefault();
    if (!placement.trim()) {
      setSaveError("Placement name is required.");
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      const body = {
        placement: placement.trim(),
        uses: uses.trim(),
        type: type.trim(),
        industry: industry.trim(),
      };

      if (editingId) {
        // UPDATE
        const res = await fetch(
          `${API_BASE_URL}/api/placements/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        if (!res.ok) throw new Error("Failed to update placement");
        const updated = await res.json();
        setPlacements((prev) =>
          prev.map((p) => (p.id === editingId ? updated : p))
        );
      } else {
        // CREATE
        const res = await fetch(`${API_BASE_URL}/api/placements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to save placement");
        const saved = await res.json();
        setPlacements((prev) => [saved, ...prev]);
      }

      setIsModalOpen(false);
      setEditingId(null);
      setPlacement("");
      setUses("");
      setType("");
      setIndustry("");
    } catch (err) {
      console.error("Error saving placement", err);
      setSaveError(err.message || "Failed to save placement");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlacement = async (id) => {
    const toDelete = placements.find((p) => p.id === id);
    if (!toDelete) return;

    const ok = window.confirm(
      `Are you sure you want to delete "${toDelete.placement}"?`
    );
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/placements/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete placement");
      setPlacements((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting placement", err);
      alert(err.message || "Failed to delete placement");
    }
  };

  // Filters
  const filteredPlacements = placements.filter((p) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      if (!(p.placement || "").toLowerCase().includes(q)) return false;
    }
    if (selectedType && (p.type || "") !== selectedType) return false;
    return true;
  });

  const typeOptions = Array.from(
    new Set(
      placements
        .map((p) => (p.type || "").trim())
        .filter((t) => t !== "")
    )
  );

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
            <li
              className={`menu-item ${
                location.pathname === "/user/placements" ? "active" : ""
              }`}
              onClick={() => navigate("/user/placements")}
            >
              <VscTools className="nav-icon" />
              <span>Master of Placement</span>
            </li>
          </ul>
        </div>

        {/* MAIN CONTENT */}
        <div className="main-content">
          <div className="breadcrumb">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/user/dashboard")}
            >
              Home
            </span>
            {" > Master of Placement"}
          </div>

          <div className="backlink-header">
            <h2 className="page-title">Master of Placement</h2>
            <button className="new-backlink-btn" onClick={openModal}>
              <IoMdAdd />
              <span>New Placement</span>
            </button>
          </div>

          <div className="main-wrapper">
            {/* Filters */}
            <div className="backlink-filters">
              <div className="search-box">
                <span className="search-icon">
                  <IoMdSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search Placement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="filter-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">Type</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* TABLE */}
            <div className="table-container user-backlinks-table user-placements-table">
              {loadError && (
                <div style={{ color: "red", marginBottom: 8 }}>
                  {loadError}
                </div>
              )}

              <table>
                <thead>
                  <tr>
                    <th>Placement</th>
                    <th>Uses</th>
                    <th>Type</th>
                    <th>Industry</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center" }}>
                        Loading...
                      </td>
                    </tr>
                  ) : filteredPlacements.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center" }}>
                        No placements found.
                      </td>
                    </tr>
                  ) : (
                    filteredPlacements.map((p) => (
                      <tr key={p.id}>
                        <td>{p.placement}</td>
                        <td>{p.uses || "-"}</td>
                        <td>{p.type || "-"}</td>
                        <td>{p.industry || "-"}</td>
                        <td>
                          <div className="url-row">
                            <button
                              type="button"
                              className="url-icon-btn"
                              onClick={() => openEditPlacement(p)}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              type="button"
                              className="url-icon-btn"
                              onClick={() => handleDeletePlacement(p.id)}
                              title="Delete"
                            >
                              <FiTrash2 />
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

      {/* ADD / EDIT PLACEMENT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 520 }}
          >
            <div className="modal-header">
              <h3>{editingId ? "Edit Placement" : "New Placement"}</h3>
            </div>

            <form onSubmit={handleSavePlacement}>
              <div className="modal-body">
                {saveError && (
                  <div style={{ color: "red", marginBottom: 8 }}>
                    {saveError}
                  </div>
                )}

                <div className="modal-field">
                  <label>
                    Placement <span>*</span>
                  </label>
                  <input
                    type="text"
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    placeholder="Enter placement"
                  />
                </div>

                <div className="modal-field">
                  <label>Uses</label>
                  <textarea
                    rows={3}
                    value={uses}
                    onChange={(e) => setUses(e.target.value)}
                    placeholder="How this placement is used"
                  />
                </div>

                <div className="modal-field">
                  <label>Type</label>
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="Type (e.g. Banner, Sidebar, Footer)"
                  />
                </div>

                <div className="modal-field">
                  <label>Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Industry"
                  />
                </div>
              </div>

              <div
                className="modal-actions"
                style={{ justifyContent: "flex-end" }}
              >
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button className="primary-btn" type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Placement"
                    : "Save Placement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserPlacements;