// MaintainWorkFlowView.tsx
import React, { useState, useMemo } from "react";
import workFlowsStyles from "./workFlowsStyles"; // Assuming table styles are in dashboardStyles
import type { maintainWorkFlowTableProps } from "./interface"; // Importing the client interface

const ITEMS_PER_PAGE = 15; // Or make this a prop if you want it configurable

const MaintainWorkFlowView: React.FC<maintainWorkFlowTableProps> = ({
  WorkFlow,
  Clients,
  isLoading,
  isError,
  onSave,
}) => {
  if (isLoading) {
    return <div style={workFlowsStyles.loader}>Loading workFlows...</div>; // Style this loader
  }

  if (isError) {
    return <div style={workFlowsStyles.errorMessage}>{isError}</div>; // Style this error message
  }

  if (!WorkFlow || WorkFlow.length === 0) {
    return <div style={workFlowsStyles.noDataMessage}>No workFlows found.</div>; // Style this
  }

  return (
    <div style={workFlowsStyles.tableContainer}>
      <table style={workFlowsStyles.table}>
        <thead style={workFlowsStyles.tableHead}>
          <tr>
            <th style={workFlowsStyles.tableHeader}>Client Name</th>
            <th style={workFlowsStyles.tableHeader}>Workflow Name</th>
            <th style={workFlowsStyles.tableHeader}>Status</th>
            <th style={workFlowsStyles.tableHeader}>ID</th>
            {onEdit && <th style={workFlowsStyles.tableHeader}>Actions</th>}
          </tr>
        </thead>
        <tbody style={workFlowsStyles.tableBody}>
          {WorkFlow.map((Workflow) => (
            <tr key={workflow.iD} style={workFlowsStyles.tableRow}>
              <td style={workFlowsStyles.tableCell} data-label="Client:">
                {workflow.client?.clientName || "N/A"}
              </td>
              <td style={workFlowsStyles.tableCell} data-label="Name:">
                {workflow.workFlowName || "N/A"}
              </td>
              <td style={workFlowsStyles.tableCell} data-label="Status:">
                {workflow.workFlowStatus}
              </td>
              <td style={workFlowsStyles.tableCell} data-label="ID:">
                {workflow.iD}
              </td>
              {onEdit && (
                <td style={workFlowsStyles.tableCell} data-label="Actions:">
                  <button
                    style={workFlowsStyles.actionButton}
                    onClick={() => onEdit(workflow.iD)}
                    aria-label={`Edit ${workflow.workFlowName || "workflow"}`}
                  >
                    Edit
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaintainWorkFlowView;
