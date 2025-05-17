// entitiesTable.tsx
import React from "react";
import entitiesStyles from "./entitiesStyles"; // Assuming table styles are in dashboardStyles
import type { EntitiesTableProps } from "./interface"; // Importing the entity interface

const EntitiesTable: React.FC<EntitiesTableProps> = ({
  entities,
  isLoading,
  error,
  onEdit,
  onBilling,
}) => {
  if (isLoading) {
    return <div style={entitiesStyles.loader}>Loading entities...</div>; // Style this loader
  }

  if (error) {
    return <div style={entitiesStyles.errorMessage}>{error}</div>; // Style this error message
  }

  if (!entities || entities.length === 0) {
    return <div style={entitiesStyles.noDataMessage}>No entities found.</div>; // Style this
  }

  return (
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
          {entities.map((entity) => (
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
  );
};

export default EntitiesTable;
