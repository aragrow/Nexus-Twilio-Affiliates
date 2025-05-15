// AffiliatesTable.tsx
import React from "react";
import affiliatesStyles from "./affiliatesStyles"; // Assuming table styles are in dashboardStyles
import type { AffiliatesTableProps } from "./interface"; // Importing the Affiliate interface

const AffiliatesTable: React.FC<AffiliatesTableProps> = ({
  affiliates,
  isLoading,
  error,
  onEdit,
  onDelete,
}) => {
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

  return (
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
            {(onEdit || onDelete) && (
              <th style={affiliatesStyles.tableHeader}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody style={affiliatesStyles.tableBody}>
          {affiliates.map((affiliate) => (
            <tr key={affiliate.iD} style={affiliatesStyles.tableRow}>
              <td style={affiliatesStyles.tableCell} data-label="Company Name:">
                {affiliate.companyName || "N/A"}
              </td>
              <td style={affiliatesStyles.tableCell} data-label="Contact Name:">
                {affiliate.contactName || "N/A"}
              </td>
              <td style={affiliatesStyles.tableCell} data-label="ID:">
                {affiliate.iD}
              </td>
              {(onEdit || onDelete) && (
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
                  {onDelete && (
                    <button
                      style={{
                        ...affiliatesStyles.actionButton,
                        ...affiliatesStyles.deleteButton,
                      }} // Style this
                      onClick={() => onDelete(affiliate.iD)}
                      aria-label={`Delete ${
                        affiliate.companyName || "affiliate"
                      }`}
                    >
                      Delete {/* Replace with Delete Icon */}
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AffiliatesTable;
