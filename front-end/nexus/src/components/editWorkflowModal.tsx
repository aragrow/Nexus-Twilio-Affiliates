import React, { useState } from "react";
import workFlowsStyles from "./workFlowsStyles"; // Assuming table styles are in dashboardStyles

type EditWorkflowModalProps = {
  workflow: any;
  onSave: (updated: any) => void;
  onCancel: () => void;
};

export const EditWorkflowModal = ({
  workflow,
  onSave,
  onCancel,
}: EditWorkflowModalProps) => {
  const [formData, setFormData] = useState({ ...workflow });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div style={workFlowsStyles.modalOverlay}>
      <div style={workFlowsStyles.modalContent}>
        <h2>Edit Workflow</h2>

        <label>
          Name:
          <input
            name="workFlowName"
            value={formData.workFlowName}
            onChange={handleChange}
          />
        </label>

        <label>
          Status:
          <select
            name="workFlowStatus"
            value={formData.workFlowStatus}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
        </label>

        <div style={workFlowsStyles.modalActions}>
          <button onClick={handleSubmit}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
