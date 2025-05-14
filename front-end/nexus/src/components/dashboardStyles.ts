// File: src/components/dashboardStyles.ts
const shared = {
  glassEffect: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.18)",
  },
  transition: {
    transition: "all 0.3s ease",
  },
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Segoe UI, sans-serif",
    background: "linear-gradient(to right, #1f1c2c, #928dab)",
    color: "#fff",
  },
  sidebar: {
    width: "280px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    ...shared.glassEffect,
    margin: "20px",
  },
  logo: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "40px",
    textAlign: "center",
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    padding: "16px 20px",
    borderRadius: "14px",
    fontSize: "1.2rem",
    cursor: "pointer",
    background: "rgba(255, 255, 255, 0.08)",
    ...shared.transition,
  },
  icon: {
    fontSize: "1.5rem",
    marginRight: "14px",
    width: "24px",
    textAlign: "center",
  },
  label: {
    fontSize: "1.1rem",
    fontWeight: 500,
  },
  dashboard: {
    flex: 1,
    margin: "20px",
    padding: "30px",
    ...shared.glassEffect,
    overflowY: "auto",
    height: "calc(100vh - 100px)",
    width: "calc(100vw - 480px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "10px",
  },
  text: {
    fontSize: "1.2rem",
    color: "#ddd",
  },
};

export default styles;
