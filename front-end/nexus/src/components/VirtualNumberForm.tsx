// ===== components/VirtualNumberForm.tsx =====
import React, { useState } from "react";
import type {
  VirtualNumberFormProps,
  VirtualNumberFormInput,
  Client,
} from "./interface";
import { styles as vnStyles } from "./virtualNumbersStyles"; // Using aliased import

const VirtualNumberForm: React.FC<VirtualNumberFormProps> = ({
  initialValues,
  clients,
  onSubmit,
  isSubmitting,
  submitButtonText,
  onCancel,
}) => {
  const [form, setForm] = useState<VirtualNumberFormInput>(initialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof VirtualNumberFormInput, string>>
  >({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
    if (errors[name as keyof VirtualNumberFormInput]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof VirtualNumberFormInput, string>> = {};
    if (!form.clientId) newErrors.clientId = "Client is required.";
    if (!form.friendlyName.trim())
      newErrors.friendlyName = "Friendly Name is required.";
    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone Number is required.";
    } else if (!/^\+[1-9]\d{1,14}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber =
        "Phone Number must be in E.164 format (e.g., +15551234567).";
    }
    if (!form.status) newErrors.status = "Status is required.";
    if (
      form.providerId &&
      !form.providerId.trim() &&
      form.provider &&
      form.provider !== "Manual"
    ) {
      newErrors.providerId = "Provider ID is required if provider is selected.";
    }
    if (form.provider === "Manual" && form.providerId) {
      setForm((prev) => ({ ...prev, providerId: "" })); // Clear providerId if Manual
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submissionData = {
        ...form,
        provider: form.provider || "Twilio", // Default provider if not set
      };
      await onSubmit(submissionData);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={vnStyles.form} noValidate>
      <div style={vnStyles.formRow}>
        <div style={vnStyles.formFieldHalf}>
          <label htmlFor="clientId" style={vnStyles.label}>
            Client *
          </label>
          <select
            id="clientId"
            name="clientId"
            value={form.clientId}
            onChange={handleChange}
            style={vnStyles.select}
            required
          >
            <option value="">Select a Client</option>
            {clients.map((client: Client) => (
              <option key={client.iD} value={client.iD}>
                {client.clientName} (ID: {client.iD})
              </option>
            ))}
          </select>
          {errors.clientId && (
            <div style={vnStyles.error}>{errors.clientId}</div>
          )}
        </div>
        <div style={vnStyles.formFieldHalf}>
          <label htmlFor="friendlyName" style={vnStyles.label}>
            Friendly Name *
          </label>
          <input
            type="text"
            id="friendlyName"
            name="friendlyName"
            value={form.friendlyName}
            onChange={handleChange}
            style={vnStyles.input}
            required
          />
          {errors.friendlyName && (
            <div style={vnStyles.error}>{errors.friendlyName}</div>
          )}
        </div>
      </div>

      <div style={vnStyles.formRow}>
        <div style={vnStyles.formFieldHalf}>
          <label htmlFor="phoneNumber" style={vnStyles.label}>
            Phone Number (E.164) *
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            style={vnStyles.input}
            placeholder="+15551234567"
            required
          />
          {errors.phoneNumber && (
            <div style={vnStyles.error}>{errors.phoneNumber}</div>
          )}
        </div>
        <div style={vnStyles.formFieldHalf}>
          <label htmlFor="status" style={vnStyles.label}>
            Status *
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            style={vnStyles.select}
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending_provisioning">Pending Provisioning</option>
            <option value="porting">Porting</option>
          </select>
          {errors.status && <div style={vnStyles.error}>{errors.status}</div>}
        </div>
      </div>

      <div style={vnStyles.formRow}>
        <div style={vnStyles.formFieldHalf}>
          <label htmlFor="provider" style={vnStyles.label}>
            Provider
          </label>
          <select
            id="provider"
            name="provider"
            value={form.provider || "Twilio"}
            onChange={handleChange}
            style={vnStyles.select}
          >
            <option value="Twilio">Twilio</option>
            <option value="Other">Other</option>
            <option value="Manual">Manual (No Provider ID)</option>
          </select>
        </div>
        <div style={vnStyles.formFieldHalf}>
          <label htmlFor="providerId" style={vnStyles.label}>
            Provider ID
          </label>
          <input
            type="text"
            id="providerId"
            name="providerId"
            value={form.providerId || ""}
            onChange={handleChange}
            style={vnStyles.input}
            disabled={form.provider === "Manual"}
          />
          {errors.providerId && (
            <div style={vnStyles.error}>{errors.providerId}</div>
          )}
        </div>
      </div>

      <div>
        <label style={vnStyles.label}>Capabilities</label>
        <div style={vnStyles.checkboxGroup}>
          <label style={vnStyles.checkboxLabel}>
            <input
              type="checkbox"
              name="capabilities_voice"
              checked={form.capabilities_voice}
              onChange={handleChange}
              style={vnStyles.checkbox}
            />{" "}
            Voice
          </label>
          <label style={vnStyles.checkboxLabel}>
            <input
              type="checkbox"
              name="capabilities_sms"
              checked={form.capabilities_sms}
              onChange={handleChange}
              style={vnStyles.checkbox}
            />{" "}
            SMS
          </label>
          <label style={vnStyles.checkboxLabel}>
            <input
              type="checkbox"
              name="capabilities_mms"
              checked={form.capabilities_mms}
              onChange={handleChange}
              style={vnStyles.checkbox}
            />{" "}
            MMS
          </label>
          <label style={vnStyles.checkboxLabel}>
            <input
              type="checkbox"
              name="capabilities_fax"
              checked={form.capabilities_fax}
              onChange={handleChange}
              style={vnStyles.checkbox}
            />{" "}
            Fax
          </label>
        </div>
      </div>

      <div style={vnStyles.formRow}>
        <div style={vnStyles.formFieldHalf}>
          <label htmlFor="voiceUrl" style={vnStyles.label}>
            Voice URL
          </label>
          <input
            type="url"
            id="voiceUrl"
            name="voiceUrl"
            value={form.voiceUrl || ""}
            onChange={handleChange}
            style={vnStyles.input}
            placeholder="https://example.com/voice"
          />
        </div>
        <div style={vnStyles.formFieldHalf}>
          <label htmlFor="smsUrl" style={vnStyles.label}>
            SMS URL
          </label>
          <input
            type="url"
            id="smsUrl"
            name="smsUrl"
            value={form.smsUrl || ""}
            onChange={handleChange}
            style={vnStyles.input}
            placeholder="https://example.com/sms"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" style={vnStyles.label}>
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={form.notes || ""}
          onChange={handleChange}
          style={vnStyles.textarea}
          rows={3}
        ></textarea>
      </div>

      <div style={vnStyles.buttonContainer}>
        <button
          type="button"
          onClick={onCancel}
          style={{ ...vnStyles.button, ...vnStyles.cancelButton }}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{ ...vnStyles.button, ...vnStyles.submitButton }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default VirtualNumberForm;
