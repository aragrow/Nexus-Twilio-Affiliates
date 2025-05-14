// src/api/auth.ts
export async function loginToWordPress(email: string, password: string) {
    const response = await fetch("http://localhost:10079/graphql", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          mutation LoginUser {
            login(input: {
              clientMutationId: "uniqueId",
              username: "affiliate_alfredo.lehner38",
              password: "A9iG5r7PRuxD3TjckQc(X)rO"
            }) {
              authToken
              user {
                iD
                name
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
  