
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../services/api";

function Signup() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  if (user && token) {
    return <Navigate to="/quizzes" replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await api.post("/users/register", form);
      setMessage("Registration successful! Redirecting to login...");

      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container d-flex justify-content-center align-items-center min-vh-100 py-4">
        <div className="card shadow-sm border-0 p-4 auth-card" style={{ width: "100%", maxWidth: "440px" }}>
          <p className="text-uppercase small text-success fw-semibold mb-2">
            Assignment 4
          </p>
          <h2 className="mb-2">Create Your Account</h2>
          <p className="text-muted mb-4">
            Register with a username and password to start taking quizzes.
          </p>

          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a username"
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
                minLength={6}
                placeholder="Create a password"
                required
              />
              <div className="form-text">
                Password must contain at least 6 characters.
              </div>
            </div>

            <button
              className="btn btn-success w-100"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center mt-3 mb-0">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
