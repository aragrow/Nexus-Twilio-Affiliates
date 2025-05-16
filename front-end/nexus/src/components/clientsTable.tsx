// clientsTable.tsx
import React from "react";
import clientsStyles from "./clientsStyles"; // Assuming table styles are in dashboardStyles
import type { ClientsTableProps } from "./interface"; // Importing the client interface

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

  return (
    <div style={clientsStyles.tableContainer}>
      {" "}
      {/* Main container for responsiveness */}
      <table style={clientsStyles.table}>
        <thead style={clientsStyles.tableHead}>
          <tr>
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
          {clients.map((client) => (
            <tr key={client.iD} style={clientsStyles.tableRow}>
              <td style={clientsStyles.tableCell} data-label="Client Account:">
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
  );
};

export default ClientsTable;
