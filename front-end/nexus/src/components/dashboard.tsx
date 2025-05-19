// Dashboard.tsx
import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import { ApolloProvider, useQuery } from "@apollo/client"; // Group Apollo imports

// --- Component Imports ---
import AffiliatesView from "./affiliatesView";
import ClientsView from "./clientsView";
import EntitiesView from "./entitiesView";
import WorkFlowsView from "./workFlowsView";
import MaintainWorkFlowView from "./maintainWorkFlowView";
import AffiliateEditForm from "./affiliateEditForm"; // Assuming this is used, if not, remove
import { EditWorkFlowModal } from "./editWorkFlowModal"; // Assuming this is used

// --- GraphQL & API Imports ---
import client from "./apolloClient"; // Your Apollo client instance
import {
  GET_CURRENT_USER_STATUS,
  GET_MANAGE_AFFILIATES,
  GET_MANAGE_CLIENTS,
  GET_MANAGE_ENTITIES,
  GET_MANAGE_WORKFLOWS,
  GET_WORKFLOW,
} from "./graphqlQueries";

// --- Type Imports ---
import type { NavItem, WorkFlow } from "./interface"; // Group type imports

// --- Icon Imports & Assignments ---
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
  //HolderReportsIcon,
  //HolderBillingIcon
} from "./icons";
import styles from "./dashboardStyles";

const BackArrowIcon = HolderBackArrowIcon;
const PowerIcon = HolderPowerIcon;
const AffiliatesIcon = HolderAffiliatesIcon;
// ... (Assign all other icons similarly)
const ClientsIcon = HolderClientsIcon;
const EntitiesIcon = HolderEntitiesIcon;
const ChatIcon = HolderChatIcon;
const SettingsIcon = HolderSettingsIcon;
const AddIcon = HolderAddIcon;
const ManageIcon = HolderManageIcon;
const WorkFlowIcon = HolderWorkFlowIcon;
//const ReportsIcon = HolderReportsIcon;
//const BillingIcon = HolderBillingIcon;

