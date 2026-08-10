import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { palette, spacing, radius } from '../../theme/theme';
import ElevatedCard from '../ui/ElevatedCard';

interface WebPanelProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  bodyStyle?: ViewStyle;
  headerRight?: React.ReactNode;
  fill?: boolean;
}

const WebPanel: React.FC<WebPanelProps> = ({
  title,
  subtitle,
  children,
  style,
  bodyStyle,
  headerRight,
  fill = true,
}) => (
  <ElevatedCard style={[styles.card, fill && styles.cardFill, style]}>
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text variant="titleMedium" style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text variant="bodySmall" style={styles.subtitle}>{subtitle}</Text>
        ) : null}
      </View>
      {headerRight}
    </View>
    <View style={[styles.body, fill && styles.bodyFill, bodyStyle]}>{children}</View>
  </ElevatedCard>
);

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  cardFill: {
    flex: 1,
    minHeight: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    backgroundColor: palette.surface, // Same as card
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 17,
  },
  subtitle: {
    color: palette.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  body: {
    minHeight: 0,
  },
  bodyFill: {
    flex: 1,
  },
});

export default WebPanel;
