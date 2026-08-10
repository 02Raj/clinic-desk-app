import React from 'react';
import { ScrollView, View, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { palette, spacing } from '../../theme/theme';
import ElevatedCard from '../ui/ElevatedCard';

export interface DataTableColumn {
  key: string;
  label: string;
  flex?: number;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: DataTableColumn[];
  data: T[];
  keyExtractor: (item: T) => string;
  renderRow: (item: T, index: number) => React.ReactNode;
  emptyState?: React.ReactNode;
  fill?: boolean;
  style?: ViewStyle;
}

function DataTable<T>({
  columns,
  data,
  keyExtractor,
  renderRow,
  emptyState,
  fill = false,
  style,
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return (
      <ElevatedCard style={[styles.card, fill && styles.cardFill, style]}>
        <View style={[styles.emptyWrap, fill && styles.emptyWrapFill]}>
          {emptyState}
        </View>
      </ElevatedCard>
    );
  }

  const tableBody = (
    <>
      <View style={styles.headerRow}>
        {columns.map((col) => (
          <View
            key={col.key}
            style={[
              styles.headerCell,
              col.flex ? { flex: col.flex } : undefined,
              col.width ? { width: col.width } : undefined,
              col.align === 'right' ? styles.alignRight : undefined,
              col.align === 'center' ? styles.alignCenter : undefined,
            ]}
          >
            <Text style={styles.headerText}>{col.label}</Text>
          </View>
        ))}
      </View>
      {data.map((item, index) => (
        <View key={keyExtractor(item)}>
          {renderRow(item, index)}
          {index < data.length - 1 ? <View style={styles.divider} /> : null}
        </View>
      ))}
    </>
  );

  if (fill) {
    return (
      <ElevatedCard style={[styles.card, styles.cardFill, style]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {tableBody}
        </ScrollView>
      </ElevatedCard>
    );
  }

  return (
    <ElevatedCard style={[styles.card, style]}>
      {tableBody}
    </ElevatedCard>
  );
}

export const tableRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 64,
  },
  cell: {
    justifyContent: 'center',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  alignCenter: {
    alignItems: 'center',
  },
});

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  cardFill: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyWrap: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  emptyWrapFill: {
    flex: 1,
    minHeight: 320,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: palette.surface, // Clean flat surface for Opsyfy
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  headerCell: {
    justifyContent: 'center',
  },
  headerText: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: palette.divider,
    marginLeft: spacing.lg,
    marginRight: spacing.lg,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  alignCenter: {
    alignItems: 'center',
  },
});

export default DataTable;
