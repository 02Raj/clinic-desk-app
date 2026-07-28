import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { palette, spacing } from '../../theme/theme';

interface SectionLabelProps {
  children: string;
}

const SectionLabel: React.FC<SectionLabelProps> = ({ children }) => (
  <Text variant="labelSmall" style={styles.label}>
    {children.toUpperCase()}
  </Text>
);

const styles = StyleSheet.create({
  label: {
    color: palette.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
});

export default SectionLabel;
