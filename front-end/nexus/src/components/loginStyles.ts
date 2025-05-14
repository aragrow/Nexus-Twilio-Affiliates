import { keyframes } from "@emotion/react";
import React, { useState } from "react";


const neonGlow = keyframes`
  0% {
    box-shadow: 0 0 5px #ff7e5f, 0 0 10px #feb47b, 0 0 20px #ff7e5f, 0 0 30px #feb47b;
  }
  50% {
    box-shadow: 0 0 10px #feb47b, 0 0 20px #ff7e5f, 0 0 30px #feb47b, 0 0 40px #ff7e5f;
  }
  100% {
    box-shadow: 0 0 5px #ff7e5f, 0 0 10px #feb47b, 0 0 20px #ff7e5f, 0 0 30px #feb47b;
  }
`;

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "radial-gradient(circle, #1e3c72, #2a5298, #000)",
    fontFamily: "'Orbitron', sans-serif",
    overflow: "hidden",
  },
  form: {
    background: "rgba(0, 0, 0, 0.8)",
    padding: "2.5rem",
    borderRadius: "15px",
    boxShadow: "0 10px 50px rgba(0, 0, 0, 0.5)",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    width: "100%",
    maxWidth: "450px",
    textAlign: "center",
    animation: `${neonGlow} 3s infinite alternate`,
  },
  title: {
    color: "#ff7e5f",
    fontSize: "2rem",
    marginBottom: "2rem",
    textShadow: "0 0 10px #ff7e5f, 0 0 20px #feb47b",
  },
  input: {
    width: "100%",
    padding: "1rem",
    margin: "0.8rem 0",
    borderRadius: "8px",
    border: "none",
    outline: "none",
    fontSize: "1.2rem",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    boxShadow: "inset 0 3px 6px rgba(0, 0, 0, 0.3)",
    transition: "all 0.3s ease",
    "&:focus": {
      background: "rgba(255, 255, 255, 0.2)",
      boxShadow: "0 0 10px #ff7e5f, 0 0 20px #feb47b",
    },
  },
  button: {
    width: "100%",
    padding: "1rem",
    marginTop: "1.5rem",
    borderRadius: "8px",
    border: "none",
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#fff",
    background: "linear-gradient(135deg, #ff7e5f, #feb47b)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0 0 15px #ff7e5f, 0 0 30px #feb47b",
    },
  },
  buttonDisabled: {
    background: "rgba(255, 255, 255, 0.2)",
    cursor: "not-allowed",
    opacity: 0.6,
  },
};

export default styles;