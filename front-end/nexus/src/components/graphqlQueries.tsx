/**
 * GraphQL query to fetch a list of affiliates.
 *
 * @query GET_MANAGE_AFFILIATES
 * @returns {Object[]} nexusAffiliates - List of affiliates.
 * @returns {string} nexusAffiliates.iD - The ID of the affiliate.
 * @returns {string} nexusAffiliates.companyName - The name of the affiliate's company.
 * @returns {string} nexusAffiliates.contactName - The name of the affiliate's contact person.
 */

/**
 * GraphQL query to fetch a list of clients and their details.
 *
 * @query GET_MANAGE_CLIENTS
 * @returns {Object[]} nexusClients - List of clients.
 * @returns {Object} nexusClients.affiliate - The affiliate associated with the client.
 * @returns {string} nexusClients.affiliate.companyName - The name of the affiliate's company.
 * @returns {string} nexusClients.clientName - The name of the client.
 * @returns {string} nexusClients.clientPhone - The phone number of the client.
 * @returns {string} nexusClients.status - The status of the client.
 * @returns {number} nexusClients.affiliateRatePerMinute - The affiliate's rate per minute.
 * @returns {string} nexusClients.affiliateId - The ID of the affiliate.
 * @returns {string} nexusClients.clientEmail - The email address of the client.
 */

/**
 * GraphQL query to fetch a list of active clients for search purposes.
 *
 * @query GET_CLIENTS_FOR_SEARCH
 * @returns {Object[]} nexusClients - List of active clients.
 * @returns {string} nexusClients.iD - The ID of the client.
 * @returns {string} nexusClients.clientName - The name of the client.
 */

/**
 * GraphQL query to fetch a list of entities and their details.
 *
 * @query GET_MANAGE_ENTITIES
 * @returns {Object[]} nexusEntities - List of entities.
 * @returns {string} nexusEntities.entityType - The type of the entity.
 * @returns {string} nexusEntities.iD - The ID of the entity.
 * @returns {number} nexusEntities.ratePerMinute - The rate per minute for the entity.
 * @returns {string} nexusEntities.clientId - The ID of the associated client.
 * @returns {string} nexusEntities.entityName - The name of the entity.
 * @returns {string} nexusEntities.entityPhone - The phone number of the entity.
 * @returns {string} nexusEntities.entityStatus - The status of the entity.
 * @returns {string} nexusEntities.createdAt - The creation date of the entity.
 * @returns {Object} nexusEntities.client - The client associated with the entity.
 * @returns {string} nexusEntities.client.clientName - The name of the client.
 */

/**
 * GraphQL query to fetch a list of workflows and their details.
 *
 * @query GET_MANAGE_WORKFLOWS
 * @returns {Object[]} nexusWorkFlows - List of workflows.
 * @returns {string} nexusWorkFlows.iD - The ID of the workflow.
 * @returns {string} nexusWorkFlows.clientId - The ID of the associated client.
 * @returns {string} nexusWorkFlows.workFlowName - The name of the workflow.
 * @returns {string} nexusWorkFlows.workFlowStatus - The status of the workflow.
 * @returns {string} nexusWorkFlows.createdAt - The creation date of the workflow.
 * @returns {Object} nexusWorkFlows.client - The client associated with the workflow.
 * @returns {string} nexusWorkFlows.client.clientName - The name of the client.
 */

/**
 * GraphQL query to fetch workflows by a specific client ID.
 *
 * @query GET_NEXUS_WORKFLOWS_BY_CLIENT
 * @param {string} clientId - The ID of the client to filter workflows.
 * @returns {Object[]} nexusWorkFlows - List of workflows for the specified client.
 * @returns {string} nexusWorkFlows.iD - The ID of the workflow.
 * @returns {string} nexusWorkFlows.clientId - The ID of the associated client.
 * @returns {string} nexusWorkFlows.workFlowName - The name of the workflow.
 * @returns {string} nexusWorkFlows.workFlowStatus - The status of the workflow.
 * @returns {string} nexusWorkFlows.createdAt - The creation date of the workflow.
 * @returns {Object} nexusWorkFlows.client - The client associated with the workflow.
 * @returns {string} nexusWorkFlows.client.clientName - The name of the client.
 */

/**
 * GraphQL query to fetch details of a specific workflow by its ID.
 *
 * @query GET_WORKFLOW
 * @param {string} id - The ID of the workflow to fetch.
 * @returns {Object} nexusWorkFlow - The details of the specified workflow.
 * @returns {string} nexusWorkFlow.clientId - The ID of the associated client.
 * @returns {string} nexusWorkFlow.createdAt - The creation date of the workflow.
 * @returns {string} nexusWorkFlow.iD - The ID of the workflow.
 * @returns {string} nexusWorkFlow.updatedAt - The last updated date of the workflow.
 * @returns {string} nexusWorkFlow.workFlowName - The name of the workflow.
 * @returns {string} nexusWorkFlow.workFlowStatus - The status of the workflow.
 */

/**
 * GraphQL query to check the authentication status of the current user.
 *
 * @query GET_CURRENT_USER_STATUS
 * @returns {Object} viewer - The currently authenticated user.
 * @returns {string} viewer.id - The ID of the authenticated user.
 * @returns {string} viewer.name - The name of the authenticated user.
 */
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
export const GET_CLIENTS_FOR_SEARCH = gql`
  query GetClientsForSearch($term: String) {
    nexusClients(status: "active", term: $term) {
      iD
      affiliate {
        companyName
      }
      clientName
      status
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

export const GET_NEXUS_WORKFLOWS_BY_CLIENT = gql`
  query GetNexusWorkFlowsByClient($clientId: ID) {
    nexusWorkFlows(clientId: $clientId) {
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
