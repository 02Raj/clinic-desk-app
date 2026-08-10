export interface ClinicSignupPayload {
  clinicName: string;
  clinicType: string;
  doctorCount: string;
  city: string;
  state: string;
  footfall: string;
  yourName: string;
  yourRole: string;
  whatsapp: string;
  email: string;
  bookingMethod: string;
  painPoints: string[];
  goLive: string;
  hearAbout: string;
  notes: string;
}

export interface ClinicSignupResult {
  success: boolean;
  clinicId?: string;
  email?: string;
  message?: string;
  error?: string;
}

function getSignupUrl(): string {
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'clinic-desk-os';
  const custom = process.env.EXPO_PUBLIC_CLINIC_SIGNUP_URL;
  if (custom) return custom;
  return `https://us-central1-${projectId}.cloudfunctions.net/clinicSignup`;
}

export async function submitClinicSignup(
  payload: ClinicSignupPayload,
): Promise<ClinicSignupResult> {
  const url = getSignupUrl();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as ClinicSignupResult;

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Signup failed (${response.status})`,
      };
    }

    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: message };
  }
}