// ========================================================================
// Custom Hook for Dashboard Navigation & Core Logic (Conceptual)
// In a real app, some of this might be further broken down or use Context/Redux
// ========================================================================
const useDashboardLogic = () => {
  const [currentLevelKey, setCurrentLevelKey] = useState<string>("root");
  const [userName, setUserName] = useState<string>("");
  const [selectedIdForEdit, setSelectedIdForEdit] = useState<string | null>(
    null
  ); // For general editing, e.g., AffiliateEditForm

  // --- Workflow Specific State ---
  const [editingWorkflow, setEditingWorkflow] = useState<{
    id: string;
    name: string;
    clientId: string;
  } | null>(null);
  const [isEditWorkFlowModalOpen, setIsEditWorkFlowModalOpen] = useState(false);
  const [selectedWorkFlowForModal, setSelectedWorkFlowForModal] =
    useState<WorkFlow | null>(null);

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName") || "User";
    setUserName(storedUserName);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    client.resetStore().finally(() => window.location.reload());
  }, []);

  const iconMap: { [key: string]: NavItem[] } = {
    // Defined inside hook or passed in if static
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
    ],
    Affiliates: [
      {
        id: "addAffiliate",
        IconComponent: AddIcon,
        ariaLabel: "Add New Affiliate",
        action: () => {
          /* TODO: setCurrentLevelKey('addAffiliateView'); setSelectedIdForEdit(null); */ console.log(
            "Add Aff"
          );
        },
      },
      {
        id: "manageAffiliate",
        IconComponent: ManageIcon,
        ariaLabel: "Manage Affiliates",
        action: () => setCurrentLevelKey("manageAffiliatesView"),
      },
      // ...
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
      // Moved workflow access to root for this example, adjust as needed
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
        action: () => setCurrentLevelKey("manageEntitiesView"),
      },
    ],
    Chat: [
      /* ... Chat items ... */
    ],
    Settings: [
      /* ... Settings items ... */
    ],
  };

  const handleCardClick = useCallback(
    (item: NavItem) => {
      setEditingWorkflow(null); // Reset workflow editing when navigating via cards
      setSelectedIdForEdit(null); // Reset general editing ID

      if (item.action) {
        item.action();
      } else if (item.subItemsKey && iconMap[item.subItemsKey]) {
        setCurrentLevelKey(item.subItemsKey);
      } else {
        console.warn("NavItem clicked with no action/subItemsKey:", item);
      }
    },
    [iconMap]
  ); // iconMap might need to be memoized if generated dynamically

  const handleBack = useCallback(() => {
    setEditingWorkflow(null); // Reset workflow editing on back
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
      currentLevelKey === "LoadWorkFlowsView" ||
      currentLevelKey === "MaintainWorkFlowView"
    )
      setCurrentLevelKey("root"); // Or a specific "Workflow" menu if it exists
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

  // --- Workflow Specific Handlers ---
  const handleNavigateToMaintainWorkflow = useCallback(
    (workflowId: string, workflowName: string, clientId: string) => {
      setEditingWorkflow({ id: workflowId, name: workflowName, clientId });
      // currentLevelKey remains 'LoadWorkFlowsView' or similar, sub-view changes
    },
    []
  );

  const handleExitMaintainWorkflow = useCallback(() => {
    setEditingWorkflow(null);
  }, []);

  const handleOpenEditWorkflowModal = useCallback(
    async (workflowId: string) => {
      // This refetch logic should ideally be part of a dedicated hook or service
      // For now, keeping it simple. Ensure `client` is your Apollo Client instance.
      try {
        const { data } = await client.query({
          query: GET_WORKFLOW,
          variables: { id: workflowId },
          fetchPolicy: "network-only", // Ensure fresh data
        });
        if (data?.nexusWorkFlow) {
          setSelectedWorkFlowForModal(data.nexusWorkFlow);
          setIsEditWorkFlowModalOpen(true);
        } else {
          console.error("Workflow not found for modal edit:", workflowId);
        }
      } catch (error) {
        console.error("Error fetching workflow for modal edit:", error);
      }
    },
    []
  );

  const handleCloseEditWorkflowModal = useCallback(() => {
    setIsEditWorkFlowModalOpen(false);
    setSelectedWorkFlowForModal(null);
  }, []);

  const handleSaveWorkflowFromModal = useCallback(
    async (updatedWorkFlow: WorkFlow) => {
      console.log("Saving workflow from modal:", updatedWorkFlow);
      // TODO: Implement GraphQL mutation to save workflow metadata
      // e.g., await updateWorkflowMutation({ variables: { id: updatedWorkFlow.iD, name: updatedWorkFlow.workflowName, ... } });
      setIsEditWorkFlowModalOpen(false);
      setSelectedWorkFlowForModal(null);
      // refetchWorkflows(); // Refetch the list after saving
    },
    [
      /* refetchWorkflows */
    ]
  );

  const handleSaveWorkflowSteps = useCallback(
    async (workflowId: string, updatedSteps: any /* Define StepType[] */) => {
      console.log(
        "Saving workflow steps (from MaintainWorkFlowView) for:",
        workflowId,
        updatedSteps
      );
      // TODO: Implement GraphQL mutation to save workflow steps
      // After saving, could navigate back or show success:
      // handleExitMaintainWorkflow();
    },
    [
      /* handleExitMaintainWorkflow */
    ]
  );

  return {
    currentLevelKey,
    userName,
    iconMap,
    handleCardClick,
    handleBack,
    handleLogout,
    selectedIdForEdit, // For general form editing
    setSelectedIdForEdit, // To set which item to edit (e.g. affiliate)

    // Workflow specific state and handlers
    editingWorkflow,
    handleNavigateToMaintainWorkflow,
    handleExitMaintainWorkflow,
    handleOpenEditWorkflowModal,
    handleCloseEditWorkflowModal,
    handleSaveWorkflowFromModal,
    selectedWorkFlowForModal,
    isEditWorkFlowModalOpen,
    handleSaveWorkflowSteps,
  };
};

