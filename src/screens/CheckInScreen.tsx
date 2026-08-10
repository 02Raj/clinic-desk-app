import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableOpacity,
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
import { formatTime, formatDateShort, isSameDay } from '../utils/dateUtils';
import type { Appointment, CheckInResult } from '../types';
import ScreenHeader from '../components/ui/ScreenHeader';
import ElevatedCard from '../components/ui/ElevatedCard';
import StatusPill from '../components/ui/StatusPill';
import PatientAvatar from '../components/ui/PatientAvatar';
import { screenStyles } from '../components/ui/screenStyles';
import { useBreakpoint } from '../hooks/useBreakpoint';
import WebPage from '../components/layout/WebPage';
import WebDashboardLayout from '../components/web/WebDashboardLayout';
import WebPanel from '../components/web/WebPanel';

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
  const { checkInByCode, appointments, queue } = useAppData();
  const { isDesktopWeb } = useBreakpoint();
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

  const todaysBookings = appointments
    .filter((a) => isSameDay(a.scheduledTime, new Date()) && ['BOOKED', 'CONFIRMED'].includes(a.status))
    .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());

  const inputForm = (
    <View style={isDesktopWeb ? styles.webFormInner : undefined}>
      {!isDesktopWeb ? (
        <ElevatedCard>
          <View style={styles.inputCardBody}>
            <View style={styles.inputIconWrap}>
              <MaterialCommunityIcons name="barcode-scan" size={28} color={palette.primary} />
            </View>
            {renderFormFields()}
          </View>
        </ElevatedCard>
      ) : (
        <View style={styles.webInputCardBody}>
          {renderFormFields()}
        </View>
      )}
    </View>
  );

  function renderFormFields() {
    return (
      <>
        {!isDesktopWeb && (
          <>
            <Text variant="titleMedium" style={styles.inputTitle}>Scan or enter code</Text>
            <Text variant="bodySmall" style={styles.instructionText}>
              Patient's 4-character booking code from WhatsApp confirmation
            </Text>
          </>
        )}
        {isDesktopWeb && (
          <>
            <Text variant="titleMedium" style={styles.inputTitle}>Enter booking code</Text>
            <Text variant="bodySmall" style={[styles.instructionText, styles.webInstructionText]}>
              Patient's 4-character booking code from WhatsApp confirmation
            </Text>
          </>
        )}

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
          style={[styles.textInput, isDesktopWeb && styles.webTextInput]}
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
          style={[styles.submitButton, isDesktopWeb && styles.webSubmitButton]}
          contentStyle={styles.submitButtonContent}
          labelStyle={styles.submitButtonLabel}
          icon="account-check"
        >
          Check in patient
        </Button>
      </>
    );
  }

  if (isDesktopWeb) {
    return (
      <View style={screenStyles.screen}>
        <WebPage fill>
          {showInput ? (
            <WebDashboardLayout
              asideWidth={340}
              main={
                <View style={styles.webMainGrid}>
                  <WebPanel title="How it works" subtitle="Front-desk check-in flow" style={styles.webGuidePanel}>
                    <View style={styles.webGuideBody}>
                      <Text variant="bodyMedium" style={styles.webAsideText}>
                        Enter the code from the patient's WhatsApp confirmation. They can also text HERE to the clinic number.
                      </Text>
                      <View style={styles.webTipList}>
                        {[
                          ['numeric-1-circle-outline', 'Ask for the 4-character booking code'],
                          ['numeric-2-circle-outline', 'Type the code and press Check in'],
                          ['numeric-3-circle-outline', 'Patient is added to the live queue'],
                        ].map(([icon, text]) => (
                          <View key={text} style={styles.webTipRow}>
                            <MaterialCommunityIcons
                              name={icon as 'numeric-1-circle-outline'}
                              size={22}
                              color={palette.primary}
                            />
                            <Text variant="bodyMedium" style={styles.webTipText}>{text}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.webHintBox}>
                        <MaterialCommunityIcons name="whatsapp" size={18} color={palette.success} />
                        <Text variant="bodySmall" style={styles.webHintText}>
                          Codes are sent automatically after WhatsApp booking.
                        </Text>
                      </View>
                    </View>
                  </WebPanel>

                  <WebPanel title="Check in" subtitle="Verify patient code" style={styles.webFormPanel}>
                    <View style={styles.webFormCenter}>
                      <View style={styles.webFormIconWrap}>
                        <MaterialCommunityIcons name="barcode-scan" size={32} color={palette.primary} />
                      </View>
                      {inputForm}
                    </View>
                  </WebPanel>
                </View>
              }
              aside={
                <View style={styles.webAsideStack}>
                  <WebPanel
                    title="Today's bookings"
                    subtitle={`${todaysBookings.length} awaiting check-in`}
                    style={styles.webAsidePanelFlex}
                  >
                    <View style={styles.bookingListBody}>
                      {todaysBookings.length === 0 ? (
                        <Text variant="bodySmall" style={styles.sideEmptyText}>
                          No bookings waiting for check-in today.
                        </Text>
                      ) : (
                        todaysBookings.map((apt) => (
                          <TouchableOpacity
                            key={apt.id}
                            style={styles.bookingListRow}
                            onPress={() => {
                              setCode(apt.bookingCode);
                              setResult(null);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text variant="titleSmall" style={styles.bookingListCode}>{apt.bookingCode}</Text>
                            <View style={styles.bookingListInfo}>
                              <Text variant="bodyMedium" style={styles.bookingListName} numberOfLines={1}>
                                {apt.patientName}
                              </Text>
                              <Text variant="bodySmall" style={styles.bookingListTime}>
                                {formatTime(apt.scheduledTime)}
                              </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={18} color={palette.textDisabled} />
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  </WebPanel>

                  <WebPanel title="Queue status" subtitle="Live overview">
                    <View style={styles.queueStatusBody}>
                      <View style={styles.queueStatItem}>
                        <Text variant="headlineSmall" style={styles.queueStatValue}>
                          {queue.waitingList.length}
                        </Text>
                        <Text variant="bodySmall" style={styles.queueStatLabel}>Waiting</Text>
                      </View>
                      <View style={styles.queueStatItem}>
                        <Text variant="headlineSmall" style={styles.queueStatValue}>
                          {queue.currentPatient ? 1 : 0}
                        </Text>
                        <Text variant="bodySmall" style={styles.queueStatLabel}>With doctor</Text>
                      </View>
                    </View>
                  </WebPanel>
                </View>
              }
            />
          ) : (
            result?.appointment && (
              <View style={styles.webSuccessWrap}>
                <SuccessCard appointment={result.appointment} onReset={handleReset} />
              </View>
            )
          )}
        </WebPage>
      </View>
    );
  }

  return (
    <View style={screenStyles.screen}>
      <ScreenHeader title="Check In" subtitle="Enter booking code" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {showInput ? (
          <View style={styles.inputContainer}>
            {inputForm}
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
  webLayout: {
    flexDirection: 'row',
    gap: spacing.xl,
    alignItems: 'flex-start',
  },
  webMainGrid: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 0,
  },
  webGuidePanel: {
    width: 300,
    flexShrink: 0,
  },
  webFormPanel: {
    flex: 1,
    minWidth: 0,
  },
  webGuideBody: {
    padding: spacing.lg,
    gap: spacing.lg,
    flex: 1,
  },
  webHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: palette.successLight,
    borderRadius: radius.sm,
    marginTop: 'auto' as unknown as number,
  },
  webHintText: {
    flex: 1,
    color: palette.success,
    fontWeight: '500',
    lineHeight: 18,
  },
  webFormCenter: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  webFormInner: {
    width: '100%',
  },
  webFormIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: palette.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  webAsideStack: {
    flex: 1,
    gap: spacing.md,
    minHeight: 0,
  },
  webAsidePanelFlex: {
    flex: 1,
    minHeight: 0,
  },
  bookingListBody: {
    flex: 1,
    padding: spacing.sm,
  },
  bookingListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  bookingListCode: {
    color: palette.primary,
    fontWeight: '700',
    letterSpacing: 1,
    width: 56,
  },
  bookingListInfo: {
    flex: 1,
    minWidth: 0,
  },
  bookingListName: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  bookingListTime: {
    color: palette.textSecondary,
    marginTop: 2,
  },
  sideEmptyText: {
    color: palette.textSecondary,
    padding: spacing.lg,
    lineHeight: 20,
  },
  queueStatusBody: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  queueStatItem: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: palette.surfaceVariant,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  queueStatValue: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  queueStatLabel: {
    color: palette.textSecondary,
    marginTop: spacing.xxs,
  },
  webAside: {
    flex: 1,
    maxWidth: 420,
    paddingTop: spacing.md,
  },
  webAsideTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  webAsideText: {
    color: palette.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  webTipList: {
    gap: spacing.md,
  },
  webTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  webTipText: {
    color: palette.textSecondary,
    flex: 1,
  },
  webFormColumn: {
    width: 420,
    maxWidth: '100%',
  },
  webFormCard: {
    width: '100%',
  },
  webInputCardBody: {
    alignItems: 'stretch',
    padding: spacing.xl,
  },
  webInstructionText: {
    textAlign: 'left',
  },
  webTextInput: {
    fontSize: 20,
    letterSpacing: 3,
    textAlign: 'left',
  },
  webSubmitButton: {
    width: '100%',
    marginTop: spacing.md,
  },
  webSuccessWrap: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
});

export default CheckInScreen;
