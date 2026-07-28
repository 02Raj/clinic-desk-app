import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  Appbar,
  Card,
  Chip,
  Text,
  Button,
  Divider,
  IconButton,
} from 'react-native-paper';
import {
  palette,
  spacing,
  radius,
  shadows,
  appointmentStatus as statusMap,
} from '../theme/theme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatTime = (date) =>
  date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

// ---------------------------------------------------------------------------
// Mock queue seed data
// ---------------------------------------------------------------------------
// Simulates a mid-morning state: one patient in-progress, several waiting.
// In production this comes from the Firestore `clinics/{id}/queue/{queueId}`
// subcollection + appointment lookups.

const todayAt = (h, m = 0) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

const INITIAL_CURRENT = {
  id: 'apt-003',
  patientName: 'Amit Patel',
  bookingCode: 'AP10',
  scheduledTime: todayAt(10, 0),
  checkedInAt: todayAt(9, 52),
  calledAt: todayAt(10, 3),
  tokenNumber: 3,
  status: 'IN_PROGRESS',
};

const INITIAL_WAITING = [
  {
    id: 'apt-004',
    patientName: 'Sunita Devi',
    bookingCode: 'SD10',
    scheduledTime: todayAt(10, 30),
    checkedInAt: todayAt(10, 12),
    tokenNumber: 4,
    status: 'CHECKED_IN',
  },
  {
    id: 'apt-005',
    patientName: 'Vikram Singh',
    bookingCode: 'VS11',
    scheduledTime: todayAt(11, 0),
    checkedInAt: todayAt(10, 45),
    tokenNumber: 5,
    status: 'CHECKED_IN',
  },
  {
    id: 'apt-006',
    patientName: 'Meena Gupta',
    bookingCode: 'MG11',
    scheduledTime: todayAt(11, 30),
    checkedInAt: todayAt(11, 10),
    tokenNumber: 6,
    status: 'CHECKED_IN',
  },
  {
    id: 'apt-007',
    patientName: 'Arjun Reddy',
    bookingCode: 'AR12',
    scheduledTime: todayAt(12, 0),
    checkedInAt: todayAt(11, 38),
    tokenNumber: 7,
    status: 'CHECKED_IN',
  },
  {
    id: 'apt-012',
    patientName: 'Kavita Rao',
    bookingCode: 'KR16',
    scheduledTime: todayAt(16, 0),
    checkedInAt: todayAt(15, 42),
    tokenNumber: 8,
    status: 'CHECKED_IN',
  },
];

// ---------------------------------------------------------------------------
// "Now Seeing" card — the patient currently with the doctor
// ---------------------------------------------------------------------------

const NowSeeingCard = React.memo(({ patient }) => {
  if (!patient) return null;

  const st = statusMap.IN_PROGRESS;

  return (
    <View style={styles.nowSeeingSection}>
      <Text variant="bodySmall" style={styles.sectionLabel}>
        Now seeing
      </Text>

      <Card style={styles.nowSeeingCard} mode="contained">
        <View style={styles.nowSeeingBody}>
          {/* Token badge */}
          <View style={styles.tokenBadgeLarge}>
            <Text variant="headlineMedium" style={styles.tokenBadgeLargeText}>
              {patient.tokenNumber}
            </Text>
          </View>

          {/* Patient info */}
          <View style={styles.nowSeeingInfo}>
            <Text variant="titleMedium" style={styles.patientNamePrimary} numberOfLines={1}>
              {patient.patientName}
            </Text>
            <Text variant="bodySmall" style={styles.secondaryText}>
              Code: {patient.bookingCode}  ·  Called at {formatTime(patient.calledAt)}
            </Text>
          </View>

          {/* Status chip */}
          <Chip
            compact
            textStyle={[styles.chipText, { color: st.color }]}
            style={[styles.chip, { backgroundColor: st.backgroundColor }]}
          >
            {st.label}
          </Chip>
        </View>
      </Card>
    </View>
  );
});

// ---------------------------------------------------------------------------
// Empty queue state
// ---------------------------------------------------------------------------

const EmptyQueue = React.memo(({ hasCurrent }) => (
  <View style={styles.emptyContainer}>
    <IconButton
      icon="account-clock-outline"
      size={56}
      iconColor={palette.textDisabled}
    />
    <Text variant="titleMedium" style={styles.emptyTitle}>
      {hasCurrent ? 'No one else waiting' : 'Queue is empty'}
    </Text>
    <Text variant="bodyMedium" style={styles.emptySubtitle}>
      {hasCurrent
        ? 'All remaining patients will appear here as they check in.'
        : 'Checked-in patients will appear here in order.'}
    </Text>
  </View>
));

// ---------------------------------------------------------------------------
// Waiting list row
// ---------------------------------------------------------------------------

