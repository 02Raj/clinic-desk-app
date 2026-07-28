import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import {
  Appbar,
  Card,
  Chip,
  Text,
  TextInput,
  Button,
  IconButton,
  Divider,
} from 'react-native-paper';
import {
  palette,
  spacing,
  radius,
  shadows,
  appointmentStatus as statusMap,
} from '../theme/theme';
import MOCK_APPOINTMENTS from '../data/mockAppointments';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatTime = (date) =>
  date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

const formatDateShort = (date) =>
  date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

/**
 * Mock check-in logic. Looks up appointment by booking code, validates it's
 * in a check-in-able status, and returns the result.
 * Will be replaced with a Firestore query + write later.
 */
const performMockCheckIn = (code) => {
  const normalised = code.trim().toUpperCase();

  if (!normalised) {
    return { success: false, error: 'Please enter a booking code.' };
  }

  const appointment = MOCK_APPOINTMENTS.find(
    (apt) => apt.bookingCode.toUpperCase() === normalised,
  );

  if (!appointment) {
    return {
      success: false,
      error: `No appointment found for code "${normalised}".`,
    };
  }

  const checkInableStatuses = ['BOOKED', 'CONFIRMED'];
  if (!checkInableStatuses.includes(appointment.status)) {
    const st = statusMap[appointment.status];
    return {
      success: false,
      error: `This appointment is already "${st.label}". Only Booked or Confirmed appointments can be checked in.`,
    };
  }

  // In a real implementation this would write to Firestore:
  //   - Update appointment status → CHECKED_IN
  //   - Append appointmentId to the doctor's queue.patientsWaiting
  return {
    success: true,
    appointment: { ...appointment, status: 'CHECKED_IN' },
  };
};

// ---------------------------------------------------------------------------
// Success card — shown after a successful check-in
// ---------------------------------------------------------------------------

