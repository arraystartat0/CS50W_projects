import React, { lazy, Suspense, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../assets/css/rep/Dashboard.css";
import "../../assets/css/LoadingSpinner.css";
import LoadingSpinner from "../../components/LoadingSpinner";
import usePageLoading from "../../hooks/usePageLoading";
import TopNav from "../../components/topnavs/rep/TopNav";
import SignoutButton from "../../components/buttons/SignoutButton";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

// Lazy load the sidebar for desktop
const AdminSidebar = lazy(() =>
  import("../../components/sidebars/admin/AdminSidebar")
);
import MenuList from "../../components/sidebars/admin/MenuList";

const Dashboard = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteForm, setInviteForm] = useState({ email: "", last_name: "" });
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [copiedStates, setCopiedStates] = useState({});
  const [viewInviteDetails, setViewInviteDetails] = useState(null);

  const { isAuthenticated } = useAuth();

  const isPageLoading = usePageLoading(
    [!loading, dashboardData, isAuthenticated],
    1000
  );

  // Listen for window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const response = await api.get("/admin/");
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  // Toggle mobile menu modal
  const toggleModal = () => setIsModalOpen((prev) => !prev);

  //Toggle invite modal
  const toggleInviteModal = () => setIsInviteModalOpen((prev) => !prev);

  // Toggle delete modal
  const toggleDeleteModal = (representative = null) => {
    setSelectedItem(representative);
    setIsDeleteModalOpen((prev) => !prev);
  };

  // Toggle revoke modal
  const toggleRevokeModal = (invitation = null) => {
    setSelectedItem(invitation);
    setIsRevokeModalOpen((prev) => !prev);
  };

  // View invitation details
  const viewInvitationDetails = (invitation) => {
    setViewInviteDetails(invitation);
  };

  // Toggle private key visibility
  const togglePrivateKey = () => {
    setShowPrivateKey((prev) => !prev);
  };

  // Copy text to clipboard with fallback for mobile devices
  const handleCopy = async (text, key) => {
    try {
      // Try the modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers and mobile devices
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
        } catch (err) {
          console.error("Fallback copy failed:", err);
        }

        document.body.removeChild(textArea);
      }

      setCopiedStates((prev) => ({ ...prev, [key]: true }));

      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  // handle invite form submission
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(
        "/admin/generate_invitation/",
        inviteForm
      );
      setGeneratedInvite(response.data.invitation);
      setInviteForm({ email: "", last_name: "" });
      toggleInviteModal();
      // refresh dashboard data
      const dashboardResponse = await api.get("/admin/");
      setDashboardData(dashboardResponse.data);
    } catch (err) {
      console.error("Failed to generate invitation:", err);
      alert(err.response?.data?.error || "Failed to generate invitation");
    }
  };

  // handle representative deletion
  const handleDeleteRepresentative = async () => {
    try {
      await api.post("/admin/delete_representative/", {
        representative_id: selectedItem.id,
      });
      toggleDeleteModal();
      // Refresh dashboard data
      const dashboardResponse = await api.get("/admin/");
      setDashboardData(dashboardResponse.data);
    } catch (err) {
      console.error("Failed to delete representative:", err);
      alert(err.response?.data?.error || "Failed to delete representative");
    }
  };

  // handle invitation revocation process
  const handleRevokeInvitation = async () => {
    try {
      await api.delete("/admin/revoke_invitation/", {
        data: { invitation_id: selectedItem.id },
      });
      toggleRevokeModal();
      // refresh the dashboard data
      const dashboardResponse = await api.get("/admin/");
      setDashboardData(dashboardResponse.data);
    } catch (err) {
      console.error("Failed to revoke invitation:", err);
      alert(err.response?.data?.error || "Failed to revoke invitation");
    }
  };

  const location = useLocation();

  if (isPageLoading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  if (error) {
    return (
      <div className="rep-dashboard">
        <div className="dashboard-content">
          <div className="container mt-5">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rep-dashboard">
        <div className="dashboard-content">
          <div className="container mt-5">
            <div className="alert alert-warning" role="alert">
              Please log in to view your dashboard.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const adminDetails = dashboardData?.admin_details;
  const companyDetails = dashboardData?.company_details;
  const representatives = dashboardData?.representatives || [];
  const invitations = dashboardData?.invitations || [];
  const stats = dashboardData?.stats;

  return (
    <div className="rep-dashboard">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Suspense fallback={<div>Loading Sidebar...</div>}>
          <AdminSidebar />
        </Suspense>
      )}
      <div className="dashboard-content">
        {isMobile && (
          <div className="text-center mb-3">
            <a className="companyFont text-black text-decoration-none" href="/">
              HireFlow
            </a>
          </div>
        )}
        {/* Header with Dashboard title and right-aligned hamburger menu for mobile */}
        <TopNav />
        <div className="dashboard-header d-flex align-items-center justify-content-between px-0 my-2 my-md-0">
          <h2 className="m-0 fw-light fs-5 d-block d-md-none">Dashboard</h2>
          {isMobile && (
            <div className="mobile-header-icons d-flex align-items-center">
              <SignoutButton />
              <button
                className="hamburger-menu text-dark"
                onClick={toggleModal}
              >
                <i className="fa fa-bars"></i>
              </button>
            </div>
          )}
        </div>

        {isMobile && isModalOpen && (
          <div className="mobile-menu-modal" onClick={toggleModal}>
            <div
              className="mobile-menu-content border border-2 border-black"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-menu-header d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">Menu</h5>
                <button className="btn" onClick={toggleModal}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <MenuList />
            </div>
          </div>
        )}

        {/* Admin Greeting */}
        <div className="container-fluid pb-0 pb-md-4 pt-2">
          <div className="row align-items-bottom">
            <div className="col-lg-8 col-12 mb-4 ps-0 mb-lg-0">
              <span className="text-muted fw-light small-text">
                <p>Hello,</p>
              </span>
              <h3 className="dashboard-title mb-0">
                {adminDetails?.first_name} {adminDetails?.last_name}
              </h3>
              <div className="mt-3">
                <div className="row">
                  <div className="col-12 col-md-6 mb-2">
                    <small className="text-muted">Email</small>
                    <p className="mb-1">{adminDetails?.email}</p>
                  </div>
                  {adminDetails?.phone && (
                    <div className="col-12 col-md-6 mb-2">
                      <small className="text-muted">Phone</small>
                      <p className="mb-1">{adminDetails.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="col-lg-4 col-12 d-none d-md-block">
              <div className="d-flex justify-content-lg-end gap-5 stats">
                <div className="stat-card d-flex">
                  <div className="icon-label d-flex flex-column align-items-end align-self-end pe-2">
                    <div className="border border-black border-1 unround px-2 py-1 rounded-2 bg-opacity-25">
                      <i className="fa-solid fa-briefcase" />
                    </div>
                    <small className="stat-label text-muted">Postings</small>
                  </div>
                  <div className="stat-value-container d-flex align-items-center">
                    <span className="stat-value">
                      {stats?.total_postings || 0}
                    </span>
                  </div>
                </div>
                <div className="stat-card d-flex">
                  <div className="icon-label d-flex flex-column align-items-end align-self-end pe-2">
                    <div className="border border-black border-1 unround px-2 py-1 rounded-2 bg-opacity-25">
                      <i className="fa-solid fa-users" />
                    </div>
                    <small className="stat-label text-muted">Reps</small>
                  </div>
                  <div className="stat-value-container d-flex align-items-center">
                    <span className="stat-value">{representatives.length}</span>
                  </div>
                </div>
                <div className="stat-card d-flex">
                  <div className="icon-label d-flex flex-column align-items-end align-self-end pe-2">
                    <div className="border border-black border-1 unround px-2 py-1 rounded-2 bg-opacity-25">
                      <i className="fa-solid fa-envelope" />
                    </div>
                    <small className="stat-label text-muted">Invites</small>
                  </div>
                  <div className="stat-value-container d-flex align-items-center">
                    <span className="stat-value">{invitations.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats */}
        {isMobile && (
          <div className="container-fluid">
            <div className="row gap-2 mb-2">
              <div className="col-12 d-flex flex-column align-items-center border border-1 border-black rounded-2 mobile-stat-card">
                <div className="d-flex align-items-center">
                  <i className="fa-solid fa-briefcase fa-xs me-1" />
                  <span className="mobile-stat-value">
                    {stats?.total_postings || 0}
                  </span>
                </div>
                <small className="small-text text-muted text-center">
                  Postings
                </small>
              </div>
              <div className="col-12 d-flex flex-column align-items-center border border-1 border-black rounded-2 mobile-stat-card">
                <div className="d-flex align-items-center">
                  <i className="fa-solid fa-users fa-xs me-1" />
                  <span className="mobile-stat-value">
                    {representatives.length}
                  </span>
                </div>
                <small className="small-text text-muted text-center">
                  Reps
                </small>
              </div>
              <div className="col-12 d-flex flex-column align-items-center border border-1 border-black rounded-2 mobile-stat-card">
                <div className="d-flex align-items-center">
                  <i className="fa-solid fa-envelope fa-xs me-1" />
                  <span className="mobile-stat-value">
                    {invitations.length}
                  </span>
                </div>
                <small className="small-text text-muted text-center">
                  Invites
                </small>
              </div>
            </div>
          </div>
        )}

        <div className="container-fluid px-0">
          {/* Company Details */}
          <div className="row mb-2">
            <div className="col-12 mb-2">
              <div className="dashboard-section">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="text-muted fw-light mb-0">Company Details</h3>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <h5>{companyDetails?.name}</h5>
                    {companyDetails?.description && (
                      <p className="text-muted">{companyDetails.description}</p>
                    )}
                    <div className="row">
                      <div className="col-6">
                        <small className="text-muted">Public Key</small>
                        <p className="mb-1">{companyDetails?.public_key}</p>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Private Key</small>
                        <div className="d-flex align-items-center gap-2">
                          <p className="mb-1">
                            {showPrivateKey
                              ? companyDetails?.private_key
                              : "******"}
                          </p>
                          <button
                            type="button"
                            className="btn btn-sm border border-1 border-black unround"
                            onClick={togglePrivateKey}
                          >
                            <i
                              className={`fa-solid ${
                                showPrivateKey ? "fa-eye-slash" : "fa-eye"
                              }`}
                            ></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="row">
                      {companyDetails?.website && (
                        <div className="col-12 mb-2">
                          <small className="text-muted">Website</small>
                          <p className="mb-1">{companyDetails.website}</p>
                        </div>
                      )}
                      {companyDetails?.email && (
                        <div className="col-6 mb-2">
                          <small className="text-muted">Email</small>
                          <p className="mb-1">{companyDetails.email}</p>
                        </div>
                      )}
                      {companyDetails?.phone && (
                        <div className="col-6 mb-2">
                          <small className="text-muted">Phone</small>
                          <p className="mb-1">{companyDetails.phone}</p>
                        </div>
                      )}
                      {companyDetails?.address && (
                        <div className="col-12 mb-2">
                          <small className="text-muted">Address</small>
                          <p className="mb-1">{companyDetails.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Representatives and Invitations */}
          <div className="row mb-2">
            <div className="col-12 col-md-6 mb-2">
              <div className="dashboard-section">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="text-muted fw-light mb-0">
                    Current Representatives
                  </h3>
                </div>
                {representatives.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {representatives.map((rep) => (
                          <tr key={rep.id}>
                            <td>
                              {rep.first_name} {rep.last_name}
                            </td>
                            <td>{rep.email}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-danger unround"
                                onClick={() => toggleDeleteModal(rep)}
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">No representatives found.</p>
                )}
              </div>
            </div>
            <div className="col-12 col-md-6 mb-2">
              <div className="dashboard-section">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="text-muted fw-light mb-0">Invitations</h3>
                  <button
                    className="btn btn-sm btn-hireFlow-green border border-1 border-black unround"
                    onClick={toggleInviteModal}
                  >
                    <i className="fa-solid fa-plus me-1"></i>
                    New Invite
                  </button>
                </div>
                {invitations.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Email</th>
                          <th>Last Name</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invitations.map((inv) => (
                          <tr key={inv.id}>
                            <td>{inv.email}</td>
                            <td>{inv.last_name}</td>
                            <td>
                              <span
                                className={`badge ${
                                  inv.is_accepted
                                    ? "bg-active"
                                    : "bg-black"
                                }`}
                              >
                                {inv.is_accepted ? "Accepted" : "Pending"}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-sm btn-hireFlow-green border border-1 border-black unround"
                                  onClick={() => viewInvitationDetails(inv)}
                                  title="View Details"
                                >
                                  <i className="fa-solid fa-eye"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger unround"
                                  onClick={() => toggleRevokeModal(inv)}
                                  disabled={inv.is_accepted}
                                  title="Revoke Invitation"
                                >
                                  <i className="fa-solid fa-times"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">No invitations found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="modal-overlay" onClick={toggleInviteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Generate New Invitation</h4>
              <button className="btn" onClick={toggleInviteModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleInviteSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={inviteForm.last_name}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, last_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn border border-1 border-black unround"
                  onClick={toggleInviteModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-hireFlow-green border border-1 border-black unround"
                >
                  Generate Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={toggleDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Confirm Deletion</h4>
              <button className="btn" onClick={toggleDeleteModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <p>
              Are you sure you want to delete {selectedItem.first_name}{" "}
              {selectedItem.last_name}?
            </p>
            <p className="text-muted small">This action cannot be undone.</p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={toggleDeleteModal}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteRepresentative}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Confirmation Modal */}
      {isRevokeModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={toggleRevokeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Confirm Revocation</h4>
              <button className="btn" onClick={toggleRevokeModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <p>
              Are you sure you want to revoke the invitation for{" "}
              {selectedItem.email}?
            </p>
            <p className="text-muted small">This action cannot be undone.</p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={toggleRevokeModal}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleRevokeInvitation}
              >
                Yes, Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Invite Modal */}
      {generatedInvite && (
        <div className="modal-overlay" onClick={() => setGeneratedInvite(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Invitation Generated Successfully!</h4>
              <button className="btn" onClick={() => setGeneratedInvite(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="bg-light p-3 border border-1 border-black rounded-1 mb-3">
              <h6 className="fw-bold mb-2">Invitation Details</h6>
              <p className="mb-2">
                <strong>Email:</strong> {generatedInvite.email}
              </p>
              <p className="mb-2">
                <strong>Last Name:</strong> {generatedInvite.last_name}
              </p>
              <p className="mb-2">
                <strong>Invited At:</strong> {generatedInvite.invited_at}
              </p>
            </div>

            <div className="bg-light p-3 border border-1 border-black rounded-1 mb-3">
              <h6 className="fw-bold mb-2">Invitation Token</h6>
              <p className="text-muted small mb-2">
                Share this token with the representative. It's a one-time use
                invitation.
              </p>
              <div className="d-flex align-items-center gap-2 mb-2">
                <code
                  className="flex-grow-1"
                  style={{ fontSize: "0.9rem", wordBreak: "break-all" }}
                >
                  {generatedInvite.invitation_token}
                </code>
                <button
                  className="btn btn-sm border border-1 border-black unround"
                  onClick={() =>
                    handleCopy(generatedInvite.invitation_token, "invite-token")
                  }
                >
                  <i
                    className={`fa-solid ${
                      copiedStates["invite-token"] ? "fa-check" : "fa-copy"
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="bg-light p-3 border border-1 border-black rounded-1 mb-3">
              <h6 className="fw-bold mb-2">Private Key Required</h6>
              <p className="text-muted small mb-2">
                The representative will also need the company's private key to
                register.
              </p>
              <div className="d-flex align-items-center gap-2">
                <code
                  className="flex-grow-1"
                  style={{ fontSize: "0.9rem", wordBreak: "break-all" }}
                >
                  {companyDetails?.private_key}
                </code>
                <button
                  className="btn btn-sm border border-1 border-black unround"
                  onClick={() =>
                    handleCopy(companyDetails?.private_key, "private-key")
                  }
                >
                  <i
                    className={`fa-solid ${
                      copiedStates["private-key"] ? "fa-check" : "fa-copy"
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-end">
              <button
                className="btn btn-hireFlow-green border border-1 border-black unround"
                onClick={() => setGeneratedInvite(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Invitation Details Modal */}
      {viewInviteDetails && (
        <div
          className="modal-overlay"
          onClick={() => setViewInviteDetails(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Invitation Details</h4>
              <button
                className="btn"
                onClick={() => setViewInviteDetails(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="bg-light p-3 border border-1 border-black rounded-1 mb-3">
              <h6 className="fw-bold mb-2">Invitation Details</h6>
              <p className="mb-2">
                <strong>Email:</strong> {viewInviteDetails.email}
              </p>
              <p className="mb-2">
                <strong>Last Name:</strong> {viewInviteDetails.last_name}
              </p>
              <p className="mb-2">
                <strong>Status:</strong>{" "}
                <span
                  className={`badge px-2 py-1 ${
                    viewInviteDetails.is_accepted
                      ? "bg-active"
                      : "bg-black"
                  }`}
                >
                  {viewInviteDetails.is_accepted ? "Accepted" : "Pending"}
                </span>
              </p>
              {viewInviteDetails.invitation_token && (
                <p className="mb-2">
                  <strong>Invitation Token:</strong>{" "}
                  {viewInviteDetails.invitation_token}
                </p>
              )}
              {viewInviteDetails.invited_at && (
                <p className="mb-2">
                  <strong>Invited At:</strong> {viewInviteDetails.invited_at}
                </p>
              )}
            </div>

            <div className="bg-light p-3 border border-1 border-black rounded-1 mb-3">
              <h6 className="fw-bold mb-2">Private Key Required</h6>
              <p className="text-muted small mb-2">
                The representative will also need the company's private key to
                register.
              </p>
              <div className="d-flex align-items-center gap-2">
                <code
                  className="flex-grow-1"
                  style={{ fontSize: "0.9rem", wordBreak: "break-all" }}
                >
                  {companyDetails?.private_key}
                </code>
                <button
                  className="btn btn-sm border border-1 border-black unround"
                  onClick={() =>
                    handleCopy(companyDetails?.private_key, "private-key-view")
                  }
                >
                  <i
                    className={`fa-solid ${
                      copiedStates["private-key-view"] ? "fa-check" : "fa-copy"
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-end">
              <button
                className="btn btn-hireFlow-green border border-1 border-black unround"
                onClick={() => setViewInviteDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
