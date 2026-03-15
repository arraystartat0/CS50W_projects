import React, { lazy, Suspense, useState, useEffect } from "react";
import ApplicantDetails from "../../components/ApplicantDetails";
import { useLocation } from "react-router-dom";
import "../../assets/css/applicants/Dashboard.css";
import "../../assets/css/LoadingSpinner.css";
import LoadingSpinner from "../../components/LoadingSpinner";
import usePageLoading from "../../hooks/usePageLoading";
import TopNav from "../../components/topnavs/applicant/TopNav";
import CurrentInternship from "../../components/CurrentInternship";
import RecentApplications from "../../components/RecentApplications";
import PastInternships from "../../components/PastInternships";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

// Lazy load the sidebar for desktop
const AppSidebar = lazy(() =>
  import("../../components/sidebars/applicant/AppSidebar")
);
import MenuList from "../../components/sidebars/applicant/MenuList";

const Dashboard = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const response = await api.get("/applicant/dashboard/");
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

  // toggle mobile menu modal
  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const currentInternship = dashboardData?.currentInternship || null;
  const recentApps = dashboardData?.recentApplications || [];
  const pastApps = dashboardData?.pastInternships || [];
  const statsList = dashboardData?.statistics || [
    { icon: "fa-file-lines", value: 0, label: "Applications" },
    { icon: "fa-comments", value: 0, label: "Interviews" },
    { icon: "fa-check", value: 0, label: "Accepted" },
  ];

  const location = useLocation();

  if (isPageLoading) {
    return <LoadingSpinner message="Loading profile..." />;
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
          Username={dashboardData?.userDetails?.display_name || "Loading..."}
          selfView={true}
          showStats={false}
          userDetails={dashboardData?.userDetails}
        />
        {isMobile && (
          <div className="container-fluid">
            <div className="row gap-2 mb-2">
              {statsList.map((s, i) => (
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
                <RecentApplications applications={recentApps} />
              </div>
            </div>
            <div className="col-12 col-md-5 mb-2">
              <div className="dashboard-section">
                <PastInternships internships={pastApps} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
