import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminAccess.css";
import axios from "axios";
import CheckboxTable from "./Admin";
import { baseUrl } from "../../../config";

const MainSettings = () => {
  const [adminProfile, setAdminProfile] = useState(null);
  const [FirstName, setFirstName] = useState("");
  const [Lastname, setLastName] = useState("");
  const [emailid, setEmailid] = useState("");
  const [Password, setPassword] = useState("");
  const [image, setImage] = useState(null);

  // Fetch admin profile on component mount
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("tokenData");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await axios.post(
          `${baseUrl}/admin/fetch-profile`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status) {
          setAdminProfile(response.data.data);
          setFirstName(response.data.data.first_Name);
          setLastName(response.data.data.last_Name);
          setEmailid(response.data.data.email);
        } else {
          console.error("Admin not found:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching admin profile:", error);
      }
    };

    fetchAdminProfile();
  }, []);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  return (
    <div className="container">
      <div className="p-2 maindiv">
        <div className="row rounded heading-card mycard">
          <div className="col-md-6 col-lg-3 my-3 namediv">
            <div className="mydiv">
              <p className="name">
                {adminProfile
                  ? adminProfile.first_Name + " " + adminProfile.last_Name
                  : "Loading..."}
              </p>
              <p className="mymail">
                {adminProfile ? adminProfile.email : "Loading..."}
              </p>
            </div>

            <div className="emaildiv">
              <p className="usertitle">SUPER ADMIN</p>
            </div>
          </div>
          <div className="col-md-6 col-lg-3 my-3 profilemain">
            <div>
              <img
                src={
                  adminProfile
                    ? adminProfile.image
                    : `https://i.ibb.co/0zWzmB8/Avatar.png`
                }
                alt="Profile"
                className="image"
              />
            </div>
            <div className="profilediv">
              <p className="mb-0 profilepic">Profile Picture</p>
              <div className="dashicon-user buttondiv">
                <button>Edit</button>
                <button className="updatebtn">Update</button>
              </div>
            </div>
          </div>
        </div>

        <div className="topbar">
          <ul
            className="nav nav-pills mb-3 ullist"
            id="pills-tab"
            role="tablist"
          >
            <li className="nav-item" role="presentation">
              <button
                className="nav-link active"
                id="pills-home-tab"
                data-bs-toggle="pill"
                data-bs-target="#pills-home"
                type="button"
                role="tab"
                aria-controls="pills-home"
                aria-selected="true"
              >
                General
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="pills-profile-tab"
                data-bs-toggle="pill"
                data-bs-target="#pills-profile"
                type="button"
                role="tab"
                aria-controls="pills-profile"
                aria-selected="false"
              >
                Admin Access
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="pills-contact-tab"
                data-bs-toggle="pill"
                data-bs-target="#pills-contact"
                type="button"
                role="tab"
                aria-controls="pills-contact"
                aria-selected="false"
              >
                Tab
              </button>
            </li>
          </ul>
          <div className="btnnn">
            <button
              type="button"
              className="dotbtn"
              data-bs-toggle="modal"
              data-bs-target="#dotbtn"
            >
              New User
            </button>
          </div>
        </div>

        <div className="tab-content" id="pills-tabContent">
          <div
            className="tab-pane fade show active"
            id="pills-home"
            role="tabpanel"
            aria-labelledby="pills-home-tab"
            tabIndex={0}
          >
            ...
          </div>
          <div
            className="tab-pane fade"
            id="pills-profile"
            role="tabpanel"
            aria-labelledby="pills-profile-tab"
            tabIndex={0}
          >
            <CheckboxTable />
          </div>
          <div
            className="tab-pane fade"
            id="pills-contact"
            role="tabpanel"
            aria-labelledby="pills-contact-tab"
            tabIndex={0}
          >
            ...
          </div>
        </div>
      </div>

      {/* {/ Modal for New User /} */}
      <div
        className="modal fade"
        id="dotbtn"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                New User
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="car" className="form-label">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="car"
                    placeholder="First Name"
                    value={FirstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="category" className="form-label">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="car"
                    placeholder="Last Name"
                    value={Lastname}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="image" className="form-label">
                    Image
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="image"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="luggage" className="form-label">
                    User EmailID
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="luggage"
                    placeholder="Enter your Mail"
                    value={emailid}
                    onChange={(e) => setEmailid(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="capacity" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="capacity"
                    placeholder="Password"
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn cancelbtn"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button type="button" className="btn deletebtn">
                Delete
              </button>
              <button type="button" className="btn btn-primary">
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSettings;
