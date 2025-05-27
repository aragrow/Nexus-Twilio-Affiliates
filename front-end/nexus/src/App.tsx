import { useState, useEffect } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  from, // Import 'from' to chain links
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error"; // Import the error link

import Login from "./components/login"; // Assuming this component exists
import Dashboard from "./components/dashboard"; // Assuming this component exists
import { loginToWordPress } from "./api/auth"; // Assuming this function exists

const api_uri = import.meta.env.VITE_GRAPHQL_ENDPOINT;

// --- Apollo Client Setup ---
const httpLink = createHttpLink({
  uri: api_uri,
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

// --- Error Link for Authentication Errors ---
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        console.error(
          `[GraphQL error]: Message: ${err.message}, Location: ${err.locations}, Path: ${err.path}`,
          err
        );

        // Customize these conditions based on your GraphQL server's auth error responses
        const isAuthError =
          err.message.toLowerCase().includes("unauthenticated") ||
          err.message.toLowerCase().includes("invalid token") ||
          err.message.toLowerCase().includes("not logged in") ||
          err.extensions.debugMessage.toLowerCase().includes("expired token") ||
          (err.extensions && err.extensions.code === "UNAUTHENTICATED") ||
          (err.extensions && err.extensions.category === "authentication"); // Common for WPGraphQL

        console.log(err.extensions);
        console.log(err.extensions.debugMessage);

        if (isAuthError) {
          console.log(
            "Authentication error detected by Apollo errorLink. Logging out."
          );
          // Clear token and user data from local storage
          localStorage.removeItem("authToken");
          localStorage.removeItem("userId");
          localStorage.removeItem("userName");
          localStorage.removeItem("userRole");

          // Force a reload to the root/login page.
          // App component will re-read localStorage on mount and show Login.
          if (window.location.pathname !== "/") {
            // Avoid reload loop if already on login
            window.location.href = "/"; // Or your specific login page route
          } else {
            window.location.reload(); // If already on login, just ensure state is fresh
          }
          // No need to call setToken(null) here as the reload will handle it.
          return; // Stop further processing for this error
        }
      }
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`, networkError);
      // Handle specific network errors if needed, e.g., a 401 status
      // if (networkError.statusCode === 401) { /* similar logout logic */ }
    }
  }
);

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]), // Correct order: error -> auth -> http
  cache: new InMemoryCache(),
});
// --- End Apollo Client Setup ---

function App() {
  // Initialize state directly from localStorage
  const [authToken, setAuthToken] = useState<string | null>(() =>
    localStorage.getItem("authToken")
  );
  const [userId, setUserId] = useState<string | null>(() =>
    localStorage.getItem("userId")
  );
  const [userName, setUserName] = useState<string | null>(() =>
    localStorage.getItem("userName")
  );
  // Add state for role
  const [userRole, setUserRole] = useState<string | null>(() =>
    localStorage.getItem("userRole")
  );

  // This effect primarily handles changes that might happen in other tabs/windows
  // or if the errorLink didn't force a full page navigation/reload.
  useEffect(() => {
    const checkAuth = () => {
      const currentToken = localStorage.getItem("authToken");
      if (!currentToken && authToken) {
        // If state has a token but localStorage doesn't
        console.log(
          "Auth token removed from localStorage, updating app state."
        );
        handleLogout(false); // Update state without forcing another reload
      } else if (currentToken && !authToken) {
        // If localStorage has a token but state doesn't (e.g. after login in another tab)
        setAuthToken(currentToken);
        setUserId(localStorage.getItem("userId"));
        setUserName(localStorage.getItem("userName"));
        setUserRole(localStorage.getItem("userRole"));
      }
    };

    checkAuth(); // Initial check

    // Optional: Listen to storage events to sync across tabs
    // window.addEventListener('storage', checkAuth);
    // return () => window.removeEventListener('storage', checkAuth);
  }, [authToken]); // Re-run this effect if the authToken state changes

  const handleLogin = async (usernameInput: string, passwordInput: string) => {
    try {
      const result = await loginToWordPress(usernameInput, passwordInput);
      const newAuthToken = result?.data?.login?.authToken;
      const newUserId = result?.data?.login?.user?.id;
      const newUserName = result?.data?.login?.user?.name; // Ensure your GraphQL mutation returns this
      const newUserRole = result?.data?.login?.user?.roles; // Ensure your GraphQL mutation returns this

      {
        console.log("Login result:", result);
      }
      if (newAuthToken && newUserId && newUserName && newUserRole) {
        localStorage.setItem("authToken", newAuthToken);
        localStorage.setItem("userId", newUserId);
        localStorage.setItem("userName", newUserName);
        localStorage.setItem("userRole", newUserRole);
        setAuthToken(newAuthToken);
        setUserId(newUserId);
        setUserName(newUserName);
      } else {
        // This path means login API succeeded but didn't return expected data
        console.error("Login response missing expected data:", result);
        throw new Error(
          "Login failed: Invalid credentials or unexpected server response."
        );
      }
    } catch (error: unknown) {
      console.error("Login attempt failed:", error);
      handleLogout(false); // Clear any potentially bad state, don't force reload from here
      if (error instanceof Error) {
        alert(`Login failed: ${error.message}`);
      } else {
        alert("An unknown error occurred during login.");
      }
    }
  };

  // `forceRedirect` to avoid reload loops if called from errorLink already doing a redirect
  const handleLogout = (forceRedirect = true) => {
    console.log("Handling logout. Force redirect:", forceRedirect);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");

    setAuthToken(null);
    setUserId(null);
    setUserName(null);
    setUserRole(null);

    // Clear Apollo Client cache to remove any protected data
    client
      .resetStore()
      .then(() => {
        // Only redirect if initiated by user action (e.g., logout button)
        // or if state was out of sync and needed a hard reset to login.
        // The errorLink handles its own redirect/reload.
        if (forceRedirect && window.location.pathname !== "/") {
          window.location.href = "/"; // Or your login page path
        } else if (forceRedirect) {
          window.location.reload();
        }
      })
      .catch((err) => {
        console.error("Error resetting Apollo store:", err);
        if (forceRedirect && window.location.pathname !== "/") {
          window.location.href = "/";
        } else if (forceRedirect) {
          window.location.reload();
        }
      });
  };

  return (
    <ApolloProvider client={client}>
      <div>
        {authToken ? (
          <Dashboard
            userId={userId}
            userName={userName}
            userRole={userRole}
            onLogout={() => handleLogout(true)} // Pass logout handler to dashboard
          />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
    </ApolloProvider>
  );
}

export default App;
