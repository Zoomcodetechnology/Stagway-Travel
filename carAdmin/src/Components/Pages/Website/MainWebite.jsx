import React, { useEffect, useState } from "react";
import Bookings from "./Bookings";
import Cars from "./Cars";
import Users from "./Users";
import Settings from "./Settings";
import { FaRegUser } from "react-icons/fa";
import { MdCurrencyRupee } from "react-icons/md";
import { IoCall } from "react-icons/io5";
import { postData } from "../../../utility/Utility";
import Swal from "sweetalert2";

const MainWebsite = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    totalPhoneNumbers: 0,
    revenue: 0,
  });
  

  const fetchAnalytics = async() =>{
    try {
      const response = await postData('/analytics/fetchAnalytics', {});
      if (response.data) {
        setAnalyticsData({
          totalUsers: response.data.data.totalUsers || "Not Available",
          totalPhoneNumbers: response.data.data.totalPhoneNumbers || "Not Available",
          revenue: response.data.data.totalRevenue === 0 ? 0 : response.data.data.totalRevenue || "Not Available",

        });
      }
    } catch (error) {
     Swal.fire("Failed!", response.message, "error");
    }
  }
  useEffect(() => {
    fetchAnalytics();
  }, []);
  return (
    <div className="container">
      <div className="p-4">
       
        <div className="row border rounded p-3 heading-card" style={{ maxWidth: "780px",
          marginLeft:"80px"
        }}>
          <div className="col-md-6 col-lg-4 my-3 border-end">
            <div className="dash-details">
              <p className="mb-0">{analyticsData.totalUsers}</p>
              <div className="me-4 shadow-sm dashicon-user">
                <button>
                  <FaRegUser className="usericons" />
                </button>
              </div>
            </div>
            <p className="dash-user">Total Users</p>
          </div>
          <div className="col-md-6 col-lg-4 my-3 border-end  ">
            <div className="dash-details">
              <p className="mb-0">{analyticsData.totalPhoneNumbers}</p>
              <div className="me-4 shadow-sm dashicon-user">
                <button>
                  <IoCall className="usercallicon" />
                </button>
              </div>
            </div>
            <p className="dash-user">Total phone numbers</p>
          </div>
          <div className="col-md-6 col-lg-4 my-3   ">
            <div className="dash-details">
              <p className="mb-0">{analyticsData.revenue}</p>
              <div className="me-4 shadow-sm dashicon-user">
                <button>
                  <MdCurrencyRupee class="usericons-r" />
                </button>
              </div>
            </div>
            <p className="dash-user">Revenue this week</p>
          </div>

       
        </div>

        <ul
          className="nav nav-pills mb-3 mt-4 tabsHereone"
          id="pills-tab"
          role="tablist"
        >
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active bookingtab"
              id="pills-home-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-book"
              type="button"
              role="tab"
              aria-controls="pills-book"
              aria-selected="true"
            >
              {/* Faqs */}
              <span>Bookings</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link carstab"
              id="pills-home-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-car"
              type="button"
              role="tab"
              aria-controls="pills-car"
              aria-selected="true"
            >
              {/* Faqs */}
              <span>Cars</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link userstab"
              id="pills-profile-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-user"
              type="button"
              role="tab"
              aria-controls="pills-user"
              aria-selected="false"
            >
              <span>Users</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link settingTab"
              id="pills-profile-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-seting"
              type="button"
              role="tab"
              aria-controls="pills-seting"
              aria-selected="false"
            >
              <span>Settings</span>
            </button>
          </li>
        </ul>
        <div className="tab-content" id="pills-tabContent">
          <div
            className="tab-pane fade show active"
            id="pills-book"
            role="tabpanel"
            aria-labelledby="pills-home-tab"
          >
            <Bookings />
          </div>
          <div
            className="tab-pane fade"
            id="pills-car"
            role="tabpanel"
            aria-labelledby="pills-profile-tab"
          >
            <Cars />
          </div>
          <div
            className="tab-pane fade"
            id="pills-user"
            role="tabpanel"
            aria-labelledby="pills-contact-tab"
          >
            <Users />
          </div>
          <div
            className="tab-pane fade"
            id="pills-seting"
            role="tabpanel"
            aria-labelledby="pills-contact-tab"
          >
            <Settings />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainWebsite; 