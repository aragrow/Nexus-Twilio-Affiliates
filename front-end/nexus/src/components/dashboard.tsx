// Dashboard.tsx
import React, { useState, useEffect } from "react";
import styles from "./dashboardStyles"; // Assuming this file exists and is correctly set up
import AffiliatesTable from "./affiliatesTable"; // Assuming this component exists
import {
  PlaceholderIcon,
  HolderPowerIcon,
  HolderBackArrowIcon,
  HolderAffiliatesIcon,
  HolderClientsIcon,
  HolderChatIcon,
  HolderSettingsIcon,
  HolderAddIcon,
  HolderManageIcon,
  HolderReportsIcon,
  HolderBillingIcon,
} from "./icons"; // Assuming this file exists and is correctly set up
import type { NavItem, Affiliate } from "./interface"; // Assuming this file exists and is correctly set up

const BackArrowIcon = HolderBackArrowIcon;
const PowerIcon = HolderPowerIcon;
const AffiliatesIcon = HolderAffiliatesIcon;
const ClientsIcon = HolderClientsIcon;
const ChatIcon = HolderChatIcon;
const SettingsIcon = HolderSettingsIcon;
const AddIcon = HolderAddIcon;
const ManageIcon = HolderManageIcon;
const ReportsIcon = HolderReportsIcon;
const BillingIcon = HolderBillingIcon;
// --- End SVG Icon Placeholders ---

// --- Dashboard Component ---
const Dashboard: React.FC = () => {
  const [currentLevelKey, setCurrentLevelKey] = useState<string>("root");
  const [userName, setUserName] = useState<string>("");
  const [isPowerButtonHovered, setIsPowerButtonHovered] = useState(false);
  const [isPowerButtonActive, setIsPowerButtonActive] = useState(false);

  // State for Affiliates Table
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [isLoadingAffiliates, setIsLoadingAffiliates] =
    useState<boolean>(false);
  const [affiliatesError, setAffiliatesError] = useState<string | null>(null);

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
    // No 'manageAffiliatesView' here as it's not a card menu, but a specific view state
  };

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName") || "User"; // Default to "User"
    setUserName(storedUserName);
  }, []);

  const fetchAffiliatesData = async () => {
    setIsLoadingAffiliates(true);
    setAffiliatesError(null);
    setAffiliates([]); // Clear previous data

    const query = `
      query GetManageAffiliates {
        nexusAffiliates {
          iD
          companyName
          contactName
        }
      }
    `;

    try {
      const data = await fetchGraphQL<{ nexusAffiliates: Affiliate[] }>(query);
      setAffiliates(data.nexusAffiliates || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setAffiliatesError(error.message);
      } else {
        setAffiliatesError("Failed to load affiliates.");
      }
    } finally {
      setIsLoadingAffiliates(false);
    }
  };

  // --- GraphQL Helper (Keep this or replace with your GraphQL client) ---
  async function fetchGraphQL<T>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    const graphqlEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT;

    try {
      console.log("AuthToken: ", localStorage.getItem("authToken"));
      const response = await fetch(graphqlEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("authToken") && {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          }),
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("GraphQL request failed:", response.status, errorBody);
        throw new Error(`Network error: ${response.statusText} - ${errorBody}`);
      }

      const jsonResponse = await response.json();

      if (jsonResponse.errors && Array.isArray(jsonResponse.errors)) {
        console.error("GraphQL errors:", jsonResponse.errors);

        const errorMessages = jsonResponse.errors
          .map((err: { message?: string }) => err.message ?? "Unknown error")
          .join(", ");

        throw new Error(errorMessages);
      }

      return jsonResponse.data as T;
    } catch (error) {
      console.error("GraphQL request URL:", graphqlEndpoint);
      console.error("Fetch GraphQL Error:", error);
      throw error;
    }
  }

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
    if (currentLevelKey === "manageAffiliatesView") {
      setCurrentLevelKey("Affiliates"); // Go back to the Affiliates menu
    } else if (iconMap[currentLevelKey] && currentLevelKey !== "root") {
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
  const isAffiliatesTableVisible = currentLevelKey === "manageAffiliatesView";

  // Determine header title (for screen readers or minimal visual cue if any)
  let headerTitle = "Dashboard";
  if (isAffiliatesTableVisible) {
    headerTitle = "Manage Affiliates";
  } else if (!isRootLevel && iconMap[currentLevelKey]) {
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

        {isAffiliatesTableVisible ? (
          <div style={styles.dashboardMain}>
            <AffiliatesTable
              affiliates={affiliates}
              isLoading={isLoadingAffiliates}
              error={affiliatesError}
              onEdit={(id) => console.log("Edit affiliate action:", id)}
              onDelete={(id) => console.log("Delete affiliate action:", id)}
            />
          </div>
        ) : (
          <div style={styles.dashboardMain}>
            {currentNavItems.map((item: NavItem) => (
              <div
                key={item.id}
                style={styles.dashboardCard}
                role="button"
                tabIndex={0}
                aria-label={item.ariaLabel}
                onClick={() => handleCardClick(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleCardClick(item);
                }}
                // Inline style effects for hover/active (can be moved to CSS classes)
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform =
                    (styles.dashboardCardActive as React.CSSProperties)
                      ?.transform || "scale(0.98)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform =
                    (styles.dashboardCard as React.CSSProperties)?.transform ||
                    "scale(1)")
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
