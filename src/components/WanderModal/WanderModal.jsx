import React, { useEffect } from "react";
import "./WanderModal.css";

const WanderModal = ({ isOpen, onClose, illustration }) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="wander-modal-overlay" onClick={onClose}>
      <div
        className="wander-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="wander-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <img
          src={illustration}
          alt="Person looking through telescope"
          className="wander-illustration"
        />
        <h2 className="wander-message">Not all those who wander are lost :)</h2>
      </div>
    </div>
  );
};

export default WanderModal;
