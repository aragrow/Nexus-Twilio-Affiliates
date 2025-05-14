import { useState, useEffect } from "react";
import Login from "./components/login";
import Dashboard from "./components/dashboard";
import { loginToWordPress } from "./api/auth";

function App() {
  const [authToken, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    const savedUserId = localStorage.getItem("userId");
    const savedUserName = localStorage.getItem("userName");

    if (savedToken) {
      setToken(savedToken);
    }
    if (savedUserId) {
      setToken(savedUserId);
    }
    if (savedUserName) {
      setToken(savedUserName);
    }
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const result = await loginToWordPress(username, password);

      const authToken = result.data.login.authtoken;
      const userId = result.data.login.user.id;
      const userName = result.data.login.user.name;

      console.log("Auth Info:", authToken, userId, userName);

      setToken(authToken);
      setUserId(userId);
      setUserName(userName);
      localStorage.setItem("authToken", authToken);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", userName);
      console.log("Login successful. Token and user info saved.");
      console.log("✅ Logged in as:", userName);
    } catch (error: any) {
      alert("❌ " + error.message);
    }
  };

  return (
    <div>{authToken ? <Dashboard /> : <Login onLogin={handleLogin} />}</div>
  );
}

export default App;
