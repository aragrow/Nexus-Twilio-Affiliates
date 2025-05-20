// In your React component (e.g., WorkFlowBuilder.tsx)

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"; // Updated import

import type { WorkFlowItem } from "./interface";

// --- Sample Data (Replace with actual data fetching) ---
const initialEntities: Entity[] = [
  { id: "entity-1", name: "Phone Line Alpha", type: "Phone" },
  { id: "entity-2", name: "Service Beta", type: "Service" },
  { id: "entity-3", name: "Device Gamma", type: "Device" },
  { id: "entity-4", name: "Contact Delta", type: "Contact" },
];

const WorkFlowBuilder: React.FC = () => {
  const [availableEntities, setAvailableEntities] =
    useState<Entity[]>(initialEntities);
  const [WorkFlowItems, setWorkFlowItems] = useState<WorkFlowItem[]>([]);

  // --- Drag End Handler ---
  const onDragEnd: OnDragEndResponder = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // 1. Dropped outside any droppable area
    if (!destination) {
      return;
    }

    // 2. Dropped in the same place it started
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceDroppableId = source.droppableId;
    const destinationDroppableId = destination.droppableId;

    // --- Logic for moving items ---

    if (
      sourceDroppableId === "availableEntities" &&
      destinationDroppableId === "WorkFlowContainer"
    ) {
      // Moving from Available Entities to WorkFlow Container
      const entityToAdd = availableEntities.find((e) => e.id === draggableId);
      if (entityToAdd) {
        const newAvailableEntities = availableEntities.filter(
          (e) => e.id !== draggableId
        );
        const newWorkFlowItems = Array.from(WorkFlowItems);
        // Insert at the destination index (FIFO by default if dropped at end)
        newWorkFlowItems.splice(destination.index, 0, { ...entityToAdd });

        setAvailableEntities(newAvailableEntities);
        setWorkFlowItems(newWorkFlowItems);
      }
    } else if (
      sourceDroppableId === "WorkFlowContainer" &&
      destinationDroppableId === "WorkFlowContainer"
    ) {
      // Reordering within the WorkFlow Container
      const newWorkFlowItems = Array.from(WorkFlowItems);
      const [reorderedItem] = newWorkFlowItems.splice(source.index, 1);
      newWorkFlowItems.splice(destination.index, 0, reorderedItem);

      setWorkFlowItems(newWorkFlowItems);
    } else if (
      sourceDroppableId === "WorkFlowContainer" &&
      destinationDroppableId === "availableEntities"
    ) {
      // Moving from WorkFlow Container back to Available Entities (Optional: "delete" from WorkFlow)
      const itemToRemove = WorkFlowItems.find(
        (item) => item.id === draggableId
      );
      if (itemToRemove) {
        const newWorkFlowItems = WorkFlowItems.filter(
          (item) => item.id !== draggableId
        );
        const newAvailableEntities = Array.from(availableEntities);
        // Add it back to available entities (e.g., at original position or end)
        // For simplicity, adding to the end. You might want to sort or put it back intelligently.
        newAvailableEntities.splice(destination.index, 0, {
          id: itemToRemove.id, // ensure it's the base Entity type
          name: itemToRemove.name,
          type: itemToRemove.type,
        });

        setWorkFlowItems(newWorkFlowItems);
        setAvailableEntities(newAvailableEntities);
      }
    }
  };

  // --- JSX ---
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
        {/* Column 1: Available Entities */}
        <Droppable droppableId="availableEntities" type="ENTITY">
          {(provided: DroppableProvided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{
                background: snapshot.isDraggingOver ? "lightblue" : "lightgrey",
                padding: 8,
                width: 250,
                minHeight: 400,
                border: "1px solid grey",
                borderRadius: "4px",
              }}
            >
              <h3 style={{ textAlign: "center" }}>Available Entities</h3>
              {availableEntities.map((entity, index) => (
                <Draggable
                  key={entity.id}
                  draggableId={entity.id}
                  index={index}
                >
                  {(
                    providedDraggable: DraggableProvided,
                    snapshotDraggable: DraggableStateSnapshot
                  ) => (
                    <div
                      ref={providedDraggable.innerRef}
                      {...providedDraggable.draggableProps}
                      {...providedDraggable.dragHandleProps} // The drag handle
                      style={{
                        userSelect: "none",
                        padding: "8px 12px",
                        margin: "0 0 8px 0",
                        background: snapshotDraggable.isDragging
                          ? "lightgreen"
                          : "white",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        boxShadow: snapshotDraggable.isDragging
                          ? "0 0 5px rgba(0,0,0,0.3)"
                          : "none",
                        ...providedDraggable.draggableProps.style, // Important for positioning
                      }}
                    >
                      <strong>{entity.name}</strong> ({entity.type})
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder} {/* Creates space when dragging */}
            </div>
          )}
        </Droppable>

        {/* Column 2: WorkFlow Container (Droppable Area) */}
        <Droppable droppableId="WorkFlowContainer" type="ENTITY">
          {(provided: DroppableProvided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{
                background: snapshot.isDraggingOver ? "lightyellow" : "#f0f0f0",
                padding: 8,
                width: 350,
                minHeight: 400,
                border: "1px solid grey",
                borderRadius: "4px",
              }}
            >
              <h3 style={{ textAlign: "center" }}>WorkFlow Steps (FIFO)</h3>
              {WorkFlowItems.length === 0 && !snapshot.isDraggingOver && (
                <p style={{ textAlign: "center", color: "#777" }}>
                  Drag entities here to build your WorkFlow.
                </p>
              )}
              {WorkFlowItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(
                    providedDraggable: DraggableProvided,
                    snapshotDraggable: DraggableStateSnapshot
                  ) => (
                    <div
                      ref={providedDraggable.innerRef}
                      {...providedDraggable.draggableProps}
                      {...providedDraggable.dragHandleProps}
                      style={{
                        userSelect: "none",
                        padding: "8px 12px",
                        margin: "0 0 8px 0",
                        background: snapshotDraggable.isDragging
                          ? "lightgreen"
                          : "#e9efff",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        boxShadow: snapshotDraggable.isDragging
                          ? "0 0 5px rgba(0,0,0,0.3)"
                          : "none",
                        ...providedDraggable.draggableProps.style,
                      }}
                    >
                      <strong>{item.name}</strong> ({item.type})
                      {/* You can add more controls here like a delete button for the item */}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};

export default WorkFlowBuilder;
