import React, { useEffect, useState } from "react";
import style from "../Website/promoAddon.module.css";
import axios from "axios";
import { baseUrl } from "../../../config";
import { Modal, Button, Form } from "react-bootstrap";
import { Toaster, toast } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { postData } from "../../../utility/Utility";

const Addons = ({ addons, setAddons }) => {
  const [selectedAddOns, setSelectedAddOns] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("tokenData");

  // edit
  const handleDelete = (addonId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this addon?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await postData(`/addOn/remove/${addonId}`);
          console.log(res);
          if (res.status) {
            setAddons((prev) => prev.filter((addon) => addon._id !== addonId));
            Swal.fire("Deleted!", "Addon has been deleted.", "success");
            closeUserModal();
          } else {
            toast.error(res?.message);
          }
        } catch (error) {
          console.error("Error In Deleting Addon:", error);
        }
      }
    });
  };
  const handleEdit = (addons) => {
    setSelectedAddOns({
      ...addons,
      _id: addons._id,
      name: addons.name,
      price: addons.price,
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedAddOns) {
      Swal.fire("Failed!", "Please select a FAQ to update", "error");
      return;
    }

    try {
      const response = await postData(`/addOn/update/${selectedAddOns._id}`, {
        name: selectedAddOns.name,
        price: selectedAddOns.price,
      });

      console.log(response?.data, "harsh");
      if (response.status) {
        Swal.fire("Success!", response.data.message, "success");
        setAddons((prev) =>
          prev.map((addon) =>
            addon._id === selectedAddOns._id
              ? { ...addon, ...selectedAddOns }
              : addon
          )
        );
        setShowModal(false);
        setSelectedAddOns(null);
      } else {
        Swal.fire("Failed!", response.data.message, "error");
      }
    } catch (error) {
      console.error("Error updating addon:", error);
      Swal.fire("Failed!", response.data.message, "error");
    }
  };

  async function handleCheckBox(e, Id) {
    try {
      const res = await postData(`/addOn/update/${Id}`, {
        isActive: e.target.checked,
      });
      if (res?.status) {
        Swal.fire("Success!", res.message, "success");

        console.error("Error: Unexpected API response", res);
      } else {
        Swal.fire("Failed!", res.message, "error");
      }
    } catch (err) {
      console.error(err.message);
    }
  }
  return (
    <div>
      <Toaster position="top-center" />
      <div>
        {addons && addons.length > 0 ? (
          <table
            className={`table mt-5 text-center ${style.promoTable} ${style.carlisttable}`}
          >
            <thead>
              <tr className="table-success">
                <th>Status</th>
                <th>Add Ons Items</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {addons?.map((item,index) => (
                <tr key={index}>
                  <td>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`flexSwitchCheckDefault-${index}`}
                        onChange={(e) => handleCheckBox(e, item._id)}
                      />
                    </div>
                  </td>
                  <td>{item.name}</td>
                  <td>{item.price}</td>
                  <td>
                    <button
                      className={`btn-sm ${style.deleteBtn}`}
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                    <button
                      className={`btn-sm ${style.updatebtn}`}
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center mt-4">No AddOns available.</p>
        )}
      </div>

      {/* modal show edit delete */}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Ons Edit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAddOns && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Add Ons Items</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedAddOns.name}
                  onChange={(e) =>
                    setSelectedAddOns({
                      ...selectedAddOns,
                      name: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedAddOns.price}
                  onChange={(e) =>
                    setSelectedAddOns({
                      ...selectedAddOns,
                      price: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Addons;
