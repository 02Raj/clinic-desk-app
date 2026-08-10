import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { landing } from '../../theme/landingTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import LandingSection from './LandingSection';
import BookingsPanelMock from './mockups/BookingsPanelMock';
import QueuePanelMock from './mockups/QueuePanelMock';
import AnimatedWhatsApp from './mockups/AnimatedWhatsApp';
import { layout, serifTitle, LANDING_MAX_WIDTH } from './landingLayout';

const FEATURES = [
  {
    eyebrow: '01 · Booking & reminders',
    title: 'Patients book without downloading anything.',
    desc: 'A patient messages your clinic number once. Clinic Desk locks the slot, sends confirmation, and reminds them before the visit.',
    bullets: ['Interactive WhatsApp menus', 'Hindi and English support', '4-character booking codes'],
    visual: 'bookings' as const,
    dark: false,
  },
  {
    eyebrow: '02 · Queue & check-in',
    title: 'Your reception becomes calmer.',
    desc: 'Check patients in with a code — no name search, no double entries. When the doctor is ready, one tap calls the next patient.',
    bullets: ['Desk check-in by code', 'WhatsApp HERE self check-in', 'Token numbers in real time'],
    visual: 'queue' as const,
    dark: true,
  },
  {
    eyebrow: '03 · Patient experience',
    title: 'Patients stay informed on WhatsApp.',
    desc: 'Queue position, wait estimates, and visit confirmation — all in the channel patients already use every day.',
    bullets: ['STATUS / QUEUE commands', 'Approaching-turn alerts', 'No patient app required'],
    visual: 'whatsapp' as const,
    dark: false,
  },
];

interface LandingFeaturesProps {
  onLayout?: (e: import('react-native').LayoutChangeEvent) => void;
}

const LandingFeatures: React.FC<LandingFeaturesProps> = ({ onLayout }) => {
  const { isMobileLayout } = useBreakpoint();

  const renderVisual = (type: (typeof FEATURES)[0]['visual']) => {
    if (type === 'bookings') return <BookingsPanelMock />;
    if (type === 'queue') return <QueuePanelMock />;
    return <AnimatedWhatsApp compact />;
  };

  return (
    <LandingSection variant="cream" onLayout={onLayout} noPadding>
      <View style={[styles.header, isMobileLayout && styles.headerMobile]}>
        <Text style={styles.headerEyebrow}>What Clinic Desk runs</Text>
        <Text style={[styles.headerTitle, isMobileLayout && styles.headerTitleMobile]}>
          One number. Every part of the front desk.
        </Text>
      </View>

      {FEATURES.map((feat, index) => {
        const reversed = index % 2 === 1;
        const isDark = feat.dark;

        return (
          <View
            key={feat.eyebrow}
            style={[
              styles.featureBlock,
              isDark && styles.featureBlockDark,
              isMobileLayout && styles.featureBlockMobile,
            ]}
          >
            <View style={[styles.featureRow, reversed && !isMobileLayout && styles.featureRowReversed, isMobileLayout && styles.featureRowMobile]}>
              <View style={styles.featureCopy}>
                <Text style={[styles.eyebrow, isDark && styles.eyebrowDark]}>{feat.eyebrow}</Text>
                <Text style={[styles.title, isDark && styles.titleDark, isMobileLayout && styles.titleMobile]}>
                  {feat.title}
                </Text>
                <Text style={[styles.desc, isDark && styles.descDark]}>{feat.desc}</Text>
                {feat.bullets.map((b) => (
                  <View key={b} style={styles.bulletRow}>
                    <View style={[styles.bulletDot, isDark && styles.bulletDotDark]} />
                    <Text style={[styles.bulletText, isDark && styles.bulletTextDark]}>{b}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.featureVisual}>{renderVisual(feat.visual)}</View>
            </View>
          </View>
        );
      })}
    </LandingSection>
  );
};

const styles = StyleSheet.create({
  header: {
    ...layout.inner,
    paddingTop: 80,
    paddingBottom: 48,
    alignItems: 'center',
  },
  headerMobile: { paddingTop: 56, paddingBottom: 32, paddingHorizontal: 20 },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: landing.textMuted,
    marginBottom: 12,
  },
  headerTitle: {
    ...serifTitle(36, 44),
    textAlign: 'center',
  },
  headerTitleMobile: { fontSize: 26, lineHeight: 34 },
  featureBlock: {
    paddingVertical: 72,
    paddingHorizontal: 40,
  },
  featureBlockDark: {
    backgroundColor: landing.green,
  },
  featureBlockMobile: {
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
    maxWidth: LANDING_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  featureRowReversed: { flexDirection: 'row-reverse' },
  featureRowMobile: { flexDirection: 'column', gap: 32 },
  featureCopy: { flex: 1, minWidth: 0 },
  featureVisual: { flex: 1, minWidth: 0 },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: landing.textMuted,
    marginBottom: 12,
  },
  eyebrowDark: { color: 'rgba(245,239,230,0.5)' },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: landing.text,
    lineHeight: 34,
    marginBottom: 12,
  },
  titleDark: { color: landing.textOnGreen },
  titleMobile: { fontSize: 22, lineHeight: 30 },
  desc: {
    fontSize: 15,
    lineHeight: 24,
    color: landing.textMuted,
    marginBottom: 20,
  },
  descDark: { color: 'rgba(245,239,230,0.7)' },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  bulletDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: landing.green },
  bulletDotDark: { backgroundColor: landing.cream },
  bulletText: { fontSize: 14, color: landing.text },
  bulletTextDark: { color: 'rgba(245,239,230,0.85)' },
});

export default LandingFeatures;
