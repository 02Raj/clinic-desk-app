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
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useAppointmentsForDate } from '../hooks/useAppointmentsForDate';
import WebPage from '../components/layout/WebPage';
import WebDashboardLayout from '../components/web/WebDashboardLayout';
import WebPanel from '../components/web/WebPanel';
import WebKpiRow, { type KpiItem } from '../components/web/WebKpiRow';
import DataTable, { tableRowStyles } from '../components/web/DataTable';

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

const BOOKING_COLUMNS = [
  { key: 'patient', label: 'Patient', flex: 2 },
  { key: 'time', label: 'Time', flex: 1 },
  { key: 'code', label: 'Code', flex: 1 },
  { key: 'source', label: 'Source', flex: 1 },
  { key: 'status', label: 'Status', flex: 1, align: 'right' as const },
];

const AppointmentTableRow: React.FC<AppointmentRowProps> = React.memo(({ item }) => {
  const st = statusMap[item.status] || statusMap.BOOKED;
  const isWhatsApp = item.source === 'whatsapp';

  return (
    <View style={tableRowStyles.row}>
      <View style={[tableRowStyles.cell, { flex: 2 }]}>
        <View style={styles.tablePatientCell}>
          <PatientAvatar name={item.patientName} size="sm" />
          <Text variant="titleSmall" style={styles.patientName} numberOfLines={1}>
            {item.patientName}
          </Text>
        </View>
      </View>
      <View style={[tableRowStyles.cell, { flex: 1 }]}>
        <Text variant="bodyMedium" style={styles.timeText}>
          {formatTime(item.scheduledTime)}
        </Text>
      </View>
      <View style={[tableRowStyles.cell, { flex: 1 }]}>
        <Text variant="bodyMedium" style={styles.bookingCode}>
          {item.bookingCode}
        </Text>
      </View>
      <View style={[tableRowStyles.cell, { flex: 1 }]}>
        <View style={styles.sourceRow}>
          <MaterialCommunityIcons
            name={isWhatsApp ? 'whatsapp' : 'walk'}
            size={14}
            color={palette.textSecondary}
          />
          <Text variant="bodySmall" style={styles.sourceText}>
            {isWhatsApp ? 'WhatsApp' : 'Walk-in'}
          </Text>
        </View>
      </View>
      <View style={[tableRowStyles.cell, tableRowStyles.alignRight, { flex: 1 }]}>
        <StatusPill status={st} compact />
      </View>
    </View>
  );
});

