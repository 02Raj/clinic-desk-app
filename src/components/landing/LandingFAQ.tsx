import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, type ViewStyle } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { landing } from '../../theme/landingTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import LandingSection from './LandingSection';
import { layout, serifTitle } from './landingLayout';

const FAQ_ITEMS = [
  {
    q: 'Do my patients need to download an app?',
    a: 'No. Everything runs through WhatsApp, which most patients already use. There is nothing to install and nothing new to learn.',
  },
  {
    q: 'How do patients book appointments?',
    a: 'Patients message your clinic WhatsApp number. The bot guides them through doctor, date, and slot selection with interactive menus.',
  },
  {
    q: 'What happens when a patient arrives?',
    a: 'They show their 4-character booking code at the desk, or text HERE on WhatsApp. They join the live queue with a token number.',
  },
  {
    q: 'Does my front desk need training?',
    a: 'Barely. Your team works from a familiar dashboard — today\'s bookings, check-in, and live queue. Clinic Desk handles patient messaging automatically.',
  },
  {
    q: 'How long does setup take?',
    a: 'Most clinics can go live within a week once your WhatsApp number and booking rules are confirmed during onboarding.',
  },
  {
    q: 'Is my clinic data secure?',
    a: 'Yes. Data is stored in Firebase with authenticated access. Only your clinic team can view appointments and settings after login.',
  },
  {
    q: 'Can I use this on mobile and desktop?',
    a: 'Yes. The same app runs on reception tablets, phones, and a full desktop dashboard for your front desk.',
  },
  {
    q: 'What if a patient cancels?',
    a: 'Cancellations update the appointment status immediately. The system can offer the slot to waitlisted patients automatically.',
  },
];

interface LandingFAQProps {
  onLayout?: (e: import('react-native').LayoutChangeEvent) => void;
}

const LandingFAQ: React.FC<LandingFAQProps> = ({ onLayout }) => {
  const { isMobileLayout } = useBreakpoint();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <LandingSection variant="white" onLayout={onLayout}>
      <View style={[layout.inner, layout.innerNarrow]}>
        <Text style={styles.eyebrow}>Questions, answered</Text>
        <Text style={[styles.title, isMobileLayout && styles.titleMobile]}>
          Everything clinics ask before signing up.
        </Text>

        <View style={styles.list}>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <View key={item.q} style={styles.item}>
                <TouchableOpacity
                  onPress={() => setOpenIndex(isOpen ? null : index)}
                  style={styles.question}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                >
                  <Text style={styles.questionText}>{item.q}</Text>
                  <MaterialCommunityIcons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={landing.textMuted}
                  />
                </TouchableOpacity>
                {isOpen && <Text style={styles.answer}>{item.a}</Text>}
              </View>
            );
          })}
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
    marginBottom: 12,
    textAlign: 'center',
  },
  title: {
    ...serifTitle(32, 40),
    textAlign: 'center',
    marginBottom: 40,
  },
  titleMobile: { fontSize: 24, lineHeight: 32 },
  list: { gap: 0 },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: landing.border,
    paddingVertical: 4,
  },
  question: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    gap: 16,
    ...Platform.select({ web: { cursor: 'pointer' } as ViewStyle, default: {} }),
  },
  questionText: { flex: 1, fontSize: 15, fontWeight: '600', color: landing.text, lineHeight: 22 },
  answer: {
    fontSize: 14,
    lineHeight: 22,
    color: landing.textMuted,
    paddingBottom: 18,
    paddingRight: 32,
  },
});

export default LandingFAQ;
