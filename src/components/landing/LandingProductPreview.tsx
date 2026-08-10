import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { landing } from '../../theme/landingTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import LandingSection from './LandingSection';
import DashboardPreview from './mockups/DashboardPreview';
import AnimatedWhatsApp from './mockups/AnimatedWhatsApp';
import { layout, serifTitleLight } from './landingLayout';

interface LandingProductPreviewProps {
  onLayout?: (e: import('react-native').LayoutChangeEvent) => void;
}

const LandingProductPreview: React.FC<LandingProductPreviewProps> = ({ onLayout }) => {
  const { isMobileLayout } = useBreakpoint();

  return (
    <LandingSection variant="dark" onLayout={onLayout}>
      <View style={layout.inner}>
        <Text style={styles.eyebrow}>Product preview</Text>
        <Text style={[styles.title, isMobileLayout && styles.titleMobile]}>
          One dashboard.{'\n'}Every front-desk moment.
        </Text>
        <Text style={styles.sub}>
          Bookings, check-in, queue, and patient status — the same screens your reception team
          uses every day.
        </Text>

        <View style={styles.dashboardHero}>
          <DashboardPreview size="large" showNewBooking highlightCode="K7M2" />
        </View>

        <View style={styles.bridge}>
          <BridgeStep label="WhatsApp" icon="whatsapp" />
          <View style={styles.bridgeLine} />
          <BridgeStep label="Automation" icon="robot-outline" />
          <View style={styles.bridgeLine} />
          <BridgeStep label="Dashboard" icon="view-dashboard-outline" />
          <View style={styles.bridgeLine} />
          <BridgeStep label="Reception" icon="account-tie" />
        </View>

        <View style={[styles.dualPreview, isMobileLayout && styles.dualPreviewMobile]}>
          <View style={styles.dualCopy}>
            <Text style={styles.dualEyebrow}>Connected flow</Text>
            <Text style={styles.dualTitle}>Book on WhatsApp. See it on the desk.</Text>
            <Text style={styles.dualDesc}>
              When a patient confirms a slot in chat, the booking appears on your dashboard
              instantly — with code, doctor, and status ready for check-in.
            </Text>
          </View>
          <AnimatedWhatsApp large={!isMobileLayout} variant="booking" animate={false} />
        </View>

        <View style={[styles.syncRow, isMobileLayout && styles.syncRowMobile]}>
          <View style={styles.syncCard}>
            <Text style={styles.syncLabel}>Patient message</Text>
            <Text style={styles.syncValue}>"10:30 please."</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={20} color="rgba(245,239,230,0.4)" />
          <View style={styles.syncCard}>
            <Text style={styles.syncLabel}>Dashboard row</Text>
            <Text style={styles.syncValue}>Priya S. · 10:30 · K7M2</Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>Illustrative previews — demo data for demonstration only.</Text>
      </View>
    </LandingSection>
  );
};

const BridgeStep: React.FC<{
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}> = ({ label, icon }) => (
  <View style={styles.bridgeStep}>
    <View style={styles.bridgeIcon}>
      <MaterialCommunityIcons name={icon} size={16} color={landing.textOnGreen} />
    </View>
    <Text style={styles.bridgeLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(245,239,230,0.55)',
    textAlign: 'center',
    marginBottom: 14,
  },
  title: {
    ...serifTitleLight(42, 50),
    textAlign: 'center',
    marginBottom: 14,
  },
  titleMobile: { fontSize: 30, lineHeight: 38 },
  sub: {
    fontSize: 16,
    lineHeight: 26,
    color: 'rgba(245,239,230,0.7)',
    textAlign: 'center',
    maxWidth: 580,
    alignSelf: 'center',
    marginBottom: 36,
  },
  dashboardHero: {
    marginBottom: 32,
    width: '100%',
    ...Platform.select({
      web: { transform: [{ scale: 1 }], maxWidth: 1080, alignSelf: 'center' } as object,
      default: {},
    }),
  },
  bridge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
    flexWrap: 'wrap',
  },
  bridgeStep: { alignItems: 'center', gap: 6, minWidth: 72 },
  bridgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(245,239,230,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bridgeLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(245,239,230,0.55)', letterSpacing: 0.5 },
  bridgeLine: { width: 24, height: 1, backgroundColor: 'rgba(245,239,230,0.2)' },
  dualPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
    marginBottom: 28,
  },
  dualPreviewMobile: { flexDirection: 'column', gap: 28 },
  dualCopy: { flex: 1, minWidth: 0 },
  dualEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(245,239,230,0.5)',
    marginBottom: 12,
  },
  dualTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: landing.textOnGreen,
    marginBottom: 10,
    lineHeight: 32,
  },
  dualDesc: { fontSize: 14, lineHeight: 22, color: 'rgba(245,239,230,0.65)' },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  syncRowMobile: { flexDirection: 'column' },
  syncCard: {
    borderWidth: 1,
    borderColor: 'rgba(245,239,230,0.15)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 160,
    backgroundColor: 'rgba(245,239,230,0.06)',
  },
  syncLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(245,239,230,0.45)', marginBottom: 4 },
  syncValue: { fontSize: 13, fontWeight: '600', color: landing.textOnGreen },
  disclaimer: {
    fontSize: 11,
    color: 'rgba(245,239,230,0.4)',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default LandingProductPreview;
