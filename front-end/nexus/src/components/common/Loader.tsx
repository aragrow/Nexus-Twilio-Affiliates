// src/components/common/Loader.tsx
import React from "react";

// Define a common style object or import from your global styles
const loaderStyles: { [key: string]: React.CSSProperties } = {
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    textAlign: "center",
    color: "var(--ui-text-color-light, #e0e0e0)", // Use your theme variable
    minHeight: "150px", // Ensure it takes some space
  },
  spinner: {
    // Simple CSS spinner
    border: "4px solid rgba(255, 255, 255, 0.2)", // Light border for the track
    borderTop: "4px solid var(--ui-primary-accent, #00aeff)", // Accent color for the spinner
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    marginBottom: "15px",
  },
  message: {
    fontSize: "1.1em",
    color: "var(--ui-primary-accent, #00aeff)",
  },
  // Keyframes for the spinner animation (needs to be in a global CSS or handled by CSS-in-JS)
  // If using plain style objects, you might opt for an SVG spinner or a library.
  // For this example, I'll assume you can add this @keyframes rule to a global CSS:
  /*
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  */
};

interface LoaderProps {
  message?: string;
  style?: React.CSSProperties; // Allow overriding or extending container style
  spinnerStyle?: React.CSSProperties;
  messageStyle?: React.CSSProperties;
}

const Loader: React.FC<LoaderProps> = ({
  message = "Loading...",
  style,
  spinnerStyle,
  messageStyle,
}) => {
  return (
    <div
      style={{ ...loaderStyles.loaderContainer, ...style }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{ ...loaderStyles.spinner, ...spinnerStyle }}
        aria-hidden="true"
      ></div>
      <p style={{ ...loaderStyles.message, ...messageStyle }}>{message}</p>
    </div>
  );
};

export default Loader;
