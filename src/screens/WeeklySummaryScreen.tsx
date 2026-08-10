import React, { useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { palette, spacing, radius } from '../theme/theme';
import { useAppData } from '../context/AppDataContext';
import { formatDateShort, endOfDay } from '../utils/dateUtils';
import ScreenHeader from '../components/ui/ScreenHeader';
import ElevatedCard from '../components/ui/ElevatedCard';
import { screenStyles } from '../components/ui/screenStyles';
import { useBreakpoint } from '../hooks/useBreakpoint';
import WebPage from '../components/layout/WebPage';
import WebDashboardLayout from '../components/web/WebDashboardLayout';
import WebPanel from '../components/web/WebPanel';
import WebKpiRow, { type KpiItem } from '../components/web/WebKpiRow';
import DataTable, { tableRowStyles } from '../components/web/DataTable';
import type { Appointment } from '../types';

function computeWeeklyStats(weekAppointments: Appointment[], weekStart: Date, weekEnd: Date) {
  const completed = weekAppointments.filter((a) => a.status === 'COMPLETED').length;
  const noShows = weekAppointments.filter((a) => a.status === 'NO_SHOW').length;
  const cancellations = weekAppointments.filter((a) => a.status === 'CANCELLED').length;
  const total = weekAppointments.length;
  const bookingRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { weekStart, weekEnd, completed, noShows, cancellations, total, bookingRate };
}

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
  backgroundColor: string;
  icon: IconName;
  style?: object;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, backgroundColor, icon, style }) => (
  <ElevatedCard style={[styles.statCard, style]}>
    <View style={styles.statCardBody}>
      <View style={[styles.statIconWrap, { backgroundColor }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <Text variant="headlineMedium" style={[styles.statValue, { color: palette.textPrimary }]}>
        {value}
      </Text>
      <Text variant="bodySmall" style={styles.statLabel}>{label}</Text>
    </View>
  </ElevatedCard>
);

interface DayRow {
  id: string;
  day: string;
  total: number;
  completed: number;
  noShows: number;
}

const DAY_COLUMNS = [
  { key: 'day', label: 'Day', flex: 2 },
  { key: 'total', label: 'Total', flex: 1 },
  { key: 'completed', label: 'Completed', flex: 1 },
  { key: 'noShows', label: 'No-shows', flex: 1, align: 'right' as const },
];

const WeeklySummaryScreen: React.FC = () => {
  const { getWeeklyStats, appointments, fetchAppointmentsInRange, isFirebaseMode } = useAppData();
  const { isDesktopWeb } = useBreakpoint();
  const fallbackStats = useMemo(() => getWeeklyStats(), [getWeeklyStats]);
  const [weekAppointments, setWeekAppointments] = useState<Appointment[] | null>(null);
  const [loadingWeek, setLoadingWeek] = useState(false);

  useEffect(() => {
    if (!isFirebaseMode) {
      setWeekAppointments(null);
      return undefined;
    }

    let cancelled = false;
    setLoadingWeek(true);

    fetchAppointmentsInRange(fallbackStats.weekStart, endOfDay(fallbackStats.weekEnd))
      .then((rows) => {
        if (!cancelled) {
          setWeekAppointments(rows);
          setLoadingWeek(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWeekAppointments([]);
          setLoadingWeek(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isFirebaseMode, fetchAppointmentsInRange, fallbackStats.weekStart, fallbackStats.weekEnd]);

  const sourceAppointments = isFirebaseMode && weekAppointments !== null
    ? weekAppointments
    : appointments;

  const stats = useMemo(
    () => computeWeeklyStats(sourceAppointments, fallbackStats.weekStart, fallbackStats.weekEnd),
    [sourceAppointments, fallbackStats.weekStart, fallbackStats.weekEnd],
  );

  const dailyRows = useMemo<DayRow[]>(() => {
    const rows: DayRow[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(stats.weekStart);
      day.setDate(day.getDate() + i);
      const dayAppts = sourceAppointments.filter((a) => {
        const t = new Date(a.scheduledTime);
        return t.toDateString() === day.toDateString();
      });
      rows.push({
        id: day.toISOString(),
        day: formatDateShort(day),
        total: dayAppts.length,
        completed: dayAppts.filter((a) => a.status === 'COMPLETED').length,
        noShows: dayAppts.filter((a) => a.status === 'NO_SHOW').length,
      });
    }
    return rows;
  }, [sourceAppointments, stats.weekStart]);

  const kpiItems = useMemo<KpiItem[]>(() => [
    {
      key: 'completed',
      label: 'Completed',
      value: stats.completed,
      icon: 'check-circle-outline',
      color: palette.success,
      backgroundColor: palette.successLight,
    },
    {
      key: 'no-shows',
      label: 'No-shows',
      value: stats.noShows,
      icon: 'account-cancel-outline',
      color: palette.error,
      backgroundColor: palette.errorLight,
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      value: stats.cancellations,
      icon: 'calendar-remove-outline',
      color: palette.warning,
      backgroundColor: palette.warningLight,
    },
    {
      key: 'total',
      label: 'Total appointments',
      value: stats.total,
      icon: 'calendar-multiple',
      color: palette.primary,
      backgroundColor: palette.primaryLight,
    },
    {
      key: 'rate',
      label: 'Completion rate',
      value: `${stats.bookingRate}%`,
      icon: 'chart-line',
      color: palette.primary,
      backgroundColor: palette.primaryContainer,
    },
  ], [stats]);

  const insightCard = (
    <View style={[
      styles.insightBanner,
      { backgroundColor: stats.bookingRate >= 80 ? palette.successLight : palette.warningLight },
    ]}>
      <MaterialCommunityIcons
        name={stats.bookingRate >= 80 ? 'thumb-up-outline' : 'lightbulb-outline'}
        size={18}
        color={stats.bookingRate >= 80 ? palette.success : palette.warning}
      />
      <Text
        variant="bodyMedium"
        style={[
          styles.insightText,
          { color: stats.bookingRate >= 80 ? palette.success : palette.warning },
        ]}
      >
        {stats.bookingRate >= 80
          ? 'Strong week — completion above 80%.'
          : 'Consider reminder messages to reduce no-shows.'}
      </Text>
    </View>
  );

  const mobileBody = (
    <View style={styles.content}>
      <ElevatedCard style={styles.periodCard}>
        <Text variant="titleSmall" style={styles.periodText}>
          {formatDateShort(stats.weekStart)} – {formatDateShort(stats.weekEnd)}
        </Text>
        <Text variant="bodySmall" style={styles.periodSubtext}>Last 7 days</Text>
      </ElevatedCard>

      <View style={styles.statsGrid}>
        {kpiItems.slice(0, 4).map((item) => (
          <StatCard
            key={item.key}
            label={item.label}
            value={item.value}
            color={item.color}
            backgroundColor={item.backgroundColor}
            icon={item.icon}
          />
        ))}
      </View>

      <ElevatedCard>
        <View style={styles.summaryCardBody}>
          <Text variant="titleSmall" style={styles.summaryTitle}>Summary</Text>
          <Text variant="bodyMedium" style={styles.summaryText}>
            {stats.total} total appointments. {stats.completed} patients seen,{' '}
            {stats.noShows} no-shows, {stats.cancellations} cancellations.
          </Text>
          {insightCard}
        </View>
      </ElevatedCard>
    </View>
  );

  if (isDesktopWeb) {
    return (
      <View style={screenStyles.screen}>
        <WebPage fill>
          <WebDashboardLayout
            header={
              <>
                <WebKpiRow items={kpiItems} />
                <ElevatedCard style={styles.webPeriodBar}>
                  <Text variant="titleSmall" style={styles.periodText}>
                    {formatDateShort(stats.weekStart)} – {formatDateShort(stats.weekEnd)}
                  </Text>
                  <Text variant="bodySmall" style={styles.periodSubtext}>
                    {loadingWeek ? 'Loading past 7 days…' : 'Last 7 days performance'}
                  </Text>
                </ElevatedCard>
              </>
            }
            main={
              <WebPanel title="Daily breakdown" subtitle="Appointments by day">
                <DataTable
                  fill
                  columns={DAY_COLUMNS}
                  data={dailyRows}
                  keyExtractor={(row) => row.id}
                  renderRow={(row) => (
                    <View style={tableRowStyles.row}>
                      <View style={[tableRowStyles.cell, { flex: 2 }]}>
                        <Text variant="bodyMedium" style={styles.dayCell}>{row.day}</Text>
                      </View>
                      <View style={[tableRowStyles.cell, { flex: 1 }]}>
                        <Text variant="titleSmall" style={styles.numCell}>{row.total}</Text>
                      </View>
                      <View style={[tableRowStyles.cell, { flex: 1 }]}>
                        <Text variant="titleSmall" style={[styles.numCell, { color: palette.success }]}>
                          {row.completed}
                        </Text>
                      </View>
                      <View style={[tableRowStyles.cell, tableRowStyles.alignRight, { flex: 1 }]}>
                        <Text variant="titleSmall" style={[styles.numCell, { color: palette.error }]}>
                          {row.noShows}
                        </Text>
                      </View>
                    </View>
                  )}
                  emptyState={
                    <Text variant="bodyMedium" style={styles.emptyTableText}>
                      No appointment data for this week.
                    </Text>
                  }
                />
              </WebPanel>
            }
            aside={
              <View style={styles.webAsideStack}>
                <WebPanel title="Week summary" subtitle="Overview">
                  <View style={styles.summaryCardBody}>
                    <Text variant="bodyMedium" style={styles.summaryText}>
                      {stats.total} total appointments this week. {stats.completed} patients seen successfully.
                    </Text>
                    <View style={styles.breakdownList}>
                      <View style={styles.breakdownRow}>
                        <Text variant="bodySmall" style={styles.breakdownLabel}>Completed</Text>
                        <Text variant="titleSmall" style={styles.breakdownValue}>{stats.completed}</Text>
                      </View>
                      <View style={styles.breakdownRow}>
                        <Text variant="bodySmall" style={styles.breakdownLabel}>No-shows</Text>
                        <Text variant="titleSmall" style={styles.breakdownValue}>{stats.noShows}</Text>
                      </View>
                      <View style={styles.breakdownRow}>
                        <Text variant="bodySmall" style={styles.breakdownLabel}>Cancelled</Text>
                        <Text variant="titleSmall" style={styles.breakdownValue}>{stats.cancellations}</Text>
                      </View>
                      <View style={styles.breakdownRow}>
                        <Text variant="bodySmall" style={styles.breakdownLabel}>Completion rate</Text>
                        <Text variant="titleSmall" style={[styles.breakdownValue, { color: palette.primary }]}>
                          {stats.bookingRate}%
                        </Text>
                      </View>
                    </View>
                  </View>
                </WebPanel>

                <WebPanel title="Recommendation" subtitle="Actionable insight" style={styles.webAsideFlex}>
                  <View style={styles.insightPanelBody}>
                    {insightCard}
                    <Text variant="bodySmall" style={styles.insightNote}>
                      WhatsApp reminders before appointments can significantly reduce no-show rates for walk-in and remote bookings.
                    </Text>
                  </View>
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
      <ScreenHeader title="Weekly Summary" subtitle="Clinic performance" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {mobileBody}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  webPeriodBar: {
    marginTop: spacing.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  periodCard: {
    padding: spacing.base,
    alignItems: 'center',
  },
  periodText: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  periodSubtext: {
    color: palette.textSecondary,
    marginTop: spacing.xxs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    minWidth: '45%',
  },
  statCardBody: {
    padding: spacing.base,
    alignItems: 'flex-start',
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: palette.textSecondary,
    marginTop: spacing.xxs,
    fontWeight: '500',
  },
  summaryCardBody: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  summaryText: {
    color: palette.textSecondary,
    lineHeight: 22,
  },
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
  },
  insightText: {
    flex: 1,
    fontWeight: '600',
    lineHeight: 20,
  },
  webAsideStack: {
    flex: 1,
    gap: spacing.md,
    minHeight: 0,
  },
  webAsideFlex: {
    flex: 1,
    minHeight: 0,
  },
  breakdownList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  breakdownLabel: {
    color: palette.textSecondary,
  },
  breakdownValue: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  insightPanelBody: {
    padding: spacing.lg,
    gap: spacing.lg,
    flex: 1,
  },
  insightNote: {
    color: palette.textSecondary,
    lineHeight: 20,
  },
  dayCell: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  numCell: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  emptyTableText: {
    color: palette.textSecondary,
    textAlign: 'center',
  },
});

export default WeeklySummaryScreen;
