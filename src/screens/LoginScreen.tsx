import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  HelperText,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { palette, spacing, radius } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import ElevatedCard from '../components/ui/ElevatedCard';

const LoginScreen: React.FC = () => {
  const { login, error, isDemoMode } = useAuth();
  const [email, setEmail] = useState(isDemoMode ? 'demo@clinic.local' : '');
  const [password, setPassword] = useState(isDemoMode ? 'demo1234' : '');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = useCallback(async () => {
    setSubmitting(true);
    setLocalError(null);
    const result = await login(email.trim(), password);
    if (!result.success) {
      setLocalError(result.error ?? 'Login failed');
    }
    setSubmitting(false);
  }, [email, password, login]);

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandBlock}>
          <View style={styles.logoMark}>
            <MaterialCommunityIcons
              name="hospital-building"
              size={28}
              color={palette.textOnPrimary}
            />
          </View>
          <Text variant="headlineLarge" style={styles.title}>
            Clinic Front-Desk
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Manage bookings, check-ins, and your live queue from one place.
          </Text>
        </View>

        <ElevatedCard>
          <View style={styles.cardBody}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Sign in
            </Text>
            <Text variant="bodySmall" style={styles.cardSubtitle}>
              Front desk and clinic owner access
            </Text>

            <TextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              style={styles.input}
              outlineColor={palette.border}
              activeOutlineColor={palette.primary}
              left={<TextInput.Icon icon="email-outline" />}
            />

            <TextInput
              mode="outlined"
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              style={styles.input}
              outlineColor={palette.border}
              activeOutlineColor={palette.primary}
              left={<TextInput.Icon icon="lock-outline" />}
            />

            {displayError ? (
              <HelperText type="error" visible style={styles.error}>
                {displayError}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={submitting}
              disabled={submitting || !email || !password}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Sign in
            </Button>
          </View>
        </ElevatedCard>

        {isDemoMode && (
          <View style={styles.demoBadge}>
            <MaterialCommunityIcons name="information-outline" size={14} color={palette.primary} />
            <Text variant="bodySmall" style={styles.demoHint}>
              Demo: demo@clinic.local / demo1234
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.neutralLight,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  title: {
    color: palette.textPrimary,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: palette.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  cardBody: {
    padding: spacing.lg,
  },
  cardTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: palette.textSecondary,
    marginTop: spacing.xxs,
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: palette.surface,
  },
  error: {
    marginBottom: spacing.xs,
  },
  button: {
    marginTop: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: palette.primary,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.primaryContainer,
    borderRadius: radius.full,
    alignSelf: 'center',
  },
  demoHint: {
    color: palette.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
