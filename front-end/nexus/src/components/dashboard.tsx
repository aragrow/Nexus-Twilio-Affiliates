// Dashboard.tsx
import React, { useState, useEffect } from "react";
import styles from "./dashboardStyles"; // Assuming this file exists and is correctly set up
import AffiliatesTable from "./affiliatesTable"; // Assuming this component exists
import ClientsTable from "./clientsTable"; // Assuming this component exists
import EntitiesTable from "./entitiesTable"; // Assuming this component exists
import WorkFlowBuilder from "./workFlowBuilder";
import AffiliateEditForm from "./affiliateEditForm";
import { gql, useQuery } from "@apollo/client";
import {
  GET_MANAGE_AFFILIATES,
  GET_MANAGE_CLIENTS,
  GET_CURRENT_USER_STATUS,
  GET_MANAGE_ENTITIES,
} from "./graphqlQueries";
import client from "./apolloClient"; // Already imported
import { ApolloProvider } from "@apollo/client";

import {
  PlaceholderIcon,
  HolderPowerIcon,
  HolderBackArrowIcon,
  HolderAffiliatesIcon,
  HolderClientsIcon,
  HolderEntitiesIcon,
  HolderChatIcon,
  HolderSettingsIcon,
  HolderAddIcon,
  HolderManageIcon,
  HolderWorkFlowIcon,
  HolderReportsIcon,
  HolderBillingIcon,
} from "./icons"; // Assuming this file exists and is correctly set up

import type { DashboardProps, NavItem } from "./interface"; // Assuming this file exists and is correctly set up

const BackArrowIcon = HolderBackArrowIcon;
const PowerIcon = HolderPowerIcon;
const AffiliatesIcon = HolderAffiliatesIcon;
const ClientsIcon = HolderClientsIcon;
const EntitiesIcon = HolderEntitiesIcon;
const ChatIcon = HolderChatIcon;
const SettingsIcon = HolderSettingsIcon;
const AddIcon = HolderAddIcon;
const ManageIcon = HolderManageIcon;
const WorkFlowIcon = HolderWorkFlowIcon;
const ReportsIcon = HolderReportsIcon;
const BillingIcon = HolderBillingIcon;
// --- End SVG Icon Placeholders ---

