import React, {
  lazy,
  Suspense,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useLocation } from "react-router-dom";
import TopNav from "../../components/topnavs/rep/TopNav";
import ApplicationTable from "../../components/applications/rep/ApplicationsTable";
import ReviewModal from "../../components/modals/rep/Review";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import FilterBar from "../../components/FilterBar";
import SignoutButton from "../../components/buttons/SignoutButton";
import "../../assets/css/rep/Listing.css";
import "../../assets/css/rep/Application.css";
import "../../assets/css/LoadingSpinner.css";
import LoadingSpinner from "../../components/LoadingSpinner";
import usePageLoading from "../../hooks/usePageLoading";
import { api } from "../../services/auth";
import { useAuth } from "../../contexts/AuthContext";

const RepSidebar = lazy(() =>
  import("../../components/sidebars/rep/RepSidebar")
);
import MenuList from "../../components/sidebars/rep/MenuList";

const Applications = () => {
  const { userProfile } = useAuth();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;

  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedApplicationToReview, setSelectedApplicationToReview] =
    useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);

  // track the applications which have been autoupdated from unopened to under review
  const autoUpdatedAppsRef = useRef(new Set());

  const location = useLocation();

  const isPageLoading = usePageLoading(
    [!loading, applications.length > 0, userProfile],
    800
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  // memoize fetchApplications
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/applications/");
      setApplications(response.data);

      // check if there's a listing parameter in URL for initial filtering
      const urlParams = new URLSearchParams(location.search);
      const listingFilter = urlParams.get("listing");

      if (listingFilter) {
        // filter applications by the listing title
        const filtered = response.data.filter(
          (app) =>
            app.posting &&
            app.posting.title &&
            app.posting.title.toLowerCase() === listingFilter.toLowerCase()
        );
        setFilteredApplications(filtered);
      } else {
        setFilteredApplications(response.data);
      }
    } catch (err) {
      setError("Failed to fetch applications.");
    } finally {
      setLoading(false);
    }
  }, [location.search, isReviewModalOpen, selectedApplicationToReview]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filterApplications = (criteria) => {
    let tempFilteredApplications = [...applications];

    if (criteria.search) {
      const searchTerm = criteria.search.toLowerCase();
      tempFilteredApplications = tempFilteredApplications.filter(
        (app) =>
          (app.full_name && app.full_name.toLowerCase().includes(searchTerm)) ||
          (app.posting &&
            app.posting.title &&
            app.posting.title.toLowerCase().includes(searchTerm))
      );
    }

    if (criteria.status && criteria.status !== "All") {
      tempFilteredApplications = tempFilteredApplications.filter(
        (app) => app.status === criteria.status
      );
    }

    setFilteredApplications(tempFilteredApplications);
  };

  // memoize handleUpdateApplicationStatus
  const handleUpdateApplicationStatus = useCallback(
    async (applicationId, updatePayload) => {
      try {
        await api.patch(`/applications/${applicationId}/`, updatePayload);
        alert("Application updated successfully!");
        await fetchApplications();
      } catch (err) {
        console.error(
          "Applications.jsx: Error updating application:",
          err.response?.data || err
        );
        alert("Failed to update application. Please try again.");
      }
    },
    [fetchApplications]
  );

  const handleOpenReviewModal = async (application) => {
    if (
      application.status === "Unopened" &&
      !autoUpdatedAppsRef.current.has(application.UID)
    ) {
      // mark as auto-updated immediately
      autoUpdatedAppsRef.current.add(application.UID);
      try {
        // update status in backend
        await api.patch(`/applications/${application.UID}/`, {
          status: "Under Review",
          feedback: application.feedback || "",
        });
        // refresh the applications list
        await fetchApplications();
        const response = await api.get("/applications/");
        const updatedApp = response.data.find(
          (app) => app.UID === application.UID
        );
        if (updatedApp) {
          setSelectedApplicationToReview(updatedApp);
        } else {
          setSelectedApplicationToReview(application);
        }
      } catch (err) {
        console.error(
          "Applications.jsx: Error auto-updating application status:",
          err
        );
        // even if autoupdate fails open modal with original application
        setSelectedApplicationToReview(application);
      }
    } else {
      // auto-update not needed so just open modal
      setSelectedApplicationToReview(application);
    }

    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setSelectedApplicationToReview(null);
    setIsReviewModalOpen(false);
  };

  const handleOpenDeleteModal = (app) => {
    setApplicationToDelete(app);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setApplicationToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/applications/${applicationToDelete.UID}/`);
      alert("Application deleted successfully.");
      handleCloseDeleteModal();
      await fetchApplications(); // refresh your list
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Could not delete application. Try again.");
    }
  };

  // pull the listing filter from URL for display purposes
  const urlParams = new URLSearchParams(location.search);
  const listingFilter = urlParams.get("listing");

  if (isPageLoading) {
    return <LoadingSpinner message="Loading applications..." />;
  }

  if (error) {
    return <div className="alert alert-danger text-center mt-5">{error}</div>;
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
          <TopNav
            firstName={userProfile?.first_name}
            toggleMobileMenu={toggleMobileMenu}
          />
          <div className="listings-header d-flex align-items-center justify-content-between px-0 my-2 my-md-0">
            <h2 className="m-0 fw-light fs-5 d-block d-md-none">
              Applications Received
              {listingFilter && (
                <small className="d-block text-muted mt-1">
                  Filtered by: {listingFilter}
                </small>
              )}
            </h2>
            {isMobile && (
              <div className="mobile-header-icons d-flex align-items-center">
                <SignoutButton />
                <button
                  className="hamburger-menu text-dark"
                  onClick={toggleMobileMenu}
                >
                  <i className="fa fa-bars"></i>
                </button>
              </div>
            )}
          </div>

          {isMobile && isMobileMenuOpen && (
            <div className="mobile-menu-modal" onClick={toggleMobileMenu}>
              <div
                className="mobile-menu-content border border-2 border-black"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mobile-menu-header d-flex justify-content-between align-items-center mb-3">
                  <h5 className="m-0">Menu</h5>
                  <button className="btn-close" onClick={toggleMobileMenu}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <MenuList />
              </div>
            </div>
          )}

          <div className="container-fluid px-0">
            {listingFilter && (
              <div className="alert bg-hireFlow-green border border-1 border-black unround d-flex align-items-center justify-content-between mb-3">
                <span>
                  <i className="fa fa-filter me-2"></i>
                  Showing applications for: <strong>{listingFilter}</strong>
                </span>
                <a
                  href="/rep/applications"
                  className="btn btn-sm border border-1 border-black unround"
                >
                  Clear Filter
                </a>
              </div>
            )}
            <div className="d-flex align-items-center mb-3 mt-4 mt-md-2">
              <div className="flex-grow-1">
                <FilterBar onFilterChange={filterApplications} />
              </div>
            </div>
            <ApplicationTable
              applications={filteredApplications}
              onReview={handleOpenReviewModal}
              onDelete={handleOpenDeleteModal}
            />
          </div>
        </div>
      </div>

      {isReviewModalOpen && selectedApplicationToReview && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={handleCloseReviewModal}
          application={selectedApplicationToReview}
          onStatusChange={handleUpdateApplicationStatus}
        />
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        message={`Are you sure you want to delete the application from "${applicationToDelete?.full_name}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
      />
    </div>
  );
};

export default Applications;
