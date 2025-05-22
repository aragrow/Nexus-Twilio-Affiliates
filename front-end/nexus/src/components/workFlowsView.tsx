// src/components/WorkFlowsView.tsx
import React, { useState, useMemo, useEffect } from "react";
import workFlowsStyles from "./workFlowsStyles";
import type { Client, WorkFlow } from "./interface"; // WorkFlow interface should have workFlowName
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  GET_CLIENTS_FOR_SEARCH,
  GET_NEXUS_WORKFLOWS_BY_CLIENT,
} from "./graphqlQueries";

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

const ITEMS_PER_PAGE = 15;
const MIN_CLIENT_SEARCH_TERM_LENGTH = 3; // Or 0 to allow empty search for initial list
const CLIENT_SEARCH_DEBOUNCE_MS = 300;

const WorkFlowsView: React.FC<WorkFlowsViewProps> = ({
  onEditWorkflowMeta,
  onManageWorkflowSteps,
}) => {
  // ... (client search state and logic remains the same) ...
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientSearchResults, setClientSearchResults] = useState<Client[]>([]);
  const [selectedClientFilter, setSelectedClientFilter] =
    useState<Client | null>(null);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  const [
    searchClientsGQL,
    {
      loading: isClientSearchLoading,
      error: clientSearchError,
      data: clientSearchDataGQL,
    },
  ] = useLazyQuery<{ nexusClients: Client[] }>(GET_CLIENTS_FOR_SEARCH, {
    fetchPolicy: "network-only",
    onCompleted: (data) => setClientSearchResults(data?.nexusClients || []),
    onError: (error) => {
      console.error("Error searching clients:", error);
      setClientSearchResults([]);
    },
  });

  useEffect(() => {
    if (clientSearchTerm.length === 0 && !selectedClientFilter) {
      // Added !selectedClientFilter
      // Optionally fetch all clients or a default set if search term is empty and no filter active
      // searchClientsGQL({ variables: { term: "", first: 10 } }); // Example
      setClientSearchResults([]); // Or clear results
      // return; // Keep this if you don't want to auto-fetch on empty
    }
    if (
      clientSearchTerm.length < MIN_CLIENT_SEARCH_TERM_LENGTH &&
      clientSearchTerm.length > 0
    ) {
      // Allow 0 length to clear
      setClientSearchResults([]);
      return;
    }
    const handler = setTimeout(() => {
      if (
        clientSearchTerm.length >= MIN_CLIENT_SEARCH_TERM_LENGTH ||
        clientSearchTerm.length === 0
      ) {
        // Allow search for empty term if desired
        searchClientsGQL({ variables: { term: clientSearchTerm, first: 10 } });
      }
    }, CLIENT_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handler);
  }, [clientSearchTerm, searchClientsGQL, selectedClientFilter]); // Added selectedClientFilter

  const handleClientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setClientSearchTerm(term);
    if (term.length >= MIN_CLIENT_SEARCH_TERM_LENGTH || term.length === 0)
      setIsClientDropdownOpen(true);
    else setIsClientDropdownOpen(false);
  };

  const handleSelectClientFromDropdown = (client: Client) => {
    setSelectedClientFilter(client);
    setClientSearchTerm(client.clientName || ""); // Ensure clientName is not null
    setIsClientDropdownOpen(false);
    setCurrentPage(1);
  };

  const clearClientFilter = () => {
    setSelectedClientFilter(null);
    setClientSearchTerm("");
    setIsClientDropdownOpen(false);
    setCurrentPage(1);
  };

  const [editingWorkflow, setEditingWorkflow] = useState<{
    id: string;
    name: string;
    status: string;
  } | null>(null);

  const handleEditWorkflow = (workflow: {
    id: string;
    name: string;
    clientId: string;
  }) => {
    setEditingWorkflow(workflow);
  };

  // --- Workflow Fetching State ---
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: workFlowsData,
    loading: workFlowsLoading,
    error: workFlowsError,
    // refetch, // refetch can be used if needed
  } = useQuery<{
    nexusWorkFlows: WorkFlow[]; // Assuming schema returns WorkFlow[] directly now for simplicity with client-side pagination
    // If it's { workflows: WorkFlow[], totalCount: number }, adjust accordingly
  }>(GET_NEXUS_WORKFLOWS_BY_CLIENT, {
    variables: {
      clientId: selectedClientFilter ? selectedClientFilter.iD : null,
      status: "active", // Example filter
      // Removed pagination variables here, assuming client-side pagination for this example
      // first: ITEMS_PER_PAGE,
      // offset: (currentPage - 1) * ITEMS_PER_PAGE,
    },
    fetchPolicy: "cache-and-network",
  });

  // Client-side pagination if GET_NEXUS_WORKFLOWS_BY_CLIENT doesn't support it
  const currentWorkflows = workFlowsData?.nexusWorkFlows || [];
  const paginatedWorkFlows = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return currentWorkflows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentWorkflows, currentPage]);

  const totalPages = Math.ceil(currentWorkflows.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when client filter changes
  }, [selectedClientFilter]);

  const handleNextPage = () =>
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  const handlePreviousPage = () =>
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  const handleGoToPage = (pageNumber: number) =>
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage, endPage;
    if (totalPages <= 0) return [];
    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
      const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;
      if (currentPage <= maxPagesBeforeCurrentPage) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrentPage;
        endPage = currentPage + maxPagesAfterCurrentPage;
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };
  const pageNumbersToDisplay = getPageNumbers();

  // --- Render Logic ---
  let content;
  if (workFlowsLoading && currentWorkflows.length === 0) {
    content = <div style={workFlowsStyles.loader}>Loading workflows...</div>;
  } else if (workFlowsError) {
    content = (
      <div style={workFlowsStyles.errorMessage}>
        Error loading workflows: {workFlowsError.message}
      </div>
    );
  } else if (paginatedWorkFlows.length === 0) {
    content = (
      <div style={workFlowsStyles.noDataMessage}>
        {selectedClientFilter
          ? `No active workflows found for ${selectedClientFilter.clientName}.`
          : "No active workflows found. Select a client or clear filter."}
      </div>
    );
  } else {
    content = (
      <table style={workFlowsStyles.table}>
        <thead style={workFlowsStyles.tableHead}>
          <tr>
            <th style={workFlowsStyles.tableHeader}>Client Name</th>
            <th style={workFlowsStyles.tableHeader}>Workflow Name</th>
            <th style={workFlowsStyles.tableHeader}>Status</th>
            <th style={workFlowsStyles.tableHeader}>Created</th>
            <th style={workFlowsStyles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody style={workFlowsStyles.tableBody}>
          {paginatedWorkFlows.map((workflow) => (
            <tr key={workflow.iD} style={workFlowsStyles.tableRow}>
              <td style={workFlowsStyles.tableCell} data-label="Client:">
                {workflow.client?.clientName || `ID: ${workflow.clientId}`}
              </td>
              <td style={workFlowsStyles.tableCell} data-label="Name:">
                {workflow.workFlowName || "N/A"}
              </td>
              <td style={workFlowsStyles.tableCell} data-label="Status:">
                {workflow.workFlowStatus}
              </td>
              <td style={workFlowsStyles.tableCell} data-label="Created:">
                {workflow.createdAt
                  ? new Date(workflow.createdAt).toLocaleDateString()
                  : "N/A"}
              </td>
              <td style={workFlowsStyles.tableCell} data-label="Actions:">
                <button
                  style={{
                    ...workFlowsStyles.actionButton,
                    ...workFlowsStyles.editMetaButton /* Define editMetaButton style */,
                  }}
                  aria-label={`Edit details for ${workflow.workFlowName}`}
                  onClick={() =>
                    onEditWorkflowMeta(
                      workflow.iD,
                      workflow.workFlowName,
                      workflow.workFlowStatus,
                      workflow.clientId
                    )
                  }
                >
                  Edit
                </button>{" "}
                |
                <button
                  style={workFlowsStyles.actionButton}
                  onClick={() =>
                    onManageWorkflowSteps(
                      workflow.iD,
                      workflow.workFlowName || "Unnamed Workflow", // Use workFlowName
                      workflow.clientId || "" // Ensure clientId is a string
                    )
                  }
                  aria-label={`Manage steps for ${
                    workflow.workFlowName || "workflow"
                  }`}
                >
                  Manage Steps
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <>
      <div style={workFlowsStyles.tableContainer}>
        {/* Client Searchable Dropdown */}
        <div style={workFlowsStyles.clientSearchContainer}>
          <input
            type="text"
            style={workFlowsStyles.searchInput}
            placeholder="Search & Filter by Client..."
            value={clientSearchTerm}
            onChange={handleClientSearchChange}
            onFocus={() => setIsClientDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsClientDropdownOpen(false), 200)} // Delay to allow click on dropdown items
          />
          {selectedClientFilter && (
            <button
              onClick={clearClientFilter}
              style={workFlowsStyles.clearFilterButton}
              aria-label="Clear client filter"
            >
              × {/* Clear icon */}
            </button>
          )}
          {isClientDropdownOpen &&
            (clientSearchResults.length > 0 ||
              isClientSearchLoading ||
              (clientSearchTerm.length > 0 &&
                !isClientSearchLoading &&
                clientSearchResults.length === 0)) && (
              <div style={workFlowsStyles.searchResultsDropdown}>
                {isClientSearchLoading && (
                  <div style={workFlowsStyles.searchResultItem}>
                    Searching...
                  </div>
                )}
                {!isClientSearchLoading &&
                  clientSearchResults.length === 0 &&
                  clientSearchTerm.length >= MIN_CLIENT_SEARCH_TERM_LENGTH && (
                    <div style={workFlowsStyles.searchResultItem}>
                      No clients match "{clientSearchTerm}".
                    </div>
                  )}
                {!isClientSearchLoading &&
                  clientSearchResults.map((client) => (
                    <div
                      key={client.iD}
                      style={workFlowsStyles.searchResultItem}
                      onMouseDown={(e) => e.preventDefault()} // Prevents blur before click
                      onClick={() => handleSelectClientFromDropdown(client)}
                    >
                      {client.clientName}
                    </div>
                  ))}
              </div>
            )}
          {clientSearchError && (
            <div style={{ color: "red", fontSize: "0.9em", marginTop: "5px" }}>
              Client search error: {clientSearchError.message}
            </div>
          )}
        </div>

        {content}
      </div>

      {/* Pagination Controls */}
      {!workFlowsError && totalPages > 1 && (
        <div style={workFlowsStyles.paginationContainer}>
          <button
            style={workFlowsStyles.paginationButton}
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            «
          </button>
          {pageNumbersToDisplay[0] > 1 && (
            <>
              <button
                style={workFlowsStyles.paginationButton}
                onClick={() => handleGoToPage(1)}
              >
                1
              </button>
              {pageNumbersToDisplay[0] > 2 && (
                <span style={workFlowsStyles.paginationEllipsis}>...</span>
              )}
            </>
          )}
          {pageNumbersToDisplay.map((num) => (
            <button
              key={num}
              onClick={() => handleGoToPage(num)}
              style={
                currentPage === num
                  ? {
                      ...workFlowsStyles.paginationButton,
                      ...workFlowsStyles.paginationButtonActive,
                    }
                  : workFlowsStyles.paginationButton
              }
              aria-current={currentPage === num ? "page" : undefined}
            >
              {num}
            </button>
          ))}
          {pageNumbersToDisplay[pageNumbersToDisplay.length - 1] <
            totalPages && (
            <>
              {pageNumbersToDisplay[pageNumbersToDisplay.length - 1] <
                totalPages - 1 && (
                <span style={workFlowsStyles.paginationEllipsis}>...</span>
              )}
              <button
                style={workFlowsStyles.paginationButton}
                onClick={() => handleGoToPage(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            style={workFlowsStyles.paginationButton}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            »
          </button>
          <span style={workFlowsStyles.paginationInfo}>
            {" "}
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </>
  );
};

export default WorkFlowsView;
