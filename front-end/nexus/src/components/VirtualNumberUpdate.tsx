// ===== components/VirtualNumberUpdate.tsx =====
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_VIRTUAL_NUMBER, GET_ACTIVE_CLIENTS } from "./graphqlQueries";
import { styles as vnStyles } from "./virtualNumbersStyles";
import VirtualNumberForm from "./VirtualNumberForm";
import type {
  UpdateVirtualNumberProps,
  VirtualNumberFormInput,
  Client,
  VirtualNumberResponse,
  UpdateVirtualNumberInput,
} from "./interface";

const VirtualNumberUpdate: React.FC<UpdateVirtualNumberProps> = ({
  virtualNumber,
  onSuccess,
  onCancel,
}) => {
  const [error, setError] = useState<string | null>(null);

  const {
    data: clientsData,
    loading: clientsLoading,
    error: clientsError,
  } = useQuery<{ nexusClients: Client[] }>(GET_ACTIVE_CLIENTS);

  const [updateVirtualNumber, { loading: submitting }] = useMutation<
    { updateVirtualNumber: VirtualNumberResponse },
    { input: UpdateVirtualNumberInput }
  >(UPDATE_VIRTUAL_NUMBER, {
    onError: (error) => {
      setError(
        error.message ||
          "Failed to update virtual number. Please check console."
      );
      console.error("UpdateVirtualNumber GQL Error:", error);
    },
    onCompleted: (data) => {
      if (data.updateVirtualNumber?.success) {
        onSuccess(data.updateVirtualNumber.virtualNumber);
      } else {
        setError(
          data.updateVirtualNumber?.message ||
            "Server responded with failure but no message for update."
        );
      }
    },
  });

  const handleSubmit = async (values: VirtualNumberFormInput) => {
    setError(null);
    try {
      const inputForUpdate: UpdateVirtualNumberInput = {
        ...values,
        id: virtualNumber.iD, // Ensure the ID is included for the update
      };
      console.log("Submitting Virtual Number Update:", inputForUpdate);
      await updateVirtualNumber({ variables: { input: inputForUpdate } });
    } catch (err) {
      console.error("Local handleSubmit error in VirtualNumberUpdate:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during update submission.");
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
        <h3 style={vnStyles.header}>Update Virtual Number</h3>
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
    clientId: virtualNumber.clientId,
    phoneNumber: virtualNumber.phoneNumber,
    friendlyName: virtualNumber.friendlyName,
    provider: virtualNumber.provider || "Twilio",
    providerId: virtualNumber.providerId || "",
    countryCode: virtualNumber.countryCode || "",
    capabilities_voice: virtualNumber.capabilities.voice,
    capabilities_sms: virtualNumber.capabilities.sms,
    capabilities_mms: virtualNumber.capabilities.mms,
    capabilities_fax: virtualNumber.capabilities.fax,
    status: virtualNumber.status,
    voiceUrl: virtualNumber.voiceUrl || "",
    smsUrl: virtualNumber.smsUrl || "",
    notes: virtualNumber.notes || "",
  };

  return (
    <div style={vnStyles.container}>
      <h3 style={vnStyles.header}>
        Update Virtual Number (ID: {virtualNumber.iD})
      </h3>
      {error && <div style={vnStyles.error}>{error}</div>}
      <VirtualNumberForm
        initialValues={initialValues}
        clients={clientsData?.nexusClients || []}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        submitButtonText="Update VirtualNumber"
        onCancel={onCancel}
      />
    </div>
  );
};

export default VirtualNumberUpdate;
