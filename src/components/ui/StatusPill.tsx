import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { radius, spacing } from '../../theme/theme';
import type { StatusStyle } from '../../types';

interface StatusPillProps {
  status: StatusStyle;
  compact?: boolean;
}

const StatusPill: React.FC<StatusPillProps> = ({ status, compact }) => (
  <View style={[styles.pill, { backgroundColor: status.backgroundColor }, compact && styles.compact]}>
    <Text variant="labelSmall" style={[styles.text, { color: status.color }]}>
      {status.label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  compact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0.2,
  },
});

export default StatusPill;
