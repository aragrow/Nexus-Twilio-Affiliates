import type { BackButtonProps } from "./interface";
import styles from "./backButtonStyles"; // Assuming you have a CSS module for style
import React from "react";

const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = "Back",
  className = "",
}) => {
  return (
    <button onClick={onClick} style={styles} className={className}>
      {label}
    </button>
  );
};

export default BackButton;
