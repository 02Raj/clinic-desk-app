# Fix clinic signup on Vercel (one-time)

Error: `Domain not allowlisted by project`

## Step 1 — Firebase Console (1 minute, required)

1. Open: https://console.firebase.google.com/project/clinic-desk-os/authentication/settings
2. Tab **Authorized domains**
3. Click **Add domain**
4. Enter: `clinic-desk-app.vercel.app`
5. Save

## Step 2 — Custom password page (1 minute, required)

Without this, email links open Firebase’s default reset page instead of Clinic Desk.

1. Open: https://console.firebase.google.com/project/clinic-desk-os/authentication/emails
2. Open **Password reset** → pencil icon
3. Click **Customize action URL**
4. Set: `https://clinic-desk-app.vercel.app/`
5. Save

New signup emails will open the branded **Set your password** screen on your Vercel app.

## Step 3 — Redeploy function (Windows)

Double-click or run:

```
scripts\deploy-clinic-signup.bat
```

Or manually:

```bash
cd functions
firebase login
firebase deploy --only functions:clinicSignup --project clinic-desk-os
```

## Step 4 — Deploy frontend to Vercel

Push changes and let Vercel redeploy so the new Set Password screen is live.

## Step 5 — Test

1. Open https://clinic-desk-app.vercel.app/
2. Submit clinic onboarding form
3. Network tab: `clinicSignup` should return **200** and `"emailChannel": "resend"`
4. Open the email link → Clinic Desk **Set your password** UI (not firebaseapp.com)
5. Set password → redirect to login → sign in

## Code changes already made

- `functions/clinicSignup.js` — correct default URL + uses request Origin
- `src/screens/SetPasswordScreen.tsx` — branded password setup UI
- `src/utils/authActionParams.ts` — reads `oobCode` from email link
- `App.tsx` — routes password-reset links to Set Password screen
- Clearer error if domain still missing from Firebase allowlist
