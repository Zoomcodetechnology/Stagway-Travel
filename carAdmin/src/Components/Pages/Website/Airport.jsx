import React, { useEffect, useState } from "react";
import { postData } from "../../../utility/Utility";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form } from "react-bootstrap";
import Swal from "sweetalert2";

export default function Airport() {
  const [airportDetails, setAirportDetails] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [airportToDelete, setAirportToDelete] = useState(null);

  async function handleUpdate() {
    if (!selectedAirport) {
      Swal.fire("Failed!", "Please select an airport", "error");
      return;
    }
    try {
      const res = await postData(`/airport/update/${selectedAirport._id}`, {
        name: selectedAirport.name
      });

      if (res.status) {
        Swal.fire("Success!", "Airport updated successfully", "success");
        setShowModal(false);
        getData();
      } else {
        Swal.fire("Failed!", res?.data?.message, "error");
      }
    } catch (error) {
      Swal.fire("Error!", "Failed to update airport", "error");
    }
  }

  function handleEdit(airport) {
    setSelectedAirport(airport);
    setShowModal(true);
  }

  function handleDeleteClick(airport) {
    setAirportToDelete(airport);
    setShowDeleteModal(true);
  }

  async function handleConfirmDelete() {
    try {
      const response = await postData(`/airport/remove/${airportToDelete._id}`);
      if (response.status) {
        Swal.fire("Deleted!", "Airport has been deleted.", "success");
        setAirportDetails(prev => prev.filter(airport => airport._id !== airportToDelete._id));
      } else {
        Swal.fire("Failed!", response?.data?.message, "error");
      }
    } catch (error) {
      Swal.fire("Error!", "Failed to delete airport", "error");
    }
    setShowDeleteModal(false);
    setAirportToDelete(null);
  }

  async function getData() {
    try {
      const res = await postData("/airport/findAll", {});
      setAirportDetails(res?.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="container py-4">
      <div className="card shadow">
        {/* Header */}
        <div className="card-header bg-primary bg-gradient text-white">
          <div className="d-flex align-items-center">
            <i className="bi bi-airplane-engines me-2 fs-4"></i>
            <h5 className="mb-0">Airport Management</h5>
          </div>
        </div>

        {/* Content */}
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-bordered">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="bg-light text-start" style={{ width: '70%' }}>Airport Name</th>
                    <th scope="col" className="bg-light text-center" style={{ width: '30%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {airportDetails?.map((airport, index) => (
                    <tr key={index}>
                      <td className="text-start align-middle ps-3">{airport.name}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleEdit(airport)}
                          >
                            <i className="bi bi-pencil me-1"></i>
                            Update
                          </button>
                          <button
                            onClick={() => handleDeleteClick(airport)}
                            className="btn btn-outline-danger btn-sm"
                          >
                            <i className="bi bi-trash me-1"></i>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Edit Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Edit Airport</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedAirport && (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Airport Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedAirport.name}
                      onChange={(e) =>
                        setSelectedAirport({
                          ...selectedAirport,
                          name: e.target.value,
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
              <Button variant="primary" onClick={handleUpdate}>
                Update
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete {airportToDelete?.name}? This action cannot be undone.
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Yes, Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}