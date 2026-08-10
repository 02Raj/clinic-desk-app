import React from 'react';
import { View, StyleSheet, ScrollView, Platform, type ViewStyle, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { palette, spacing, radius } from '../theme/theme';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface LandingScreenProps {
  onSignIn: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onSignIn }) => {
  const { isDesktopWeb } = useBreakpoint();

  return (
    <View style={styles.root}>
      {/* ── Navbar ─────────────────────────────────── */}
      <View style={[styles.nav, !isDesktopWeb && styles.navMobile]}>
        <View style={styles.navLogoWrap}>
          <View style={styles.brandMark}>
            <MaterialCommunityIcons name="hospital-building" size={20} color={palette.textOnPrimary} />
          </View>
          <Text style={styles.navLogoText}>Clinic Desk</Text>
        </View>

        {isDesktopWeb && (
          <View style={styles.navLinks}>
            <TouchableOpacity><Text style={styles.navLink}>Features</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.navLink}>How it works</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.navLink}>FAQ</Text></TouchableOpacity>
            <TouchableOpacity onPress={onSignIn}><Text style={styles.navLinkBold}>Sign in</Text></TouchableOpacity>
            <Button
              mode="contained"
              style={styles.navButton}
              labelStyle={styles.navButtonLabel}
              onPress={() => {}}
            >
              Get started
            </Button>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Hero Section ───────────────────────────── */}
        <View style={styles.heroSection}>
          <Text style={styles.overline}>FRONT-DESK OS FOR MODERN CLINICS</Text>
          
          {/* Serif font trick for web */}
          <Text
            style={[
              styles.hugeTitle,
              Platform.OS === 'web' ? { fontFamily: '"Playfair Display", serif' } : {},
            ]}
          >
            Clinic operations,{'\n'}without the chaos.
          </Text>
          
          <Text style={styles.subtitle}>
            WhatsApp bookings, instant check-in, and a live patient queue —{'\n'}
            all in one place for your reception team.
          </Text>

          {/* ── Form Card ──────────────────────────────── */}
          <View style={styles.formCard}>
            <TextInput
              mode="flat"
              label="Your clinic name"
              placeholder="City Care Clinic"
              style={styles.input}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              left={<TextInput.Icon icon="hospital-building" color={palette.textSecondary} />}
            />
            <View style={styles.inputDivider} />
            <TextInput
              mode="flat"
              label="WhatsApp number"
              placeholder="+91 98XXX XXXXX"
              style={styles.input}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              left={<TextInput.Icon icon="whatsapp" color={palette.textSecondary} />}
            />
            <View style={styles.inputDivider} />
            <TextInput
              mode="flat"
              label="Working hours"
              placeholder="9:00 AM - 6:00 PM"
              style={styles.input}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              left={<TextInput.Icon icon="calendar-outline" color={palette.textSecondary} />}
            />

            <Button
              mode="contained"
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
              labelStyle={styles.submitButtonLabel}
            >
              Set up your clinic →
            </Button>
            <Text style={styles.formHint}>Free to try · No credit card · Setup in 5 minutes</Text>
          </View>

          {/* ── Trust Badges ───────────────────────────── */}
          <View style={styles.trustRow}>
            <Text style={styles.trustText}>WhatsApp</Text>
            <Text style={styles.trustText}>Twilio</Text>
            <Text style={styles.trustText}>Firebase</Text>
            <Text style={styles.trustText}>Expo</Text>
          </View>
        </View>

        {/* ── Lower Dark Section (Mockup) ───────────── */}
        <View style={styles.lowerSection}>
          <Text style={styles.lowerTitle}>Built for speed and scale</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.background,
  },
  // ── Nav ────────────────────────
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl * 2,
    paddingVertical: spacing.xl,
  },
  navMobile: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  navLogoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLogoText: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.textPrimary,
    letterSpacing: -0.5,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  navLink: {
    fontSize: 14,
    color: palette.textSecondary,
    fontWeight: '500',
  },
  navLinkBold: {
    fontSize: 14,
    color: palette.textPrimary,
    fontWeight: '700',
  },
  navButton: {
    borderRadius: radius.full,
    backgroundColor: palette.primary,
  },
  navButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // ── Hero ───────────────────────
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  overline: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: palette.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  hugeTitle: {
    fontSize: Platform.OS === 'web' ? 72 : 48,
    lineHeight: Platform.OS === 'web' ? 76 : 52,
    color: palette.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: spacing.lg,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 28,
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    maxWidth: 600,
  },
  // ── Form ───────────────────────
  formCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    paddingBottom: spacing.lg,
    ...Platform.select({
      web: { boxShadow: '0 20px 40px rgba(27, 42, 32, 0.05)' } as unknown as ViewStyle,
      default: { elevation: 4 },
    }),
  },
  input: {
    backgroundColor: 'transparent',
    height: 56,
  },
  inputDivider: {
    height: 1,
    backgroundColor: palette.divider,
    marginHorizontal: spacing.md,
  },
  submitButton: {
    marginTop: spacing.xl,
    backgroundColor: palette.primary,
    borderRadius: radius.full,
  },
  submitButtonContent: {
    paddingVertical: spacing.sm,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  formHint: {
    textAlign: 'center',
    fontSize: 12,
    color: palette.textDisabled,
    marginTop: spacing.md,
  },
  // ── Trust Badges ───────────────
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.xxl,
    opacity: 0.4,
  },
  trustText: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textSecondary,
  },
  // ── Lower Section ──────────────
  lowerSection: {
    backgroundColor: palette.primaryDark,
    width: '100%',
    minHeight: 400,
    padding: spacing.xxl * 2,
    alignItems: 'center',
  },
  lowerTitle: {
    color: palette.textOnPrimary,
    fontSize: 48,
    fontWeight: '600',
    marginTop: spacing.xxl,
    ...Platform.select({
      web: { fontFamily: '"Playfair Display", serif' },
      default: {},
    }),
  },
});

export default LandingScreen;
