// src/components/WorkFlowStepEditor.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type {
  // <--- Add 'type' keyword here
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import { useQuery } from "@apollo/client"; // <--- IMPORT useQuery
import { GET_AVAILABLE_CLIENT_ENTITIES } from "./graphqlQueries"; // <--- IMPORT THE NEW QUERY
import type {
  Entity,
  WorkFlowStep,
  WorkFlowStepInput,
  WorkFlowStepEditorProps,
} from "./interface";
import editorStyles from "./workFlowStepEditorStyles";

const WorkFlowStepEditor: React.FC<WorkFlowStepEditorProps> = ({
  workflowId,
  workflowName,
  clientId,
  onSave,
  onBack,
}) => {
  const [assignedSteps, setAssignedSteps] = useState<WorkFlowStep[]>([]);
  // availableEntities state will now be primarily driven by Apollo query data
  // const [availableEntities, setAvailableEntities] = useState<Entity[]>([]); // No longer directly set like this for available

  const [isLoadingMockSteps, setIsLoadingMockSteps] = useState(true); // Separate loading for mock part
  const [errorMockSteps, setErrorMockSteps] = useState<string | null>(null); // Separate error for mock part

  // --- Fetch Available Entities using Apollo Client ---
  const {
    loading: isLoadingAvailableEntities,
    error: errorAvailableEntities,
    data: dataAvailableEntities,
  } = useQuery<{ nexusEntities: Entity[] }>(GET_AVAILABLE_CLIENT_ENTITIES, {
    variables: { clientId: clientId }, // Pass the clientId to the query
    fetchPolicy: "cache-and-network", // Or your preferred fetch policy
    // skip: !clientId, // Optionally skip if clientId is not yet available, though it's a prop here
  });

  // Derived available entities from query data
  const fetchedAvailableEntities = useMemo(() => {
    return dataAvailableEntities?.nexusEntities || [];
  }, [dataAvailableEntities]);

  // --- MOCK DATA FETCHING for Assigned Steps (until real GQL is implemented) ---
  useEffect(() => {
    setIsLoadingMockSteps(true);
    setErrorMockSteps(null);
    const mockFetchSteps = async () => {
      console.log(`Mock fetching steps for workflowId: ${workflowId}`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      // Example of pre-populating assigned steps:
      // setAssignedSteps([
      //   { id: "entity-1", name: "Phone Line Alpha", type: "Phone", iD: "entity-1", order: 0, clientId: null, entityType: "Phone", entityName: "Phone Line Alpha", entityPhone: null, ratePerMinute: null, entityStatus: null, createdAt: null, updatedAt: null },
      // ]);
      setAssignedSteps([]); // Start empty for now
    };

    mockFetchSteps()
      .catch((err) => {
        console.error("Error fetching mock steps for editor", err);
        setErrorMockSteps("Failed to load initial workflow steps.");
      })
      .finally(() => setIsLoadingMockSteps(false));
  }, [workflowId]);
  // --- END MOCK DATA FETCHING for Assigned Steps ---

  // Combined loading and error states
  const isLoading = isLoadingMockSteps || isLoadingAvailableEntities;
  const overallError = errorMockSteps || errorAvailableEntities?.message;

  // This filters entities fetched by Apollo that are already in `assignedSteps`
  const trulyAvailableEntities = useMemo(() => {
    const assignedEntityIds = new Set(
      assignedSteps.map((step) => step.id || step.iD)
    ); // Use id or iD
    return fetchedAvailableEntities.filter(
      (entity) => !assignedEntityIds.has(entity.id || entity.iD)
    );
  }, [fetchedAvailableEntities, assignedSteps]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result;
      if (!destination) return;

      // Find the dragged entity from the combined list of what was fetched and what might be in assigned steps
      // The source of truth for available is `fetchedAvailableEntities`
      // The source of truth for assigned is `assignedSteps`
      const entityDraggedFromAvailable = fetchedAvailableEntities.find(
        (e) => (e.id || e.iD) === draggableId
      );
      const entityDraggedFromAssigned = assignedSteps.find(
        (e) => (e.id || e.iD) === draggableId
      );
      const entityDragged =
        entityDraggedFromAvailable || entityDraggedFromAssigned;

      if (!entityDragged) {
        console.warn("Dragged entity not found:", draggableId);
        return;
      }

      // Ensure entityDragged has a consistent 'id' field for dnd, mapping from 'iD' if necessary
      // For this example, we assume Entity type from interface.tsx uses 'id' or we map it.
      // If your Entity type uses 'iD', ensure draggableId matches that.
      // For simplicity, let's assume `draggableId` is based on `entity.id` (or `entity.iD`)

      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return; // Dropped in the same place
      }

      if (
        source.droppableId === "availableEntitiesDroppable" &&
        destination.droppableId === "assignedStepsDroppable"
      ) {
        // Moving from Available to Assigned
        if (entityDraggedFromAvailable) {
          // Make sure we use a clean object for the new step, potentially mapping iD to id
          const newStepEntity: Entity = {
            ...entityDraggedFromAvailable,
            id: entityDraggedFromAvailable.id || entityDraggedFromAvailable.iD, // Ensure 'id' for dnd
          };
          const newStep: WorkFlowStep = {
            ...newStepEntity,
            order: destination.index,
          };

          const newAssignedSteps = Array.from(assignedSteps);
          newAssignedSteps.splice(destination.index, 0, newStep);
          setAssignedSteps(
            newAssignedSteps.map((step, idx) => ({ ...step, order: idx }))
          );
        }
      } else if (
        source.droppableId === "assignedStepsDroppable" &&
        destination.droppableId === "assignedStepsDroppable"
      ) {
        // Reordering within Assigned Steps
        const newAssignedSteps = Array.from(assignedSteps);
        const [reorderedItem] = newAssignedSteps.splice(source.index, 1);
        newAssignedSteps.splice(destination.index, 0, reorderedItem);
        setAssignedSteps(
          newAssignedSteps.map((step, idx) => ({ ...step, order: idx }))
        );
      } else if (
        source.droppableId === "assignedStepsDroppable" &&
        destination.droppableId === "availableEntitiesDroppable"
      ) {
        // Moving from Assigned back to Available (removing the step)
        // The entity automatically reappears in `trulyAvailableEntities` due to `useMemo`
        const newAssignedSteps = assignedSteps.filter(
          (step) => (step.id || step.iD) !== draggableId
        );
        setAssignedSteps(
          newAssignedSteps.map((step, idx) => ({ ...step, order: idx }))
        );
      }
    },
    [assignedSteps, fetchedAvailableEntities]
  ); // Removed trulyAvailableEntities, rely on fetched + assigned

  const [isSaving, setIsSaving] = useState(false); // Local saving state for the save button

  const handleSaveChanges = async () => {
    const stepsToSave: WorkFlowStepInput[] = assignedSteps.map(
      (step, index) => ({
        entityId: step.id || step.iD, // Use id or iD
        order: index,
      })
    );
    try {
      setIsSaving(true);
      await onSave(workflowId, stepsToSave);
      // onBack(); // Parent (dashboard) might call onBack
    } catch (err) {
      // Error will be displayed via overallError if set by onSave promise rejection
      console.error(
        "Save failed in WorkFlowStepEditor's handleSaveChanges",
        err
      );
      // Potentially set a local error specific to saving if `onSave` doesn't update a shared one
    } finally {
      setIsSaving(false);
    }
  };

  // Initial loading screen:
  if (
    isLoading &&
    assignedSteps.length === 0 &&
    fetchedAvailableEntities.length === 0
  ) {
    return <div style={editorStyles.loader}>Loading Workflow Editor...</div>;
  }

  // Error display takes precedence
  if (overallError) {
    return <div style={editorStyles.errorMessage}>Error: {overallError}</div>;
  }

  return (
    <div style={editorStyles.container}>
      <div style={editorStyles.header}>
        <h2 style={editorStyles.title}>Manage Steps for: {workflowName}</h2>
      </div>

      {/* Display specific loading/error for available entities if needed, or rely on overallError */}
      {/* {isLoadingAvailableEntities && <p style={editorStyles.loader}>Loading available entities...</p>}
      {errorAvailableEntities && <p style={editorStyles.errorMessage}>Error fetching entities: {errorAvailableEntities.message}</p>} */}

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={editorStyles.dndContainer}>
          {/* Available Entities Column */}
          <Droppable droppableId="availableEntitiesDroppable" type="ENTITY">
            {(provided: DroppableProvided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  ...editorStyles.column,
                  background: snapshot.isDraggingOver
                    ? editorStyles.columnDragOver.background
                    : editorStyles.column.background,
                }}
              >
                <h3 style={editorStyles.columnTitle}>Available Entities</h3>
                {isLoadingAvailableEntities &&
                  trulyAvailableEntities.length === 0 && (
                    <p style={editorStyles.placeholder}>Loading entities...</p>
                  )}
                {!isLoadingAvailableEntities && errorAvailableEntities && (
                  <p style={editorStyles.errorMessage}>
                    Could not load entities.
                  </p>
                )}
                {!isLoadingAvailableEntities &&
                  !errorAvailableEntities &&
                  trulyAvailableEntities.length === 0 && (
                    <p style={editorStyles.placeholder}>
                      No more entities to add or all are assigned.
                    </p>
                  )}

                {trulyAvailableEntities.map((entity, index) => (
                  <Draggable
                    key={entity.id || entity.iD}
                    draggableId={entity.id || entity.iD}
                    index={index}
                  >
                    {(
                      providedDraggable: DraggableProvided,
                      snapshotDraggable: DraggableStateSnapshot
                    ) => (
                      <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                        style={{
                          ...editorStyles.entityItem,
                          ...(snapshotDraggable.isDragging
                            ? editorStyles.entityItemDragging
                            : {}),
                          ...providedDraggable.draggableProps.style,
                        }}
                        aria-label={`Draggable entity ${entity.entityName}`}
                      >
                        <div style={editorStyles.entityMainInfo}>
                          <span style={editorStyles.entityName}>
                            {entity.entityName}
                          </span>
                          <span style={editorStyles.entityType}>
                            ({entity.entityType})
                          </span>
                        </div>
                        <div style={editorStyles.phone}>
                          {entity.entityPhone}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Assigned Steps Column */}
          <Droppable droppableId="assignedStepsDroppable" type="ENTITY">
            {(provided: DroppableProvided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  ...editorStyles.column,
                  background: snapshot.isDraggingOver
                    ? editorStyles.columnDragOver.background
                    : editorStyles.column.background,
                }}
              >
                <h3 style={editorStyles.columnTitle}>
                  Workflow Steps (Drag to reorder)
                </h3>
                {isLoadingMockSteps && assignedSteps.length === 0 && (
                  <p style={editorStyles.placeholder}>Loading steps...</p>
                )}
                {!isLoadingMockSteps && errorMockSteps && (
                  <p style={editorStyles.errorMessage}>
                    Could not load assigned steps.
                  </p>
                )}
                {!isLoadingMockSteps &&
                  !errorMockSteps &&
                  assignedSteps.length === 0 && (
                    <p style={editorStyles.placeholder}>
                      Drag entities here to add steps.
                    </p>
                  )}

                {assignedSteps.map((step, index) => (
                  <Draggable
                    key={step.id || step.iD}
                    draggableId={step.id || step.iD}
                    index={index}
                  >
                    {(
                      providedDraggable: DraggableProvided,
                      snapshotDraggable: DraggableStateSnapshot
                    ) => (
                      <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                        style={{
                          ...editorStyles.entityItem,
                          ...(snapshotDraggable.isDragging
                            ? editorStyles.entityItemDragging
                            : {}),
                          background: snapshotDraggable.isDragging
                            ? editorStyles.entityItemDragging.background
                            : editorStyles.entityItemAssigned.background,
                          ...providedDraggable.draggableProps.style,
                        }}
                        aria-label={`Workflow step ${
                          step.entityName
                        }, currently at position ${index + 1}`}
                      >
                        <div style={editorStyles.entityMainInfo}>
                          <span style={editorStyles.entityName}>
                            {step.entityName}
                          </span>
                          <span style={editorStyles.entityType}>
                            ({step.entityType})
                          </span>
                        </div>
                        <div style={editorStyles.phone}>{step.entityPhone}</div>
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
      <div style={editorStyles.actionContainer}>
        <button
          onClick={handleSaveChanges}
          style={{ ...editorStyles.button, ...editorStyles.saveButton }}
          disabled={isSaving || isLoading}
        >
          {isSaving ? "Saving..." : "Save Steps"}
        </button>
        <button
          onClick={onBack}
          style={{ ...editorStyles.button, ...editorStyles.backButton }}
          disabled={isSaving || isLoading}
        >
          Back to Workflows
        </button>
      </div>
    </div>
  );
};

export default WorkFlowStepEditor;
