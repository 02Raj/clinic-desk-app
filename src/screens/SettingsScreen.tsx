import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Platform, type ViewStyle } from 'react-native';
import {
  Appbar,
  Text,
  TextInput,
  Button,
  Divider,
  Snackbar,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { palette, spacing, radius } from '../theme/theme';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ui/ScreenHeader';
import ElevatedCard from '../components/ui/ElevatedCard';
import PatientAvatar from '../components/ui/PatientAvatar';
import SectionLabel from '../components/ui/SectionLabel';
import { screenStyles } from '../components/ui/screenStyles';
import { useBreakpoint } from '../hooks/useBreakpoint';
import WebPage from '../components/layout/WebPage';
import WebPanel from '../components/web/WebPanel';

const SettingsScreen: React.FC = () => {
  const { clinic, doctors, updateClinicSettings } = useAppData();
  const { logout, clinicId } = useAuth();
  const { isDesktopWeb } = useBreakpoint();

  const [name, setName] = useState(clinic.name);
  const [startTime, setStartTime] = useState(clinic.workingHours.start);
  const [endTime, setEndTime] = useState(clinic.workingHours.end);
  const [slotDuration, setSlotDuration] = useState(String(clinic.slotDurationMinutes));
  const [avgConsultation, setAvgConsultation] = useState(String(clinic.avgConsultationMinutes));
  const [snackbar, setSnackbar] = useState(false);
  const [saving, setSaving] = useState(false);

  const slotsPerDay = useMemo(() => {
    const [openH, openM] = startTime.split(':').map(Number);
    const [closeH, closeM] = endTime.split(':').map(Number);
    const openMins = openH * 60 + openM;
    const closeMins = closeH * 60 + closeM;
    const slot = parseInt(slotDuration, 10) || 30;
    if (closeMins <= openMins || slot <= 0) return 0;
    return Math.floor((closeMins - openMins) / slot);
  }, [startTime, endTime, slotDuration]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    await updateClinicSettings({
      name: name.trim(),
      workingHours: {
        ...clinic.workingHours,
        start: startTime.trim(),
        end: endTime.trim(),
      },
      slotDurationMinutes: parseInt(slotDuration, 10) || 30,
      avgConsultationMinutes: parseInt(avgConsultation, 10) || 15,
    });
    setSaving(false);
    setSnackbar(true);
  }, [name, startTime, endTime, slotDuration, avgConsultation, clinic.workingHours, updateClinicSettings]);

  const formContent = (
    <>
      <SectionLabel>Clinic</SectionLabel>
      <ElevatedCard>
        <View style={styles.cardBody}>
          <TextInput
            mode="outlined"
            label="Clinic name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            outlineColor={palette.border}
            activeOutlineColor={palette.primary}
            left={<TextInput.Icon icon="hospital-building" />}
          />
          <View style={styles.rowInputs}>
            <TextInput
              mode="outlined"
              label="Opens"
              value={startTime}
              onChangeText={setStartTime}
              style={[styles.input, styles.halfInput]}
              outlineColor={palette.border}
              activeOutlineColor={palette.primary}
            />
            <TextInput
              mode="outlined"
              label="Closes"
              value={endTime}
              onChangeText={setEndTime}
              style={[styles.input, styles.halfInput]}
              outlineColor={palette.border}
              activeOutlineColor={palette.primary}
            />
          </View>
        </View>
      </ElevatedCard>

      <SectionLabel>Scheduling</SectionLabel>
      <ElevatedCard>
        <View style={styles.cardBody}>
          <View style={styles.rowInputs}>
            <TextInput
              mode="outlined"
              label="Slot (min)"
              value={slotDuration}
              onChangeText={setSlotDuration}
              keyboardType="number-pad"
              style={[styles.input, styles.halfInput]}
              outlineColor={palette.border}
              activeOutlineColor={palette.primary}
            />
            <TextInput
              mode="outlined"
              label="Avg consult (min)"
              value={avgConsultation}
              onChangeText={setAvgConsultation}
              keyboardType="number-pad"
              style={[styles.input, styles.halfInput]}
              outlineColor={palette.border}
              activeOutlineColor={palette.primary}
            />
          </View>
          <Text variant="bodySmall" style={styles.hint}>
            Used for WhatsApp queue wait-time estimates
          </Text>
        </View>
      </ElevatedCard>

      <SectionLabel>Doctors</SectionLabel>
      <ElevatedCard>
        {doctors.map((doc, index) => (
          <View key={doc.id}>
            {index > 0 && <Divider style={styles.divider} />}
            <View style={styles.doctorRow}>
              <PatientAvatar name={doc.name} size="md" variant="primary" />
              <View style={styles.doctorInfo}>
                <Text variant="titleMedium" style={styles.doctorName}>{doc.name}</Text>
                <Text variant="bodySmall" style={styles.doctorTitle}>{doc.title}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={palette.textDisabled} />
            </View>
          </View>
        ))}
      </ElevatedCard>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={styles.saveButton}
        contentStyle={styles.saveButtonContent}
        labelStyle={styles.saveButtonLabel}
        icon="content-save-outline"
      >
        Save settings
      </Button>
    </>
  );

  if (isDesktopWeb) {
    return (
      <View style={screenStyles.screen}>
        <WebPage scroll fill={false}>
          <View style={styles.webHero}>
            <View style={styles.webHeroLeft}>
              <View style={styles.webHeroIcon}>
                <MaterialCommunityIcons name="hospital-building" size={28} color={palette.textOnPrimary} />
              </View>
              <View style={styles.webHeroText}>
                <Text variant="headlineSmall" style={styles.webHeroTitle}>{name || clinic.name}</Text>
                <Text variant="bodyMedium" style={styles.webHeroSubtitle}>
                  {startTime} – {endTime} · {slotDuration} min slots · ~{slotsPerDay} slots/day
                </Text>
              </View>
            </View>
            <View style={styles.webHeroActions}>
              <Button
                mode="contained"
                onPress={handleSave}
                loading={saving}
                disabled={saving}
                buttonColor={palette.surface}
                textColor={palette.primary}
                style={styles.webHeroSaveBtn}
                contentStyle={styles.heroButtonContent}
                labelStyle={styles.heroSaveLabel}
                icon="content-save-outline"
              >
                Save settings
              </Button>
              <Button
                mode="outlined"
                icon="logout"
                onPress={logout}
                textColor={palette.textOnPrimary}
                style={styles.webHeroLogoutBtn}
                contentStyle={styles.heroButtonContent}
                labelStyle={styles.heroLogoutLabel}
              >
                Sign out
              </Button>
            </View>
          </View>

          <View style={styles.webGrid}>
            <View style={styles.webMainCol}>
              <WebPanel title="Clinic configuration" subtitle="Name, hours and scheduling" fill={false}>
                <View style={styles.webFormGrid}>
                  <View style={styles.webFormField}>
                    <TextInput
                      mode="outlined"
                      label="Clinic name"
                      value={name}
                      onChangeText={setName}
                      style={styles.input}
                      outlineColor={palette.border}
                      activeOutlineColor={palette.primary}
                      left={<TextInput.Icon icon="hospital-building" />}
                    />
                  </View>
                  <View style={styles.webFormField}>
                    <View style={styles.rowInputs}>
                      <TextInput
                        mode="outlined"
                        label="Opens"
                        value={startTime}
                        onChangeText={setStartTime}
                        style={[styles.input, styles.halfInput]}
                        outlineColor={palette.border}
                        activeOutlineColor={palette.primary}
                        left={<TextInput.Icon icon="clock-outline" />}
                      />
                      <TextInput
                        mode="outlined"
                        label="Closes"
                        value={endTime}
                        onChangeText={setEndTime}
                        style={[styles.input, styles.halfInput]}
                        outlineColor={palette.border}
                        activeOutlineColor={palette.primary}
                      />
                    </View>
                  </View>
                  <View style={styles.webFormField}>
                    <View style={styles.rowInputs}>
                      <TextInput
                        mode="outlined"
                        label="Slot duration (min)"
                        value={slotDuration}
                        onChangeText={setSlotDuration}
                        keyboardType="number-pad"
                        style={[styles.input, styles.halfInput]}
                        outlineColor={palette.border}
                        activeOutlineColor={palette.primary}
                        left={<TextInput.Icon icon="timer-outline" />}
                      />
                      <TextInput
                        mode="outlined"
                        label="Avg consult (min)"
                        value={avgConsultation}
                        onChangeText={setAvgConsultation}
                        keyboardType="number-pad"
                        style={[styles.input, styles.halfInput]}
                        outlineColor={palette.border}
                        activeOutlineColor={palette.primary}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.webFormFooter}>
                  <MaterialCommunityIcons name="information-outline" size={16} color={palette.textSecondary} />
                  <Text variant="bodySmall" style={styles.webFormFooterText}>
                    Slot and consultation times are used for WhatsApp booking and queue wait estimates.
                  </Text>
                </View>
              </WebPanel>

              <View style={styles.previewRow}>
                <ElevatedCard style={styles.previewTile}>
                  <MaterialCommunityIcons name="calendar-clock" size={22} color={palette.primary} />
                  <Text variant="titleSmall" style={styles.previewValue}>{slotsPerDay}</Text>
                  <Text variant="bodySmall" style={styles.previewLabel}>Slots per day</Text>
                </ElevatedCard>
                <ElevatedCard style={styles.previewTile}>
                  <MaterialCommunityIcons name="doctor" size={22} color={palette.success} />
                  <Text variant="titleSmall" style={styles.previewValue}>{doctors.length}</Text>
                  <Text variant="bodySmall" style={styles.previewLabel}>Doctors</Text>
                </ElevatedCard>
                <ElevatedCard style={styles.previewTile}>
                  <MaterialCommunityIcons name="whatsapp" size={22} color={palette.success} />
                  <Text variant="titleSmall" style={styles.previewValue}>Active</Text>
                  <Text variant="bodySmall" style={styles.previewLabel}>WhatsApp bot</Text>
                </ElevatedCard>
              </View>
            </View>

            <View style={styles.webSideCol}>
              <WebPanel title="Doctors" subtitle={`${doctors.length} on staff`} fill={false}>
                {doctors.map((doc, index) => (
                  <View key={doc.id}>
                    {index > 0 && <Divider style={styles.divider} />}
                    <View style={styles.doctorRow}>
                      <PatientAvatar name={doc.name} size="lg" variant="primary" />
                      <View style={styles.doctorInfo}>
                        <Text variant="titleMedium" style={styles.doctorName}>{doc.name}</Text>
                        <Text variant="bodySmall" style={styles.doctorTitle}>{doc.title}</Text>
                        <View style={styles.doctorBadge}>
                          <Text variant="labelSmall" style={styles.doctorBadgeText}>Available for booking</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </WebPanel>

              <WebPanel title="System" subtitle="Clinic workspace" fill={false}>
                <View style={styles.systemBody}>
                  <View style={styles.systemRow}>
                    <Text variant="bodySmall" style={styles.systemLabel}>Clinic ID</Text>
                    <Text variant="titleSmall" style={styles.systemValue}>{clinicId || '—'}</Text>
                  </View>
                  <View style={styles.systemRow}>
                    <Text variant="bodySmall" style={styles.systemLabel}>Working hours</Text>
                    <Text variant="titleSmall" style={styles.systemValue}>{startTime} – {endTime}</Text>
                  </View>
                  <View style={styles.systemRow}>
                    <Text variant="bodySmall" style={styles.systemLabel}>Booking channel</Text>
                    <View style={styles.systemChannel}>
                      <MaterialCommunityIcons name="whatsapp" size={16} color={palette.success} />
                      <Text variant="titleSmall" style={styles.systemValue}>WhatsApp</Text>
                    </View>
                  </View>
                  <View style={styles.systemNote}>
                    <MaterialCommunityIcons name="shield-check-outline" size={18} color={palette.primary} />
                    <Text variant="bodySmall" style={styles.systemNoteText}>
                      Changes apply immediately to the front desk and WhatsApp booking flow.
                    </Text>
                  </View>
                </View>
              </WebPanel>
            </View>
          </View>
        </WebPage>

        <Snackbar
          visible={snackbar}
          onDismiss={() => setSnackbar(false)}
          duration={2500}
          wrapperStyle={styles.snackbarWrapper}
          style={styles.snackbarStyle}
        >
          Settings saved
        </Snackbar>
      </View>
    );
  }

  return (
    <View style={screenStyles.screen}>
      <ScreenHeader
        title="Settings"
        subtitle="Clinic configuration"
        right={<Appbar.Action icon="logout" onPress={logout} />}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {formContent}
      </ScrollView>

      <Snackbar
        visible={snackbar}
        onDismiss={() => setSnackbar(false)}
        duration={2500}
        wrapperStyle={styles.snackbarWrapper}
        style={styles.snackbarStyle}
      >
        Settings saved
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  snackbarWrapper: {
    ...Platform.select({
      web: {
        alignItems: 'center',
      } as ViewStyle,
      default: {},
    }),
  },
  snackbarStyle: {
    ...Platform.select({
      web: {
        minWidth: 300,
        maxWidth: 400,
        borderRadius: radius.md,
      } as ViewStyle,
      default: {},
    }),
  },
  cardBody: {
    padding: spacing.base,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: palette.surfaceVariant, // Opsyfy sand-filled inputs
  },
  rowInputs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  hint: {
    color: palette.textSecondary,
    marginTop: -spacing.xs,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  doctorTitle: {
    color: palette.textSecondary,
    marginTop: spacing.xxs,
  },
  doctorBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    backgroundColor: palette.successLight,
    borderRadius: radius.full,
  },
  doctorBadgeText: {
    color: palette.success,
    fontWeight: '600',
  },
  divider: {
    backgroundColor: palette.divider,
    height: 1,
    marginHorizontal: spacing.lg,
  },
  saveButton: {
    marginTop: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: palette.primary,
  },
  saveButtonContent: {
    paddingVertical: spacing.sm,
  },
  saveButtonLabel: {
    fontWeight: '600',
    fontSize: 15,
  },
  webHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: palette.primary,
    borderRadius: radius.md,
  },
  webHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  },
  webHeroIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  webHeroText: {
    flex: 1,
    minWidth: 0,
  },
  webHeroTitle: {
    color: palette.textOnPrimary,
    fontWeight: '700',
  },
  webHeroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing.xxs,
  },
  webHeroActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexShrink: 0,
  },
  webHeroSaveBtn: {
    borderRadius: radius.sm,
  },
  webHeroLogoutBtn: {
    borderRadius: radius.sm,
    borderColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1.5,
  },
  heroButtonContent: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  heroSaveLabel: {
    fontWeight: '700',
    fontSize: 14,
    color: palette.primary,
  },
  heroLogoutLabel: {
    fontWeight: '600',
    fontSize: 14,
    color: palette.textOnPrimary,
  },
  webGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  webMainCol: {
    flex: 2,
    minWidth: 0,
    gap: spacing.md,
  },
  webSideCol: {
    flex: 1,
    minWidth: 300,
    maxWidth: 380,
    gap: spacing.md,
  },
  webFormGrid: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  webFormField: {
    width: '100%',
  },
  webFormFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: palette.divider,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  webFormFooterText: {
    flex: 1,
    color: palette.textSecondary,
    lineHeight: 18,
  },
  previewRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  previewTile: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  previewValue: {
    color: palette.textPrimary,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  previewLabel: {
    color: palette.textSecondary,
  },
  systemBody: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  systemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  systemLabel: {
    color: palette.textSecondary,
  },
  systemValue: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  systemChannel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  systemNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: palette.primaryContainer,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
  systemNoteText: {
    flex: 1,
    color: palette.primary,
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default SettingsScreen;
