import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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

const SettingsScreen: React.FC = () => {
  const { clinic, doctors, updateClinicSettings } = useAppData();
  const { logout } = useAuth();

  const [name, setName] = useState(clinic.name);
  const [startTime, setStartTime] = useState(clinic.workingHours.start);
  const [endTime, setEndTime] = useState(clinic.workingHours.end);
  const [slotDuration, setSlotDuration] = useState(String(clinic.slotDurationMinutes));
  const [avgConsultation, setAvgConsultation] = useState(String(clinic.avgConsultationMinutes));
  const [snackbar, setSnackbar] = useState(false);
  const [saving, setSaving] = useState(false);

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

  return (
    <View style={screenStyles.screen}>
      <ScreenHeader
        title="Settings"
        subtitle="Clinic configuration"
        right={<Appbar.Action icon="logout" onPress={logout} />}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
      </ScrollView>

      <Snackbar visible={snackbar} onDismiss={() => setSnackbar(false)} duration={2500}>
        Settings saved
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  cardBody: {
    padding: spacing.base,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: palette.surface,
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
    padding: spacing.base,
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
  divider: {
    backgroundColor: palette.divider,
    height: 1,
    marginHorizontal: spacing.base,
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
});

export default SettingsScreen;
