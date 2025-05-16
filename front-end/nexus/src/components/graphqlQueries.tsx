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
      clientName
      clientPhone
      status
      affiliateRatePerMinute
      affiliateId
      clientEmail
    }
  }
`;
