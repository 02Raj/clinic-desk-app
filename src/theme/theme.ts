import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { Platform, type ViewStyle } from 'react-native';
import type {
  AppointmentStatusMap,
  WaitlistStatusMap,
} from '../types';

// ---------------------------------------------------------------------------
// 1. COLOR TOKENS
// ---------------------------------------------------------------------------

export const palette = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  primaryContainer: '#EFF6FF',

  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceVariant: '#F8FAFC',

  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  neutral: '#64748B',
  neutralLight: '#F1F5F9',

  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textOnPrimary: '#FFFFFF',
  textDisabled: '#94A3B8',

  border: '#E2E8F0',
  divider: '#F1F5F9',

  overlay: 'rgba(15, 23, 42, 0.4)',
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

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

const systemFont = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

const fontConfig = {
  displayLarge: {
    fontFamily: systemFont,
    fontWeight: '700' as const,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  displayMedium: {
    fontFamily: systemFont,
    fontWeight: '700' as const,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: systemFont,
    fontWeight: '700' as const,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontFamily: systemFont,
    fontWeight: '700' as const,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: systemFont,
    fontWeight: '700' as const,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: systemFont,
    fontWeight: '700' as const,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  titleLarge: {
    fontFamily: systemFont,
    fontWeight: '700' as const,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: systemFont,
    fontWeight: '600' as const,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: systemFont,
    fontWeight: '600' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  bodyLarge: {
    fontFamily: systemFont,
    fontWeight: '400' as const,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontFamily: systemFont,
    fontWeight: '400' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: systemFont,
    fontWeight: '400' as const,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  labelLarge: {
    fontFamily: systemFont,
    fontWeight: '600' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: systemFont,
    fontWeight: '600' as const,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: systemFont,
    fontWeight: '600' as const,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
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
    backgroundColor: palette.neutralLight,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: palette.primary,
    backgroundColor: palette.primaryContainer,
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
    backgroundColor: palette.neutralLight,
  },
};

const theme = {
  ...MD3LightTheme,

  colors: {
    ...MD3LightTheme.colors,

    primary: palette.primary,
    primaryContainer: palette.primaryContainer,
    onPrimary: palette.textOnPrimary,
    onPrimaryContainer: palette.primary,

    secondary: palette.neutral,
    secondaryContainer: palette.neutralLight,
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
      level1: palette.surfaceVariant,
      level2: palette.surfaceVariant,
      level3: palette.surfaceVariant,
      level4: palette.surfaceVariant,
      level5: palette.surfaceVariant,
    },
  },

  fonts: configureFonts({ config: fontConfig }),

  roundness: radius.sm,

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
