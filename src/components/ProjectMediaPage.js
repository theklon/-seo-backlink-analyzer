// src/components/ProjectMediaPage.js
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

import logo from "../assets/klonlogo.png";
import { API_BASE_URL } from "../api";

import { HiOutlineHome } from "react-icons/hi";
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

  // Edit / delete popups for videos/files (state kept for future use if needed)
  const [videoEditTarget, setVideoEditTarget] = useState(null);
  const [videoEditName, setVideoEditName] = useState("");
  const [videoEditUrl, setVideoEditUrl] = useState("");

  const [fileEditTarget, setFileEditTarget] = useState(null);
  const [fileEditName, setFileEditName] = useState("");

  const [videoDeleteTarget, setVideoDeleteTarget] = useState(null);
  const [fileDeleteTarget, setFileDeleteTarget] = useState(null);

  // FILE EDIT: rename via prompt + update local state
  const openFileEdit = (file) => {
    setFileEditTarget(file);
    setFileEditName(file.name || "");
    setFileMenuOpenId(null);

    const currentName = file.name || "";
    const newName = window.prompt("Edit file name", currentName);

    if (!newName) {
      return;
    }

    const trimmed = newName.trim();
    if (!trimmed || trimmed === currentName.trim()) {
      return;
    }

    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, name: trimmed } : f))
    );
  };

  // FILE DELETE: confirm + backend delete + remove from state
  const openFileDelete = async (file) => {
    setFileDeleteTarget(file);
    setFileMenuOpenId(null);

    const ok = window.confirm(`Delete file "${file.name}"?`);
    if (!ok) return;

    try {
      if (projectId && file.id) {
        const res = await fetch(
          `${API_BASE_URL}/api/projects/${projectId}/media/${file.id}`,
          { method: "DELETE" }
        );
        if (!res.ok) {
          const body = await res.text();
          console.error("file delete error body:", body);
        }
      }
    } catch (e) {
      console.error("Failed to delete file", e);
    }

    setFiles((prev) => prev.filter((f) => f.id !== file.id));
  };

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

  // ==== NEW: file-type detection + icons ====
  const getFileExtension = (file) => {
    if (!file) return "";
    // 1) Try from name
    if (file.name && file.name.includes(".")) {
      return file.name.split(".").pop().toLowerCase();
    }

    // 2) Try from data URL MIME type
    if (file.url && typeof file.url === "string" && file.url.startsWith("data:")) {
      const match = file.url.match(/^data:(.*?);/);
      if (match && match[1]) {
        const mime = match[1].toLowerCase();
        if (mime.includes("pdf")) return "pdf";
        if (mime.includes("word") || mime.includes("msword") || mime.includes("officedocument")) {
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
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext) || ext === "image") {
      return <AiOutlineFileImage className="file-type-icon" />;
    }
    if (["txt", "md"].includes(ext) || ext === "txt") {
      return <AiOutlineFileText className="file-type-icon" />;
    }

    // default icon
    return <AiOutlineFile className="file-type-icon" />;
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // ===== rest of image / video / file upload handlers, modals etc. remain as before =====
  // (not shown here if you trimmed them out earlier)

  // ========== RENDER ==========
  return (
    <div className="dashboard-root user-dashboard">
      {/* TOP BAR */}
      {/* ... your existing top bar / sidebar / breadcrumbs / tabs / images & videos sections ... */}

      {/* Files tab – table */}
      {activeTab === "files" && (
        <div className="media-section">
          {fileError && (
            <div style={{ color: "red", marginBottom: 8 }}>{fileError}</div>
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
                    {/* ICON + NAME here */}
                    <td>
                      <div className="file-name-cell">
                        {getFileTypeIcon(f)}
                        <span className="file-name-text">{f.name}</span>
                      </div>
                    </td>
                    <td>-</td>
                    <td>
                      <div className="url-row">
                        {/* Eye: open file */}
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

                        {/* Three dots menu */}
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

      {/* IMAGE UPLOAD MODAL, VIDEO MODAL, FILE UPLOAD MODAL, DELETE CONFIRMS */}
      {/* ... keep the rest of your existing JSX unchanged ... */}
    </div>
  );
}

export default ProjectMediaPage;