import React, { lazy, Suspense, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/auth";
import ApplicantDetails from "../../components/ApplicantDetails";
import CurrentInternship from "../../components/CurrentInternship";
import RecentApplications from "../../components/RecentApplications";
import PastInternships from "../../components/PastInternships";
import TopNav from "../../components/topnavs/applicant/TopNav";
import MenuList from "../../components/sidebars/applicant/MenuList";
import SignoutButton from "../../components/buttons/SignoutButton";
import "../../assets/css/LoadingSpinner.css";
import LoadingSpinner from "../../components/LoadingSpinner";
import usePageLoading from "../../hooks/usePageLoading";

// Lazy load the sidebar
const AppSidebar = lazy(() =>
  import("../../components/sidebars/applicant/AppSidebar")
);

// CSS Import
import "../../assets/css/applicants/Dashboard.css";

const Dashboard = () => {
  const { userProfile } = useAuth(); // ADDED: Get user profile from context
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    userDetails: { username: "Loading..." },
    statistics: [],
    currentInternship: null,
    recentApplications: [],
    pastInternships: [],
  });

  const isPageLoading = usePageLoading(
    [
      !loading,
      dashboardData.userDetails.username !== "Loading...",
      userProfile,
    ],
    1000
  );

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/applicant/dashboard/");
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  if (isPageLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div
        className="dashboard-content d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <i className="fa fa-exclamation-triangle fa-3x text-danger mb-3"></i>
          <h3>Error Loading Dashboard</h3>
          <p className="text-muted">{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // --- destructure data for easy use in JSX ---
  const {
    userDetails,
    statistics,
    currentInternship,
    recentApplications,
    pastInternships,
  } = dashboardData;

  return (
    <div className="rep-dashboard">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Suspense fallback={<div>Loading Sidebar...</div>}>
          <AppSidebar />
        </Suspense>
      )}
      <div className="dashboard-content">
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

        <ApplicantDetails
          Username={userDetails.display_name}
          statsList={statistics}
          showStats={true}
        />
        {isMobile && (
          <div className="container-fluid">
            <div className="row gap-2 mb-2">
              {statistics.map((s, i) => (
                <div
                  className="col-12 d-flex flex-column align-items-center 
                     border border-1 border-black rounded-2 mobile-stat-card"
                  key={i}
                >
                  <div className="d-flex align-items-center">
                    <i className={`fa-solid ${s.icon} fa-xs me-1`} />
                    <span className="mobile-stat-value">{s.value}</span>
                  </div>
                  <small className="small-text text-muted text-center">
                    {s.label}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="container-fluid px-0">
          <div className="row mb-2">
            <div className="col-12 mb-2" style={{ zIndex: "2" }}>
              <div
                className="dashboard-section"
                style={{ backgroundColor: "white" }}
              >
                {currentInternship ? (
                  <CurrentInternship
                    company={currentInternship.company}
                    position={currentInternship.position}
                    location={currentInternship.location}
                    startDate={currentInternship.startDate}
                    endDate={currentInternship.endDate}
                    supervisor={currentInternship.supervisor}
                    notes={currentInternship.notes}
                    applicationUUID={currentInternship.uuid}
                  />
                ) : (
                  <div className="text-center py-4">
                    <i className="fa fa-briefcase fa-2x text-muted mb-3"></i>
                    <p className="text-muted mb-0">No current internship</p>
                    <small className="text-muted">
                      You don't have any active internships at the moment.
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-12 col-md-7 mb-2">
              <div className="dashboard-section">
                <RecentApplications applications={recentApplications} />
              </div>
            </div>
            <div className="col-12 col-md-5 mb-2">
              <div className="dashboard-section">
                <PastInternships internships={pastInternships} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
