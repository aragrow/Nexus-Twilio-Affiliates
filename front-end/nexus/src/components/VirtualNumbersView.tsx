import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_MANAGE_VIRTUAL_NUMBERS } from "./graphqlQueries";
import VirtualNumberAdd from "./VirtualNumberAdd";
import VirtualNumberUpdate from "./VirtualNumberUpdate";
import type { VirtualNumber, Client } from "./interface"; // Assuming Client might be needed for filtering if not already handled
import { styles as vnStyles } from "./virtualNumbersStyles"; // Using aliased import for clarity

const VirtualNumbersView: React.FC = () => {
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [selectedVirtualNumber, setSelectedVirtualNumber] =
    useState<VirtualNumber | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredVirtualNumbers, setFilteredVirtualNumbers] = useState<
    VirtualNumber[]
  >([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedVirtualNumbers, setPaginatedVirtualNumbers] = useState<
    VirtualNumber[]
  >([]);

  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");
  const isAffiliate = userRole?.toLowerCase() === "nexus_affiliate";
  const isClientRole = userRole?.toLowerCase() === "nexus_client"; // Renamed to avoid conflict

  const dbUserId = useMemo(() => {
    if (!userId) return null;
    try {
      return atob(userId).split(":")[1];
    } catch (e) {
      console.error("Error decoding userId:", e);
      return null;
    }
  }, [userId]);

  const { data, loading, error, refetch } = useQuery<{
    nexusVirtualNumbers: VirtualNumber[];
  }>(GET_MANAGE_VIRTUAL_NUMBERS, {
    variables: {
      affiliateId: isAffiliate ? dbUserId : null,
      clientId: isClientRole ? dbUserId : null, // Corrected variable name
    },
    skip: !dbUserId && (isAffiliate || isClientRole), // Skip if role requires ID but ID is not available
    fetchPolicy: "cache-and-network",
  });

  const filterVirtualNumbers = useCallback(() => {
    const VNs = data?.nexusVirtualNumbers;
    if (!VNs) return [];
    if (!searchTerm.trim()) return VNs;

    const term = searchTerm.toLowerCase().trim();
    return VNs.filter(
      (vn: VirtualNumber) =>
        vn.friendlyName.toLowerCase().includes(term) ||
        vn.phoneNumber.toLowerCase().includes(term) ||
        vn.status.toLowerCase().includes(term) ||
        vn.client?.clientName?.toLowerCase().includes(term) ||
        vn.provider?.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  useEffect(() => {
    const filtered = filterVirtualNumbers();
    setFilteredVirtualNumbers(filtered);
    setCurrentPage(1);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
  }, [data, searchTerm, filterVirtualNumbers, pageSize]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setPaginatedVirtualNumbers(
      filteredVirtualNumbers.slice(startIndex, endIndex)
    );
  }, [filteredVirtualNumbers, currentPage, pageSize]);

  const handleAddSuccess = () => {
    setMode("list");
    refetch();
  };

  const handleUpdateSuccess = () => {
    setMode("list");
    setSelectedVirtualNumber(null);
    refetch();
  };

  const handleEditClick = (vn: VirtualNumber) => {
    setSelectedVirtualNumber(vn);
    setMode("edit");
  };

  const handleCancel = () => {
    setMode("list");
    setSelectedVirtualNumber(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => setSearchTerm("");
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  if (mode === "add") {
    return (
      <VirtualNumberAdd onSuccess={handleAddSuccess} onCancel={handleCancel} />
    );
  }

  if (mode === "edit" && selectedVirtualNumber) {
    return (
      <VirtualNumberUpdate
        virtualNumber={selectedVirtualNumber}
        onSuccess={handleUpdateSuccess}
        onCancel={handleCancel}
      />
    );
  }

  const startItem =
    filteredVirtualNumbers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(
    currentPage * pageSize,
    filteredVirtualNumbers.length
  );

  const renderCapability = (label: string, active: boolean) => (
    <span
      title={`${label}: ${active ? "Enabled" : "Disabled"}`}
      style={{ marginRight: "5px", color: active ? "#10b981" : "#aaa" }}
    >
      {label.substring(0, 1).toUpperCase()}
    </span>
  );

  return (
    <div style={vnStyles.container}>
      <div style={vnStyles.headerContainer}>
        <h2 style={vnStyles.pageTitle}>Virtual Numbers</h2>
        <button onClick={() => setMode("add")} style={vnStyles.addButton}>
          + Add Virtual Number
        </button>
      </div>

      <div style={vnStyles.searchContainer}>
        <div style={vnStyles.searchIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by friendly name, number, client, status..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={vnStyles.searchInput}
          aria-label="Search virtual numbers"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            style={vnStyles.clearButton}
            aria-label="Clear search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {loading && (
        <div
          style={
            vnStyles.loadingMessage || { textAlign: "center", padding: "2rem" }
          }
        >
          Loading virtual numbers...
        </div>
      )}
      {error && (
        <div
          style={
            vnStyles.errorMessage || {
              color: "red",
              textAlign: "center",
              padding: "1rem",
            }
          }
        >
          Error loading virtual numbers: {error.message}
        </div>
      )}

      {!loading && !error && (
        <>
          <div style={{ overflowX: "auto" }}>
            {" "}
            {/* Wrapper for horizontal scrolling on small screens */}
            <table style={vnStyles.table}>
              <thead>
                <tr style={vnStyles.tableHeader as React.CSSProperties}>
                  <th style={vnStyles.tableCell}>Friendly Name</th>
                  <th style={vnStyles.tableCell}>Phone Number</th>
                  <th style={vnStyles.tableCell}>Client</th>
                  <th style={vnStyles.tableCell}>Provider</th>
                  <th style={vnStyles.tableCell}>Caps</th>
                  <th style={vnStyles.tableCell}>Status</th>
                  <th style={vnStyles.tableCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVirtualNumbers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={
                        searchTerm
                          ? vnStyles.noResultsMessage
                          : vnStyles.emptyMessage
                      }
                    >
                      {searchTerm
                        ? `No virtual numbers found matching "${searchTerm}"`
                        : "No virtual numbers found. Click 'Add Virtual Number' to create one."}
                    </td>
                  </tr>
                ) : (
                  paginatedVirtualNumbers.map((vn: VirtualNumber) => (
                    <tr key={vn.iD} style={vnStyles.tableRow}>
                      <td style={vnStyles.tableCell}>{vn.friendlyName}</td>
                      <td style={vnStyles.tableCell}>{vn.phoneNumber}</td>
                      <td style={vnStyles.tableCell}>
                        {vn.client?.clientName || "N/A"}
                      </td>
                      <td style={vnStyles.tableCell}>{vn.provider}</td>
                      <td style={vnStyles.tableCell}>
                        {renderCapability("Voice", vn.capabilities.voice)}
                        {renderCapability("SMS", vn.capabilities.sms)}
                        {renderCapability("MMS", vn.capabilities.mms)}
                        {renderCapability("Fax", vn.capabilities.fax)}
                      </td>
                      <td style={vnStyles.tableCell}>
                        <span
                          style={{
                            ...vnStyles.statusBadge,
                            ...(vnStyles[
                              `status_${vn.status.replace(
                                / /g,
                                "_"
                              )}` as keyof typeof vnStyles
                            ] || vnStyles.status_inactive), // Handle different statuses
                          }}
                        >
                          {vn.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td style={vnStyles.tableCell}>
                        <button
                          onClick={() => handleEditClick(vn)}
                          style={vnStyles.editButton}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredVirtualNumbers.length > 0 && (
            <div style={vnStyles.paginationContainer}>
              <div style={vnStyles.paginationInfo}>
                Showing {startItem} to {endItem} of{" "}
                {filteredVirtualNumbers.length} virtual numbers
              </div>
              <div style={vnStyles.paginationControls}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    ...vnStyles.pageButton,
                    ...(currentPage === 1 ? vnStyles.pageButtonDisabled : {}),
                  }}
                  aria-label="Previous page"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                {/* Simple page numbers for brevity, enhance as in EntitiesView if needed */}
                <span style={{ padding: "0 0.5rem" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    ...vnStyles.pageButton,
                    ...(currentPage === totalPages
                      ? vnStyles.pageButtonDisabled
                      : {}),
                  }}
                  aria-label="Next page"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  style={vnStyles.pageSizeSelector}
                  aria-label="Items per page"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VirtualNumbersView;
