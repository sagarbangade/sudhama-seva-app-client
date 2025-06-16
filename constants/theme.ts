import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { Platform } from 'react-native';

// Custom colors
export const colors = {
  primary: '#FF6B00', // Orange
  secondary: '#FFD700', // Yellow
  accent: '#87CEEB', // Sky Blue
  background: '#F8F9FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textLight: '#757575',
  error: '#DC3545',
  success: '#28A745',
  warning: '#FFC107',
  info: '#17A2B8',
  disabled: '#E9ECEF',
  placeholder: '#6C757D',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#FF6B00',
  white: '#FFFFFF',
  black: '#000000',
  border: '#DEE2E6',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Custom font configuration
const fontConfig = {
  fontFamily: 'System',
};

// Shadow styles
const shadowStyles = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 3,
};

// Custom styles
export const styles = {
  shadow: shadowStyles,
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...shadowStyles,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 16,
    ...shadowStyles,
  },
  searchBar: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    elevation: 0,
  },
  fab: {
    backgroundColor: colors.primary,
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 16,
  },
};

// Custom theme
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.accent,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    onPrimary: colors.background,
    onSecondary: colors.text,
    onTertiary: colors.text,
    onBackground: colors.text,
    onSurface: colors.text,
    onError: colors.background,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 8,
};