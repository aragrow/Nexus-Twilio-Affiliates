// src/api/auth.ts
export async function loginToWordPress(username: string, password: string) {
  const graphqlEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT; // IMPORTANT: Replace with your actual WP GraphQL endpoint
  
  const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          mutation LoginUser {
            login(input: {
              clientMutationId: "uniqueId",
              username: "${username}",
              password: "${password}"
            }) {
              authToken
              user {
                id
                name
                roles {
                  edges {
                    node {
                      name
                    }
                  }
                }
              }
            }
          }
        `
      })
    });
  
  const result = await response.json();
  
  console.log("Login response data:", result);
  
    if (!response.ok) {
      throw new Error(result.message || "Login failed");
    }
  
    return result; // { token, user_email, ... }
  }
  