// --- Dashboard Component ---
const Dashboard: React.FC = () => {
  const { loading, error, data } = useQuery(GET_CURRENT_USER_STATUS, {
    fetchPolicy: "network-only", // Ensure it always hits the network
    onError: (apolloError) => {
      // The global errorLink should handle actual logout/redirect.
      // This onError is more for component-specific error UI if needed,
      // but often not necessary if errorLink is robust.
      console.log(
        "Dashboard initial auth query error (component level):",
        apolloError
      );
    },
  });

  const [showContent, setShowContent] = useState(false);

  const [currentLevelKey, setCurrentLevelKey] = useState<string>("root");
  const [userName, setUserName] = useState<string>("");
  const [isPowerButtonHovered, setIsPowerButtonHovered] = useState(false);
  const [isPowerButtonActive, setIsPowerButtonActive] = useState(false);

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
        id: "entitiesRoot",
        IconComponent: EntitiesIcon,
        ariaLabel: "Entities Menu",
        subItemsKey: "Entities",
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
          refetchAffiliates(); // Optionally refetch
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
        action: () => {
          setCurrentLevelKey("manageClientsView"); // Transition to table view state
          refetchClients(); // Optionally refetch
        },
      },
      {
        id: "manageWorkFlow",
        IconComponent: WorkFlowIcon,
        ariaLabel: "Manage WorkFlows",
        action: () => {
          setCurrentLevelKey("manageWorkflowsView"); // Transition to table view state
          refetchWorkflows(); // Optionally refetch
        },
      },
      // ... other client items
    ],
    Entities: [
      {
        id: "addEntity",
        IconComponent: AddIcon,
        ariaLabel: "Add New Entity",
        action: () => console.log("Trigger Add Entity UI"),
      },
      {
        id: "manageEntity",
        IconComponent: ManageIcon,
        ariaLabel: "Manage Entities",
        action: () => {
          setCurrentLevelKey("manageEntitiesView"); // Transition to table view state
          refetchEntities(); // Optionally refetch
        },
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
  }; // End iconMap

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data: affiliatesData,
    loading: affiliatesLoading,
    error: affiliatesError,
    refetch: refetchAffiliates,
  } = useQuery(GET_MANAGE_AFFILIATES, {
    skip: currentLevelKey !== "manageAffiliatesView",
  });

  const {
    data: clientsData,
    loading: clientsLoading,
    error: clientsError,
    refetch: refetchClients,
  } = useQuery(GET_MANAGE_CLIENTS, {
    skip: currentLevelKey !== "manageClientsView",
  });

  const {
    data: entitiesData,
    loading: entitiesLoading,
    error: entitiesError,
    refetch: refetchEntities,
  } = useQuery(GET_MANAGE_ENTITIES, {
    skip: currentLevelKey !== "manageEntitiesView",
  });

  const {
    data: workFlowsData,
    loading: workFlowsLoading,
    error: workFlowError,
    refetch: refetchWorkFlows,
  } = useQuery(GET_MANAGE_WORKFLOWS, {
    skip: currentLevelKey !== "manageWorkFlowsView",
  });

  const handleEdit = (id: string) => {
    setSelectedId(id);
  };

  const handleCloseEdit = () => {
    setSelectedId(null);
  };

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName") || "User"; // Default to "User"
    setUserName(storedUserName);
  }, []);

  const handleCardClick = (item: NavItem) => {
    if (item.action) {
      item.action(); // Execute direct action (like showing table or logging out)
    } else if (item.subItemsKey && iconMap[item.subItemsKey]) {
      setCurrentLevelKey(item.subItemsKey); // Navigate to next level of cards
    } else {
      console.warn(
        "NavItem clicked with no action and no valid subItemsKey:",
        item
      );
    }
  };

  const handleBack = () => {
    // More sophisticated back navigation might be needed for deeper levels
    if (iconMap[currentLevelKey] && currentLevelKey !== "root") {
      // Find parent (this is a simple way, assumes direct parentage or root)
      // For a true breadcrumb, you'd need a navigation stack
      let parentKey = "root";
      for (const key in iconMap) {
        if (iconMap[key].some((item) => item.subItemsKey === currentLevelKey)) {
          parentKey = key;
          break;
        }
      }
      setCurrentLevelKey(parentKey);
    } else {
      setCurrentLevelKey("root");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Assuming you store auth token
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    // Potentially redirect to login or reload to let WordPress handle auth
    window.location.reload();
  };

  const currentNavItems = iconMap[currentLevelKey] || [];
  const isRootLevel = currentLevelKey === "root";

  // Determine header title (for screen readers or minimal visual cue if any)
  let headerTitle = "Dashboard";
  if (!isRootLevel && iconMap[currentLevelKey]) {
    // Try to get a conceptual title from the current level key
    // This is a bit of a guess, for better UX, explicitly define titles
    headerTitle = currentLevelKey;
  }

  return (
    <div style={styles.body}>
      <div style={styles.dashboardContainer}>
        <div style={styles.dashboardHeader}>
          <button
            style={{
              ...styles.backButton,
              ...(isRootLevel ? styles.backButtonDisabled : {}),
            }}
            onClick={handleBack}
            disabled={isRootLevel}
            aria-label="Go Back"
          >
            <BackArrowIcon style={styles.headerIcon as React.CSSProperties} />{" "}
            {/* Cast if styles are generic */}
          </button>

          {/* Display headerTitle visually */}
          <h1
            style={
              styles.headerTitle || { fontSize: "1.5rem", margin: "0 1rem" }
            }
          >
            {headerTitle}
          </h1>

          <span style={styles.welcomeMessage} aria-live="polite">
            {/* For no-text, this would be an avatar or personalized visual element */}
            Welcome, {userName}!
          </span>

          <div
            title="Logout"
            aria-label="Logout"
            role="button"
            tabIndex={0}
            style={{
              ...styles.powerButton,
              ...(isPowerButtonHovered ? styles.powerButtonHover : {}),
              ...(isPowerButtonActive ? styles.powerButtonActive : {}),
            }}
            onClick={handleLogout}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleLogout();
            }}
            onMouseEnter={() => setIsPowerButtonHovered(true)}
            onMouseLeave={() => {
              setIsPowerButtonHovered(false);
              setIsPowerButtonActive(false);
            }}
            onMouseDown={() => setIsPowerButtonActive(true)}
            onMouseUp={() => setIsPowerButtonActive(false)}
          >
            <PowerIcon style={styles.headerIcon as React.CSSProperties} />{" "}
            {/* Cast if styles are generic */}
          </div>
        </div>
        <ApolloProvider client={client}>
          <div style={styles.dashboardMain}>
            {selectedId && (
              <AffiliateEditForm
                affiliateId={selectedId}
                onClose={handleCloseEdit}
              />
            )}
            {/* Render the table or cards based on current level */}
            {currentLevelKey == "manageAffiliatesView" ? (
              <AffiliatesTable
                affiliates={affiliatesData?.nexusAffiliates || []}
                isLoading={affiliatesLoading}
                isError={affiliatesError?.message}
                onEdit={(id) => console.log("Edit affiliate action:", id)}
                onClients={(id) =>
                  console.log("List of affiliates action:", id)
                }
              />
            ) : currentLevelKey == "manageClientsView" ? (
              <ClientsTable
                clients={clientsData?.nexusClients || []}
                isLoading={clientsLoading}
                isError={clientsError?.message}
                onEdit={(id) => console.log("Edit client action:", id)}
                onEntities={(id) => console.log("List of clients action:", id)}
              />
            ) : currentLevelKey == "manageEntitiesView" ? (
              <EntitiesTable
                entities={entitiesData?.nexusEntities || []}
                isLoading={entitiesLoading}
                isError={entitiesError?.message}
                onEdit={(id) => console.log("Edit entity action:", id)}
                onBilling={(id: string) =>
                  console.log("List of entity billing action:", id)
                }
              />
            ) : (
              <>
                {currentNavItems.map((item: NavItem) => (
                  <div
                    key={item.id}
                    style={styles.dashboardCard}
                    role="button"
                    tabIndex={0}
                    aria-label={item.ariaLabel}
                    onClick={() => handleCardClick(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handleCardClick(item);
                    }}
                    // Inline style effects for hover/active (can be moved to CSS classes)
                    onMouseDown={(e) =>
                      (e.currentTarget.style.transform =
                        (styles.dashboardCardActive as React.CSSProperties)
                          ?.transform || "scale(0.98)")
                    }
                    onMouseUp={(e) =>
                      (e.currentTarget.style.transform =
                        (styles.dashboardCard as React.CSSProperties)
                          ?.transform || "scale(1)")
                    }
                    onMouseEnter={(e) =>
                      Object.assign(
                        e.currentTarget.style,
                        styles.dashboardCardHover
                      )
                    }
                    onMouseLeave={(e) =>
                      Object.assign(
                        e.currentTarget.style,
                        styles.dashboardCard as React.CSSProperties
                      )
                    }
                  >
                    <item.IconComponent
                      style={styles.cardIcon as React.CSSProperties}
                    />
                    {/* If you ever need a fallback or small text label:
                  <span style={styles.cardLabel}>{item.ariaLabel.split(' ')[0]}</span> */}
                  </div>
                ))}
              </>
            )}
          </div>
        </ApolloProvider>
      </div>
    </div>
  );
};

export default Dashboard;
