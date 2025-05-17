// AffiliatesTable.tsx
import React, { useState, useMemo } from "react";
import affiliatesStyles from "./affiliatesStyles"; // Assuming table styles are in dashboardStyles
import type { AffiliatesTableProps } from "./interface"; // Importing the Affiliate interface

const ITEMS_PER_PAGE = 15; // Or make this a prop if you want it configurable

const AffiliatesTable: React.FC<AffiliatesTableProps> = ({
  affiliates,
  isLoading,
  error,
  onEdit,
  onClients,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Memoize the paginated affiliates to avoid re-calculating on every render
  // unless affiliates or currentPage changes.
  const paginatedAffiliates = useMemo(() => {
    if (!affiliates) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return affiliates.slice(startIndex, endIndex);
  }, [affiliates, currentPage]);

  if (isLoading) {
    return <div style={affiliatesStyles.loader}>Loading affiliates...</div>; // Style this loader
  }

  if (error) {
    return <div style={affiliatesStyles.errorMessage}>{error}</div>; // Style this error message
  }

  if (!affiliates || affiliates.length === 0) {
    return (
      <div style={affiliatesStyles.noDataMessage}>No affiliates found.</div>
    ); // Style this
  }

  const totalPages = Math.ceil(affiliates.length / ITEMS_PER_PAGE);

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
      {" "}
      {/* Use Fragment to return table and pagination controls */}
      <div style={affiliatesStyles.tableContainer}>
        {" "}
        {/* Main container for responsiveness */}
        <table style={affiliatesStyles.table}>
          <thead style={affiliatesStyles.tableHead}>
            <tr>
              <th style={affiliatesStyles.tableHeader}>Company Name</th>
              <th style={affiliatesStyles.tableHeader}>Contact Name</th>
              <th style={affiliatesStyles.tableHeader}>ID</th>
              {/* Add Actions header if you have onEdit/onDelete */}
              {(onEdit || onClients) && (
                <th style={affiliatesStyles.tableHeader}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody style={affiliatesStyles.tableBody}>
            {paginatedAffiliates.map((affiliate) => (
              <tr key={affiliate.iD} style={affiliatesStyles.tableRow}>
                <td
                  style={affiliatesStyles.tableCell}
                  data-label="Company Name:"
                >
                  {affiliate.companyName || "N/A"}
                </td>
                <td
                  style={affiliatesStyles.tableCell}
                  data-label="Contact Name:"
                >
                  {affiliate.contactName || "N/A"}
                </td>
                <td style={affiliatesStyles.tableCell} data-label="ID:">
                  {affiliate.iD}
                </td>
                {(onEdit || onClients) && (
                  <td style={affiliatesStyles.tableCell} data-label="Actions:">
                    {onEdit && (
                      <button
                        style={affiliatesStyles.actionButton} // Style this button
                        onClick={() => onEdit(affiliate.iD)}
                        aria-label={`Edit ${
                          affiliate.companyName || "affiliate"
                        }`}
                      >
                        Edit {/* Replace with Edit Icon */}
                      </button>
                    )}
                    {onClients && (
                      <button
                        style={{
                          ...affiliatesStyles.actionButton,
                          ...affiliatesStyles.deleteButton,
                        }} // Style this
                        onClick={() => onClients(affiliate.iD)}
                        aria-label={`Clients ${
                          affiliate.companyName || "affiliate"
                        }`}
                      >
                        Clients {/* Replace with Delete Icon */}
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
        <div style={affiliatesStyles.paginationContainer}>
          <button
            style={affiliatesStyles.paginationButton}
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
                style={affiliatesStyles.paginationButton}
                onClick={() => handleGoToPage(1)}
                aria-label="Go to page 1"
              >
                1
              </button>
              {pageNumbersToDisplay[0] > 2 && (
                <span style={affiliatesStyles.paginationEllipsis}>...</span>
              )}
            </>
          )}

          {pageNumbersToDisplay.map((pageNumber) => (
            <button
              key={pageNumber}
              style={{
                ...affiliatesStyles.paginationButton,
                ...(currentPage === pageNumber
                  ? affiliatesStyles.paginationButtonActive
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
                <span style={affiliatesStyles.paginationEllipsis}>...</span>
              )}
              <button
                style={affiliatesStyles.paginationButton}
                onClick={() => handleGoToPage(totalPages)}
                aria-label={`Go to page ${totalPages}`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            style={affiliatesStyles.paginationButton}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            » {/* Next Icon/Text */}
          </button>
          <span style={affiliatesStyles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </>
  );
};

export default AffiliatesTable;
