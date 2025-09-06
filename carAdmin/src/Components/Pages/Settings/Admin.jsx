import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminAccess.css";
import { imageUrl } from "../../../config";

const permissions = [
  "All",
  "Bookings",
  "Website",
  "Database",
  "Reports",
  "Invoice",
  "Export",
  "MIS",
  "Admin & Access",
];

const users = [
  {
    img: "https://png.pngtree.com/png-vector/20190321/ourmid/pngtree-vector-users-icon-png-image_856952.jpg",
    name: "John Doe",
  },
  {
    img: "https://png.pngtree.com/png-vector/20190321/ourmid/pngtree-vector-users-icon-png-image_856952.jpg",
    name: "Jane Smith",
  },
  {
    img: "https://png.pngtree.com/png-vector/20190321/ourmid/pngtree-vector-users-icon-png-image_856952.jpg",
    name: "Michael Brown",
  },
  {
    img: "https://png.pngtree.com/png-vector/20190321/ourmid/pngtree-vector-users-icon-png-image_856952.jpg",
    name: "Emily Johnson",
  },
];
const CheckboxTable = () => {
  const [checkedState, setCheckedState] = useState(
    users.map(() => Array(permissions.length).fill(false))
  );

  const handleCheck = (userIndex, permIndex) => {
    const newState = checkedState.map((row, i) =>
      i === userIndex
        ? row.map((val, j) => (j === permIndex ? !val : val))
        : row
    );
    if (permIndex === 0) {
      const allChecked = !checkedState[userIndex][0];
      newState[userIndex] = newState[userIndex].map(() => allChecked);
    } else {
      // If any other checkbox is manually unchecked, also uncheck "All"
      if (!newState[userIndex].slice(1).every(Boolean)) {
        newState[userIndex][0] = false;
      } else {
        newState[userIndex][0] = true;
      }
    }

    setCheckedState(newState);
  };

  return (
    // <div className="container mt-4">
    //   <div className="table-responsive">
    //     <table className="table  table-hover text-center">
    //       <thead className="table-dark">
    //         <tr>
    //           <th className="text-white">User</th>
    //           {permissions.map((perm, index) => (
    //             <th key={index} className="text-white">
    //               {perm}
    //             </th>
    //           ))}
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {users.map((user, userIndex) => (
    //           <tr key={userIndex}>
    //             <td className="d-flex align-items-center">
    //               <img
    //                 src={${imageUrl}${user.img}}
    //                 alt={user.name}
    //                 className="rounded-circle me-2"
    //                 width="40"
    //                 height="40"
    //               />
    //             </td>
    //             <td>
    //               <h2>{user.name}</h2>
    //             </td>
    //             {permissions.map((item, permIndex) => (
    //               <td key={permIndex}>
    //                 <input
    //                   type="checkbox"
    //                   checked={checkedState[userIndex][permIndex]}
    //                   onChange={() => handleCheck(userIndex, permIndex)}
    //                   className="form-check-input"
    //                 />
    //                 <label htmlFor="" className="tabledata">
    //                   {item}
    //                 </label>
    //               </td>
    //             ))}
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   </div>
    // </div>
    <div className="container mt-4">
      <div className="table-responsive">
        <table className="table table-striped table-bordered text-center shadow-lg rounded">
          <thead className="table-dark">
            <tr>
              <th className="text-white">User</th>
              <th className="text-white">Name</th>
              {permissions.map((perm, index) => (
                <th key={index} className="text-white">
                  {perm}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, userIndex) => (
              <tr key={userIndex} className="align-middle">
                {/* User Image & Name */}
                <td className="d-flex align-items-center justify-content-center">
                  <img
                    src={user.img}
                    alt={user.name}
                    className="rounded-circle me-2 "
                    width="50"
                    height="50"
                    style={{ objectFit: "cover" }}
                  />
                </td>
                <td>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "16px" }}>
                    {user.name}
                  </h5>
                </td>

                {/* Permissions Checkboxes */}
                {permissions.map((item, permIndex) => (
                  <td key={permIndex}>
                    <div className="d-flex flex-column align-items-center">
                      <input
                        type="checkbox"
                        checked={checkedState[userIndex][permIndex]}
                        onChange={() => handleCheck(userIndex, permIndex)}
                        className="form-check-input"
                      />
                      <label className="mt-1 small">{item}</label>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CheckboxTable;