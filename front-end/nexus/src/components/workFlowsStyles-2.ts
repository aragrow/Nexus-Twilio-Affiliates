// src/components/workflowManage/workflowManageStyles.ts

const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as 'column', // Important for TypeScript with flex properties
      padding: '20px',
      fontFamily: 'Arial, sans-serif', // Replace with your futuristic font
      backgroundColor: '#1a1d24', // Dark theme from your UI wrapper
      color: '#e0e0e0',
      borderRadius: '8px',
      maxWidth: '900px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '20px',
    },
    clientSearchContainer: {
      position: 'relative' as 'relative', // For dropdown results positioning
      marginBottom: '20px',
    },
    searchInput: {
      width: '100%',
      padding: '10px 15px',
      fontSize: '1rem',
      border: '1px solid #444',
      borderRadius: '4px',
      backgroundColor: '#2c303a',
      color: '#e0e0e0',
      boxSizing: 'border-box' as 'border-box',
      // Add futuristic styling, maybe a subtle glow on focus
    },
    searchResultsDropdown: {
      position: 'absolute' as 'absolute',
      width: '100%',
      maxHeight: '200px',
      overflowY: 'auto' as 'auto',
      backgroundColor: '#2c303a',
      border: '1px solid #555',
      borderTop: 'none',
      borderRadius: '0 0 4px 4px',
      zIndex: 1000,
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    },
    searchResultItem: {
      padding: '10px 15px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#00aeff', // Your primary accent
        color: '#1a1d24',
      },
    },
    columnsContainer: {
      display: 'flex',
      gap: '20px',
      justifyContent: 'space-between',
    },
    column: {
      flex: 1,
      padding: '15px',
      backgroundColor: '#2c303a',
      borderRadius: '6px',
      border: '1px solid #444',
      minHeight: '300px', // Ensure droppable area has height
    },
    columnTitle: {
      margin: '0 0 15px 0',
      fontSize: '1.2rem',
      color: '#00aeff', // Primary accent
      borderBottom: '1px solid #444',
      paddingBottom: '10px',
    },
    entityList: {
      minHeight: '250px', // Space for dropping
      // Styling for when dragging over this droppable
    },
    entityItem: {
      display: 'flex',
      alignItems: 'center' as 'center',
      justifyContent: 'space-between' as 'justify-content',
      padding: '10px',
      marginBottom: '8px',
      backgroundColor: '#3b4049',
      borderRadius: '4px',
      border: '1px solid #555',
      cursor: 'grab',
      // Styling for when this item is being dragged
    },
    entityName: {
      flexGrow: 1,
    },
    checkboxContainer: {
      // Styles for checkbox
    },
    checkbox: {
      width: '20px',
      height: '20px',
      cursor: 'pointer',
      // Custom checkbox styles for futuristic look
    },
    // Add styles for loader, error messages etc.
    loader: {
      textAlign: 'center' as 'center',
      padding: '20px',
    },
    errorMessage: {
      color: 'red',
      textAlign: 'center' as 'center',
      padding: '10px',
    }
  };
  
  export default styles;