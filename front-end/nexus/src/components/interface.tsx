// --- Interfaces ---
interface DashboardProps {
  userId: string | null;
  userName: string | null;
  onLogout: () => void;
}

interface NavItem {
  id: string; // Unique ID for key prop and logic
  IconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  ariaLabel: string; // CRUCIAL for accessibility
  subItemsKey?: string; // Key in iconMap for next level of navigation cards
  action?: () => void; // For items that perform an action directly (e.g., show table, logout)
  // You could add a 'title' if you want a visual text label for sighted users (deviates from "no text")
  // title?: string;
}

interface Affiliate {
  iD: string;
  companyName: string | null;
  contactName: string | null;
  status?: string;
}

interface AffiliatesViewProps {
  affiliates: Affiliate[];
  isLoading: boolean;
  isError: string | null;
  onEdit?: (affiliateId: string) => void; // Optional: for edit action
  onClients?: (id: string) => void; // 👈 add this
}

interface Client {
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

interface ClientsViewProps {
  clients: Client[];
  isLoading: boolean;
  isError: string | null;
  onEdit?: (clientId: string) => void; // Optional: for edit action
  onEntities?: (id: string) => void; // 👈 add this
}

interface Entity {
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
}

interface EntitiesViewProps {
  entities: Entity[];
  isLoading: boolean;
  isError: string | null;
  onEdit?: (entityId: string) => void; // Optional: for edit action
  onBilling?: (id: string) => void; // 👈 add this
}

interface WorkFlow {
  iD: string;
  clientId: string | null;
  workFlowName: string | null;
  workFlowStatus: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  client?: Client; // The resolved client object (optional if not always fetched)
}

interface WorkFlowsViewProps {
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

interface WorkFlowItem extends Entity {
  workflowItemId: string; // The ID of the nexus_workflow_entities row
  workflowOrder: number;
  isActiveInWorkflow: boolean; // Or your stepStatus equivalent
  // You might add workflow-specific properties here if needed in the future
}

interface maintainWorkFlowTableProps {
  WorkFlow: WorkFlow[];
  clients: Client[];
  isLoading: boolean;
  isError: string | null;
  onSave: (id: string) => void;
}

interface WorkflowBuilderProps {
  clientId: string | null; // The ID of the client whose entities are available
  workflowId: string | null; // The ID of the workflow being edited
  // Add onSave, onBack, etc. callbacks as needed
  onSaveWorkflowSteps: (
    workflowId: string,
    steps: WorkFlowItem[]
  ) => Promise<void>;
  onBack: () => void;
}

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

interface ModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Function to close the modal
  children: React.ReactNode; // Content to render inside the modal
}

/**
 * Workflow Form Structure
 */
interface WorkFlowForm {
  id?: number; // Optional if editing existing workflow
  client_id: number;
  workflow_name: string;
  workflow_status: string; // E.g., active, paused, archived
}

/**
 * Edit Workflow Modal Props
 * Used to edit or create a new workflow
 */
interface EditWorkFlowModalProps {
  isOpen: boolean; // Whether the modal is visible
  onClose: () => void; // Close modal handler
  onSave: (data: WorkFlowForm) => void; // Save action handler
  initialData?: WorkFlowForm; // Optional initial data for editing
}

export type {
  DashboardProps,
  NavItem,
  // AFFILIATE TYPES
  Affiliate,
  AffiliatesViewProps,
  // CLIENT TYPES
  Client,
  ClientsViewProps,
  // ENTITY TYPES
  Entity,
  EntitiesViewProps,
  // WORKFLOW TYPES
  WorkFlow,
  WorkFlowItem,
  WorkFlowsViewProps,
  WorkflowBuilderProps,
  maintainWorkFlowTableProps,
  EditWorkFlowModalProps,
  BackButtonProps,
  ModalProps,
  WorkFlowForm,
};
