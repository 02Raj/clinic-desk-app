import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { palette } from '../../../theme/theme';
import { landing } from '../../../theme/landingTheme';
import { cardShadow } from '../landingLayout';

export interface BookingsPanelMockProps {
  size?: 'default' | 'large';
  highlightCode?: string;
  showNewBookingBanner?: boolean;
}

const BASE_BOOKINGS = [
  { time: '10:00', name: 'Rina K.', status: 'Confirmed', code: 'R4K2' },
  { time: '10:30', name: 'Sameer P.', status: 'Checked in', code: 'S8P1' },
  { time: '11:00', name: 'Anjali R.', status: 'Booked', code: 'A3J7' },
  { time: '11:30', name: 'Vikram S.', status: 'Booked', code: 'V9S2' },
];

const BookingsPanelMock: React.FC<BookingsPanelMockProps> = ({
  size = 'default',
  highlightCode,
  showNewBookingBanner,
}) => {
  const large = size === 'large';
  const bookings = showNewBookingBanner
    ? [{ time: '10:30', name: 'Priya S.', status: 'Booked', code: 'K7M2' }, ...BASE_BOOKINGS]
    : BASE_BOOKINGS;

  return (
    <View style={[styles.shell, cardShadow, large && styles.shellLarge]}>
      {showNewBookingBanner && (
        <View style={styles.banner}>
          <MaterialCommunityIcons name="calendar-plus" size={14} color={landing.textOnGreen} />
          <Text style={styles.bannerText}>New WhatsApp booking synced</Text>
        </View>
      )}
      <View style={[styles.titleBar, large && styles.titleBarLarge]}>
        <MaterialCommunityIcons name="calendar-check" size={large ? 18 : 16} color={palette.primary} />
        <Text style={[styles.titleBarText, large && styles.titleBarTextLarge]}>Today's Bookings</Text>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>Live</Text>
      </View>
      <View style={[styles.kpiRow, large && styles.kpiRowLarge]}>
        <Kpi label="Scheduled" value="13" large={large} />
        <Kpi label="Arrived" value="4" large={large} />
        <Kpi label="Done" value="3" large={large} />
      </View>
      <View style={styles.tableHead}>
        <Text style={[styles.th, styles.colTime]}>Time</Text>
        <Text style={[styles.th, styles.colName]}>Patient</Text>
        <Text style={[styles.th, styles.colStatus]}>Status</Text>
      </View>
      {bookings.map((row) => {
        const highlighted = highlightCode === row.code || (showNewBookingBanner && row.code === 'K7M2');
        return (
          <View key={row.code} style={[styles.tr, highlighted && styles.trHighlight, large && styles.trLarge]}>
            <Text style={[styles.td, styles.colTime, large && styles.tdLarge]}>{row.time}</Text>
            <Text style={[styles.td, styles.colName, large && styles.tdLarge]} numberOfLines={1}>
              {row.name}
            </Text>
            <View style={[styles.badge, badgeStyle(row.status)]}>
              <Text style={[styles.badgeText, badgeTextStyle(row.status)]}>{row.status}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const Kpi: React.FC<{ label: string; value: string; large?: boolean }> = ({ label, value, large }) => (
  <View style={[styles.kpi, large && styles.kpiLarge]}>
    <Text style={[styles.kpiValue, large && styles.kpiValueLarge]}>{value}</Text>
    <Text style={styles.kpiLabel}>{label}</Text>
  </View>
);

function badgeStyle(status: string) {
  if (status === 'Checked in') return { backgroundColor: palette.successLight };
  if (status === 'Confirmed') return { backgroundColor: palette.primaryLight };
  return { backgroundColor: landing.creamDark };
}

function badgeTextStyle(status: string) {
  if (status === 'Checked in') return { color: palette.success };
  if (status === 'Confirmed') return { color: palette.primary };
  return { color: palette.textSecondary };
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
  },
  shellLarge: { borderRadius: 14 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: landing.green,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bannerText: { fontSize: 12, fontWeight: '700', color: landing.textOnGreen },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
    backgroundColor: palette.surfaceVariant,
  },
  titleBarLarge: { paddingVertical: 18, paddingHorizontal: 20 },
  titleBarText: { fontSize: 13, fontWeight: '700', color: palette.textPrimary, flex: 1 },
  titleBarTextLarge: { fontSize: 15 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.success },
  liveText: { fontSize: 10, fontWeight: '600', color: palette.success },
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  kpiRowLarge: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  kpi: {
    flex: 1,
    backgroundColor: palette.background,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  kpiLarge: { paddingVertical: 14, borderRadius: 10 },
  kpiValue: { fontSize: 18, fontWeight: '700', color: palette.textPrimary },
  kpiValueLarge: { fontSize: 24 },
  kpiLabel: { fontSize: 10, color: palette.textSecondary, marginTop: 2 },
  tableHead: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: palette.surfaceVariant,
  },
  th: { fontSize: 10, fontWeight: '700', color: palette.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  trLarge: { paddingVertical: 14, paddingHorizontal: 20 },
  trHighlight: {
    backgroundColor: palette.primaryLight,
    ...Platform.select({
      web: { animation: 'pulse 2s ease-in-out infinite' } as object,
      default: {},
    }),
  },
  td: { fontSize: 12, color: palette.textPrimary },
  tdLarge: { fontSize: 14 },
  colTime: { width: 48 },
  colName: { flex: 1 },
  colStatus: { width: 80 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '600' },
});

export default BookingsPanelMock;
