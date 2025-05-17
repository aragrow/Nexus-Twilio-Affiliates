// clientsTable.tsx
import React, { useState, useMemo } from "react";
import clientsStyles from "./clientsStyles"; // Assuming table styles are in dashboardStyles
import type { ClientsTableProps } from "./interface"; // Importing the client interface

const ITEMS_PER_PAGE = 15; // Or make this a prop if you want it configurable

const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  isLoading,
  error,
  onEdit,
  onEntities,
}) => {
  if (isLoading) {
    return <div style={clientsStyles.loader}>Loading clients...</div>; // Style this loader
  }

  if (error) {
    return <div style={clientsStyles.errorMessage}>{error}</div>; // Style this error message
  }

  if (!clients || clients.length === 0) {
    return <div style={clientsStyles.noDataMessage}>No clients found.</div>; // Style this
  }

  const [currentPage, setCurrentPage] = useState(1);

  // Memoize the paginated Clients to avoid re-calculating on every render
  // unless Clients or currentPage changes.
  const paginatedClients = useMemo(() => {
    if (!clients) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return clients.slice(startIndex, endIndex);
  }, [clients, currentPage]);

  const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);

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
      <div style={clientsStyles.tableContainer}>
        {" "}
        {/* Main container for responsiveness */}
        <table style={clientsStyles.table}>
          <thead style={clientsStyles.tableHead}>
            <tr>
              <th style={clientsStyles.tableHeader}>Client Name</th>
              <th style={clientsStyles.tableHeader}>Client Account</th>
              <th style={clientsStyles.tableHeader}>Client Name</th>
              <th style={clientsStyles.tableHeader}>Client Phone</th>
              <th style={clientsStyles.tableHeader}>Status</th>
              <th style={clientsStyles.tableHeader}>ID</th>
              {/* Add Actions header if you have onEdit/onDelete */}
              {(onEdit || onEntities) && (
                <th style={clientsStyles.tableHeader}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody style={clientsStyles.tableBody}>
            {paginatedClients.map((client) => (
              <tr key={client.iD} style={clientsStyles.tableRow}>
                <td style={clientsStyles.tableCell} data-label="Client Name:">
                  {client.Client?.companyName || "N/A"}
                </td>
                <td
                  style={clientsStyles.tableCell}
                  data-label="Client Account:"
                >
                  {client.accountno || "N/A"}
                </td>
                <td style={clientsStyles.tableCell} data-label="Client Name:">
                  {client.clientName || "N/A"}
                </td>
                <td style={clientsStyles.tableCell} data-label="Client Phone:">
                  {client.clientPhone || "N/A"}
                </td>
                <td style={clientsStyles.tableCell} data-label="Status:">
                  {client.status}
                </td>
                <td style={clientsStyles.tableCell} data-label="ID:">
                  {client.iD}
                </td>
                {(onEdit || onEntities) && (
                  <td style={clientsStyles.tableCell} data-label="Actions:">
                    {onEdit && (
                      <button
                        style={clientsStyles.actionButton} // Style this button
                        onClick={() => onEdit(client.iD)}
                        aria-label={`Edit ${client.clientName || "client"}`}
                      >
                        Edit {/* Replace with Edit Icon */}
                      </button>
                    )}
                    {onEntities && (
                      <button
                        style={{
                          ...clientsStyles.actionButton,
                          ...clientsStyles.deleteButton,
                        }} // Style this
                        onClick={() => onEntities(client.iD)}
                        aria-label={`Entity ${client.clientName || "client"}`}
                      >
                        Entities {/* Replace with Delete Icon */}
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
        <div style={clientsStyles.paginationContainer}>
          <button
            style={clientsStyles.paginationButton}
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
                style={clientsStyles.paginationButton}
                onClick={() => handleGoToPage(1)}
                aria-label="Go to page 1"
              >
                1
              </button>
              {pageNumbersToDisplay[0] > 2 && (
                <span style={clientsStyles.paginationEllipsis}>...</span>
              )}
            </>
          )}

          {pageNumbersToDisplay.map((pageNumber) => (
            <button
              key={pageNumber}
              style={{
                ...clientsStyles.paginationButton,
                ...(currentPage === pageNumber
                  ? clientsStyles.paginationButtonActive
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
                <span style={clientsStyles.paginationEllipsis}>...</span>
              )}
              <button
                style={clientsStyles.paginationButton}
                onClick={() => handleGoToPage(totalPages)}
                aria-label={`Go to page ${totalPages}`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            style={clientsStyles.paginationButton}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            » {/* Next Icon/Text */}
          </button>
          <span style={clientsStyles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </>
  );
};

export default ClientsTable;