// ========================================================================
// Dashboard Component
// ========================================================================
const Dashboard: React.FC = () => {
  // --- Initial Auth Check Query ---
  const { loading: authLoading, error: authError } = useQuery(
    GET_CURRENT_USER_STATUS,
    {
      fetchPolicy: "network-only",
      onError: (apolloError) =>
        console.log("Dashboard initial auth query error:", apolloError),
    }
  );

  // --- Use the Custom Hook for Dashboard Logic ---
  const {
    currentLevelKey,
    userName,
    iconMap,
    handleCardClick,
    handleBack,
    handleLogout,
    selectedIdForEdit,
    setSelectedIdForEdit, // For AffiliateEditForm example
    editingWorkflow,
    handleNavigateToMaintainWorkflow,
    handleExitMaintainWorkflow,
    handleOpenEditWorkflowModal,
    handleCloseEditWorkflowModal,
    handleSaveWorkflowFromModal,
    selectedWorkFlowForModal,
    isEditWorkFlowModalOpen,
    handleSaveWorkflowSteps,
  } = useDashboardLogic();

  // --- State for UI elements (can also be part of useDashboardLogic if preferred) ---
  const [isPowerButtonHovered, setIsPowerButtonHovered] = useState(false);
  const [isPowerButtonActive, setIsPowerButtonActive] = useState(false);

  // --- Data Fetching Hooks (Conditional based on currentLevelKey) ---
  // These remain in the main component as they are tied to its rendering lifecycle based on currentLevelKey
  const {
    data: affiliatesData,
    loading: affiliatesLoading,
    error: affiliatesError,
  } = useQuery(GET_MANAGE_AFFILIATES, {
    skip: currentLevelKey !== "manageAffiliatesView",
  });
  const {
    data: clientsData,
    loading: clientsLoading,
    error: clientsError,
  } = useQuery(GET_MANAGE_CLIENTS, {
    skip: currentLevelKey !== "manageClientsView",
  });
  const {
    data: entitiesData,
    loading: entitiesLoading,
    error: entitiesError,
  } = useQuery(GET_MANAGE_ENTITIES, {
    skip: currentLevelKey !== "manageEntitiesView",
  });
  const {
    data: workFlowsData,
    loading: workFlowsLoading,
    error: workFlowsError,
  } = useQuery(GET_MANAGE_WORKFLOWS, {
    skip: currentLevelKey !== "LoadWorkFlowsView" && !editingWorkflow,
  });
  // Note: GET_WORKFLOW for a single workflow details might be better fetched *inside* EditWorkFlowModal or MaintainWorkFlowView

  // --- Render Helper for Main Content ---
  const renderMainContent = () => {
    if (authLoading) return <div style={styles.loader}>Authenticating...</div>;
    if (authError)
      return (
        <div style={styles.errorMessage}>
          Authentication Failed. Please try logging in again.
        </div>
      ); // ErrorLink should redirect

    // General Edit Form (Example for Affiliates)
    if (selectedIdForEdit && currentLevelKey === "addAffiliateView") {
      // Assuming 'addAffiliateView' is a key
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
              setSelectedIdForEdit(id);
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
          return (
            <MaintainWorkFlowView
              workflowId={editingWorkflow.id}
              workflowName={editingWorkflow.name}
              clientId={editingWorkflow.clientId}
              // Pass its own loading/error states if MaintainWorkFlowView fetches its own steps
              isLoading={false} // Replace with actual loading state for steps
              isError={null} // Replace with actual error state for steps
              onSave={handleSaveWorkflowSteps}
              onBack={handleExitMaintainWorkflow}
            />
          );
        }
        return (
          <WorkFlowsView
            workFlows={workFlowsData?.nexusWorkFlows || []}
            isLoading={workFlowsLoading}
            isError={workFlowsError?.message}
            onEdit={handleOpenEditWorkflowModal} // Opens modal for name/status
            onManageWorkflowSteps={handleNavigateToMaintainWorkflow} // Switches to D&D editor
          />
        );
      // Other cases for 'Chat', 'Settings' sub-menus can be added here
      // Default to card navigation for 'root' or other menu levels
      default:
        const navItems = iconMap[currentLevelKey] || [];
        if (navItems.length === 0 && currentLevelKey !== "root") {
          return (
            <div style={styles.noDataMessage}>
              Section not implemented yet or no items for '{currentLevelKey}'.
            </div>
          );
        }
        return navItems.map((item: NavItem) => (
          <div
            key={item.id}
            style={styles.dashboardCard}
            role="button"
            tabIndex={0}
            aria-label={item.ariaLabel}
            onClick={() => handleCardClick(item)}
            // ... (rest of card interaction styles/handlers)
          >
            <item.IconComponent
              style={styles.cardIcon as React.CSSProperties}
            />
          </div>
        ));
    }
  };

  const isRootLevel = currentLevelKey === "root";
  const headerTitle = isRootLevel
    ? "Dashboard"
    : currentLevelKey
        .replace(/View$/, "")
        .replace(/([A-Z])/g, " $1")
        .trim();

  return (
    <div style={styles.body}>
      <div style={styles.dashboardContainer}>
        {/* Header */}
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
            {headerTitle}
          </h1>
          <span style={styles.welcomeMessage} aria-live="polite">
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
            <PowerIcon style={styles.headerIcon as React.CSSProperties} />
          </div>
        </div>

        {/* Main Content Area - Now wrapped in ApolloProvider if needed by children consistently */}
        {/* If only some children need it, wrap them individually or ensure client is passed via context */}
        {/* For simplicity, assuming children might make their own queries or use mutations */}
        <ApolloProvider client={client}>
          <div style={styles.dashboardMain}>{renderMainContent()}</div>
        </ApolloProvider>

        {/* Edit Workflow Modal */}
        {isEditWorkFlowModalOpen && selectedWorkFlowForModal && (
          <EditWorkFlowModal
            workflow={selectedWorkFlowForModal}
            isOpen={isEditWorkFlowModalOpen}
            onClose={handleCloseEditWorkflowModal}
            onSave={handleSaveWorkflowFromModal}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
