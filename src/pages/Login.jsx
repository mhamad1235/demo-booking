import React, { useState, useContext } from "react";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";

import "../auth.css"; // for a few custom color overrides

const Login = () => {
  const { login } = useContext(AuthContext);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosClient.post("/auth/login", { phone, password });

      if (response.data.result) {
        const { access_token, user } = response.data.data;
        login(user, access_token);
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-light vh-100">
      <div className="card shadow-lg border-0 p-4 w-100" style={{ maxWidth: "420px" }}>
        <div className="text-center mb-4">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <span className="fs-2">🏨</span>
            <h1 className="m-0 fw-bold text-dark">LuxStay</h1>
          </div>
          <h5 className="fw-semibold text-dark">Welcome Back</h5>
          <p className="text-muted mb-0">Sign in to your account</p>
        </div>

        {error && (
          <div className="alert alert-danger text-center py-2" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="phone" className="form-label fw-semibold">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              className="form-control form-control-lg"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-control form-control-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 custom-btn"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="mb-0">
            Don't have an account?{" "}
            <a href="/register" className="fw-semibold text-primary text-decoration-none">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
