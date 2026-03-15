import { Link, useLocation } from "react-router-dom";
import "../../../assets/css/rep/Sidebar.css";

const MenuList = ({ onCompanyClick }) => {
  const location = useLocation();

  return (
    <ul className="sidebar-menu">
      <span className="text-muted fw-light small-text">MENU</span>

      <li className={`px-2 py-1 ${location.pathname === "/rep" ? "active" : "inactive"}`}>
        <Link to="/rep">
          <i className="fa-solid fa-chart-line"></i> Dashboard
        </Link>
      </li>

      <li className={`px-2 py-1 ${location.pathname === "/rep/my-listings" ? "active" : "inactive"}`}>
        <Link to="/rep/my-listings">
          <i className="fa-solid fa-list-ul"></i> My Listings
        </Link>
      </li>

      <li className={`px-2 py-1 ${location.pathname === "/rep/applications" ? "active" : "inactive"}`}>
        <Link to="/rep/applications">
          <i className="fa-solid fa-file-lines"></i> Applications
        </Link>
      </li>
    </ul>
  );
};

export default MenuList;
