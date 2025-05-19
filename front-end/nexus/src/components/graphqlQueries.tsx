// queries.js
import { gql } from "@apollo/client";

export const GET_MANAGE_AFFILIATES = gql`
  query GetManageAffiliates {
    nexusAffiliates {
      iD
      companyName
      contactName
    }
  }
`;

export const GET_MANAGE_CLIENTS = gql`
  query GetManageClients {
    nexusClients {
      affiliate {
        companyName
      }
      clientName
      clientPhone
      status
      affiliateRatePerMinute
      affiliateId
      clientEmail
    }
  }
`;

export const GET_MANAGE_ENTITIES = gql`
  query GetManageEntities {
    nexusEntities {
      entityType
      iD
      ratePerMinute
      clientId
      entityName
      entityPhone
      entityStatus
      createdAt
      client {
        clientName
      }
    }
  }
`;

export const GET_MANAGE_WORKFLOWS = gql`
  query GetManageWorkFlows {
    nexusWorkFlows {
      iD
      clientId
      workFlowName
      workFlowStatus
      createdAt
      client {
        clientName
      }
    }
  }
`;

export const GET_WORKFLOW = gql`
  query GetWorkFlow($id: ID!) {
    nexusWorkFlow(iD: $id) {
      clientId
      createdAt
      iD
      updatedAt
      workFlowName
      workFlowStatus
    }
  }
`;

// A simple query to check authentication (e.g., get current user's viewer data)
export const GET_CURRENT_USER_STATUS = gql`
  query GetCurrentUserStatus {
    viewer {
      # 'viewer' is common in WPGraphQL for the currently authenticated user
      id
      name
      # Add any other small piece of data that confirms auth
    }
  }
`;
