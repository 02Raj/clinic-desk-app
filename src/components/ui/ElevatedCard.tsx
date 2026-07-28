import React from 'react';
import { View, StyleSheet, Platform, type ViewStyle, type StyleProp } from 'react-native';
import { palette, radius, shadows } from '../../theme/theme';

interface ElevatedCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accentColor?: string;
}

const ElevatedCard: React.FC<ElevatedCardProps> = ({ children, style, accentColor }) => (
  <View style={[styles.card, style]}>
    {accentColor ? <View style={[styles.accent, { backgroundColor: accentColor }]} /> : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.06), 0px 4px 12px rgba(15, 23, 42, 0.04)' } as ViewStyle,
      default: shadows.md,
    }),
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
});

export default ElevatedCard;
