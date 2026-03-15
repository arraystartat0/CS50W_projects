// TopNav.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../../assets/css/rep/TopNav.css";
import SignoutButton from "../../buttons/SignoutButton";

const TopNav = ({ firstName }) => {
  const location = useLocation();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

  // Determine the greeting based on the current pathname.
  const renderGreeting = () => {
    if (location.pathname === "/rep") {
      return <p className="greeting">Hello, {firstName || "User"}.</p>;
    } else if (location.pathname === "/rep/my-listings") {
      return <p className="greeting">Here are your listings.</p>;
    } else if (location.pathname === "/rep/applications") {
      return (
        <p className="greeting">Here are all the received applications.</p>
      );
    } else if (location.pathname === "/rep/my-company") {
      return (
        <p className="greeting">Here are all the details about your company.</p>
      );
    } else {
      return null;
    }
  };

  return (
    <nav className="top-nav ps-0 ms-0 pt-0 mb-2 d-none d-md-flex">
      <div className="nav-left">{renderGreeting()}</div>

      {/* Right-aligned container */}
      <div className="nav-right">
        {!isMobile && (
          <div className="notification-container">
            <SignoutButton />
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopNav;
