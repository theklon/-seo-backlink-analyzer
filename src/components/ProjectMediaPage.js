// src/components/ProjectMediaPage.js
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

import logo from "../assets/klonlogo.png";
import { API_BASE_URL } from "../api";

import { FaHome } from "react-icons/fa";
import { FaLink, FaDesktop } from "react-icons/fa6";
import { VscTools } from "react-icons/vsc";
import { LuCalendar } from "react-icons/lu";
import { FiBell, FiCopy } from "react-icons/fi";
import { HiOutlineExternalLink } from "react-icons/hi";
import { IoIosArrowDown } from "react-icons/io";
import {
  AiOutlineEye,
  AiOutlineFilePdf,
  AiOutlineFileWord,
  AiOutlineFileImage,
  AiOutlineFileText,
  AiOutlineFile,
} from "react-icons/ai";

const MAX_IMAGES = 20;
const MAX_FILES = 5;

function ProjectMediaPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const projectName = location.state?.projectName || "Project";

  const [activeTab, setActiveTab] = useState("images");
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]); // {id,name,url}
  const [files, setFiles] = useState([]); // {id,name,url}

  const [imageError, setImageError] = useState("");
  const [videoError, setVideoError] = useState("");
  const [fileError, setFileError] = useState("");

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageBaseName, setImageBaseName] = useState("");
  const [pendingImages, setPendingImages] = useState([]);
  const [deleteImageTarget, setDeleteImageTarget] = useState(null);

  // Videos: URL only
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoName, setVideoName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Files popup (upload)
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [fileBaseName, setFileBaseName] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);

  // 3-dot menus
  const [videoMenuOpenId, setVideoMenuOpenId] = useState(null);
  const [fileMenuOpenId, setFileMenuOpenId] = useState(null);

  // Edit / delete popups for videos/files
  const [videoEditTarget, setVideoEditTarget] = useState(null);
  const [videoEditName, setVideoEditName] = useState("");
  const [videoEditUrl, setVideoEditUrl] = useState("");

  const [fileEditTarget, setFileEditTarget] = useState(null);
  const [fileEditName, setFileEditName] = useState("");

  const [videoDeleteTarget, setVideoDeleteTarget] = useState(null);
  const [fileDeleteTarget, setFileDeleteTarget] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (imageModalOpen) setImageModalOpen(false);
        if (videoModalOpen) setVideoModalOpen(false);
        if (fileModalOpen) setFileModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [imageModalOpen, videoModalOpen, fileModalOpen]);

  // Load already-saved media for this project
  useEffect(() => {
    const loadMedia = async () => {
      try {
        if (!projectId) return;

        const [imgRes, vidRes, fileRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/projects/${projectId}/media?kind=image`),
          fetch(`${API_BASE_URL}/api/projects/${projectId}/media?kind=video`),
          fetch(`${API_BASE_URL}/api/projects/${projectId}/media?kind=file`),
        ]);

        if (imgRes.ok) {
          const data = await imgRes.json();
          setImages(
            data.map((m) => ({
              id: m.id || m._id,
              name: m.name,
              url: m.dataUrl || m.url || "",
            }))
          );
        }

        if (vidRes.ok) {
          const data = await vidRes.json();
          setVideos(
            data.map((m) => ({
              id: m.id || m._id,
              name: m.name,
              url: m.url || "",
            }))
          );
        }

        if (fileRes.ok) {
          const data = await fileRes.json();
          setFiles(
            data.map((m) => ({
              id: m.id || m._id,
              name: m.name,
              url: m.dataUrl || m.url || "",
            }))
          );
        }
      } catch (e) {
        console.error("Failed to load project media", e);
      }
    };

    loadMedia();
  }, [projectId]);

  const handleCopy = async (url) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const openDataUrlInNewTab = (dataUrl, filename = "file") => {
    if (!dataUrl) return;

    // If it is a normal URL (http/https), just open it
    if (!dataUrl.startsWith("data:")) {
      window.open(dataUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // If it is a data URL, convert to Blob first
    const parts = dataUrl.split(",");
    if (parts.length < 2) {
      window.open(dataUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const mimeMatch = parts[0].match(/data:(.*?);base64/);
    const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenFile = (file) => {
    if (!file || !file.url) return;
    openDataUrlInNewTab(file.url, file.name || "file");
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // ========== IMAGES ==========

  const handleImageFilesChange = (e) => {
    const fileList = Array.from(e.target.files || []);
    if (!fileList.length) return;

    setPendingImages((prev) => {
      const existingCount = images.length + prev.length;
      const remainingSlots = MAX_IMAGES - existingCount;
      if (remainingSlots <= 0) {
        setImageError(`You can upload a maximum of ${MAX_IMAGES} images.`);
        return prev;
      }

      const toUse = fileList.slice(0, remainingSlots);
      const startIndex = existingCount;
      const base =
        imageBaseName && imageBaseName.trim()
          ? imageBaseName.trim()
          : "Image Name";

      const newItems = toUse.map((file, idx) => {
        const index = startIndex + idx + 1;
        return {
          id: `${Date.now()}-${idx}`,
          name: `${base} ${index}`,
          file,
          url: URL.createObjectURL(file),
        };
      });

      setImageError("");
      return [...prev, ...newItems];
    });

    e.target.value = "";
  };

  const handleImageNameChange = (id, newName) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, name: newName } : img))
    );
  };

  // ========== FILES POPUP (upload) ==========

  const getFileExtension = (file) => {
    if (!file) return "";
    if (file.name && file.name.includes(".")) {
      return file.name.split(".").pop().toLowerCase();
    }
    if (file.url && typeof file.url === "string" && file.url.startsWith("data:")) {
      const match = file.url.match(/^data:(.*?);/);
      if (match && match[1]) {
        const mime = match[1].toLowerCase();
        if (mime.includes("pdf")) return "pdf";
        if (
          mime.includes("word") ||
          mime.includes("msword") ||
          mime.includes("officedocument")
        ) {
          return "doc";
        }
        if (mime.startsWith("image/")) return "image";
        if (mime.startsWith("text/")) return "txt";
      }
    }
    return "";
  };

  const getFileTypeIcon = (file) => {
    const ext = getFileExtension(file);

    if (ext === "pdf") {
      return <AiOutlineFilePdf className="file-type-icon" />;
    }
    if (["doc", "docx"].includes(ext)) {
      return <AiOutlineFileWord className="file-type-icon" />;
    }
    if (
      ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext) ||
      ext === "image"
    ) {
      return <AiOutlineFileImage className="file-type-icon" />;
    }
    if (["txt", "md"].includes(ext) || ext === "txt") {
      return <AiOutlineFileText className="file-type-icon" />;
    }

    return <AiOutlineFile className="file-type-icon" />;
  };

  const handleFileFilesChange = (e) => {
    const fileList = Array.from(e.target.files || []);
    if (!fileList.length) return;

    setPendingFiles((prev) => {
      const existingCount = files.length + prev.length;
      const remainingSlots = MAX_FILES - existingCount;
      if (remainingSlots <= 0) {
        setFileError(`You can upload a maximum of ${MAX_FILES} files.`);
        return prev;
      }

      const toUse = fileList.slice(0, remainingSlots);
      const startIndex = existingCount;
      const base =
        fileBaseName && fileBaseName.trim() ? fileBaseName.trim() : "File";

      const newItems = toUse.map((file, idx) => {
        const index = startIndex + idx + 1;
        return {
          id: `${Date.now()}-f-${idx}`,
          name: `${base} ${index}`,
          file,
        };
      });

      setFileError("");
      return [...prev, ...newItems];
    });

    e.target.value = "";
  };

  // ========== VIDEO / FILE EDIT & DELETE ==========

  const openVideoEdit = (video) => {
    setVideoEditTarget(video);
    setVideoEditName(video.name || "");
    setVideoEditUrl(video.url || "");
    setVideoMenuOpenId(null);
  };

  const openFileEdit = (file) => {
    setFileEditTarget(file);
    setFileEditName(file.name || "");
    setFileMenuOpenId(null);
  };

  const openVideoDelete = (video) => {
    setVideoDeleteTarget(video);
    setVideoMenuOpenId(null);
  };

  const openFileDelete = (file) => {
    setFileDeleteTarget(file);
    setFileMenuOpenId(null);
  };

  const handleSaveVideoEdit = () => {
    if (!videoEditTarget) return;
    const newName = videoEditName.trim();
    const newUrl = videoEditUrl.trim();
    if (!newName) return;

    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoEditTarget.id ? { ...v, name: newName, url: newUrl } : v
      )
    );
    setVideoEditTarget(null);
  };

  const handleSaveFileEdit = () => {
    if (!fileEditTarget) return;
    const newName = fileEditName.trim();
    if (!newName) return;

    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileEditTarget.id ? { ...f, name: newName } : f
      )
    );
    setFileEditTarget(null);
  };

  const handleConfirmVideoDelete = async () => {
    if (!videoDeleteTarget) return;
    try {
      if (projectId && videoDeleteTarget.id) {
        const res = await fetch(
          `${API_BASE_URL}/api/projects/${projectId}/media/${videoDeleteTarget.id}`,
          { method: "DELETE" }
        );
        console.log("VIDEO DELETE status", res.status);
        if (!res.ok) {
          const body = await res.text();
          console.error("video delete error body:", body);
        }
      }
    } catch (e) {
      console.error("Failed to delete video", e);
    }
    setVideos((prev) => prev.filter((v) => v.id !== videoDeleteTarget.id));
    setVideoDeleteTarget(null);
  };

  const handleConfirmFileDelete = async () => {
    if (!fileDeleteTarget) return;
    try {
      if (projectId && fileDeleteTarget.id) {
        const res = await fetch(
          `${API_BASE_URL}/api/projects/${projectId}/media/${fileDeleteTarget.id}`,
          { method: "DELETE" }
        );
        console.log("FILE DELETE status", res.status);
        if (!res.ok) {
          const body = await res.text();
          console.error("file delete error body:", body);
        }
      }
    } catch (e) {
      console.error("Failed to delete file", e);
    }
    setFiles((prev) => prev.filter((f) => f.id !== fileDeleteTarget.id));
    setFileDeleteTarget(null);
  };

  // ========== RENDER ==========

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

        {/* MAIN CONTENT – Media (no main-content wrapper, only main-wrapper) */}
        <div className="main-wrapper">
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
            <span
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(`/user/projects/${projectId}/backlinks`, {
                  state: { projectName },
                })
              }
            >
              {projectName}
            </span>
            {" > Media"}
          </div>

          <h2 className="page-title">{projectName} – Media</h2>

          {/* Tabs + upload button row */}
          <div className="media-tabs-row">
            <div className="media-tabs">
              <button
                className={
                  activeTab === "images" ? "media-tab active" : "media-tab"
                }
                onClick={() => setActiveTab("images")}
              >
                Images
              </button>
              <button
                className={
                  activeTab === "videos" ? "media-tab active" : "media-tab"
                }
                onClick={() => setActiveTab("videos")}
              >
                Videos
              </button>
              <button
                className={
                  activeTab === "files" ? "media-tab active" : "media-tab"
                }
                onClick={() => setActiveTab("files")}
              >
                Files
              </button>
            </div>

            {activeTab === "images" && (
              <button
                type="button"
                className="primary-btn"
                onClick={() => setImageModalOpen(true)}
              >
                Upload Images
              </button>
            )}

            {activeTab === "videos" && (
              <button
                type="button"
                className="primary-btn"
                onClick={() => setVideoModalOpen(true)}
              >
                Add Video URL
              </button>
            )}

            {activeTab === "files" && (
              <button
                type="button"
                className="primary-btn"
                onClick={() => setFileModalOpen(true)}
              >
                Upload Files
              </button>
            )}
          </div>

          {/* Images tab */}
          {activeTab === "images" && (
            <div className="media-section">
              {imageError && (
                <div style={{ color: "red", marginBottom: 8 }}>
                  {imageError}
                </div>
              )}

              <div className="media-grid">
                {images.map((img) => (
                  <div key={img.id} className="media-image-card">
                    <img src={img.url} alt={img.name} />
                    <div className="media-image-title">
                      <input
                        type="text"
                        value={img.name}
                        onChange={(e) =>
                          handleImageNameChange(img.id, e.target.value)
                        }
                        style={{
                          width: "100%",
                          border: "none",
                          background: "transparent",
                          outline: "none",
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="image-menu-btn"
                      onClick={() => setDeleteImageTarget(img)}
                      title="More options"
                    >
                      ...
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos tab – table */}
          {activeTab === "videos" && (
            <div className="media-section">
              {videoError && (
                <div style={{ color: "red", marginBottom: 8 }}>
                  {videoError}
                </div>
              )}

              <table className="user-backlinks-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>URL</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center" }}>
                        No videos added.
                      </td>
                    </tr>
                  ) : (
                    videos.map((v) => (
                      <tr key={v.id}>
                        <td>{v.name}</td>
                        <td style={{ fontSize: 13, color: "#4b5563" }}>
                          {v.url || "-"}
                        </td>
                        <td>
                          <div className="url-row">
                            {v.url && (
                              <>
                                <button
                                  type="button"
                                  className="url-icon-btn"
                                  onClick={() => handleCopy(v.url)}
                                  title="Copy URL"
                                >
                                  <FiCopy />
                                </button>
                                <a
                                  href={v.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="url-icon-btn"
                                  title="Open in new tab"
                                >
                                  <HiOutlineExternalLink />
                                </a>
                              </>
                            )}

                            <button
                              type="button"
                              className="media-more-btn"
                              onClick={() =>
                                setVideoMenuOpenId((prev) =>
                                  prev === v.id ? null : v.id
                                )
                              }
                              title="More options"
                            >
                              ...
                            </button>
                            {videoMenuOpenId === v.id && (
                              <div className="media-more-menu">
                                <button
                                  type="button"
                                  className="media-more-item action-menu-btn"
                                  onClick={() => openVideoEdit(v)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="media-more-item action-menu-button"
                                  onClick={() => openVideoDelete(v)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Files tab – table */}
          {activeTab === "files" && (
            <div className="media-section">
              {fileError && (
                <div style={{ color: "red", marginBottom: 8 }}>
                  {fileError}
                </div>
              )}

              <table className="user-backlinks-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center" }}>
                        No files uploaded.
                      </td>
                    </tr>
                  ) : (
                    files.map((f) => (
                      <tr key={f.id}>
                        <td>
                          <div className="file-name-cell">
                            {getFileTypeIcon(f)}
                            <span className="file-name-text">{f.name}</span>
                          </div>
                        </td>
                        <td>-</td>
                        <td>
                          <div className="url-row">
                            {f.url && (
                              <button
                                type="button"
                                className="url-icon-btn"
                                onClick={() => handleOpenFile(f)}
                                title="View file"
                              >
                                <AiOutlineEye />
                              </button>
                            )}

                            <button
                              type="button"
                              className="media-more-btn"
                              onClick={() =>
                                setFileMenuOpenId((prev) =>
                                  prev === f.id ? null : f.id
                                )
                              }
                              title="More options"
                            >
                              ...
                            </button>

                            {fileMenuOpenId === f.id && (
                              <div className="media-more-menu">
                                <button
                                  type="button"
                                  className="media-more-item action-menu-btn"
                                  onClick={() => openFileEdit(f)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="media-more-item action-menu-btn"
                                  onClick={() => openFileDelete(f)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
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

      {/* All the modals below stay the same */}
      {/* IMAGE UPLOAD MODAL */}
      {imageModalOpen && (
        <div className="modal-overlay">
          <div className="media-upload-modal-card">
            <div className="modal-header">
              <h3>Upload Images</h3>
              <span
                className="modal-close"
                onClick={() => {
                  setImageModalOpen(false);
                  setImageBaseName("");
                  setPendingImages([]);
                }}
              >
                ×
              </span>
            </div>
            <div className="modal-body">
              {imageError && (
                <div style={{ color: "red", marginBottom: 8 }}>
                  {imageError}
                </div>
              )}

              <div className="modal-field">
                <label>Image Name</label>
                <input
                  type="text"
                  value={imageBaseName}
                  onChange={(e) => setImageBaseName(e.target.value)}
                />
                {pendingImages.length > 0 && (
                  <ol style={{ marginTop: 8, fontSize: 13, paddingLeft: 18 }}>
                    {pendingImages.map((img) => (
                      <li key={img.id}>{img.name}</li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="modal-field">
                <label>Select Images (up to {MAX_IMAGES})</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFilesChange}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={async () => {
                    try {
                      if (!projectId) {
                        setImageError("Missing project id in URL.");
                        return;
                      }

                      const itemsWithData = await Promise.all(
                        pendingImages.map(async (img) => ({
                          projectId,
                          kind: "image",
                          name: img.name,
                          url: null,
                          dataUrl: img.file ? await fileToDataUrl(img.file) : null,
                        }))
                      );

                      const res = await fetch(
                        `${API_BASE_URL}/api/projects/${projectId}/media`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(itemsWithData),
                        }
                      );
                      if (!res.ok) {
                        throw new Error(`Failed to save images: ${res.status}`);
                      }
                      const saved = await res.json();

                      setImages((prev) => [
                        ...prev,
                        ...saved.map((m) => ({
                          id: m.id || m._id,
                          name: m.name,
                          url: m.dataUrl || m.url || "",
                        })),
                      ]);

                      setPendingImages([]);
                      setImageModalOpen(false);
                      setImageBaseName("");
                      setImageError("");
                    } catch (err) {
                      console.error(err);
                      setImageError(err.message || "Failed to save images");
                    }
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO URL MODAL */}
      {videoModalOpen && (
        <div className="modal-overlay">
          <div className="media-upload-modal-card">
            {/* ... unchanged ... */}
          </div>
        </div>
      )}

      {/* FILE UPLOAD MODAL */}
      {fileModalOpen && (
        <div className="modal-overlay">
          <div className="media-upload-modal-card">
            {/* ... unchanged ... */}
          </div>
        </div>
      )}

      {/* IMAGE DELETE CONFIRM, VIDEO EDIT, FILE EDIT, VIDEO DELETE, FILE DELETE */}
      {/* ... unchanged blocks here ... */}
    </div>
  );
}

export default ProjectMediaPage;