// src/components/dashboard.tsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ApolloProvider, useQuery, useMutation } from "@apollo/client"; // Added useMutation for mutations

// --- Component Imports ---
import AffiliatesView from "./affiliatesView";
import ClientsView from "./clientsView";
import EntitiesView from "./EntitiesView";
import EntityAdd from "./EntityAdd";
import WorkFlowsView from "./workFlowsView";
import WorkflowDetailsEditor from "./WorkflowDetailsEditor";
// import MaintainWorkFlowView from "./maintainWorkFlowView"; // No longer used for steps
import WorkFlowStepEditor from "./WorkFlowStepEditor"; // <--- IMPORT NEW COMPONENT
import AffiliateEditForm from "./affiliateEditForm";
import HamburgerMenu from "./HamburgerMenuProps";

// --- GraphQL & API Imports ---
import client from "./apolloClient";
import {
  GET_CURRENT_USER_STATUS,
  GET_MANAGE_AFFILIATES,
  GET_MANAGE_CLIENTS,
  GET_MANAGE_ENTITIES,
  GET_MANAGE_WORKFLOWS,
} from "./graphqlQueries";

// --- Type Imports ---
import type {
  NavItem,
  WorkFlow,
  WorkFlowStepInput,
  workFlowDetailInput,
} from "./interface"; // Added WorkFlowStepInput

// ... (Icon imports and assignments remain the same) ...
import {
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
  HolderBillingIcon,
  HolderHamburgerIcon,
} from "./icons";
import styles from "./dashboardStyles";

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
const BillingIcon = HolderBillingIcon;
const HamburgerIcon = HolderHamburgerIcon;

// Add to Dashboard component state
const [isMenuOpen, setIsMenuOpen] = useState(false);

