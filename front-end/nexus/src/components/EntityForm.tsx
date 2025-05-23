// EntityForm.tsx
import React, { useState } from "react";
import { styles } from "./entitiesStyles";
import type { EntityFormProps } from "./interface";

const EntityForm: React.FC<EntityFormProps> = ({
  initialValues,
  clients,
  onSubmit,
  isSubmitting,
  submitButtonText,
  onCancel,
}) => {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "radio") {
      setForm({ ...form, [name]: value });
    } else if (type === "checkbox") {
      setForm({
        ...form,
        [name]: (e.target as HTMLInputElement).checked ? "active" : "inactive",
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.type) {
      newErrors.type = "Type is required";
    }

    if (!form.clientId) {
      newErrors.clientId = "Client is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      await onSubmit(form);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label htmlFor="name" style={styles.label}>
          Entity Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          style={styles.input}
          aria-required="true"
          aria-invalid={!!errors.name}
        />
        {errors.name && <div style={styles.error}>{errors.name}</div>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Entity Type</label>
        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="type"
              value="individual"
              checked={form.type === "individual"}
              onChange={handleChange}
              style={styles.radio}
            />
            Individual
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="type"
              value="group"
              checked={form.type === "group"}
              onChange={handleChange}
              style={styles.radio}
            />
            Group
          </label>
        </div>
        {errors.type && <div style={styles.error}>{errors.type}</div>}
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="description" style={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          style={styles.textarea}
          rows={4}
        />
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="clientId" style={styles.label}>
          Client
        </label>
        <select
          id="clientId"
          name="clientId"
          value={form.clientId}
          onChange={handleChange}
          style={styles.select}
          aria-required="true"
          aria-invalid={!!errors.clientId}
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        {errors.clientId && <div style={styles.error}>{errors.clientId}</div>}
      </div>

      <div style={styles.formGroup}>
        <div style={styles.toggleContainer}>
          <span style={styles.toggleLabel}>Status</span>
          <label style={styles.toggleWrapper}>
            <input
              type="checkbox"
              name="status"
              checked={form.status === "active"}
              onChange={handleChange}
              style={styles.toggleInput}
            />
            <span
              style={{
                ...styles.toggle,
                ...(form.status === "active" ? styles.toggleActive : {}),
              }}
            />
          </label>
          <span
            style={{ color: form.status === "active" ? "#10b981" : "#ef4444" }}
          >
            {form.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div style={styles.buttonContainer}>
        <button
          type="button"
          onClick={onCancel}
          style={{ ...styles.button, ...styles.cancelButton }}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{ ...styles.button, ...styles.submitButton }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default EntityForm;
