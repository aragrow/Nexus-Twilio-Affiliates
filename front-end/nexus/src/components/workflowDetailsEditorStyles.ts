// workflowDetailsEditorStyles.ts

export const styles = {
  form: {
    maxWidth: 480,
    margin: "2rem auto",
    padding: "2rem",
    borderRadius: "1.5rem",
    background: "rgba(1, 1, 2, 0.85)", // glassy dark blue
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(0, 174, 255, 0.3)', // Brighter accent border
  },
  title: {
    fontSize: '2em',
    margin: 0,
    color: '#00d0ff', // Bright cyan
    textShadow: '0 0 8px rgba(0, 208, 255, 0.7), 0 0 12px rgba(0, 208, 255, 0.5)',
  },
  label: {
    fontWeight: 600,
    color: "#e0e7ef",
    marginBottom: "0.5rem",
    letterSpacing: "0.03em",
    fontSize: "1rem",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "0.75rem",
    border: "1px solid #334155",
    background: "rgba(51, 65, 85, 0.7)",
    color: "#f1f5f9",
    fontSize: "1rem",
    outline: "none",
    transition: "border 0.2s, box-shadow 0.2s",
    marginBottom: "0.5rem",
    "&:focus": {
      borderColor: "#38bdf8",
      boxShadow: "0 0 0 2px rgba(56, 189, 248, 0.3)",
    },
  },
  // Checkbox specific styles
  checkboxContainer: {
    marginBottom: "1rem",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none" as const,
  },
  checkbox: {
    position: "absolute" as const,
    opacity: 0,
    cursor: "pointer",
    height: 0,
    width: 0,
  },
  checkboxText: {
    marginLeft: "2.5rem",
    color: "#e0e7ef",
    fontWeight: 500,
    fontSize: "1rem",
  },
  statusIndicator: {
    marginLeft: "auto",
    padding: "0.35rem 0.75rem",
    borderRadius: "1rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    display: "inline-block",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    transition: "all 0.2s ease",
    "&.active": {
      background: "rgba(16, 185, 129, 0.2)",
      color: "#10b981", // emerald-500
      border: "1px solid rgba(16, 185, 129, 0.3)",
    },
    "&.inactive": {
      background: "rgba(239, 68, 68, 0.2)",
      color: "#ef4444", // red-500
      border: "1px solid rgba(239, 68, 68, 0.3)",
    },
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-start",
    marginTop: "1rem",
    gap: "1rem",
  },
  button: {
    padding: "0.75rem 1.5rem",
    borderRadius: "0.75rem",
    fontWeight: 700,
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    "&:focus": {
      outline: "none",
      boxShadow: "0 0 0 3px rgba(56, 189, 248, 0.4)",
    },
  },
  saveButton: {
    background: "linear-gradient(90deg, #38bdf8 0%, #6366f1 100%)",
    color: "#fff",
    "&:hover:not(:disabled)": {
      boxShadow: "0 4px 12px rgba(56, 189, 248, 0.3)",
      transform: "translateY(-1px)",
    },
    "&:active:not(:disabled)": {
      transform: "translateY(0)",
    },
  },
  backButton: {
    background: "rgba(51, 65, 85, 0.7)",
    color: "#cbd5e1",
    border: "1px solid #64748b",
    "&:hover:not(:disabled)": {
      background: "rgba(71, 85, 105, 0.8)",
    },
  },
  error: {
    color: "#f87171",
    background: "rgba(239, 68, 68, 0.1)",
    borderRadius: "0.5rem",
    padding: "0.75rem 1rem",
    marginTop: "1rem",
    fontWeight: 500,
    fontSize: "1rem",
  },
  success: {
    color: "#22d3ee",
    background: "rgba(34, 211, 238, 0.1)",
    borderRadius: "0.5rem",
    padding: "0.75rem 1rem",
    marginTop: "1rem",
    fontWeight: 500,
    fontSize: "1rem",
  },
};