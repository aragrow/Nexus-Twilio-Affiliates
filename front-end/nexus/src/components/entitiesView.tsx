// entitiesTable.tsx
import React, { useState, useMemo } from "react";
import entitiesStyles from "./entitiesStyles"; // Assuming table styles are in dashboardStyles
import type { EntitiesViewProps } from "./interface"; // Importing the entity interface

const ITEMS_PER_PAGE = 15; // Or make this a prop if you want it configurable

const EntitiesView: React.FC<EntitiesViewProps> = ({
  entities,
  isLoading,
  isError,
  onEdit,
  onBilling,
}) => {
  if (isLoading) {
    return <div style={entitiesStyles.loader}>Loading entities...</div>; // Style this loader
  }

  if (isError) {
    return <div style={entitiesStyles.errorMessage}>{isError}</div>; // Style this error message
  }

  if (!entities || entities.length === 0) {
    return <div style={entitiesStyles.noDataMessage}>No entities found.</div>; // Style this
  }

  const [currentPage, setCurrentPage] = useState(1);

  // Memoize the paginated entities to avoid re-calculating on every render
  // unless entities or currentPage changes.
  const paginatedEntities = useMemo(() => {
    if (!entities) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return entities.slice(startIndex, endIndex);
  }, [entities, currentPage]);

  const totalPages = Math.ceil(entities.length / ITEMS_PER_PAGE);

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
      <div style={entitiesStyles.tableContainer}>
        {" "}
        {/* Main container for responsiveness */}
        <table style={entitiesStyles.table}>
          <thead style={entitiesStyles.tableHead}>
            <tr>
              <th style={entitiesStyles.tableHeader}>Entity Type</th>
              <th style={entitiesStyles.tableHeader}>Entity Name</th>
              <th style={entitiesStyles.tableHeader}>Entity Phone</th>
              <th style={entitiesStyles.tableHeader}>Entity Status</th>
              <th style={entitiesStyles.tableHeader}>ID</th>
              {/* Add Actions header if you have onEdit/onDelete */}
              {(onEdit || onBilling) && (
                <th style={entitiesStyles.tableHeader}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody style={entitiesStyles.tableBody}>
            {paginatedEntities.map((entity) => (
              <tr key={entity.iD} style={entitiesStyles.tableRow}>
                <td style={entitiesStyles.tableCell} data-label="entity TYPE:">
                  {entity.entityType || "N/A"}
                </td>
                <td style={entitiesStyles.tableCell} data-label="entity Name:">
                  {entity.entityName || "N/A"}
                </td>
                <td style={entitiesStyles.tableCell} data-label="entity Phone:">
                  {entity.entityPhone || "N/A"}
                </td>
                <td style={entitiesStyles.tableCell} data-label="Status:">
                  {entity.entityStatus}
                </td>
                <td style={entitiesStyles.tableCell} data-label="ID:">
                  {entity.iD}
                </td>
                {(onEdit || onBilling) && (
                  <td style={entitiesStyles.tableCell} data-label="Actions:">
                    {onEdit && (
                      <button
                        style={entitiesStyles.actionButton} // Style this button
                        onClick={() => onEdit(entity.iD)}
                        aria-label={`Edit ${entity.entityName || "entity"}`}
                      >
                        Edit {/* Replace with Edit Icon */}
                      </button>
                    )}
                    {onBilling && (
                      <button
                        style={{
                          ...entitiesStyles.actionButton,
                          ...entitiesStyles.deleteButton,
                        }} // Style this
                        onClick={() => onBilling(entity.iD)}
                        aria-label={`Entity ${entity.entityName || "entity"}`}
                      >
                        Billing {/* Replace with Delete Icon */}
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
        <div style={entitiesStyles.paginationContainer}>
          <button
            style={entitiesStyles.paginationButton}
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
                style={entitiesStyles.paginationButton}
                onClick={() => handleGoToPage(1)}
                aria-label="Go to page 1"
              >
                1
              </button>
              {pageNumbersToDisplay[0] > 2 && (
                <span style={entitiesStyles.paginationEllipsis}>...</span>
              )}
            </>
          )}

          {pageNumbersToDisplay.map((pageNumber) => (
            <button
              key={pageNumber}
              style={{
                ...entitiesStyles.paginationButton,
                ...(currentPage === pageNumber
                  ? entitiesStyles.paginationButtonActive
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
                <span style={entitiesStyles.paginationEllipsis}>...</span>
              )}
              <button
                style={entitiesStyles.paginationButton}
                onClick={() => handleGoToPage(totalPages)}
                aria-label={`Go to page ${totalPages}`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            style={entitiesStyles.paginationButton}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            » {/* Next Icon/Text */}
          </button>
          <span style={entitiesStyles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </>
  );
};

export default EntitiesView;