const DateSelector: React.FC<DateSelectorProps & { compact?: boolean }> = React.memo(({
  selectedDate,
  onDateChange,
  compact = false,
}) => {
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

  if (compact) {
    return (
      <View style={styles.dateToolbar}>
        <IconButton
          icon="chevron-left"
          size={20}
          iconColor={palette.textPrimary}
          onPress={handlePrev}
          style={styles.dateNavButton}
        />
        <TouchableOpacity onPress={handleToday} activeOpacity={0.7} style={styles.dateToolbarLabel}>
          <Text variant="titleSmall" style={styles.dateLabelPrimary}>
            {dateIsToday ? 'Today' : formatDateShort(selectedDate)}
          </Text>
          <Text variant="bodySmall" style={styles.dateLabelSecondary}>
            {formatDateLong(selectedDate)}
          </Text>
        </TouchableOpacity>
        <IconButton
          icon="chevron-right"
          size={20}
          iconColor={palette.textPrimary}
          onPress={handleNext}
          style={styles.dateNavButton}
        />
        {!dateIsToday && (
          <TouchableOpacity onPress={handleToday} style={styles.todayPillCompact}>
            <Text variant="labelSmall" style={styles.todayPillText}>Today</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

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

const EmptyState: React.FC<{ past?: boolean; future?: boolean }> = ({ past, future }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconWrap}>
      <MaterialCommunityIcons
        name={past ? 'history' : future ? 'calendar-arrow-right' : 'calendar-blank-outline'}
        size={32}
        color={palette.textDisabled}
      />
    </View>
    <Text variant="titleMedium" style={styles.emptyTitle}>
      {past ? 'No records for this day' : future ? 'No bookings yet' : 'No appointments'}
    </Text>
    <Text variant="bodyMedium" style={styles.emptySubtitle}>
      {past
        ? 'There were no appointments on this date.'
        : future
          ? 'No appointments scheduled for this day yet.'
          : 'There are no bookings scheduled for this day.'}
    </Text>
  </View>
);

interface PastRecordBannerProps {
  isPast: boolean;
  isFuture: boolean;
  loading?: boolean;
}

const PastRecordBanner: React.FC<PastRecordBannerProps> = ({ isPast, isFuture, loading }) => {
  if (!isPast && !isFuture && !loading) return null;

  return (
    <View style={[styles.recordBanner, isPast && styles.recordBannerPast, isFuture && styles.recordBannerFuture]}>
      <MaterialCommunityIcons
        name={loading ? 'loading' : isPast ? 'history' : 'calendar-clock'}
        size={18}
        color={isPast ? palette.warning : palette.primary}
      />
      <Text variant="bodySmall" style={styles.recordBannerText}>
        {loading
          ? 'Loading records for this date…'
          : isPast
            ? 'Past record — read only. Use arrows to browse older appointments.'
            : 'Upcoming day — bookings may still change.'}
      </Text>
    </View>
  );
};

const TodaysBookingsScreen: React.FC = () => {
  const { clinic, queue } = useAppData();
  const { isDesktopWeb } = useBreakpoint();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const {
    appointments: filteredAppointments,
    loading: loadingDate,
    isPastRecord,
    isFutureDate,
  } = useAppointmentsForDate(selectedDate);

  const viewingToday = isToday(selectedDate);

  const kpiItems = useMemo<KpiItem[]>(() => {
    const booked = filteredAppointments.filter((a) =>
      ['BOOKED', 'CONFIRMED'].includes(a.status),
    ).length;
    const inClinic = filteredAppointments.filter((a) =>
      ['CHECKED_IN', 'IN_PROGRESS'].includes(a.status),
    ).length;
    const completed = filteredAppointments.filter((a) => a.status === 'COMPLETED').length;
    const noShows = filteredAppointments.filter((a) => a.status === 'NO_SHOW').length;
    const cancelled = filteredAppointments.filter((a) => a.status === 'CANCELLED').length;
    const waiting = viewingToday ? queue.waitingList.length + (queue.currentPatient ? 1 : 0) : 0;

    const items: KpiItem[] = [
      {
        key: 'total',
        label: 'Appointments',
        value: filteredAppointments.length,
        icon: 'calendar-multiple',
        color: palette.primary,
        backgroundColor: palette.primaryLight,
      },
      {
        key: 'booked',
        label: viewingToday ? 'Booked' : 'Scheduled',
        value: booked,
        icon: 'bookmark-outline',
        color: palette.primary,
        backgroundColor: palette.primaryContainer,
      },
    ];

    if (viewingToday) {
      items.push(
        {
          key: 'in-clinic',
          label: 'In clinic',
          value: inClinic,
          icon: 'account-check-outline',
          color: palette.success,
          backgroundColor: palette.successLight,
        },
        {
          key: 'queue',
          label: 'Live queue',
          value: waiting,
          icon: 'account-group-outline',
          color: palette.neutral,
          backgroundColor: palette.neutralLight,
        },
      );
    } else if (isPastRecord) {
      items.push(
        {
          key: 'no-shows',
          label: 'No-shows',
          value: noShows,
          icon: 'account-cancel-outline',
          color: palette.error,
          backgroundColor: palette.errorLight,
        },
        {
          key: 'cancelled',
          label: 'Cancelled',
          value: cancelled,
          icon: 'calendar-remove-outline',
          color: palette.warning,
          backgroundColor: palette.warningLight,
        },
      );
    }

    items.push({
      key: 'done',
      label: 'Completed',
      value: completed,
      icon: 'check-circle-outline',
      color: palette.success,
      backgroundColor: palette.successLight,
    });

    return items;
  }, [filteredAppointments, queue, viewingToday, isPastRecord]);

  const upcomingAppointments = useMemo(
    () => filteredAppointments.filter((a) => ['BOOKED', 'CONFIRMED'].includes(a.status)).slice(0, 5),
    [filteredAppointments],
  );

  const renderItem: ListRenderItem<Appointment> = useCallback(
    ({ item }) => <AppointmentRow item={item} />,
    [],
  );
  const keyExtractor = useCallback((item: Appointment) => item.id, []);

  if (isDesktopWeb) {
    return (
      <View style={screenStyles.screen}>
        <WebPage fill>
          <WebDashboardLayout
            header={
              <>
                <WebKpiRow items={kpiItems} />
                <PastRecordBanner isPast={isPastRecord} isFuture={isFutureDate} loading={loadingDate} />
                <View style={styles.webToolbar}>
                  <DateSelector
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    compact
                  />
                  {filteredAppointments.length > 0 && (
                    <View style={styles.webToolbarStats}>
                      <StatusSummary appointments={filteredAppointments} />
                    </View>
                  )}
                </View>
              </>
            }
            main={
              <WebPanel
                title={isPastRecord ? 'Day record' : 'Appointments'}
                subtitle={`${filteredAppointments.length} for ${formatDateLong(selectedDate)}`}
              >
                <DataTable
                  fill
                  columns={BOOKING_COLUMNS}
                  data={filteredAppointments}
                  keyExtractor={keyExtractor}
                  renderRow={(item) => <AppointmentTableRow item={item} />}
                  emptyState={<EmptyState past={isPastRecord} future={isFutureDate} />}
                />
              </WebPanel>
            }
            aside={
              <View style={styles.webAsideStack}>
                <WebPanel title="Clinic" subtitle={clinic.name} style={styles.webAsidePanel}>
                  <View style={styles.clinicInfoBody}>
                    <View style={styles.clinicInfoRow}>
                      <MaterialCommunityIcons name="clock-outline" size={18} color={palette.textSecondary} />
                      <Text variant="bodyMedium" style={styles.clinicInfoText}>
                        {clinic.workingHours.start} – {clinic.workingHours.end}
                      </Text>
                    </View>
                    <View style={styles.clinicInfoRow}>
                      <MaterialCommunityIcons name="timer-outline" size={18} color={palette.textSecondary} />
                      <Text variant="bodyMedium" style={styles.clinicInfoText}>
                        {clinic.slotDurationMinutes} min slots
                      </Text>
                    </View>
                  </View>
                </WebPanel>

                {viewingToday ? (
                  <WebPanel
                    title="Live queue"
                    subtitle={`${queue.waitingList.length} waiting`}
                    style={styles.webAsidePanel}
                  >
                    <View style={styles.queuePreviewBody}>
                      {queue.currentPatient ? (
                        <View style={styles.queueNowRow}>
                          <Text variant="labelSmall" style={styles.queueNowLabel}>NOW</Text>
                          <Text variant="titleSmall" style={styles.queueNowName} numberOfLines={1}>
                            #{queue.currentPatient.tokenNumber} {queue.currentPatient.patientName}
                          </Text>
                        </View>
                      ) : (
                        <Text variant="bodySmall" style={styles.queueEmptyText}>No patient with doctor</Text>
                      )}
                      {queue.waitingList.slice(0, 4).map((p, i) => (
                        <View key={p.id} style={styles.queuePreviewRow}>
                          <Text variant="labelSmall" style={styles.queuePos}>#{i + 1}</Text>
                          <Text variant="bodyMedium" style={styles.queueName} numberOfLines={1}>
                            {p.patientName}
                          </Text>
                          <Text variant="bodySmall" style={styles.queueToken}>T{p.tokenNumber}</Text>
                        </View>
                      ))}
                      {queue.waitingList.length === 0 && !queue.currentPatient && (
                        <Text variant="bodySmall" style={styles.queueEmptyText}>
                          Check-ins appear here in real time.
                        </Text>
                      )}
                    </View>
                  </WebPanel>
                ) : (
                  <WebPanel
                    title="Day summary"
                    subtitle={isPastRecord ? 'Historical snapshot' : 'Scheduled day'}
                    style={styles.webAsidePanel}
                  >
                    <View style={styles.daySummaryBody}>
                      <View style={styles.daySummaryRow}>
                        <Text variant="bodySmall" style={styles.daySummaryLabel}>Completed</Text>
                        <Text variant="titleSmall" style={styles.daySummaryValue}>
                          {filteredAppointments.filter((a) => a.status === 'COMPLETED').length}
                        </Text>
                      </View>
                      <View style={styles.daySummaryRow}>
                        <Text variant="bodySmall" style={styles.daySummaryLabel}>No-shows</Text>
                        <Text variant="titleSmall" style={[styles.daySummaryValue, { color: palette.error }]}>
                          {filteredAppointments.filter((a) => a.status === 'NO_SHOW').length}
                        </Text>
                      </View>
                      <View style={styles.daySummaryRow}>
                        <Text variant="bodySmall" style={styles.daySummaryLabel}>Cancelled</Text>
                        <Text variant="titleSmall" style={[styles.daySummaryValue, { color: palette.warning }]}>
                          {filteredAppointments.filter((a) => a.status === 'CANCELLED').length}
                        </Text>
                      </View>
                    </View>
                  </WebPanel>
                )}

                <WebPanel
                  title={viewingToday ? 'Up next' : 'All patients'}
                  subtitle={viewingToday ? 'Awaiting check-in' : 'Full list for this day'}
                  style={styles.webAsidePanelFlex}
                >
                  <ScrollView style={styles.upNextScroll} showsVerticalScrollIndicator={false}>
                    {(viewingToday ? upcomingAppointments : filteredAppointments).length === 0 ? (
                      <Text variant="bodySmall" style={styles.queueEmptyText}>
                        {viewingToday ? 'No upcoming bookings for this day.' : 'No patients for this day.'}
                      </Text>
                    ) : (
                      (viewingToday ? upcomingAppointments : filteredAppointments).map((apt) => (
                        <View key={apt.id} style={styles.upNextRow}>
                          <Text variant="titleSmall" style={styles.upNextTime}>
                            {formatTime(apt.scheduledTime)}
                          </Text>
                          <View style={styles.upNextInfo}>
                            <Text variant="bodyMedium" style={styles.upNextName} numberOfLines={1}>
                              {apt.patientName}
                            </Text>
                            <Text variant="bodySmall" style={styles.upNextCode}>{apt.bookingCode}</Text>
                          </View>
                        </View>
                      ))
                    )}
                  </ScrollView>
                </WebPanel>
              </View>
            }
          />
        </WebPage>
      </View>
    );
  }

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
        <PastRecordBanner isPast={isPastRecord} isFuture={isFutureDate} loading={loadingDate} />
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
          ListEmptyComponent={<EmptyState past={isPastRecord} future={isFutureDate} />}
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
  webToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  dateToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  dateToolbarLabel: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    minWidth: 200,
  },
  todayPillCompact: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: palette.primaryContainer,
    borderRadius: radius.full,
  },
  webToolbarStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  webCountLabel: {
    color: palette.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  tablePatientCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  webAsideStack: {
    flex: 1,
    gap: spacing.md,
    minHeight: 0,
  },
  webAsidePanel: {
    flex: 0,
  },
  webAsidePanelFlex: {
    flex: 1,
    minHeight: 120,
  },
  clinicInfoBody: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  clinicInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clinicInfoText: {
    color: palette.textPrimary,
    fontWeight: '500',
  },
  queuePreviewBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  queueNowRow: {
    padding: spacing.md,
    backgroundColor: palette.primaryContainer,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  queueNowLabel: {
    color: palette.primary,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: spacing.xxs,
  },
  queueNowName: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  queuePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  queuePos: {
    color: palette.textDisabled,
    width: 24,
  },
  queueName: {
    flex: 1,
    color: palette.textPrimary,
    fontWeight: '500',
  },
  queueToken: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  queueEmptyText: {
    color: palette.textSecondary,
    padding: spacing.lg,
    lineHeight: 20,
  },
  upNextScroll: {
    flex: 1,
    padding: spacing.lg,
  },
  upNextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  upNextTime: {
    color: palette.primary,
    fontWeight: '700',
    width: 72,
  },
  upNextInfo: {
    flex: 1,
    minWidth: 0,
  },
  upNextName: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  upNextCode: {
    color: palette.textSecondary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  recordBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: palette.primaryContainer,
    marginBottom: spacing.sm,
  },
  recordBannerPast: {
    backgroundColor: palette.warningLight,
  },
  recordBannerFuture: {
    backgroundColor: palette.primaryContainer,
  },
  recordBannerText: {
    flex: 1,
    color: palette.textSecondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  daySummaryBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  daySummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  daySummaryLabel: {
    color: palette.textSecondary,
  },
  daySummaryValue: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
});

export default TodaysBookingsScreen;
