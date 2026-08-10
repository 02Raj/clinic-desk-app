import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { landing } from '../../theme/landingTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import LandingSection from './LandingSection';
import { layout } from './landingLayout';

const METRICS = [
  { value: '0', label: 'Hardware to buy', sub: 'Runs on WhatsApp + browser' },
  { value: '0', label: 'Patient app installs', sub: 'Patients use WhatsApp they already have' },
  { value: '<1 wk', label: 'Typical setup time', sub: 'After clinic details are confirmed' },
  { value: '24/7', label: 'Booking availability', sub: 'Patients book outside clinic hours' },
];

interface LandingMetricsProps {
  onLayout?: (e: import('react-native').LayoutChangeEvent) => void;
}

const LandingMetrics: React.FC<LandingMetricsProps> = ({ onLayout }) => {
  const { isMobileLayout } = useBreakpoint();

  return (
    <LandingSection variant="white" onLayout={onLayout}>
      <View style={layout.inner}>
        <View style={[styles.grid, isMobileLayout && styles.gridMobile]}>
          {METRICS.map((m) => (
            <View key={m.label} style={[styles.card, isMobileLayout && styles.cardMobile]}>
              <Text style={styles.value}>{m.value}</Text>
              <Text style={styles.label}>{m.label}</Text>
              <Text style={styles.sub}>{m.sub}</Text>
            </View>
          ))}
        </View>
      </View>
    </LandingSection>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  gridMobile: {
    flexDirection: 'column',
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: landing.border,
    borderRadius: 10,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: landing.cream,
  },
  cardMobile: {
    flex: undefined,
  },
  value: {
    fontSize: 36,
    fontWeight: '700',
    color: landing.green,
    letterSpacing: -1,
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: landing.text,
    marginBottom: 6,
  },
  sub: {
    fontSize: 12,
    lineHeight: 18,
    color: landing.textMuted,
  },
});

export default LandingMetrics;
