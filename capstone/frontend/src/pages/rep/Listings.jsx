import React, { lazy, Suspense, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopNav from "../../components/topnavs/rep/TopNav";
import SignoutButton from "../../components/buttons/SignoutButton";
import ListingTable from "../../components/listings/ListingTable";
import FilterBar from "../../components/FilterBar";
import NewListingModal from "../../components/modals/rep/NewListing";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import "../../assets/css/rep/Listing.css";
import "../../assets/css/LoadingSpinner.css";
import LoadingSpinner from "../../components/LoadingSpinner";
import usePageLoading from "../../hooks/usePageLoading";
import { api } from "../../services/auth";
import { useAuth } from "../../contexts/AuthContext";

// Lazy load the sidebar
const RepSidebar = lazy(() =>
  import("../../components/sidebars/rep/RepSidebar")
);
import MenuList from "../../components/sidebars/rep/MenuList";

const Listing = () => {
  const { userProfile } = useAuth(); // get userProfile from AuthContext

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;

  // new states for fetched data
  const [listings, setListings] = useState([]); // stores all fetched listings
  const [filteredListings, setFilteredListings] = useState([]); // stores listings after filtering
  const [loading, setLoading] = useState(true); // loading state for API call
  const [error, setError] = useState(null); // error state for API call

  const [isNewListingModalOpen, setIsNewListingModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [editingListing, setEditingListing] = useState(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);

  const isPageLoading = usePageLoading(
    [!loading, listings.length > 0, userProfile],
    800
  );

  // listen for window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // fetch listings from the backend
  const fetchListings = async () => {
    setLoading(true);
    setError(null); // clear any previous errors
    try {
      const response = await api.get("/rep/my-listings/");
      setListings(response.data);
      setFilteredListings(response.data);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
      setError("Failed to load listings. Please try again."); // set error message
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile) {
      // only fetch if user is authenticated and profile is available
      fetchListings();
    }
  }, []);

  const handleOpenNewListingModal = () => {
    setEditingListing(null); // Clear any editing data
    setIsNewListingModalOpen(true);
  };

  const handleEditListing = (listing) => {
    setEditingListing(listing);
    setIsNewListingModalOpen(true);
  };

  const handleCloseNewListingModal = () => {
    setIsNewListingModalOpen(false);
    setEditingListing(null);
  };

  const handleDeleteListing = (listing) => {
    setListingToDelete(listing);
    setIsConfirmDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsConfirmDeleteModalOpen(false);
    if (listingToDelete && listingToDelete.UID) {
      // ensure UID exists
      try {
        await api.delete(`/postings/${listingToDelete.UID}/`); // using UID for deletion
        alert("Listing deleted successfully!");
        fetchListings(); // refresh the list of listings
      } catch (err) {
        console.error("Error deleting listing:", err.response?.data || err);
        alert("Failed to delete listing. Please try again.");
      } finally {
        setListingToDelete(null); // clear the listing to be deleted
      }
    } else {
      alert("Error: No listing selected for deletion.");
      setListingToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsConfirmDeleteModalOpen(false);
    setListingToDelete(null); // clear the listing to be deleted
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  // Close notification modal when clicking outside

  const filterListings = (criteria) => {
    let tempFilteredListings = [...listings]; // on load, contain all listings

    // apply search filter
    if (criteria.search) {
      const searchTerm = criteria.search.toLowerCase();
      tempFilteredListings = tempFilteredListings.filter((listing) =>
        listing.title.toLowerCase().includes(searchTerm)
      );
    }

    // apply specific status filter
    if (criteria.status && criteria.status !== "All") {
      tempFilteredListings = tempFilteredListings.filter(
        (listing) => listing.status === criteria.status
      );
    }

    setFilteredListings(tempFilteredListings);
  };

  if (isPageLoading) {
    return <LoadingSpinner message="Loading listings..." />;
  }

  // error message
  if (error) {
    return (
      <div className="rep-listings error-state">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="rep-listings">
      {/* Desktop Sidebar */}
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
              Your Listings
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
            <div className="d-flex flex-column flex-md-row align-items-md-center mb-3 mt-4 mt-md-2">
              <div className="flex-grow-1 me-md-3 mb-2 mb-md-0">
                <FilterBar onFilterChange={filterListings} />
              </div>
              <button
                onClick={handleOpenNewListingModal}
                className="hover-btn border border-1 border-black text-black unround p-2 bg-transparent rounded-1 d-flex align-items-center justify-content-center"
              >
                <i className="fa-solid fa-plus me-2"></i>
                New Listing
              </button>
            </div>
            <ListingTable
              listings={filteredListings}
              onEditListing={handleEditListing}
              onDeleteListing={handleDeleteListing}
            />
          </div>
        </div>
      </div>

      {isNewListingModalOpen && (
        <NewListingModal
          isOpen={isNewListingModalOpen}
          handleClose={handleCloseNewListingModal}
          editingListing={editingListing}
          onListingUpdated={fetchListings}
        />
      )}

      {isConfirmDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isConfirmDeleteModalOpen}
          message={`Are you sure you want to delete the listing "${
            listingToDelete?.title || "this listing"
          }"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

export default Listing;
