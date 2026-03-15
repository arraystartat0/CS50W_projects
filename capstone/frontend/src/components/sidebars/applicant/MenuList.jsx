import { Link, useLocation } from "react-router-dom";
import "../../../assets/css/rep/Sidebar.css";

const MenuList = ({ onCompanyClick }) => {
  const location = useLocation();

  return (
    <ul className="sidebar-menu">
      <span className="text-muted fw-light small-text">MENU</span>

      <li
        className={`px-2 py-1 ${
          location.pathname === "/applicant" ? "active" : "inactive"
        }`}
      >
        <Link to="/applicant">
          <i className="fa-solid fa-chart-line"></i> Dashboard
        </Link>
      </li>

      <li
        className={`px-2 py-1 ${
          location.pathname === "/applicant/applications" ? "active" : "inactive"
        }`}
      >
        <Link to="/applicant/applications">
          <i className="fa-solid fa-file-lines"></i> My Applications
        </Link>
      </li>

      <li
        className={`px-2 py-1 mb-2 ${
          location.pathname === "/applicant/my-watchlist" ? "active" : "inactive"
        }`}
      >
        <Link to="/applicant/my-watchlist">
          <i className="fa-solid fa-eye"></i> My Watchlist
        </Link>
      </li>
      <span className="text-muted fw-light small-text">PERSONAL</span>
      <li
        className={`px-2 py-1 ${
          location.pathname === "/applicant/me" ? "active" : "inactive"
        }`}
      >
        <Link to="/applicant/me">
          <i className="fa-solid fa-user"></i> Me
        </Link>
      </li>
    </ul>
  );
};

export default MenuList;
