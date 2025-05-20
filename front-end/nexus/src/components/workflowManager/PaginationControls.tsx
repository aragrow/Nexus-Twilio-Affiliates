// src/components/workflowManage/PaginationControls.tsx
import React, { useMemo } from "react";
import workFlowsStyles from "./workFlowsStyles";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void; // Generic page change handler
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePreviousPage = () => onPageChange(Math.max(currentPage - 1, 1));
  const handleNextPage = () =>
    onPageChange(Math.min(currentPage + 1, totalPages));

  const pageNumbersToDisplay = useMemo(() => {
    const pageNumbers: number[] = [];
    const maxPagesToShow = 5;
    let startPage: number, endPage: number;
    if (totalPages <= 0) return [];
    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
      const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;
      if (currentPage <= maxPagesBeforeCurrent) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrent;
        endPage = currentPage + maxPagesAfterCurrent;
      }
    }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    return pageNumbers;
  }, [totalPages, currentPage]);

  if (totalPages <= 1) {
    return null; // Don't show pagination if only one page or no pages
  }

  return (
    <div style={workFlowsStyles.paginationContainer}>
      <button
        style={workFlowsStyles.paginationButton}
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        «
      </button>
      {pageNumbersToDisplay[0] > 1 && (
        <>
          <button
            style={workFlowsStyles.paginationButton}
            onClick={() => onPageChange(1)}
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
          onClick={() => onPageChange(pageNumber)}
          aria-current={currentPage === pageNumber ? "page" : undefined}
          aria-label={`Go to page ${pageNumber}`}
        >
          {pageNumber}
        </button>
      ))}
      {pageNumbersToDisplay[pageNumbersToDisplay.length - 1] < totalPages && (
        <>
          {pageNumbersToDisplay[pageNumbersToDisplay.length - 1] <
            totalPages - 1 && (
            <span style={workFlowsStyles.paginationEllipsis}>...</span>
          )}
          <button
            style={workFlowsStyles.paginationButton}
            onClick={() => onPageChange(totalPages)}
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
        »
      </button>
      <span style={workFlowsStyles.paginationInfo}>
        {" "}
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
};

export default PaginationControls;
