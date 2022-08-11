import Modal from "react-modal";
import React from "react";

import ChainSelector from "./ChainSelector";

const modalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    border: "0px",
    borderRadius: "1.5rem",
    paddingBottom: "25px",
  },
  overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
};

export default function ChainSelectorModal({ openModal, toggleOpenModal }) {
  return (
    <Modal
      isOpen={openModal}
      onRequestClose={toggleOpenModal}
      style={modalStyles}
    >
      <div className="flex flex-col gap-4">
        <ChainSelector />
      </div>
    </Modal>
  );
}
