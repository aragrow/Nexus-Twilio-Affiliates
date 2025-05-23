// UpdateEntity.tsx
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_ENTITY, GET_ACTIVE_CLIENTS } from "./graphqlQueries";
import { styles } from "./entitiesStyles";
import EntityForm from "./EntityForm";
import type { UpdateEntityProps, EntityFormInput } from "./interface";

const EntityUpdate: React.FC<UpdateEntityProps> = ({
  entity,
  onSuccess,
  onCancel,
}) => {
  const [error, setError] = useState<string | null>(null);

  const {
    data: clientsData,
    loading: clientsLoading,
    error: clientsError,
  } = useQuery(GET_ACTIVE_CLIENTS);

  const [updateEntity, { loading: submitting }] = useMutation(UPDATE_ENTITY, {
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (values: EntityFormInput) => {
    try {
      const { data } = await updateEntity({
        variables: {
          input: {
            ...values,
            id: entity.id,
          },
        },
      });

      if (data?.updateEntity?.success) {
        onSuccess(data.updateEntity.entity);
      } else {
        setError(data?.updateEntity?.message || "Failed to update entity");
      }
    } catch (err) {
      // Error is handled by onError in useMutation
    }
  };

  if (clientsLoading) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Loading clients...</p>
      </div>
    );
  }

  if (clientsError) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          Error loading clients: {clientsError.message}
        </div>
        <button
          onClick={onCancel}
          style={{
            ...styles.button,
            ...styles.cancelButton,
            marginTop: "1rem",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const initialValues: EntityFormInput = {
    name: entity.name,
    type: entity.type,
    description: entity.description || "",
    clientId: entity.clientId,
    status: entity.status,
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>Update Entity</h3>

      {error && <div style={styles.error}>{error}</div>}

      <EntityForm
        initialValues={initialValues}
        clients={clientsData?.activeClients || []}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        submitButtonText="Update Entity"
        onCancel={onCancel}
      />
    </div>
  );
};

export default EntityUpdate;
