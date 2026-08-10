import React from 'react';
import { View, Text, StyleSheet, Platform, type ViewStyle } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { landing } from '../../theme/landingTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import LandingSection from './LandingSection';
import { layout } from './landingLayout';

const CAPABILITIES = [
  {
    icon: 'whatsapp' as const,
    title: 'WhatsApp Booking',
    desc: 'Patients pick doctor, date, and slot in chat — no app install.',
    preview: 'Book 10:30 AM',
  },
  {
    icon: 'account-group' as const,
    title: 'Live Queue',
    desc: 'Token numbers, waiting list, and call-next in one view.',
    preview: 'Token #09 · Waiting',
  },
  {
    icon: 'folder-account' as const,
    title: 'Patient Records',
    desc: 'Booking codes, visit status, and daily history in one place.',
    preview: 'Code K7M2 · Booked',
  },
  {
    icon: 'bell-ring' as const,
    title: 'Appointment Reminders',
    desc: 'Automated WhatsApp reminders before each visit.',
    preview: 'Reminder · 1hr before',
  },
  {
    icon: 'monitor-dashboard' as const,
    title: 'Reception Dashboard',
    desc: 'Bookings, check-in, and queue on desktop or tablet.',
    preview: '12 today · 4 arrived',
  },
  {
    icon: 'chart-bar' as const,
    title: 'Clinic Reports',
    desc: 'Weekly completed visits, no-shows, and daily breakdown.',
    preview: 'Mon–Sun summary',
  },
];

interface LandingCapabilitiesProps {
  onLayout?: (e: import('react-native').LayoutChangeEvent) => void;
}

const LandingCapabilities: React.FC<LandingCapabilitiesProps> = ({ onLayout }) => {
  const { isMobileLayout } = useBreakpoint();

  return (
    <LandingSection variant="tan" onLayout={onLayout}>
      <View style={layout.inner}>
        <Text style={styles.eyebrow}>Capabilities</Text>
        <Text style={[styles.title, isMobileLayout && styles.titleMobile]}>
          Every front-desk capability, in one system.
        </Text>

        <View style={[styles.grid, isMobileLayout && styles.gridMobile]}>
          {CAPABILITIES.map((cap) => (
            <View key={cap.title} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons name={cap.icon} size={20} color={landing.green} />
                </View>
                <View style={styles.previewPill}>
                  <Text style={styles.previewText}>{cap.preview}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{cap.title}</Text>
              <Text style={styles.cardDesc}>{cap.desc}</Text>
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
    marginBottom: 12,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: landing.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  titleMobile: { fontSize: 22, lineHeight: 30 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  gridMobile: { flexDirection: 'column' },
  card: {
    width: '31%',
    minWidth: 200,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: landing.border,
    borderRadius: 10,
    padding: 20,
    backgroundColor: landing.white,
    ...Platform.select({
      web: { transition: 'transform 0.2s ease, box-shadow 0.2s ease' } as ViewStyle,
      default: {},
    }),
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 8,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: landing.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: landing.border,
  },
  previewPill: {
    backgroundColor: landing.creamDark,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 120,
  },
  previewText: { fontSize: 9, fontWeight: '700', color: landing.textMuted },
  cardTitle: { fontSize: 15, fontWeight: '700', color: landing.text, marginBottom: 6 },
  cardDesc: { fontSize: 13, lineHeight: 20, color: landing.textMuted },
});

export default LandingCapabilities;
