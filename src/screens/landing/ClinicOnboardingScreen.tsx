import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  type ViewStyle,
} from 'react-native';
import { Text, TextInput, Checkbox } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { landing, landingFonts } from '../../theme/landingTheme';
import LandingButton from '../../components/landing/LandingButton';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { submitClinicSignup } from '../../services/clinicSignup';

interface ClinicOnboardingScreenProps {
  onComplete: (email: string) => void;
  onBack: () => void;
  onSignIn: () => void;
}

const CLINIC_TYPES = [
  'General Physician',
  'Dental',
  'Dermatology',
  'Paediatrics',
  'Diagnostics / Lab',
  'Multi-specialty',
  'Other',
];

const DOCTOR_COUNTS = [
  '1 (Solo practice)',
  '2–3',
  '4–10',
  '10+',
];

const FOOTFALL_RANGES = [
  'Under 20 patients/day',
  '20–50 patients/day',
  '50–100 patients/day',
  '100+ patients/day',
];

const ROLES = [
  'Clinic Owner',
  'Doctor',
  'Practice Manager',
  'Receptionist / Front desk',
  'Other',
];

const BOOKING_METHODS = [
  'Walk-ins only, no booking',
  'Phone calls to the front desk',
  'Paper register / diary',
  'Manually over WhatsApp',
  'Existing clinic software',
];

const PAIN_POINTS = [
  'Missed calls',
  'No-shows',
  'Long wait times',
  'Manual records',
  'No patient follow-ups',
  'Front desk overload',
];

const GO_LIVE_OPTIONS = [
  'This month',
  'Next quarter',
  'Just exploring for now',
];

const HEAR_ABOUT = [
  'Instagram',
  'LinkedIn',
  'Google search',
  'Referral from another clinic',
  'Other',
];

const STEPS = [
  {
    num: 1,
    title: 'Your clinic',
    desc: 'What you run, where, and how big it is today.',
  },
  {
    num: 2,
    title: 'Your setup today',
    desc: 'How bookings currently happen, and where it hurts most.',
  },
  {
    num: 3,
    title: 'Timeline & consent',
    desc: "When you'd like to go live, and how to reach you.",
  },
];

