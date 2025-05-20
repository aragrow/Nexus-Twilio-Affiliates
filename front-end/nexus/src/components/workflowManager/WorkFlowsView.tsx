// src/components/workflowManage/WorkFlowsView.tsx
import React from "react";
import workFlowsStyles from "./workFlowsStyles";
import type { WorkFlowsViewParentProps } from "./interface"; // Use the parent props type
import { useWorkFlowsViewLogic } from "./useWorkFlowsViewLogic"; // Import the custom hook
import ClientSearchDropdown from "./ClientSearchDropdown";
import WorkflowsTable from "./WorkflowsTable";
import PaginationControls from "./PaginationControls";
import Loader from "../common/Loader"; // Assuming you have these common components
import ErrorMessage from "../common/ErrorMessage";

const WorkFlowsView: React.FC<WorkFlowsViewParentProps> = ({
  onEditWorkflowMeta,
  onManageWorkflowSteps,
}) => {
  const {
    // Client Search
    clientSearchTerm,
    handleClientSearchChange,
    clientSearchResults,
    isClientSearchLoading,
    clientSearchError,
    selectedClientFilter,
    handleSelectClientFromDropdown,
    clearClientFilter,
    isClientDropdownOpen,
    setIsClientDropdownOpen,
    // Workflows
    paginatedWorkFlows, // This is already the correctly paginated list for the current page
    workFlowsLoading,
    workFlowsError,
    // Pagination
    currentPage,
    totalPages,
    setCurrentPage, // Pass this to PaginationControls
  } = useWorkFlowsViewLogic();

  // --- Render Logic ---
  const renderContent = () => {
    if (workFlowsLoading && paginatedWorkFlows.length === 0) {
      let loadingMessage = "Loading workflows...";
      if (selectedClientFilter)
        loadingMessage = `Loading workflows for ${selectedClientFilter.clientName}...`;
      else if (clientSearchTerm === "")
        loadingMessage =
          "Loading initial workflows or select/search for a client...";
      return <Loader message={loadingMessage} style={workFlowsStyles.loader} />;
    }

    if (workFlowsError) {
      return (
        <ErrorMessage
          message={`Error loading workflows: ${workFlowsError.message}`}
          style={workFlowsStyles.errorMessage}
        />
      );
    }

    if (!workFlowsLoading && paginatedWorkFlows.length === 0) {
      const noDataText = selectedClientFilter
        ? `No workflows found for ${selectedClientFilter.clientName}.`
        : "No workflows available. Select a client or clear filter.";
      return <div style={workFlowsStyles.noDataMessage}>{noDataText}</div>;
    }

    return (
      <WorkflowsTable
        workflowsToDisplay={paginatedWorkFlows}
        onEditWorkflowMeta={onEditWorkflowMeta}
        onManageWorkflowSteps={onManageWorkflowSteps}
      />
    );
  };
  if (workFlowsLoading && paginatedWorkFlows.length === 0) {
    let loadingMessage = "Loading workflows...";
    if (selectedClientFilter) {
      loadingMessage = `Loading workflows for Client...`;
    } else if (clientSearchTerm === "") {
      // Use clientSearchTerm from your logic hook
      loadingMessage =
        "Loading initial workflows or select/search for a client...";
    }
    return <Loader message={loadingMessage} style={workFlowsStyles.loader} />; // Use the Loader component
  }

  if (workFlowsError) {
    return (
      <ErrorMessage
        message={workFlowsError.message} // Pass the error message
        title="Failed to Load Workflows"
        style={workFlowsStyles.errorMessage} // Pass any specific container style
      />
    );
  }

  // Display "no data" message
  if (!workFlowsLoading && paginatedWorkFlows.length === 0) {
    const noDataText = selectedClientFilter
      ? `No workflows found for ${selectedClientFilter.clientName}.`
      : "No workflows available. Try selecting a client or broadening your search.";
    return (
      <>
        {/* Render Client Search even if no data, so user can change filter */}
        <ClientSearchDropdown /* ...props... */ />
        <div style={workFlowsStyles.noDataMessage}>{noDataText}</div>
      </>
    );
  }
  return (
    <div style={workFlowsStyles.tableContainer}>
      {" "}
      {/* Main container for this view */}
      <ClientSearchDropdown
        searchTerm={clientSearchTerm}
        onSearchTermChange={handleClientSearchChange}
        searchResults={clientSearchResults}
        isLoading={isClientSearchLoading}
        error={clientSearchError}
        selectedClient={selectedClientFilter}
        onClientSelect={handleSelectClientFromDropdown}
        onClearFilter={clearClientFilter}
        isDropdownOpen={isClientDropdownOpen}
        setIsDropdownOpen={setIsClientDropdownOpen}
        minSearchLength={MIN_CLIENT_SEARCH_TERM_LENGTH}
      />
      {renderContent()}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default WorkFlowsView;
