import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_WORKFLOW_DETAILS } from "./graphqlQueries";
import type { WorkFlow, UpdateWorkflowDetailsInput } from "./interface";

interface EditWorkflowDetailsProps {
  workflow: WorkFlow;
  onUpdated?: (workflow: WorkFlow) => void;
}

const EditWorkflowDetails: React.FC<EditWorkflowDetailsProps> = ({
  workflow,
  onUpdated,
}) => {
  const [form, setForm] = useState<UpdateWorkflowDetailsInput>({
    id: workflow.iD,
    name: workflow.workFlowName,
    status: workflow.workFlowStatus,
  });

  const [updateWorkflowDetails, { loading, error, data }] = useMutation(
    UPDATE_WORKFLOW_DETAILS
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateWorkflowDetails({ variables: { input: form } });
    if (res.data?.updateWorkflowDetails?.success && onUpdated) {
      onUpdated(res.data.updateWorkflowDetails.workflow);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Edit Workflow Details"
      className="edit-workflow-form"
    >
      <div>
        <label htmlFor="name">Workflow Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          aria-required="true"
        />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </button>
      {error && (
        <div role="alert" className="error">
          {error.message}
        </div>
      )}
      {data?.updateWorkflowDetails?.message && (
        <div className="success">{data.updateWorkflowDetails.message}</div>
      )}
    </form>
  );
};

export default EditWorkflowDetails;
