import React, { useState, useEffect } from "react";
import styles from "./dashboardStyles";

const buttonMap: { [key: string]: string[] } = {
  root: ["Affiliates", "Clients", "Chat", "Settings"],
  Affiliates: [
    "Add Affiliate",
    "Manage Affiliate",
    "Affiliate Reports",
    "Affiliate Billing",
    "Affiliate Settings",
  ],
  Clients: [
    "Add Client",
    "Manage Client",
    "Client Reports",
    "Client Billing",
    "Client Settings",
  ],
  Chat: ["Chat History", "Live Chat"],
  Settings: ["Preferences", "Security", "Notifications", "Integrations"],
};

const Dashboard: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState("root");
  const [userName, setuserName] = useState("");

  useEffect(() => {
    const storeduserName = localStorage.getItem("userName") || "User";
    setuserName(storeduserName);
  }, []);

  const handleCardClick = (label: string) => {
    if (buttonMap[label]) {
      setCurrentLevel(label);
    }
  };

  const handleBack = () => {
    setCurrentLevel("root");
  };

  return (
    <div style={styles.body}>
      <div style={styles.dashboardContainer}>
        <div style={styles.dashboardHeader}>
          <button style={styles.backButton} onClick={handleBack}>
            Back
          </button>
          <h1 style={styles.dashboardTitle}>Dashboard</h1>
          <span style={styles.welcomeMessage}>Welcome, {userName}!</span>
        </div>
        <div style={styles.dashboardMain}>
          {buttonMap[currentLevel].map((label) => (
            <div
              key={label}
              style={styles.dashboardCard}
              onClick={() => handleCardClick(label)}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform =
                  styles.dashboardCardActive.transform)
              }
              onMouseUp={(e) =>
                (e.currentTarget.style.transform =
                  styles.dashboardCard.transform)
              }
              onMouseEnter={(e) =>
                Object.assign(e.currentTarget.style, styles.dashboardCardHover)
              }
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, styles.dashboardCard)
              }
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
