// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Adminlogin from "./components/Adminlogin";
import AdminDashboard from "./components/AdminDashboard";
import Adminuser from "./components/Adminuser";
import Adminproject from "./components/Adminproject";
import Admincategories from "./components/Admincategories";

import Userlogin from "./components/Userlogin";
import UserDashboard from "./components/UserDashboard";
import UserBacklinks from "./components/UserBacklinks";
import UserProjects from "./components/UserProjects";
import UserProjectSocialPage from "./components/UserProjectSocialPage";
import UserProjectInfoPage from "./components/UserProjectInfoPage";
import ProjectBacklinksPage from "./components/ProjectBacklinksPage";
import ProjectMediaPage from "./components/ProjectMediaPage";
import UserTools from "./components/usertool";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProtectedRoute from "./components/UserProtectedRoute";
function TitleManager() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // Basic mapping for your routes
    let pageTitle = "Backlink Analyzer";

    if (path === "/user/dashboard") pageTitle = "Home";
    else if (path === "/user/backlink") pageTitle = "Backlinks";
    else if (path === "/user/projects") pageTitle = "Projects";
    else if (path.startsWith("/user/projects") && path.endsWith("/backlinks"))
      pageTitle = "Backlinks";
    else if (path.startsWith("/user/projects") && path.endsWith("/media"))
      pageTitle = "Media";
    else if (path.startsWith("/user/projects") && path.endsWith("/info"))
      pageTitle = "Project Info";
    else if (path.startsWith("/user/projects") && path.endsWith("/social"))
      pageTitle = "Social";
    else if (path === "/user/categories") pageTitle = "Tool Collections";
    else if (path === "/admin/dashboard") pageTitle = "Admin Dashboard";
    else if (path === "/admin/users") pageTitle = "Admin Users";
    else if (path === "/admin/projects") pageTitle = "Admin Projects";
    else if (path === "/admin/categories") pageTitle = "Admin Categories";
    else if (path === "/user/login" || path === "/" || path === "/login")
      pageTitle = "Login";

    // Set the final document title
    document.title = pageTitle;
  }, [location.pathname]);

  return null;
}
function App() {
  return (
    <Router>
      <TitleManager/>
      <Routes>
        {/* User Login as default */}
        <Route path="/" element={<Userlogin />} />
        <Route path="/user/login" element={<Userlogin />} />

        {/* Admin Login (explicit path) */}
        <Route path="/admin/login" element={<Adminlogin />} />

        {/* Optional: keep /login but send to user login */}
        <Route path="/login" element={<Navigate to="/user/login" replace />} />

        {/* Admin Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <Adminuser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <ProtectedRoute>
              <Adminproject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute>
              <Admincategories />
            </ProtectedRoute>
          }
        />

        {/* User Protected Routes */}
        <Route
          path="/user/dashboard"
          element={
            <UserProtectedRoute>
              <UserDashboard />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/user/backlink"
          element={
            <UserProtectedRoute>
              <UserBacklinks />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/user/projects"
          element={
            <UserProtectedRoute>
              <UserProjects />
            </UserProtectedRoute>
          }
        />
        {/* Project Info (domain/bio/contact/custom attributes) */}
        <Route
          path="/user/projects/:projectId/info"
          element={
            <UserProtectedRoute>
              <UserProjectInfoPage />
            </UserProtectedRoute>
          }
        />

        {/* Project Social (Instagram only) */}
        <Route
          path="/user/projects/:projectId/social"
          element={
            <UserProtectedRoute>
              <UserProjectSocialPage />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/user/projects/:projectId/backlinks"
          element={
            <UserProtectedRoute>
              <ProjectBacklinksPage />
            </UserProtectedRoute>
          }
        />
         
        <Route
          path="/user/projects/:projectId/media"
          element={
            <UserProtectedRoute>
              <ProjectMediaPage />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/user/categories"
          element={
            <UserProtectedRoute>
              <UserTools />
            </UserProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;