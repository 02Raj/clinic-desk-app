# Clinic Front-Desk OS — Design System

**Source of truth:** [`src/theme/theme.js`](file:///C:/Users/divya/.gemini/antigravity-ide/scratch/clinic-front-desk-os/src/theme/theme.js)
**Reference direction:** Practo provider-side dashboard (style only — not layout or content).
**Component library:** React Native Paper (MD3), themed with the tokens below.

---

## 1. Color Palette

All colors are defined in the `palette` object in `theme.js`. Do not use hex
values directly in screen code — always import from the theme.

| Token               | Hex       | Usage                                        |
| ------------------- | --------- | -------------------------------------------- |
| `primary`           | `#2563EB` | Primary buttons, active tabs, links           |
| `primaryDark`       | `#1D4ED8` | Pressed / active states on primary elements   |
| `primaryLight`      | `#DBEAFE` | Selected row tint, booked-status chip bg      |
| `primaryContainer`  | `#EFF6FF` | Very subtle highlight backgrounds             |
| `background`        | `#FFFFFF` | Screen background                             |
| `surfaceVariant`    | `#F8FAFC` | Card / section / list-item background         |
| `success`           | `#16A34A` | Confirmed / completed status                  |
| `successLight`      | `#DCFCE7` | Success chip / badge background               |
| `warning`           | `#D97706` | Waitlist / attention-needed status             |
| `warningLight`      | `#FEF3C7` | Warning chip / badge background               |
| `error`             | `#DC2626` | Cancelled / no-show / destructive actions      |
| `errorLight`        | `#FEE2E2` | Error chip / badge background                 |
| `neutral`           | `#64748B` | Checked-in / secondary status                  |
| `neutralLight`      | `#F1F5F9` | Neutral chip / badge background               |
| `textPrimary`       | `#0F172A` | Headings, body text                            |
| `textSecondary`     | `#64748B` | Captions, timestamps, secondary labels         |
| `textOnPrimary`     | `#FFFFFF` | Text on primary-colored buttons                |
| `textDisabled`      | `#94A3B8` | Disabled labels                                |
| `border`            | `#E2E8F0` | Input borders, card outlines                   |
| `divider`           | `#F1F5F9` | List separators, section dividers              |
| `overlay`           | `rgba(15,23,42,0.4)` | Modal / bottom-sheet scrim            |

### What NOT to use

- No purple or violet anywhere.
- No neon / glow effects.
- No gradients (neither linear nor radial) on backgrounds or cards.

---

## 2. Typography

| Variant         | Font           | Weight   | Size | Line Height | Use case                       |
| --------------- | -------------- | -------- | ---- | ----------- | ------------------------------ |
| `headlineLarge` | System default | Bold 700 | 22px | 28px        | Screen titles                  |
| `headlineMedium`| System default | Bold 700 | 20px | 26px        | Section headers                |
| `headlineSmall` | System default | Bold 700 | 18px | 24px        | Card titles, sub-headers       |
| `titleMedium`   | System default | Semi 600 | 16px | 22px        | List item primary text         |
| `titleSmall`    | System default | Semi 600 | 14px | 20px        | Button labels, tab labels      |
| `bodyLarge`     | System default | Regular  | 16px | 24px        | Primary body text              |
| `bodyMedium`    | System default | Regular  | 14px | 20px        | Standard body, descriptions    |
| `bodySmall`     | System default | Regular  | 12px | 16px        | Captions, timestamps           |
| `labelLarge`    | System default | Semi 600 | 14px | 20px        | Chip text, badge labels        |
| `labelSmall`    | System default | Semi 600 | 11px | 16px        | Overlines, small badges        |

### Rules

- **System font only** — San Francisco on iOS, Roboto on Android.
- No italic. No script/decorative fonts.
- Headings are always bold (700). Body is regular (400). Labels/titles are
  semi-bold (600).
- This app is an operational tool, not a marketing page. Typography should be
  scannable and information-dense.

---

## 3. Spacing

Strict **4 px base scale**. No arbitrary values (e.g., no `padding: 10` or
`margin: 15`).

| Token  | Value | Typical use                                |
| ------ | ----- | ------------------------------------------ |
| `xxs`  | 2px   | Hairline (icon-to-label gaps, rare)        |
| `xs`   | 4px   | Tight inner padding, small gaps            |
| `sm`   | 8px   | Chip padding, compact list spacing         |
| `md`   | 12px  | Card inner padding (compact), icon margins |
| `base` | 16px  | Standard padding, screen horizontal gutter |
| `lg`   | 24px  | Section gaps, generous padding             |
| `xl`   | 32px  | Screen top/bottom padding                  |
| `xxl`  | 48px  | Large section separators (rare)            |

Usage in code:

```js
import { spacing } from '../theme/theme';

// ✅ Correct
<View style={{ padding: spacing.base, marginBottom: spacing.lg }}>

// ❌ Wrong — arbitrary value
<View style={{ padding: 15, marginBottom: 20 }}>
```

---

## 4. Border Radius

| Token  | Value  | Use                                      |
| ------ | ------ | ---------------------------------------- |
| `xs`   | 4px    | Small badges, tiny chips                 |
| `sm`   | 8px    | Buttons, text inputs, standard chips     |
| `md`   | 12px   | Cards, modals, bottom sheets             |
| `lg`   | 16px   | Full-screen sheets (rare)                |
| `full` | 9999px | Circular avatars, round badges           |

---

## 5. Elevation / Shadows

Soft shadows only. Never hard drop-shadows, neon glows, or colored shadows.

| Token  | Elevation | Use                                      |
| ------ | --------- | ---------------------------------------- |
| `none` | 0         | Flat elements, inline sections           |
| `sm`   | 1         | Subtle lift for list items on press      |
| `md`   | 2         | Cards, elevated surfaces                 |
| `lg`   | 3         | Floating action buttons, modals          |

Usage:

```js
import { shadows } from '../theme/theme';

<View style={[styles.card, shadows.md]}>
```

For React Native Paper components, use the `elevation` prop (values 0–3).

---

## 6. Status Colors

Appointment and waitlist statuses have centralized color mappings in
`theme.js`. Always use these — never assign status colors ad hoc.

### Appointment Status

| Status        | Text Color   | Background     |
| ------------- | ------------ | -------------- |
| `BOOKED`      | `primary`    | `primaryLight` |
| `CONFIRMED`   | `success`    | `successLight` |
| `CHECKED_IN`  | `neutral`    | `neutralLight` |
| `IN_PROGRESS` | `primary`    | `primaryContainer` |
| `COMPLETED`   | `success`    | `successLight` |
| `NO_SHOW`     | `error`      | `errorLight`   |
| `CANCELLED`   | `error`      | `errorLight`   |

### Waitlist Status

| Status     | Text Color | Background     |
| ---------- | ---------- | -------------- |
| `WAITING`  | `warning`  | `warningLight` |
| `OFFERED`  | `primary`  | `primaryLight` |
| `ACCEPTED` | `success`  | `successLight` |
| `EXPIRED`  | `neutral`  | `neutralLight` |

Usage:

```js
import { appointmentStatus } from '../theme/theme';

const status = appointmentStatus[appointment.status];
// → { label: 'Confirmed', color: '#16A34A', backgroundColor: '#DCFCE7' }

<Chip
  textStyle={{ color: status.color }}
  style={{ backgroundColor: status.backgroundColor }}
>
  {status.label}
</Chip>
```

---

## 7. Component Guidelines

### Base library

Use **React Native Paper** (MD3 mode) for all standard components:
`Button`, `Card`, `Chip`, `Appbar`, `TextInput`, `List`, `Divider`,
`FAB`, `Dialog`, `Snackbar`.

Theme them via the exported `theme` object — do not override Paper component
styles with inline hacks unless there's a clear, documented reason.

### Cards

```
borderRadius: radius.md (12px)
elevation: 2 (shadows.md)
backgroundColor: palette.surfaceVariant (#F8FAFC)
padding: spacing.base (16px)
```

### Buttons

```
Primary:   mode="contained", uses theme primary color
Secondary: mode="outlined", primary-colored border + text
Text:      mode="text", no border, primary-colored text
borderRadius: radius.sm (8px) — set via theme.roundness
```

### Chips (status badges)

```
Use Chip component with custom style from appointmentStatus/waitlistStatus maps.
borderRadius: radius.sm (8px)
padding horizontal: spacing.sm (8px)
```

### Appbar

```
backgroundColor: palette.background (#FFFFFF)
title color: palette.textPrimary (#0F172A)
No elevation on Appbar — use a bottom border (palette.border) instead.
```

---

## 8. Layout Rules

- **Left-aligned, information-dense.** This is a front-desk operational tool.
  Do not center-align body content. Center-align only empty states and modals.
- **Screen horizontal padding:** `spacing.base` (16px) on both sides.
- **Section gaps:** `spacing.lg` (24px) between major sections.
- **List item vertical spacing:** `spacing.sm` (8px) between items.
- **No decorative blobs, abstract shapes, or oversized illustrations.** If an
  empty state needs an illustration, use a simple, single-color icon from
  Material Community Icons at 48–64px.
- **No excessive emoji in UI copy.** One emoji per section header at most,
  and only where it adds genuine clarity (e.g., a clock for "Upcoming").

---

## 9. Anti-Patterns (Explicitly Banned)

These produce the "AI-generated app" look and must be avoided in every screen:

| ❌ Don't                                    | ✅ Do instead                             |
| ------------------------------------------- | ----------------------------------------- |
| Purple/violet gradients                     | Flat blue + white                         |
| Glassmorphism / frosted glass               | Solid `surfaceVariant` cards              |
| Oversized rounded blobs or abstract shapes  | Clean whitespace, no decorative fills     |
| Generic stock "robot" or "AI sparkle" icons | Material Community Icons, single-color    |
| Centered-everything layout                  | Left-aligned, scannable rows              |
| Excessive emoji                             | Minimal, purposeful emoji (≤1 per header) |
| Hard drop-shadows or neon glow              | Soft shadows (`shadows.sm` / `shadows.md`)|
| Custom decorative fonts                     | System font (Roboto / San Francisco)      |
| Arbitrary spacing (10, 15, 22…)             | 4px scale only (4, 8, 12, 16, 24, 32)    |

---

## 10. File & Import Convention

All design tokens live in a single file:

```
src/theme/theme.js
```

Import pattern for any screen or component file:

```js
import theme, {
  palette,
  spacing,
  radius,
  shadows,
  appointmentStatus,
  waitlistStatus,
} from '../theme/theme';

// Wrap your app root with PaperProvider:
import { PaperProvider } from 'react-native-paper';

<PaperProvider theme={theme}>
  <App />
</PaperProvider>
```

Every future screen prompt should reference this document to stay consistent.
