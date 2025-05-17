// workFlowsTable.tsx
import React, { useState, useMemo } from "react";
import workFlowsStyles from "./workFlowsStyles"; // Assuming table styles are in dashboardStyles
import type { workFlowsTableProps } from "./interface"; // Importing the client interface

const ITEMS_PER_PAGE = 15; // Or make this a prop if you want it configurable

const workFlowsTable: React.FC<workFlowsTableProps> = ({
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

  const [currentPage, setCurrentPage] = useState(1);

  // Memoize the paginated workFlows to avoid re-calculating on every render
  // unless workFlows or currentPage changes.
  const paginatedworkFlows = useMemo(() => {
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

  return (
    <>
      <div style={workFlowsStyles.tableContainer}>
        {" "}
        {/* Main container for responsiveness */}
        <table style={workFlowsStyles.table}>
          <thead style={workFlowsStyles.tableHead}>
            <tr>
              <th style={workFlowsStyles.tableHeader}>Client Name</th>
              <th style={workFlowsStyles.tableHeader}>workFlow Name</th>
              <th style={workFlowsStyles.tableHeader}>workFlow Status</th>
              <th style={workFlowsStyles.tableHeader}>ID</th>
              {/* Add Actions header if you have onEdit/onDelete */}
              {onEdit && <th style={workFlowsStyles.tableHeader}>Actions</th>}
            </tr>
          </thead>
          <tbody style={workFlowsStyles.tableBody}>
            {paginatedworkFlows.map((workFlow) => (
              <tr key={workFlow.iD} style={workFlowsStyles.tableRow}>
                <td
                  style={workFlowsStyles.tableCell}
                  data-label="workFlow Client Name:"
                >
                  {workFlow.client?.clientName || "N/A"}
                </td>
                <td
                  style={workFlowsStyles.tableCell}
                  data-label="workFlow Name:"
                >
                  {workFlow.workFlowName || "N/A"}
                </td>
                <td style={workFlowsStyles.tableCell} data-label="Status:">
                  {workFlow.workFlowStatus}
                </td>
                <td style={workFlowsStyles.tableCell} data-label="ID:">
                  {workFlow.iD}
                </td>
                {onEdit && (
                  <td style={workFlowsStyles.tableCell} data-label="Actions:">
                    {onEdit && (
                      <button
                        style={workFlowsStyles.actionButton} // Style this button
                        onClick={() => onEdit(workFlow.iD)}
                        aria-label={`Edit ${
                          workFlow.workFlowName || "workFlow"
                        }`}
                      >
                        Edit {/* Replace with Edit Icon */}
                      </button>
                    )}
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

export default workFlowsTable;
