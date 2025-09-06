import React, { useEffect, useState } from "react";
import { MdCurrencyRupee } from "react-icons/md";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { Toaster, toast } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { imageUrl } from "../../../config";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { postData, postDataWithFile } from "../../../utility/Utility";
import Style from "./cars.module.css";
const Cars = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editCar, setEditCar] = useState(null);
  const [carDetails, setCarDetails] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [carData, setCarData] = useState({
    title: "",
    cities: [],
    category: "",
    bookingType: [],
    fuelType: "",
    capacity: "",
    luggage: "",
    priceHour: 0,
    pricePerKm: 0,
    flatRate: 0,
  });
  const [image, setImage] = useState(null);
  // Function to open modal
  const openModal = () => {
    setIsOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setIsOpen(false);
  };
  useEffect(() => {
    fetchCarDetails();
  }, []);

  const fetchCarDetails = async () => {
    try {
      const response = await postData("/rentalCar/findAll");
      if (response?.data) {
        setCarDetails(response?.data?.rentalCars);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };
  //for  Updating car Status
  const handleCheckboxChange = async (e, id) => {
    try {
      const res = await postData(`/rentalCar/changeStatus/${id}`, {
        isActive: e.target.checked,
      });

      if (res?.status) {
        Swal.fire("Success!", res?.message, "success");
      } else {
        toast.error(res?.message || "Failed to update status.");
      }
    } catch (err) {
      console.error("API Error:", err);
      toast.error("Something went wrong!");
    }
  };

  //for updating car details on update form
  const handleUpdate = async (e) => {
    e.preventDefault();

    // Ensure `cities` is an array of strings
    const formattedCar = {
      ...editCar,
      cities: Array.isArray(editCar.cities)
        ? editCar.cities.map((city) => city.trim()) // Trim whitespace
        : editCar.cities.split(",").map((city) => city.trim()), // Convert to array if it's a string
    };
    delete formattedCar.image;

    const files = {
      image: editCar.image,
    };
    try {
      const response = await postDataWithFile(
        `/rentalCar/update/${editCar._id}`,
        formattedCar,
        files
      );

      if (response.status) {
        Swal.fire("Success!", response?.message, "success");
        setCarDetails((prev) =>
          prev.map((car) =>
            car._id === editCar._id ? { ...car, ...response?.data } : car
          )
        );
        setEditCar(null);
      }
    } catch (error) {
      console.error("Update Error:", error);
      Swal.fire(
        "Failed!",
        error.response?.data?.message || "Something went wrong",
        "error"
      );
    }
  };
  const fileHandler = (e) => {
    setImage(e.target.files[0]);
  };
  // for deleting car
  const handleDelete = async (carId, event) => {
    if (event) event.preventDefault(); // Prevent default form submission
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this car?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await postData(`/rentalCar/remove/${carId}`);
          if (response.status) {
            fetchCarDetails();
            setEditCar(null);
            Swal.fire("Success", response?.message, "success");
            navigate("/MainWebite");
          } else {
            Swal.fire("Failed!", response?.message, "error");
          }
        } catch (error) {
          console.error("Error deleting car:", error);
          Swal.fire("Failed!", "Something went wrong!", "error");
        }
      }
    });
  };
 
  const inputHandler = (e) => {
    const { name, value } = e.target;
    setCarData((prev) => ({
      ...prev,
      [name]: name === "cities" ? [value] : value,
    }));
  };
  const handleCheck = (e) => {
    const { value, checked } = e.target;
    setSelectedTypes((prev) =>
      checked ? [...prev, value] : prev.filter((type) => type !== value)
    );
  };
  //for car adding
  async function handleAddCar(e) {
    e.preventDefault();
    const finalCarData = {
      ...carData,
      bookingType: JSON.stringify(selectedTypes),
      cities: JSON.stringify(carData.cities),
    };
    const files = {
      image: image,
    };
    let res = await postDataWithFile("/rentalCar/create", finalCarData, files);
    if (res.status) {
      fetchCarDetails();
      closeModal();
      Swal.fire("Success", res?.message, "success");
      navigate("/MainWebite");
    } else {
      Swal.fire("Failed!", res?.message, "error");
    }
  }
  return (
    <div className="table-responsive mt-4">
      <Toaster position="top-center" />
      <table className="table car-list-table">
        <thead>
          <tr>
            <th>
              {/* <FaArrowDown /> */}
              Car Name
            </th>
            <th>Category</th>
            <th>Booking Type</th>
            <th>Image</th>
            <th>Capacity</th>
            <th>
              <button
                type="button"
                className="btn-new"
                class="btn btn-primary"
                onClick={openModal}
              >
                New
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {carDetails?.map((car, index) => (
            <tr key={index}>
              <td>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="flexSwitchCheckDefault"
                    onChange={(e) => handleCheckboxChange(e, car._id)}
                  />
                  <label className="form-check-label">{car.title}</label>
                </div>
              </td>
              <td>{car.category || "-"}</td>
              {/* <td>
                  {car?.bookingType === "Local"
                    ? car?.priceHour
                    : car?.bookingType === "Intercity"
                      ? car?.pricePerKm
                      : car?.bookingType === "Airport Transfer"
                        ? car?.flatRate
                        : "N/A"}
                </td> */}

              <td>
                {Array.isArray(car.bookingType)
                  ? car.bookingType.join(" - ")
                  : car.bookingType}
              </td>
              {/* <td>{car.image || "No image"}</td> */}
              <td>
                {car.image ? (
                  <img
                    // ${imageUrl}
                    src={`${imageUrl}${car.image}`}
                    alt="Car"
                    style={{
                      width: "100px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  "No image"
                )}
              </td>

              <td>{car.capacity}</td>
              <td>
                <button
                  type="button"
                  className="btn dotbtn"
                  onClick={() => setEditCar({ ...car })}
                >
                  <PiDotsThreeOutlineVerticalFill />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg">
              {/* Modal Header */}
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="bi bi-check-circle-fill me-2"></i> Success
                </h5>
                <button
                  type="button"
                  className="btn-close text-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body text-center">
                <i className="bi bi-check-circle-fill text-success fs-1"></i>
                <p className="mt-3 fs-5">Status changed successfully!</p>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer d-flex justify-content-center">
                <button
                  type="button"
                  className="btn btn-success px-4"
                  onClick={() => setShowModal(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* add */}
      <div
        // class="modal fade"
        className={`modal fade ${isOpen ? "show d-block" : ""}`}
        id="car"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden={!isOpen}
      >
        <div class={`modal-dialog ${Style.customModal}`}>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">
                Car
              </h5>
              <button
                type="button"
                class="btn-close"
                // data-bs-dismiss="modal"
                aria-label="Close"
                onClick={closeModal}
              ></button>
            </div>
            <form onSubmit={handleAddCar}>
              <div className="modal-body p-4">
                <div className="row g-4">
                  {/* Basic Information - Top Row */}
                  <div className="col-md-6">
                    <label htmlFor="car" className="form-label">
                      Car Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="car"
                      placeholder="Car Name"
                      name="title"
                      onKeyDown={(e) => {
                        if (e.key >= "0" && e.key <= "9") {
                          e.preventDefault();
                        }
                      }}
                      onChange={inputHandler}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="city" className="form-label">
                      City Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="city"
                      placeholder="City Name"
                      name="cities"
                      onKeyDown={(e) => {
                        if (e.key >= "0" && e.key <= "9") {
                          e.preventDefault();
                        }
                      }}
                      onChange={inputHandler}
                    />
                  </div>

                  {/* Second Row */}
                  <div className="col-md-6">
                    <label htmlFor="fuelType" className="form-label">
                      Fuel Type
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="fuelType"
                      placeholder="Fuel Type"
                      name="fuelType"
                      onKeyDown={(e) => {
                        if (e.key >= "0" && e.key <= "9") {
                          e.preventDefault();
                        }
                      }}
                      onChange={inputHandler}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="category" className="form-label">
                      Category
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="category"
                      placeholder="Category"
                      name="category"
                      onKeyDown={(e) => {
                        if (e.key >= "0" && e.key <= "9") {
                          e.preventDefault();
                        }
                      }}
                      onChange={inputHandler}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label d-block mb-2">
                      Booking Type
                    </label>
                    <div className="d-flex flex-wrap gap-4 mt-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="local"
                          name="bookingType"
                          value="Local"
                          checked={selectedTypes.includes("Local")}
                          onChange={handleCheck}
                        />
                        <label
                          className="form-check-label Custom-lable"
                          htmlFor="local"
                        >
                          Local
                        </label>
                      </div>

                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="airportTransfer"
                          name="bookingType"
                          value="Airport Transfer"
                          checked={selectedTypes.includes("Airport Transfer")}
                          onChange={handleCheck}
                        />
                        <label
                          className="form-check-label Custom-lable"
                          htmlFor="airportTransfer"
                        >
                          Airport Transfer
                        </label>
                      </div>

                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="intercity"
                          name="bookingType"
                          value="Intercity"
                          checked={selectedTypes.includes("Intercity")}
                          onChange={handleCheck}
                        />
                        <label
                          className="form-check-label Custom-lable"
                          htmlFor="intercity"
                        >
                          Intercity
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="image" className="form-label">
                      Image
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="image"
                      placeholder="Choose an Image"
                      name="image"
                      accept="image/*"
                      required
                      onChange={fileHandler}
                    />
                  </div>

                  <div className="col-12">
                    <div className="row g-3">
                      {selectedTypes.includes("Local") && (
                        <div className="col-md-4">
                          <label
                            htmlFor="localRate"
                            className="form-label text-muted"
                          >
                            Local <MdCurrencyRupee /> /hour
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            id="localRate"
                            placeholder="00"
                            name="priceHour"
                            defaultValue={0}
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
                            onChange={inputHandler}
                          />
                        </div>
                      )}

                      {selectedTypes.includes("Airport Transfer") && (
                        <div className="col-md-4">
                          <label
                            htmlFor="airportRate"
                            className="form-label text-muted"
                          >
                            Flat Rate (Airport)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            id="airportRate"
                            placeholder="00"
                            name="flatRate"
                            defaultValue={0}
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
                            onChange={inputHandler}
                          />
                        </div>
                      )}

                      {selectedTypes.includes("Intercity") && (
                        <div className="col-md-4">
                          <label
                            htmlFor="intercityRate"
                            className="form-label text-muted"
                          >
                            Intercity <MdCurrencyRupee /> /km
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            id="intercityRate"
                            placeholder="00"
                            name="pricePerKm"
                            defaultValue={0}
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
                            onChange={inputHandler}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label
                          htmlFor="luggage"
                          className="form-label text-muted"
                        >
                          Luggage
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="luggage"
                          placeholder="00"
                          name="luggage"
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
                          onChange={inputHandler}
                        />
                      </div>

                      <div className="col-md-6">
                        <label
                          htmlFor="capacity"
                          className="form-label text-muted"
                        >
                          Capacity
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="capacity"
                          placeholder="00"
                          name="capacity"
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
                          onChange={inputHandler}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top p-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  // data-bs-dismiss="modal"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Car
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Car Modal */}
      {editCar && (
        <div
          className="modal show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className={`modal-dialog ${Style.customModal}`}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Car</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditCar(null)}
                />
              </div>

              <form onSubmit={handleUpdate} encType="multipart/form-data">
                <div className="modal-body p-4">
                  <div className="row g-4">
                    {/* Car Name */}
                    <div className="col-md-6">
                      <label className="form-label">Car Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editCar.title}
                        onChange={(e) =>
                          setEditCar((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* City Name */}
                    <div className="col-md-6">
                      <label className="form-label">City Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editCar.cities}
                        onChange={(e) =>
                          setEditCar((prev) => ({
                            ...prev,
                            cities: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* Fuel Type & Category */}
                    <div className="col-md-6">
                      <label className="form-label">Fuel Type</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editCar.fuelType}
                        onChange={(e) =>
                          setEditCar((prev) => ({
                            ...prev,
                            fuelType: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editCar.category}
                        onChange={(e) =>
                          setEditCar((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label d-block">Booking Type</label>
                      <div className="d-flex flex-wrap gap-4 mt-3">
                        {["Local", "Airport Transfer", "Intercity"].map(
                          (type) => (
                            <div className="form-check" key={type}>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                value={type}
                                checked={editCar.bookingType?.includes(type)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  setEditCar((prev) => ({
                                    ...prev,
                                    bookingType: isChecked
                                      ? [...prev.bookingType, type]
                                      : prev.bookingType.filter(
                                          (t) => t !== type
                                        ),
                                  }));
                                }}
                              />
                              <label className="form-check-label">{type}</label>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Image</label>
                      <input
                        type="file"
                        // value={JSON.stringify(editCar?.image)}
                        className="form-control"
                        onChange={(e) =>
                          setEditCar((prev) => ({
                            ...prev,
                            image: e.target.files[0],
                          }))
                        }
                      />
                    </div>

                    <div className="col-12">
                      <div className="row g-3">
                        {editCar.bookingType?.includes("Local") && (
                          <div className="col-md-4">
                            <label className="form-label">
                              Price per Hour (₹)
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={editCar.priceHour || 0}
                              onChange={(e) =>
                                setEditCar((prev) => ({
                                  ...prev,
                                  priceHour: e.target.value,
                                }))
                              }
                            />
                          </div>
                        )}
                        {editCar.bookingType?.includes("Airport Transfer") && (
                          <div className="col-md-4">
                            <label className="form-label">Flat Rate (₹)</label>
                            <input
                              type="number"
                              className="form-control"
                              value={editCar.flatRate || 0}
                              onChange={(e) =>
                                setEditCar((prev) => ({
                                  ...prev,
                                  flatRate: e.target.value,
                                }))
                              }
                            />
                          </div>
                        )}
                        {editCar.bookingType?.includes("Intercity") && (
                          <div className="col-md-4">
                            <label className="form-label">
                              Price per KM (₹)
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={editCar.pricePerKm || 0}
                              onChange={(e) =>
                                setEditCar((prev) => ({
                                  ...prev,
                                  pricePerKm: e.target.value,
                                }))
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Luggage</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editCar.luggage || ""}
                        onChange={(e) =>
                          setEditCar((prev) => ({
                            ...prev,
                            luggage: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Capacity</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editCar.capacity || ""}
                        onChange={(e) =>
                          setEditCar((prev) => ({
                            ...prev,
                            capacity: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>



                <div className="modal-footer border-top p-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setEditCar(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDelete(editCar._id)}
                  >
                    Delete
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cars;
