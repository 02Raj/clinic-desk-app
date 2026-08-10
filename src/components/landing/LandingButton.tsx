import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { landing } from '../../theme/landingTheme';

interface LandingButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'light';
  size?: 'default' | 'compact';
  style?: ViewStyle;
  labelStyle?: TextStyle;
  fullWidth?: boolean;
}

const LandingButton: React.FC<LandingButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'default',
  style,
  labelStyle,
  fullWidth = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    style={[
      styles.base,
      size === 'compact' && styles.compact,
      variant === 'primary' && styles.primary,
      variant === 'secondary' && styles.secondary,
      variant === 'outline' && styles.outline,
      variant === 'light' && styles.light,
      fullWidth && styles.fullWidth,
      style,
    ]}
  >
    <Text
      style={[
        styles.label,
        size === 'compact' && styles.labelCompact,
        variant === 'primary' && styles.labelPrimary,
        variant === 'secondary' && styles.labelSecondary,
        variant === 'outline' && styles.labelOutline,
        variant === 'light' && styles.labelLight,
        labelStyle,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        borderStyle: 'solid',
      } as ViewStyle,
      default: {},
    }),
  },
  compact: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    minHeight: 40,
  },
  primary: {
    backgroundColor: landing.green,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: landing.creamDark,
    borderWidth: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: landing.green,
  },
  light: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.75)',
  },
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
    includeFontPadding: false,
    ...Platform.select({
      web: { lineHeight: 22 } as TextStyle,
      default: {},
    }),
  },
  labelCompact: {
    fontSize: 13,
    ...Platform.select({
      web: { lineHeight: 18 } as TextStyle,
      default: {},
    }),
  },
  labelPrimary: {
    color: landing.textOnGreen,
  },
  labelSecondary: {
    color: landing.text,
  },
  labelOutline: {
    color: landing.green,
  },
  labelLight: {
    color: landing.textOnGreen,
  },
});

export default LandingButton;
