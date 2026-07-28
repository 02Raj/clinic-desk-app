/**
 * Runtime configuration from Expo public env vars.
 * Local/demo mode works without Firebase when EXPO_PUBLIC_USE_FIREBASE=false.
 */

export interface FirebaseEnvConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface EnvConfig {
  useFirebase: boolean;
  defaultClinicId: string;
  firebase: FirebaseEnvConfig;
}

const env: EnvConfig = {
  useFirebase: process.env.EXPO_PUBLIC_USE_FIREBASE === 'true',
  defaultClinicId: process.env.EXPO_PUBLIC_DEFAULT_CLINIC_ID || 'clinic-01',
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  },
};

export const isFirebaseConfigured = (): boolean =>
  env.useFirebase &&
  Boolean(env.firebase.apiKey && env.firebase.projectId && env.firebase.appId);

export default env;
