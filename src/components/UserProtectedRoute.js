// UserProtectedRoute.js
import { Navigate, useLocation } from "react-router-dom";

function UserProtectedRoute({ children }) {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isUserLoggedIn");

  if (!isLoggedIn) {
    return <Navigate to="/user/login" state={{ from: location }} replace />;
  }

  return children;
}

export default UserProtectedRoute;