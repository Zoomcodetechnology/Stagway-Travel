import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import style from "../Website/faqs.module.css";
import { postData } from "../../../utility/Utility";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";

function Faqs({ faqs, setFaqs }) {
  const [faqData, setFaqData] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const token = localStorage.getItem("tokenData");

  const toggleAccordion = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  const handleEdit = (faq) => {
    console.log("Editing FAQ:", faq);
    setSelectedFaq(faq);
    setShowEditModal(true);
  };

  const handleDelete = (faq) => {
    setSelectedFaq(faq);
    setShowDeleteModal(true);
  };

  const handleUpdate = async () => {
    console.log("Selected FAQ before update:", selectedFaq); // ✅ Debugging log

    if (!selectedFaq || !selectedFaq._id) {
      Swal.fire("Failed!", "No FAQ selected for update.", "error");
      return;
    }

    try {
      const response = await postData(`/faq/update`, {
        faqId: selectedFaq._id,
        question: selectedFaq.question,
        answer: selectedFaq.answer,
        type: selectedFaq.type || [], // Ensure type is included
      });

      if (response.status) {
        Swal.fire("Success!", "FAQ updated successfully", "success");

        setFaqs((prevFaqs) =>
          prevFaqs.map((faq) =>
            faq._id === selectedFaq._id ? { ...faq, ...selectedFaq } : faq
          )
        );

        setShowEditModal(false);
      } else {
        Swal.fire(
          "Failed!",
          response?.data?.message || "Update failed",
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating FAQ:", error);
      Swal.fire("Error!", "Failed to update FAQ", "error");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await postData(`/faq/remove/${selectedFaq._id}`);
      if (response?.status) {
        Swal.fire("Deleted!", "FAQ has been deleted.", "success");
        setFaqs((prevFaqs) =>
          prevFaqs.filter((faq) => faq._id !== selectedFaq._id)
        );
        setShowDeleteModal(false);
      } else {
        Swal.fire("Failed!", response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      Swal.fire("Error!", "Failed to delete FAQ", "error");
    }
  };

  return (
    <>
      <div className="container mt-5">
        {faqs.length > 0 ? (
          faqs.map((item, index) => (
            <div key={index} className={style.questiontxt}>
              <span
                className="d-flex justify-content-between align-items-center w-100 text-start p-3"
                onClick={() => toggleAccordion(index)}
              >
                <span>{item.question}</span>
                {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
              </span>
              {openIndex === index && (
                <div className="p-3 d-flex align-items-center justify-content-between">
                  <div className={style.faqAnsTxt}>
                    <p>{item.answer}</p>
                  </div>
                  <div className={style.faqBtnContainer}>
                    <button
                      onClick={() => handleEdit(item)}
                      className={style.faqBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className={style.faqBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center mt-4">No FAQ available.</p>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit FAQ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFaq && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Question</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedFaq.question}
                  onChange={(e) =>
                    setSelectedFaq({
                      ...selectedFaq,
                      question: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Answer</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={selectedFaq.answer}
                  onChange={(e) =>
                    setSelectedFaq({
                      ...selectedFaq,
                      answer: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Categories</Form.Label>
                <div className="d-flex gap-3">
                  {/* Local Checkbox */}
                  <Form.Check
                    type="checkbox"
                    label="Local"
                    value="Local"
                    checked={selectedFaq.type?.includes("Local") || false}
                    onChange={(e) =>
                      setSelectedFaq({
                        ...selectedFaq,
                        type: e.target.checked
                          ? [...(selectedFaq.type || []), "Local"]
                          : selectedFaq.type.filter((cat) => cat !== "Local"),
                      })
                    }
                  />

                  <Form.Check
                    type="checkbox"
                    label="Airport Transfer"
                    value="Airport Transfer"
                    checked={
                      selectedFaq.type?.includes("Airport Transfer") || false
                    }
                    onChange={(e) =>
                      setSelectedFaq({
                        ...selectedFaq,
                        type: e.target.checked
                          ? [...(selectedFaq.type || []), "Airport Transfer"]
                          : selectedFaq.type.filter(
                              (cat) => cat !== "Airport Transfer"
                            ),
                      })
                    }
                  />

                  <Form.Check
                    type="checkbox"
                    label="Intercity"
                    value="Intercity"
                    checked={selectedFaq.type?.includes("Intercity") || false}
                    onChange={(e) =>
                      setSelectedFaq({
                        ...selectedFaq,
                        type: e.target.checked
                          ? [...(selectedFaq.type || []), "Intercity"]
                          : selectedFaq.type.filter(
                              (cat) => cat !== "Intercity"
                            ),
                      })
                    }
                  />
                </div>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this FAQ? This action cannot be
          undone.
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
    </>
  );
}

export default Faqs;
