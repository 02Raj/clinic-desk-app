import { Platform, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import { landing, landingFonts } from '../../theme/landingTheme';

export const LANDING_MAX_WIDTH = 1120;
export const LANDING_NARROW_WIDTH = 720;

export type SectionVariant = 'cream' | 'dark' | 'white' | 'tan';

export const sectionBackground: Record<SectionVariant, string> = {
  cream: landing.cream,
  dark: landing.green,
  white: landing.white,
  tan: landing.creamDark,
};

export const layout = StyleSheet.create({
  section: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 88,
    alignSelf: 'center',
  },
  sectionMobile: {
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  inner: {
    width: '100%',
    maxWidth: LANDING_MAX_WIDTH,
    alignSelf: 'center',
  },
  innerNarrow: {
    width: '100%',
    maxWidth: LANDING_NARROW_WIDTH,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
  },
  rowMobile: {
    flexDirection: 'column',
    gap: 32,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
});

export const serifTitle = (size: number, lineHeight: number): TextStyle =>
  Platform.select({
    web: {
      fontFamily: landingFonts.serif,
      fontSize: size,
      lineHeight,
      fontWeight: '500',
      letterSpacing: -1,
      color: landing.text,
    },
    default: {
      fontSize: size,
      lineHeight,
      fontWeight: '600',
      color: landing.text,
    },
  }) as TextStyle;

export const serifTitleLight = (size: number, lineHeight: number): TextStyle =>
  Platform.select({
    web: {
      fontFamily: landingFonts.serif,
      fontSize: size,
      lineHeight,
      fontWeight: '500',
      letterSpacing: -1,
      color: landing.textOnGreen,
    },
    default: {
      fontSize: size,
      lineHeight,
      fontWeight: '600',
      color: landing.textOnGreen,
    },
  }) as TextStyle;

export const webOnly = (style: ViewStyle): ViewStyle =>
  Platform.select({ web: style, default: {} }) as ViewStyle;

export const cardShadow = webOnly({
  boxShadow: '0 1px 2px rgba(27, 42, 32, 0.04), 0 8px 24px rgba(27, 42, 32, 0.06)',
} as ViewStyle);
