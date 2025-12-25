export const theme = {
  colors: {
    primary: '#6B46C1', // Dark purple for primary buttons
    secondary: '#8B5CF6', // Lighter purple for gradients
    accent: '#A78BFA', // Light purple accent (for gradient end)
    highlight: '#D97706', // Light brown/amber for subtitle text
    background: '#4C1D95', // Dark purple background (gradient start)
    backgroundGradientEnd: '#6B46C1', // Lighter purple for gradient end
    surface: '#ffffff',
    text: '#1a1a2e',
    textSecondary: '#666666',
    border: '#e0e0e0',
    white: '#ffffff',
    purple: '#6B46C1',
    purpleDark: '#4C1D95',
    purpleLight: '#8B5CF6',
    brown: '#D97706', // Light brown for subtitle
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal' as const,
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal' as const,
    },
    small: {
      fontSize: 12,
      fontWeight: 'normal' as const,
    },
  },
};

