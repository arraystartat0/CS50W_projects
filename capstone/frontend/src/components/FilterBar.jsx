import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const FilterBar = ({ onFilterChange, statuses }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All")
  const { pathname, search: urlSearch } = useLocation();

  // search with listing filter from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(urlSearch);
    const listingFilter = urlParams.get('listing');
    
    if (listingFilter && pathname === "/rep/applications") {
      setSearch(listingFilter);
      // trigger initial filter
      onFilterChange({
        search: listingFilter,
        status: statusFilter,
      });
    }
  }, [urlSearch, pathname, onFilterChange, statusFilter]);

  // decide placeholder based on path
  const placeholder =
    pathname === "/rep/applications" || pathname === "/applicant/applications"
      ? "Search through any columns..."
      : "Search by title...";
  
  const applyFilters = (currentSearch, currentStatus) => {
    onFilterChange({ search: currentSearch, status: currentStatus });
  };

  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    setSearch(newSearch);
    applyFilters(newSearch, statusFilter); 
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    applyFilters(search, newStatus);
  };


  return (
    <div className="d-flex flex-column flex-md-row align-items-md-center">
      <input
        type="text"
        className="filter-bar form-control border border-1 border-black rounded-1 mb-1 mb-md-0 me-md-2 flex-grow-1"
        placeholder={placeholder}
        value={search}
        onChange={handleSearchChange}
      />
      {statuses && (
        <select
          className="form-select border border-1 border-black rounded-1 w-auto mt-1 mt-md-0"
          value={statusFilter}
          onChange={handleStatusChange}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default FilterBar;