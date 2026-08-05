import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, isFirebaseConfigured } from '../config/firebase';
import env from '../config/env';
import type { AuthContextValue, AuthUser, DemoUser, LoginResult } from '../types';

const DEMO_USER_KEY = '@clinic_desk_demo_user';
const DEMO_CREDENTIALS = { email: 'demo@clinic.local', password: 'demo1234' };

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(env.defaultClinicId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setClinicId(firebaseUser?.uid ? env.defaultClinicId : null);
        setLoading(false);
      });
      return unsubscribe;
    }

    AsyncStorage.getItem(DEMO_USER_KEY).then((stored) => {
      if (stored) {
        setUser(JSON.parse(stored) as DemoUser);
        setClinicId(env.defaultClinicId);
      }
      setLoading(false);
    });

    return undefined;
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    setError(null);

    if (isFirebaseConfigured() && auth) {
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        // Refresh token so custom claims (clinicId) are picked up after admin setup
        await credential.user.getIdToken(true);
        setUser(credential.user);
        setClinicId(env.defaultClinicId);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        return { success: false, error: message };
      }
    }

    const isDemoLogin =
      email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password;

    if (!isDemoLogin) {
      const message = 'Invalid credentials. Use demo@clinic.local / demo1234 in local mode.';
      setError(message);
      return { success: false, error: message };
    }

    const demoUser: DemoUser = {
      email: DEMO_CREDENTIALS.email,
      displayName: 'Front Desk',
      uid: 'demo-user',
    };
    await AsyncStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    setClinicId(env.defaultClinicId);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured() && auth) {
      await signOut(auth);
    } else {
      await AsyncStorage.removeItem(DEMO_USER_KEY);
    }
    setUser(null);
    setClinicId(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      clinicId,
      loading,
      error,
      login,
      logout,
      isAuthenticated: Boolean(user),
      isDemoMode: !isFirebaseConfigured(),
    }),
    [user, clinicId, loading, error, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

export default AuthContext;
