const styles: { [key: string]: React.CSSProperties } = {
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
};
export default styles;