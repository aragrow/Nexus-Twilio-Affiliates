// EntitiesView.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useQuery } from "@apollo/client";
import { GET_MANAGE_ENTITIES } from "./graphqlQueries";
import EntityAdd from "./EntityAdd";
import EntityUpdate from "./EntityUpdate";
import type { Entity } from "./interface";
import { styles } from "./entitiesStyles";

const EntitiesView: React.FC = () => {
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEntities, setFilteredEntities] = useState<Entity[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedEntities, setPaginatedEntities] = useState<Entity[]>([]);

  const { data, loading, error, refetch } = useQuery(GET_MANAGE_ENTITIES);

  // Filter entities based on search term
  const filterEntities = useCallback(() => {
    if (!data?.nexusEntities) return [];

    if (!searchTerm.trim()) {
      return data.nexusEntities;
    }

    const term = searchTerm.toLowerCase().trim();
    return (data.nexusEntities ?? []).filter(
      (entity: Entity) =>
        entity.entityName.toLowerCase().includes(term) ||
        entity.entityType.toLowerCase().includes(term) ||
        entity.entityStatus.toLowerCase().includes(term) ||
        entity.client?.clientName?.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  // Update filtered entities when data or search term changes
  useEffect(() => {
    const filtered = filterEntities();
    setFilteredEntities(filtered);

    // Reset to first page when filters change
    setCurrentPage(1);

    // Calculate total pages
    setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
  }, [data, searchTerm, filterEntities, pageSize]);

  // Update paginated entities when filtered entities or pagination settings change
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setPaginatedEntities(filteredEntities.slice(startIndex, endIndex));
  }, [filteredEntities, currentPage, pageSize]);

  const handleAddSuccess = () => {
    setMode("list");
    refetch();
  };

  const handleUpdateSuccess = () => {
    setMode("list");
    setSelectedEntity(null);
    refetch();
  };

  const handleEditClick = (entity: Entity) => {
    setSelectedEntity(entity);
    setMode("edit");
  };

  const handleCancel = () => {
    setMode("list");
    setSelectedEntity(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (mode === "add") {
    return <EntityAdd onSuccess={handleAddSuccess} onCancel={handleCancel} />;
  }

  if (mode === "edit" && selectedEntity) {
    return (
      <EntityUpdate
        entity={selectedEntity}
        onSuccess={handleUpdateSuccess}
        onCancel={handleCancel}
      />
    );
  }

  // Calculate pagination info
  const startItem =
    filteredEntities.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredEntities.length);

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <h2 style={styles.pageTitle}>Entities</h2>
        <button
          onClick={() => setMode("add")}
          style={styles.addButton}
          className="add-button"
        >
          + Add Entity
        </button>
      </div>

      {/* Search Input */}
      <div style={styles.searchContainer}>
        <div style={styles.searchIcon}>
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
          placeholder="Search entities by client, name, type, or description..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={styles.searchInput}
          className="search-input"
          aria-label="Search entities"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            style={styles.clearButton}
            className="clear-button"
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

      {loading && <div style={styles.loadingMessage}>Loading entities...</div>}
      {error && (
        <div style={styles.errorMessage}>
          Error loading entities: {error.message}
        </div>
      )}

      {!loading && !error && (
        <>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.tableCell}>Name</th>
                <th style={styles.tableCell}>Type</th>
                <th style={styles.tableCell}>Phone</th>
                <th style={styles.tableCell}>Client</th>
                <th style={styles.tableCell}>Status</th>
                <th style={styles.tableCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntities.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={
                      searchTerm ? styles.noResultsMessage : styles.emptyMessage
                    }
                  >
                    {searchTerm
                      ? `No entities found matching "${searchTerm}"`
                      : "No entities found. Click 'Add Entity' to create one."}
                  </td>
                </tr>
              ) : (
                paginatedEntities.map((entity: Entity) => (
                  <tr
                    key={entity.id}
                    style={styles.tableRow}
                    className="table-row"
                  >
                    <td style={styles.tableCell}>{entity.entityName}</td>
                    <td style={styles.tableCell}>
                      {entity.entityType === "individual"
                        ? "Individual"
                        : "Group"}
                    </td>
                    <td style={styles.tableCell}>{entity.entityPhone}</td>
                    <td style={styles.tableCell}>
                      {entity.client?.clientName}
                    </td>
                    <td style={styles.tableCell}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(entity.entityStatus === "Active"
                            ? styles.statusActive
                            : styles.statusInactive),
                        }}
                      >
                        {entity.entityStatus === "Active"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => handleEditClick(entity)}
                        style={styles.editButton}
                        className="edit-button"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          {filteredEntities.length > 0 && (
            <div style={styles.paginationContainer}>
              <div style={styles.paginationInfo}>
                Showing {startItem} to {endItem} of {filteredEntities.length}{" "}
                entities
              </div>

              <div style={styles.paginationControls}>
                {/* Previous Page Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    ...styles.pageButton,
                    ...(currentPage === 1 ? styles.pageButtonDisabled : {}),
                  }}
                  className="page-button"
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

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current page
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there are gaps
                    const showEllipsisBefore =
                      index > 0 && array[index - 1] !== page - 1;
                    const showEllipsisAfter =
                      index < array.length - 1 && array[index + 1] !== page + 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsisBefore && (
                          <span
                            style={{ color: "#cbd5e1", padding: "0 0.5rem" }}
                          >
                            ...
                          </span>
                        )}

                        <button
                          onClick={() => handlePageChange(page)}
                          style={{
                            ...styles.pageButton,
                            ...(currentPage === page
                              ? styles.pageButtonActive
                              : {}),
                          }}
                          className={`page-button ${
                            currentPage === page ? "active" : ""
                          }`}
                          aria-label={`Page ${page}`}
                          aria-current={
                            currentPage === page ? "page" : undefined
                          }
                        >
                          {page}
                        </button>

                        {showEllipsisAfter && (
                          <span
                            style={{ color: "#cbd5e1", padding: "0 0.5rem" }}
                          >
                            ...
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}

                {/* Next Page Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    ...styles.pageButton,
                    ...(currentPage === totalPages
                      ? styles.pageButtonDisabled
                      : {}),
                  }}
                  className="page-button"
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

                {/* Page Size Selector */}
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  style={styles.pageSizeSelector}
                  className="page-size-selector"
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

export default EntitiesView;
