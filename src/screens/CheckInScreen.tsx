import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Divider,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  palette,
  spacing,
  radius,
  appointmentStatus as statusMap,
} from '../theme/theme';
import { useAppData } from '../context/AppDataContext';
import { formatTime, formatDateShort } from '../utils/dateUtils';
import type { Appointment, CheckInResult } from '../types';
import ScreenHeader from '../components/ui/ScreenHeader';
import ElevatedCard from '../components/ui/ElevatedCard';
import StatusPill from '../components/ui/StatusPill';
import PatientAvatar from '../components/ui/PatientAvatar';
import { screenStyles } from '../components/ui/screenStyles';

interface SuccessCardProps {
  appointment: Appointment;
  onReset: () => void;
}

const SuccessCard: React.FC<SuccessCardProps> = React.memo(({ appointment, onReset }) => {
  const st = statusMap.CHECKED_IN;

  return (
    <View style={styles.resultContainer}>
      <View style={styles.successIconWrap}>
        <MaterialCommunityIcons name="check-circle" size={48} color={palette.success} />
      </View>
      <Text variant="headlineSmall" style={styles.successHeading}>
        Patient checked in
      </Text>
      <Text variant="bodyMedium" style={styles.successSubtext}>
        Added to the live queue
      </Text>

      <ElevatedCard style={styles.detailCard}>
        <View style={styles.patientHeader}>
          <PatientAvatar name={appointment.patientName} size="lg" variant="primary" />
          <View style={styles.patientHeaderInfo}>
            <Text variant="titleMedium" style={styles.patientHeaderName}>
              {appointment.patientName}
            </Text>
            <StatusPill status={st} />
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.detailRow}>
          <Text variant="bodySmall" style={styles.detailLabel}>Appointment</Text>
          <Text variant="titleSmall" style={styles.detailValue}>
            {formatDateShort(appointment.scheduledTime)}, {formatTime(appointment.scheduledTime)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text variant="bodySmall" style={styles.detailLabel}>Booking code</Text>
          <Text variant="titleSmall" style={styles.codeValue}>{appointment.bookingCode}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text variant="bodySmall" style={styles.detailLabel}>Source</Text>
          <Text variant="titleSmall" style={styles.detailValue}>
            {appointment.source === 'whatsapp' ? 'WhatsApp' : 'Walk-in'}
          </Text>
        </View>
      </ElevatedCard>

      <Button
        mode="contained"
        onPress={onReset}
        style={styles.resetButton}
        contentStyle={styles.resetButtonContent}
        labelStyle={styles.resetButtonLabel}
      >
        Check in another patient
      </Button>
    </View>
  );
});

interface ErrorCardProps {
  message: string;
}

const ErrorCard: React.FC<ErrorCardProps> = React.memo(({ message }) => (
  <ElevatedCard style={styles.errorCard}>
    <View style={styles.errorCardBody}>
      <MaterialCommunityIcons name="alert-circle-outline" size={20} color={palette.error} />
      <Text variant="bodyMedium" style={styles.errorText}>{message}</Text>
    </View>
  </ElevatedCard>
));

const CheckInScreen: React.FC = () => {
  const { checkInByCode } = useAppData();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();
    setSubmitting(true);
    const res = await checkInByCode(code);
    setResult(res);
    setSubmitting(false);
  }, [code, checkInByCode]);

  const handleReset = useCallback(() => {
    setCode('');
    setResult(null);
    setInputKey((k) => k + 1);
  }, []);

  const handleCodeChange = useCallback((text: string) => {
    setResult(null);
    setCode(text.toUpperCase());
  }, []);

  const showInput = !result?.success;

  return (
    <View style={screenStyles.screen}>
      <ScreenHeader title="Check In" subtitle="Enter booking code" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {showInput ? (
          <View style={styles.inputContainer}>
            <ElevatedCard>
              <View style={styles.inputCardBody}>
                <View style={styles.inputIconWrap}>
                  <MaterialCommunityIcons name="barcode-scan" size={28} color={palette.primary} />
                </View>
                <Text variant="titleMedium" style={styles.inputTitle}>
                  Scan or enter code
                </Text>
                <Text variant="bodySmall" style={styles.instructionText}>
                  Patient's 4-character booking code from WhatsApp confirmation
                </Text>

                <TextInput
                  key={inputKey}
                  autoFocus={inputKey > 0}
                  mode="outlined"
                  label="Booking code"
                  placeholder="e.g. RK9A"
                  value={code}
                  onChangeText={handleCodeChange}
                  onSubmitEditing={handleSubmit}
                  returnKeyType="done"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={8}
                  style={styles.textInput}
                  outlineStyle={styles.textInputOutline}
                  outlineColor={palette.border}
                  activeOutlineColor={palette.primary}
                  textColor={palette.textPrimary}
                  placeholderTextColor={palette.textDisabled}
                />

                {result && !result.success && (
                  <ErrorCard message={result.error ?? 'Check-in failed'} />
                )}

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={code.trim().length === 0 || submitting}
                  style={styles.submitButton}
                  contentStyle={styles.submitButtonContent}
                  labelStyle={styles.submitButtonLabel}
                  icon="account-check"
                >
                  Check in
                </Button>
              </View>
            </ElevatedCard>
          </View>
        ) : (
          result?.appointment && (
            <SuccessCard appointment={result.appointment} onReset={handleReset} />
          )
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: { flex: 1 },
  inputContainer: {
    padding: spacing.base,
    paddingTop: spacing.lg,
  },
  inputCardBody: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  inputIconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: palette.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  inputTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  instructionText: {
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  textInput: {
    width: '100%',
    backgroundColor: palette.surface,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 4,
    textAlign: 'center',
  },
  textInputOutline: {
    borderRadius: radius.sm,
  },
  submitButton: {
    width: '100%',
    marginTop: spacing.base,
    borderRadius: radius.sm,
    backgroundColor: palette.primary,
  },
  submitButtonContent: {
    paddingVertical: spacing.sm,
  },
  submitButtonLabel: {
    fontWeight: '600',
    fontSize: 15,
  },
  errorCard: {
    width: '100%',
    marginTop: spacing.md,
    backgroundColor: palette.errorLight,
    borderColor: palette.errorLight,
  },
  errorCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  errorText: {
    flex: 1,
    color: palette.error,
  },
  resultContainer: {
    padding: spacing.base,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  successIconWrap: {
    marginBottom: spacing.sm,
  },
  successHeading: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  successSubtext: {
    color: palette.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  detailCard: {
    width: '100%',
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
  },
  patientHeaderInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  patientHeaderName: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  divider: {
    backgroundColor: palette.divider,
    height: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  detailLabel: {
    color: palette.textSecondary,
  },
  detailValue: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  codeValue: {
    color: palette.primary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  resetButton: {
    width: '100%',
    marginTop: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: palette.primary,
  },
  resetButtonContent: {
    paddingVertical: spacing.sm,
  },
  resetButtonLabel: {
    fontWeight: '600',
    fontSize: 15,
  },
});

export default CheckInScreen;
