import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { Platform, type ViewStyle } from 'react-native';
import type {
  AppointmentStatusMap,
  WaitlistStatusMap,
} from '../types';

// ---------------------------------------------------------------------------
// 1. COLOR TOKENS — Opsyfy Exact Theme
// ---------------------------------------------------------------------------

export const palette = {
  // ── Brand / Accent ───────────────────────────
  primary: '#2F483A',        // Opsyfy Button/Dark Green
  primaryDark: '#1A2921',    // Opsyfy Background Dark Green
  primaryLight: '#E3E9E5',   // Soft Green Tint
  primaryContainer: '#2F483A',// For active states on dark backgrounds

  // ── Surfaces ─────────────────────────────────
  background: '#F5EFE6',     // Opsyfy Warm Beige (Main App Bg)
  surface: '#FFFFFF',        // Pure White for inputs/cards
  surfaceVariant: '#FAF7F2', // Lighter Beige

  // ── Semantic ─────────────────────────────────
  success: '#2E7D32',        // Green
  successLight: '#E8F5E9',
  warning: '#D97706',        // Warm Amber
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  neutral: '#5A6B61',        // Muted Slate/Green
  neutralLight: '#F5EFE6',   // Warm Beige

  // ── Typography ───────────────────────────────
  textPrimary: '#1B2A20',    // Very Dark Green/Black
  textSecondary: '#66736A',  // Muted Dark Green
  textOnPrimary: '#F5EFE6',  // Warm beige text on dark green
  textDisabled: '#9EAFA3',

  // ── Borders ──────────────────────────────────
  border: '#E6DFD5',         // Soft sand border for cards/inputs
  divider: '#EBE5DC',        // Lighter sand divider

  overlay: 'rgba(27, 42, 32, 0.4)',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

// Opsyfy is flat design, minimal shadows
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#1B2A20',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#1B2A20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: '#1B2A20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

const systemFont = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

// Opsyfy typography: Elegant, elegant serif/sans mix, we'll use clean sans for UI
const fontConfig = {
  displayLarge: {
    fontFamily: systemFont,
    fontWeight: '700' as const,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontFamily: systemFont,
    fontWeight: '700' as const,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  displaySmall: {
    fontFamily: systemFont,
    fontWeight: '700' as const,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.5,
  },
  headlineLarge: {
    fontFamily: systemFont,
    fontWeight: '700' as const,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  headlineMedium: {
    fontFamily: systemFont,
    fontWeight: '700' as const,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  headlineSmall: {
    fontFamily: systemFont,
    fontWeight: '700' as const,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.5,
  },
  titleLarge: {
    fontFamily: systemFont,
    fontWeight: '700' as const,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.5,
  },
  titleMedium: {
    fontFamily: systemFont,
    fontWeight: '600' as const,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
  },
  titleSmall: {
    fontFamily: systemFont,
    fontWeight: '600' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  bodyLarge: {
    fontFamily: systemFont,
    fontWeight: '400' as const,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontFamily: systemFont,
    fontWeight: '400' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  bodySmall: {
    fontFamily: systemFont,
    fontWeight: '400' as const,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  labelLarge: {
    fontFamily: systemFont,
    fontWeight: '600' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  labelMedium: {
    fontFamily: systemFont,
    fontWeight: '600' as const,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  labelSmall: {
    fontFamily: systemFont,
    fontWeight: '600' as const,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
};

export const appointmentStatus: AppointmentStatusMap = {
  BOOKED: {
    label: 'Booked',
    color: palette.primary,
    backgroundColor: palette.primaryLight,
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: palette.success,
    backgroundColor: palette.successLight,
  },
  CHECKED_IN: {
    label: 'Checked In',
    color: palette.neutral,
    backgroundColor: palette.border,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: palette.primaryDark,
    backgroundColor: palette.primaryLight,
  },
  COMPLETED: {
    label: 'Completed',
    color: palette.success,
    backgroundColor: palette.successLight,
  },
  NO_SHOW: {
    label: 'No Show',
    color: palette.error,
    backgroundColor: palette.errorLight,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: palette.error,
    backgroundColor: palette.errorLight,
  },
};

export const waitlistStatus: WaitlistStatusMap = {
  WAITING: {
    label: 'Waiting',
    color: palette.warning,
    backgroundColor: palette.warningLight,
  },
  OFFERED: {
    label: 'Offered',
    color: palette.primary,
    backgroundColor: palette.primaryLight,
  },
  ACCEPTED: {
    label: 'Accepted',
    color: palette.success,
    backgroundColor: palette.successLight,
  },
  EXPIRED: {
    label: 'Expired',
    color: palette.neutral,
    backgroundColor: palette.border,
  },
};

const theme = {
  ...MD3LightTheme,

  colors: {
    ...MD3LightTheme.colors,

    primary: palette.primary,
    primaryContainer: palette.primaryLight,
    onPrimary: palette.textOnPrimary,
    onPrimaryContainer: palette.primaryDark,

    secondary: palette.neutral,
    secondaryContainer: palette.border,
    onSecondary: palette.textOnPrimary,
    onSecondaryContainer: palette.neutral,

    tertiary: palette.warning,
    tertiaryContainer: palette.warningLight,
    onTertiary: palette.textOnPrimary,
    onTertiaryContainer: palette.warning,

    error: palette.error,
    errorContainer: palette.errorLight,
    onError: palette.textOnPrimary,
    onErrorContainer: palette.error,

    background: palette.background,
    onBackground: palette.textPrimary,

    surface: palette.surface,
    surfaceVariant: palette.surfaceVariant,
    onSurface: palette.textPrimary,
    onSurfaceVariant: palette.textSecondary,
    surfaceDisabled: palette.neutralLight,
    onSurfaceDisabled: palette.textDisabled,

    outline: palette.border,
    outlineVariant: palette.divider,

    inverseSurface: palette.textPrimary,
    inverseOnSurface: palette.background,
    inversePrimary: palette.primaryLight,

    backdrop: palette.overlay,

    elevation: {
      level0: 'transparent',
      level1: palette.surface,
      level2: palette.surfaceVariant,
      level3: palette.surfaceVariant,
      level4: palette.surfaceVariant,
      level5: palette.surfaceVariant,
    },
  },

  fonts: configureFonts({ config: fontConfig }),

  roundness: radius.sm, // Opsyfy has slightly rounded inputs

  custom: {
    palette,
    spacing,
    radius,
    shadows,
    appointmentStatus,
    waitlistStatus,
  },
};

export type AppTheme = typeof theme;

export default theme;
