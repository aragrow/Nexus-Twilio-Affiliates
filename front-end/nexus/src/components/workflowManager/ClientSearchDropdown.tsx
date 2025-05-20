// src/components/workflowManage/WorkFlowsView.tsx
import React from "react"; // Removed useState, useMemo, useEffect as they are in the hook
import workFlowsStyles from "./workFlowsStyles";
import type { WorkFlowsViewParentProps } from "./interface"; // Using the parent-facing props
import { useWorkFlowsViewLogic } from "./useWorkFlowsViewLogic"; // Your custom hook
import ClientSearchDropdown from "./ClientSearchDropdown"; // <--- IMPORT IT
import WorkflowsTable from "./WorkflowsTable"; // Your table component
import PaginationControls from "./PaginationControls"; // Your pagination component
import Loader from "../common/Loader"; // Your common Loader
import ErrorMessage from "../common/ErrorMessage"; // Your common ErrorMessage

const WorkFlowsView: React.FC<WorkFlowsViewParentProps> = ({
  onEditWorkflowMeta,
  onManageWorkflowSteps,
}) => {
  // Destructure ALL necessary values from your custom hook
  const {
    // Client Search related state and handlers
    clientSearchTerm,
    handleClientSearchChange, // This is the function to pass to ClientSearchDropdown's onSearchTermChange
    clientSearchResults,
    isClientSearchLoading,
    clientSearchError,
    selectedClientFilter,
    handleSelectClientFromDropdown, // This is for ClientSearchDropdown's onClientSelect
    clearClientFilter, // For ClientSearchDropdown's onClearFilter
    isClientDropdownOpen,
    setIsClientDropdownOpen, // For ClientSearchDropdown

    // Workflows list related state
    paginatedWorkFlows,
    workFlowsLoading,
    workFlowsError,

    // Pagination related state and handlers
    currentPage,
    totalPages,
    setCurrentPage, // Pass this to PaginationControls for its onPageChange
  } = useWorkFlowsViewLogic();

  // --- Render Logic ---

  // Overall loading state for the workflow list itself
  if (workFlowsLoading && paginatedWorkFlows.length === 0) {
    let loadingMessage = "Loading workflows...";
    if (selectedClientFilter)
      loadingMessage = `Loading workflows for ${selectedClientFilter.clientName}...`;
    else if (clientSearchTerm === "")
      loadingMessage =
        "Loading initial workflows or select/search for a client...";
    return <Loader message={loadingMessage} style={workFlowsStyles.loader} />;
  }

  // Error state for the workflow list
  if (workFlowsError) {
    return (
      <ErrorMessage
        message={`Error loading workflows: ${workFlowsError.message}`}
        style={workFlowsStyles.errorMessage}
      />
    );
  }

  return (
    <div style={workFlowsStyles.tableContainer}>
      {" "}
      {/* Main container for this entire view */}
      {/* === Client Search Dropdown Component === */}
      <ClientSearchDropdown
        searchTerm={clientSearchTerm}
        onSearchTermChange={handleClientSearchChange} // Pass the handler from the hook
        searchResults={clientSearchResults}
        isLoading={isClientSearchLoading}
        error={clientSearchError} // Pass the specific client search error
        selectedClient={selectedClientFilter}
        onClientSelect={handleSelectClientFromDropdown} // Pass the handler
        onClearFilter={clearClientFilter} // Pass the handler
        isDropdownOpen={isClientDropdownOpen}
        setIsDropdownOpen={setIsClientDropdownOpen}
        minSearchLength={MIN_CLIENT_SEARCH_TERM_LENGTH} // Pass config
      />
      {/* --- Conditional rendering for the Workflows Table or No Data Message --- */}
      {!workFlowsLoading && paginatedWorkFlows.length === 0 ? (
        // No data message (shown if loading is false and no workflows after filtering)
        <div style={workFlowsStyles.noDataMessage}>
          {selectedClientFilter
            ? `No workflows found for ${selectedClientFilter.clientName}.`
            : "No workflows available. Select a client or use the search to filter."}
        </div>
      ) : (
        // Workflows Table (if not loading and there are workflows to display)
        <WorkflowsTable
          workflowsToDisplay={paginatedWorkFlows}
          onEditWorkflowMeta={onEditWorkflowMeta}
          onManageWorkflowSteps={onManageWorkflowSteps}
        />
      )}
      {/* --- Pagination Controls --- */}
      {/* Render pagination only if there are workflows and more than one page */}
      {!workFlowsError && totalPages > 1 && paginatedWorkFlows.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage} // setCurrentPage from the hook is the onPageChange handler
        />
      )}
    </div>
  );
};

export default WorkFlowsView;
