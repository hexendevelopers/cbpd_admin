// Professional Color Palette for CBPD Admin Dashboard
export const professionalColors = {
  // Primary Colors - Sophisticated Blues and Grays
  primary: {
    50: '#f7f8fc',
    100: '#edf2f7',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#718096',  // Main primary
    600: '#4a5568',
    700: '#2d3748',
    800: '#1a202c',
    900: '#171923'
  },
  
  // Secondary Colors - Professional Slate
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#94a3b8',
    500: '#64748b',  // Main secondary
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  
  // Success - Professional Green
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Main success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  
  // Warning - Professional Amber
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',  // Main warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  
  // Error - Professional Red
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // Main error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },
  
  // Info - Professional Blue
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main info
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  
  // Neutral - Professional Grays
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b'
  }
};

// Semantic color mappings
export const semanticColors = {
  // Backgrounds
  background: {
    primary: professionalColors.neutral[50],
    secondary: professionalColors.primary[50],
    card: '#ffffff',
    hover: professionalColors.neutral[100]
  },
  
  // Text
  text: {
    primary: professionalColors.primary[800],
    secondary: professionalColors.primary[600],
    muted: professionalColors.primary[500],
    inverse: '#ffffff'
  },
  
  // Borders
  border: {
    light: professionalColors.neutral[200],
    medium: professionalColors.neutral[300],
    dark: professionalColors.neutral[400]
  },
  
  // Status
  status: {
    success: professionalColors.success[500],
    warning: professionalColors.warning[500],
    error: professionalColors.error[500],
    info: professionalColors.info[500],
    pending: professionalColors.warning[500],
    approved: professionalColors.success[500],
    rejected: professionalColors.error[500]
  },
  
  // Interactive
  interactive: {
    primary: professionalColors.primary[600],
    primaryHover: professionalColors.primary[700],
    secondary: professionalColors.secondary[600],
    secondaryHover: professionalColors.secondary[700]
  }
};