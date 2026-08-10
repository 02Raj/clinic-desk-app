import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { landing } from '../../theme/landingTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import LandingButton from './LandingButton';
import LandingSection from './LandingSection';
import HeroProductDemo from './HeroProductDemo';
import { layout, serifTitle } from './landingLayout';

interface LandingHeroProps {
  onGetStarted: () => void;
  onScrollToHowItWorks: () => void;
  onLayout?: (e: import('react-native').LayoutChangeEvent) => void;
}

const PAIN_POINTS = [
  'Missed calls become missed patients',
  'Waiting rooms run on guesswork',
  "Nobody sees the week's numbers until it's over",
];

const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted, onScrollToHowItWorks, onLayout }) => {
  const { isMobileLayout, width } = useBreakpoint();
  const isWide = width >= 1024;

  return (
    <LandingSection variant="cream" onLayout={onLayout} noPadding>
      <View style={[styles.wrap, isMobileLayout && styles.wrapMobile]}>
        <View style={[styles.grid, isWide && styles.gridWide, isMobileLayout && styles.gridMobile]}>
          <View style={styles.copyCol}>
            <View style={styles.eyebrow}>
              <Text style={styles.eyebrowText}>Front-desk OS for Indian clinics</Text>
            </View>

            <Text style={[styles.title, isMobileLayout && styles.titleMobile]}>
              Run your clinic front desk on{' '}
              <Text style={styles.titleAccent}>WhatsApp</Text>
              {'\n'}and one calm dashboard.
            </Text>

            <Text style={[styles.sub, isMobileLayout && styles.subMobile]}>
              Clinic Desk connects patient booking, check-in, and the waiting room — without new
              hardware, without a patient app, and without retraining your reception team.
            </Text>

            <View style={styles.painList}>
              {PAIN_POINTS.map((point) => (
                <View key={point} style={styles.painRow}>
                  <MaterialCommunityIcons name="close-circle" size={14} color="#C45C4A" />
                  <Text style={styles.painText}>{point}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.actions, isMobileLayout && styles.actionsMobile]}>
              <LandingButton label="Sign up your clinic" onPress={onGetStarted} style={styles.primaryBtn} />
              <LandingButton
                label="See how it works"
                onPress={onScrollToHowItWorks}
                variant="outline"
                style={styles.secondaryBtn}
              />
            </View>

            <Text style={styles.micro}>
              Built for GP, dental, dermatology, paediatrics, and multi-specialty clinics.
            </Text>
          </View>

          <View style={[styles.demoCol, isMobileLayout && styles.demoColMobile]}>
            <HeroProductDemo />
          </View>
        </View>
      </View>
    </LandingSection>
  );
};

const styles = StyleSheet.create({
  wrap: {
    ...layout.inner,
    paddingHorizontal: 40,
    paddingTop: 40,
    paddingBottom: 72,
  },
  wrapMobile: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 48,
  },
  grid: {
    flexDirection: 'column',
    gap: 40,
    alignItems: 'center',
  },
  gridWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 56,
  },
  gridMobile: { gap: 32 },
  copyCol: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    maxWidth: 560,
  },
  demoCol: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  demoColMobile: {
    width: '100%',
  },
  eyebrow: {
    borderWidth: 1,
    borderColor: landing.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 24,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: landing.textMuted,
  },
  title: {
    ...serifTitle(52, 60),
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 640,
  },
  titleMobile: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.6,
  },
  titleAccent: {
    fontStyle: 'italic',
    color: landing.green,
  },
  sub: {
    fontSize: 17,
    lineHeight: 28,
    color: landing.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  subMobile: { fontSize: 15, lineHeight: 24 },
  painList: { gap: 10, marginBottom: 32, width: '100%', maxWidth: 420 },
  painRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: landing.creamDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  painText: { fontSize: 14, color: landing.text, flex: 1 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionsMobile: { flexDirection: 'column', width: '100%' },
  primaryBtn: { backgroundColor: landing.green, minWidth: 200 },
  secondaryBtn: { minWidth: 180 },
  micro: { fontSize: 12, color: landing.textMuted, textAlign: 'center' },
});

export default LandingHero;
