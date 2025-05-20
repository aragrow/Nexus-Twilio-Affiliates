// src/components/workflowManage/interface.ts
export interface Client {
    iD: string;
    clientName: string;
  }
  
  export interface WorkFlow {
    iD: string;
    workflowName: string;
    workflowStatus: string;
    clientId: string; // ID of the associated client
    client?: { // Optional nested client object from GraphQL
      iD: string;
      clientName: string;
    };
    createdAt?: string;
    // totalCount?: number; // This would be part of the GraphQL response structure for nexusWorkflows
  }
  
  // Props for the main WorkFlowsView orchestrator
  export interface WorkFlowsViewParentProps {
    onEditWorkflowMeta: (workflowId: string) => void;
    onManageWorkflowSteps: (
      workflowId: string,
      workflowName: string,
      clientId: string
    ) => void;
  }