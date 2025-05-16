import { useState, useEffect } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

import Login from "./components/login";
import Dashboard from "./components/dashboard";
import { loginToWordPress } from "./api/auth";

const api_uri = import.meta.env.VITE_GRAPHQL_ENDPOINT;
// --- Apollo Client Setup ---
const httpLink = createHttpLink({
  uri: api_uri, // 🔧 Replace with your real URL
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("authToken");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  const [authToken, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    const savedUserId = localStorage.getItem("userId");
    const savedUserName = localStorage.getItem("userName");

    if (savedToken) setToken(savedToken);
    if (savedUserId) setUserId(savedUserId); // 🛠 Fixed: used setToken before
    if (savedUserName) setUserName(savedUserName); // 🛠 Fixed: used setToken before
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const result = await loginToWordPress(username, password);
      const authToken = result?.data?.login?.authToken;
      const userId = result?.data?.login?.user?.id;
      const userName = result?.data?.login?.user?.name;

      setToken(authToken);
      setUserId(userId);
      setUserName(userName);
      localStorage.setItem("authToken", authToken);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", userName);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred during login.");
      }
    }
  };

  return (
    <ApolloProvider client={client}>
      <div>
        {authToken ? (
          <Dashboard userId={userId} userName={userName} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
    </ApolloProvider>
  );
}

export default App;
