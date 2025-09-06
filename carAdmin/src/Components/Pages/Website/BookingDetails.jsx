import React, { useEffect, useState } from "react";
import "./BookingForm.css";
import { GrMapLocation } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { postData, postDataWithFile } from "../../../utility/Utility";
import { imageUrl } from "../../../config";

const BookingDetails = ({ onclose }) => {
  const bookingId = localStorage.getItem("selectedBookingId");
  const [isVisible, setIsVisible] = useState(true);
  const [bookingData, setBookingData] = useState({
    pnr: "",
    fullName: "",
    number: "",
    email: "",
    pickUpAddress: "",
    dropOffAddress: "",
    anyNotes: "",
    pickUpDate: "",
    pickUpTime: "",
    dropOffDate: "",
    dropOffTime: "",
    bookingStatus: "",
    paymentStatus: "",
    addons: [],
    fuelType: "",
  });

 
  const [driverDetails, setDriverDetails] = useState({
    bookingId: bookingId,
    name: "",
    mobileNumber: "",
    // image: "",
    carNumber: "",
    carName: "",
    // carImage: "",
  });
  const [files, setFiles] = useState({ carImage: null, image: null });
  const [driverPreviewImage, setDriverPreviewImage] = useState(null);
  const [carPreviewImage, setCarPreviewImage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, [e.target.name]: file });

      if (e.target.name === "image") {
        setDriverPreviewImage(URL.createObjectURL(file));
      } else if (e.target.name === "carImage") {
        setCarPreviewImage(URL.createObjectURL(file));
      }
    }
  };
  const navigate = useNavigate();
 
  const [driverDetailsFetched, setDriverDetailsFetched] = useState(false);
  const fetchBookingDetails = async () => {
    try {
      const res = await postData(`/booking/findById/${bookingId}`,{});
      if (res.status) {
        toast.success(res.message);
        const booking = res.data;

        setBookingData({
          pnr: booking.pnr || "",
          fullName: booking.bookingInfoId?.fullName || "Not Available",
          number: booking.bookingInfoId?.number || "",
          email: booking.bookingInfoId?.email || "",
          bookingType: booking.bookingType,
          city: booking.city || "Not Available",
          pickUpLocation:
            booking.bookingInfoId?.pickUpAddress || "Not Available",
          dropOffLocation:
            booking.bookingInfoId?.dropOffAddress || "Not Available",
          anyNotes: booking.bookingInfoId?.anyNotes || "Not Available",
          pickUpDate: booking.pickUpDate
            ? booking.pickUpDate.split("T")[0]
            : "",
          pickUpTime: booking.pickUpTime || "Not Available",
          dropOffDate: booking.dropOffDate
            ? booking.dropOffDate.split("T")[0]
            : "",
          dropOffTime: booking.dropOffTime || "Not Available",
          bookingStatus: booking.bookingStatus || "Not Available",
          paymentStatus: booking.paymentStatus || "Not Available",
          addons: booking.addons || [],
          title: booking.rentalCarId?.title || "Not Available",
          notes: booking.notes || "Not Available",
          fuelType: booking.rentalCarId?.fuelType || "Not Available",
          category: booking.rentalCarId?.category || "Not Available",
          flightNumber:
            booking.bookingType === "Airport Transfer"
              ? booking.flightNumber || "Not Available"
              : undefined,
        });
        if (booking.driverDetails) {
          setDriverDetails({
            bookingId:bookingId,
            name: booking.driverDetails.name || "",
            mobileNumber: booking.driverDetails.mobileNumber || "",
            carNumber: booking.driverDetails.carNumber || "",
            carName: booking.driverDetails.carName || "",
          });
          const driverImage = booking.driverDetails.image
            ? `${imageUrl}${booking.driverDetails.image}`
            : null;
          const carImage = booking.driverDetails.carImage
            ? `${imageUrl}${booking.driverDetails.carImage}`
            : null;

          setDriverPreviewImage(driverImage);
          setCarPreviewImage(carImage);
          if (
            booking.driverDetails.name ||
            booking.driverDetails.mobileNumber ||
            booking.driverDetails.carNumber ||
            booking.driverDetails.carName ||
            driverImage ||
            carImage
          ) {
            setDriverDetailsFetched(true);
          }
        }
      }
      else{
        toast.error(res.message,"asdfghjkl")
      }
    } catch (err) {
      console.error(res.message, err);
    }
  };
  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const handleAssignDriver = async () => {
    try {
      const res = await postDataWithFile(
        "/booking/assignDriver",
        driverDetails,
        files
      );
      if (res.status) {
        toast.success(res.message);
        setDriverDetails({
          name: "",
          mobileNumber: "",
          carNumber: "",
          carName: "",
        });
      } else {
        toast.error(res.message,"uygguyh");
      }
    } catch (error) {
      console.error("Error assigning driver:", error);
      toast.error("Failed to assign driver");
    }
  };

  const handleclose = () => {
    setIsVisible(false);
    navigate("/MainWebite");
  };

  //for booking delete
  // const handleDelete = (bookingId) => {
  //   Swal.fire({
  //     title: "Are you sure?",
  //     text: "You won't be able to revert this!",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#d33",
  //     cancelButtonColor: "#3085d6",
  //     confirmButtonText: "Yes, delete it!",
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       try {
  //         const res = await postData("/booking/remove", { bookingId });
  //         if (res?.status) {
  //           toast.success(res?.message);
  //           closeUserModal();
  //         } else {
  //           toast.error(res?.message);
  //         }
  //       } catch (error) {
  //         toast.error("Failed to delete booking. Please try again.");
  //       }
  //     }
  //   });
  // };
  return (
    isVisible && (
      <div className=" container booking-form-container">
        <Toaster position="top-center" />
        <h2 className=" text-center pb-2">Booking Details</h2>
        <div className="infodiv">
          <div className="carinfo">
            <p>City/Cities</p>
            <input
              type="text"
              className="myinput"
              value={
                bookingData.bookingType === "Intercity"
                  ? `${bookingData.pickUpLocation} / ${bookingData.dropOffLocation}`
                  : bookingData.city
              }
              readOnly
            />
          </div>
          <div className="carinfo">
            <p className=" carname">Car Title</p>
            <input
              type="text"
              className="myinput"
              value={bookingData.title}
              readOnly
            />
          </div>
          <div className="carinfo">
            <p>Booking Type</p>
            <input
              type="text"
              className="myinput"
              value={bookingData.bookingType}
              readOnly
            />
          </div>
          <div className="carinfo">
            <p className="par1">Fuel Type</p>
            <input
              type="text"
              className="myinput"
              value={bookingData.fuelType}
              readOnly
            />
          </div>
          <div className="caegorydiv">
            <p>Category</p>
            <input
              type="text"
              className="categoryinput"
              value={bookingData.category}
              readOnly
            />
          </div>
        </div>

        <div className="form-grid">
          <div>
            <label className="label-class">Pick Up Date</label>
            <input
              type="date"
              className="form-input"
              value={
                bookingData.pickUpDate
                  ? bookingData.pickUpDate.split("T")[0]
                  : ""
              }
              readOnly
            />
          </div>
          <div>
            <label className="label-class">Pick Up Time</label>
            <input
              type="time"
              className="form-input"
              value={bookingData.pickUpTime}
              readOnly
            />
          </div>
          <div>
            <label className="label-class">Drop Off Date</label>
            <input
              type="date"
              className="form-input"
              value={
                bookingData.dropOffDate
                  ? bookingData.dropOffDate.split("T")[0]
                  : ""
              }
            />
          </div>
          <div>
            <label className="label-class">Drop Off Time</label>
            <input
              type="time"
              className="form-input"
              value={bookingData.dropOffTime}
            />
          </div>
          <div className="pnrdiv">
            <label className="label-class">PNR</label>
            <input
              type="text"
              className="form-input"
              value={bookingData.pnr}
              readOnly
            />
          </div>
        </div>
        <hr className="divider" />

        <div className="info-grid">
          <div className="form-group">
            <label className="label-class">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Your Name"
              value={bookingData.fullName}
              readOnly
            />
          </div>
          <div className="form-group">
            <label className="label-class">Mobile</label>
            <input
              type="text"
              className="form-input"
              placeholder="Mobile No."
              value={bookingData.number}
              readOnly
            />
          </div>
          <div className="form-group">
            <label className="label-class">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your mail"
              value={bookingData.email}
              readOnly
            />
          </div>
        </div>
        <div className="info-grid">
          <div>
            <label className="label-class">
              Pick Up Location &nbsp;
              <GrMapLocation />{" "}
            </label>
            <textarea
              className="textareafield"
              value={bookingData?.pickUpLocation}
              disabled
            ></textarea>
          </div>
          <div>
            <label className="label-class">
              Drop Off Location &nbsp;
              <GrMapLocation />
            </label>
            <textarea
              className="textareafield"
              value={bookingData.dropOffLocation}
              disabled
            ></textarea>
          </div>
          <div>
            <label className="label-class">Any Notes</label>
            <textarea
              className="textareafield"
              value={bookingData.anyNotes}
              disabled
            ></textarea>
          </div>
        </div>

       
        <div className="flightdiv d-flex">
          {bookingData.flightNumber && (
            <>
             <lable>Flight no</lable>
            <input
              type="text"
              placeholder="Flight No."
              value={bookingData.flightNumber}
              className="coldiv col-md-4"
              disabled
            />
            </>
           
          )}
          <input
            type="text"
            placeholder="Payment ID"
            className=" coldiv col-md-4"
            disabled
          />
          <label htmlFor="" className="col-md-2 label-class">
            Payment Status
          </label>
          <input
            type="text"
            className="form-input selectstatus"
            value={bookingData.paymentStatus}
            readOnly
          />
        </div>
        <div className="AddOndiv">
          <label htmlFor="" className="addons">
            AddOns
          </label>

          {/* Name Textarea */}

          <textarea
            className="textareafield"
            value={
              Array.isArray(bookingData.addons) &&
              bookingData.addons.some((a) => a.addonId?.name)
                ? bookingData.addons
                    .filter((a) => a.addonId?.name)
                    .map((a) => a.addonId?.name)
                : "Not Available"
            }
            readOnly
          />

          <textarea
            className="textareafield"
            value={
              Array.isArray(bookingData.addons) &&
              bookingData.addons.some((a) => a.addonId?.price)
                ? bookingData.addons
                    .map((a, index) => `${index + 1}. ₹${a.addonId?.price}`)
                    .join("\n")
                : "Not Available"
            }
            readOnly
          />
        </div>
        <div className="car-grid">
          <div className="driverinfo">
            <label className="driverlabel">Driver Name</label>
            <input
              type="text"
              placeholder="Enter Driver Name"
              className="car-input form-control"
              value={driverDetails.name}
              onChange={(e) =>
                setDriverDetails({ ...driverDetails, name: e.target.value })
              }
              disabled={driverDetailsFetched}
            />
            <input
              type="file"
              className="car-input imageinput form-control"
              placeholder="Choose an Image"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              disabled={driverDetailsFetched}
            />
            <div className="col-md-6">
              {driverPreviewImage ? (
                <img
                  key={driverPreviewImage}
                  src={driverPreviewImage}
                  alt="Driver"
                  style={{
                    width: "150px",
                    height: "100px",
                    objectFit: "cover",
                    marginTop: "10px",
                  }}
                />
              ) : (
                "No Image Available"
              )}
            </div>
          </div>

          <div>
            <div className="driverinfo">
              <label className="driverlabel">Driver Mobile</label>
              <input
                type="number"
                className="car-input form-control"
                value={driverDetails.mobileNumber}
                onKeyDown={(e) => {
                  if (
                    e.key === "e" ||
                    e.key === "E" ||
                    e.key === "+" ||
                    e.key === "-"
                  ) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) =>
                  setDriverDetails({
                    ...driverDetails,
                    mobileNumber: e.target.value,
                  })
                }
                disabled={driverDetailsFetched}
                placeholder="Enter Mobile No."
              />
            </div>
          </div>
          <div className="driverinfo">
            <label className="driverlabel ">Car No.</label>
            <input
              type="text"
              className="car-input form-control"
              value={driverDetails.carNumber}
              onChange={(e) =>
                setDriverDetails({
                  ...driverDetails,
                  carNumber: e.target.value,
                })
              }
              disabled={driverDetailsFetched}
              placeholder="Enter Car Number"
            />
            <input
              type="file"
              className="car-input imageinput form-control"
              placeholder="Choose an Image"
              accept="image/*"
              name="carImage"
              onChange={handleFileChange}
              disabled={driverDetailsFetched}
            />
            <div className="col-md-6">
              {carPreviewImage ? (
                <img
                  src={carPreviewImage}
                  alt="Car"
                  style={{
                    width: "150px",
                    height: "100px",
                    objectFit: "cover",
                    marginTop: "10px",
                  }}
                />
              ) : (
                "No Image Selected"
              )}
            </div>
          </div>
          <div className="driverinfo">
            <label className="driverlabel fuelType">Car</label>
            <input
              type="text"
              className="car-input form-control"
              value={driverDetails.carName}
              onChange={(e) =>
                setDriverDetails({ ...driverDetails, carName: e.target.value })
              }
              disabled={driverDetailsFetched}
              placeholder="Enter Car Name"
            />
          </div>
        </div>
        <div className="button-group">
          <button type="button" className="cancel-button" onClick={handleclose}>
            Cancel
          </button>

          <button
            type="button"
            className="update-button"
            onClick={handleAssignDriver}
          >
            Update
          </button>
        </div>
      </div>
    )
  );
};

export default BookingDetails;