const ClinicOnboardingScreen: React.FC<ClinicOnboardingScreenProps> = ({
  onComplete,
  onBack,
  onSignIn,
}) => {
  const { isMobileLayout } = useBreakpoint();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Step 1
  const [clinicName, setClinicName] = useState('');
  const [clinicType, setClinicType] = useState('');
  const [doctorCount, setDoctorCount] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [footfall, setFootfall] = useState('');

  // Step 2
  const [yourName, setYourName] = useState('');
  const [yourRole, setYourRole] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [bookingMethod, setBookingMethod] = useState('');
  const [painPoints, setPainPoints] = useState<string[]>([]);

  // Step 3
  const [goLive, setGoLive] = useState('');
  const [hearAbout, setHearAbout] = useState('');
  const [notes, setNotes] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const togglePainPoint = useCallback((point: string) => {
    setPainPoints((prev) =>
      prev.includes(point) ? prev.filter((p) => p !== point) : [...prev, point],
    );
  }, []);

  const canSubmit =
    agreed &&
    clinicName.trim().length > 0 &&
    yourName.trim().length > 0 &&
    email.trim().length > 0 &&
    !submitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);

    const result = await submitClinicSignup({
      clinicName: clinicName.trim(),
      clinicType,
      doctorCount,
      city: city.trim(),
      state: state.trim(),
      footfall,
      yourName: yourName.trim(),
      yourRole,
      whatsapp: whatsapp.trim(),
      email: email.trim().toLowerCase(),
      bookingMethod,
      painPoints,
      goLive,
      hearAbout,
      notes: notes.trim(),
    });

    setSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error || 'Signup failed. Please try again.');
      return;
    }

    onComplete(email.trim().toLowerCase());
  }, [
    canSubmit,
    clinicName,
    clinicType,
    doctorCount,
    city,
    state,
    footfall,
    yourName,
    yourRole,
    whatsapp,
    email,
    bookingMethod,
    painPoints,
    goLive,
    hearAbout,
    notes,
    onComplete,
  ]);

  const closeDropdown = () => setOpenDropdown(null);

  return (
    <View style={styles.root}>
      <TouchableOpacity onPress={onBack} style={styles.backFloating}>
        <MaterialCommunityIcons name="arrow-left" size={18} color={landing.textOnGreen} />
        <Text style={styles.backFloatingText}>Back</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={closeDropdown}
      >
        <View style={[styles.pageLayout, isMobileLayout && styles.pageLayoutMobile]}>
          {/* Left — steps */}
          <View style={[styles.leftCol, isMobileLayout && styles.leftColMobile]}>
            <Text style={styles.heroTitle}>
              Tell us about your clinic.{'\n'}We'll take it from there.
            </Text>
            <Text style={styles.heroSub}>
              This is what we need to set up your WhatsApp number, booking rules, and your team's
              front-desk workflow correctly on day one.
            </Text>

            <View style={styles.stepList}>
              {STEPS.map((step) => (
                <View key={step.num} style={styles.stepItem}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{step.num}</Text>
                  </View>
                  <View style={styles.stepBody}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="check-circle" size={18} color={landing.green} />
              <Text style={styles.infoText}>
                We'll get back to you within 24 hours. No sales calls before you're ready — just a
                short setup conversation on WhatsApp.
              </Text>
            </View>
          </View>

          {/* Right — form */}
          <View style={[styles.rightCol, isMobileLayout && styles.rightColMobile]}>
            <FormSection step="STEP 1" title="Your clinic">
              <FieldLabel text="Clinic name" />
              <TextInput
                mode="outlined"
                placeholder="e.g. Mehta Family Clinic"
                value={clinicName}
                onChangeText={setClinicName}
                style={styles.input}
                outlineColor={landing.border}
                activeOutlineColor={landing.green}
              />

              <View style={[styles.row, isMobileLayout && styles.rowMobile]}>
                <View style={styles.half}>
                  <DropdownField
                    fieldId="clinicType"
                    label="Clinic type"
                    placeholder="Select type"
                    value={clinicType}
                    options={CLINIC_TYPES}
                    openId={openDropdown}
                    onOpen={setOpenDropdown}
                    onSelect={setClinicType}
                  />
                </View>
                <View style={styles.half}>
                  <DropdownField
                    fieldId="doctorCount"
                    label="Number of doctors"
                    placeholder="Select"
                    value={doctorCount}
                    options={DOCTOR_COUNTS}
                    openId={openDropdown}
                    onOpen={setOpenDropdown}
                    onSelect={setDoctorCount}
                  />
                </View>
              </View>

              <View style={[styles.row, isMobileLayout && styles.rowMobile]}>
                <View style={styles.half}>
                  <FieldLabel text="City" />
                  <TextInput
                    mode="outlined"
                    placeholder="e.g. Ranchi"
                    value={city}
                    onChangeText={setCity}
                    style={styles.input}
                    outlineColor={landing.border}
                    activeOutlineColor={landing.green}
                  />
                </View>
                <View style={styles.half}>
                  <FieldLabel text="State" />
                  <TextInput
                    mode="outlined"
                    placeholder="e.g. Jharkhand"
                    value={state}
                    onChangeText={setState}
                    style={styles.input}
                    outlineColor={landing.border}
                    activeOutlineColor={landing.green}
                  />
                </View>
              </View>

              <DropdownField
                fieldId="footfall"
                label="Average daily patient footfall"
                placeholder="Select a range"
                value={footfall}
                options={FOOTFALL_RANGES}
                openId={openDropdown}
                onOpen={setOpenDropdown}
                onSelect={setFootfall}
              />
            </FormSection>

            <FormSection step="STEP 2" title="You, and how bookings run today">
              <FieldLabel text="Your name" />
              <TextInput
                mode="outlined"
                placeholder="Full name"
                value={yourName}
                onChangeText={setYourName}
                style={styles.input}
                outlineColor={landing.border}
                activeOutlineColor={landing.green}
              />

              <DropdownField
                fieldId="yourRole"
                label="Your role"
                placeholder="Select role"
                value={yourRole}
                options={ROLES}
                openId={openDropdown}
                onOpen={setOpenDropdown}
                onSelect={setYourRole}
              />

              <FieldLabel text="WhatsApp number" hint="This becomes your clinic's booking line" />
              <TextInput
                mode="outlined"
                placeholder="+91 XXXXX XXXXX"
                value={whatsapp}
                onChangeText={setWhatsapp}
                keyboardType="phone-pad"
                style={styles.input}
                outlineColor={landing.border}
                activeOutlineColor={landing.green}
              />

              <FieldLabel text="Email" />
              <TextInput
                mode="outlined"
                placeholder="you@clinic.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                outlineColor={landing.border}
                activeOutlineColor={landing.green}
              />

              <DropdownField
                fieldId="bookingMethod"
                label="How do you currently manage bookings?"
                placeholder="Select current method"
                value={bookingMethod}
                options={BOOKING_METHODS}
                openId={openDropdown}
                onOpen={setOpenDropdown}
                onSelect={setBookingMethod}
              />

              <Text style={styles.painLabel}>
                Where does it hurt most right now?{' '}
                <Text style={styles.painHint}>(select all that apply)</Text>
              </Text>
              <View style={styles.painGrid}>
                {PAIN_POINTS.map((point) => {
                  const selected = painPoints.includes(point);
                  return (
                    <TouchableOpacity
                      key={point}
                      onPress={() => togglePainPoint(point)}
                      style={[styles.painChip, selected && styles.painChipSelected]}
                      activeOpacity={0.85}
                    >
                      <View style={[styles.painCheck, selected && styles.painCheckSelected]}>
                        {selected && (
                          <MaterialCommunityIcons name="check" size={12} color={landing.textOnGreen} />
                        )}
                      </View>
                      <Text style={[styles.painChipText, selected && styles.painChipTextSelected]}>
                        {point}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </FormSection>

            <FormSection step="STEP 3" title="Timeline & consent">
              <View style={[styles.row, isMobileLayout && styles.rowMobile]}>
                <View style={styles.half}>
                  <DropdownField
                    fieldId="goLive"
                    label="When would you like to go live?"
                    placeholder="Select"
                    value={goLive}
                    options={GO_LIVE_OPTIONS}
                    openId={openDropdown}
                    onOpen={setOpenDropdown}
                    onSelect={setGoLive}
                  />
                </View>
                <View style={styles.half}>
                  <DropdownField
                    fieldId="hearAbout"
                    label="How did you hear about Clinic Desk?"
                    placeholder="Select"
                    value={hearAbout}
                    options={HEAR_ABOUT}
                    openId={openDropdown}
                    onOpen={setOpenDropdown}
                    onSelect={setHearAbout}
                  />
                </View>
              </View>

              <FieldLabel text="Anything else we should know? (optional)" />
              <TextInput
                mode="outlined"
                placeholder="Existing software, specific requirements..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textarea]}
                outlineColor={landing.border}
                activeOutlineColor={landing.green}
              />
            </FormSection>

            <View style={styles.termsRow}>
              <Checkbox
                status={agreed ? 'checked' : 'unchecked'}
                onPress={() => setAgreed((v) => !v)}
                color={landing.green}
              />
              <Text style={styles.termsText}>
                I agree to be contacted on WhatsApp and email about setting up Clinic Desk for my
                clinic.
              </Text>
            </View>

            <LandingButton
              label={submitting ? 'Creating your account…' : 'Sign up my clinic'}
              onPress={handleSubmit}
              fullWidth
              style={!canSubmit ? styles.submitDisabled : undefined}
            />
            {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
            {!canSubmit && !submitError && (
              <Text style={styles.submitHint}>
                Clinic name, your name, email, and consent are required
              </Text>
            )}
            <Text style={styles.responseNote}>We'll get back to you within 24 hours.</Text>

            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={onSignIn}>
                <Text style={styles.footerLink}>Already have an account? Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const FieldLabel: React.FC<{ text: string; hint?: string }> = ({ text, hint }) => (
  <View style={styles.fieldLabelWrap}>
    <Text style={styles.fieldLabel}>{text}</Text>
    {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
  </View>
);

const FormSection: React.FC<{ step: string; title: string; children: React.ReactNode }> = ({
  step,
  title,
  children,
}) => (
  <View style={styles.formSection}>
    <Text style={styles.stepEyebrow}>{step}</Text>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

interface DropdownFieldProps {
  fieldId: string;
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  openId: string | null;
  onOpen: (id: string | null) => void;
  onSelect: (v: string) => void;
}

const DropdownField: React.FC<DropdownFieldProps> = ({
  fieldId,
  label,
  placeholder,
  value,
  options,
  openId,
  onOpen,
  onSelect,
}) => {
  const isOpen = openId === fieldId;

  return (
    <View style={[styles.dropdownWrap, isOpen && styles.dropdownWrapOpen]}>
      <FieldLabel text={label} />
      <TouchableOpacity
        onPress={() => onOpen(isOpen ? null : fieldId)}
        style={[styles.dropdownTrigger, isOpen && styles.dropdownTriggerOpen]}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
      >
        <Text style={[styles.dropdownValue, !value && styles.dropdownPlaceholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={landing.textMuted}
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownMenu}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => {
                onSelect(opt);
                onOpen(null);
              }}
              style={[styles.dropdownOption, value === opt && styles.dropdownOptionSelected]}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  value === opt && styles.dropdownOptionTextSelected,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: landing.green,
    minHeight: Platform.OS === 'web' ? ('100vh' as unknown as number) : undefined,
  },
  backFloating: {
    position: 'absolute',
    top: 20,
    left: 24,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backFloatingText: {
    color: landing.textOnGreen,
    fontSize: 14,
    fontWeight: '500',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 24,
    paddingTop: 56,
    alignItems: 'center',
    flexGrow: 1,
  },
  pageLayout: {
    width: '100%',
    maxWidth: 1080,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 32,
  },
  pageLayoutMobile: {
    flexDirection: 'column',
    gap: 24,
  },
  leftCol: {
    width: 300,
    paddingTop: 8,
    flexShrink: 0,
  },
  leftColMobile: {
    width: '100%',
    paddingTop: 0,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 38,
    color: landing.textOnGreen,
    letterSpacing: -0.5,
    marginBottom: 14,
    ...Platform.select({
      web: { fontFamily: landingFonts.serif } as ViewStyle,
      default: {},
    }),
  },
  heroSub: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(245,239,230,0.75)',
    marginBottom: 32,
  },
  stepList: { gap: 24, marginBottom: 32 },
  stepItem: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(245,239,230,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontSize: 12, fontWeight: '700', color: landing.textOnGreen },
  stepBody: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: landing.textOnGreen, marginBottom: 4 },
  stepDesc: { fontSize: 12, lineHeight: 18, color: 'rgba(245,239,230,0.6)' },
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    backgroundColor: 'rgba(245,239,230,0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245,239,230,0.15)',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(245,239,230,0.75)',
    lineHeight: 18,
  },
  rightCol: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  rightColMobile: {
    width: '100%',
  },
  formSection: {
    borderWidth: 1,
    borderColor: landing.border,
    borderRadius: 12,
    padding: 22,
    marginBottom: 16,
    backgroundColor: landing.white,
  },
  stepEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: landing.textMuted,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: landing.text,
    marginBottom: 20,
    ...Platform.select({
      web: { fontFamily: landingFonts.serif } as ViewStyle,
      default: {},
    }),
  },
  fieldLabelWrap: { marginBottom: 6 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: landing.text,
  },
  fieldHint: {
    fontSize: 11,
    color: landing.textMuted,
    marginTop: 2,
  },
  input: {
    marginBottom: 14,
    backgroundColor: landing.cream,
  },
  textarea: { minHeight: 88 },
  row: { flexDirection: 'row', gap: 12 },
  rowMobile: { flexDirection: 'column', gap: 0 },
  half: { flex: 1, minWidth: 0 },
  dropdownWrap: {
    marginBottom: 14,
    zIndex: 1,
  },
  dropdownWrapOpen: {
    zIndex: 20,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: landing.border,
    borderRadius: 8,
    backgroundColor: landing.cream,
    gap: 8,
    ...Platform.select({
      web: { cursor: 'pointer' } as ViewStyle,
      default: {},
    }),
  },
  dropdownTriggerOpen: {
    borderColor: landing.green,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownValue: {
    fontSize: 14,
    color: landing.text,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: landing.textMuted,
  },
  dropdownMenu: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: landing.green,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: landing.white,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(27,42,32,0.12)' } as ViewStyle,
      default: {},
    }),
  },
  dropdownOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: landing.divider,
    ...Platform.select({
      web: { cursor: 'pointer' } as ViewStyle,
      default: {},
    }),
  },
  dropdownOptionSelected: {
    backgroundColor: landing.creamDark,
  },
  dropdownOptionText: {
    fontSize: 14,
    color: landing.text,
  },
  dropdownOptionTextSelected: {
    fontWeight: '600',
    color: landing.green,
  },
  painLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: landing.text,
    marginBottom: 12,
  },
  painHint: {
    fontWeight: '400',
    color: landing.textMuted,
  },
  painGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  painChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '48%',
    minWidth: 140,
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: landing.border,
    backgroundColor: landing.cream,
  },
  painChipSelected: {
    borderColor: landing.green,
    backgroundColor: landing.creamDark,
  },
  painCheck: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: landing.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: landing.white,
  },
  painCheckSelected: {
    backgroundColor: landing.green,
    borderColor: landing.green,
  },
  painChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: landing.text,
    flex: 1,
  },
  painChipTextSelected: {
    fontWeight: '600',
    color: landing.green,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 16,
    gap: 4,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: landing.textMuted,
    lineHeight: 20,
    paddingTop: 8,
  },
  submitDisabled: { opacity: 0.5 },
  submitHint: {
    fontSize: 12,
    color: landing.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  submitError: {
    fontSize: 13,
    color: '#B42318',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
  },
  responseNote: {
    fontSize: 12,
    color: landing.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  footerLinks: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  footerLink: {
    fontSize: 13,
    color: landing.green,
    fontWeight: '600',
  },
});

export default ClinicOnboardingScreen;
