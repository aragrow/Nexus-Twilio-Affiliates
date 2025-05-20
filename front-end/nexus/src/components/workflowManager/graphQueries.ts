// src/components/workflowManage/graphqlQueries.ts
import { gql } from '@apollo/client';

export const GET_CLIENTS_FOR_SEARCH = gql`
  query GetClientsForSearch($term: String, $first: Int) {
    nexusClients(status: "active", search: $term, first: $first) {
      iD
      clientName
    }
  }
`;

export const GET_NEXUS_WORKFLOWS_BY_CLIENT = gql`
  query GetNexusWorkflowsByClient(
    $clientId: ID,
    $status: String,
    $first: Int,
    $offset: Int
  ) {
    nexusWorkflows(
      clientId: $clientId,
      workflowStatus: $status,
      first: $first,
      offset: $offset
    ) {
      # This is the structure for server-side pagination with totalCount
      workflows {
        iD
        workflowName
        workflowStatus
        clientId
        createdAt
        client {
          iD
          clientName
        }
      }
      totalCount
    }
  }
`;