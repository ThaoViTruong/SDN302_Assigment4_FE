
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, Navigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { loginSuccess } from "../features/auth/authSlice";

function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useSelector((state) => state.auth);

  if (user && token) {
    return <Navigate to="/quizzes" replace />;
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/users/login", form);
      dispatch(loginSuccess(response.data));
      navigate(location.state?.from?.pathname || "/quizzes", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container d-flex justify-content-center align-items-center min-vh-100 py-4">
        <div className="card shadow-sm border-0 p-4 auth-card" style={{ width: "100%", maxWidth: "440px" }}>
          <p className="text-uppercase small text-primary fw-semibold mb-2">
            Assignment 4
          </p>
          <h2 className="mb-2">Quiz Application</h2>
          <p className="text-muted mb-4">
            Sign in to access your quizzes and continue your progress.
          </p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center mt-3 mb-0">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
