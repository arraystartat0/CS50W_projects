import React from "react";
import "../../assets/css/ConfirmationModal.css";

function ConfirmDeleteModal({ 
  isOpen, 
  message, 
  onConfirm, 
  onCancel, 
  title = "Confirm Deletion?",
  confirmText = "Yes, Delete"
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h4 className="mb-3">{title}</h4>
        <p className="mb-4">{message}</p>
        <div className="d-flex justify-content-end">
          <button className="btn border border-1 border-black unround me-2" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-outline-danger unround" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;