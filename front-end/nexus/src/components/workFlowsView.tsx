// worFlowsView.tsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import workFlowsStyles from "./workFlowsStyles"; // Assuming table styles are in dashboardStyles
import type { Client, WorkFlowsViewProps } from "./interface"; // Importing the client interface
import { GET_MANAGE_CLIENTS } from "./graphqlQueries"; // Adjust path to your query

const ITEMS_PER_PAGE = 15; // Or make this a prop if you want it configurable

const worFlowsView: React.FC<WorkFlowsViewProps> = ({
  workFlows,
  isLoading,
  isError,
  onEdit,
}) => {
  if (isLoading) {
    return <div style={workFlowsStyles.loader}>Loading workFlows...</div>; // Style this loader
  }

  if (isError) {
    return <div style={workFlowsStyles.errorMessage}>{isError}</div>; // Style this error message
  }

  if (!workFlows || workFlows.length === 0) {
    return <div style={workFlowsStyles.noDataMessage}>No workFlows found.</div>; // Style this
  }

  //  SEARCHBLE CLIENT DROP DOWN:

  // --- Client Search/Filter State (assuming this logic is within this component) ---
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientSearchResults, setClientSearchResults] = useState<Client[]>([]); // For dropdown
  const [selectedClientFilter, setSelectedClientFilter] =
    useState<Client | null>(null);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isClientSearchLoading, setIsClientSearchLoading] = useState(false); // For search loading

  // --- Mock API for client search (replace with actual API call) ---
  const searchClientsAPI = useCallback(
    async (term: string): Promise<Client[]> => {
      if (term.length < 2) return []; // Min 2 chars to search
      setIsClientSearchLoading(true);
      console.log("API: Searching clients for", term);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network delay
      const mockClients: Client[] = [
        { iD: "client-1", clientName: "Alpha Corp Widgets" },
        { iD: "client-2", clientName: "Beta Industries Global" },
        { iD: "client-3", clientName: "Gamma Solutions Ltd" },
        { iD: "client-4", clientName: "Delta Innovations Inc" },
        { iD: "client-5", clientName: "Epsilon Services Co." },
      ];
      const results = mockClients.filter((c) =>
        c.clientName.toLowerCase().includes(term.toLowerCase())
      );
      setIsClientSearchLoading(false);
      return results;
    },
    []
  );

  useEffect(() => {
    if (clientSearchTerm.length >= 2) {
      const handler = setTimeout(() => {
        searchClientsAPI(clientSearchTerm).then(setClientSearchResults);
      }, 500); // Debounce
      return () => clearTimeout(handler);
    } else {
      setClientSearchResults([]);
      if (isClientDropdownOpen) setIsClientDropdownOpen(false); // Close if term too short
    }
  }, [clientSearchTerm, searchClientsAPI, isClientDropdownOpen]);

  const handleClientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setClientSearchTerm(term);
    if (term.length >= 2) {
      setIsClientDropdownOpen(true);
    } else {
      setIsClientDropdownOpen(false);
    }
  };

  const handleSelectClientFromDropdown = (client: Client) => {
    setSelectedClientFilter(client);
    setClientSearchTerm(client.clientName); // Update input to show selected client
    setIsClientDropdownOpen(false);
    // The actual filtering of `workFlows` will happen in the `filteredAndPaginatedWorkflows` memo
  };

  const clearClientFilter = () => {
    setSelectedClientFilter(null);
    setClientSearchTerm("");
    setIsClientDropdownOpen(false);
  };

  // --- Filter workflows based on selectedClientFilter ---
  const filteredWorkflows = useMemo(() => {
    if (!workFlows) return [];
    if (selectedClientFilter) {
      return workFlows.filter((wf) => wf.clientId === selectedClientFilter.iD);
    }
    return workFlows; // Return all if no client filter
  }, [workFlows, selectedClientFilter]);

  //  EMD PF SEARCHABLE DROP DOWN.

  const [currentPage, setCurrentPage] = useState(1);

  // Memoize the paginated workFlows to avoid re-calculating on every render
  // unless workFlows or currentPage changes.
  const paginatedWorkFlows = useMemo(() => {
    if (!workFlows) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return workFlows.slice(startIndex, endIndex);
  }, [workFlows, currentPage]);

  const totalPages = Math.ceil(workFlows.length / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleGoToPage = (pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  // Generate page numbers for pagination controls
  // This is a simple version; more complex logic can be used for many pages (e.g., ellipsis)
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Max page numbers to show directly
    let startPage, endPage;

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

  // --- Render No Data Message after filtering ---
  if (!isLoading && paginatedWorkFlows.length === 0) {
    return (
      <>
        {/* Client Searchable Dropdown (still show it to allow changing filter) */}
        <div style={workFlowsStyles.clientSearchContainer}>
          <input /* ... as below ... */
            type="text"
            style={workFlowsStyles.searchInput}
            placeholder="Filter by Client (type min 2 chars)..."
            value={clientSearchTerm}
            onChange={handleClientSearchChange}
            onFocus={() =>
              clientSearchTerm.length >= 2 && setIsClientDropdownOpen(true)
            }
          />
          {selectedClientFilter && (
            <button
              onClick={clearClientFilter}
              style={workFlowsStyles.clearFilterButton}
            >
              X
            </button>
          )}
          {isClientDropdownOpen &&
            (clientSearchResults.length > 0 || isClientSearchLoading) && (
              <div style={workFlowsStyles.searchResultsDropdown}>
                {isClientSearchLoading ? (
                  <div style={workFlowsStyles.searchResultItem}>Loading...</div>
                ) : (
                  clientSearchResults.map((client) => (
                    <div
                      key={client.iD}
                      style={workFlowsStyles.searchResultItem}
                      onClick={() => handleSelectClientFromDropdown(client)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {client.clientName}
                    </div>
                  ))
                )}
              </div>
            )}
        </div>
        <div style={workFlowsStyles.noDataMessage}>
          {selectedClientFilter
            ? `No workflows found for ${selectedClientFilter.clientName}.`
            : "No workflows found."}
        </div>
      </>
    );
  }

  return (
    <>
      <div style={workFlowsStyles.tableContainer}>
        {/* --- Client Searchable Dropdown --- */}
        <div style={workFlowsStyles.clientSearchContainer}>
          {" "}
          {/* You'll need styles for this */}
          <input
            type="text"
            style={workFlowsStyles.searchInput} // Use or create appropriate style
            placeholder="Filter by Client (type min 2 chars)..."
            value={clientSearchTerm}
            onChange={handleClientSearchChange}
            onFocus={() =>
              clientSearchTerm.length >= 2 && setIsClientDropdownOpen(true)
            }
            // onBlur={() => setTimeout(() => setIsClientDropdownOpen(false), 200)} // Delay to allow click on item
          />
          {selectedClientFilter && (
            <button
              onClick={clearClientFilter}
              style={workFlowsStyles.clearFilterButton}
            >
              {" "}
              {/* Style this */}X {/* Clear Icon */}
            </button>
          )}
          {isClientDropdownOpen && clientSearchResults.length > 0 && (
            <div style={workFlowsStyles.searchResultsDropdown}>
              {isClientSearchLoading ? (
                <div style={workFlowsStyles.searchResultItem}>Loading...</div>
              ) : (
                clientSearchResults.map((client) => (
                  <div
                    key={client.iD}
                    style={workFlowsStyles.searchResultItem}
                    onClick={() => handleSelectClientFromDropdown(client)}
                    onMouseDown={(e) => e.preventDefault()} // Prevent input blur on click
                  >
                    {client.clientName}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
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
            {paginatedWorkFlows.map((workflow) => (
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
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={workFlowsStyles.paginationContainer}>
          <button
            style={workFlowsStyles.paginationButton}
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            « {/* Previous Icon/Text */}
          </button>

          {/* Logic to show first page and ellipsis if needed */}
          {pageNumbersToDisplay[0] > 1 && (
            <>
              <button
                style={workFlowsStyles.paginationButton}
                onClick={() => handleGoToPage(1)}
                aria-label="Go to page 1"
              >
                1
              </button>
              {pageNumbersToDisplay[0] > 2 && (
                <span style={workFlowsStyles.paginationEllipsis}>...</span>
              )}
            </>
          )}

          {pageNumbersToDisplay.map((pageNumber) => (
            <button
              key={pageNumber}
              style={{
                ...workFlowsStyles.paginationButton,
                ...(currentPage === pageNumber
                  ? workFlowsStyles.paginationButtonActive
                  : {}),
              }}
              onClick={() => handleGoToPage(pageNumber)}
              aria-current={currentPage === pageNumber ? "page" : undefined}
            >
              {pageNumber}
            </button>
          ))}

          {/* Logic to show last page and ellipsis if needed */}
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
                aria-label={`Go to page ${totalPages}`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            style={workFlowsStyles.paginationButton}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            » {/* Next Icon/Text */}
          </button>
          <span style={workFlowsStyles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </>
  );
};

export default worFlowsView;
