import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { palette, spacing, radius } from '../../theme/theme';
import ElevatedCard from '../ui/ElevatedCard';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface KpiItem {
  key: string;
  label: string;
  value: string | number;
  icon: IconName;
  color: string;
  backgroundColor: string;
}

interface WebKpiRowProps {
  items: KpiItem[];
}

const WebKpiRow: React.FC<WebKpiRowProps> = ({ items }) => (
  <View style={styles.row}>
    {items.map((item) => (
      <ElevatedCard key={item.key} style={styles.tile}>
        <View style={styles.tileBody}>
          <View style={[styles.iconWrap, { backgroundColor: item.backgroundColor }]}>
            <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
          </View>
          <View style={styles.tileText}>
            <Text variant="headlineMedium" style={styles.value}>{item.value}</Text>
            <Text variant="bodySmall" style={styles.label}>{item.label}</Text>
          </View>
        </View>
      </ElevatedCard>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tile: {
    flex: 1,
    minWidth: 0,
  },
  tileBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    color: palette.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  label: {
    color: palette.textSecondary,
    marginTop: spacing.xxs,
    fontWeight: '600',
  },
});

export default WebKpiRow;
