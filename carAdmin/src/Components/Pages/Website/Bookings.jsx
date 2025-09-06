import axios from "axios";
import React, { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiRefreshCcw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { postData } from "../../../utility/Utility";

const Bookings = () => {
  const [bookingsData, setBookingsData] = useState([]);
  const [selectedBooking,setSelectedBooking]=useState();
  const navigate = useNavigate();
  useEffect(() => {
    fetchBookings();
  },[]);
  // for listing booking data
  const fetchBookings = async () => {
    try {
      const res = await postData("/booking/findAll", {});
      if (res?.status) {
        toast.success(res?.message);
        setBookingsData(res?.data);
      } else {
        toast.error(res?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const bookingDetail = (id ) => {
    localStorage.setItem("selectedBookingId",id);
    navigate(`/bookingDetails`);
  };
  
  return (
    <div>
      <table className="table table-responsive car-list-table">
        <thead>
          <tr>
            <th>PNR</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Booking Type</th>
            <th>City</th>
            <th>Booking Status</th>
            <th>Pick Up Date</th>
            <th>Pick Up Time</th>
            <th>
              <FiRefreshCcw />
            </th>
          </tr>
        </thead>
        <tbody>
          {bookingsData?.map((booking, index) => (
            <tr key={index}>
              <td>{booking.pnr}</td>
              <td>
                {booking.userId?.fullName
                  ? booking.userId.fullName.split(" ")[0]
                  : "-"}
              </td>
              <td>
                {booking.userId?.fullName
                  ? booking.userId.fullName.split(" ")[1]
                  : "-"}
              </td>
              <td>{booking.bookingType}</td>

              <td>
                {booking.city && booking.city !== ""
                  ? booking.city.split(",")[0] 
                  : booking.bookingType === "Intercity"
                  ? `${booking.pickUpLocation.split(",")[0]} - ${
                      booking.dropOffLocation.split(",")[0]
                    }` // Intercity: "Pickup - Drop"
                  : booking.bookingType === "airport transfer"
                  ? booking.airportName || "-" 
                  : "-"}
              </td>

              {/* to display intercity cities and airports name as well */}

              <td>{booking.bookingStatus}</td>
              <td>{booking.pickUpDate.split("T")[0]}</td>
              <td>{booking.pickUpTime}</td>
              <td>
                <BsThreeDotsVertical
                  onClick={(e) => {
                    e.stopPropagation();
                    bookingDetail(booking._id);
                    

                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Bookings;
