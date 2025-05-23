// src/components/WorkFlowStepEditor.tsx
import React, { useState, useCallback, useMemo, useEffect } from "react"; // Added useEffect import
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type {
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_AVAILABLE_CLIENT_ENTITIES,
  GET_STEP_WORKFLOW_ENTITIES,
  UPDATE_WORKFLOW_STEPS,
} from "./graphqlQueries";
import type {
  Entity,
  WorkFlowStep,
  WorkFlowStepInput,
  WorkFlowStepEditorProps,
  WorkflowEntity,
} from "./interface";
import editorStyles from "./workFlowStepEditorStyles";

const WorkFlowStepEditor: React.FC<WorkFlowStepEditorProps> = ({
  workflow,
  onSave,
  onBack,
}) => {
  const [assignedSteps, setAssignedSteps] = useState<WorkFlowStep[]>([]);
  // --- Fetch Available Entities using Apollo Client ---
  const {
    loading: isLoadingAvailableEntities,
    error: errorAvailableEntities,
    data: dataAvailableEntities,
  } = useQuery<{ nexusEntities: Entity[] }>(GET_AVAILABLE_CLIENT_ENTITIES, {
    variables: { clientId: workflow.clientId },
    fetchPolicy: "cache-and-network",
    skip: !workflow.clientId,
  });

  // Derived available entities from query data
  const fetchedAvailableEntities = useMemo(() => {
    return dataAvailableEntities?.nexusEntities || [];
  }, [dataAvailableEntities]);

  // --- Fetch Step Entities using Apollo Client ---
  const {
    loading: isLoadingStepEntities,
    error: errorStepEntities,
    data: dataStepEntities,
  } = useQuery<{ nexusWorkflowEntitiesByWorkflowId: WorkflowEntity[] }>(
    GET_STEP_WORKFLOW_ENTITIES,
    {
      variables: { workflowId: workflow.iD },
      fetchPolicy: "cache-and-network",
      skip: !workflow.iD,
    }
  );

  // Derived step entities from query data
  const fetchedStepEntities = useMemo(() => {
    return dataStepEntities?.nexusWorkflowEntitiesByWorkflowId || [];
  }, [dataStepEntities]);

  // Combined loading and error states
  const isLoading = isLoadingStepEntities || isLoadingAvailableEntities;
  const overallError =
    errorStepEntities?.message || errorAvailableEntities?.message;

  // Populate assignedSteps with entities from fetchedStepEntities
  useEffect(() => {
    if (fetchedStepEntities && fetchedStepEntities.length > 0) {
      // Map the workflow step entities to the format expected by assignedSteps
      const mappedSteps = fetchedStepEntities.map((step) => ({
        id: step.entityId,
        iD: step.entityId,
        entityId: step.entityId,
        entityName: step.entity?.entityName,
        entityType: step.entity?.entityType,
        entityPhone: step.entity?.entityPhone,
        order: step.workflowOrder,
        // Add any other properties needed for WorkFlowStep
      }));

      setAssignedSteps(mappedSteps);
    }
  }, [fetchedStepEntities]);

  // This filters entities fetched by Apollo that are already in `assignedSteps`
  const trulyAvailableEntities = useMemo(() => {
    const assignedEntityIds = new Set(
      assignedSteps.map((step) => step.entityId || step.id || step.iD)
    );
    return fetchedAvailableEntities.filter(
      (entity) => !assignedEntityIds.has(entity.iD || entity.id)
    );
  }, [fetchedAvailableEntities, assignedSteps]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result;
      if (!destination) return;

      // Find the dragged entity
      const entityDraggedFromAvailable = fetchedAvailableEntities.find(
        (e) => (e.iD || e.id) === draggableId
      );

      // Fixed: Look for entity in assignedSteps, not fetchedStepEntities
      const entityDraggedFromAssigned = assignedSteps.find(
        (e) => (e.iD || e.id) === draggableId
      );

      const entityDragged =
        entityDraggedFromAvailable || entityDraggedFromAssigned;

      if (!entityDragged) {
        console.warn("Dragged entity not found:", draggableId);
        return;
      }

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
          // Make sure we use a clean object for the new step
          const newStepEntity: Entity = {
            ...entityDraggedFromAvailable,
            id: entityDraggedFromAvailable.iD || entityDraggedFromAvailable.id,
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
        const newAssignedSteps = assignedSteps.filter(
          (step) => (step.iD || step.id) !== draggableId
        );
        setAssignedSteps(
          newAssignedSteps.map((step, idx) => ({ ...step, order: idx }))
        );
      }
    },
    [assignedSteps, fetchedAvailableEntities]
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async () => {
    console.log("workFlowStepEditor.tsx - handleSaveChanges");
    const updatedSteps: WorkFlowStepInput[] = assignedSteps.map(
      (step, index) => ({
        entityId: step.id || step.iD,
        order: index,
      })
    );
    try {
      setIsSaving(true);
      console.log("workflow.iD: ", workflow.iD);
      console.log("updatedSteps: ", updatedSteps);
      await handleSaveWorkflowSteps(workflow.iD, updatedSteps);
    } catch (err) {
      console.error(
        "Save failed in WorkFlowStepEditor's handleSaveChanges",
        err
      );
    } finally {
      setIsSaving(false);
      console.log("Step Save finalized.");
    }
  };
  // Add this hook in the Dashboard component
  const [updateWorkflowStepsMutation, { loading: isSavingSteps }] = useMutation(
    UPDATE_WORKFLOW_STEPS
  );

  const [editingWorkflow, setEditingWorkflow] = useState<{
    id: string;
    name: string;
    clientiD: string;
  } | null>(null);

  const handleExitMaintainWorkflow = useCallback(() => {
    console.log("handleExitMaintainWorkflow");
    setEditingWorkflow(null);
    // currentLevelKey should remain 'LoadWorkFlowsView' to show the list again
  }, []);

  // Replace the handleSaveWorkflowSteps function
  const handleSaveWorkflowSteps = useCallback(
    async (workflowId: string, updatedSteps: WorkFlowStepInput[]) => {
      console.log(
        "Dashboard: Attempting to save steps for workflow:",
        workflowId,
        updatedSteps
      );

      try {
        const { data } = await updateWorkflowStepsMutation({
          variables: {
            workflowId,
            steps: updatedSteps,
          },
          refetchQueries: [
            { query: GET_STEP_WORKFLOW_ENTITIES, variables: { workflowId } },
          ],
        });

        console.log("Workflow steps saved successfully:", data);

        if (data?.updateWorkflowSteps?.success) {
          // Show success notification
          alert(
            data.updateWorkflowSteps.message ||
              "Workflow steps saved successfully!"
          );
          handleExitMaintainWorkflow(); // Go back to the list view
        } else {
          // Show error notification
          alert(
            data?.updateWorkflowSteps?.message || "Error saving workflow steps"
          );
        }
      } catch (err) {
        console.error("Failed to save workflow steps:", err);
        alert(
          `Error saving steps: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      }
    },
    [updateWorkflowStepsMutation, handleExitMaintainWorkflow]
  );

  // Initial loading screen
  if (
    isLoading &&
    assignedSteps.length === 0 &&
    fetchedAvailableEntities.length === 0 &&
    fetchedStepEntities.length === 0
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
        <h2 style={editorStyles.title}>
          Manage Steps for: {workflow.workFlowName}
        </h2>
      </div>

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
                    key={entity.iD || entity.id}
                    draggableId={entity.iD || entity.id}
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
                {isLoadingStepEntities && assignedSteps.length === 0 && (
                  <p style={editorStyles.placeholder}>Loading steps...</p>
                )}
                {!isLoadingStepEntities && errorStepEntities && (
                  <p style={editorStyles.errorMessage}>
                    Could not load assigned steps.
                  </p>
                )}
                {!isLoadingStepEntities &&
                  !errorStepEntities &&
                  assignedSteps.length === 0 && (
                    <p style={editorStyles.placeholder}>
                      Drag entities here to add steps.
                    </p>
                  )}

                {assignedSteps.map((step, index) => (
                  <Draggable
                    key={step.iD || step.id}
                    draggableId={step.iD || step.id}
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
