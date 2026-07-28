import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// 1. COLOR TOKENS
// ---------------------------------------------------------------------------
// Medical-trust blue + white palette — PRD §6.8
// No purple, no violet, no neon — clinical and operational.

const palette = {
  // Primary
  primary: '#2563EB',
  primaryDark: '#1D4ED8',      // pressed / active states
  primaryLight: '#DBEAFE',     // tinted backgrounds, selected rows
  primaryContainer: '#EFF6FF', // very light tint for subtle highlights

  // Backgrounds
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceVariant: '#F8FAFC',   // off-white for cards, sections, list items

  // Status
  success: '#16A34A',          // confirmed, completed
  successLight: '#DCFCE7',     // success chip / badge background
  warning: '#D97706',          // waitlist, attention-needed
  warningLight: '#FEF3C7',     // warning chip / badge background
  error: '#DC2626',            // cancelled, no-show, destructive actions
  errorLight: '#FEE2E2',       // error chip / badge background
  neutral: '#64748B',          // checked-in, secondary status
  neutralLight: '#F1F5F9',     // neutral chip / badge background

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textOnPrimary: '#FFFFFF',    // white text on primary-coloured buttons
  textDisabled: '#94A3B8',

  // Borders & dividers
  border: '#E2E8F0',
  divider: '#F1F5F9',

  // Misc
  overlay: 'rgba(15, 23, 42, 0.4)', // modal / bottom-sheet scrim
};

// ---------------------------------------------------------------------------
// 2. SPACING SCALE (strict 4 px base — PRD §6.8 item 3)
// ---------------------------------------------------------------------------
// Usage: spacing.xs = 4, spacing.sm = 8, etc.

const spacing = {
  xxs: 2,  // hairline, rarely needed
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ---------------------------------------------------------------------------
// 3. BORDER RADIUS
// ---------------------------------------------------------------------------
// Cards: 12 px, Buttons / inputs: 8 px — PRD §6.8 item 4

const radius = {
  xs: 4,
  sm: 8,   // buttons, text inputs, chips
  md: 12,  // cards, modals, bottom sheets
  lg: 16,  // full-screen sheets (rare)
  full: 9999, // circular avatars / badges
};

// ---------------------------------------------------------------------------
// 4. ELEVATION / SHADOW
// ---------------------------------------------------------------------------
// Soft shadows only — elevation 2–3. No hard drop-shadows, no neon glow.
// These are plain objects usable via `style` props on RN views; React Native
// Paper's elevation prop (0–5) can also be used where Paper components allow.

const shadows = {
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
};

// ---------------------------------------------------------------------------
// 5. TYPOGRAPHY (system font — PRD §6.8 item 2)
// ---------------------------------------------------------------------------
// San Francisco (iOS) / Roboto (Android) via React Native Paper's defaults.
// No custom decorative fonts. Headings bold. Body regular. No italic.

const systemFont = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

const fontConfig = {
  displayLarge: {
    fontFamily: systemFont,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  displayMedium: {
    fontFamily: systemFont,
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: systemFont,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },

  headlineLarge: {
    fontFamily: systemFont,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: systemFont,
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: systemFont,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },

  titleLarge: {
    fontFamily: systemFont,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: systemFont,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: systemFont,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  bodyLarge: {
    fontFamily: systemFont,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontFamily: systemFont,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: systemFont,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },

  labelLarge: {
    fontFamily: systemFont,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: systemFont,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: systemFont,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
};

// ---------------------------------------------------------------------------
// 6. APPOINTMENT STATUS MAP
// ---------------------------------------------------------------------------
// Centralised color/label mapping so every screen renders statuses the same.

const appointmentStatus = {
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

const waitlistStatus = {
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

// ---------------------------------------------------------------------------
// 7. REACT NATIVE PAPER THEME OBJECT
// ---------------------------------------------------------------------------

const theme = {
  ...MD3LightTheme,

  colors: {
    ...MD3LightTheme.colors,

    // Map palette into Paper's expected keys
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

  roundness: radius.sm, // Paper uses `roundness` as the base — 8 px

  // -----------------------------------------------------------------------
  // Custom extensions (not part of Paper, consumed by our own components)
  // -----------------------------------------------------------------------
  custom: {
    palette,
    spacing,
    radius,
    shadows,
    appointmentStatus,
    waitlistStatus,
  },
};

export { palette, spacing, radius, shadows, appointmentStatus, waitlistStatus };
export default theme;
