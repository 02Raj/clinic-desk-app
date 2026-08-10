import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { landing } from '../../theme/landingTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import LandingButton from './LandingButton';
import LandingSection from './LandingSection';
import { layout, serifTitleLight } from './landingLayout';

interface LandingFinalCTAProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onLayout?: (e: import('react-native').LayoutChangeEvent) => void;
}

const LandingFinalCTA: React.FC<LandingFinalCTAProps> = ({ onGetStarted, onSignIn, onLayout }) => {
  const { isMobileLayout } = useBreakpoint();

  return (
    <LandingSection variant="dark" onLayout={onLayout}>
      <View style={[layout.inner, styles.wrap]}>
        <Text style={styles.eyebrow}>Ready when you are</Text>
        <Text style={[styles.title, isMobileLayout && styles.titleMobile]}>
          Give your front desk{'\n'}an operating system.
        </Text>
        <Text style={styles.sub}>
          Sign up your clinic in a few steps. No hardware, no patient app, nothing new for your team to figure out.
        </Text>
        <View style={[styles.actions, isMobileLayout && styles.actionsMobile]}>
          <LandingButton
            label="Sign up your clinic"
            onPress={onGetStarted}
            style={styles.primary}
            labelStyle={styles.primaryLabel}
          />
          <LandingButton label="Sign in" onPress={onSignIn} variant="light" style={styles.secondary} />
        </View>
      </View>
    </LandingSection>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(245,239,230,0.5)',
    marginBottom: 16,
  },
  title: {
    ...serifTitleLight(44, 52),
    textAlign: 'center',
    marginBottom: 16,
  },
  titleMobile: { fontSize: 30, lineHeight: 38 },
  sub: {
    fontSize: 16,
    lineHeight: 26,
    color: 'rgba(245,239,230,0.7)',
    textAlign: 'center',
    maxWidth: 480,
    marginBottom: 32,
  },
  actions: { flexDirection: 'row', gap: 12 },
  actionsMobile: { flexDirection: 'column', width: '100%' },
  primary: { backgroundColor: landing.cream, minWidth: 200 },
  primaryLabel: { color: landing.green },
  secondary: { minWidth: 140 },
});

export default LandingFinalCTA;
