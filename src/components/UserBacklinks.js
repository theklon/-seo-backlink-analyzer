import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import { useNavigate, useLocation } from "react-router-dom";

import logo from "../assets/klonlogo.png";

import { HiOutlineHome, HiOutlineExternalLink } from "react-icons/hi";
import { FaLink, FaDesktop } from "react-icons/fa6";
import { VscTools } from "react-icons/vsc";

import { LuCalendar, LuArrowUpDown } from "react-icons/lu";
import { FiBell, FiCopy } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { IoMdSearch } from "react-icons/io";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { RiDeleteBin6Line } from "react-icons/ri";

import { API_BASE_URL } from "../api";

/**
 * Extract clean domain from a URL or text.
 */
function extractDomain(value) {
  if (!value) return "";

  const trimmed = value.trim();

  try {
    const url = trimmed.includes("://") ? trimmed : `https://${trimmed}`;
    let hostname = new URL(url).hostname;
    hostname = hostname.replace(/^www\./i, "");
    return hostname;
  } catch (err) {
    return trimmed
      .replace(/^(https?:\/\/)/i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .split("?")[0];
  }
}

function UserBacklinks() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [domainName, setDomainName] = useState("");
  const [category, setCategory] = useState("");
  const [project, setProject] = useState("");
  const [urls, setUrls] = useState([""]);
  const [da, setDa] = useState(0);
  const [ss, setSs] = useState(0);

  const [backlinks, setBacklinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDaRange, setSelectedDaRange] = useState("");
  const [selectedSsValue, setSelectedSsValue] = useState("");

  const [, setMenuOpenId] = useState(null);
  const [editingBacklink, setEditingBacklink] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editDomain, setEditDomain] = useState("");
  const [editProject, setEditProject] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editUrls, setEditUrls] = useState([""]);
  const [editError, setEditError] = useState("");

  // Contribute state
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [contributeViewModalOpen, setContributeViewModalOpen] =
    useState(false);
  const [contributeTarget, setContributeTarget] = useState(null);
  const [contributeProjectId, setContributeProjectId] = useState("");
  const [contributeSubId, setContributeSubId] = useState("");
  const [contributeSubUrl, setContributeSubUrl] = useState("");
  const [contributePassword, setContributePassword] = useState("");
  const [contributeSaving, setContributeSaving] = useState(false);
  const [contributeError, setContributeError] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setDomainName("");
    setCategory("");
    setProject("");
    setUrls([""]);
    setDa(0);
    setSs(0);
  };

  const getProjectName = (projectId) => {
    if (!projectId) return "-";
    const p = projects.find(
      (p) =>
        (p.id || p._id) === projectId || // id-based
        p.name === projectId // fallback for old data
    );
    return p ? p.name : projectId;
  };

  // ===== Domain auto-sanitization (Add) =====
  const handleDomainPaste = (e) => {
    const pasted = e.clipboardData.getData("text");
    const sanitized = extractDomain(pasted);
    e.preventDefault();
    setDomainName(sanitized);
  };

  const handleDomainBlur = () => {
    setDomainName((prev) => extractDomain(prev));
  };

  // ===== Domain auto-sanitization (Edit) =====
  const handleEditDomainPaste = (e) => {
    const pasted = e.clipboardData.getData("text");
    const sanitized = extractDomain(pasted);
    e.preventDefault();
    setEditDomain(sanitized);
  };

  const handleEditDomainBlur = () => {
    setEditDomain((prev) => extractDomain(prev));
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

  // Load data
  useEffect(() => {
    const handleKeyDown = (e) => {
      console.log("UserBacklinks keydown:", e.key);
      if (e.key === "Escape") {
        if (isModalOpen) setIsModalOpen(false);
        if (showEditModal) setShowEditModal(false);
        if (contributeModalOpen) setContributeModalOpen(false);
        if (contributeViewModalOpen) setContributeViewModalOpen(false);
        if (showDeleteModal) setShowDeleteModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isModalOpen,
    showEditModal,
    contributeModalOpen,
    contributeViewModalOpen,
    showDeleteModal,
  ]);

  useEffect(() => {
    const fetchBacklinks = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const res = await fetch(`${API_BASE_URL}/api/user/backlinks`);
        if (!res.ok) {
          throw new Error(`Failed to load backlinks: ${res.status}`);
        }
        const data = await res.json();
        setBacklinks(data);
      } catch (err) {
        console.error("Error loading backlinks", err);
        setLoadError(err.message || "Error loading backlinks");
      } finally {
        setLoading(false);
      }
    };

    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/projects`);
        if (!res.ok) return;
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Error loading projects", err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        if (!res.ok) return;
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error loading categories", err);
      }
    };

    fetchBacklinks();
    fetchProjects();
    fetchCategories();
  }, []);

  const handleUrlChange = (index, value) => {
    setUrls((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const addUrlField = () => {
    setUrls((prev) => [...prev, ""]);
  };

  const handleCopyUrl = async (urlValue) => {
    try {
      await navigator.clipboard.writeText(urlValue);
    } catch (err) {
      console.error("Failed to copy URL", err);
    }
  };

  const handleAddBacklink = async (e) => {
    e.preventDefault();
    try {
      const trimmedDomain = extractDomain(domainName);
      const trimmedCategory = category.trim();
      const trimmedProject = project.trim();
      const validUrls = urls.map((u) => u.trim()).filter((u) => u !== "");

      // Project is optional here on purpose
      if (!trimmedDomain || !trimmedCategory) {
        return;
      }

      const createdList = [];

      for (const oneUrl of validUrls) {
        const body = {
          projectId: trimmedProject, // can be ""
          createdByUserId: "",
          domain: trimmedDomain,
          categoryId: trimmedCategory,
          da: Number(da) || 0,
          ss: Number(ss) || 0,
          url: oneUrl,
          contribute: null,
          status: "approved",
        };

        const res = await fetch(`${API_BASE_URL}/api/user/backlinks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          throw new Error(`Failed to create backlink: ${res.status}`);
        }

        const created = await res.json();
        createdList.push(created);
      }

      setBacklinks((prev) => [...prev, ...createdList]);

      closeModal();
    } catch (err) {
      console.error("Create backlink failed", err);
    }
  };

  const handleEditBacklinkClick = (item) => {
    setEditingBacklink(item);
    setEditDomain(item.domain || "");
    setEditCategory(item.categoryId || "");
    setEditProject(item.projectId || "");
    setEditUrls(item.urls && item.urls.length > 0 ? item.urls : [""]);
    setEditError("");
    setShowEditModal(true);
    setMenuOpenId(null);
  };

  const handleDeleteBacklink = (backlinkId) => {
    setDeleteTargetId(backlinkId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/user/backlinks/${deleteTargetId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        throw new Error(`Failed to delete backlink: ${res.status}`);
      }
      setBacklinks((prev) =>
        prev.filter((b) => (b.id || b._id) !== deleteTargetId)
      );
    } catch (err) {
      console.error("Delete backlink failed", err);
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      setMenuOpenId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  const handleEditUrlChange = (index, value) => {
    setEditUrls((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const addEditUrlField = () => {
    setEditUrls((prev) => [...prev, ""]);
  };

  const handleSaveBacklink = async () => {
    if (!editingBacklink) return;
    try {
      setEditError("");

      const editingId = editingBacklink.id;
      const trimmedDomain = extractDomain(editDomain);
      const trimmedCategory = editCategory.trim();
      const trimmedProject = editProject.trim();

      const trimmedUrls = editUrls.map((u) => (u || "").trim());
      const firstUrl = trimmedUrls[0] || "";

      if (!trimmedDomain || !trimmedCategory || !trimmedProject) {
        setEditError("Project, Category and Domain are required.");
        return;
      }

      if (!firstUrl) {
        setEditError("At least one URL is required.");
        return;
      }

      // 1) UPDATE EXISTING BACKLINK WITH FIRST URL
      const bodyUpdate = {
        projectId: trimmedProject,
        createdByUserId: "",
        domain: trimmedDomain,
        categoryId: trimmedCategory,
        da: editingBacklink.da ?? 0,
        ss: editingBacklink.ss ?? 0,
        url: firstUrl,
        contribute: editingBacklink.contribute || null,
        status: "approved",
      };

      const resUpdate = await fetch(
        `${API_BASE_URL}/api/user/backlinks/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyUpdate),
        }
      );
      if (!resUpdate.ok) {
        throw new Error(`Failed to update backlink: ${resUpdate.status}`);
      }

      const updatedMain = await resUpdate.json();
      const updatedId = updatedMain.id || updatedMain._id;

      // 2) CREATE NEW BACKLINKS FOR ANY EXTRA URLS
      const extraUrls = trimmedUrls.slice(1).filter((u) => !!u);
      const createdExtras = [];

      for (const extra of extraUrls) {
        const bodyCreate = {
          projectId: trimmedProject,
          createdByUserId: "",
          domain: trimmedDomain,
          categoryId: trimmedCategory,
          da: editingBacklink.da ?? 0,
          ss: editingBacklink.ss ?? 0,
          url: extra,
          contribute: null,
          status: "approved",
        };

        const resCreate = await fetch(`${API_BASE_URL}/api/user/backlinks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyCreate),
        });
        if (!resCreate.ok) {
          throw new Error(
            `Failed to create extra backlink: ${resCreate.status}`
          );
        }
        const created = await resCreate.json();
        createdExtras.push(created);
      }

      // 3) UPDATE LOCAL STATE
      setBacklinks((prev) => {
        const replaced = prev.map((b) =>
          (b.id || b._id) === updatedId ? updatedMain : b
        );
        return [...replaced, ...createdExtras];
      });

      setShowEditModal(false);
    } catch (err) {
      setEditError(err.message || "Error updating backlink");
    }
  };

  // ===== Contribute handlers =====

  const handleOpenContribute = (item) => {
    setContributeTarget(item);
    setContributeSubUrl("");
    setContributeSubId("");
    setContributePassword("");
    setContributeProjectId(item.projectId || ""); // prefill from backlink
    setContributeError("");
    setContributeModalOpen(true);
  };

  const handleOpenContributeView = (item) => {
    setContributeTarget(item);
    setContributeViewModalOpen(true);
  };

  const closeContributeModal = () => {
    setContributeModalOpen(false);
    setContributeTarget(null);
    setContributeSubUrl("");
    setContributeSubId("");
    setContributePassword("");
    setContributeError("");
  };

  const closeContributeViewModal = () => {
    setContributeViewModalOpen(false);
    setContributeTarget(null);
  };

  const handleSaveContribute = async () => {
    if (!contributeTarget) return;
    try {
      setContributeSaving(true);
      setContributeError("");

      const backlinkId = contributeTarget.id;
      const userId = localStorage.getItem("userId") || "";
      const userName = localStorage.getItem("userName") || "";
      const body = {
        subBacklinkId: contributeSubId.trim(),
        password: contributePassword.trim(),
        subUrl: contributeSubUrl.trim(),
        points: 1,
        userId,
        userName,
        projectId: contributeProjectId || contributeTarget.projectId || "",
      };

      const res = await fetch(
        `${API_BASE_URL}/api/user/backlinks/${backlinkId}/contribute`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to save contribution: ${res.status}`);
      }

      const updated = await res.json();
      const updatedId = updated.id || updated._id;

      setBacklinks((prev) =>
        prev.map((b) => ((b.id || b._id) === updatedId ? updated : b))
      );

      closeContributeModal();
    } catch (err) {
      setContributeError(err.message || "Error saving contribution");
    } finally {
      setContributeSaving(false);
    }
  };

  // Group backlinks by domain/category/project
  const groupedBacklinks = Object.values(
    backlinks.reduce((acc, b) => {
      const key = `${b.domain}__${b.categoryId}__${b.projectId || ""}`;
      if (!acc[key]) {
        acc[key] = {
          id: b.id || b._id,
          domain: b.domain,
          categoryId: b.categoryId,
          projectId: b.projectId || "",
          da: b.da,
          ss: b.ss,
          contribute: b.contribute,
          contributions: b.contributions || [],
          urls: [],
        };
      }
      if (b.contributions && b.contributions.length) {
        acc[key].contributions = b.contributions;
      }
      if (b.contribute) {
        acc[key].contribute = b.contribute;
      }
      acc[key].urls.push(b.url);
      return acc;
    }, {})
  );

  // Apply filters
  const filteredBacklinks = groupedBacklinks.filter((item) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      if (
        !(item.domain || "").toLowerCase().includes(q) &&
        !(item.categoryId || "").toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    if (selectedCategory && (item.categoryId || "") !== selectedCategory) {
      return false;
    }

    if (selectedDaRange) {
      const [minStr, maxStr] = selectedDaRange.split("-");
      const min = Number(minStr);
      const max = Number(maxStr);
      const daValue = Number(item.da ?? 0);
      if (!(daValue >= min && daValue <= max)) {
        return false;
      }
    }

    if (selectedSsValue) {
      const ssValue = Number(item.ss ?? 0);
      if (ssValue !== Number(selectedSsValue)) {
        return false;
      }
    }

    return true;
  });

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

          <div className="topbar-divider" />

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

        {/* MAIN CONTENT */}
        <div className="main-content">
          <div className="breadcrumb">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/user/dashboard")}
            >
              Home
            </span>
            {" > Backlinks"}
          </div>

          <div className="backlink-header">
            <h2 className="page-title">Backlinks</h2>
            <button className="new-backlink-btn" onClick={openModal}>
              + New Backlink
            </button>
          </div>

          {/* FILTER BAR */}
          <div className="main-wrapper ">
          <div className="backlink-filters">
            <div className="search-box">
              <span className="search-icon">
                <IoMdSearch />
              </span>
              <input
                type="text"
                placeholder="Search Domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Projects</option>
              {projects.map((p) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Category</option>
              {categories.map((c) => (
                <option key={c.id || c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedDaRange}
              onChange={(e) => setSelectedDaRange(e.target.value)}
            >
              <option value="">DA</option>
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
              value={selectedSsValue}
              onChange={(e) => setSelectedSsValue(e.target.value)}
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
            </select>
          </div>

          {/* TABLE */}
          <div
            className="table-container user-backlinks-table"
            style={{ marginTop: 24 }}
          >
            {loadError && (
              <div style={{ color: "red", marginBottom: 8 }}>{loadError}</div>
            )}
            <table>
              <thead>
                <tr>
                  <th>Domain Name</th>
                  <th>Project</th>
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
                  <th>Contribute</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8}>Loading backlinks...</td>
                  </tr>
                ) : filteredBacklinks.length === 0 ? (
                  <tr>
                    <td colSpan={8}>No backlinks found.</td>
                  </tr>
                ) : (
                  filteredBacklinks.map((item) => {
                    const key = item.id;
                    const totalPoints =
                      (item.contribute && item.contribute.points) ||
                      (item.contributions
                        ? item.contributions.length
                        : 0);
                    return (
                      <tr key={key}>
                        <td>{item.domain}</td>
                        <td>
                          {(() => {
                            // If no project stored, nothing to show
                            if (!item.projectId) return "";

                            // Resolve project name from the list (supports both id and old data)
                            const project = projects.find(
                              (p) =>
                                (p.id || p._id) === item.projectId ||
                                p.name === item.projectId
                            );
                            const projName = project
                              ? project.name
                              : item.projectId;

                            // No filter -> always show the project name
                            if (!selectedProject) return projName;

                            // With filter: show name only for matching project, else blank
                            return (item.projectId || "") === selectedProject
                              ? projName
                              : "";
                          })()}
                        </td>
                        <td>{item.categoryId}</td>
                        <td>
                          <span className="da-badge">{item.da}</span>
                        </td>
                        <td>
                          <span className="ss-badge">{item.ss}</span>
                        </td>
                        <td>
                          {item.urls.map((u, idx) => (
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
                        </td>
                        <td className="contribute-col">
                          {totalPoints > 0 ? (
                            <div className="contribute-wrapper">
                              <button
                                type="button"
                                className="contribute-pill"
                                onClick={() => handleOpenContributeView(item)}
                              >
                                <span className="contribute-points">
                                  {totalPoints}
                                </span>
                                <span className="contribute-tick">✔</span>
                              </button>
                              <button
                                type="button"
                                className="contribute-plus-btn"
                                onClick={() => handleOpenContribute(item)}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="contribute-plus-btn"
                              onClick={() => handleOpenContribute(item)}
                            >
                              +
                            </button>
                          )}
                        </td>
                        <td className="actions-col">
                          <div className="actions-wrapper">
                            <button
                              type="button"
                              className="actions-icon-btn"
                              onClick={() => handleEditBacklinkClick(item)}
                              title="Edit"
                            >
                              <HiOutlinePencilAlt Fill="blue" Size="22px" Width="22px"/>
                            </button>
                            <button
                              type="button"
                              className="actions-icon-btn"
                              onClick={() => handleDeleteBacklink(key)}
                              title="Delete"
                              
                            >
                              <RiDeleteBin6Line  Fill="red" Size="22px" Width="22px"/>
                            </button>
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

      {/* ADD NEW BACKLINK MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="backlinks-add-modal-card">
            <div className="modal-header">
              <h3>Add New Backlink</h3>
              <span className="modal-close" onClick={closeModal}>
                ×
              </span>
            </div>

            <form className="modal-body" onSubmit={handleAddBacklink}>
              <div className="modal-field">
                <label>
                  Domain Name <span>*</span>
                </label>
                <input
                  type="text"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  onPaste={handleDomainPaste}
                  onBlur={handleDomainBlur}
                  required
                />
              </div>

              <div className="modal-field-row">
                <div className="modal-field small-field">
                  <label>
                    Category <span>*</span>
                  </label>
                  <select
                    className="modal-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id || c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-field-row">
                <div className="modal-field small-field">
                  <label>DA</label>
                  <input
                    type="number"
                    value={da}
                    onChange={(e) => setDa(e.target.value)}
                  />
                </div>

                <div className="modal-field small-field">
                  <label>SS</label>
                  <input
                    type="number"
                    value={ss}
                    onChange={(e) => setSs(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-field">
                <div className="modal-field-header">
                  <label>URL(s)</label>
                  <button
                    type="button"
                    className="primary-btn url-add-btn"
                    onClick={addUrlField}
                  >
                    +
                  </button>
                </div>

                <div className="url-list-wrapper">
                  {urls.map((val, index) => (
                    <input
                      key={index}
                      type="url"
                      value={val}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      className="url-list-input"
                    />
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button className="primary-btn" type="submit">
                  Add Backlink
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BACKLINK MODAL */}
      {showEditModal && editingBacklink && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Edit Backlink</h3>
              <span
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </span>
            </div>

            <div className="modal-body">
              {editError && (
                <div style={{ color: "red", marginBottom: 8 }}>{editError}</div>
              )}

              <div className="modal-field">
                <label>Domain Name</label>
                <input
                  type="text"
                  value={editDomain}
                  onChange={(e) => setEditDomain(e.target.value)}
                  onPaste={handleEditDomainPaste}
                  onBlur={handleEditDomainBlur}
                />
              </div>

              <div className="modal-field-row">
                <div className="modal-field small-field">
                  <label>Project</label>
                  <select
                    className="modal-select"
                    value={editProject}
                    onChange={(e) => setEditProject(e.target.value)}
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-field small-field">
                  <label>Category</label>
                  <select
                    className="modal-select"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id || c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-field">
                <div className="modal-field-header">
                  <label>URL(s)</label>
                  <button
                    type="button"
                    className="primary-btn url-add-btn"
                    onClick={addEditUrlField}
                  >
                    +
                  </button>
                </div>

                <div className="url-list-wrapper">
                  {editUrls.map((val, index) => (
                    <input
                      key={index}
                      type="url"
                      value={val}
                      onChange={(e) => handleEditUrlChange(index, e.target.value)}
                      required={index === 0}
                      className="url-list-input"
                    />
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="primary-btn"
                  type="button"
                  onClick={handleSaveBacklink}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTRIBUTE CREATE MODAL */}
      {contributeModalOpen && contributeTarget && (
        <div className="modal-overlay">
          <div className="backlinks-modal-card small-confirm-modal ">
            <div className="modal-header">
              <h3>Create Backlink Contribution</h3>
              <span className="modal-close" onClick={closeContributeModal}>
                ×
              </span>
            </div>
            <div className="modal-body">
              {contributeError && (
                <p style={{ color: "red", marginBottom: 8 }}>
                  {contributeError}
                </p>
              )}
              <p className="contribute-meta">
                Domain: {contributeTarget.domain}
              </p>
              <p className="contribute-meta">
                Category: {contributeTarget.categoryId}
              </p>

              <div className="modal-field">
                <label>Project</label>
                <select
                  className="modal-select"
                  value={contributeProjectId}
                  onChange={(e) => setContributeProjectId(e.target.value)}
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-field">
                <label>Sub Backlink URL</label>
                <input
                  type="text"
                  value={contributeSubUrl}
                  onChange={(e) => setContributeSubUrl(e.target.value)}
                  autoComplete="off"
                  name="sub-backlink-url"
                />
              </div>
              <div className="modal-field">
                <label>Sub Backlink ID</label>
                <input
                  type="text"
                  value={contributeSubId}
                  onChange={(e) => setContributeSubId(e.target.value)}
                  autoComplete="off"
                  name="sub-backlink-id"
                />
              </div>

              <div className="modal-field">
                <label>Password</label>
                <input
                  type="text"
                  value={contributePassword}
                  onChange={(e) => setContributePassword(e.target.value)}
                  autoComplete="off"
                  name="backlink-password"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleSaveContribute}
                  disabled={contributeSaving}
                >
                  {contributeSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTRIBUTE VIEW MODAL */}
      {contributeViewModalOpen && contributeTarget && (
        <div className="modal-overlay">
          <div className="backlinks-modal-card small-confirm-modal contribute-details-card">
            <div className="modal-header">
              <h3>Contribution Details</h3>
              <span
                className="modal-close"
                onClick={closeContributeViewModal}
              >
                ×
              </span>
            </div>
            <div className="modal-body">
              <p className="contribute-meta">
                Domain: {contributeTarget.domain}
                <br />
                Project: {getProjectName(contributeTarget.projectId)}
                <br />
                Category: {contributeTarget.categoryId}
              </p>

              {contributeTarget.contributions &&
                contributeTarget.contributions.length > 0 && (
                  <table className="contribute-table">
                    <thead>
                      <tr>
                        <th>Sub Backlink URL</th>
                        <th>Sub Backlink ID</th>
                        <th>Password</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contributeTarget.contributions.map((row, idx) => (
                        <tr key={idx}>
                          <td>
                            {row.subUrl ? (
                              <div className="url-row">
                                <button
                                  type="button"
                                  className="url-icon-btn"
                                  onClick={() => handleCopyUrl(row.subUrl)}
                                >
                                  <FiCopy />
                                </button>
                                <a
                                  href={row.subUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="url-icon-btn"
                                >
                                  <HiOutlineExternalLink />
                                </a>
                                <span className="url-text">
                                  {renderUrlCell(row.subUrl)}
                                </span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>{row.subBacklinkId}</td>
                          <td>{row.password}</td>
                          <td>
                            {new Date(row.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={closeContributeViewModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-card small-confirm-modal">
            <div className="modal-header">
              <h3>Delete Backlink</h3>
              <span className="modal-close" onClick={handleCancelDelete}>
                ×
              </span>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this backlink?</p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleConfirmDelete}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default UserBacklinks;