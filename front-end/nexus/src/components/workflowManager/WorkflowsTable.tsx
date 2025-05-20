// src/components/workflowManage/WorkflowsTable.tsx
import React from "react";
import workFlowsStyles from "./workFlowsStyles";
import type { WorkFlow } from "./interface";

interface WorkflowsTableOnlyProps {
  // Renamed to avoid conflict with parent's props
  workflowsToDisplay: WorkFlow[]; // Expects the already paginated list
  onEditWorkflowMeta: (workflowId: string) => void;
  onManageWorkflowSteps: (
    workflowId: string,
    workflowName: string,
    clientId: string
  ) => void;
}

const WorkflowsTable: React.FC<WorkflowsTableOnlyProps> = ({
  workflowsToDisplay,
  onEditWorkflowMeta,
  onManageWorkflowSteps,
}) => {
  if (workflowsToDisplay.length === 0) {
    // This component now assumes the parent handles the "no data" message
    // if the entire filtered list is empty. It only renders the table.
    return null;
  }

  return (
    <table style={workFlowsStyles.table}>
      <thead style={workFlowsStyles.tableHead}>
        <tr>
          <th style={workFlowsStyles.tableHeader}>Workflow Name</th>
          <th style={workFlowsStyles.tableHeader}>Client Name</th>
          <th style={workFlowsStyles.tableHeader}>Status</th>
          <th style={workFlowsStyles.tableHeader}>Created</th>
          <th style={workFlowsStyles.tableHeader}>Actions</th>
        </tr>
      </thead>
      <tbody style={workFlowsStyles.tableBody}>
        {workflowsToDisplay.map((workflow) => (
          <tr key={workflow.iD} style={workFlowsStyles.tableRow}>
            <td style={workFlowsStyles.tableCell} data-label="Workflow Name:">
              {workflow.workflowName || "N/A"}
            </td>
            <td style={workFlowsStyles.tableCell} data-label="Client:">
              {workflow.client?.clientName || `ID: ${workflow.clientId}`}
            </td>
            <td style={workFlowsStyles.tableCell} data-label="Status:">
              {workflow.workflowStatus}
            </td>
            <td style={workFlowsStyles.tableCell} data-label="Created:">
              {workflow.createdAt
                ? new Date(workflow.createdAt).toLocaleDateString()
                : "N/A"}
            </td>
            <td style={workFlowsStyles.tableCell} data-label="Actions:">
              <button
                style={workFlowsStyles.actionButton}
                onClick={() =>
                  onManageWorkflowSteps(
                    workflow.iD,
                    workflow.workflowName,
                    workflow.clientId
                  )
                }
                aria-label={`Manage steps for ${
                  workflow.workflowName || "workflow"
                }`}
              >
                Manage Steps
              </button>
              <button
                style={{
                  ...workFlowsStyles.actionButton,
                  ...workFlowsStyles.editMetaButton,
                }}
                onClick={() => onEditWorkflowMeta(workflow.iD)}
                aria-label={`Edit details for ${
                  workflow.workflowName || "workflow"
                }`}
              >
                Edit Details
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default WorkflowsTable;
