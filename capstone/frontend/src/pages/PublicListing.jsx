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

export default function PostingDetails() {
  const { uid } = useParams();
  const [posting, setPosting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  const { isAuthenticated, userType } = useAuth();

  const isPageLoading = usePageLoading([!loading, posting], 800);

  useEffect(() => {
    api
      .get(`/postings/public/${uid}/`)
      .then((resp) => setPosting(resp.data))
      .catch(() => setError("Sorry, we couldn't load that listing."))
      .finally(() => setLoading(false));
  }, [uid]);

  // check if posting is in user's watchlist and if user has applied
  useEffect(() => {
    if (isAuthenticated && posting) {
      checkWatchlistStatus();
      checkApplicationStatus();
    }
  }, [isAuthenticated, posting]);

  const checkWatchlistStatus = async () => {
    try {
      const response = await api.get("/watchlist/");
      const watchlistItems = response.data;
      const isWatched = watchlistItems.some((item) => item.posting.UID === uid);
      setIsInWatchlist(isWatched);
    } catch (error) {
      console.error("Failed to check watchlist status:", error);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await api.get(
        `/applications/has_applied/?posting_uid=${uid}`
      );
      setHasApplied(response.data.has_applied);
    } catch (error) {
      console.error("Failed to check application status:", error);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      // redirect to login or show login modal
      window.location.href = "/login";
      return;
    }

    setWatchlistLoading(true);
    try {
      if (isInWatchlist) {
        // remove from watchlist
        await api.delete("/watchlist/remove_from_watchlist/", {
          data: { posting_uid: uid },
        });
        setIsInWatchlist(false);
      } else {
        // add to watchlist
        await api.post("/watchlist/add_to_watchlist/", {
          posting_uid: uid,
        });
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error("Failed to update watchlist:", error);
      alert("Failed to update watchlist. Please try again.");
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleApply = async (formData) => {
    try {
      await api.post("/applications/", {
        ...formData,
        posting_uid: uid,
      });
      alert("Application submitted successfully!");
      setHasApplied(true);
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

  if (isPageLoading) {
    return <LoadingSpinner message="Loading listing details..." />;
  }

  if (error)
    return (
      <div className="container my-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  const {
    title,
    company,
    location,
    start_date,
    end_date,
    is_paid,
    pay_rate,
    currency,
    wage_type,
    job_type,
    description,
    additional_info,
    documents_needed,
  } = posting;

  return (
    <>
      <NavBar />
      <div
        className="card-wrapper container mt-4 mb-5"
        style={{ minHeight: "60vh" }}
      >
        <h1 className="mb-3 fw-light text-center">Listing Details</h1>
        <div className="card shadow-sm rounded-0 border border-1 border-black">
          <div className="card-header bg-hireFlow-green rounded-0 text-black">
            <h2 className="mb-0">{title}</h2>
          </div>

          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Company</strong>
                  <br />
                  <a
                    href={`/company/${company.public_key}`}
                    className="text-muted text-decoration-underline"
                  >
                    {company.name}
                  </a>
                </p>
                <p className="mb-1">
                  <strong>Job Type</strong>
                  <br />
                  <span className="text-muted">{job_type}</span>
                </p>
                <p className="mb-1">
                  <strong>Location</strong>
                  <br />
                  <span className="text-muted"> {location}</span>
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Dates</strong>
                  <br />
                  <span className="text-muted">
                    {new Date(start_date).toLocaleDateString()} to{" "}
                    {new Date(end_date).toLocaleDateString()}
                  </span>
                </p>
                <p className="mb-1">
                  <strong>Pay</strong>
                  <br />
                  <span className="text-muted">
                    {is_paid
                      ? `${pay_rate} ${currency} ${wage_type.toLowerCase()}`
                      : "Unpaid"}
                  </span>
                </p>
              </div>
            </div>

            <hr />

            <section className="mb-4">
              <h5>Description</h5>
              <p className="text-justify">{description}</p>
            </section>

            {additional_info && (
              <section className="mb-0">
                <h5>Additional Info</h5>
                <p className="text-justify">{additional_info}</p>
              </section>
            )}
            {documents_needed && documents_needed.length > 0 && (
              <section className="mb-4">
                <h5>Documents Needed</h5>
                <ul className="text-muted">
                  {documents_needed.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-4 pt-3 border-top">
              <div className="d-flex justify-content-center gap-3">
                {isAuthenticated && userType === "applicant" && !hasApplied && (
                  <button
                    className="btn btn-hireFlow-green unround border border-1 border-black"
                    onClick={() => setApplyModalOpen(true)}
                  >
                    <i className="fa-solid fa-paper-plane me-2"></i>
                    Apply Now
                  </button>
                )}
                {isAuthenticated && userType === "applicant" && hasApplied && (
                  <div className="text-center">
                    <p className="text-muted mb-2">
                      <i className="fa-solid fa-check-circle me-2 text-success"></i>
                      You have already applied to this position
                    </p>
                  </div>
                )}
                {isAuthenticated && userType === "applicant" && (
                  <button
                    className={`btn btn-sm unround border border-1 border-black ${
                      isInWatchlist
                        ? "btn-danger"
                        : "btn-transparent hover-green"
                    }`}
                    onClick={handleWatchlistToggle}
                    disabled={watchlistLoading}
                  >
                    {watchlistLoading ? (
                      <span>
                        <i className="fa fa-spinner fa-spin me-2"></i>
                        {isInWatchlist ? "Removing..." : "Adding..."}
                      </span>
                    ) : (
                      <span>
                        <i
                          className={`fa-solid me-2 ${
                            isInWatchlist ? "fa-eye-slash" : "fa-eye"
                          }`}
                        ></i>
                        {isInWatchlist
                          ? "Remove from Watchlist"
                          : "Add to Watchlist"}
                      </span>
                    )}
                  </button>
                )}

                {/* Login Prompt for Non-Authenticated Users */}
                {!isAuthenticated && (
                  <div className="text-center">
                    <p className="text-muted mb-2">
                      Want to apply for this position?
                    </p>
                    <a
                      href="/login"
                      className="btn btn-hireFlow-green unround border border-1 border-black"
                    >
                      <i className="fa-solid fa-sign-in-alt me-2"></i>
                      Login to Apply
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={applyModalOpen}
        posting={posting}
        onClose={() => setApplyModalOpen(false)}
        onSubmit={handleApply}
      />

      <Footer />
    </>
  );
}
