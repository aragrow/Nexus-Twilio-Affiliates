// WorkflowDetailsEditor.tsx with updated status field
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_WORKFLOW_DETAILS } from "./graphqlQueries";
import { styles } from "./workflowDetailsEditorStyles";
import type {
  WorkFlow,
  UpdateWorkflowDetailsInput,
  EditWorkflowDetailsProps,
} from "./interface";

const WorkflowDetailsEditor: React.FC<EditWorkflowDetailsProps> = ({
  workflowId,
  workflowName,
  clientId,
  onSave,
  onBack,
}) => {
  const [form, setForm] = useState<UpdateWorkflowDetailsInput>({
    name: workflowName || "",
    status: "active", // Default to active
    workflowId: workflowId,
    clientId: clientId,
  });

  const [updateWorkflowDetails, { isLoading, error, data }] = useMutation(
    UPDATE_WORKFLOW_DETAILS
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "checkbox"
        ? e.target.checked
          ? "active"
          : "inactive"
        : e.target.value;

    setForm({ ...form, [e.target.name]: value });
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateWorkflowDetails({ variables: { input: form } });
    if (res.data?.updateWorkflowDetails?.success && onSave) {
      setIsSaving(true);
      await onSave(res.data.updateWorkflowDetails.workflow);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Edit Workflow Details"
      style={styles.form}
    >
      <div style={styles.header}>
        <h2 style={styles.title}>Manage WorkFlow Details</h2>
      </div>
      <div>
        <label htmlFor="name" style={styles.label}>
          Workflow Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          aria-required="true"
          style={styles.input}
        />
      </div>

      <div style={styles.checkboxContainer}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="status"
            checked={form.status === "active"}
            onChange={handleChange}
            style={styles.checkbox}
          />
          <span style={styles.checkboxText}>Active</span>
          <span
            style={styles.statusIndicator}
            className={form.status === "active" ? "active" : "inactive"}
          >
            {form.status === "active" ? "Active" : "Inactive"}
          </span>
        </label>
      </div>

      <div style={styles.buttonContainer}>
        <button
          style={{ ...styles.button, ...styles.saveButton }}
          type="submit"
          disabled={isLoading}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={onBack}
          style={{ ...styles.button, ...styles.backButton }}
          disabled={isSaving || isLoading}
          type="button"
        >
          Back to Workflows
        </button>
      </div>

      {error && (
        <div role="alert" style={styles.error}>
          {error.message}
        </div>
      )}
      {data?.updateWorkflowDetails?.message && (
        <div style={styles.success}>{data.updateWorkflowDetails.message}</div>
      )}
    </form>
  );
};

export default WorkflowDetailsEditor;
