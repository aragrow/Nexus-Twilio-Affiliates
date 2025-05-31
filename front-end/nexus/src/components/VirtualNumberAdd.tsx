import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_VIRTUAL_NUMBER, GET_ACTIVE_CLIENTS } from "./graphqlQueries";
import { styles as vnStyles } from "./virtualNumbersStyles";
import VirtualNumberForm from "./VirtualNumberForm";
import type {
  AddVirtualNumberProps,
  VirtualNumberFormInput,
  Client,
  VirtualNumberResponse,
} from "./interface";

const VirtualNumberAdd: React.FC<AddVirtualNumberProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [error, setError] = useState<string | null>(null);

  const {
    data: clientsData,
    loading: clientsLoading,
    error: clientsError,
  } = useQuery<{ nexusClients: Client[] }>(GET_ACTIVE_CLIENTS);

  const [addVirtualNumber, { loading: submitting }] = useMutation<
    { addVirtualNumber: VirtualNumberResponse },
    { input: VirtualNumberFormInput }
  >(ADD_VIRTUAL_NUMBER, {
    onError: (error) => {
      setError(
        error.message ||
          "Failed to add virtual number. Please check console for details."
      );
      console.error("AddVirtualNumber GQL Error:", error);
    },
    onCompleted: (data) => {
      if (data.addVirtualNumber?.success) {
        onSuccess(data.addVirtualNumber.virtualNumber);
      } else {
        setError(
          data.addVirtualNumber?.message ||
            "Server responded with failure but no message."
        );
      }
    },
  });

  const handleSubmit = async (values: VirtualNumberFormInput) => {
    setError(null); // Clear previous errors
    try {
      console.log("Submitting Virtual Number Add:", values);
      await addVirtualNumber({ variables: { input: values } });
      // onSuccess and setError are handled by onCompleted and onError in useMutation
    } catch (err) {
      // This catch might not be strictly necessary if onError handles all GQL/network errors
      console.error("Local handleSubmit error in VirtualNumberAdd:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during submission.");
      }
    }
  };

  if (clientsLoading) {
    return (
      <div style={vnStyles.loadingContainer}>
        <p style={vnStyles.loadingText}>Loading clients...</p>
      </div>
    );
  }

  if (clientsError) {
    return (
      <div style={vnStyles.container}>
        <h3 style={vnStyles.header}>Add New Virtual Number</h3>
        <div style={vnStyles.error}>
          Error loading clients: {clientsError.message}
        </div>
        <button
          onClick={onCancel}
          style={{
            ...vnStyles.button,
            ...vnStyles.cancelButton,
            marginTop: "1rem",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const initialValues: VirtualNumberFormInput = {
    clientId: "",
    phoneNumber: "",
    friendlyName: "",
    provider: "Twilio",
    providerId: "",
    countryCode: "",
    capabilities_voice: true,
    capabilities_sms: true,
    capabilities_mms: false,
    capabilities_fax: false,
    status: "active",
    voiceUrl: "",
    smsUrl: "",
    notes: "",
  };

  return (
    <div style={vnStyles.container}>
      {" "}
      {/* Use a general container style if vnStyles.formContainer is not defined */}
      <h3 style={vnStyles.header}>Add New Virtual Number</h3>
      {error && <div style={vnStyles.error}>{error}</div>}
      <VirtualNumberForm
        initialValues={initialValues}
        clients={clientsData?.nexusClients || []}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        submitButtonText="Create Virtual Number"
        onCancel={onCancel}
      />
    </div>
  );
};

export default VirtualNumberAdd;
