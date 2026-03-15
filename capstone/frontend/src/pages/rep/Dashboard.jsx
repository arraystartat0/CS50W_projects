import React, { lazy, Suspense, useState, useEffect } from "react";
import CompanyDetails from "../../components/CompanyDetails";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { useLocation } from "react-router-dom";
import "../../assets/css/rep/Dashboard.css";
import "../../assets/css/LoadingSpinner.css";
import LoadingSpinner from "../../components/LoadingSpinner";
import usePageLoading from "../../hooks/usePageLoading";
import TopNav from "../../components/topnavs/rep/TopNav";
import SignoutButton from "../../components/buttons/SignoutButton";
import { api } from "../../services/auth";
import { useAuth } from "../../contexts/AuthContext";

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

// Lazy load the sidebar for desktop
const RepSidebar = lazy(() =>
  import("../../components/sidebars/rep/RepSidebar")
);
import MenuList from "../../components/sidebars/rep/MenuList";

const Dashboard = () => {
  const { userProfile } = useAuth();

  // states for fetched data, initialized with placeholder or userProfile data
  const [userDetails, setUserDetails] = useState({
    first_name: userProfile?.first_name || "Rep",
  });
  const [companyInfo, setCompanyInfo] = useState({
    name: "Loading...",
    public_key: "Loading...",
  });
  const [stats, setStats] = useState([]);
  const [applicationVolumeChartData, setApplicationVolumeChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [applicationStatusesChartData, setApplicationStatusesChartData] =
    useState({ labels: [], datasets: [] });
  const [currentInterns, setCurrentInterns] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // State for viewport width and responsiveness
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPageLoading = usePageLoading(
    [!loadingData, userProfile, stats.length > 0],
    1000
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

  const isMobile = windowWidth < 784;

  // fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      setError(null);
      try {
        const response = await api.get("/rep/dashboard/"); //API endpoint

        const {
          user_details,
          company_details,
          stats,
          application_volume,
          application_statuses,
          current_interns,
        } = response.data;

        // update states with fetched data
        setUserDetails(user_details);
        setCompanyInfo(company_details);
        setStats([
          {
            icon: "fa-file-lines",
            value: stats.total_pending_applications,
            label: "Applications",
          },
          {
            icon: "fa-comments",
            value: stats.total_scheduled_interviews,
            label: "Interviews",
          },
          {
            icon: "fa-percent",
            value: stats.acceptance_percentage,
            label: "Acceptance",
          },
        ]);
        setApplicationVolumeChartData({
          labels: application_volume.labels,
          datasets: [
            {
              label: "Application Volume",
              data: application_volume.data,
              fill: true,
              borderColor: "#4A90E2",
              backgroundColor: "rgba(74, 144, 226, 0.2)",
              tension: 0.3,
            },
          ],
        });
        setApplicationStatusesChartData({
          labels: application_statuses.labels,
          datasets: [
            {
              data: application_statuses.data,
              backgroundColor: ["#FFD700", "#4A90E2", "#FF7F50", "#6C5DD3"],
            },
          ],
        });
        setCurrentInterns(current_interns);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoadingData(false);
      }
    };

    // only fetch data if user is authenticated
    if (userProfile) {
      fetchData();
    }
  }, [userProfile]);

  // toggle mobile menu modal
  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const handleCopy = async () => {
    const sanitized = companyInfo.public_key.replace(/-/g, "");

    // First try the modern API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(sanitized);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (_) {
        // if it fails, fall back
      }
    }

    // Fallback for older/mobile browsers
    const textarea = document.createElement("textarea");
    textarea.value = sanitized;
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
    }
    document.body.removeChild(textarea);
  };

  if (isPageLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  // uf there's an error, display an error message
  if (error) {
    return (
      <div className="rep-dashboard error-state">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="rep-dashboard container-fluid">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Suspense fallback={<div>Loading Sidebar...</div>}>
          <RepSidebar />
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
        <TopNav firstName={userDetails?.first_name} />
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
              <MenuList onCompanyClick={toggleModal} />
            </div>
          </div>
        )}

        <CompanyDetails
          companyName={companyInfo.name}
          publicKey={companyInfo.public_key}
          copied={copied}
          onCopy={handleCopy}
          statsList={stats}
          showStats={!isMobile}
        />
        {isMobile && (
          <div className="container-fluid">
            <div className="row gap-2 mb-2">
              {stats.map((s, i) => (
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
          <div className="row">
            <div className="col-md-7 my-0 my-md-2">
              <div className="dashboard-section">
                <h3 className="text-muted fw-light">Application Volume</h3>
                <Line
                  id="volumeChart"
                  data={applicationVolumeChartData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                  height={250}
                />
              </div>
            </div>
            <div className="col-md-5 my-2">
              <div className="dashboard-section">
                <h3 className="text-muted fw-light">Application Statuses</h3>
                <Doughnut
                  id="statusesChart"
                  data={applicationStatusesChartData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                  height={250}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 my-2">
              <div className="dashboard-section">
                <h3 className="text-muted fw-light">Current Interns</h3>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Posting</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInterns.map((intern, index) => (
                      <tr key={index}>
                        <td>{intern.full_name}</td>
                        <td>{intern.posting}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
