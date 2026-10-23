import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { hasAdminAccess } from "../utils/auth";

function AppLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = hasAdminAccess(user);
  const displayInitial = user?.username?.charAt(0)?.toUpperCase() || "U";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const content = children || <Outlet />;

  return (
    <div className="app-shell bg-light min-vh-100">
      <nav className="app-navbar shadow-sm">
        <div className="app-navbar-inner">
          <NavLink className="app-brand" to="/quizzes">
            Quiz Application
          </NavLink>

          {isAdmin && (
            <div className="app-nav-links">
              <NavLink
                className={({ isActive }) =>
                  `app-nav-link ${isActive ? "active" : ""}`
                }
                to="/quizzes"
              >
                Home
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `app-nav-link ${isActive ? "active" : ""}`
                }
                to="/admin/quizzes"
              >
                Manage Quizzes
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `app-nav-link ${isActive ? "active" : ""}`
                }
                to="/admin/questions"
              >
                Manage Questions
              </NavLink>
            </div>
          )}

          <div className="app-navbar-actions">
            {isAdmin && (
              <div className="app-status-dot" aria-hidden="true" />
            )}
            <div className="app-user-pill">
              <span className="app-avatar">{displayInitial}</span>
              <span className="app-user-text">
                {user?.username}
                {isAdmin ? " (Admin)" : ""}
              </span>
            </div>

            <button
              type="button"
              className="app-logout-btn"
              onClick={handleLogout}
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="app-content">{content}</main>
    </div>
  );
}

export default AppLayout;
