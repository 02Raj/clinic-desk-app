import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { palette } from '../../../theme/theme';
import { landing } from '../../../theme/landingTheme';
import { cardShadow } from '../landingLayout';

const QUEUE = [
  { token: '08', name: 'Rina K.', status: 'In progress' },
  { token: '09', name: 'Sameer P.', status: 'Waiting' },
  { token: '10', name: 'Anjali R.', status: 'Waiting' },
];

const QueuePanelMock: React.FC = () => (
  <View style={[styles.shell, cardShadow]}>
    <View style={styles.titleBar}>
      <MaterialCommunityIcons name="account-group" size={16} color={palette.primary} />
      <Text style={styles.titleBarText}>Live Queue</Text>
    </View>

    <View style={styles.nowSeeing}>
      <Text style={styles.nowLabel}>NOW SEEING</Text>
      <View style={styles.nowCard}>
        <View style={styles.tokenLarge}>
          <Text style={styles.tokenLargeText}>08</Text>
        </View>
        <View style={styles.nowInfo}>
          <Text style={styles.nowName}>Rina K.</Text>
          <Text style={styles.nowMeta}>Code R4K2 · Called 11:04 AM</Text>
        </View>
      </View>
    </View>

    <Text style={styles.waitLabel}>WAITING</Text>
    {QUEUE.slice(1).map((p) => (
      <View key={p.token} style={styles.queueRow}>
        <View style={styles.tokenSmall}>
          <Text style={styles.tokenSmallText}>{p.token}</Text>
        </View>
        <Text style={styles.queueName}>{p.name}</Text>
        <Text style={styles.queueStatus}>{p.status}</Text>
      </View>
    ))}

    <View style={styles.callNextBtn}>
      <MaterialCommunityIcons name="bell-ring" size={16} color={palette.textOnPrimary} />
      <Text style={styles.callNextText}>Call next patient</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  shell: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
  },
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
  titleBarText: { fontSize: 13, fontWeight: '700', color: palette.textPrimary },
  nowSeeing: { padding: 16 },
  nowLabel: { fontSize: 10, fontWeight: '700', color: palette.textSecondary, letterSpacing: 1, marginBottom: 8 },
  nowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.primaryLight,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  tokenLarge: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenLargeText: { color: palette.textOnPrimary, fontSize: 16, fontWeight: '800' },
  nowInfo: { flex: 1 },
  nowName: { fontSize: 14, fontWeight: '700', color: palette.textPrimary },
  nowMeta: { fontSize: 11, color: palette.textSecondary, marginTop: 2 },
  waitLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.textSecondary,
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: palette.divider,
  },
  tokenSmall: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: landing.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenSmallText: { fontSize: 12, fontWeight: '700', color: palette.textPrimary },
  queueName: { flex: 1, fontSize: 13, color: palette.textPrimary },
  queueStatus: { fontSize: 11, color: palette.textSecondary },
  callNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    marginTop: 12,
    backgroundColor: palette.primary,
    borderRadius: 8,
    paddingVertical: 12,
  },
  callNextText: { color: palette.textOnPrimary, fontSize: 13, fontWeight: '700' },
});

export default QueuePanelMock;
