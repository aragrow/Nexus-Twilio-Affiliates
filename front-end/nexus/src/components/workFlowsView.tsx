// src/components/workflowManage/WorkFlowsView.tsx
import React, { useState, useMemo, useEffect } from "react";
import workFlowsStyles from "./workFlowsStyles";
import type { Client, WorkFlow } from "./interface"; // Adjust WorkFlowsTableProps if needed
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  GET_CLIENTS_FOR_SEARCH,
  GET_NEXUS_WORKFLOWS_BY_CLIENT,
} from "./graphqlQueries"; // Adjust path

// Define the props this component now expects from its parent
interface WorkFlowsViewProps {
  onEditWorkflowMeta: (workflowId: string) => void;
  // Ensure this callback signature matches what the parent expects
  onManageWorkflowSteps: (
    workflowId: string,
    workflowName: string, // Pass name for the editor's header
    clientId: string // Pass clientID for fetching available entities in editor
  ) => void;
}

// Configuration for Pagination
const ITEMS_PER_PAGE = 15;
// Configuration for client search
const MIN_CLIENT_SEARCH_TERM_LENGTH = 3;
const CLIENT_SEARCH_DEBOUNCE_MS = 300;

const WorkFlowsView: React.FC<WorkFlowsViewProps> = ({
  onEditWorkflowMeta, // Renamed from onEdit for clarity
  onManageWorkflowSteps,
}) => {
  // --- Client Search State ---
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientSearchResults, setClientSearchResults] = useState<Client[]>([]);
  const [selectedClientFilter, setSelectedClientFilter] =
    useState<Client | null>(null);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [
    searchClientsGQL, // Function to execute the query
    {
      loading: isClientSearchLoading, //  renames the loading property from the Apollo result object to isClientSearchLoading in your component's scope.
      error: clientSearchError, // Renames the error property to clientSearchErro
      data: clientSearchDataGQL, // Data returned from the query. Renames the data property to clientSearchDataGQL
    },
  ] = useLazyQuery<{ nexusClients: Client[] }>( // Hook call :useLazyQuery is an Apollo Client React hook used for executing GraphQL queries on demand, rather than automatically when the component mounts
    GET_CLIENTS_FOR_SEARCH, // GraphQL query document
    {
      // Options object for the hook
      fetchPolicy: "network-only",
      onCompleted: (data) => setClientSearchResults(data?.nexusClients || []),
      onError: (error) => {
        console.error("Error searching clients:", error);
        setClientSearchResults([]);
      },
    }
  );

  useEffect(() => {
    // This entire function (the "effect function") will run:
    // 1. After the component initially mounts.
    // 2. After any subsequent re-render IF `clientSearchTerm` or `searchClientsGQL` has changed
    //    since the last render. (Note: `searchClientsGQL` from useLazyQuery is stable,
    //    so effectively this runs mainly when `clientSearchTerm` changes).
    if (clientSearchTerm.length === 0) {
      // Condition 1: Handle empty search term
      setClientSearchResults([]);
      return;
    }
    if (clientSearchTerm.length < MIN_CLIENT_SEARCH_TERM_LENGTH) {
      // Condition 2: Handle search term being too short
      setClientSearchResults([]);
      return;
    }
    // If the search term is valid (not empty and meets min length):
    // Set up a debounced search.
    // Debouncing means we wait for the user to pause typing before making an API call.
    const handler = setTimeout(() => {
      searchClientsGQL({
        variables: {
          term: clientSearchTerm, // Pass the current search term as a variable to the query
          first: 10, //Example: Limit the number of results to 10 for the dropdown
        },
      });
    }, CLIENT_SEARCH_DEBOUNCE_MS); // Debounce. The delay in milliseconds
    // Cancel the previously scheduled timeout.
    // If the user types again within the debounce period (e.g., 300ms),
    // the old timeout (and its pending API call) is cancelled,
    // and a new timeout is set by the effect running again.
    return () => clearTimeout(handler);
    // Dependency Array:
    // This array tells React when to re-run this useEffect.
    // It will re-run if `clientSearchTerm` changes or if `searchClientsGQL` changes
    // (though the function returned by `useLazyQuery` is typically stable and won't cause re-runs itself).
  }, [clientSearchTerm, searchClientsGQL]);

  const handleClientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setClientSearchTerm(term);
    if (term.length >= MIN_CLIENT_SEARCH_TERM_LENGTH)
      setIsClientDropdownOpen(true);
    else setIsClientDropdownOpen(false);
  };

  const handleSelectClientFromDropdown = (client: Client) => {
    setSelectedClientFilter(client); // This will trigger the workflow query to refetch
    setClientSearchTerm(client.clientName);
    setIsClientDropdownOpen(false);
    setCurrentPage(1); // Reset pagination when client filter changes
  };

  const clearClientFilter = () => {
    setSelectedClientFilter(null); // This will trigger workflow query to refetch (e.g., all workflows)
    setClientSearchTerm("");
    setIsClientDropdownOpen(false);
    setCurrentPage(1); // Reset pagination
  };

  // --- Workflow Fetching State (dependent on selectedClientFilter) ---
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: workFlowsData, // The actual data returned from the GraphQL server
    loading: workFlowsLoading, // Boolean: true if the query is in flight, false otherwise
    error: workFlowsError, // ApolloError object if the query fails, undefined otherwise
    refetch, //  A function to manually re-trigger the query
  } = useQuery<{
    // useQuery: This is the primary Apollo Client hook for executing GraphQL queries when a component mounts or when its variables change.
    //           It automatically handles fetching data, managing loading and error states, and updating the component when data arrives or changes.
    nexusWorkFlows: {
      // Expect 'data' to have a 'nexusWorkFlows' property
      workflows: WorkFlow[]; // Which is an object containing a 'workflows' array of WorkFlow items
      totalCount: number; /// And a 'totalCount' number for pagination
    };
    // If your schema just returns WorkFlow[] directly and you handle totalCount differently:
    // nexusWorkFlows: WorkFlow[];
  }>(GET_NEXUS_WORKFLOWS_BY_CLIENT, {
    // The GraphQL query document (parsed by gql tag)
    variables: {
      clientId: selectedClientFilter ? selectedClientFilter.iD : null,
      // If selectedClientFilter (React state) has a client object, use its iD.
      // Otherwise, pass null (meaning fetch for all clients or no specific client,
      // depending on backend resolver logic).
      status: "active", // Hardcoded to always fetch 'active' workflows. This could also be a dynamic variable from React state if needed.
      first: ITEMS_PER_PAGE, // For pagination: Specifies how many items to retrieve per page.
      offset: (currentPage - 1) * ITEMS_PER_PAGE,
      // For pagination: Calculates how many items to skip based on the
      // currentPage (React state) and ITEMS_PER_PAGE.
      // e.g., Page 1: offset 0. Page 2: offset 15 (if ITEMS_PER_PAGE is 15).
    },
    fetchPolicy: "cache-and-network",
    // Defines how Apollo Client interacts with its cache for this query:
    // - "cache-first" (default): Looks in cache first. If all data is present, returns it. Otherwise, fetches from network.
    // - "network-only": Always fetches from the network, doesn't check cache first. Good for data that must be fresh.
    // - "cache-and-network": Returns data from cache immediately (if available) while also fetching from the network in the background.
    //                        If network data is different, the component re-renders with new data. Good for fast initial load + eventual consistency.
    // - "no-cache": Fetches from network and does not write results to the cache.
    // - "cache-only": Only reads from cache, never fetches from network. Errors if not in cache.
    // "cache-and-network" is a good choice here for a balance of quick display and data freshness.
  });

  const currentWorkflows = workFlowsData?.nexusWorkFlows || [];
  //   - `workFlowsData?.nexusWorkFlows`: Uses optional chaining. If `workFlowsData` is null or undefined,
  //     or if `nexusWorkFlows` doesn't exist on it, this expression evaluates to `undefined`.
  //   - `|| []`: If the result of the optional chaining is `undefined` (or any falsy value like null),

  // If your GraphQL query for workflows doesn't support pagination,
  // you'll do client-side pagination on `currentWorkflows` as before.
  // For server-side pagination, totalPages would ideally come from the server.
  // Assuming client-side pagination for simplicity based on your original code for now:
  const paginatedWorkFlows = useMemo(() => {
    // If using server-side pagination, currentWorkflows would already be paginated.
    // If client-side pagination, this is correct:
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    //   - `currentPage`: A React state variable holding the current page number (e.g., 1, 2, 3...).
    //   - `ITEMS_PER_PAGE`: A constant defining how many items are shown per page (e.g., 15).
    //   - Example:
    //     - If `currentPage` is 1, `startIndex` = (1-1) * 15 = 0.
    //     - If `currentPage` is 2, `startIndex` = (2-1) * 15 = 15.
    //     - If `currentPage` is 3, `startIndex` = (3-1) * 15 = 30.
    return currentWorkflows.slice(startIndex, startIndex + ITEMS_PER_PAGE); //The .slice() logic extracts only the portion for the current page.
    // return currentWorkflows; // If server-side pagination is fully handled by variables.
  }, [currentWorkflows, currentPage]);
  //   - `useMemo` will re-run the computation function inside it ONLY IF
  //     `currentWorkflows` changes (e.g., new data fetched, filter applied) OR
  //     `currentPage` changes (e.g., user clicks a pagination button).
  //   - If neither `currentWorkflows` nor `currentPage` has changed since the last render,
  //     `useMemo` returns the previously calculated `paginatedWorkFlows` value without
  //     re-executing the slicing logic. This is an optimization.

  // This needs adjustment if using server-side pagination fully.
  // For server-side, totalPages should come from a count field in your GraphQL response.
  const totalWorkflowsCount = workFlowsData?.nexusWorkflows?.length || 0; // This is only correct for client-side pagination total
  const totalPages = Math.ceil(totalWorkflowsCount / ITEMS_PER_PAGE); // Adjust if server sends total count

  useEffect(() => {
    // This is the "effect function". It will run after the component renders
    // if any of the dependencies inThis the dependency array have changed.
    setCurrentPage(1);
  }, [selectedClientFilter]);
  // "When selectedClientFilter changes, Apollo' `useEffect` hook is designed to **reset the current pagination page to 1 whenevers useQuery for workflows will automatically refetch
  // because selectedClientFilter.iD is part of its variables."

  // --- Pagination Handlers (mostly the same, ensure they use the correct totalPages) ---
  const handleNextPage = () =>
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  const handlePreviousPage = () =>
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  const handleGoToPage = (pageNumber: number) =>
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  const getPageNumbers = () => {
    /* ... your existing getPageNumbers logic ... */

    const pageNumbers = []; // Initialize an empty array to store the page numbers to be displayed.
    const maxPagesToShow = 5; // Define the maximum number of page links to show directly in the pagination control.
    let startPage, endPage; // Declare variables to hold the calculated start and end page of the visible range.
    if (totalPages <= 0) return []; // If there are no pages (or an invalid total), return an empty array.
    if (totalPages <= maxPagesToShow) {
      // Total pages are less than or equal to the maximum we want to show.
      startPage = 1;
      endPage = totalPages;
    } else {
      //Total pages are MORE than the maximum we want to show.
      // Calculate how many pages to show before and after the current page within the window.
      const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
      const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;
      if (currentPage <= maxPagesBeforeCurrentPage) {
        // Current page is near the beginning (e.g., currentPage is 1 or 2, maxPagesToShow is 5).
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
        //Current page is near the end.
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        // Current page is somewhere in the middle.
        startPage = currentPage - maxPagesBeforeCurrentPage;
        endPage = currentPage + maxPagesAfterCurrentPage;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      // Populate the `pageNumbers` array with the calculated range.
      pageNumbers.push(i);
    }
    return pageNumbers;
    // Return the array of page numbers that should be displayed as direct links.
  };
  const pageNumbersToDisplay = getPageNumbers();

  // --- Render Logic ---
  if (
    workFlowsLoading &&
    paginatedWorkFlows.length === 0 &&
    !selectedClientFilter &&
    clientSearchTerm === ""
  ) {
    // Initial load state before any client is selected or searched
    return (
      <div style={workFlowsStyles.loader}>
        Loading initial workflows or select a client...
      </div>
    );
  }
  if (workFlowsLoading && selectedClientFilter) {
    // Loading workflows for a specific client
    return (
      <div style={workFlowsStyles.loader}>
        Loading workflows for {selectedClientFilter.clientName}...
      </div>
    );
  }

  return (
    <>
      <div style={workFlowsStyles.tableContainer}>
        {/* --- Client Searchable Dropdown (mostly same) --- */}
        <div style={workFlowsStyles.clientSearchContainer}>
          <input
            type="text"
            style={workFlowsStyles.searchInput}
            placeholder="Search & Filter by Client..."
            value={clientSearchTerm}
            onChange={handleClientSearchChange}
            onFocus={() => {
              if (
                clientSearchTerm.length >= 2 ||
                clientSearchTerm.length === 0
              ) {
                setIsClientDropdownOpen(true);
              }
              // Optionally fetch initial list of clients if search term is empty
              if (
                clientSearchTerm.length === 0 &&
                clientSearchResults.length === 0 &&
                !isClientSearchLoading
              ) {
                // searchClientsGQL({ variables: { search: "", first: 5 } }); // Example
              }
            }}
            onBlur={() => setTimeout(() => setIsClientDropdownOpen(false), 200)}
          />
          {selectedClientFilter && (
            <button
              onClick={clearClientFilter}
              style={workFlowsStyles.clearFilterButton}
              aria-label="Clear client filter"
            >
              X {/* Icon */}
            </button>
          )}
          {isClientDropdownOpen &&
            (isClientSearchLoading ||
              clientSearchResults.length > 0 ||
              clientSearchTerm.length >= 0) && (
              <div style={workFlowsStyles.searchResultsDropdown}>
                {isClientSearchLoading && (
                  <div style={workFlowsStyles.searchResultItem}>
                    Searching...
                  </div>
                )}
                {!isClientSearchLoading &&
                  clientSearchResults.length === 0 &&
                  clientSearchTerm.length >= 2 && (
                    <div style={workFlowsStyles.searchResultItem}>
                      No clients match "{clientSearchTerm}".
                    </div>
                  )}
                {!isClientSearchLoading &&
                  clientSearchResults.map((client) => (
                    <div
                      key={client.iD}
                      style={workFlowsStyles.searchResultItem}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectClientFromDropdown(client);
                      }}
                    >
                      {client.clientName}
                    </div>
                  ))}
              </div>
            )}
          {clientSearchError && (
            <div style={{ color: "red", fontSize: "0.9em", marginTop: "5px" }}>
              Client search error: {clientSearchError.message}
            </div>
          )}
        </div>

        {/* --- Error display for workflow fetching --- */}
        {workFlowsError && (
          <div style={workFlowsStyles.errorMessage}>
            Error loading workflows: {workFlowsError.message}
          </div>
        )}

        {/* --- Table (renders paginatedWorkflows) --- */}
        {!workFlowsError && paginatedWorkFlows.length > 0 && (
          <table style={workFlowsStyles.table}>
            <thead style={workFlowsStyles.tableHead}>
              <tr>
                <th style={workFlowsStyles.tableHeader}>Client Name</th>
                <th style={workFlowsStyles.tableHeader}>Workflow Name</th>
                <th style={workFlowsStyles.tableHeader}>Status</th>
                <th style={workFlowsStyles.tableHeader}>Created</th>
                <th style={workFlowsStyles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody style={workFlowsStyles.tableBody}>
              {paginatedWorkFlows.map((workflow) => (
                <tr key={workflow.iD} style={workFlowsStyles.tableRow}>
                  <td style={workFlowsStyles.tableCell} data-label="Client:">
                    {workflow.client?.clientName || `ID: ${workflow.clientId}`}
                  </td>
                  <td style={workFlowsStyles.tableCell} data-label="Name:">
                    {workflow.workFlowName || "N/A"}
                  </td>
                  <td style={workFlowsStyles.tableCell} data-label="Status:">
                    {workflow.workFlowStatus}
                  </td>
                  <td style={workFlowsStyles.tableCell} data-label="Created:">
                    {workflow.createdAt
                      ? new Date(workflow.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td style={workFlowsStyles.tableCell} data-label="Actions:">
                    <button
                      style={workFlowsStyles.actionButton}
                      onClick={() => onManageWorkflowSteps(workflow.iD)}
                      aria-label={`Manage steps for ${
                        workflow.workflowName || "workflow"
                      }`}
                    >
                      Manage Steps {/* Icon */}
                    </button>
                    <button
                      style={{
                        ...workFlowsStyles.actionButton,
                        ...workFlowsStyles.editMetaButton,
                      }}
                      onClick={() => onEditWorkflowMeta(workflow.iD)}
                      aria-label={`Edit details for ${
                        workflow.workflowName || "workflow"
                      }`}
                    >
                      Edit Details {/* Icon */}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* --- No Data Message (after filtering and loading) --- */}
        {!workFlowsLoading &&
          !workFlowsError &&
          paginatedWorkFlows.length === 0 && (
            <div style={workFlowsStyles.noDataMessage}>
              {selectedClientFilter
                ? `No workflows found for ${selectedClientFilter.clientName}.`
                : "No workflows found. Select a client to view their workflows or create a new one."}
            </div>
          )}
      </div>

      {/* --- Pagination Controls --- */}
      {!workFlowsError && totalPages > 1 && (
        <div style={workFlowsStyles.paginationContainer}>
          {/* ... your pagination buttons using pageNumbersToDisplay ... */}
          <button
            style={workFlowsStyles.paginationButton}
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            «
          </button>
          {pageNumbersToDisplay[0] > 1 && (
            <>
              {" "}
              <button
                style={workFlowsStyles.paginationButton}
                onClick={() => handleGoToPage(1)}
              >
                1
              </button>{" "}
              {pageNumbersToDisplay[0] > 2 && <span>...</span>}{" "}
            </>
          )}
          {pageNumbersToDisplay.map((num) => (
            <button
              key={num}
              onClick={() => handleGoToPage(num)}
              style={
                currentPage === num
                  ? workFlowsStyles.paginationButtonActive
                  : workFlowsStyles.paginationButton
              }
            >
              {num}
            </button>
          ))}
          {pageNumbersToDisplay[pageNumbersToDisplay.length - 1] <
            totalPages && (
            <>
              {" "}
              {pageNumbersToDisplay[pageNumbersToDisplay.length - 1] <
                totalPages - 1 && <span>...</span>}
              <button
                style={workFlowsStyles.paginationButton}
                onClick={() => handleGoToPage(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            style={workFlowsStyles.paginationButton}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            »
          </button>
          <span style={workFlowsStyles.paginationInfo}>
            {" "}
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </>
  );
};

export default WorkFlowsView;