const WaitingRow = React.memo(({ item, position }) => {
  const st = statusMap.CHECKED_IN;

  return (
    <Card style={styles.card} mode="contained">
      <View style={styles.rowContainer}>
        {/* Position / token badge */}
        <View style={styles.tokenBadge}>
          <Text variant="titleSmall" style={styles.tokenBadgeText}>
            {item.tokenNumber}
          </Text>
        </View>

        {/* Accent bar */}
        <View style={[styles.accentBar, { backgroundColor: st.color }]} />

        {/* Patient info */}
        <View style={styles.infoColumn}>
          <Text variant="titleMedium" style={styles.patientName} numberOfLines={1}>
            {item.patientName}
          </Text>
          <Text variant="bodySmall" style={styles.secondaryText}>
            Code: {item.bookingCode}  ·  In at {formatTime(item.checkedInAt)}
          </Text>
        </View>

        {/* Status chip */}
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
// Queue-empty celebration (shown when the last patient is called)
// ---------------------------------------------------------------------------

const QueueCompleteState = () => (
  <View style={styles.emptyContainer}>
    <IconButton
      icon="check-all"
      size={56}
      iconColor={palette.success}
    />
    <Text variant="titleMedium" style={styles.emptyTitle}>
      All patients seen
    </Text>
    <Text variant="bodyMedium" style={styles.emptySubtitle}>
      No more patients in the queue. New check-ins will appear here.
    </Text>
  </View>
);

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

const LiveQueueScreen = () => {
  const [currentPatient, setCurrentPatient] = useState(INITIAL_CURRENT);
  const [waitingList, setWaitingList] = useState(INITIAL_WAITING);

  const handleCallNext = useCallback(() => {
    if (waitingList.length === 0) return;

    const [next, ...rest] = waitingList;

    setCurrentPatient({
      ...next,
      status: 'IN_PROGRESS',
      calledAt: new Date(),
    });
    setWaitingList(rest);
  }, [waitingList]);

  const renderItem = useCallback(
    ({ item, index }) => <WaitingRow item={item} position={index + 1} />,
    [],
  );
  const keyExtractor = useCallback((item) => item.id, []);

  // If there's no current patient AND no waiting list, queue is fully done
  const queueFullyEmpty = !currentPatient && waitingList.length === 0;

  return (
    <View style={styles.safeArea}>

      {/* Appbar */}
      <Appbar.Header
        mode="small"
        style={styles.appbar}
        statusBarHeight={0}
      >
        <Appbar.Content
          title="Live Queue"
          titleStyle={styles.appbarTitle}
        />
      </Appbar.Header>

      {queueFullyEmpty ? (
        <QueueCompleteState />
      ) : (
        <>
          {/* Now seeing */}
          <NowSeeingCard patient={currentPatient} />

          <Divider style={styles.divider} />

          {/* Waiting count + Call Next row */}
          <View style={styles.actionRow}>
            <View>
              <Text variant="bodySmall" style={styles.sectionLabel}>
                Waiting
              </Text>
              <Text variant="titleSmall" style={styles.waitingCount}>
                {waitingList.length} patient{waitingList.length !== 1 ? 's' : ''}
              </Text>
            </View>

            <Button
              mode="contained"
              icon="account-arrow-right"
              onPress={handleCallNext}
              disabled={waitingList.length === 0}
              style={styles.callNextButton}
              contentStyle={styles.callNextContent}
              labelStyle={styles.callNextLabel}
            >
              Call Next
            </Button>
          </View>

          <Divider style={styles.divider} />

          {/* Waiting list */}
          <FlatList
            data={waitingList}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={[
              styles.listContent,
              waitingList.length === 0 && styles.listContentEmpty,
            ]}
            ListEmptyComponent={
              <EmptyQueue hasCurrent={!!currentPatient} />
            }
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={styles.listSeparator} />
            )}
          />
        </>
      )}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },

  // Appbar — same pattern as previous screens
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

  // Divider
  divider: {
    backgroundColor: palette.divider,
    height: 1,
  },

  // Section label (reused for "Now seeing" and "Waiting")
  sectionLabel: {
    color: palette.textSecondary,
  },

  // --- Now Seeing section ---
  nowSeeingSection: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
  },
  nowSeeingCard: {
    backgroundColor: palette.primaryContainer,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.primaryLight,
    marginTop: spacing.sm,
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(15, 23, 42, 0.08)' },
      default: shadows.md,
    }),
  },
  nowSeeingBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingLeft: spacing.base,
    paddingRight: spacing.md,
  },
  tokenBadgeLarge: {
    width: 48,
    height: 48,
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

  // --- Action row (waiting count + Call Next) ---
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  waitingCount: {
    color: palette.textPrimary,
    marginTop: spacing.xxs,
  },
  callNextButton: {
    borderRadius: radius.sm,
    backgroundColor: palette.primary,
  },
  callNextContent: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  callNextLabel: {
    color: palette.textOnPrimary,
    fontWeight: '700',
    fontSize: 16,
  },

  // --- Waiting list ---
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

  // Card / row — same pattern as TodaysBookingsScreen
  card: {
    backgroundColor: palette.surfaceVariant,
    borderRadius: radius.md,
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(15, 23, 42, 0.08)' },
      default: shadows.md,
    }),
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
  },

  // Token badge (small, in waiting row)
  tokenBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: palette.neutralLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  tokenBadgeText: {
    color: palette.neutral,
    fontWeight: '700',
  },

  // Accent bar
  accentBar: {
    width: 3,
    height: 36,
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
  secondaryText: {
    color: palette.textSecondary,
    marginTop: spacing.xxs,
  },

  // Status chip — same as previous screens
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
    flex: 1,
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

export default LiveQueueScreen;
