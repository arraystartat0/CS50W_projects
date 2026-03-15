import React from "react";
import MenuList from "./MenuList";
import "../../../assets/css/rep/Sidebar.css";

const AdminSidebar = () => {

  return (
    <aside className="rep-sidebar">
      <div className="sidebar-header">
        <a href="/"><img className="img-fluid" src="../logo-nav-01.png"></img></a>
        <hr className="w-100" />
      </div>
      <MenuList />
    </aside>
  );
};

export default AdminSidebar; 