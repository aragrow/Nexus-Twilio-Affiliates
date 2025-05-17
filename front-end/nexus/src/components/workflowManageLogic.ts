// src/components/workflowManage/workflowManageLogic.ts
import { useState, useEffect, useCallback } from 'react';
import { DropResult, OnDragEndResponder } from '@hello-pangea/dnd';

// --- Interfaces (Match your GraphQL types) ---
export interface Client {
  iD: string;
  clientName: string;
  // other client fields
}

export interface Entity {
  id: string; // Using 'id' for consistency with D&D
  name: string;
  type: string; // Example field
  // other entity fields
}

export interface AssignedEntity extends Entity {
  isActiveInWorkflow: boolean;
  workflowOrder: number;
}

// --- Mock API Calls (Replace with your actual GraphQL client calls) ---
const mockClientApi = {
  searchClients: async (searchTerm: string): Promise<Client[]> => {
    console.log('Searching clients for:', searchTerm);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    const allClients: Client[] = [
      { iD: 'client-1', clientName: 'Alpha Corp' },
      { iD: 'client-2', clientName: 'Beta Industries' },
      { iD: 'client-3', clientName: 'Gamma Solutions' },
      { iD: 'client-4', clientName: 'Client Delta Inc.' },
    ];
    if (!searchTerm) return allClients.slice(0,5); // Show some initial clients for dropdown
    return allClients.filter(c =>
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
  getEntitiesForClient: async (clientId: string): Promise<{ assigned: AssignedEntity[], unassigned: Entity[] }> => {
    console.log('Getting entities for client:', clientId);
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulate fetching assigned and unassigned entities based on client ID
    // This logic will involve querying your nexus_workflow_entities and nexus_entities
    if (clientId === 'client-1') {
      return {
        assigned: [
          { id: 'entity-A', name: 'Service One', type: 'Service', isActiveInWorkflow: true, workflowOrder: 1 },
          { id: 'entity-B', name: 'Device Two', type: 'Device', isActiveInWorkflow: false, workflowOrder: 2 },
        ],
        unassigned: [
          { id: 'entity-C', name: 'Phone Line Three', type: 'Phone' },
          { id: 'entity-D', name: 'Contact Four', type: 'Contact' },
        ],
      };
    }
    return {
      assigned: [],
      unassigned: [
        { id: 'entity-X', name: 'General Item X', type: 'General' },
        { id: 'entity-Y', name: 'General Item Y', type: 'General' },
      ]
    };
  },
  updateClientWorkflowEntities: async (clientId: string, assignedEntities: AssignedEntity[]): Promise<boolean> => {
    console.log('Updating workflow for client:', clientId, 'with entities:', assignedEntities);
    // Simulate API call to save the new order and active status of assignedEntities
    // This would likely involve a mutation to update/replace nexus_workflow_entities for the client's workflow
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  },
};
// --- End Mock API Calls ---


export const useWorkflowManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [assignedEntities, setAssignedEntities] = useState<AssignedEntity[]>([]);
  const [unassignedEntities, setUnassignedEntities] = useState<Entity[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    if (searchTerm.length === 0) {
      setSearchResults([]);
      // Optionally fetch initial few clients for dropdown when input is cleared
      // mockClientApi.searchClients('').then(setSearchResults);
      return;
    }

    if (searchTerm.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(() => {
      mockClientApi.searchClients(searchTerm)
        .then(setSearchResults)
        .catch(() => setError('Failed to search clients.'))
        .finally(() => setIsSearching(false));
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Fetch entities when a client is selected
  useEffect(() => {
    if (selectedClient) {
      setIsLoadingEntities(true);
      setError(null);
      mockClientApi.getEntitiesForClient(selectedClient.iD)
        .then(data => {
          setAssignedEntities(data.assigned.sort((a, b) => a.workflowOrder - b.workflowOrder));
          setUnassignedEntities(data.unassigned);
        })
        .catch(() => setError('Failed to load entities for client.'))
        .finally(() => setIsLoadingEntities(false));
    } else {
      setAssignedEntities([]);
      setUnassignedEntities([]);
    }
  }, [selectedClient]);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setSearchTerm(client.clientName); // Populate search input with selected client name
    setSearchResults([]); // Hide dropdown
  };

  const toggleEntityActive = (entityId: string) => {
    setAssignedEntities(prev =>
      prev.map(entity =>
        entity.id === entityId
          ? { ...entity, isActiveInWorkflow: !entity.isActiveInWorkflow }
          : entity
      )
    );
    // Note: Consider debouncing or providing a "Save Changes" button
    // before calling updateClientWorkflowEntities immediately on toggle.
    // For now, let's assume we save on dragEnd or a dedicated save button.
  };

  // D&D Logic
  const onDragEnd: OnDragEndResponder = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    // Reordering within Assigned Entities
    if (source.droppableId === 'assigned' && destination.droppableId === 'assigned') {
      if (source.index === destination.index) return;
      const items = Array.from(assignedEntities);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      // Update workflowOrder
      const updatedItems = items.map((item, index) => ({ ...item, workflowOrder: index + 1 }));
      setAssignedEntities(updatedItems);
      // TODO: Call API to save new order
      if(selectedClient) mockClientApi.updateClientWorkflowEntities(selectedClient.iD, updatedItems);
      return;
    }

    // Moving from Unassigned to Assigned
    if (source.droppableId === 'unassigned' && destination.droppableId === 'assigned') {
      const itemToAssign = unassignedEntities.find(e => e.id === draggableId);
      if (itemToAssign) {
        const newUnassigned = unassignedEntities.filter(e => e.id !== draggableId);
        const newAssignedItem: AssignedEntity = {
          ...itemToAssign,
          isActiveInWorkflow: true, // Default to active when assigned
          workflowOrder: assignedEntities.length + 1, // Temporary order, will be re-calculated
        };
        const updatedAssigned = Array.from(assignedEntities);
        updatedAssigned.splice(destination.index, 0, newAssignedItem);
        // Re-calculate workflowOrder for all assigned items
        const finalAssigned = updatedAssigned.map((item, index) => ({ ...item, workflowOrder: index + 1 }));

        setUnassignedEntities(newUnassigned);
        setAssignedEntities(finalAssigned);
        // TODO: Call API to save
        if(selectedClient) mockClientApi.updateClientWorkflowEntities(selectedClient.iD, finalAssigned);
      }
      return;
    }

    // Moving from Assigned to Unassigned
    if (source.droppableId === 'assigned' && destination.droppableId === 'unassigned') {
      const itemToUnassign = assignedEntities.find(e => e.id === draggableId);
      if (itemToUnassign) {
        const newAssigned = assignedEntities.filter(e => e.id !== draggableId)
                                          .map((item, index) => ({ ...item, workflowOrder: index + 1 })); // Re-order remaining
        const newUnassignedItem: Entity = { // Revert to base Entity type
            id: itemToUnassign.id,
            name: itemToUnassign.name,
            type: itemToUnassign.type,
        };
        const updatedUnassigned = Array.from(unassignedEntities);
        updatedUnassigned.splice(destination.index, 0, newUnassignedItem);


        setAssignedEntities(newAssigned);
        setUnassignedEntities(updatedUnassigned);
        // TODO: Call API to save
        if(selectedClient) mockClientApi.updateClientWorkflowEntities(selectedClient.iD, newAssigned);
      }
      return;
    }
  }, [assignedEntities, unassignedEntities, selectedClient]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    selectedClient,
    handleClientSelect,
    assignedEntities,
    unassignedEntities,
    isLoadingEntities,
    error,
    toggleEntityActive,
    onDragEnd,
    // You might add a function here to explicitly save changes if not saving on every action
    // handleSaveChanges: () => { if(selectedClient) mockClientApi.updateClientWorkflowEntities(selectedClient.iD, assignedEntities); }
  };
};