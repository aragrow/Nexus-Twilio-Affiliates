// WorkflowView.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@apollo/client";
import {
  GET_MANAGE_WORKFLOWS,
  GET_NEXUS_WORKFLOWS_BY_CLIENT,
} from "./graphqlQueries";
import type { WorkFlow } from "./interface";
import { styles } from "./workFlowsStyles";
// Import other components you might be using
import WorkflowDetailsEditor from "./WorkflowDetailsEditor";
import WorkflowStepEditor from "./WorkflowStepEditor";

//import AddWorkflow from "./AddWorkflow";
// ... other imports

interface WorkFlowsViewProps {
  onEditWorkflowMeta: (
    workflowId: string,
    workflowName: string, // Corrected: workflowName
    workflowStatus: string,
    clientId: string
  ) => void;
  onManageWorkflowSteps: (
    workflowId: string,
    workflowName: string, // Corrected: workflowName
    clientId: string
  ) => void;
}

const WorkflowView: React.FC = () => {
  // State for workflow management
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkFlow | null>(
    null
  );
  const [mode, setMode] = useState<"list" | "add" | "edit" | "view">("list");

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredWorkflows, setFilteredWorkflows] = useState<WorkFlow[]>([]);

  // Pagination state (if you're using pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [paginatedWorkflows, setPaginatedWorkflows] = useState<WorkFlow[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch workflows
  const { data, loading, error, refetch } = useQuery(GET_MANAGE_WORKFLOWS);

  // Filter workflows based on search term
  const filterWorkflows = useCallback(() => {
    if (!data?.nexusWorkFlows) return [];

    if (!searchTerm.trim()) {
      return data.nexusWorkFlows;
    }

    const term = searchTerm.toLowerCase().trim();
    return data.nexusWorkFlows.filter(
      (workflow: WorkFlow) =>
        workflow.workFlowName.toLowerCase().includes(term) ||
        workflow.workFlowStatus.toLowerCase().includes(term) ||
        workflow.client?.clientName.toLowerCase().includes(term)
      // Add any other fields you want to search by
    );
  }, [data, searchTerm]);

  // Update filtered workflows when data or search term changes
  useEffect(() => {
    const filtered = filterWorkflows();
    setFilteredWorkflows(filtered);

    // Reset to first page when filters change
    setCurrentPage(1);

    // Calculate total pages
    setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
  }, [data, searchTerm, filterWorkflows, pageSize]);

  // Update paginated workflows when filtered workflows or pagination settings change
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setPaginatedWorkflows(filteredWorkflows.slice(startIndex, endIndex));
  }, [filteredWorkflows, currentPage, pageSize]);

  // Event handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleAddSuccess = () => {
    setMode("list");
    refetch();
  };

  const handleEditSuccess = () => {
    setMode("list");
    setSelectedWorkflow(null);
    refetch();
  };

  const handleManageClick = (workflow: WorkFlow) => {
    console.log("handleManageClick");
    console.log(workflow);
    setSelectedWorkflow(workflow);
    setMode("view"); // Manage Steps
  };

  const handleEditClick = (workflow: WorkFlow) => {
    console.log("handleEditClick");
    console.log(workflow);
    setSelectedWorkflow(workflow);
    setMode("edit"); //Edit Detail
  };

  const handleCancel = () => {
    setMode("list");
    setSelectedWorkflow(null);
  };

  // Render different views based on mode
  if (mode === "add") {
    //  return <AddWorkflow onSuccess={handleAddSuccess} onCancel={handleCancel} />;
  }

  if (mode === "edit" && selectedWorkflow) {
    console.log("workFlowViews - WorkflowDetailsEditor - Edit Details");
    return (
      <WorkflowDetailsEditor
        workflow={selectedWorkflow}
        onSuccess={handleEditSuccess}
        onCancel={handleCancel}
      />
    );
  }

  if (mode === "view" && selectedWorkflow) {
    console.log("workFlowViews - WorkflowStepEditor - Manage Steps");
    return (
      <WorkflowStepEditor
        workflow={selectedWorkflow}
        onBack={handleCancel}
        onSave={handleEditSuccess}
      />
    );
  }

  // Main list view
  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <h2 style={styles.pageTitle}>Workflows</h2>
        <button
          onClick={() => setMode("add")}
          style={styles.addButton}
          className="add-button"
        >
          + Add Workflow
        </button>
      </div>

      {/* Search Input - Matching the EntitiesPage implementation */}
      <div style={styles.searchContainer}>
        <div style={styles.searchIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search workflows by client, name, or status..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={styles.searchInput}
          className="search-input"
          aria-label="Search workflows"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            style={styles.clearButton}
            className="clear-button"
            aria-label="Clear search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {loading && <div style={styles.loadingMessage}>Loading workflows...</div>}
      {error && (
        <div style={styles.errorMessage}>
          Error loading workflows: {error.message}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Table or Grid View of Workflows */}
          {filteredWorkflows.length === 0 ? (
            <div
              style={searchTerm ? styles.noResultsMessage : styles.emptyMessage}
            >
              {searchTerm
                ? `No workflows found matching "${searchTerm}"`
                : "No workflows found. Click 'Add Workflow' to create one."}
            </div>
          ) : (
            <div style={styles.workflowGrid}>
              {/* If you're using a table format */}
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableCell}>Name</th>
                    <th style={styles.tableCell}>Client</th>
                    <th style={styles.tableCell}>Status</th>
                    <th style={styles.tableCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedWorkflows.map((workflow: WorkFlow) => (
                    <tr
                      key={workflow.iD}
                      style={styles.tableRow}
                      className="table-row"
                    >
                      <td style={styles.tableCell}>{workflow.workFlowName}</td>
                      <td style={styles.tableCell}>
                        {workflow.client?.clientName}
                      </td>
                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(workflow.workFlowStatus === "active"
                              ? styles.statusActive
                              : styles.statusInactive),
                          }}
                        >
                          {workflow.workFlowStatus === "active"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => handleManageClick(workflow)}
                            style={styles.viewButton}
                            className="view-button"
                          >
                            Manage Steps
                          </button>
                          <button
                            onClick={() => handleEditClick(workflow)}
                            style={styles.editButton}
                            className="edit-button"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls - If you're using pagination */}
              {filteredWorkflows.length > 0 && (
                <div style={styles.paginationContainer}>
                  <div style={styles.paginationInfo}>
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, filteredWorkflows.length)}{" "}
                    of {filteredWorkflows.length} workflows
                  </div>

                  <div style={styles.paginationControls}>
                    {/* Previous Page Button */}
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{
                        ...styles.pageButton,
                        ...(currentPage === 1 ? styles.pageButtonDisabled : {}),
                      }}
                      className="page-button"
                      aria-label="Previous page"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first page, last page, current page, and pages around current page
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there are gaps
                        const showEllipsisBefore =
                          index > 0 && array[index - 1] !== page - 1;
                        const showEllipsisAfter =
                          index < array.length - 1 &&
                          array[index + 1] !== page + 1;

                        return (
                          <React.Fragment key={page}>
                            {showEllipsisBefore && (
                              <span
                                style={{
                                  color: "#cbd5e1",
                                  padding: "0 0.5rem",
                                }}
                              >
                                ...
                              </span>
                            )}

                            <button
                              onClick={() => setCurrentPage(page)}
                              style={{
                                ...styles.pageButton,
                                ...(currentPage === page
                                  ? styles.pageButtonActive
                                  : {}),
                              }}
                              className={`page-button ${
                                currentPage === page ? "active" : ""
                              }`}
                              aria-label={`Page ${page}`}
                              aria-current={
                                currentPage === page ? "page" : undefined
                              }
                            >
                              {page}
                            </button>

                            {showEllipsisAfter && (
                              <span
                                style={{
                                  color: "#cbd5e1",
                                  padding: "0 0.5rem",
                                }}
                              >
                                ...
                              </span>
                            )}
                          </React.Fragment>
                        );
                      })}

                    {/* Next Page Button */}
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      style={{
                        ...styles.pageButton,
                        ...(currentPage === totalPages
                          ? styles.pageButtonDisabled
                          : {}),
                      }}
                      className="page-button"
                      aria-label="Next page"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>

                    {/* Page Size Selector */}
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      style={styles.pageSizeSelector}
                      className="page-size-selector"
                      aria-label="Items per page"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WorkflowView;
