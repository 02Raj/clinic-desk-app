import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { landing } from '../../theme/landingTheme';
import { cardShadow } from './landingLayout';

const STEPS = [
  {
    role: 'patient',
    label: 'Patient',
    text: 'I need an appointment tomorrow',
  },
  {
    role: 'system',
    label: 'Clinic Desk',
    text: 'Checking availability…',
    status: 'processing',
  },
  {
    role: 'system',
    label: 'Clinic Desk',
    text: '10:30 AM is available with Dr. Mehta',
    action: 'Confirm booking',
  },
  {
    role: 'system',
    label: 'Clinic Desk',
    text: 'Appointment confirmed — code K7M2',
    status: 'done',
  },
];

const HeroProductDemo: React.FC = () => {
  const opacity = useRef(new Animated.Value(1)).current;
  const [stepIndex, setStepIndex] = React.useState(0);
  const step = STEPS[stepIndex];

  useEffect(() => {
    const cycle = setInterval(() => {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]).start();
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 3200);
    return () => clearInterval(cycle);
  }, [opacity]);

  return (
    <View style={[styles.shell, cardShadow]}>
      <View style={styles.topBar}>
        <MaterialCommunityIcons name="pulse" size={14} color={landing.green} />
        <Text style={styles.topBarText}>Live product preview</Text>
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === stepIndex && styles.dotActive]} />
          ))}
        </View>
      </View>

      <Animated.View style={[styles.body, { opacity }]}>
        <View style={styles.thread}>
          {STEPS.slice(0, stepIndex + 1).map((s, i) => (
            <View key={`${s.text}-${i}`} style={styles.row}>
              <View style={[styles.avatar, s.role === 'patient' ? styles.avatarPatient : styles.avatarSystem]}>
                <MaterialCommunityIcons
                  name={s.role === 'patient' ? 'account' : 'robot-outline'}
                  size={14}
                  color={s.role === 'patient' ? landing.green : landing.textOnGreen}
                />
              </View>
              <View style={styles.bubbleCol}>
                <Text style={styles.bubbleLabel}>{s.label}</Text>
                <View style={[styles.bubble, s.role === 'patient' ? styles.bubblePatient : styles.bubbleSystem]}>
                  <Text style={styles.bubbleText}>{s.text}</Text>
                  {s.status === 'processing' && (
                    <View style={styles.processingRow}>
                      <View style={styles.processingDot} />
                      <Text style={styles.processingText}>Matching slots</Text>
                    </View>
                  )}
                  {s.action && (
                    <View style={styles.actionBtn}>
                      <Text style={styles.actionBtnText}>{s.action}</Text>
                    </View>
                  )}
                  {s.status === 'done' && (
                    <View style={styles.doneRow}>
                      <MaterialCommunityIcons name="check-circle" size={14} color="#2E7D32" />
                      <Text style={styles.doneText}>Synced to dashboard</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: landing.border,
    backgroundColor: landing.white,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: landing.divider,
    backgroundColor: landing.cream,
  },
  topBarText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: landing.textMuted,
  },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: landing.border },
  dotActive: { backgroundColor: landing.green, width: 16 },
  body: { padding: 16, minHeight: 200 },
  thread: { gap: 12 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPatient: { backgroundColor: landing.creamDark },
  avatarSystem: { backgroundColor: landing.green },
  bubbleCol: { flex: 1 },
  bubbleLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: landing.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bubble: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: landing.border,
  },
  bubblePatient: { backgroundColor: landing.cream },
  bubbleSystem: { backgroundColor: landing.white },
  bubbleText: { fontSize: 14, lineHeight: 20, color: landing.text },
  processingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  processingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: landing.green,
    ...Platform.select({
      web: { animation: 'pulse 1.2s ease-in-out infinite' } as object,
      default: {},
    }),
  },
  processingText: { fontSize: 12, color: landing.textMuted, fontStyle: 'italic' },
  actionBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: landing.green,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  actionBtnText: { fontSize: 12, fontWeight: '700', color: landing.textOnGreen },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  doneText: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
});

export default HeroProductDemo;
