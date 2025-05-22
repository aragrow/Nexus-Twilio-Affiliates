// --- export interfaces ---
export interface DashboardProps {
  userId: string | null;
  userName: string | null;
  onLogout: () => void;
}

export interface NavItem {
  id: string; // Unique ID for key prop and logic
  IconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  ariaLabel: string; // CRUCIAL for accessibility
  subItemsKey?: string; // Key in iconMap for next level of navigation cards
  action?: () => void; // For items that perform an action directly (e.g., show table, logout)
  // You could add a 'title' if you want a visual text label for sighted users (deviates from "no text")
  // title?: string;
}

export interface Affiliate {
  iD: string;
  companyName: string | null;
  contactName: string | null;
  status?: string;
}

export interface AffiliatesViewProps {
  affiliates: Affiliate[];
  isLoading: boolean;
  isError: string | null;
  onEdit?: (affiliateId: string) => void; // Optional: for edit action
  onClients?: (id: string) => void; // 👈 add this
}

export interface Client {
  iD: string;
  accountno: string | null;
  clientName: string | null;
  clientPhone: string | null;
  status: string | null;
  affiliateRatePerMinute: string | null;
  affiliateId: string | null;
  clientEmail: string | null;
  affiliate?: {
    companyName: string | null;
  };
}

export interface ClientsViewProps {
  clients: Client[];
  isLoading: boolean;
  isError: string | null;
  onEdit?: (clientId: string) => void; // Optional: for edit action
  onEntities?: (id: string) => void; // 👈 add this
}

export interface Entity {
  iD: string;
  clientId: string | null;
  entityType: string | null;
  entityName: string | null;
  entityPhone: string | null;
  ratePerMinute: string | null;
  entityStatus: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  client?: Client; // The resolved client object (optional if not always fetched)
  // For dnd and consistency, you might add 'id' if it's not the same as 'iD'
  id?: string; // if 'id' is different from 'iD' or you want to ensure it exists
}

export interface EntitiesViewProps {
  entities: Entity[];
  isLoading: boolean;
  isError: string | null;
  onEdit?: (entityId: string) => void; // Optional: for edit action
  onBilling?: (id: string) => void; // 👈 add this
}

export interface WorkFlow {
  iD: string;
  clientId: string | null;
  workFlowName: string | null;
  workFlowStatus: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  client?: Client; // The resolved client object (optional if not always fetched)
}

export interface WorkFlowsViewProps {
  // Renamed for clarity from worFlowsViewProps
  workFlows: WorkFlow[]; // This will be the potentially FILTERED list from the parent
  allClientsForDropdown: Client[]; // List of all clients specifically for the dropdown population
  isLoadingWorkflows: boolean; // Loading state for the WORKFLOWS list
  isLoadingClients: boolean; // Loading state for the CLIENTS list (for dropdown)
  isError: string | null;
  currentClientIdFilter: string | null; // The ID of the client currently being filtered by (for UI state)
  onClientFilterChange: (clientId: string | null) => void; // Callback to tell parent to change filter & refetch
  onEditWorkflowMeta?: (workflowId: string) => void;
  onManageWorkflowSteps: (
    workflowId: string,
    workflowName: string,
    clientId: string
  ) => void; // From previous
}

export interface WorkFlowItem extends Entity {
  wiD: string;
  workFlowName: string | null;
  workFlowOrder: string | null;
  // You might add workflow-specific properties here if needed in the future
}

export interface maintainWorkFlowTableProps {
  WorkFlow: WorkFlow[];
  clients: Client[];
  isLoading: boolean;
  isError: string | null;
  onSave: (id: string) => void;
}

export interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Function to close the modal
  children: React.ReactNode; // Content to render inside the modal
}

/**
 * Workflow Form Structure
 */
export interface WorkFlowForm {
  id?: number; // Optional if editing existing workflow
  client_id: number;
  workflow_name: string;
  workflow_status: string; // E.g., active, paused, archived
}

/**
 * Edit Workflow Modal Props
 * Used to edit or create a new workflow
 */
export interface EditWorkFlowModalProps {
  isOpen: boolean; // Whether the modal is visible
  onClose: () => void; // Close modal handler
  onSave: (data: WorkFlowForm) => void; // Save action handler
  initialData?: WorkFlowForm; // Optional initial data for editing
}

export interface WorkFlowStep extends Entity {
  // A step can extend Entity if it shares common fields
  order: number;
  // any other step-specific properties like configuration, etc.
  // For simplicity, we assume a step is just an ordered Entity for now.
  // Entity already has: iD, clientId, entityType, entityName, etc.
}

export interface WorkFlowStepInput {
  // For GQL mutation to save steps
  entityId: string; // The ID of the entity that forms this step
  order: number;
  // any other configuration for this step if needed
}

export interface WorkFlowStepEditorProps {
  workflowId: string;
  workflowName: string;
  clientId: string;
  onSave: (
    workflowId: string,
    workflowName: string,
    clientId: string,
    updatedSteps: WorkFlowStepInput[]
  ) => Promise<void>; // Async save handler
  onBack: () => void; // Handler to go back to the previous view
}

// Define types for our data
export interface WorkflowEntity {
  iD: string;
  workflowId: string;
  entityId: string;
  clientId: string;
  workflowOrder: number;
  stepStatus: string;
  workflow: {
    iD: string;
    workFlowName: string;
    workFlowStatus: string;
    client: {
      iD: string;
      clientName: string;
      clientPhone: string;
      status: string;
    };
  };
  entity: {
    iD: string;
    entityName: string;
    entityType: string;
    entityPhone: string;
  };
}

export interface UpdateWorkflowDetailsInput {
  id: string;
  name: string;
  status: string;
}

export interface EditWorkflowDetailsProps {
  workflow: WorkFlow;
  onUpdated?: (workflow: WorkFlow) => void;
}
