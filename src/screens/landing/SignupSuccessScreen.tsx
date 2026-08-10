import React from 'react';
import { View, Text, StyleSheet, Platform, type ViewStyle } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { landing, landingFonts } from '../../theme/landingTheme';
import LandingButton from '../../components/landing/LandingButton';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface SignupSuccessScreenProps {
  email: string;
  onGoToLogin: () => void;
  onBackToHome: () => void;
}

const SignupSuccessScreen: React.FC<SignupSuccessScreenProps> = ({
  email,
  onGoToLogin,
  onBackToHome,
}) => {
  const { isMobileLayout } = useBreakpoint();

  return (
    <View style={styles.root}>
      <View style={[styles.card, isMobileLayout && styles.cardMobile]}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="email-check-outline" size={36} color={landing.green} />
        </View>

        <Text style={[styles.title, isMobileLayout && styles.titleMobile]}>Check your email</Text>

        <Text style={styles.sub}>
          Your clinic account has been created. We sent a secure link to set your password —
          we never send passwords in plain text.
        </Text>

        <View style={styles.emailBox}>
          <Text style={styles.emailLabel}>Sent to</Text>
          <Text style={styles.emailValue}>{email}</Text>
        </View>

        <View style={styles.steps}>
          <Step num="1" text="Open the email from Clinic Desk" />
          <Step num="2" text='Click "Set your password"' />
          <Step num="3" text="Choose a password, then log in to your dashboard" />
        </View>

        <Text style={styles.note}>
          Did not receive it? Check spam, or wait a few minutes. We will also reach out on
          WhatsApp within 24 hours to help with clinic setup.
        </Text>

        <LandingButton label="Go to login" onPress={onGoToLogin} fullWidth style={styles.primaryBtn} />
        <LandingButton
          label="Back to home"
          onPress={onBackToHome}
          variant="outline"
          fullWidth
          style={styles.secondaryBtn}
        />
      </View>
    </View>
  );
};

const Step: React.FC<{ num: string; text: string }> = ({ num, text }) => (
  <View style={styles.stepRow}>
    <View style={styles.stepNum}>
      <Text style={styles.stepNumText}>{num}</Text>
    </View>
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: landing.green,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: Platform.OS === 'web' ? ('100vh' as unknown as number) : undefined,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: landing.cream,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 32px 80px rgba(0,0,0,0.25)' } as ViewStyle,
      default: {},
    }),
  },
  cardMobile: {
    padding: 28,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: landing.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    color: landing.text,
    textAlign: 'center',
    marginBottom: 12,
    ...Platform.select({
      web: { fontFamily: landingFonts.serif } as ViewStyle,
      default: {},
    }),
  },
  titleMobile: {
    fontSize: 26,
    lineHeight: 34,
  },
  sub: {
    fontSize: 15,
    lineHeight: 24,
    color: landing.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  emailBox: {
    width: '100%',
    backgroundColor: landing.white,
    borderWidth: 1,
    borderColor: landing.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  emailLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: landing.textMuted,
    marginBottom: 6,
  },
  emailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: landing.text,
  },
  steps: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: landing.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: landing.textOnGreen,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: landing.text,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: landing.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryBtn: {
    marginBottom: 10,
    backgroundColor: landing.green,
  },
  secondaryBtn: {},
});

export default SignupSuccessScreen;
