const styles: { [key: string]: React.CSSProperties } = {
  body: {
    margin: 0,
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    background: 'linear-gradient(to right, #f5f7fa, #c3cfe2)',
    color: '#2c3e50',
    display: 'flex', 
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
  },
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    textAlign: 'center',
    background: 'linear-gradient(to right,rgb(72, 139, 240), #c3cfe2)',
    padding: '0 2rem',
    boxSizing: 'border-box',
  },
  dashboardHeader: {
    background: 'linear-gradient(to right, #2c3e50, #4ca1af)',
    color: '#ecf0f1',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '.5rem 2rem',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    width: '100%',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    borderBottom: '2px solid #bdc3c7',
    backdropFilter: 'blur(10px)',
    borderRadius: '1px 1px 0px 0px',
    boxSizing: 'border-box',
    fontSize: '1.2rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    transition: 'background 0.3s ease, box-shadow 0.3s ease',
  },
  backButton: {
    backgroundColor: 'linear-gradient(135deg, #6a11cb, #2575fc)',
    color: '#fff',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '200px 0 0 200px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.4s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  backButtonHover: {
    backgroundColor: 'linear-gradient(135deg, #2575fc, #6a11cb)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
    transform: 'translateY(-3px)',
  },
  backButtonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed',
    boxShadow: 'none',
    opacity: 0.6,
  },
  dashboardTitle: {
    margin: 0,
    fontSize: '2.2rem',
    fontWeight: 700,
  },
  welcomeMessage: {
    fontSize: '1.1rem',
    fontWeight: 500,
    float: 'right',
    marginRight: '2rem',
  },
  dashboardMain: {
    marginTop: '4.5rem', // Start with a value slightly larger than estimated header height (e.g., 5rem from header padding/content + 1rem buffer). Adjust as needed.
    position: 'relative',
    background: 'linear-gradient(to right, #f5f7fa, #c3cfe2)',
    backgroundImage: `url('http://localhost:5173/src/assets/dashboard-background.jpg'), linear-gradient(to right, #f5f7fa, #c3cfe2)`,
    backgroundRepeat: 'round',
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'top',
    flexWrap: 'wrap',
    gap: '2rem',
    padding: '1rem',
    flexGrow: 1,
    //background: 'radial-gradient(circle at top left, #ffffff, #dfe9f3)',
    width: '93vw',
    height: '100vw',
    overflow: 'scroll',
  },
  dashboardCard: {
    background: 'linear-gradient(135deg, rgba(194, 194, 194, 0.02), rgba(241, 242, 246, 0.02))',
    border: '2px solid #bdc3c7',
    borderRadius: '16px',
    padding: '2rem',
    textAlign: 'center',
    fontSize: '1.3rem',
    fontWeight: 900,
    color: '#FFDD57',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease, color 0.3s ease, border-color 0.3s ease, background 0.3s ease',
    cursor: 'pointer',
    backdropFilter: 'blur(5px)',
    width: '200px',
    height: '200px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardCardHover: {
    transform: 'translateY(-6px) scale(1.05)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
    borderColor: '#3498db',
    color: '#000000',
    background: 'linear-gradient(135deg, rgba(236, 240, 241, 0.1), rgba(208, 211, 212, 0.1))',
  },
  dashboardCardActive: {
    transform: 'scale(0.97)',
    boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.1)',
    borderColor: '#2980b9',
    background: 'linear-gradient(135deg, #d6eaf8, #aed6f1)',
  },
  dashboardAffiliateCard: {
    backgroundImage: `url('http://localhost:5173/src/assets/affiliates-background.jpg'), linear-gradient(to right, #f5f7fa, #c3cfe2)`,
  },
  powerButton: {
    float: 'right',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at center, #3cc0f0 0%, #0a8ac7 40%, #0e0e0e 100%)',
    border: '6px solid #a0c4d6',
    boxShadow: `
      inset 0 0 10px #3cc0f0,
      0 0 20px rgba(0, 255, 255, 0.2),
      0 0 40px rgba(0, 255, 255, 0.2)
    `,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  powerButtonHover: {
    transform: 'scale(1.05)',
    boxShadow: `
      inset 0 0 20px #6de0ff,
      0 0 30px rgba(0, 255, 255, 0.4),
      0 0 60px rgba(0, 255, 255, 0.4)
    `,
  },
  powerButtonActive: {
    transform: 'scale(0.95)',
    boxShadow: `
      inset 0 0 15px #2ca3d6,
      0 0 10px rgba(0, 150, 255, 0.5)
    `,
  },
  powerIcon: {
    fontSize: '3.5rem',
    color: '#ffffff',
    textShadow: '0 0 8px #00f0ff, 0 0 16px #00f0ff',
  },
};

export default styles;