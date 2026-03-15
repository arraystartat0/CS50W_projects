import React, { lazy, Suspense, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopNav from "../../components/topnavs/applicant/TopNav";
import WatchlistTable from "../../components/applications/applicant/WatchlistTable";
import FilterBar from "../../components/FilterBar";
import ReviewModal from "../../components/modals/rep/Review";
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

const Watchlist = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [filteredWatchlistItems, setFilteredWatchlistItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedPosting, setSelectedPosting] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuth();

  const isPageLoading = usePageLoading(
    [!loading, watchlistItems.length > 0, isAuthenticated],
    800
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const response = await api.get("/watchlist/");
          setWatchlistItems(response.data);
          setFilteredWatchlistItems(response.data);
        } catch (error) {
          console.error("Failed to fetch watchlist:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchWatchlist();
  }, [isAuthenticated]);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const handleReview = (posting) => {
    setSelectedPosting(posting);
    setReviewModalOpen(true);
  };

  const handleUnwatch = async (postingUID) => {
    try {
      await api.delete("/watchlist/remove_from_watchlist/", {
        data: { posting_uid: postingUID },
      });

      // Refresh the watchlist after successful removal
      const response = await api.get("/watchlist/");
      setWatchlistItems(response.data);
      setFilteredWatchlistItems(response.data);
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`Failed to remove from watchlist: ${error.response.data.detail}`);
      } else {
        alert("Failed to remove from watchlist. Please try again.");
      }
    }
  };

  const handleFilterChange = ({ search, status }) => {
    let tempWatchlistItems = [...watchlistItems];

    // Filter by search term
    if (search) {
      const lowercasedSearch = search.toLowerCase();
      tempWatchlistItems = tempWatchlistItems.filter(
        (item) =>
          item.posting.title.toLowerCase().includes(lowercasedSearch) ||
          item.posting.company.name.toLowerCase().includes(lowercasedSearch) ||
          item.posting.status.toLowerCase().includes(lowercasedSearch)
      );
    }

    // Filter by status
    if (status && status !== "All") {
      tempWatchlistItems = tempWatchlistItems.filter(
        (item) => item.posting.status === status
      );
    }
    setFilteredWatchlistItems(tempWatchlistItems);
  };

  if (isPageLoading) {
    return <LoadingSpinner message="Loading watchlist..." />;
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
              <a
                className="companyFont text-black text-decoration-none"
                href="/"
              >
                HireFlow
              </a>
            </div>
          )}
          <TopNav />
          <div className="listings-header d-flex align-items-center justify-content-between px-0 my-2 my-md-0">
            <h2 className="m-0 fw-light fs-5 d-block d-md-none">
              Your watchlist
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
                  statuses={["All", "Active", "Archived", "Closed"]}
                />
              </div>
            </div>
            <WatchlistTable
              watchlistItems={filteredWatchlistItems}
              onReview={handleReview}
              onUnwatch={handleUnwatch}
            />
          </div>
        </div>
      </div>

      {reviewModalOpen && (
        <ReviewModal
          isOpen={reviewModalOpen}
          handleClose={() => setReviewModalOpen(false)}
          posting={selectedPosting}
        />
      )}
    </div>
  );
};

export default Watchlist;
