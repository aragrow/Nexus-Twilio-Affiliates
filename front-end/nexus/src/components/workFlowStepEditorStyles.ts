// src/components/workFlowStepEditorStyles.ts
const editorStyles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    background: 'rgba(30, 35, 45, 0.9)', // Darker, more focused background
    color: '#e0e0e0',
    borderRadius: '12px', // Slightly more rounded
    minHeight: 'calc(100vh - 150px)',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(0, 174, 255, 0.2)', // Accent border
    width: '99vw',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(0, 174, 255, 0.3)', // Brighter accent border
  },
  title: {
    fontSize: '2em',
    margin: 0,
    color: '#00d0ff', // Bright cyan
    textShadow: '0 0 8px rgba(0, 208, 255, 0.7), 0 0 12px rgba(0, 208, 255, 0.5)',
  },
  button: {
    padding: '12px 22px',
    margin: '0 8px',
    cursor: 'pointer',
    borderRadius: '8px',
    border: '2px solid transparent', // Prepare for border change on hover
    fontWeight: 700, // Bolder
    fontSize: '15px',
    letterSpacing: '0.05em',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', // Smoother transition
    textTransform: 'uppercase',
  },
  saveButton: {
    backgroundColor: '#00d0ff', // Bright cyan
    color: '#12151c', // Dark background for contrast
    boxShadow: '0 4px 15px rgba(0, 208, 255, 0.3), inset 0 -2px 0px rgba(0,0,0,0.1)',
    '&:hover': {
      backgroundColor: '#00aeff',
      color: '#ffffff',
      boxShadow: '0 6px 20px rgba(0, 174, 255, 0.5), inset 0 -2px 0px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(1px)',
      boxShadow: '0 2px 10px rgba(0, 174, 255, 0.4)',
    },
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#00d0ff', // Text matches accent
    borderColor: 'rgba(0, 208, 255, 0.3)',
    '&:hover': {
      backgroundColor: 'rgba(0, 208, 255, 0.2)',
      borderColor: '#00d0ff',
      color: '#ffffff',
      transform: 'translateY(-2px)',
    },
     '&:active': {
      transform: 'translateY(1px)',
    },
  },
  dndContainer: {
    display: 'flex',
    gap: '30px', // Increased gap
  },
  column: {
    flex: 1,
    background: 'rgba(40, 45, 60, 0.7)',
    padding: '20px',
    borderRadius: '10px',
    minHeight: '450px',
    transition: 'background-color 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
    border: '2px dashed rgba(0, 174, 255, 0.2)', // Initial dashed border
    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.3)',
  },
  columnDragOver: { // Style for when an item is dragged OVER a droppable column
    background: 'rgba(0, 174, 255, 0.15)', // Brighter, more indicative background
    borderColor: '#00d0ff', // Solid, bright border
    borderStyle: 'solid',
    boxShadow: 'inset 0 0 25px rgba(0, 208, 255, 0.3), 0 0 15px rgba(0, 208, 255, 0.2)', // Inner and outer glow
  },
  columnTitle: {
    marginTop: 0,
    borderBottom: '1px solid rgba(0, 174, 255, 0.2)',
    paddingBottom: '15px',
    marginBottom: '20px',
    color: '#b0c0d0',
    fontSize: '1.3em', // Larger title
    fontWeight: 600,
    textAlign: 'center',
  },
  entityItem: {
    padding: '15px 20px', // More padding
    margin: '0 0 12px 0',
    background: 'linear-gradient(145deg, rgba(70, 78, 95, 0.85), rgba(55, 60, 75, 0.9))',
    borderRadius: '8px',
    userSelect: 'none' as 'none',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    cursor: 'grab',
    color: '#f0f0f0', // Brighter text
    fontSize: '1.05em',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative', // For potential pseudo-elements or effects
    overflow: 'hidden', // For effects like shining
    '&:hover': { // Hover effect when not dragging
        borderColor: 'rgba(0, 208, 255, 0.5)',
        background: 'linear-gradient(145deg, rgba(80, 88, 105, 0.9), rgba(65, 70, 85, 0.95))',
        transform: 'translateY(-2px) scale(1.01)',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.35)',
    }
  },
  entityItemDragging: { // Style for the item BEING DRAGGED
    transform: 'scale(1.08) rotate(2deg)', // Lift and slightly rotate
    background: 'linear-gradient(135deg, #00d0ff, #007bff)', // Vibrant gradient
    color: '#ffffff', // Bright text
    boxShadow: '0 10px 30px rgba(0, 174, 255, 0.4), 0 0 15px rgba(0, 208, 255, 0.3)', // Stronger glow and lift shadow
    opacity: 0.95, // Slightly transparent
    cursor: 'grabbing',
    zIndex: 100, // Ensure it's on top
  },
  entityItemAssigned: { // Style for items in the "assigned" list (can be subtly different)
    background: 'linear-gradient(145deg, rgba(60, 68, 85, 0.85), rgba(45, 50, 65, 0.9))', // Slightly different base
    borderColor: 'rgba(0, 174, 255, 0.15)', // Subtler accent
  },
  placeholder: {
    textAlign: 'center' as 'center',
    color: 'rgba(0, 174, 255, 0.4)', // Accent color for placeholder
    marginTop: '30px',
    fontStyle: 'italic',
    fontSize: '1.1em',
    padding: '20px',
    border: '2px dashed rgba(0, 174, 255, 0.2)',
    borderRadius: '8px',
  },
  loader: {
    padding: '30px',
    textAlign: 'center',
    fontSize: '1.4em',
    color: '#00d0ff',
    textShadow: '0 0 5px rgba(0, 208, 255, 0.5)',
  },
  errorMessage: {
    padding: '15px',
    margin: '15px 0',
    textAlign: 'center',
    color: '#ff8080', // Softer red for error
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    border: '1px solid rgba(255, 107, 107, 0.4)',
    borderRadius: '6px',
    fontSize: '1.1em',
  },
  actionContainer: {
    float: 'right',
    marginTop: '10px',
    marginRight: '10px',
  },
  entityMainInfo: {
    display: 'flex',
    alignItems: 'baseline', // Aligns the baseline of name and type
    width: '100%', // Take full width
    marginBottom: '5px', // Space before the phone number
  },
  entityName: { // Style for the name part specifically
    fontWeight: 600,
    marginRight: '8px', // Space between name and type
    flexGrow: 1, // Allow name to take available space if type is short
  },
  entityType: {
    fontSize: '0.8em',
    color: '#80a0c0',
    // marginLeft: '8px', // No longer needed if entityName handles margin
    fontStyle: 'italic',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '2px 6px',
    borderRadius: '4px',
    whiteSpace: 'nowrap', // Prevent type from wrapping if too long
  },
  phone: {
    fontSize: '0.9em',
    color: '#a0b0c0', // Slightly different color for phone
    marginTop: '4px', // Space above the phone number
    paddingLeft: '2px', // Small indent if desired
    width: '100%', // Ensure it takes its own line
  },
  };
  
  export default editorStyles;