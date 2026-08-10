import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { landing } from '../../theme/landingTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import LandingSection from './LandingSection';
import { layout, serifTitle } from './landingLayout';

const TRUST_ITEMS = [
  {
    icon: 'shield-lock' as const,
    title: 'Patient data protection',
    desc: 'Clinic and patient data is stored securely with authenticated access — only your team can view appointments.',
  },
  {
    icon: 'calendar-check' as const,
    title: 'Reliable booking workflow',
    desc: 'Every booking follows the same path: WhatsApp → confirmation → dashboard → check-in. No lost messages.',
  },
  {
    icon: 'account-supervisor' as const,
    title: 'Human control',
    desc: 'Reception approves check-ins and calls patients. Automation handles messaging — not clinical decisions.',
  },
  {
    icon: 'eye-outline' as const,
    title: 'Transparent activity',
    desc: 'Every appointment has a visible status. Bookings, queue position, and weekly numbers are always on record.',
  },
];

interface LandingTrustProps {
  onLayout?: (e: import('react-native').LayoutChangeEvent) => void;
}

const LandingTrust: React.FC<LandingTrustProps> = ({ onLayout }) => {
  const { isMobileLayout } = useBreakpoint();

  return (
    <LandingSection variant="cream" onLayout={onLayout}>
      <View style={layout.inner}>
        <Text style={styles.eyebrow}>Trust & control</Text>
        <Text style={[styles.title, isMobileLayout && styles.titleMobile]}>
          Built for the{'\n'}
          <Text style={styles.titleItalic}>real-world front desk.</Text>
        </Text>

        <View style={[styles.grid, isMobileLayout && styles.gridMobile]}>
          {TRUST_ITEMS.map((item) => (
            <View key={item.title} style={styles.card}>
              <MaterialCommunityIcons name={item.icon} size={24} color={landing.green} />
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
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
    textAlign: 'center',
  },
  title: {
    ...serifTitle(36, 44),
    textAlign: 'center',
    marginBottom: 40,
  },
  titleMobile: { fontSize: 26, lineHeight: 34 },
  titleItalic: { fontStyle: 'italic', color: landing.green },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  gridMobile: { flexDirection: 'column' },
  card: {
    width: '48%',
    flexGrow: 1,
    minWidth: 240,
    backgroundColor: landing.white,
    borderWidth: 1,
    borderColor: landing.border,
    borderRadius: 10,
    padding: 24,
    gap: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: landing.text },
  cardDesc: { fontSize: 13, lineHeight: 20, color: landing.textMuted },
});

export default LandingTrust;
