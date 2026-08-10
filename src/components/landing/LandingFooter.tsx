import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, type ViewStyle } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { landing } from '../../theme/landingTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface LandingFooterProps {
  onNavigate: (section: string) => void;
  onGetStarted: () => void;
  onSignIn: () => void;
}

const FOOTER_LINKS = [
  { id: 'product', label: 'Product' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'features', label: 'Features' },
  { id: 'faq', label: 'FAQ' },
];

const LandingFooter: React.FC<LandingFooterProps> = ({ onNavigate, onGetStarted, onSignIn }) => {
  const { isMobileLayout } = useBreakpoint();

  return (
    <View style={[styles.footer, isMobileLayout && styles.footerMobile]}>
      <View style={[styles.inner, isMobileLayout && styles.innerMobile]}>
        <View style={styles.brandCol}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <MaterialCommunityIcons name="hospital-building" size={14} color={landing.textOnGreen} />
            </View>
            <Text style={styles.brandText}>Clinic Desk</Text>
          </View>
          <Text style={styles.tagline}>
            Front-desk operating system for Indian clinics. WhatsApp booking, check-in, and live queue — in one place.
          </Text>
        </View>

        <View style={[styles.linksCol, isMobileLayout && styles.linksColMobile]}>
          <Text style={styles.colTitle}>Product</Text>
          {FOOTER_LINKS.map((link) => (
            <TouchableOpacity key={link.id} onPress={() => onNavigate(link.id)}>
              <Text style={styles.link}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.linksCol}>
          <Text style={styles.colTitle}>Get started</Text>
          <TouchableOpacity onPress={onGetStarted}>
            <Text style={styles.link}>Sign up your clinic</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSignIn}>
            <Text style={styles.link}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.copy}>© 2026 Clinic Desk. Built for Indian clinics.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: landing.greenDark,
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 40,
  },
  footerMobile: { paddingHorizontal: 20, paddingTop: 40 },
  inner: {
    flexDirection: 'row',
    gap: 48,
    maxWidth: 1120,
    alignSelf: 'center',
    width: '100%',
    marginBottom: 40,
  },
  innerMobile: { flexDirection: 'column', gap: 32 },
  brandCol: { flex: 2 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: landing.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { fontSize: 16, fontWeight: '800', color: landing.textOnGreen },
  tagline: { fontSize: 13, lineHeight: 20, color: 'rgba(245,239,230,0.55)', maxWidth: 320 },
  linksCol: { flex: 1, gap: 10 },
  linksColMobile: { flex: undefined },
  colTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(245,239,230,0.4)',
    marginBottom: 4,
  },
  link: {
    fontSize: 14,
    color: 'rgba(245,239,230,0.75)',
    paddingVertical: 2,
    ...Platform.select({ web: { cursor: 'pointer' } as ViewStyle, default: {} }),
  },
  bottom: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(245,239,230,0.1)',
    paddingTop: 20,
    maxWidth: 1120,
    alignSelf: 'center',
    width: '100%',
  },
  copy: { fontSize: 12, color: 'rgba(245,239,230,0.35)' },
});

export default LandingFooter;
