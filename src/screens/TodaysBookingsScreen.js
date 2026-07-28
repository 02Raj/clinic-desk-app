import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Appbar,
  Card,
  Chip,
  Text,
  Divider,
  IconButton,
  useTheme,
} from 'react-native-paper';
import {
  palette,
  spacing,
  radius,
  shadows,
  appointmentStatus as statusMap,
} from '../theme/theme';
import MOCK_APPOINTMENTS from '../data/mockAppointments';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check whether two Date objects fall on the same calendar day. */
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Format a Date as "9:00 AM". */
const formatTime = (date) =>
  date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

/** Format a Date as "Sat, 12 Jul". */
const formatDateShort = (date) =>
  date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

/** Format a Date as "Saturday, 12 July 2026". */
const formatDateLong = (date) =>
  date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

/** Returns true if `date` is today. */
const isToday = (date) => isSameDay(date, new Date());

/** Shift a date by `n` days (positive = forward). */
const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

// ---------------------------------------------------------------------------
// Status summary — small count badges at the top
// ---------------------------------------------------------------------------

const STATUS_SUMMARY_ORDER = [
  'CONFIRMED',
  'BOOKED',
  'CHECKED_IN',
  'IN_PROGRESS',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED',
];

const StatusSummary = React.memo(({ appointments }) => {
  const counts = useMemo(() => {
    const map = {};
    appointments.forEach((apt) => {
      map[apt.status] = (map[apt.status] || 0) + 1;
    });
    return map;
  }, [appointments]);

  return (
    <View style={styles.summaryRow}>
      {STATUS_SUMMARY_ORDER.map((key) => {
        const count = counts[key];
        if (!count) return null;
        const st = statusMap[key];
        return (
          <View
            key={key}
            style={[
              styles.summaryBadge,
              { backgroundColor: st.backgroundColor },
            ]}
          >
            <Text
              variant="labelLarge"
              style={{ color: st.color, fontWeight: '700' }}
            >
              {count}
            </Text>
            <Text
              variant="labelSmall"
              style={[styles.summaryLabel, { color: st.color }]}
            >
              {st.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
});

// ---------------------------------------------------------------------------
// Appointment row
// ---------------------------------------------------------------------------

const AppointmentRow = React.memo(({ item }) => {
  const st = statusMap[item.status] || statusMap.BOOKED;

  return (
    <Card
      style={styles.card}
      mode="contained"
      contentStyle={styles.cardContent}
    >
      <View style={styles.rowContainer}>
        {/* Left: time column */}
        <View style={styles.timeColumn}>
          <Text variant="titleSmall" style={styles.timeText}>
            {formatTime(item.scheduledTime)}
          </Text>
          <Text variant="bodySmall" style={styles.sourceText}>
            {item.source === 'whatsapp' ? 'WhatsApp' : 'Walk-in'}
          </Text>
        </View>

        {/* Vertical accent bar */}
        <View
          style={[styles.accentBar, { backgroundColor: st.color }]}
        />

        {/* Center: patient info */}
        <View style={styles.infoColumn}>
          <Text variant="titleMedium" style={styles.patientName} numberOfLines={1}>
            {item.patientName}
          </Text>
          <Text variant="bodySmall" style={styles.bookingCodeText}>
            Code: {item.bookingCode}
          </Text>
        </View>

        {/* Right: status chip */}
        <Chip
          compact
          textStyle={[styles.chipText, { color: st.color }]}
          style={[styles.chip, { backgroundColor: st.backgroundColor }]}
        >
          {st.label}
        </Chip>
      </View>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// Date selector strip
// ---------------------------------------------------------------------------

const DateSelector = React.memo(({ selectedDate, onDateChange }) => {
  const handlePrev = useCallback(
    () => onDateChange(addDays(selectedDate, -1)),
    [selectedDate, onDateChange],
  );
  const handleNext = useCallback(
    () => onDateChange(addDays(selectedDate, 1)),
    [selectedDate, onDateChange],
  );
  const handleToday = useCallback(
    () => onDateChange(new Date()),
    [onDateChange],
  );

  const dateIsToday = isToday(selectedDate);

  return (
    <View style={styles.dateSelectorContainer}>
      <View style={styles.dateSelectorRow}>
        <IconButton
          icon="chevron-left"
          size={24}
          iconColor={palette.textPrimary}
          onPress={handlePrev}
          style={styles.dateNavButton}
        />

        <TouchableOpacity
          onPress={handleToday}
          activeOpacity={0.7}
          style={styles.dateLabelTouchable}
        >
          <Text variant="titleMedium" style={styles.dateLabelPrimary}>
            {dateIsToday ? 'Today' : formatDateShort(selectedDate)}
          </Text>
          <Text variant="bodySmall" style={styles.dateLabelSecondary}>
            {formatDateLong(selectedDate)}
          </Text>
        </TouchableOpacity>

        <IconButton
          icon="chevron-right"
          size={24}
          iconColor={palette.textPrimary}
          onPress={handleNext}
          style={styles.dateNavButton}
        />
      </View>

      {!dateIsToday && (
        <TouchableOpacity onPress={handleToday} style={styles.todayPill}>
          <Text variant="labelSmall" style={styles.todayPillText}>
            Back to today
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <IconButton
      icon="calendar-blank-outline"
      size={56}
      iconColor={palette.textDisabled}
    />
    <Text variant="titleMedium" style={styles.emptyTitle}>
      No appointments
    </Text>
    <Text variant="bodyMedium" style={styles.emptySubtitle}>
      There are no bookings scheduled for this day.
    </Text>
  </View>
);

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

const TodaysBookingsScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter appointments for the selected date, sorted by time
  const filteredAppointments = useMemo(() => {
    return MOCK_APPOINTMENTS.filter((apt) =>
      isSameDay(apt.scheduledTime, selectedDate),
    ).sort((a, b) => a.scheduledTime - b.scheduledTime);
  }, [selectedDate]);

  const renderItem = useCallback(
    ({ item }) => <AppointmentRow item={item} />,
    [],
  );
  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.safeArea}>

      {/* Top bar — flat, no elevation, bottom border only */}
      <Appbar.Header
        mode="small"
        style={styles.appbar}
        statusBarHeight={0}
      >
        <Appbar.Content
          title="Bookings"
          titleStyle={styles.appbarTitle}
        />
        {/* Placeholder for future: search, filter, or add-appointment */}
        <Appbar.Action
          icon="magnify"
          iconColor={palette.textSecondary}
          onPress={() => {}}
        />
      </Appbar.Header>

      {/* Date navigation */}
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <Divider style={styles.divider} />

      {/* Summary badges */}
      {filteredAppointments.length > 0 && (
        <>
          <View style={styles.sectionHeaderRow}>
            <Text variant="bodySmall" style={styles.sectionCount}>
              {filteredAppointments.length} appointment
              {filteredAppointments.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <StatusSummary appointments={filteredAppointments} />
          <Divider style={styles.divider} />
        </>
      )}

      {/* Appointment list */}
      <FlatList
        data={filteredAppointments}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          filteredAppointments.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
      />
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles — all values from theme tokens, zero hardcoded colors/spacing
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },

  // Appbar
  appbar: {
    backgroundColor: palette.background,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  appbarTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 22,
  },

  // Date selector
  dateSelectorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: palette.background,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateNavButton: {
    margin: 0,
  },
  dateLabelTouchable: {
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  dateLabelPrimary: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  dateLabelSecondary: {
    color: palette.textSecondary,
    marginTop: spacing.xxs,
  },
  todayPill: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: palette.primaryContainer,
    borderRadius: radius.full,
  },
  todayPillText: {
    color: palette.primary,
    fontWeight: '600',
  },

  // Divider
  divider: {
    backgroundColor: palette.divider,
    height: 1,
  },

  // Section header / count
  sectionHeaderRow: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionCount: {
    color: palette.textSecondary,
  },

  // Status summary
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  summaryLabel: {
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  listSeparator: {
    height: spacing.sm,
  },

  // Card / row
  card: {
    backgroundColor: palette.surfaceVariant,
    borderRadius: radius.md,
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(15, 23, 42, 0.08)' },
      default: shadows.md,
    }),
  },
  cardContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingLeft: spacing.base,
    paddingRight: spacing.md,
  },

  // Time column
  timeColumn: {
    width: 72,
    marginRight: spacing.sm,
  },
  timeText: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  sourceText: {
    color: palette.textSecondary,
    marginTop: spacing.xxs,
  },

  // Accent bar
  accentBar: {
    width: 3,
    height: 40,
    borderRadius: radius.full,
    marginRight: spacing.md,
  },

  // Info column
  infoColumn: {
    flex: 1,
    marginRight: spacing.sm,
  },
  patientName: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  bookingCodeText: {
    color: palette.textSecondary,
    marginTop: spacing.xxs,
  },

  // Status chip
  chip: {
    borderRadius: radius.sm,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: palette.textPrimary,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    color: palette.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default TodaysBookingsScreen;
