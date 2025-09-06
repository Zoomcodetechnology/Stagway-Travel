import React from "react";
import { Link, useLocation } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { FaFilePen } from "react-icons/fa6";
import { SlNotebook } from "react-icons/sl";
import { CiGlobe } from "react-icons/ci";
import { TbFileInvoice } from "react-icons/tb";
import { VscGraph } from "react-icons/vsc";
import { RiDownload2Fill } from "react-icons/ri";
import { FaMapMarkerAlt } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";


    function handleLogOut(){
      localStorage.removeItem("tokenData")
      localStorage.removeItem("CarBookingAdminToken")
    }


const SidebarMenuItem = ({ item, isOpen, isActive }) => (
  <Link to={item.path} className="menu-link">
    <li className={`menu-item ${isActive ? "active" : "inactive"}`}>

      <span className="menu-icon">{item.icon}</span>
      {isOpen && <span className="menu-text">{item.label}</span>}

    </li>
  </Link>
);
function Sidebar({ isOpen }) {
  const location = useLocation();

  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: <RxDashboard />, path: "/dashboard" },
    { id: "Bookings", label: "Bookings", icon: <FaFilePen />, path: "/bookings" },
    { id: "Database", label: "Database", icon: <SlNotebook />, path: "/database" },
    { id: "Website", label: "Website", icon: <CiGlobe />, path: "/MainWebite" },
    { id: "Settings", label: "Settings", icon: <IoMdSettings />, path: "/MainSettings" },
    { id: "Reports", label: "Reports", icon: <VscGraph />, path: "/reports" },
    { id: "Invoice", label: "Invoice", icon: <TbFileInvoice />, path: "/invoice" },
    { id: "Export", label: "Export", icon: <RiDownload2Fill />, path: "/export" },
    { id: "GPS", label: "GPS", icon: <FaMapMarkerAlt />, path: "/gps" },
  ];

  return (
    <div className={`sidebar ${isOpen ? "expanded" : "collapsed"}`}>
      <ul className="menu">
        {menuItems.map((item) => (
          <SidebarMenuItem
            key={item.id}
            item={item}
            isOpen={isOpen}
            isActive={location.pathname === item.path}
          />
        ))}
        <li className="menu-item logout-btn">
          <Link to="/" className="menu-link">
            <FontAwesomeIcon icon={faRightFromBracket} className="menu-icon" />
            {isOpen && <span className="menu-text" onClick={handleLogOut}>Logout</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
