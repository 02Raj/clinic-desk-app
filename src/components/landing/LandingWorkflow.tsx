import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, type ViewStyle } from 'react-native';
import { landing } from '../../theme/landingTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import LandingSection from './LandingSection';
import WorkflowStepPreview from './mockups/WorkflowStepPreview';
import { useCyclingIndex } from './hooks/useCyclingIndex';
import { layout, serifTitle } from './landingLayout';

const STEPS = [
  {
    num: '01',
    title: 'Patient books through WhatsApp',
    desc: 'Chooses a slot in chat. No app download, no phone call to reception.',
    tag: 'WhatsApp',
  },
  {
    num: '02',
    title: 'Booking is detected',
    desc: 'Clinic Desk reads the request, matches doctor availability, and locks the slot.',
    tag: 'Automation',
  },
  {
    num: '03',
    title: 'Reception gets notified',
    desc: 'A new booking appears on the dashboard — no manual entry required.',
    tag: 'Alert',
  },
  {
    num: '04',
    title: 'Queue and dashboard update',
    desc: "Today's schedule, tokens, and patient status stay in sync across devices.",
    tag: 'Dashboard',
  },
  {
    num: '05',
    title: 'Patient receives confirmation',
    desc: 'Booking code and visit details sent back on WhatsApp automatically.',
    tag: 'Confirmed',
  },
];

interface LandingWorkflowProps {
  onLayout?: (e: import('react-native').LayoutChangeEvent) => void;
}

const LandingWorkflow: React.FC<LandingWorkflowProps> = ({ onLayout }) => {
  const { isMobileLayout } = useBreakpoint();
  const { index: activeStep, select } = useCyclingIndex(STEPS.length, 4500);

  return (
    <LandingSection variant="white" onLayout={onLayout}>
      <View style={layout.inner}>
        <Text style={styles.eyebrow}>How it works</Text>
        <Text style={[styles.title, isMobileLayout && styles.titleMobile]}>
          Watch what happens when a{'\n'}
          <Text style={styles.titleItalic}>patient messages your clinic.</Text>
        </Text>
        <Text style={styles.intro}>
          Five steps from WhatsApp message to confirmed appointment — with your front desk always
          in the loop.
        </Text>

        <View style={[styles.layout, isMobileLayout && styles.layoutMobile]}>
          <View style={styles.stepsCol}>
            {STEPS.map((step, i) => {
              const isActive = i === activeStep;
              return (
                <TouchableOpacity
                  key={step.num}
                  onPress={() => select(i)}
                  activeOpacity={0.9}
                  style={[styles.stepCard, isActive && styles.stepCardActive]}
                >
                  <View style={styles.stepTop}>
                    <Text style={[styles.stepNum, isActive && styles.stepNumActive]}>{step.num}</Text>
                    <View style={[styles.tag, isActive && styles.tagActive]}>
                      <Text style={[styles.tagText, isActive && styles.tagTextActive]}>{step.tag}</Text>
                    </View>
                  </View>
                  <Text style={[styles.stepTitle, isActive && styles.stepTitleActive]}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.previewCol}>
            <WorkflowStepPreview stepIndex={activeStep} />
          </View>
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
    marginBottom: 14,
    textAlign: 'center',
  },
  title: {
    ...serifTitle(38, 46),
    textAlign: 'center',
    marginBottom: 12,
  },
  titleMobile: { fontSize: 28, lineHeight: 36 },
  titleItalic: { fontStyle: 'italic', color: landing.green },
  intro: {
    fontSize: 15,
    lineHeight: 24,
    color: landing.textMuted,
    textAlign: 'center',
    maxWidth: 560,
    alignSelf: 'center',
    marginBottom: 44,
  },
  layout: {
    flexDirection: 'row',
    gap: 32,
    alignItems: 'flex-start',
  },
  layoutMobile: { flexDirection: 'column' },
  stepsCol: { flex: 1.1, gap: 10, minWidth: 0 },
  previewCol: { flex: 0.9, minWidth: 280, position: 'sticky' as unknown as undefined },
  stepCard: {
    borderWidth: 1,
    borderColor: landing.border,
    borderRadius: 10,
    padding: 16,
    backgroundColor: landing.cream,
    ...Platform.select({ web: { cursor: 'pointer', transition: 'all 0.2s ease' } as ViewStyle, default: {} }),
  },
  stepCardActive: {
    borderColor: landing.green,
    backgroundColor: landing.white,
    ...Platform.select({
      web: { boxShadow: '0 4px 20px rgba(27,42,32,0.08)' } as ViewStyle,
      default: {},
    }),
  },
  stepTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  stepNum: { fontSize: 12, fontWeight: '800', color: landing.textMuted },
  stepNumActive: { color: landing.green },
  tag: {
    borderWidth: 1,
    borderColor: landing.border,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagActive: { borderColor: landing.green, backgroundColor: landing.creamDark },
  tagText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, color: landing.textMuted },
  tagTextActive: { color: landing.green },
  stepTitle: { fontSize: 15, fontWeight: '700', color: landing.text, marginBottom: 4 },
  stepTitleActive: { color: landing.green },
  stepDesc: { fontSize: 13, lineHeight: 19, color: landing.textMuted },
});

export default LandingWorkflow;
