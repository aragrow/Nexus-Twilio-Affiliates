import React, { useEffect, useState } from "react";
import styles from "./dashboardStyles";

const Dashboard: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedId = localStorage.getItem("userId") || "";
    const storedName = localStorage.getItem("userName") || "";

    setUserId(storedId);
    setUserName(storedName);
  }, []);

  const menuItems = [
    { icon: "fa-solid fa-chart-line", label: "Overview" },
    { icon: "fa-solid fa-brain", label: "AI Insights" },
    { icon: "fa-solid fa-rocket", label: "Launchpad" },
    { icon: "fa-solid fa-gear", label: "Settings" },
    { icon: "fa-solid fa-user", label: "Profile" },
  ];

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>🚀</div>
        <nav style={styles.menu}>
          {menuItems.map((item, index) => (
            <div key={index} style={styles.menuItem}>
              <i className={item.icon} style={styles.icon}></i>
              <span style={styles.label}>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      <main style={styles.dashboard}>
        <div style={styles.header}>
          <span style={styles.userName}>
            Welcome, {userName} ({userId})
          </span>
        </div>

        <h2 style={styles.title}>Welcome to the Dashboard</h2>
        <p style={styles.text}>
          You are now logged in. Add your dashboard widgets here.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;
