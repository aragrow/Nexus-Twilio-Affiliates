// src/components/common/ErrorMessage.tsx
import React from "react";

// Define a common style object or import from your global styles
const errorStyles: { [key: string]: React.CSSProperties } = {
  errorContainer: {
    padding: "20px",
    margin: "20px 0",
    border: "1px solid var(--ui-error-border-color, #ff6b6b)", // Use theme variable for error border
    backgroundColor: "var(--ui-error-bg-color, rgba(255, 107, 107, 0.1))", // Use theme variable
    color: "var(--ui-error-text-color, #ff6b6b)", // Use theme variable
    borderRadius: "var(--ui-border-radius-sm, 4px)",
    textAlign: "center",
    fontSize: "1em",
  },
  icon: {
    // Optional: for an error icon
    marginRight: "10px",
    fontSize: "1.2em",
    verticalAlign: "middle",
  },
  message: {
    verticalAlign: "middle",
  },
};

interface ErrorMessageProps {
  message: string | null | undefined;
  title?: string;
  style?: React.CSSProperties;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title = "An Error Occurred", // Default title
  style,
}) => {
  if (!message) {
    return null; // Don't render anything if no message is provided
  }

  return (
    <div style={{ ...errorStyles.errorContainer, ...style }} role="alert">
      {/* You could add an error icon here using an SVG or font icon */}
      {/* <span style={errorStyles.icon} aria-hidden="true">⚠️</span> */}
      <strong style={errorStyles.message}>{title}:</strong> {message}
    </div>
  );
};

export default ErrorMessage;
