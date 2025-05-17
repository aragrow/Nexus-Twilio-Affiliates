// src/components/workflowManage/WorkflowManage.tsx
import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import {
  useWorkflowManager,
  Client,
  Entity,
  AssignedEntity,
} from "./workflowManageLogic";
import styles from "./workflowManageStyles"; // Your JSS styles

// --- Helper: Draggable Entity Item ---
interface DraggableItemProps {
  item: Entity | AssignedEntity;
  index: number;
  isAssigned: boolean;
  onToggleActive?: (id: string) => void; // Only for assigned items
}

const DraggableEntityItem: React.FC<DraggableItemProps> = ({
  item,
  index,
  isAssigned,
  onToggleActive,
}) => {
  const assignedItem = item as AssignedEntity; // Type assertion for assigned properties

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...styles.entityItem,
            ...(snapshot.isDragging
              ? {
                  backgroundColor: "#007bff",
                  color: "white",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                }
              : {}),
            ...provided.draggableProps.style,
          }}
          aria-label={`Draggable entity ${item.name}`}
        >
          <span style={styles.entityName}>
            {item.name}{" "}
            <em style={{ fontSize: "0.8em", color: "#aaa" }}>({item.type})</em>
          </span>
          {isAssigned && onToggleActive && (
            <div
              style={styles.checkboxContainer}
              title={
                assignedItem.isActiveInWorkflow
                  ? "Deactivate in workflow"
                  : "Activate in workflow"
              }
            >
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={assignedItem.isActiveInWorkflow}
                onChange={() => onToggleActive(item.id)}
                aria-label={
                  assignedItem.isActiveInWorkflow
                    ? `Deactivate ${item.name} in workflow`
                    : `Activate ${item.name} in workflow`
                }
              />
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

// --- Main Component ---
const WorkflowManage: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    selectedClient,
    handleClientSelect,
    assignedEntities,
    unassignedEntities,
    isLoadingEntities,
    error,
    toggleEntityActive,
    onDragEnd,
  } = useWorkflowManager();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length >= 3 || e.target.value.length === 0) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const onClientItemClick = (client: Client) => {
    handleClientSelect(client);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {/* Replace "Client Searchable Dropdown" with an icon if going no-text */}
        <h2>Entity Assignment Workflow</h2>
      </div>

      <div style={styles.clientSearchContainer}>
        <input
          type="text"
          style={styles.searchInput}
          placeholder="Search Clients (min 3 chars) or click arrow..." // Will be icon
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsDropdownOpen(true)} // Open on focus
          // onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)} // Close on blur with delay
        />
        {/* You'd replace the text "V" with a dropdown arrow icon */}
        <button
          onClick={() => {
            setIsDropdownOpen((prev) => !prev);
            if (
              !isDropdownOpen &&
              searchTerm.length === 0 &&
              searchResults.length === 0
            ) {
              // Fetch initial clients if dropdown is opened via button and no search term
              // This requires searchClients in logic.ts to handle empty search term
              // by returning a few initial clients.
              // mockClientApi.searchClients('').then(setSearchResultsFromLogicHook); // Need to expose setSearchResults
            }
          }}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            color: "#e0e0e0",
            cursor: "pointer",
            fontSize: "1.2em",
          }}
          aria-label="Toggle client list"
        >
          ▼
        </button>
        {isDropdownOpen &&
          (searchTerm.length >= 3 || searchResults.length > 0) && (
            <div style={styles.searchResultsDropdown}>
              {isSearching && (
                <div style={styles.searchResultItem}>Searching...</div>
              )}
              {!isSearching &&
                searchResults.length === 0 &&
                searchTerm.length >= 3 && (
                  <div style={styles.searchResultItem}>No clients found.</div>
                )}
              {searchResults.map((client) => (
                <div
                  key={client.iD}
                  style={styles.searchResultItem}
                  onClick={() => onClientItemClick(client)}
                  onMouseDown={(e) => e.preventDefault()} // Prevents input blur before click
                >
                  {client.clientName}
                </div>
              ))}
            </div>
          )}
      </div>

      {selectedClient && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={styles.columnsContainer}>
            {/* Assigned Entities Column */}
            <Droppable droppableId="assigned" type="ENTITY">
              {(provided: DroppableProvided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    ...styles.column,
                    ...(snapshot.isDraggingOver
                      ? { backgroundColor: "#3a5064" }
                      : {}), // Highlight on drag over
                  }}
                >
                  <h3 style={styles.columnTitle}>
                    Assigned Entities (to {selectedClient.clientName})
                  </h3>
                  <div style={styles.entityList}>
                    {isLoadingEntities && (
                      <div style={styles.loader}>Loading...</div>
                    )}
                    {error && <div style={styles.errorMessage}>{error}</div>}
                    {!isLoadingEntities &&
                      assignedEntities.map((entity, index) => (
                        <DraggableEntityItem
                          key={entity.id}
                          item={entity}
                          index={index}
                          isAssigned={true}
                          onToggleActive={toggleEntityActive}
                        />
                      ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>

            {/* Unassigned Entities Column */}
            <Droppable droppableId="unassigned" type="ENTITY">
              {(provided: DroppableProvided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    ...styles.column,
                    ...(snapshot.isDraggingOver
                      ? { backgroundColor: "#503a3a" }
                      : {}),
                  }}
                >
                  <h3 style={styles.columnTitle}>Unassigned Entities</h3>
                  <div style={styles.entityList}>
                    {isLoadingEntities && (
                      <div style={styles.loader}>Loading...</div>
                    )}
                    {error && <div style={styles.errorMessage}>{error}</div>}
                    {!isLoadingEntities &&
                      unassignedEntities.map((entity, index) => (
                        <DraggableEntityItem
                          key={entity.id}
                          item={entity}
                          index={index}
                          isAssigned={false}
                        />
                      ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      )}
      {!selectedClient && (
        <p style={{ textAlign: "center", marginTop: "30px" }}>
          Please select a client to manage their entities.
        </p>
      )}
    </div>
  );
};

export default WorkflowManage;
