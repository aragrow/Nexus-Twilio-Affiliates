// clientsTable.tsx
import React from "react";
import clientsStyles from "./clientsStyles"; // Assuming table styles are in dashboardStyles
import type { ClientsTableProps } from "./interface"; // Importing the client interface
import type Dashboard from "./dashboard";

const DashboardScreen: React.FC<ClientsTableProps> = ({

  return (
    <div style={clientsStyles.tableContainer}>
      {" "}
      {/* Main container for responsiveness */}
      <table style={clientsStyles.table}>
        <thead style={clientsStyles.tableHead}>
          <tr>
            <th style={clientsStyles.tableHeader}>Company Name</th>
            <th style={clientsStyles.tableHeader}>Contact Name</th>
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
              <td style={clientsStyles.tableCell} data-label="Company Name:">
                {client.clientName || "N/A"}
              </td>
              <td style={clientsStyles.tableCell} data-label="Contact Name:">
                {client.clientPhone || "N/A"}
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
                      aria-label={`Clients ${client.clientName || "client"}`}
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
  );
};

export default DashboardScreen;
