import React, { useState } from "react";
import modalStyles from "./modalStyles"; // Assuming table styles are in dashboardStyles
import type {
  ModalProps,
  EditWorkFlowModalProps,
  WorkFlowForm,
} from "./interface";

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-lg relative">
        {/* Close button (top-right corner) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Render passed children */}
        {children}
      </div>
    </div>
  );
};

/**
 * Modal for editing or creating a workflow
 */
export const EditWorkFlowModal: React.FC<EditWorkFlowModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  // Form state initialized with existing data or defaults
  const [form, setForm] = useState<WorkFlowForm>(
    initialData || {
      client_id: 0,
      workflow_name: "",
      workflow_status: "active",
    }
  );

  /**
   * Handles changes in input and select fields
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Submits the form data to onSave handler
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    onSave(form); // Trigger external save handler
    onClose(); // Close modal after saving
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4">Edit Workflow</h2>

      {/* Workflow edit form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Client ID input */}
        <input
          type="number"
          name="client_id"
          value={form.client_id}
          onChange={handleChange}
          placeholder="Client ID"
          className="p-2 border border-gray-300 rounded-lg"
        />

        {/* Workflow name input */}
        <input
          type="text"
          name="workflow_name"
          value={form.workflow_name}
          onChange={handleChange}
          placeholder="Workflow Name"
          className="p-2 border border-gray-300 rounded-lg"
        />

        {/* Workflow status dropdown */}
        <select
          name="workflow_status"
          value={form.workflow_status}
          onChange={handleChange}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="archived">Archived</option>
        </select>

        {/* Form action buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};
