import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children, adminOnly = false }) {
  const location = useLocation();
  const { user, token } = useSelector((state) => state.auth);

  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !user.admin) {
    return <Navigate to="/quizzes" replace />;
  }

  return children;
}

export default ProtectedRoute;
