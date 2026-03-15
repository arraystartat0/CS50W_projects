import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import ApplyModal from "../components/modals/ApplyModal";
import "../assets/css/PublicPage.css";
import "../assets/css/LoadingSpinner.css";
import LoadingSpinner from "../components/LoadingSpinner";
import usePageLoading from "../hooks/usePageLoading";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function PublicCompany() {
  const { publicKey } = useParams(); // Changed from 'id' to 'publicKey'
  const [company, setCompany] = useState(null);
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [watchlistStatus, setWatchlistStatus] = useState({});
  const [watchlistLoading, setWatchlistLoading] = useState({});
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedPosting, setSelectedPosting] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState({});

  const { isAuthenticated, userType } = useAuth();

  const isPageLoading = usePageLoading([!loading, company, postings.length > 0], 800);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        // fetch the company details using the public key
        const companyResponse = await api.get(
          `/companies/public/${publicKey}/`
        );
        setCompany(companyResponse.data);
        const postingsResponse = await api.get(
          `/postings/?company_public_key=${publicKey}&status=Active`
        );
        setPostings(
          postingsResponse.data.results || postingsResponse.data || []
        );
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError("Sorry, we couldn't load the company information.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [publicKey]);

  // check watchlist status and application status for all postings
  useEffect(() => {
    if (isAuthenticated && postings.length > 0) {
      checkWatchlistStatus();
      checkApplicationStatus();
    }
  }, [isAuthenticated, postings]);

  const checkWatchlistStatus = async () => {
    try {
      const response = await api.get("/watchlist/");
      const watchlistItems = response.data;
      const status = {};
      postings.forEach((posting) => {
        status[posting.UID] = watchlistItems.some(
          (item) => item.posting.UID === posting.UID
        );
      });
      setWatchlistStatus(status);
    } catch (error) {
      console.error("Failed to check watchlist status:", error);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const status = {};
      for (const posting of postings) {
        const response = await api.get(
          `/applications/has_applied/?posting_uid=${posting.UID}`
        );
        status[posting.UID] = response.data.has_applied;
      }
      setApplicationStatus(status);
    } catch (error) {
      console.error("Failed to check application status:", error);
    }
  };

  const handleWatchlistToggle = async (postingUID) => {
    if (!isAuthenticated) {
      // redirect to login
      window.location.href = "/login";
      return;
    }

    setWatchlistLoading((prev) => ({ ...prev, [postingUID]: true }));
    try {
      if (watchlistStatus[postingUID]) {
        // remove from watchlist
        await api.delete("/watchlist/remove_from_watchlist/", {
          data: { posting_uid: postingUID },
        });
        setWatchlistStatus((prev) => ({ ...prev, [postingUID]: false }));
      } else {
        // add to watchlist
        await api.post("/watchlist/add_to_watchlist/", {
          posting_uid: postingUID,
        });
        setWatchlistStatus((prev) => ({ ...prev, [postingUID]: true }));
      }
    } catch (error) {
      console.error("Failed to update watchlist:", error);
      alert("Failed to update watchlist. Please try again.");
    } finally {
      setWatchlistLoading((prev) => ({ ...prev, [postingUID]: false }));
    }
  };

  const handleApply = async (formData) => {
    try {
      await api.post("/applications/", {
        ...formData,
        posting_uid: selectedPosting.UID,
      });
      alert("Application submitted successfully!");
      setApplicationStatus((prev) => ({
        ...prev,
        [selectedPosting.UID]: true,
      }));
    } catch (error) {
      console.error("Failed to submit application:", error);
      if (error.response?.data?.detail) {
        alert(`Failed to submit application: ${error.response.data.detail}`);
      } else {
        alert("Failed to submit application. Please try again.");
      }
      throw error;
    }
  };

  const openApplyModal = (posting) => {
    setSelectedPosting(posting);
    setApplyModalOpen(true);
  };

  if (isPageLoading) {
    return <LoadingSpinner message="Loading company profile..." />;
  }
  
  if (error)
    return (
      <div className="container my-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  const {
    name,
    description,
    website,
    city,
    state_province,
    country,
    is_verified,
    active_postings_count,
    total_postings_count,
    registration_number,
    incorporation_date,
  } = company;

  // format the location
  const formatLocation = () => {
    const locationParts = [city, state_province, country].filter(Boolean);
    return locationParts.length > 0
      ? locationParts.join(", ")
      : "Location not specified";
  };

  return (
    <>
      <NavBar />
      <div
        className="card-wrapper container mt-4 mb-5"
        style={{ minHeight: "60vh" }}
      >
        <h1 className="mb-3 fw-light text-center">Company Profile</h1>

        <div className="card shadow-sm rounded-0 border border-1 border-black">
          <div className="card-header bg-hireFlow-green rounded-0 text-black d-flex justify-content-between align-items-center">
            <h2 className="mb-0">{name}</h2>
          </div>

          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-8">
                <div className="mb-3">
                  <strong>About</strong>
                  <p className="text-muted mt-2">
                    {description ||
                      "No description available for this company."}
                  </p>
                </div>

                <div className="mb-3">
                  <strong>Location</strong>
                  <br />
                  <span className="text-muted">{formatLocation()}</span>
                </div>

                {registration_number && (
                  <div className="mb-3">
                    <strong>Registration Number</strong>
                    <br />
                    <span className="text-muted">{registration_number}</span>
                  </div>
                )}

                {incorporation_date && (
                  <div className="mb-3">
                    <strong>Date of Incorporation</strong>
                    <br />
                    <span className="text-muted">
                      {new Date(incorporation_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {website && (
                  <div className="mb-3">
                    <strong>Website</strong>
                    <br />
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      {website}
                    </a>
                  </div>
                )}
              </div>

              <div className="col-md-4">
                <div className="card bg-light border border-1 border-black rounded-0">
                  <div className="card-body text-center">
                    <h5 className="card-title">Company Stats</h5>
                    <div className="row">
                      <div className="col-6">
                        <h3 className="text-black">{active_postings_count}</h3>
                        <small className="text-muted">Active Listings</small>
                      </div>
                      <div className="col-6">
                        <h3 className="text-black">{total_postings_count}</h3>
                        <small className="text-muted">Total Listings</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="alert alert-warning text-center border border-1 border-black rounded-0">
                  <small className="text-black">
                    <i className="fa-solid fa-exclamation-triangle me-2"></i>
                    HireFlow doesn't verify the authenticity of companies yet. Please verify all information shown with the company's official pages before proceeding.
                  </small>
                </div>
              </div>
            </div>

            <hr />

            <section className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Current Job Listings</h5>
                <span className="badge bg-secondary">
                  {postings.length} active
                </span>
              </div>

              {postings.length > 0 ? (
                <div className="row">
                  {postings.map((posting) => (
                    <div key={posting.UID} className="col-md-6 mb-3">
                      <div className="card h-100 border border-1 border-black unround">
                        <div className="card-body">
                          <h6 className="card-title">{posting.title}</h6>
                          <p className="card-text text-muted small mb-2">
                            {posting.job_type} • {posting.location}
                          </p>
                          <p className="card-text small">
                            {posting.description.length > 100
                              ? `${posting.description.substring(0, 100)}...`
                              : posting.description}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted text-decoration-underline[">
                              {posting.is_paid
                                ? `${posting.pay_rate} ${
                                    posting.currency
                                  } ${posting.wage_type.toLowerCase()}`
                                : "Unpaid"}
                            </small>
                            <div className="d-flex gap-2">
                              <a
                                href={`/listing/${posting.UID}`}
                                className="btn btn-sm btn-hireFlow-green border border-1 border-black unround"
                              >
                                View Details
                              </a>

                              {isAuthenticated &&
                                userType === "applicant" &&
                                !applicationStatus[posting.UID] && (
                                  <button
                                    className="btn btn-sm btn-hireFlow-green unround border border-1 border-black"
                                    onClick={() => openApplyModal(posting)}
                                    title="Apply for this position"
                                  >
                                    <i className="fa-solid fa-paper-plane"></i>
                                  </button>
                                )}
                              {isAuthenticated &&
                                userType === "applicant" &&
                                applicationStatus[posting.UID] && (
                                  <button
                                    className="btn btn-sm btn-transparent unround border border-1 border-black"
                                    disabled
                                  >
                                    <span className="text-success">
                                      <i className="fa-solid fa-check-circle"></i>
                                    </span>
                                  </button>
                                )}

                              {isAuthenticated && userType === "applicant" && (
                                <button
                                  className={`btn btn-sm unround border border-1 border-black ${
                                    watchlistStatus[posting.UID]
                                      ? "btn-danger"
                                      : "btn-transparent hover-green"
                                  }`}
                                  onClick={() =>
                                    handleWatchlistToggle(posting.UID)
                                  }
                                  disabled={watchlistLoading[posting.UID]}
                                  title={
                                    watchlistStatus[posting.UID]
                                      ? "Remove from watchlist"
                                      : "Add to watchlist"
                                  }
                                >
                                  {watchlistLoading[posting.UID] ? (
                                    <i className="fa fa-spinner fa-spin"></i>
                                  ) : (
                                    <i
                                      className={`fa-solid ${
                                        watchlistStatus[posting.UID]
                                          ? "fa-eye-slash"
                                          : "fa-eye"
                                      }`}
                                    ></i>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">
                    No active job listings at the moment.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={applyModalOpen}
        posting={selectedPosting}
        onClose={() => setApplyModalOpen(false)}
        onSubmit={handleApply}
      />

      <Footer />
    </>
  );
}
