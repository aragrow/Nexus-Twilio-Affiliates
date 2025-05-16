// --- Interfaces ---
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
  onEdit?: (affiliateId: string) => void; // Optional: for edit action
  onEntities?: (id: string) => void; // 👈 add this
}

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export type {
  NavItem,
  Affiliate,
  Client,
  AffiliatesTableProps,
  ClientsTableProps,
  BackButtonProps,
};
