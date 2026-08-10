import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  type ViewStyle,
} from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';
import { landing, landingFonts } from '../theme/landingTheme';
import LandingButton from '../components/landing/LandingButton';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface SetPasswordScreenProps {
  oobCode: string;
  onSuccess: () => void;
  onBackToLogin: () => void;
}

function mapResetError(code: string): string {
  switch (code) {
    case 'auth/expired-action-code':
      return 'This link has expired. Request a new password reset from the login page.';
    case 'auth/invalid-action-code':
      return 'This link is invalid or already used. Request a new password reset from the login page.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    default:
      return 'Could not set your password. Please try again or request a new link.';
  }
}

const SetPasswordScreen: React.FC<SetPasswordScreenProps> = ({
  oobCode,
  onSuccess,
  onBackToLogin,
}) => {
  const { isMobileLayout } = useBreakpoint();
  const [email, setEmail] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verifyCode() {
      if (!isFirebaseConfigured() || !auth) {
        if (!cancelled) {
          setVerifyError('Firebase is not configured. Contact support.');
          setVerifying(false);
        }
        return;
      }

      try {
        const accountEmail = await verifyPasswordResetCode(auth, oobCode);
        if (!cancelled) {
          setEmail(accountEmail);
          setVerifyError(null);
        }
      } catch (err) {
        const code = err && typeof err === 'object' && 'code' in err
          ? String((err as { code: string }).code)
          : '';
        if (!cancelled) {
          setVerifyError(mapResetError(code));
        }
      } finally {
        if (!cancelled) {
          setVerifying(false);
        }
      }
    }

    verifyCode();

    return () => {
      cancelled = true;
    };
  }, [oobCode]);

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);

    if (password.length < 6) {
      setSubmitError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match.');
      return;
    }

    if (!isFirebaseConfigured() || !auth) {
      setSubmitError('Firebase is not configured. Contact support.');
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      onSuccess();
    } catch (err) {
      const code = err && typeof err === 'object' && 'code' in err
        ? String((err as { code: string }).code)
        : '';
      setSubmitError(mapResetError(code));
    } finally {
      setSubmitting(false);
    }
  }, [confirmPassword, oobCode, onSuccess, password]);

  const canSubmit = Boolean(
    email &&
    password.length >= 6 &&
    confirmPassword.length >= 6 &&
    !submitting,
  );

  return (
    <View style={styles.root}>
      <View style={[styles.card, isMobileLayout && styles.cardMobile]}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="lock-reset" size={34} color={landing.green} />
        </View>

        <Text style={[styles.title, isMobileLayout && styles.titleMobile]}>Set your password</Text>

        {verifying ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color={landing.green} />
            <Text style={styles.loadingText}>Verifying your secure link…</Text>
          </View>
        ) : verifyError ? (
          <>
            <Text style={styles.errorText}>{verifyError}</Text>
            <LandingButton
              label="Go to login"
              onPress={onBackToLogin}
              fullWidth
              style={styles.primaryBtn}
            />
          </>
        ) : (
          <>
            <Text style={styles.sub}>
              Create a password for{' '}
              <Text style={styles.emailInline}>{email}</Text>
              {' '}to access your Clinic Desk dashboard.
            </Text>

            <TextInput
              mode="outlined"
              label="New password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              style={styles.input}
              outlineColor={landing.border}
              activeOutlineColor={landing.green}
              textColor={landing.text}
              theme={{
                colors: {
                  onSurfaceVariant: landing.textMuted,
                  surfaceVariant: 'transparent',
                },
              }}
              left={<TextInput.Icon icon="lock-outline" color={landing.textMuted} />}
            />

            <TextInput
              mode="outlined"
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
              style={styles.input}
              outlineColor={landing.border}
              activeOutlineColor={landing.green}
              textColor={landing.text}
              theme={{
                colors: {
                  onSurfaceVariant: landing.textMuted,
                  surfaceVariant: 'transparent',
                },
              }}
              left={<TextInput.Icon icon="lock-check-outline" color={landing.textMuted} />}
            />

            {submitError ? (
              <HelperText type="error" visible style={styles.helperError}>
                {submitError}
              </HelperText>
            ) : null}

            <LandingButton
              label={submitting ? 'Saving…' : 'Save password'}
              onPress={handleSubmit}
              fullWidth
              disabled={!canSubmit}
              style={styles.primaryBtn}
            />

            <LandingButton
              label="Back to login"
              onPress={onBackToLogin}
              variant="outline"
              fullWidth
              style={styles.secondaryBtn}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: landing.green,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: Platform.OS === 'web' ? ('100vh' as unknown as number) : undefined,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: landing.cream,
    borderRadius: 16,
    padding: 40,
    alignItems: 'stretch',
    ...Platform.select({
      web: { boxShadow: '0 32px 80px rgba(0,0,0,0.25)' } as ViewStyle,
      default: {},
    }),
  },
  cardMobile: {
    padding: 28,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: landing.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    color: landing.text,
    textAlign: 'center',
    marginBottom: 12,
    ...Platform.select({
      web: { fontFamily: landingFonts.serif } as ViewStyle,
      default: {},
    }),
  },
  titleMobile: {
    fontSize: 26,
    lineHeight: 34,
  },
  sub: {
    fontSize: 15,
    lineHeight: 24,
    color: landing.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  emailInline: {
    color: landing.text,
    fontWeight: '700',
  },
  input: {
    marginBottom: 14,
    backgroundColor: landing.white,
  },
  helperError: {
    marginBottom: 8,
  },
  loadingBlock: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: landing.textMuted,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#9B2C2C',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryBtn: {
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: landing.green,
  },
  secondaryBtn: {},
});

export default SetPasswordScreen;
