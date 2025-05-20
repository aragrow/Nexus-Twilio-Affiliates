// src/components/workflowManage/useWorkFlowsViewLogic.ts
import { useState, useMemo, useEffect } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_CLIENTS_FOR_SEARCH, GET_NEXUS_WORKFLOWS_BY_CLIENT } from './graphqlQueries';
import type { Client, WorkFlow } from './interface';

const ITEMS_PER_PAGE = 15;
const MIN_CLIENT_SEARCH_TERM_LENGTH = 2;
const CLIENT_SEARCH_DEBOUNCE_MS = 300;

export const useWorkFlowsViewLogic = () => {
  // --- Client Search State & Logic ---
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientSearchResults, setClientSearchResults] = useState<Client[]>([]);
  const [selectedClientFilter, setSelectedClientFilter] = useState<Client | null>(null);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  const [
    searchClientsGQL,
    { loading: isClientSearchLoading, error: clientSearchError },
  ] = useLazyQuery<{ nexusClients: Client[] }>(GET_CLIENTS_FOR_SEARCH, {
    fetchPolicy: "network-only",
    onCompleted: (data) => setClientSearchResults(data?.nexusClients || []),
    onError: (error) => {
      console.error("Error searching clients:", error);
      setClientSearchResults([]);
    },
  });

  useEffect(() => {
    if (clientSearchTerm.length < MIN_CLIENT_SEARCH_TERM_LENGTH) {
      setClientSearchResults([]);
      if (clientSearchTerm.length === 0 && isClientDropdownOpen) {
        // Optional: fetch initial if dropdown is open & term empty
        // searchClientsGQL({ variables: { search: "", first: 5 }});
      }
      return;
    }
    const handler = setTimeout(() => {
      searchClientsGQL({ variables: { search: clientSearchTerm, first: 10 } });
    }, CLIENT_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handler);
  }, [clientSearchTerm, searchClientsGQL, isClientDropdownOpen]);

  const handleClientSearchChange = (term: string) => {
    setClientSearchTerm(term);
    if (term.length >= MIN_CLIENT_SEARCH_TERM_LENGTH || term.length === 0) {
      setIsClientDropdownOpen(true);
    } else {
      setIsClientDropdownOpen(false);
    }
  };

  const handleSelectClientFromDropdown = (client: Client) => {
    setSelectedClientFilter(client);
    setClientSearchTerm(client.clientName);
    setIsClientDropdownOpen(false);
    // setCurrentPage(1) will be handled by the useEffect below
  };

  const clearClientFilter = () => {
    setSelectedClientFilter(null);
    setClientSearchTerm("");
    setIsClientDropdownOpen(false);
    // setCurrentPage(1) will be handled by the useEffect below
  };

  // --- Workflow List State & Logic ---
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: workFlowsQueryResult,
    loading: workFlowsLoading,
    error: workFlowsError,
  } = useQuery<{
    nexusWorkflows: { workflows: WorkFlow[]; totalCount: number; };
  }>(GET_NEXUS_WORKFLOWS_BY_CLIENT, {
    variables: {
      clientId: selectedClientFilter ? selectedClientFilter.iD : null,
      status: "active",
      first: ITEMS_PER_PAGE,
      offset: (currentPage - 1) * ITEMS_PER_PAGE,
    },
    fetchPolicy: "cache-and-network",
  });

  const { currentWorkflows, totalWorkflowsCount } = useMemo(() => {
    const responseData = workFlowsQueryResult?.nexusWorkflows;
    return {
      currentWorkflows: responseData?.workflows || [],
      totalWorkflowsCount: responseData?.totalCount || 0,
    };
  }, [workFlowsQueryResult]);

  // If server handles pagination, currentWorkflows *is* the paginated list for the current page
  const paginatedWorkFlows = currentWorkflows;
  const totalPages = Math.ceil(totalWorkflowsCount / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when client filter changes
  }, [selectedClientFilter]);

  return {
    // Client Search
    clientSearchTerm,
    handleClientSearchChange,
    clientSearchResults,
    isClientSearchLoading,
    clientSearchError,
    selectedClientFilter,
    handleSelectClientFromDropdown,
    clearClientFilter,
    isClientDropdownOpen,
    setIsClientDropdownOpen,
    // Workflows
    paginatedWorkFlows,
    workFlowsLoading,
    workFlowsError,
    currentPage,
    totalPages,
    setCurrentPage,
  };
};