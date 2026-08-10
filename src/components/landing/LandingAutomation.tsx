import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { landing } from '../../theme/landingTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import LandingSection from './LandingSection';
import { layout, serifTitle } from './landingLayout';

const STEPS = [
  { label: 'Cancellation detected', icon: 'calendar-remove' as const },
  { label: 'Waitlist notified', icon: 'account-multiple' as const },
  { label: 'Patient accepts slot', icon: 'check-circle' as const },
  { label: 'Slot rebooked automatically', icon: 'lightning-bolt' as const },
];

interface LandingAutomationProps {
  onLayout?: (e: import('react-native').LayoutChangeEvent) => void;
}

const LandingAutomation: React.FC<LandingAutomationProps> = ({ onLayout }) => {
  const { isMobileLayout } = useBreakpoint();
  const [activeStep, setActiveStep] = useState(0);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % STEPS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.04, duration: 400, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [activeStep, pulse]);

  return (
    <LandingSection variant="tan" onLayout={onLayout}>
      <View style={layout.inner}>
        <Text style={styles.eyebrow}>Automation</Text>
        <Text style={[styles.title, isMobileLayout && styles.titleMobile]}>
          The product works while your team{'\n'}
          <Text style={styles.titleItalic}>focuses on patients.</Text>
        </Text>
        <Text style={styles.intro}>
          When a slot opens, Clinic Desk can message waitlisted patients in order — no phone calls, no manual chasing.
        </Text>

        <View style={[styles.pipeline, isMobileLayout && styles.pipelineMobile]}>
          {STEPS.map((step, i) => {
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            return (
              <View key={step.label} style={styles.pipeStep}>
                <View style={[styles.pipeIcon, isActive && styles.pipeIconActive, isDone && styles.pipeIconDone]}>
                  <MaterialCommunityIcons
                    name={step.icon}
                    size={18}
                    color={isActive || isDone ? landing.textOnGreen : landing.textMuted}
                  />
                </View>
                <Text style={[styles.pipeLabel, isActive && styles.pipeLabelActive]}>{step.label}</Text>
                {i < STEPS.length - 1 && <View style={[styles.pipeArrow, isDone && styles.pipeArrowDone]} />}
              </View>
            );
          })}
        </View>

        <Animated.View style={[styles.resultCard, { transform: [{ scale: pulse }] }]}>
          <View style={styles.resultHeader}>
            <View style={styles.waIcon}>
              <MaterialCommunityIcons name="whatsapp" size={14} color="#FFF" />
            </View>
            <Text style={styles.resultMeta}>Clinic Desk · System output</Text>
          </View>
          <Text style={styles.resultTitle}>Slot filled from waitlist</Text>
          <Text style={styles.resultDesc}>
            A 5:15 PM slot was cancelled. The next waitlisted patient was messaged and accepted within under a minute.
            No front-desk time spent chasing the slot.
          </Text>
          <View style={styles.resultTags}>
            <View style={styles.tagGreen}>
              <Text style={styles.tagGreenText}>AUTO-FILLED</Text>
            </View>
            <View style={styles.tagTan}>
              <Text style={styles.tagTanText}>NO SLOT WASTED</Text>
            </View>
          </View>
        </Animated.View>

        <Text style={styles.note}>
          Waitlist auto-fill runs on the backend when cancellations occur. Illustrative example — actual timing varies.
        </Text>
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
    marginBottom: 12,
  },
  titleMobile: { fontSize: 26, lineHeight: 34 },
  titleItalic: { fontStyle: 'italic', color: landing.green },
  intro: {
    fontSize: 15,
    lineHeight: 24,
    color: landing.textMuted,
    textAlign: 'center',
    maxWidth: 560,
    alignSelf: 'center',
    marginBottom: 40,
  },
  pipeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 8,
  },
  pipelineMobile: { flexDirection: 'column', gap: 16 },
  pipeStep: { flex: 1, alignItems: 'center', position: 'relative' },
  pipeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: landing.border,
    backgroundColor: landing.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  pipeIconActive: { backgroundColor: landing.green, borderColor: landing.green },
  pipeIconDone: { backgroundColor: landing.greenLight, borderColor: landing.greenLight },
  pipeLabel: { fontSize: 11, color: landing.textMuted, textAlign: 'center', lineHeight: 16 },
  pipeLabelActive: { color: landing.text, fontWeight: '700' },
  pipeArrow: {
    position: 'absolute',
    top: 20,
    right: -12,
    width: 24,
    height: 2,
    backgroundColor: landing.border,
  },
  pipeArrowDone: { backgroundColor: landing.greenLight },
  resultCard: {
    backgroundColor: landing.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: landing.border,
    padding: 24,
    marginBottom: 16,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  waIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultMeta: { fontSize: 11, color: landing.textMuted, fontWeight: '600' },
  resultTitle: { fontSize: 18, fontWeight: '700', color: landing.text, marginBottom: 8 },
  resultDesc: { fontSize: 14, lineHeight: 22, color: landing.textMuted, marginBottom: 16 },
  resultTags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tagGreen: { backgroundColor: landing.green, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  tagGreenText: { fontSize: 9, fontWeight: '800', color: landing.textOnGreen, letterSpacing: 0.5 },
  tagTan: { backgroundColor: landing.tan, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  tagTanText: { fontSize: 9, fontWeight: '800', color: landing.text, letterSpacing: 0.5 },
  note: { fontSize: 11, color: landing.textMuted, textAlign: 'center' },
});

export default LandingAutomation;
