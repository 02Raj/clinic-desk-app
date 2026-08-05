# DoctorFlow — Target Vision & Build Roadmap

**Team:** Team 2 — Pankaj Patel, Divyansh Raj, Ayushman Singh  
**Date:** July 2026  
**Working name in repo:** Clinic Front-Desk OS (`clinic-desk-os`)

> This file is the **north star** for what we are building.  
> Current code is an **MVP slice** of this vision — not the full DoctorFlow yet.

---

## 1. One-Line Goal

**WhatsApp-native booking + live queue + staff dashboards** for small/mid clinics — patients never install an app; reception & doctor get real-time control.

---

## 2. Target Patient Flow (DoctorFlow POC)

### 2.1 Booking journey (full vision)

| Step | Patient (WhatsApp) | Bot |
|------|-------------------|-----|
| 1 | `Hi` | Welcome + clinic name + main menu |
| 2 | Tap **Book Appointment** | — |
| 3 | — | List doctors (name, specialty, availability) |
| 4 | Select doctor | Doctor profile (fee, next slot) |
| 5 | — | Date picker (Today / Tomorrow / Other) |
| 6 | — | Time slots for that date |
| 7 | Select slot | Collect name, age, gender, reason (structured) |
| 8 | — | Review + Confirm / Edit / Cancel |
| 9 | Confirm | Appointment ID, fee, maps, cancel option |
| 10 | — | Auto reminders + queue updates |

**Also on menu:** View appointment · Cancel · Clinic info

### 2.2 After booking (automated)

- **1 hr before** — reminder  
- **15 min before** — token + wait estimate + “proceed to clinic”  
- **Doctor late** — revised time to all affected patients  
- **Doctor unavailable** — reschedule / refund / call options  
- **Missed slot** — no check-in in 10 min → rebook offer  
- **Post-visit (7 days)** — follow-up + feedback  

### 2.3 Patient self-service keywords

| Keyword | Action |
|---------|--------|
| `Status` / `Queue` | Current token, your token, estimated wait |
| `HERE` | Self check-in → token number |
| Reschedule / Cancel | In-chat, no phone call |

### 2.4 Enterprise polish (post-core)

- Returning patient recognition (skip re-entering details)  
- Smart slot recommendations (next available first)  
- Waitlist when day is full  
- Queue proximity alerts (N patients ahead)  

---

## 3. Target Staff Flow

### 3.1 Reception dashboard

- Now serving + upcoming queue  
- Walk-in entry → instant queue  
- Emergency flag → reorder queue + notify patients  
- Cancelled list  
- **Call Next** → patient moves to **In Consultation** (In Progress)

### 3.2 Appointment lifecycle (full)

```
Booked → Confirmed → Checked In → Waiting → In Consultation → Completed
  → Prescription Given → Payment Pending → Closed
```

### 3.3 Doctor app (future)

- Today’s list, current/next patient, revenue stats  
- Complete consult → thank-you + prescription + follow-up prompt  

### 3.4 Admin & reports

- Doctors, slots, leaves, users, payments, broadcast  
- EOD: patients seen, revenue, no-shows, wait times, ailments  

---

## 4. What We Have Today (Aug 2026)

### ✅ Built & working (MVP slice)

| Area | Current behaviour |
|------|-------------------|
| WhatsApp `Hi` | Shows today’s slots (numbered list) |
| Slot reply | Books appointment + **booking code** (e.g. K5HY) |
| WhatsApp `STATUS` | Queue position + wait estimate |
| WhatsApp `HERE` | Self check-in + token *(needs stable deploy)* |
| Reminders | ~1 hr before (1/2 reply confirm/cancel) |
| Waitlist | On cancel, offer slot to waitlist |
| Daily / weekly brief | Scheduled WhatsApp to doctor |
| **Reception app** | Login, Today’s Bookings, Check-in by code, Live Queue, Call Next, Weekly report, Settings |
| **Backend** | Firebase `clinic-desk-os`, Cloud Functions, Firestore |
| **Dashboard live data** | `.env` + Firebase auth + custom claims |

