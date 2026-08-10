import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { landing } from '../../../theme/landingTheme';
import { palette } from '../../../theme/theme';
import { cardShadow } from '../landingLayout';

interface WorkflowStepPreviewProps {
  stepIndex: number;
}

const WorkflowStepPreview: React.FC<WorkflowStepPreviewProps> = ({ stepIndex }) => {
  if (stepIndex === 0) {
    return (
      <PreviewShell title="WhatsApp" icon="whatsapp">
        <Bubble who="patient" text="Can I book tomorrow?" />
        <Bubble who="bot" text="Sure. 10:30 AM and 12:00 PM available." />
        <Bubble who="patient" text="10:30 please." />
      </PreviewShell>
    );
  }
  if (stepIndex === 1) {
    return (
      <PreviewShell title="System" icon="lightning-bolt">
        <StatusRow label="Booking detected" value="Processing" active />
        <StatusRow label="Doctor" value="Dr. Mehta" />
        <StatusRow label="Slot" value="Tomorrow · 10:30 AM" />
      </PreviewShell>
    );
  }
  if (stepIndex === 2) {
    return (
      <PreviewShell title="Reception alert" icon="bell-ring-outline">
        <View style={styles.alert}>
          <MaterialCommunityIcons name="calendar-plus" size={18} color={landing.green} />
          <View style={styles.alertBody}>
            <Text style={styles.alertTitle}>New booking</Text>
            <Text style={styles.alertDesc}>Priya S. · 10:30 AM · Code K7M2</Text>
          </View>
        </View>
      </PreviewShell>
    );
  }
  if (stepIndex === 3) {
    return (
      <PreviewShell title="Dashboard" icon="view-dashboard-outline">
        <MiniRow time="10:30" name="Priya S." status="Booked" highlight />
        <MiniRow time="11:00" name="Anjali R." status="Confirmed" />
        <MiniRow time="11:30" name="Vikram S." status="Checked in" />
      </PreviewShell>
    );
  }
  return (
    <PreviewShell title="Patient update" icon="check-circle-outline">
      <Bubble who="bot" text="You're booked for tomorrow at 10:30 AM. Code K7M2." />
      <View style={styles.confirmed}>
        <Text style={styles.confirmedText}>Confirmation sent</Text>
      </View>
    </PreviewShell>
  );
};

const PreviewShell: React.FC<{
  title: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <View style={[styles.shell, cardShadow]}>
    <View style={styles.shellHead}>
      <MaterialCommunityIcons name={icon} size={16} color={landing.green} />
      <Text style={styles.shellTitle}>{title}</Text>
    </View>
    <View style={styles.shellBody}>{children}</View>
  </View>
);

const Bubble: React.FC<{ who: 'patient' | 'bot'; text: string }> = ({ who, text }) => (
  <View style={[styles.bubble, who === 'patient' ? styles.bubblePatient : styles.bubbleBot]}>
    <Text style={styles.bubbleText}>{text}</Text>
  </View>
);

const StatusRow: React.FC<{ label: string; value: string; active?: boolean }> = ({
  label,
  value,
  active,
}) => (
  <View style={styles.statusRow}>
    <Text style={styles.statusLabel}>{label}</Text>
    <View style={[styles.statusPill, active && styles.statusPillActive]}>
      <Text style={[styles.statusValue, active && styles.statusValueActive]}>{value}</Text>
    </View>
  </View>
);

const MiniRow: React.FC<{
  time: string;
  name: string;
  status: string;
  highlight?: boolean;
}> = ({ time, name, status, highlight }) => (
  <View style={[styles.miniRow, highlight && styles.miniRowHighlight]}>
    <Text style={styles.miniTime}>{time}</Text>
    <Text style={styles.miniName}>{name}</Text>
    <Text style={styles.miniStatus}>{status}</Text>
  </View>
);

const styles = StyleSheet.create({
  shell: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: landing.border,
    backgroundColor: landing.white,
    overflow: 'hidden',
    width: '100%',
  },
  shellHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: landing.divider,
    backgroundColor: landing.cream,
  },
  shellTitle: { fontSize: 12, fontWeight: '700', color: landing.text },
  shellBody: { padding: 14, gap: 8, minHeight: 160 },
  bubble: { borderRadius: 8, padding: 10, maxWidth: '92%' },
  bubblePatient: { alignSelf: 'flex-end', backgroundColor: landing.creamDark },
  bubbleBot: { alignSelf: 'flex-start', backgroundColor: palette.primaryLight },
  bubbleText: { fontSize: 12, lineHeight: 17, color: landing.text },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusLabel: { fontSize: 12, color: landing.textMuted },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: landing.creamDark,
  },
  statusPillActive: { backgroundColor: landing.green },
  statusValue: { fontSize: 11, fontWeight: '600', color: landing.text },
  statusValueActive: { color: landing.textOnGreen },
  alert: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: landing.cream,
    borderWidth: 1,
    borderColor: landing.border,
  },
  alertBody: { flex: 1 },
  alertTitle: { fontSize: 13, fontWeight: '700', color: landing.text },
  alertDesc: { fontSize: 12, color: landing.textMuted, marginTop: 2 },
  miniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  miniRowHighlight: {
    backgroundColor: palette.primaryLight,
    borderWidth: 1,
    borderColor: palette.border,
  },
  miniTime: { width: 40, fontSize: 11, fontWeight: '700', color: landing.textMuted },
  miniName: { flex: 1, fontSize: 12, fontWeight: '600', color: landing.text },
  miniStatus: { fontSize: 10, fontWeight: '600', color: palette.primary },
  confirmed: {
    alignSelf: 'flex-start',
    backgroundColor: palette.successLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  confirmedText: { fontSize: 11, fontWeight: '700', color: palette.success },
});

export default WorkflowStepPreview;
