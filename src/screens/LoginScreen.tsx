import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  HelperText,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { palette, spacing, radius, shadows } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useBreakpoint } from '../hooks/useBreakpoint';

const LoginScreen: React.FC<{ onBackToLanding?: () => void }> = ({ onBackToLanding }) => {
  const { login, error, isDemoMode } = useAuth();
  const { isDesktopWeb } = useBreakpoint();
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

  const formCard = (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text variant="titleLarge" style={styles.cardTitle}>
          Sign in
        </Text>
        <Text variant="bodyMedium" style={styles.cardSubtitle}>
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
          textColor={palette.textPrimary}
          theme={{
            colors: {
              onSurfaceVariant: palette.textSecondary,
              surfaceVariant: 'transparent',
            },
          }}
          left={<TextInput.Icon icon="email-outline" color={palette.textSecondary} />}
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
          textColor={palette.textPrimary}
          theme={{
            colors: {
              onSurfaceVariant: palette.textSecondary,
              surfaceVariant: 'transparent',
            },
          }}
          left={<TextInput.Icon icon="lock-outline" color={palette.textSecondary} />}
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
    </View>
  );

  if (isDesktopWeb) {
    return (
      <View style={styles.desktopRoot}>
        {onBackToLanding && (
          <TouchableOpacity onPress={onBackToLanding} style={styles.backLink}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={palette.textOnPrimary} />
            <Text style={styles.backLinkText}>Back to website</Text>
          </TouchableOpacity>
        )}
        <View style={styles.centeredContainer}>
          <View style={styles.logoMarkLarge}>
            <MaterialCommunityIcons name="hospital-building" size={36} color={palette.primaryDark} />
          </View>
          <Text style={styles.heroTitle}>Clinic Front-Desk</Text>
          <Text style={styles.heroSubtitle}>
            Manage bookings, check-ins, and live queues seamlessly.
          </Text>

          <View style={styles.desktopFormInner}>
            {formCard}
            {isDemoMode && (
              <View style={styles.demoBadge}>
                <MaterialCommunityIcons name="information-outline" size={14} color={palette.primary} />
                <Text variant="bodySmall" style={styles.demoHint}>
                  Demo: demo@clinic.local / demo1234
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

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
          <View style={styles.logoMarkMobile}>
            <MaterialCommunityIcons
              name="hospital-building"
              size={28}
              color={palette.primary}
            />
          </View>
          <Text variant="headlineSmall" style={styles.title}>
            Clinic Front-Desk
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Manage bookings, check-ins, and your live queue from one place.
          </Text>
        </View>

        {formCard}

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
  // ── Mobile ───────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },

  // ── Desktop ──────────────────────────────────
  desktopRoot: {
    flex: 1,
    minHeight: '100vh' as unknown as number,
    backgroundColor: palette.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  centeredContainer: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
  },
  backLink: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backLinkText: {
    color: 'rgba(245, 239, 230, 0.85)',
    fontSize: 14,
    fontWeight: '500',
  },
  logoMarkLarge: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    color: palette.textOnPrimary,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: 'rgba(245, 239, 230, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  desktopFormInner: {
    width: '100%',
  },

  // ── Clean Light Card ─────────────────────────
  card: {
    backgroundColor: palette.background,
    borderRadius: radius.lg,
    padding: spacing.xl,
    ...Platform.select({
      web: {
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
      } as unknown as ViewStyle,
      default: shadows.md,
    }),
  },
  cardBody: {
    padding: spacing.xl,
  },
  cardTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    color: palette.textSecondary,
    marginTop: spacing.xxs,
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: palette.surface, // Pure white inputs inside the beige form card
  },
  error: {
    marginBottom: spacing.xs,
  },
  button: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: palette.primary,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
    color: palette.textOnPrimary,
  },

  // ── Mobile brand ─────────────────────────────
  brandBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoMarkMobile: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: palette.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: palette.textPrimary,
    fontWeight: '800',
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

  // ── Demo badge ───────────────────────────────
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.primaryContainer,
    borderRadius: radius.full,
    alignSelf: 'center',
  },
  demoHint: {
    color: palette.primaryDark,
    fontWeight: '600',
  },
});

export default LoginScreen;
