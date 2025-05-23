// AddEntity.tsx
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_ENTITY, GET_ACTIVE_CLIENTS } from "./graphqlQueries";
import { styles } from "./entitiesStyles";
import EntityForm from "./EntityForm";
import type { AddEntityProps, EntityFormInput } from "./interface";

const EntityAdd: React.FC<AddEntityProps> = ({ onSuccess, onCancel }) => {
  const [error, setError] = useState<string | null>(null);

  const {
    data: clientsData,
    loading: clientsLoading,
    error: clientsError,
  } = useQuery(GET_ACTIVE_CLIENTS);

  const [addEntity, { loading: submitting }] = useMutation(ADD_ENTITY, {
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (values: EntityFormInput) => {
    try {
      const { data } = await addEntity({
        variables: { input: values },
      });

      if (data?.addEntity?.success) {
        onSuccess(data.addEntity.entity);
      } else {
        setError(data?.addEntity?.message || "Failed to add entity");
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
    name: "",
    type: "individual",
    description: "",
    clientId: 0,
    status: "active",
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>Add New Entity</h3>

      {error && <div style={styles.error}>{error}</div>}

      <EntityForm
        initialValues={initialValues}
        clients={clientsData?.activeClients || []}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        submitButtonText="Create Entity"
        onCancel={onCancel}
      />
    </div>
  );
};

export default EntityAdd;
