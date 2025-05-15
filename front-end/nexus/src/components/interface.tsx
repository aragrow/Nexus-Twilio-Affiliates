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

interface AffiliatesTableProps {
  affiliates: Affiliate[];
  isLoading: boolean;
  error: string | null;
  onEdit?: (affiliateId: string) => void; // Optional: for edit action
  onDelete?: (affiliateId: string) => void; // Optional: for delete action
}

export type { NavItem, Affiliate, AffiliatesTableProps };