### ⚠️ Known gaps vs DoctorFlow

| DoctorFlow target | Our MVP today |
|-------------------|---------------|
| Welcome + button menu | Plain text slot list |
| Multi-doctor selection | Single doctor (`doc-01`) |
| Date picker | Today only |
| Patient details form | Auto name from phone |
| Confirm screen | Instant book on slot number |
| Interactive buttons (Meta templates) | Text/number replies only |
| Full lifecycle statuses | Booked → Checked In → In Progress → Completed |
| Doctor mobile app | Not started |
| Admin panel | Not started |
| EMR / billing / teleconsult | Post-MVP |
| MongoDB + Angular (POC doc) | **Firebase + React Native** (actual stack) |

### ⚠️ Reliability issues to fix first

1. **Hi reply inconsistent** — old `functions/index.js` in repo uses `WHATSAPP_ACCESS_TOKEN` (not `WHATSAPP_ACCESS_SECRET`); token expiry; session stuck in `selecting_slot`  
2. **HERE not deployed** in current repo copy — must merge Phase 1 webhook fixes + redeploy  
3. **Meta sandbox delay** — test messages can arrive minutes late (production is faster)  

---

## 5. Phased Build Plan (aligned to DoctorFlow)

### Phase 1 — Core loop *(mostly done)*

- [x] WhatsApp book (Hi → slots → code)  
- [x] Firebase + reception dashboard live  
- [x] Check-in (dashboard code + HERE)  
- [x] Live queue + Call Next  
- [ ] Stabilise webhook (secrets, HERE, IST dates, English-only)  

### Phase 2 — DoctorFlow booking UX

- [ ] Welcome message + clinic branding  
- [ ] Structured menu (Book / View / Cancel / Info)  
- [ ] Doctor list (when multi-doctor)  
- [ ] Date selection (today / tomorrow)  
- [ ] Confirmation step before final book  
- [ ] Returning patient skip  

### Phase 3 — Notifications & lifecycle

- [ ] 15-min reminder with token  
- [ ] Doctor-delay broadcast  
- [ ] Missed appointment / no-show flow  
- [ ] Post-visit follow-up  
- [ ] Meta template messages (for outside 24h window)  

### Phase 4 — Staff & admin

- [ ] Walk-in queue entry  
- [ ] Emergency reorder  
- [ ] Doctor mobile view  
- [ ] Admin panel (owners)  
- [ ] EOD analytics dashboard  

### Phase 5 — AI (post-MVP)

- AI symptom triage · priority flags · FAQ · daily AI summary  

---

## 6. Stack (actual vs POC doc)

| Layer | POC document | **Our build** |
|-------|--------------|---------------|
| Patient UI | WhatsApp API | WhatsApp Cloud API ✅ |
| Staff app | React Native | Expo + React Native ✅ |
| Admin | Angular | *Not started* |
| Backend | Node.js TS | Node.js Cloud Functions ✅ |
| Database | MongoDB | **Firestore** ✅ |
| Auth | — | Firebase Auth ✅ |

---

## 7. Quick Reference — Current vs Target `Hi` Flow

**Today (MVP):**
```
Hi → Available slots today: 1. 5:30 pm → Reply 1 → Booked! Code: K5HY
```

**DoctorFlow target:**
```
Hi → Welcome to ABC Clinic → [Book] [View] [Cancel] [Info]
  → Book → Pick doctor → Pick date → Pick slot → Details → Confirm → APT-xxx
```

---

## 8. Team Notes

- **Call Next** = moves patient from **Waiting (Checked In)** → **Now Seeing (In Progress)** — by design.  
- **Bookings tab** shows all statuses; **Queue tab** shows only checked-in + in-progress.  
- Keep this file updated as phases ship.  

*Last updated: July 2026*
