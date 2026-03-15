import React, { lazy, Suspense, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopNav from "../../components/topnavs/applicant/TopNav";
import ApplicationsTable from "../../components/applications/applicant/ApplicationsTable";
import ReviewModal from "../../components/modals/rep/Review";
import FilterBar from "../../components/FilterBar";
import SignoutButton from "../../components/buttons/SignoutButton";
import "../../assets/css/rep/Listing.css";
import "../../assets/css/rep/Application.css";
import "../../assets/css/LoadingSpinner.css";
import LoadingSpinner from "../../components/LoadingSpinner";
import usePageLoading from "../../hooks/usePageLoading";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const RepSidebar = lazy(() =>
  import("../../components/sidebars/applicant/AppSidebar")
);
import MenuList from "../../components/sidebars/applicant/MenuList";

const Applications = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated, userProfile, userType } = useAuth();

  const isPageLoading = usePageLoading(
    [!loading, applications.length > 0, isAuthenticated],
    800
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const response = await api.get("/applications/");
          setApplications(response.data);
          setFilteredApplications(response.data);
        } catch (error) {
          console.error("Failed to fetch applications:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchApplications();
  }, [isAuthenticated]);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
  };

  const handleSearch = (searchTerm) => {
    const filtered = applications.filter(
      (app) =>
        app.listing.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredApplications(filtered);
  };

  const handleFilter = (selectedStatus) => {
    if (selectedStatus === "all") {
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter(
        (app) => app.status === selectedStatus
      );
      setFilteredApplications(filtered);
    }
  };

  const openReviewModal = (application) => {
    setSelectedApplication(application);
    setReviewModalOpen(true);
  };

  const handleDeleteApplication = async (applicationUID) => {
    try {
      await api.delete(`/applications/${applicationUID}/`);
      // refresh applications list after successful deletion
      const response = await api.get("/applications/");
      setApplications(response.data);
      setFilteredApplications(response.data);
    } catch (error) {
      console.error("Failed to delete application:", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`Failed to delete application: ${error.response.data.detail}`);
      } else {
        alert("Failed to delete application. Please try again.");
      }
    }
  };

  const handleFilterChange = ({ search, status }) => {
    let tempApplications = [...applications];

    //filter by search term
    if (search) {
      const lowercasedSearch = search.toLowerCase();
      tempApplications = tempApplications.filter(
        (app) =>
          app.posting.title.toLowerCase().includes(lowercasedSearch) ||
          app.posting.company.name.toLowerCase().includes(lowercasedSearch)
      );
    }

    //filter by status
    if (status && status !== "All") {
      tempApplications = tempApplications.filter(
        (app) => app.status === status
      );
    }
    setFilteredApplications(tempApplications);
  };

  if (isPageLoading) {
    return <LoadingSpinner message="Loading applications..." />;
  }

  return (
    <div className="rep-listings">
      {!isMobile && (
        <Suspense fallback={<div>Loading Sidebar...</div>}>
          <RepSidebar />
        </Suspense>
      )}

      <div className="listings-main">
        <div className="listings-content">
          {isMobile && (
            <div className="text-center mb-3">
              <a href="/">
                <img
                  className="img-fluid"
                  style={{ maxHeight: "2.5rem" }}
                  src="../../../public/logo-nav-01.png"
                ></img>
              </a>
            </div>
          )}
          <TopNav />
          <div className="listings-header d-flex align-items-center justify-content-between px-0 my-2 my-md-0">
            <h2 className="m-0 fw-light fs-5 d-block d-md-none">
              Your applications
            </h2>
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
                  <button className="btn-close" onClick={toggleModal}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <MenuList />
              </div>
            </div>
          )}

          <div className="container-fluid px-0">
            <div className="d-flex align-items-center mb-3 mt-4 mt-md-2">
              <div className="flex-grow-1">
                <FilterBar
                  onFilterChange={handleFilterChange}
                  statuses={[
                    "All",
                    "Active",
                    "Decision pending",
                    "Unopened",
                    "Interview Scheduled",
                    "Under Review",
                    "Rejected",
                  ]}
                />
              </div>
            </div>
            <ApplicationsTable
              applications={filteredApplications}
              onReview={openReviewModal}
              onDelete={handleDeleteApplication}
            />
          </div>
        </div>
      </div>

      {reviewModalOpen && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={handleCloseReviewModal}
          application={selectedApplication}
        />
      )}
    </div>
  );
};

export default Applications;
