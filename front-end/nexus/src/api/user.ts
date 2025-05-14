// File: src/api/user.ts
export const fetchUserName = async (): Promise<string | null> => {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) console.error("Token Invalid."); else console.log("Token Valid.");

      const response = await fetch("http://localhost:10079/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query {
              viewer {
                id
                name
                username
                email
              }
            }
          `,
        }),
      })
      .then(res => res.json())
      .then(data => {
        console.log("Authenticated user:", data.data.viewer);
      })
      .catch(err => console.error("❌ Error:", err));
  
      const result = await response.json();
      return result?.data?.viewer?.name || null;
    } catch (error) {
      console.error("Failed to fetch user name:", error);
      return null;
    }
  };
  