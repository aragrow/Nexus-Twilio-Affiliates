// apolloClient.js
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
const api_uri = import.meta.env.VITE_GRAPHQL_ENDPOINT;
const token = localStorage.getItem("authToken");
const client = new ApolloClient({
  link: new HttpLink({
    uri: api_uri, // Replace with your GraphQL API URL
    headers: {
      Authorization: `Bearer ${token}`, // Optional: dynamically inject this via context
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