// ========================================================================
// Custom Hook for Dashboard Navigation & Core Logic
// ========================================================================
const useDashboardLogic = () => {
  const [currentLevelKey, setCurrentLevelKey] = useState<string>("root");
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [selectedIdForEdit, setSelectedIdForEdit] = useState<string | null>(
    null
  );

  const [editingWorkflow, setEditingWorkflow] = useState<{
    id: string;
    name: string;
    clientiD: string;
  } | null>(null);

  const [editingWorkflowDetails, setEditingWorkflowDetails] = useState<{
    id: string;
    name: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName") || "User";
    setUserName(storedUserName);
    const storedUserRole = localStorage.getItem("userRole") || "Role";
    setUserRole(storedUserRole);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    client.resetStore().finally(() => window.location.reload());
  }, []);

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
        id: "workflowRoot",
        IconComponent: WorkFlowIcon,
        ariaLabel: "Workflow Management",
        action: () => setCurrentLevelKey("LoadWorkFlowsView"),
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
      {
        id: "billingRoot",
        IconComponent: BillingIcon,
        ariaLabel: "Billing Menu+",
        subItemsKey: "Billing",
      },
    ],
    Affiliates: [
      {
        id: "addAffiliate",
        IconComponent: AddIcon,
        ariaLabel: "Add New Affiliate",
        action: () => {
          console.log(
            "Add Aff"
          ); /* TODO: setCurrentLevelKey('addAffiliateView'); setSelectedIdForEdit(null); */
        },
      },
      {
        id: "manageAffiliate",
        IconComponent: ManageIcon,
        ariaLabel: "Manage Affiliates",
        action: () => setCurrentLevelKey("manageAffiliatesView"),
      },
    ],
    Clients: [
      {
        id: "addClient",
        IconComponent: AddIcon,
        ariaLabel: "Add New Client",
        action: () => console.log("Add Client"),
      },
      {
        id: "manageClient",
        IconComponent: ManageIcon,
        ariaLabel: "Manage Clients",
        action: () => setCurrentLevelKey("manageClientsView"),
      },
    ],
    Entities: [
      {
        id: "addEntity",
        IconComponent: AddIcon,
        ariaLabel: "Add New Entity",
        action: () => {
          console.log("Triggering Add Entity UI");
          setCurrentLevelKey("addEntityView");
          // This will trigger the EntitiesView component with mode="add"
          // We need to modify EntitiesView to accept an initialMode prop
        },
      },
      {
        id: "manageEntity",
        IconComponent: ManageIcon,
        ariaLabel: "Manage Entities",
        action: () => setCurrentLevelKey("manageEntitiesView"),
      },
    ],
    Chat: [
      /* ... Chat items ... */
    ],
    Settings: [
      /* ... Settings items ... */
    ],
    Billing: [],
  };

  const handleCardClick = useCallback(
    (item: NavItem) => {
      setEditingWorkflow(null);
      setEditingWorkflowDetails(null);
      setSelectedIdForEdit(null);
      if (item.action) {
        item.action();
      } else if (item.subItemsKey && iconMap[item.subItemsKey]) {
        setCurrentLevelKey(item.subItemsKey);
      } else {
        console.warn("NavItem clicked with no action/subItemsKey:", item);
      }
    },
    [iconMap]
  ); // iconMap is stable if defined outside or memoized

  const handleBack = useCallback(() => {
    setEditingWorkflow(null);
    setEditingWorkflowDetails(null);
    setSelectedIdForEdit(null);

    if (
      currentLevelKey === "manageAffiliatesView" ||
      currentLevelKey === "addAffiliateView"
    )
      setCurrentLevelKey("Affiliates");
    else if (currentLevelKey === "manageClientsView")
      setCurrentLevelKey("Clients");
    else if (currentLevelKey === "manageEntitiesView")
      setCurrentLevelKey("Entities");
    else if (
      currentLevelKey ===
      "LoadWorkFlowsView" /* Removed MaintainWorkFlowView condition directly */
    )
      setCurrentLevelKey("root");
    else if (iconMap[currentLevelKey] && currentLevelKey !== "root") {
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
  }, [currentLevelKey, iconMap]);

  const handleNavigateToMaintainWorkflow = useCallback(
    (workflowId: string, workflowName: string, clientId: string) => {
      console.log("handleNavigateToMaintainWorkflow");
      setEditingWorkflow({
        id: workflowId,
        name: workflowName,
        clientId,
      });
      // currentLevelKey remains 'LoadWorkFlowsView', the content within it changes
    },
    []
  );

  const handleEditWorkflowDetails = useCallback(
    (workflowId: string, workflowName: string, clientId: string) => {
      console.log("handleEditWorkflowDetails");
      setEditingWorkflowDetails({
        id: workflowId,
        name: workflowName,
        clientId,
      });
      // currentLevelKey remains 'LoadWorkFlowsView', the content within it changes
    },
    []
  );

  const handleExitMaintainWorkflowDetail = useCallback(() => {
    console.log("handleExitMaintainWorkflowDetail");
    setEditingWorkflowDetails(null);
    // currentLevelKey should remain 'LoadWorkFlowsView' to show the list again
  }, []);

  const handleExitMaintainWorkflow = useCallback(() => {
    console.log("handleExitMaintainWorkflow");
    setEditingWorkflow(null);
    // currentLevelKey should remain 'LoadWorkFlowsView' to show the list again
  }, []);
  /*  MOVE TO THE WORKFLOWDETAILEDITOR   ************************************************   TODO
  const handleSaveWorkflowDetail = useCallback(
    async (workflowId: string, updatedDetails: workFlowDetailInput[]) => {
      console.log(
        "Dashboard: Attempting to save steps for workflow:",
        workflowId,
        updatedDetails
      );

      try {
        const { data } = await updateWorkfloDetailMutation({
          variables: {
            workflowId,
            details: updatedDetails,
          },
          refetchQueries: [{ query: GET_MANAGE_WORKFLOWS, variables: {} }],
        });

        console.log("Workflow details saved successfully:", data);

        if (data?.updateWorkflowDetails?.success) {
          // Show success notification
          alert(
            data.updateWorkflowDetails.message ||
              "Workflow steps saved successfully!"
          );
          handleExitMaintainWorkFlowDetail(); // Go back to the list view
        } else {
          // Show error notification
          alert(
            data?.updateWorkflowDetails?.message ||
              "Error saving workflow steps"
          );
        }
      } catch (err) {
        console.error("Failed to save detail steps:", err);
        alert(
          `Error saving steps: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      }
    },
    [updateWorkflowStepsMutation, handleExitMaintainWorkflowDetail]
  );
*/
  return {
    currentLevelKey,
    userName,
    userRole,
    iconMap,
    handleCardClick,
    handleBack,
    handleLogout,
    selectedIdForEdit,
    setSelectedIdForEdit,
    editingWorkflow,
    editingWorkflowDetails,
    handleEditWorkflowDetails,
    handleNavigateToMaintainWorkflow,
    handleExitMaintainWorkflow,
    handleExitMaintainWorkflowDetail,
  };
};

