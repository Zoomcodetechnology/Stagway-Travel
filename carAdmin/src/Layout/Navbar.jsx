import React from "react";
import   logo  from '../assets/logo.png'
function Navbar({ toggleSidebar }) {
  return (
    <nav className="navbar">

      <h4 className="navbar-title animate-charcter">
      <button onClick={toggleSidebar} className="toggle-button ">
        ☰
      </button>
         <img src={logo} alt=""  className="img-fluid navCarLogo" style={{height:"70px"}} /> 
         </h4>
    </nav>
  );
}

export default Navbar;

