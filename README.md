# Clinic Front-Desk OS

WhatsApp-first booking and queue management for small Indian clinics. Patients interact via WhatsApp; the front desk uses this React Native (Expo) app.

## What's implemented (MVP v1)

### Clinic app (React Native)
| PRD | Feature | Status |
|-----|---------|--------|
| FR-13 | Firebase Auth login | ✅ Demo mode + Firebase-ready |
| FR-14 | Today's Bookings | ✅ Live shared state |
| FR-15 | Check-in by booking code | ✅ Updates queue |
| FR-16 | Live queue + Call Next | ✅ Real-time sync across tabs |
| FR-17 | Weekly summary screen | ✅ |
| FR-18 | Clinic settings | ✅ Hours, slot duration |

### Backend (Cloud Functions)
| PRD | Feature | Status |
|-----|---------|--------|
| FR-1–3 | WhatsApp booking bot | ✅ `whatsappWebhook` |
| FR-4–5 | Appointment reminders | ✅ `sendReminders` |
| FR-9–10 | Waitlist auto-fill | ✅ On cancellation |
| FR-11 | Daily doctor brief | ✅ `dailyBrief` |
| FR-12 | Weekly WhatsApp summary | ✅ `weeklySummary` |
| FR-20 | Queue status via WhatsApp | ✅ STATUS keyword |
| FR-21 | Approaching-turn notifications | ✅ `notifyApproachingTurn` |
| FR-19 | English-only WhatsApp messages | ✅ |

## Quick start (local demo — no Firebase)

```bash
npm install
npm start
```

Sign in with **demo@clinic.local** / **demo1234**.

Try the full flow:
1. **Bookings** — browse today's appointments
2. **Check In** — enter code `VS11` or `MG11` (Booked/Confirmed patients)
3. **Queue** — see checked-in patients, tap **Call Next**
4. **Report** — weekly stats
5. **Settings** — clinic hours, slot duration

## Production setup (Firebase + WhatsApp)

1. Create a Firebase project and enable **Authentication** (Email/Password) and **Firestore**.
2. Copy `.env.example` → `.env` and fill in Firebase config:
   ```
   EXPO_PUBLIC_USE_FIREBASE=true
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   ```
3. Deploy Cloud Functions:
   ```bash
   cd functions && npm install
   firebase deploy --only functions,firestore
   ```
4. Set function secrets:
   - `WHATSAPP_ACCESS_TOKEN` — Meta WhatsApp Cloud API token
   - `WHATSAPP_VERIFY_TOKEN` — webhook verification string
5. Point Meta webhook to: `https://<region>-<project>.cloudfunctions.net/whatsappWebhook`
6. Seed a `clinics/{clinicId}` document with `whatsappPhoneNumberId`, `doctorWhatsApp`, `workingHours`, etc.

## Project structure

```
├── App.tsx                   # Auth gate + 5-tab navigation
├── index.ts
├── tsconfig.json
├── src/
│   ├── types/                # Shared interfaces (Appointment, Clinic, etc.)
│   ├── config/               # Firebase + env
│   ├── context/              # Auth + shared app data
│   ├── store/                # Reducer for local/Firestore state
│   ├── screens/              # All PRD clinic screens (.tsx)
│   ├── theme/                # Design system (PRD §6.8)
│   └── utils/
├── functions/                # Cloud Functions (WhatsApp + schedulers)
├── firestore.rules
└── DESIGN_SYSTEM.md
```

## Stack

- **App:** Expo 52, React Native, React Native Paper, **TypeScript**
- **Backend:** Firebase Auth, Firestore, Cloud Functions
- **Patient channel:** Meta WhatsApp Cloud API (direct)

### TypeScript

The clinic app is fully typed. Run the type checker:

```bash
npm run typecheck
```

## Related docs

- `DESIGN_SYSTEM.md` — UI tokens and component guidelines
- PRD §6.8 — blue/white medical palette, Practo-style visual language
