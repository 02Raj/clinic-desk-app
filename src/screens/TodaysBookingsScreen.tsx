import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  type ListRenderItem,
} from 'react-native';
import { Text, IconButton, Appbar } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  palette,
  spacing,
  radius,
  appointmentStatus as statusMap,
} from '../theme/theme';
import { useAppData } from '../context/AppDataContext';
import {
  isSameDay,
  isToday,
  addDays,
  formatTime,
  formatDateShort,
  formatDateLong,
} from '../utils/dateUtils';
import type { Appointment, AppointmentStatus } from '../types';
import ScreenHeader from '../components/ui/ScreenHeader';
import ElevatedCard from '../components/ui/ElevatedCard';
import StatusPill from '../components/ui/StatusPill';
import PatientAvatar from '../components/ui/PatientAvatar';
import { screenStyles } from '../components/ui/screenStyles';

const STATUS_SUMMARY_ORDER: AppointmentStatus[] = [
  'CONFIRMED',
  'BOOKED',
  'CHECKED_IN',
  'IN_PROGRESS',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED',
];

interface StatusSummaryProps {
  appointments: Appointment[];
}

const StatusSummary: React.FC<StatusSummaryProps> = React.memo(({ appointments }) => {
  const counts = useMemo(() => {
    const map: Partial<Record<AppointmentStatus, number>> = {};
    appointments.forEach((apt) => {
      map[apt.status] = (map[apt.status] || 0) + 1;
    });
    return map;
  }, [appointments]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.summaryScroll}
    >
      {STATUS_SUMMARY_ORDER.map((key) => {
        const count = counts[key];
        if (!count) return null;
        const st = statusMap[key];
        return (
          <View key={key} style={[styles.summaryBadge, { backgroundColor: st.backgroundColor }]}>
            <Text variant="titleSmall" style={[styles.summaryCount, { color: st.color }]}>
              {count}
            </Text>
            <Text variant="labelSmall" style={[styles.summaryLabel, { color: st.color }]}>
              {st.label}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
});

interface AppointmentRowProps {
  item: Appointment;
}

const AppointmentRow: React.FC<AppointmentRowProps> = React.memo(({ item }) => {
  const st = statusMap[item.status] || statusMap.BOOKED;
  const isWhatsApp = item.source === 'whatsapp';

  return (
    <ElevatedCard accentColor={st.color}>
      <View style={styles.rowContainer}>
        <PatientAvatar name={item.patientName} size="md" />

        <View style={styles.infoColumn}>
          <View style={styles.nameRow}>
            <Text variant="titleMedium" style={styles.patientName} numberOfLines={1}>
              {item.patientName}
            </Text>
            <StatusPill status={st} compact />
          </View>
          <View style={styles.metaRow}>
            <Text variant="titleSmall" style={styles.timeText}>
              {formatTime(item.scheduledTime)}
            </Text>
            <Text variant="bodySmall" style={styles.metaDot}>·</Text>
            <Text variant="bodySmall" style={styles.bookingCode}>
              {item.bookingCode}
            </Text>
            <Text variant="bodySmall" style={styles.metaDot}>·</Text>
            <View style={styles.sourceRow}>
              <MaterialCommunityIcons
                name={isWhatsApp ? 'whatsapp' : 'walk'}
                size={12}
                color={palette.textSecondary}
              />
              <Text variant="bodySmall" style={styles.sourceText}>
                {isWhatsApp ? 'WhatsApp' : 'Walk-in'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ElevatedCard>
  );
});

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = React.memo(({ selectedDate, onDateChange }) => {
  const handlePrev = useCallback(
    () => onDateChange(addDays(selectedDate, -1)),
    [selectedDate, onDateChange],
  );
  const handleNext = useCallback(
    () => onDateChange(addDays(selectedDate, 1)),
    [selectedDate, onDateChange],
  );
  const handleToday = useCallback(() => onDateChange(new Date()), [onDateChange]);
  const dateIsToday = isToday(selectedDate);

  return (
    <ElevatedCard style={styles.dateCard}>
      <View style={styles.dateSelectorRow}>
        <IconButton
          icon="chevron-left"
          size={22}
          iconColor={palette.textPrimary}
          onPress={handlePrev}
          style={styles.dateNavButton}
        />
        <TouchableOpacity onPress={handleToday} activeOpacity={0.7} style={styles.dateLabelTouchable}>
          <Text variant="titleMedium" style={styles.dateLabelPrimary}>
            {dateIsToday ? 'Today' : formatDateShort(selectedDate)}
          </Text>
          <Text variant="bodySmall" style={styles.dateLabelSecondary}>
            {formatDateLong(selectedDate)}
          </Text>
        </TouchableOpacity>
        <IconButton
          icon="chevron-right"
          size={22}
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
    </ElevatedCard>
  );
});

const EmptyState: React.FC = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconWrap}>
      <MaterialCommunityIcons name="calendar-blank-outline" size={32} color={palette.textDisabled} />
    </View>
    <Text variant="titleMedium" style={styles.emptyTitle}>
      No appointments
    </Text>
    <Text variant="bodyMedium" style={styles.emptySubtitle}>
      There are no bookings scheduled for this day.
    </Text>
  </View>
);

const TodaysBookingsScreen: React.FC = () => {
  const { appointments, clinic } = useAppData();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const filteredAppointments = useMemo(
    () =>
      appointments
        .filter((apt) => isSameDay(apt.scheduledTime, selectedDate))
        .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()),
    [appointments, selectedDate],
  );

  const renderItem: ListRenderItem<Appointment> = useCallback(
    ({ item }) => <AppointmentRow item={item} />,
    [],
  );
  const keyExtractor = useCallback((item: Appointment) => item.id, []);

  return (
    <View style={screenStyles.screen}>
      <ScreenHeader
        title="Bookings"
        subtitle={clinic.name}
        right={
          <Appbar.Action
            icon="magnify"
            iconColor={palette.textSecondary}
            onPress={() => {}}
          />
        }
      />

      <View style={styles.content}>
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {filteredAppointments.length > 0 && (
          <View style={styles.summarySection}>
            <Text variant="labelMedium" style={styles.appointmentCount}>
              {filteredAppointments.length} APPOINTMENT
              {filteredAppointments.length !== 1 ? 'S' : ''}
            </Text>
            <StatusSummary appointments={filteredAppointments} />
          </View>
        )}

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
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
  },
  dateCard: {
    marginBottom: spacing.md,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dateNavButton: {
    margin: 0,
  },
  dateLabelTouchable: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
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
    alignSelf: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: palette.primaryContainer,
    borderRadius: radius.full,
  },
  todayPillText: {
    color: palette.primary,
    fontWeight: '600',
  },
  summarySection: {
    marginBottom: spacing.md,
  },
  appointmentCount: {
    color: palette.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  summaryScroll: {
    gap: spacing.sm,
    paddingRight: spacing.base,
  },
  summaryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    minWidth: 72,
    alignItems: 'center',
  },
  summaryCount: {
    fontWeight: '700',
  },
  summaryLabel: {
    marginTop: spacing.xxs,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  listSeparator: {
    height: spacing.sm,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    paddingLeft: spacing.md,
  },
  infoColumn: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  patientName: {
    color: palette.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  timeText: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  metaDot: {
    color: palette.textDisabled,
  },
  bookingCode: {
    color: palette.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sourceText: {
    color: palette.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: palette.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default TodaysBookingsScreen;
