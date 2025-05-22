import React from 'react';

// Define colors for reuse
const colors = {
  primary: '#0072ff',
  primaryLight: '#00c6ff',
  background: '#121225',
  backgroundElevated: '#1a1a2e',
  border: '#444',
  text: '#fff',
  error: '#ff4d4f',
  success: '#4caf50',
};

// Define styles using React.CSSProperties
export const styles: { [key: string]: React.CSSProperties } = {
  form: {
    maxWidth: '420px',
    margin: '0 auto',
    padding: '2rem',
    background: colors.backgroundElevated,
    borderRadius: '1.2rem',
    boxShadow: '0 4px 32px rgba(0, 0, 0, 0.18)',
    color: colors.text,
  },
  
  formGroup: {
    marginBottom: '1.5rem',
  },
  
  label: {
    fontWeight: 600,
    marginBottom: '0.5rem',
    display: 'block',
    color: colors.text,
  },
  
  input: {
    width: '100%',
    padding: '0.7rem',
    marginBottom: '0.5rem',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    background: colors.background,
    color: colors.text,
    fontSize: '1rem',
    transition: 'border-color 0.2s ease',
  },
  
  inputError: {
    width: '100%',
    padding: '0.7rem',
    marginBottom: '0.5rem',
    border: `1px solid ${colors.error}`,
    borderRadius: '0.5rem',
    background: colors.background,
    color: colors.text,
    fontSize: '1rem',
  },
  
  textarea: {
    width: '100%',
    padding: '0.7rem',
    marginBottom: '0.5rem',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    background: colors.background,
    color: colors.text,
    fontSize: '1rem',
    resize: 'vertical',
    minHeight: '100px',
  },
  
  textareaError: {
    width: '100%',
    padding: '0.7rem',
    marginBottom: '0.5rem',
    border: `1px solid ${colors.error}`,
    borderRadius: '0.5rem',
    background: colors.background,
    color: colors.text,
    fontSize: '1rem',
    resize: 'vertical',
    minHeight: '100px',
  },
  
  buttonPrimary: {
    background: `linear-gradient(90deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
    color: colors.text,
    border: 'none',
    padding: '0.8rem 2rem',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  buttonSecondary: {
    background: 'transparent',
    color: colors.text,
    border: `1px solid ${colors.border}`,
    padding: '0.8rem 2rem',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  
  errorMessage: {
    color: colors.error,
    marginTop: '0.5rem',
    fontSize: '0.875rem',
  },
  
  successMessage: {
    color: colors.success,
    marginTop: '0.5rem',
    fontSize: '0.875rem',
  },
  
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '2rem',
  },
  
  helperText: {
    fontSize: '0.75rem',
    color: colors.text,
    opacity: 0.7,
    marginTop: '0.25rem',
    display: 'block',
  },
  
  helperTextError: {
    fontSize: '0.75rem',
    color: colors.error,
    marginTop: '0.25rem',
    display: 'block',
  },
};