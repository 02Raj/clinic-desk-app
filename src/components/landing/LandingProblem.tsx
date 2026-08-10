import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { landing } from '../../theme/landingTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import LandingSection from './LandingSection';
import { layout, serifTitle } from './landingLayout';

const PROBLEMS = [
  {
    num: '01',
    label: 'Booking',
    title: 'A missed call is a missed patient',
    desc: 'One receptionist cannot answer three phones at once. Most callers do not call back — they book elsewhere.',
    icon: 'phone-missed' as const,
  },
  {
    num: '02',
    label: 'The queue',
    title: 'Waiting rooms run on guesswork',
    desc: 'Patients do not know if they are 2nd or 12th, so they ask at the desk — which slows everyone down.',
    icon: 'account-clock' as const,
  },
  {
    num: '03',
    label: 'The numbers',
    title: "Nobody sees the week until it's over",
    desc: 'No-shows, cancellations, and daily throughput live in memory — not in a report your team can act on.',
    icon: 'chart-timeline-variant' as const,
  },
];

interface LandingProblemProps {
  onLayout?: (e: import('react-native').LayoutChangeEvent) => void;
}

const LandingProblem: React.FC<LandingProblemProps> = ({ onLayout }) => {
  const { isMobileLayout } = useBreakpoint();

  return (
    <LandingSection variant="cream" onLayout={onLayout}>
      <View style={layout.inner}>
        <Text style={styles.eyebrow}>The front desk today</Text>
        <Text style={[styles.title, isMobileLayout && styles.titleMobile]}>
          Every clinic has an operating system.{'\n'}
          <Text style={styles.titleItalic}>It's just a register and hope.</Text>
        </Text>
        <Text style={styles.intro}>
          Bookings live in a diary. Reminders happen when someone remembers. The only report anyone sees
          is how full the waiting room looks by 11am.
        </Text>

        <View style={styles.list}>
          {PROBLEMS.map((p) => (
            <View key={p.num} style={[styles.card, isMobileLayout && styles.cardMobile]}>
              <View style={styles.cardTop}>
                <Text style={styles.num}>{p.num}</Text>
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons name={p.icon} size={20} color={landing.green} />
                </View>
              </View>
              <Text style={styles.label}>{p.label}</Text>
              <Text style={styles.cardTitle}>{p.title}</Text>
              <Text style={styles.cardDesc}>{p.desc}</Text>
            </View>
          ))}
        </View>
      </View>
    </LandingSection>
  );
};

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: landing.textMuted,
    marginBottom: 16,
  },
  title: {
    ...serifTitle(40, 48),
    marginBottom: 16,
  },
  titleMobile: { fontSize: 28, lineHeight: 36 },
  titleItalic: { fontStyle: 'italic', color: landing.green },
  intro: {
    fontSize: 16,
    lineHeight: 26,
    color: landing.textMuted,
    maxWidth: 640,
    marginBottom: 40,
  },
  list: { gap: 16 },
  card: {
    borderWidth: 1,
    borderColor: landing.border,
    borderRadius: 12,
    padding: 28,
    backgroundColor: landing.white,
  },
  cardMobile: { padding: 20 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  num: { fontSize: 13, fontWeight: '700', color: landing.textMuted, letterSpacing: 1 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: landing.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: landing.textMuted,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: landing.text, marginBottom: 8, lineHeight: 28 },
  cardDesc: { fontSize: 14, lineHeight: 22, color: landing.textMuted },
});

export default LandingProblem;
