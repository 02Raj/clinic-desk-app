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
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        // Opsyfy uses extremely subtle, almost non-existent shadows on its cards, relying on borders
        boxShadow: '0 4px 12px rgba(27, 42, 32, 0.02)',
      } as ViewStyle,
      default: shadows.sm,
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
