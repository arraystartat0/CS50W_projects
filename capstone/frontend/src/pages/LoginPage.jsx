import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../assets/css/LoginPage.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "../assets/css/LoadingSpinner.css";
import LoadingSpinner from "../components/LoadingSpinner";
import usePageLoading from "../hooks/usePageLoading";

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isPageLoading = usePageLoading([], 600);

  const { login, isAuthenticated, userType: currentUserType } = useAuth();

  const [activeTab, setActiveTab] = useState("applicant");
  const [animateTab, setAnimateTab] = useState(""); // For tab animation
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (location.state?.role) {
      setActiveTab(location.state.role);
    }
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated) {
      switch (currentUserType) {
        case "admin":
          navigate("/admin");
          break;
        case "representative":
          navigate("/rep");
          break;
        case "applicant":
          navigate("/applicant");
          break;
        default:
          navigate("/");
      }
    }
  }, [isAuthenticated, currentUserType, navigate]);

  useEffect(() => {
    setAnimateTab("tab-transition");
    const timer = setTimeout(() => setAnimateTab(""), 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Unified form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password, activeTab);

      if (result.success) {
        console.log("Login successful.");
      } else {
        console.log("Login failed:", result.error);
        setError(
          result.error || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      console.error("An unexpected error occurred during login process:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Clear errors and fields when switching tabs
    setError("");
    setEmail("");
    setPassword("");
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  // Props to pass down to form components
  const formProps = {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleSubmit,
  };

  if (isPageLoading) {
    return <LoadingSpinner message="Loading login page..." />;
  }

  return (
    <>
      <NavBar />
      <div className="card-wrapper">
        <div className="center-card border border-1 border-black rounded-1">
          <h2 className="card-heading fw-light">Login to your account</h2>

          <div className="tab-nav">
            <button
              className={`tab-btn ${
                activeTab === "applicant" ? "active" : "fw-light"
              }`}
              onClick={() => handleTabClick("applicant")}
            >
              Applicant Portal
            </button>
            <button
              className={`tab-btn ${
                activeTab === "representative" ? "active" : "fw-light"
              }`}
              onClick={() => handleTabClick("representative")}
            >
              Representative Portal
            </button>
            <button
              className={`tab-btn ${
                activeTab === "admin" ? "active" : "fw-light"
              }`}
              onClick={() => handleTabClick("admin")}
            >
              Admin Portal
            </button>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}

          <div className={`tab-content-area ${animateTab}`}>
            {activeTab === "applicant" && (
              <LoginForm {...formProps} userType="Applicant" />
            )}
            {activeTab === "representative" && (
              <LoginForm {...formProps} userType="Representative" />
            )}
            {activeTab === "admin" && (
              <LoginForm {...formProps} userType="Admin" />
            )}
          </div>
          <div className="mt-3">
            <p>
              Not registered yet? Register <a href="register/applicant">here <i class="fa-solid fa-arrow-up-right-from-square fa-2xs"></i>.</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// Reusable Login Form Component
function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  handleSubmit,
  userType,
}) {
  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="mb-3">
        <label className="form-label fw-light">Email Address</label>
        <input
          type="email"
          className="form-control rounded-0 border border-1 border-black"
          placeholder={`${userType.toLowerCase()} email`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="mb-3">
        <label className="form-label fw-light">Password</label>
        <input
          type="password"
          className="form-control rounded-0 border border-1 border-black"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      <button
        type="submit"
        className="btn btn-fillGreen border border-1 border-black w-100 transition-icon"
        disabled={loading}
      >
        {loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Signing in...
          </>
        ) : (
          <>
            <span>Login as {userType}</span>
            <i className="fa-solid fa-chevron-right ms-2 icon-default"></i>
            <i className="fa-solid fa-arrow-right ms-2 icon-hover"></i>
          </>
        )}
      </button>
    </form>
  );
}

export default LoginPage;
