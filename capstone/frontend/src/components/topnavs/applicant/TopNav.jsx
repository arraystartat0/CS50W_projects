import React, { useState } from "react";
import CompanyDetails from "../../../components/CompanyDetails";
import { useLocation } from "react-router-dom";
import "../../../assets/css/rep/TopNav.css";
import SignoutButton from "../../buttons/SignoutButton";

const TopNav = () => {
  const location = useLocation();

  // Determine the greeting based on the current pathname.
  const renderGreeting = () => {
    if (location.pathname === "/applicant") {
      return;
    } else if (location.pathname === "/applicant/applications") {
      return <p className="greeting">Here are your applications.</p>;
    } else if (location.pathname === "/applicant/my-watchlist") {
      return <p className="greeting">Here is your watchlist.</p>;
    } else if (location.pathname === "/applicant/me") {
      return <p className="greeting">Here are all the details about you.</p>;
    } else {
      return;
    }
  };

  return (
    <nav className="top-nav ps-0 ms-0 pt-0 mb-2 d-none d-md-flex">
      <div className="nav-left">{renderGreeting()}</div>

      {/* Right-aligned container */}
      <div className="nav-right">
        <div className="notification-container">
          <SignoutButton />
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
