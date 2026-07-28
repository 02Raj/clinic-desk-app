import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  type ListRenderItem,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  palette,
  spacing,
  radius,
  appointmentStatus as statusMap,
} from '../theme/theme';
import { useAppData } from '../context/AppDataContext';
import { formatTime } from '../utils/dateUtils';
import type { QueuePatient } from '../types';
import ScreenHeader from '../components/ui/ScreenHeader';
import ElevatedCard from '../components/ui/ElevatedCard';
import StatusPill from '../components/ui/StatusPill';
import PatientAvatar from '../components/ui/PatientAvatar';
import SectionLabel from '../components/ui/SectionLabel';
import { screenStyles } from '../components/ui/screenStyles';

interface NowSeeingCardProps {
  patient: QueuePatient | null;
}

const NowSeeingCard: React.FC<NowSeeingCardProps> = React.memo(({ patient }) => {
  if (!patient) return null;
  const st = statusMap.IN_PROGRESS;

  return (
    <View style={styles.nowSeeingSection}>
      <SectionLabel>Now seeing</SectionLabel>
      <ElevatedCard style={styles.nowSeeingCard} accentColor={palette.primary}>
        <View style={styles.nowSeeingBody}>
          <View style={styles.tokenBadgeLarge}>
            <Text variant="headlineMedium" style={styles.tokenBadgeLargeText}>
              {patient.tokenNumber}
            </Text>
          </View>
          <View style={styles.nowSeeingInfo}>
            <Text variant="titleMedium" style={styles.patientNamePrimary} numberOfLines={1}>
              {patient.patientName}
            </Text>
            <Text variant="bodySmall" style={styles.secondaryText}>
              {patient.bookingCode} · Called {patient.calledAt ? formatTime(patient.calledAt) : '—'}
            </Text>
          </View>
          <StatusPill status={st} />
        </View>
      </ElevatedCard>
    </View>
  );
});

interface EmptyQueueProps {
  hasCurrent: boolean;
}

const EmptyQueue: React.FC<EmptyQueueProps> = React.memo(({ hasCurrent }) => (
  <View style={styles.emptyContainer}>
    <MaterialCommunityIcons name="account-clock-outline" size={40} color={palette.textDisabled} />
    <Text variant="titleMedium" style={styles.emptyTitle}>
      {hasCurrent ? 'No one else waiting' : 'Queue is empty'}
    </Text>
    <Text variant="bodyMedium" style={styles.emptySubtitle}>
      {hasCurrent
        ? 'Remaining patients appear here as they check in.'
        : 'Checked-in patients appear here in order.'}
    </Text>
  </View>
));

interface WaitingRowProps {
  item: QueuePatient;
  position: number;
}

const WaitingRow: React.FC<WaitingRowProps> = React.memo(({ item, position }) => {
  const st = statusMap.CHECKED_IN;

  return (
    <ElevatedCard>
      <View style={styles.rowContainer}>
        <View style={styles.positionCol}>
          <Text variant="labelSmall" style={styles.positionLabel}>#{position}</Text>
          <View style={styles.tokenBadge}>
            <Text variant="titleSmall" style={styles.tokenBadgeText}>
              {item.tokenNumber}
            </Text>
          </View>
        </View>
        <PatientAvatar name={item.patientName} size="sm" />
        <View style={styles.infoColumn}>
          <Text variant="titleMedium" style={styles.patientName} numberOfLines={1}>
            {item.patientName}
          </Text>
          <Text variant="bodySmall" style={styles.secondaryText}>
            {item.bookingCode} · In at {formatTime(item.checkedInAt)}
          </Text>
        </View>
        <StatusPill status={st} compact />
      </View>
    </ElevatedCard>
  );
});

const QueueCompleteState: React.FC = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.completeIcon}>
      <MaterialCommunityIcons name="check-all" size={32} color={palette.success} />
    </View>
    <Text variant="titleMedium" style={styles.emptyTitle}>
      All patients seen
    </Text>
    <Text variant="bodyMedium" style={styles.emptySubtitle}>
      New check-ins will appear here automatically.
    </Text>
  </View>
);

const LiveQueueScreen: React.FC = () => {
  const { queue, callNext } = useAppData();
  const { currentPatient, waitingList } = queue;
  const [calling, setCalling] = React.useState(false);

  const handleCallNext = useCallback(async () => {
    if (waitingList.length === 0) return;
    setCalling(true);
    await callNext();
    setCalling(false);
  }, [waitingList.length, callNext]);

  const renderItem: ListRenderItem<QueuePatient> = useCallback(
    ({ item, index }) => <WaitingRow item={item} position={index + 1} />,
    [],
  );
  const keyExtractor = useCallback((item: QueuePatient) => item.id, []);

  const queueFullyEmpty = !currentPatient && waitingList.length === 0;

  return (
    <View style={screenStyles.screen}>
      <ScreenHeader title="Live Queue" subtitle="Real-time patient flow" />

      {queueFullyEmpty ? (
        <QueueCompleteState />
      ) : (
        <View style={styles.content}>
          <NowSeeingCard patient={currentPatient} />

          <ElevatedCard style={styles.actionCard}>
            <View style={styles.actionRow}>
              <View>
                <SectionLabel>Waiting</SectionLabel>
                <Text variant="headlineSmall" style={styles.waitingCount}>
                  {waitingList.length}
                  <Text variant="bodyMedium" style={styles.waitingLabel}>
                    {' '}patient{waitingList.length !== 1 ? 's' : ''}
                  </Text>
                </Text>
              </View>
              <Button
                mode="contained"
                icon="account-arrow-right"
                onPress={handleCallNext}
                loading={calling}
                disabled={waitingList.length === 0 || calling}
                style={styles.callNextButton}
                contentStyle={styles.callNextContent}
                labelStyle={styles.callNextLabel}
              >
                Call Next
              </Button>
            </View>
          </ElevatedCard>

          <FlatList
            data={waitingList}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={[
              styles.listContent,
              waitingList.length === 0 && styles.listContentEmpty,
            ]}
            ListEmptyComponent={<EmptyQueue hasCurrent={!!currentPatient} />}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
  },
  nowSeeingSection: {
    marginBottom: spacing.md,
  },
  nowSeeingCard: {
    backgroundColor: palette.primaryContainer,
    borderColor: palette.primaryLight,
  },
  nowSeeingBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    paddingLeft: spacing.md,
  },
  tokenBadgeLarge: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tokenBadgeLargeText: {
    color: palette.textOnPrimary,
    fontWeight: '700',
  },
  nowSeeingInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  patientNamePrimary: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  actionCard: {
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
  },
  waitingCount: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  waitingLabel: {
    color: palette.textSecondary,
    fontWeight: '400',
  },
  callNextButton: {
    borderRadius: radius.sm,
    backgroundColor: palette.primary,
  },
  callNextContent: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  callNextLabel: {
    fontWeight: '700',
    fontSize: 15,
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
  },
  positionCol: {
    alignItems: 'center',
    marginRight: spacing.sm,
    minWidth: 36,
  },
  positionLabel: {
    color: palette.textDisabled,
    marginBottom: spacing.xxs,
  },
  tokenBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: palette.neutralLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenBadgeText: {
    color: palette.neutral,
    fontWeight: '700',
  },
  infoColumn: {
    flex: 1,
    marginRight: spacing.sm,
  },
  patientName: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  secondaryText: {
    color: palette.textSecondary,
    marginTop: spacing.xxs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  completeIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: palette.successLight,
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

export default LiveQueueScreen;