const SuccessCard = React.memo(({ appointment, onReset }) => {
  const st = statusMap.CHECKED_IN;

  return (
    <View style={styles.resultContainer}>
      {/* Success icon */}
      <View style={styles.successIconWrapper}>
        <IconButton
          icon="check-circle"
          size={56}
          iconColor={palette.success}
          style={styles.successIcon}
        />
      </View>

      <Text variant="headlineSmall" style={styles.successHeading}>
        Patient checked in
      </Text>

      {/* Patient detail card — same card pattern as TodaysBookingsScreen */}
      <Card style={styles.card} mode="contained">
        <View style={styles.cardBody}>
          {/* Row 1: Name */}
          <View style={styles.detailRow}>
            <Text variant="bodySmall" style={styles.detailLabel}>
              Patient
            </Text>
            <Text variant="titleMedium" style={styles.detailValue}>
              {appointment.patientName}
            </Text>
          </View>

          <Divider style={styles.cardDivider} />

          {/* Row 2: Time */}
          <View style={styles.detailRow}>
            <Text variant="bodySmall" style={styles.detailLabel}>
              Appointment
            </Text>
            <Text variant="titleSmall" style={styles.detailValue}>
              {formatDateShort(appointment.scheduledTime)},{' '}
              {formatTime(appointment.scheduledTime)}
            </Text>
          </View>

          <Divider style={styles.cardDivider} />

          {/* Row 3: Code + Status */}
          <View style={styles.detailRow}>
            <Text variant="bodySmall" style={styles.detailLabel}>
              Booking code
            </Text>
            <View style={styles.codeStatusRow}>
              <Text variant="titleSmall" style={styles.detailValue}>
                {appointment.bookingCode}
              </Text>
              <Chip
                compact
                textStyle={[styles.chipText, { color: st.color }]}
                style={[styles.chip, { backgroundColor: st.backgroundColor }]}
              >
                {st.label}
              </Chip>
            </View>
          </View>

          <Divider style={styles.cardDivider} />

          {/* Row 4: Source */}
          <View style={styles.detailRow}>
            <Text variant="bodySmall" style={styles.detailLabel}>
              Source
            </Text>
            <Text variant="titleSmall" style={styles.detailValue}>
              {appointment.source === 'whatsapp' ? 'WhatsApp' : 'Walk-in'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Reset button */}
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

// ---------------------------------------------------------------------------
// Error card
// ---------------------------------------------------------------------------

const ErrorCard = React.memo(({ message }) => (
  <Card style={styles.errorCard} mode="contained">
    <View style={styles.errorCardBody}>
      <IconButton
        icon="alert-circle-outline"
        size={24}
        iconColor={palette.error}
        style={styles.errorIcon}
      />
      <Text variant="bodyMedium" style={styles.errorText}>
        {message}
      </Text>
    </View>
  </Card>
));

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

const CheckInScreen = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null); // { success, appointment?, error? }
  const inputRef = useRef(null);

  const handleSubmit = useCallback(() => {
    Keyboard.dismiss();
    const res = performMockCheckIn(code);
    setResult(res);
  }, [code]);

  const handleReset = useCallback(() => {
    setCode('');
    setResult(null);
    // Re-focus input after a brief delay so keyboard opens cleanly
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  const handleCodeChange = useCallback((text) => {
    // Clear previous result when user starts typing a new code
    setResult(null);
    // Booking codes are uppercase alphanumeric — auto-uppercase for convenience
    setCode(text.toUpperCase());
  }, []);

  const showInput = !result?.success;

  return (
    <View style={styles.safeArea}>

      {/* Appbar — flat, matches TodaysBookingsScreen */}
      <Appbar.Header
        mode="small"
        style={styles.appbar}
        statusBarHeight={0}
      >
        <Appbar.Content
          title="Check In"
          titleStyle={styles.appbarTitle}
        />
      </Appbar.Header>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {showInput ? (
          /* ---- Input state ---- */
          <View style={styles.inputContainer}>
            <Text variant="bodyMedium" style={styles.instructionText}>
              Enter the patient's booking code to check them in.
            </Text>

            <TextInput
              ref={inputRef}
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

            {/* Error feedback (inline, below input) */}
            {result && !result.success && (
              <ErrorCard message={result.error} />
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={code.trim().length === 0}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
              labelStyle={styles.submitButtonLabel}
            >
              Check in
            </Button>
          </View>
        ) : (
          /* ---- Success state ---- */
          <SuccessCard
            appointment={result.appointment}
            onReset={handleReset}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  keyboardAvoid: {
    flex: 1,
  },

  // Appbar — identical to TodaysBookingsScreen
  appbar: {
    backgroundColor: palette.background,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  appbarTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 22,
  },

  // Input area
  inputContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
  },
  instructionText: {
    color: palette.textSecondary,
    marginBottom: spacing.base,
  },
  textInput: {
    backgroundColor: palette.background,
    fontSize: 18,
    letterSpacing: 2,
  },
  textInputOutline: {
    borderRadius: radius.sm,
  },
  submitButton: {
    marginTop: spacing.base,
    borderRadius: radius.sm,
    backgroundColor: palette.primary,
  },
  submitButtonContent: {
    paddingVertical: spacing.sm,
  },
  submitButtonLabel: {
    color: palette.textOnPrimary,
    fontWeight: '600',
    fontSize: 16,
  },

  // Error card
  errorCard: {
    marginTop: spacing.md,
    backgroundColor: palette.errorLight,
    borderRadius: radius.md,
  },
  errorCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  errorIcon: {
    margin: 0,
    marginRight: spacing.sm,
  },
  errorText: {
    flex: 1,
    color: palette.error,
  },

  // Success result
  resultContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  successIconWrapper: {
    marginBottom: spacing.xs,
  },
  successIcon: {
    margin: 0,
  },
  successHeading: {
    color: palette.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },

  // Patient detail card
  card: {
    width: '100%',
    backgroundColor: palette.surfaceVariant,
    borderRadius: radius.md,
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(15, 23, 42, 0.08)' },
      default: shadows.md,
    }),
  },
  cardBody: {
    paddingVertical: spacing.xs,
  },
  cardDivider: {
    backgroundColor: palette.divider,
    height: 1,
    marginHorizontal: spacing.base,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  detailLabel: {
    color: palette.textSecondary,
    minWidth: 88,
  },
  detailValue: {
    color: palette.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  codeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  // Status chip — same as TodaysBookingsScreen
  chip: {
    borderRadius: radius.sm,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },

  // Reset button
  resetButton: {
    marginTop: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: palette.primary,
    alignSelf: 'stretch',
  },
  resetButtonContent: {
    paddingVertical: spacing.sm,
  },
  resetButtonLabel: {
    color: palette.textOnPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CheckInScreen;
