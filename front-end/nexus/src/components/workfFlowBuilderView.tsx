// src/components/workflowManage/WorkflowBuilder.tsx

import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import {
  GET_NEXUS_ENTITIES_BY_CLIENT,
  GET_NEXUS_ENTITIES_BY_WORKFLOW,
} from "./graphqlQueries"; // Adjust path
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";

import type { Entity, WorkFlowItem, WorkflowBuilderProps } from "./interface";
// --- Interfaces ---

const WorkFlowBuilderView: React.FC<WorkflowBuilderProps> = ({
  clientId,
  workflowId,
  onSaveWorkflowSteps,
  onBack,
}) => {
  // --- Fetch "Available Entities" for the given client ---
  const {
    data: clientEntitiesData,
    loading: clientEntitiesLoading,
    error: clientEntitiesError,
  } = useQuery<{ nexusEntities: Entity[] }>(GET_NEXUS_ENTITIES_BY_CLIENT, {
    // Type the expected data structure
    variables: { clientId: clientId }, // Pass clientId as a variable
    skip: !clientId, // Skip the query if no clientId is provided
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      // Filter out entities already in the current workflow from the available list
      const currentWorkflowEntityIds = workflowItems.map((item) => item.id);
      setAvailableEntities(
        data?.nexusEntities?.filter(
          (entity) => !currentWorkflowEntityIds.includes(entity.id)
        ) || []
      );
    },
    onError: (error) => console.error("Error fetching client entities:", error),
  });

  // --- Fetch Entities already part of the current Workflow ---
  const {
    data: workflowStepsData, // Renamed from workflowEntitiesData for clarity
    loading: workflowStepsLoading,
    error: workflowStepsError,
  } = useQuery<{
    nexusWorkflowSteps: Array<{
      id: string;
      workflowOrder: number;
      stepStatus: string;
      entity: Entity;
    }>;
  }>(GET_NEXUS_ENTITIES_BY_WORKFLOW, {
    // Type based on query
    variables: { workflowId: workflowId }, // Pass workflowId as a variable
    skip: !workflowId, // Skip if no workflowId is provided
    fetchPolicy: "cache-and-network", // Fetch fresh but use cache for speed
    onCompleted: (data) => {
      const formattedSteps =
        data?.nexusWorkflowSteps
          ?.map((step) => ({
            ...step.entity, // Spread entity fields (id, name, type)
            workflowItemId: step.id, // This is the ID of the workflow_entities linking row
            workflowOrder: step.workflowOrder,
            isActiveInWorkflow: step.stepStatus === "active", // Convert stepStatus to boolean
          }))
          .sort((a, b) => a.workflowOrder - b.workflowOrder) || [];
      setWorkflowItems(formattedSteps);

      // After workflow items are loaded, re-filter available entities
      if (clientEntitiesData?.nexusEntities) {
        const currentWorkflowEntityIds = formattedSteps.map((item) => item.id);
        setAvailableEntities(
          clientEntitiesData.nexusEntities.filter(
            (entity) => !currentWorkflowEntityIds.includes(entity.id)
          ) || []
        );
      }
    },
    onError: (error) => console.error("Error fetching workflow steps:", error),
  });

  const [availableEntities, setAvailableEntities] = useState<Entity[]>([]);
  const [workflowItems, setWorkflowItems] = useState<WorkFlowItem[]>([]); // Renamed for clarity

  // Removed the original useEffects that directly set state from data.
  // The `onCompleted` callbacks in `useQuery` now handle this.
  // This also helps in coordinating the filtering of availableEntities.

  // --- Drag End Handler ---
  const onDragEnd: OnDragEndResponder = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    let newAvailableEntities = Array.from(availableEntities);
    let newWorkflowItems = Array.from(workflowItems);

    if (
      source.droppableId === "availableEntitiesList" &&
      destination.droppableId === "workflowStepsContainer"
    ) {
      const entityToAdd = newAvailableEntities.find(
        (e) => e.id === draggableId
      );
      if (entityToAdd) {
        newAvailableEntities = newAvailableEntities.filter(
          (e) => e.id !== draggableId
        );
        const newWorkflowStep: WorkFlowItem = {
          ...entityToAdd,
          workflowItemId: `temp-${Date.now()}`, // Temporary ID until saved and real ID comes from DB
          isActiveInWorkflow: true, // Default to active
          workflowOrder: 0, // Will be set below
        };
        newWorkflowItems.splice(destination.index, 0, newWorkflowStep);
      }
    } else if (
      source.droppableId === "workflowStepsContainer" &&
      destination.droppableId === "workflowStepsContainer"
    ) {
      const [reorderedItem] = newWorkflowItems.splice(source.index, 1);
      newWorkflowItems.splice(destination.index, 0, reorderedItem);
    } else if (
      source.droppableId === "workflowStepsContainer" &&
      destination.droppableId === "availableEntitiesList"
    ) {
      const itemToReturn = newWorkflowItems.find(
        (item) => item.id === draggableId
      );
      if (itemToReturn) {
        newWorkflowItems = newWorkflowItems.filter(
          (item) => item.id !== draggableId
        );
        // Revert to base Entity type if needed, or just use the item
        const baseEntity: Entity = {
          id: itemToReturn.id,
          name: itemToReturn.name,
          type: itemToReturn.type,
        };
        newAvailableEntities.splice(destination.index, 0, baseEntity);
      }
    }

    // Re-calculate workflowOrder for all items in the workflow
    const finalWorkflowItems = newWorkflowItems.map((item, index) => ({
      ...item,
      workflowOrder: index + 1,
    }));

    setAvailableEntities(newAvailableEntities);
    setWorkflowItems(finalWorkflowItems);
  };

  const handleToggleActive = (workflowItemId: string) => {
    setWorkflowItems((prevItems) =>
      prevItems.map((item) =>
        item.workflowItemId === workflowItemId
          ? { ...item, isActiveInWorkflow: !item.isActiveInWorkflow }
          : item
      )
    );
  };

  const handleSaveChanges = async () => {
    if (!workflowId) {
      console.error("No workflow ID to save steps for.");
      return;
    }
    console.log("Saving workflow steps:", workflowItems);
    // Prepare data for mutation (e.g., only entityId, order, isActiveInWorkflow)
    // Call onSaveWorkflowSteps prop
    try {
      await onSaveWorkflowSteps(workflowId, workflowItems);
      // Optionally refetch workflow steps or show success message
      alert("Workflow saved!");
    } catch (err) {
      alert("Failed to save workflow.");
      console.error("Save error:", err);
    }
  };

  // --- Render Logic ---
  if (!clientId || !workflowId) {
    return <div>Please select a client and a workflow to manage entities.</div>; // Or redirect
  }

  if (clientEntitiesLoading || workflowStepsLoading) {
    return <div>Loading entities...</div>; // Unified loading state
  }

  if (clientEntitiesError || workflowStepsError) {
    return (
      <div>
        Error loading data.
        {clientEntitiesError && (
          <p>Client Entities Error: {clientEntitiesError.message}</p>
        )}
        {workflowStepsError && (
          <p>Workflow Steps Error: {workflowStepsError.message}</p>
        )}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "20px",
          gap: "20px",
          background: "#333",
          color: "white",
        }}
      >
        {/* Column 1: Available Entities */}
        <Droppable droppableId="availableEntitiesList" type="WORKFLOW_ENTITY">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{
                background: snapshot.isDraggingOver ? "#555" : "#444",
                padding: 10,
                width: "45%",
                minHeight: 300,
                borderRadius: 5,
                border: "1px dashed #666",
              }}
            >
              <h4
                style={{ textAlign: "center", marginTop: 0, marginBottom: 10 }}
              >
                Available Entities for Client
              </h4>
              {availableEntities.length === 0 && (
                <p style={{ textAlign: "center", color: "#888" }}>
                  No more entities available or all are in workflow.
                </p>
              )}
              {availableEntities.map((entity, index) => (
                <Draggable
                  key={entity.id}
                  draggableId={entity.id}
                  index={index}
                >
                  {(providedDraggable, snapshotDraggable) => (
                    <div
                      ref={providedDraggable.innerRef}
                      {...providedDraggable.draggableProps}
                      {...providedDraggable.dragHandleProps}
                      style={{
                        userSelect: "none",
                        padding: "10px",
                        margin: "0 0 8px 0",
                        background: snapshotDraggable.isDragging
                          ? "#777"
                          : "#5c5c5c",
                        border: "1px solid #6f6f6f",
                        borderRadius: 3,
                        ...providedDraggable.draggableProps.style,
                      }}
                    >
                      {entity.name} ({entity.type})
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Column 2: Workflow Steps Container */}
        <Droppable droppableId="workflowStepsContainer" type="WORKFLOW_ENTITY">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{
                background: snapshot.isDraggingOver ? "#6a6a6a" : "#4a4a4a",
                padding: 10,
                width: "45%",
                minHeight: 300,
                borderRadius: 5,
                border: "1px dashed #666",
              }}
            >
              <h4
                style={{ textAlign: "center", marginTop: 0, marginBottom: 10 }}
              >
                Workflow Steps (Drag to reorder)
              </h4>
              {workflowItems.length === 0 && (
                <p style={{ textAlign: "center", color: "#888" }}>
                  Drag entities here to build the workflow.
                </p>
              )}
              {workflowItems.map((item, index) => (
                <Draggable
                  key={item.workflowItemId}
                  draggableId={item.workflowItemId}
                  index={index}
                >
                  {(providedDraggable, snapshotDraggable) => (
                    <div
                      ref={providedDraggable.innerRef}
                      {...providedDraggable.draggableProps}
                      {...providedDraggable.dragHandleProps}
                      style={{
                        userSelect: "none",
                        padding: "10px",
                        margin: "0 0 8px 0",
                        background: snapshotDraggable.isDragging
                          ? "#888"
                          : "#6e6e6e",
                        border: "1px solid #7f7f7f",
                        borderRadius: 3,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        ...providedDraggable.draggableProps.style,
                      }}
                    >
                      <span>
                        {index + 1}. {item.name} ({item.type})
                      </span>
                      <input
                        type="checkbox"
                        checked={item.isActiveInWorkflow}
                        onChange={() => handleToggleActive(item.workflowItemId)}
                        aria-label={`Mark ${item.name} as ${
                          item.isActiveInWorkflow ? "inactive" : "active"
                        } in workflow`}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={handleSaveChanges}
          style={{
            padding: "10px 20px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Save Workflow Steps
        </button>
        <button
          onClick={onBack}
          style={{
            padding: "10px 20px",
            marginLeft: "10px",
            background: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Back to Workflows List
        </button>
      </div>
    </DragDropContext>
  );
};

export default WorkflowBuilderView;