// ========================================================================
// Dashboard Component
// ========================================================================
const Dashboard: React.FC<{
  userId: string | null; // Added props based on App.tsx usage
  userName: string | null;
  userRole: string | null;
  onLogout: () => void; // Added props based on App.tsx usage
}> = ({
  userId,
  userName: initialUserName,
  userRole: initialUserRole,
  onLogout,
}) => {
  // Added props
  const { loading: authLoading, error: authError } = useQuery(
    GET_CURRENT_USER_STATUS,
    {
      fetchPolicy: "network-only",
      onError: (apolloError) =>
        console.log("Dashboard initial auth query error:", apolloError),
    }
  );

  const {
    currentLevelKey,
    userName, // This comes from localStorage in the hook
    userRole,
    iconMap,
    handleCardClick,
    handleBack,
    // handleLogout, // Use onLogout prop from App.tsx
    selectedIdForEdit,
    setSelectedIdForEdit,
    editingWorkflow,
    editingWorkflowDetails,
    handleEditWorkflowDetails,
    handleNavigateToMaintainWorkflow,
    handleExitMaintainWorkflow,
    handleExitMaintainWorkflowDetail,
  } = useDashboardLogic();

  const [isPowerButtonHovered, setIsPowerButtonHovered] = useState(false);
  const [isPowerButtonActive, setIsPowerButtonActive] = useState(false);

  // Data fetching for list views (Affiliates, Clients, Entities)
  // WorkFlowsView now fetches its own data.
  const isAffiliate = userRole?.toLowerCase() === "nexus_affiliate";
  const isClient = userRole?.toLowerCase() === "nexus_client";

  const {
    data: affiliatesData,
    loading: affiliatesLoading,
    error: affiliatesError,
  } = useQuery(GET_MANAGE_AFFILIATES, {
    skip: currentLevelKey !== "manageAffiliatesView",
  });

  //If there's any chance userId could be undefined or malformed (e.g., before login),  guards the decoding
  const dbUserId = useMemo(() => {
    try {
      return atob(userId).split(":")[1];
    } catch (e) {
      return null;
    }
  }, [userId]);

  const {
    data: clientsData,
    loading: clientsLoading,
    error: clientsError,
  } = useQuery(GET_MANAGE_CLIENTS, {
    skip: currentLevelKey !== "manageClientsView",
    variables: {
      affiliateId: isAffiliate ? dbUserId : null,
    },
  });

  const {
    data: entitiesData,
    loading: entitiesLoading,
    error: entitiesError,
  } = useQuery(GET_MANAGE_ENTITIES, {
    skip: currentLevelKey !== "manageEntitiesView",
    variables: {
      affiliateId: isAffiliate ? dbUserId : null,
      clientId: isClient ? dbUserId : null,
    },
  });

  const {
    data: workflowsData,
    loading: workflowsLoading,
    error: workflowsError,
  } = useQuery(GET_MANAGE_WORKFLOWS, {
    skip: currentLevelKey !== "LoadWorkFlowsView",
    variables: {
      affiliateId: isAffiliate ? dbUserId : null,
      clientId: isClient ? dbUserId : null,
    },
  });
  // Removed workFlowsData query from here as WorkFlowsView handles its own data.

  const renderMainContent = () => {
    if (authLoading) return <div style={styles.loader}>Authenticating...</div>;
    if (authError)
      return (
        <div style={styles.errorMessage}>
          Authentication Failed. Please try logging in again.
        </div>
      );

    if (selectedIdForEdit && currentLevelKey === "addAffiliateView") {
      // Example for general edit form
      return (
        <AffiliateEditForm
          affiliateId={selectedIdForEdit}
          onClose={() => setSelectedIdForEdit(null)}
        />
      );
    }

    switch (currentLevelKey) {
      case "manageAffiliatesView":
        return (
          <AffiliatesView
            affiliates={affiliatesData?.nexusAffiliates || []}
            isLoading={affiliatesLoading}
            isError={affiliatesError?.message}
            onEdit={(id) => {
              console.log("Edit Affiliate", id);
              setSelectedIdForEdit(
                id
              ); /* Consider setCurrentLevelKey('editAffiliateView') */
            }}
            onClients={(id) => console.log("List of clients action:", id)}
          />
        );
      case "manageClientsView":
        return (
          <ClientsView
            clients={clientsData?.nexusClients || []}
            isLoading={clientsLoading}
            isError={clientsError?.message}
            onEdit={(id) => console.log("Edit client action:", id)}
            onEntities={(id) => console.log("List of entities for client:", id)}
          />
        );
      case "addEntityView":
        return (
          <EntityAdd
            isLoading={entitiesLoading}
            isError={entitiesError?.message}
            onEdit={(id) => console.log("Edit entity action:", id)}
            onBilling={(id: string) => console.log("Billing for entity:", id)}
          />
        );
      case "manageEntitiesView":
        return (
          <EntitiesView
            entities={entitiesData?.nexusEntities || []}
            isLoading={entitiesLoading}
            isError={entitiesError?.message}
            onEdit={(id) => console.log("Edit entity action:", id)}
            onBilling={(id: string) => console.log("Billing for entity:", id)}
          />
        );

      case "LoadWorkFlowsView":
        if (editingWorkflow) {
          // Render the step editor if a workflow is selected for editing steps
          return (
            <WorkFlowStepEditor
              workflowId={editingWorkflow.id}
              workflowName={editingWorkflow.name}
              clientId={editingWorkflow.clientId}
              onBack={handleExitMaintainWorkflow}
            />
          );
        }
        if (editingWorkflowDetails) {
          // Render the step editor if a workflow is selected for editing steps
          return (
            <WorkflowDetailsEditor
              workflowId={editingWorkflowDetails.id}
              workflowName={editingWorkflowDetails.name}
              clientId={editingWorkflowDetails.clientId}
              onBack={handleExitMaintainWorkflowDetail}
            />
          );
        }
        // Otherwise, render the list of workflows
        return (
          <WorkFlowsView
            // WorkFlowsView now fetches its own data and doesn't need workFlows, isLoading, isError props from here.
            // It only needs handlers for actions.
            workflows={workflowsData?.nexusWorkFlows || []}
            isLoading={workflowsLoading}
            isError={workflowsError?.message}
            onEditWorkflowMeta={handleEditWorkflowDetails} // For editing
            onManageWorkflowSteps={handleNavigateToMaintainWorkflow} // For navigating to step editor
          />
        );

      default:
        const navItems = iconMap[currentLevelKey] || [];
        if (navItems.length === 0 && currentLevelKey !== "root") {
          return (
            <div style={styles.noDataMessage}>
              Section not implemented yet or no items for '{currentLevelKey}'.
            </div>
          );
        }

        return navItems.map((item: NavItem) => {
          if (
            userRole.toLowerCase().includes("affiliate") &&
            item.ariaLabel.toLowerCase().includes("affiliate")
          ) {
            return null;
          } else if (
            userRole.toLowerCase().includes("client") &&
            (item.ariaLabel.toLowerCase().includes("affiliate") ||
              item.ariaLabel.toLowerCase().includes("client"))
          ) {
            return null;
          }

          return (
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
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.98)")
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseEnter={(e) =>
                Object.assign(e.currentTarget.style, styles.dashboardCardHover)
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
            </div>
          );
        });
    }
  };

  const isRootLevel = currentLevelKey === "root" && !editingWorkflow; // Also check editingWorkflow for title
  let headerTitleText = "Dashboard";
  if (editingWorkflow && currentLevelKey === "LoadWorkFlowsView") {
    headerTitleText = `Editing Steps: ${editingWorkflow.name}`;
  } else if (!isRootLevel) {
    headerTitleText = currentLevelKey
      .replace(/View$/, "")
      .replace(/([A-Z])/g, " $1")
      .trim();
    if (currentLevelKey === "LoadWorkFlowsView")
      headerTitleText = "Manage Workflows";
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
            <BackArrowIcon style={styles.headerIcon as React.CSSProperties} />
          </button>
          <h1
            style={
              styles.headerTitle || { fontSize: "1.5rem", margin: "0 1rem" }
            }
          >
            {headerTitleText}
          </h1>
          <span style={styles.welcomeMessage} aria-live="polite">
            Welcome, {userName || initialUserName}! ({" "}
            {userRole || initialUserRole} )
          </span>{" "}
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              marginRight: "10px",
            }}
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open Menu"
          >
            <HamburgerIcon style={styles.headerIcon as React.CSSProperties} />
          </button>
          {/* Use initialUserName from props as fallback */}
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
            onClick={onLogout} // Use onLogout from props
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onLogout();
            }}
            onMouseEnter={() => setIsPowerButtonHovered(true)}
            onMouseLeave={() => {
              setIsPowerButtonHovered(false);
              setIsPowerButtonActive(false);
            }}
            onMouseDown={() => setIsPowerButtonActive(true)}
            onMouseUp={() => setIsPowerButtonActive(false)}
          >
            <PowerIcon style={styles.headerIcon as React.CSSProperties} />
          </div>
        </div>
        <HamburgerMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          navItems={iconMap[currentLevelKey] || iconMap.root}
          userRole={userRole}
          handleCardClick={handleCardClick}
        />
        <ApolloProvider client={client}>
          {" "}
          {/* Ensure client is available to children */}
          <div style={styles.dashboardMain}>{renderMainContent()}</div>
        </ApolloProvider>
      </div>
    </div>
  );
};

export default Dashboard;
