// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Login */}
        <Route path="/" element={<Adminlogin />} />
        <Route path="/login" element={<Adminlogin />} />

        {/* User Login */}
        <Route path="/user/login" element={<Userlogin />} />

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
            <ProtectedRoute>
              <UserProjectInfoPage />
            </ProtectedRoute>
          }
        />

        {/* Project Social (Instagram only) */}
        <Route
          path="/user/projects/:projectId/social"
          element={
            <ProtectedRoute>
              <UserProjectSocialPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/projects/:projectId/backlinks"
          element={
            <ProtectedRoute>
              <ProjectBacklinksPage />
            </ProtectedRoute>
          }
        />
         
        <Route
          path="/user/projects/:projectId/media"
          element={
            <ProtectedRoute>
              <ProjectMediaPage />
            </ProtectedRoute>
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