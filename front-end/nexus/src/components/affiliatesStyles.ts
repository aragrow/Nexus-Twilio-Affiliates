// In dashboardStyles.ts (add these to your existing styles object)
// ... existing styles
const affiliatesStyles: { [key: string]: React.CSSProperties } = {
tableContainer: {
    width: '100%',
    overflowX: 'auto', // Important for smaller screens if table is wide
    margin: '0 0',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Dark theme table bg
    borderRadius: '8px',
    padding: '1px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    color: '#e0e0e0', // Light text for dark theme
  },
  tableHead: {
    backgroundColor: 'rgba(0, 174, 255, 0.2)', // Using your UI primary accent
  },
  tableHeader: {
    padding: '10px 5px',
    textAlign: 'left',
    fontWeight: 'bold',
    borderBottom: '2px solid var(--ui-primary-accent, #00aeff)',
    // For no-text UI, headers might be visually hidden but present for screen readers
    // position: 'absolute',
    // left: '-9999px',
    // top: 'auto',
    // width: '1px',
    // height: '1px',
    // overflow: 'hidden',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    '&:last-child': {
      borderBottom: 'none', // Remove border for last row 
    },
    backgroundColor: 'rgba(7, 7, 7, 0.8)',
    transition: 'background-color 0.3s ease',

  },
  tableCell: {
    padding: '5px 15px',
    opacity: 1,
    transition: 'background-color 0.3s ease, opacity 0.3s ease',
    textAlign: 'left', // Align action buttons to th
  },
  loader: {
    padding: '20px',
    textAlign: 'center',
    fontSize: '1.2em',
    color: '#e0e0e0',
  },
  errorMessage: {
    padding: '20px',
    textAlign: 'center',
    color: 'red', // Or your error color
    backgroundColor: 'rgba(255,0,0,0.1)',
    border: '1px solid red',
    borderRadius: '4px',
  },
  noDataMessage: {
    padding: '20px',
    textAlign: 'center',
    color: '#aaa',
  },
  actionButton: {
    backgroundColor: 'var(--ui-primary-accent, #00aeff)',
    color: 'var(--ui-bg-color, #1a1d24)',
    border: '1.5px solid transparent',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    letterSpacing: '0.03em',
    transition: 'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
    userSelect: 'none',

    // Subtle box-shadow for slight elevation, no glow
    boxShadow: '0 2px 6px rgba(0, 174, 255, 0.15)',
    '&:hover': {
      backgroundColor: 'transparent',
      borderColor: 'var(--ui-primary-accent, #00aeff)',
      color: 'var(--ui-primary-accent, #00aeff)',
      boxShadow: '0 4px 12px rgba(0, 174, 255, 0.25)',
    },
    '&:active': {
      backgroundColor: 'rgba(0, 174, 255, 0.1)',
      boxShadow: 'none',
    },
  },
  deleteButton: {
    backgroundColor: '#c0392b',
    color: '#fff',
    border: '1.5px solid transparent',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    letterSpacing: '0.03em',
    transition: 'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
    userSelect: 'none',
    boxShadow: '0 2px 6px rgba(192, 57, 43, 0.15)',
    '&:hover': {
      backgroundColor: 'transparent',
      borderColor: '#c0392b',
      color: '#c0392b',
      boxShadow: '0 4px 12px rgba(192, 57, 43, 0.25)',
    },
    '&:active': {
      backgroundColor: 'rgba(192, 57, 43, 0.1)',
      boxShadow: 'none',
    },
  },
  secondaryButton: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid #ccc",
    color: "#fff",
    fontWeight: 500,
    backdropFilter: "blur(4px)",
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px 0',
    userSelect: 'none', // Prevents text selection on rapid clicks
  },
  paginationButton: {
    background: 'var(--ui-element-bg, #2c303a)', // Use your theme variables
    color: 'var(--ui-text-color-light, #e0e0e0)',
    border: '1px solid var(--ui-primary-accent, #00aeff)',
    padding: '8px 12px',
    margin: '0 4px',
    borderRadius: 'var(--ui-border-radius-sm, 4px)',
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
    '&:hover:not(:disabled)': {
      backgroundColor: 'var(--ui-primary-accent, #00aeff)',
      color: 'var(--ui-bg-color, #1a1d24)',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  paginationButtonActive: {
    backgroundColor: 'var(--ui-primary-accent, #00aeff)',
    color: 'var(--ui-bg-color, #1a1d24)',
    fontWeight: 'bold',
    borderColor: 'var(--ui-primary-accent, #00aeff)',
  },
  paginationEllipsis: {
    margin: '0 8px',
    color: 'var(--ui-text-color-light, #e0e0e0)',
  },
  paginationInfo: {
    marginLeft: '15px',
    color: 'var(--ui-text-color-light, #e0e0e0)',
    fontSize: '0.9em',
  },
  clientsButton: { // Example style for the Clients button
      // Add specific styles or inherit from actionButton and override
      // backgroundColor: 'var(--ui-secondary-accent, #7e57c2)', // Example
  },
};

export default affiliatesStyles;