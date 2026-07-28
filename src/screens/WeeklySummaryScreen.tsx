import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { palette, spacing, radius } from '../theme/theme';
import { useAppData } from '../context/AppDataContext';
import { formatDateShort } from '../utils/dateUtils';
import ScreenHeader from '../components/ui/ScreenHeader';
import ElevatedCard from '../components/ui/ElevatedCard';
import { screenStyles } from '../components/ui/screenStyles';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
  backgroundColor: string;
  icon: IconName;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, backgroundColor, icon }) => (
  <ElevatedCard style={styles.statCard}>
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

const WeeklySummaryScreen: React.FC = () => {
  const { getWeeklyStats } = useAppData();
  const stats = useMemo(() => getWeeklyStats(), [getWeeklyStats]);

  return (
    <View style={screenStyles.screen}>
      <ScreenHeader title="Weekly Summary" subtitle="Clinic performance" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ElevatedCard style={styles.periodCard}>
          <Text variant="titleSmall" style={styles.periodText}>
            {formatDateShort(stats.weekStart)} – {formatDateShort(stats.weekEnd)}
          </Text>
          <Text variant="bodySmall" style={styles.periodSubtext}>
            Last 7 days
          </Text>
        </ElevatedCard>

        <View style={styles.statsGrid}>
          <StatCard
            label="Completed"
            value={stats.completed}
            color={palette.success}
            backgroundColor={palette.successLight}
            icon="check-circle-outline"
          />
          <StatCard
            label="No-shows"
            value={stats.noShows}
            color={palette.error}
            backgroundColor={palette.errorLight}
            icon="account-cancel-outline"
          />
          <StatCard
            label="Cancelled"
            value={stats.cancellations}
            color={palette.warning}
            backgroundColor={palette.warningLight}
            icon="calendar-remove-outline"
          />
          <StatCard
            label="Completion rate"
            value={`${stats.bookingRate}%`}
            color={palette.primary}
            backgroundColor={palette.primaryLight}
            icon="chart-line"
          />
        </View>

        <ElevatedCard>
          <View style={styles.summaryCardBody}>
            <Text variant="titleSmall" style={styles.summaryTitle}>Summary</Text>
            <Text variant="bodyMedium" style={styles.summaryText}>
              {stats.total} total appointments. {stats.completed} patients seen,{' '}
              {stats.noShows} no-shows, {stats.cancellations} cancellations.
            </Text>
            <View style={[
              styles.insightBanner,
              { backgroundColor: stats.bookingRate >= 80 ? palette.successLight : palette.warningLight },
            ]}>
              <MaterialCommunityIcons
                name={stats.bookingRate >= 80 ? 'thumb-up-outline' : 'lightbulb-outline'}
                size={16}
                color={stats.bookingRate >= 80 ? palette.success : palette.warning}
              />
              <Text
                variant="bodySmall"
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
          </View>
        </ElevatedCard>
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
    padding: spacing.base,
  },
  summaryTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  summaryText: {
    color: palette.textSecondary,
    lineHeight: 22,
  },
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.sm,
  },
  insightText: {
    flex: 1,
    fontWeight: '600',
    lineHeight: 18,
  },
});

export default WeeklySummaryScreen;
