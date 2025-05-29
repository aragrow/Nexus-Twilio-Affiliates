import {
  PlaceholderIcon,
  HolderAffiliatesIcon,
  HolderClientsIcon,
  HolderChatIcon,
  HolderSettingsIcon,
  HolderAddIcon,
  HolderManageIcon,
  HolderReportsIcon,
  HolderBillingIcon,
} from "./icons"; // Assuming this file exists and is correctly set up
import type { NavItem } from "./interface"; // Assuming this file exists and is correctly set up

const AffiliatesIcon = HolderAffiliatesIcon;
const ClientsIcon = HolderClientsIcon;
const ChatIcon = HolderChatIcon;
const SettingsIcon = HolderSettingsIcon;
const AddIcon = HolderAddIcon;
const ManageIcon = HolderManageIcon;
const ReportsIcon = HolderReportsIcon;
const BillingIcon = HolderBillingIcon;
// --- End SVG Icon Placeholders ---

// --- Navigation and Action Map ---
const iconMap: { [key: string]: NavItem[] } = {
  root: [
    {
      id: "affiliatesRoot",
      IconComponent: AffiliatesIcon,
      ariaLabel: "Affiliates Menu",
      subItemsKey: "Affiliates",
    },
    {
      id: "clientsRoot",
      IconComponent: ClientsIcon,
      ariaLabel: "Clients Menu",
      subItemsKey: "Clients",
    },
    {
      id: "chatRoot",
      IconComponent: ChatIcon,
      ariaLabel: "Chat Menu",
      subItemsKey: "Chat",
    },
    {
      id: "settingsRoot",
      IconComponent: SettingsIcon,
      ariaLabel: "Settings Menu",
      subItemsKey: "Settings",
    },
  ],
  Affiliates: [
    {
      id: "addAffiliate",
      IconComponent: AddIcon,
      ariaLabel: "Add New Affiliate",
      action: () => console.log("Trigger Add Affiliate UI"),
    },
    {
      id: "manageAffiliate",
      IconComponent: ManageIcon,
      ariaLabel: "Manage Affiliates",
      action: () => {
        setCurrentLevelKey("manageAffiliatesView"); // Transition to table view state
        fetchAffiliatesData();
      },
    },
    {
      id: "affiliateReports",
      IconComponent: ReportsIcon,
      ariaLabel: "Affiliate Reports",
      action: () => console.log("Show Affiliate Reports"),
    },
    {
      id: "affiliateBilling",
      IconComponent: BillingIcon,
      ariaLabel: "Affiliate Billing",
      action: () => console.log("Show Affiliate Billing"),
    },
  ],
  Clients: [
    {
      id: "addClient",
      IconComponent: AddIcon,
      ariaLabel: "Add New Client",
      action: () => console.log("Trigger Add Client UI"),
    },
    {
      id: "manageClient",
      IconComponent: ManageIcon,
      ariaLabel: "Manage Clients",
      action: () => console.log("Show Manage Clients Table/UI"),
    },
    // ... other client items
  ],
  Chat: [
    {
      id: "chatHistory",
      IconComponent: PlaceholderIcon,
      ariaLabel: "Chat History",
      action: () => console.log("Show Chat History"),
    },
    {
      id: "liveChat",
      IconComponent: PlaceholderIcon,
      ariaLabel: "Ask Me Anything",
      action: () => console.log("Open Live Chat"),
    },
  ],
  Settings: [
    {
      id: "preferences",
      IconComponent: PlaceholderIcon,
      ariaLabel: "Preferences",
      action: () => console.log("Show Preferences"),
    },
    {
      id: "security",
      IconComponent: PlaceholderIcon,
      ariaLabel: "Security Settings",
      action: () => console.log("Show Security Settings"),
    },
  ],
  Billing: [
    {
      id: "usage",
      IconComponent: PlaceholderIcon,
      ariaLabel: "Twilio Usage",
      action: () => console.log("Show Usage"),
    },
    {
      id: "subaccounts",
      IconComponent: PlaceholderIcon,
      ariaLabel: "Sub Accounts",
      action: () => console.log("Show Sub Accounts"),
    },
  ],
  // No 'manageAffiliatesView' here as it's not a card menu, but a specific view state
};

export default iconMap;
