import React, { useEffect, useState } from "react";
import style from "../Website/promoAddon.module.css";
import { Modal, Button, Form } from "react-bootstrap";
import { Toaster, toast } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { postData } from "../../../utility/Utility";

const Promocode = ({ promos, setPromos }) => {
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const handleDelete = (promoId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this promo?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await postData(`/promoCode/remove/${promoId}`,)
          console.log(res)
          if (res.status) {
            Swal.fire("Success!", res?.data?.message, "success");

            setPromos((prev) => prev.filter((promo) => promo._id !== promoId));
            closeUserModal();
          } else {
            Swal.fire("Failed!", res?.data?.message, "error");
          }
        }
        catch (error) {
          console.error("Error In Deleting promos:", error);
        }
      }
    });
  };

  // edit
  const handleEdit = (promo) => {
    setSelectedPromo({
      _id: promo._id,
      code: promo.code,
      discount: promo.discount,
      startDate: promo.startDate ? promo.startDate.split("T")[0] : "",
      endDate: promo.endDate ? promo.endDate.split("T")[0] : "",
    });
    setShowModal(true);
  };

  // update
  const handleUpdate = async () => {
    try {
      const response = await postData(
        `/promoCode/update/${selectedPromo._id}`,
        {
          selectedPromo,
          code: selectedPromo.code,
          discount: selectedPromo.discount,
          startDate: selectedPromo.startDate,
          endDate: selectedPromo.endDate,
          status: selectedPromo.status,
        },
        
      );
      if (response.status) {
        Swal.fire("Success!", response.data.message, "success");
        // fetchPromoCode();
        setPromos((prev) =>
          prev.map((promo) =>
            promo._id === selectedPromo._id
              ? { ...promo, ...selectedPromo }
              : promo
          )
        );

        setShowModal(false);
      }
    } catch (error) {
      console.error("Error updating promo:", error);
      Swal.fire("Failed!", response.data.message, "error");
    }
  };

  const handleCheckboxChange = async (e, id) => {
    try {
      const res = await postData(`/promoCode/update/${id}`, {
        isActive: e.target.checked

      })
      if (res?.status) {
        Swal.fire("Success!",res.message,"success");

        console.error("Error: Unexpected API response", res);
      } else {
        Swal.fire("Failed!", res.message, "error");
      }
    } catch (err) {
      console.error(err.message);
    }
  };



  return (
    <div>
      <Toaster position="top-center" />
      <div>
        <tr>
          <td></td>
          <td></td>
        </tr>

        {
          promos && promos.length > 0 ?(
            <table
            className={` table mt-5 text-center ${style.promoTable} ${style.carlisttable}`}
          >
            <thead>
              <tr class="table-success">
                <th>Status</th>
                <th>Promo Codes</th>
                <th>Discount(%)</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Action</th>
              </tr>
            </thead>
            {promos?.map((item, index) => (
              <tbody>
                <tr key={index}>
                  <td>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="flexSwitchCheckDefault"
                        onChange={(e) => handleCheckboxChange(e, item._id)}
                      />
                    </div>
                  </td>
                  <td>{item.code}</td>
                  <td>{item.discount}%</td>
                  <td>{new Date(item.startDate).toLocaleDateString()}</td>
                  <td>{new Date(item.endDate).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={` btn-sm ${style.deleteBtn}`}
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                    {/* <button className={` btn-sm ${style.inactivebtn}`}>
                      Inactive
                    </button> */}
                    <button
                      className={` btn-sm ${style.updatebtn}`}
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            ))}
          </table>
          ):(
            <p className="text-center mt-4">No Promo Code Available.</p>
          )
        }
      </div>
      {/* Bootstrap Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Promo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPromo && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Promo Code</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedPromo.code}
                  onChange={(e) =>
                    setSelectedPromo({ ...selectedPromo, code: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Discount (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedPromo.discount}
                  onChange={(e) =>
                    setSelectedPromo({
                      ...selectedPromo,
                      discount: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedPromo.startDate || ""}
                  onChange={(e) =>
                    setSelectedPromo({
                      ...selectedPromo,
                      startDate: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedPromo.endDate || ""}
                  onChange={(e) =>
                    setSelectedPromo({
                      ...selectedPromo,
                      endDate: e.target.value,
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

export default Promocode;
