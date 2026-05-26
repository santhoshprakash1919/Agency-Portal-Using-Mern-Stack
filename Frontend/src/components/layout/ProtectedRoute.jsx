import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";
import Skeleton from "../ui/Skeleton.jsx";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ padding: "2rem" }}>
        <Skeleton height={280} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
