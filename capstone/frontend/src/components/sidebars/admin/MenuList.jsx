import { Link, useLocation } from "react-router-dom";
import "../../../assets/css/rep/Sidebar.css";

const MenuList = () => {
  const location = useLocation();

  return (
    <ul className="sidebar-menu">
      <span className="text-muted fw-light small-text">MENU</span>

      <li
        className={`px-2 py-1 ${
          location.pathname === "/admin" ? "active" : "inactive"
        }`}
      >
        <Link to="/admin">
        <i className="fa-solid fa-user-gear"></i> Dashboard
        </Link>
      </li>

    </ul>
  );
};

export default MenuList;
