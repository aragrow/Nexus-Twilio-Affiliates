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

interface Client {
  iD: string;
  accountno: string | null;
  clientName: string | null;
  clientPhone: string | null;
  status: string | null;
  affiliateRatePerMinute: string | null;
  affiliateId: string | null;
  clientEmail: string | null;
  affiliate?: Affiliate; // The resolved client object (optional if not always fetched)
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

interface WorkFlow {
  iD: string;
  clientId: string | null;
  workFlowName: string | null;
  workFlowStatus: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  client?: Client; // The resolved client object (optional if not always fetched)
}

interface WorkFlowItem extends Entity {
  wiD: string;
  workFlowName: string | null;
  workFlowOrder: string | null;
  // You might add workflow-specific properties here if needed in the future
}

interface AffiliatesTableProps {
  affiliates: Affiliate[];
  isLoading: boolean;
  isError: string | null;
  onEdit?: (affiliateId: string) => void; // Optional: for edit action
  onClients?: (id: string) => void; // 👈 add this
}

interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
  isError: string | null;
  onEdit?: (clientId: string) => void; // Optional: for edit action
  onEntities?: (id: string) => void; // 👈 add this
}

interface EntitiesTableProps {
  entities: Entity[];
  isLoading: boolean;
  isError: string | null;
  onEdit?: (entityId: string) => void; // Optional: for edit action
  onBilling?: (id: string) => void; // 👈 add this
}

interface WorkFlowsTableProps {
  workFlows: WorkFlow[];
  isLoading: boolean;
  isError: string | null;
  onEdit?: (workFlowsId: string) => void; // Optional: for edit action
}

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export type {
  DashboardProps,
  NavItem,
  Affiliate,
  Client,
  Entity,
  WorkFlow,
  WorkFlowItem,
  AffiliatesTableProps,
  ClientsTableProps,
  EntitiesTableProps,
  WorkFlowsTableProps,
  BackButtonProps,
};
