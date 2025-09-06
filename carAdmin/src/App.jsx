import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Layout/Navbar";
import Sidebar from "./Layout/Sidebar";
import "./App.css";
import MainSettings from "./Components/Pages/Settings/MainSettings";
import BookingDetails from "./Components/Pages/Website/BookingDetails";

// Lazy load components
const Dashboard = React.lazy(() => import("./Components/Dashboard/Dashboard"));
const Login = React.lazy(() => import("./Components/Auth/Login"));
const MainWebite = React.lazy(() =>
  import("./Components/Pages/Website/MainWebite")
);

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const location = useLocation();

  // Hide Navbar and Sidebar if on Login page
  const isLoginPage = location.pathname === "/";

  return (
    <div className="App">
      {!isLoginPage && <Navbar toggleSidebar={toggleSidebar} />}
      <div className="app-container">
        {!isLoginPage && (
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        )}
        <div className="main-content">
          <React.Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/MainWebite" element={<MainWebite />} />
              <Route path="/MainSettings" element={<MainSettings />} />
              <Route path="/bookingDetails" element={<BookingDetails />} />
            </Routes>
          </React.Suspense>
        </div>
      </div>
    </div>
  );
}

export default App;
