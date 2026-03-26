# Sahayak

Voice-first phone assistance for Indian users, built elderly-first.

Sahayak is designed around one core idea:

> the phone should do the work, not the user

The current product direction is:

- `app/` = the Android Flutter app, optimized first for elderly users
- `web/` = the caregiver, operations, and admin surface
- one shared backend and one shared database

This repository is organized as a clean monorepo:

```text
sahayak/
|-- app/        # Flutter Android app
|-- web/        # Next.js + Fastify + Drizzle monorepo
|-- .github/
|-- .gitignore
`-- README.md
```

This root README is the single source of truth for the entire repository.

---

## Vision

Sahayak started as an elderly-first product for people who own smartphones but cannot comfortably use them because modern mobile UX assumes:

- small text
- app navigation literacy
- English labels
- confident typing
- strong fine motor control
- high trust in confusing financial flows

Sahayak removes those assumptions.

The long-term vision is a trusted phone operating layer where a user can speak naturally:

- "Call my daughter"
- "Open camera"
- "Send this message to Rahul on WhatsApp"
- "Remind me to take medicine at 8"
- "Bachao"
- "Beti ko 500 bhejo"

The product is being built elderly-first because that is the strongest mission, sharpest UX requirement, and clearest wedge into a much bigger voice-action phone assistant platform.

---

## Current Product Scope

### Primary focus now

- Elderly-first Android app
- Shared backend and database
- Web caregiver/admin/operations surface

### Not the focus right now

- Separate caregiver mobile shell
- iOS
- on-device LLM and on-device STT
- full phone-wide automation across every Android app
- direct payment custody or banking licenses

---

## Tech Stack

## App

- Flutter
- BLoC
- GoRouter
- Hive
- Firebase Messaging
- WorkManager
- Flutter TTS + server audio playback

## Web and Backend

- Next.js
- Fastify
- Socket.io
- PostgreSQL
- Drizzle ORM
- BullMQ / Redis
- Clerk-style auth flow

## AI and voice

- OpenAI Whisper API for STT
- Gemini for response generation and task reasoning
- Edge TTS for multilingual response audio

---

## What Is Built Right Now

This is the honest current state.

### Working or substantially wired

- Shared repo structure with clean `app/` and `web/`
- Shared backend and shared database
- Real voice route that accepts Flutter audio upload and still supports the older web text path
- Voice logging into `voice_command_logs`
- Real medication CRUD on the backend
- Medication taken flow and adherence API
- Real SOS insert and resolve flow
- Socket emission for SOS events
- Device registration and heartbeat routes
- Onboarding profile creation and device setup wiring
- Stronger Flutter UI foundation: glass system, theme system, better onboarding, stronger home/voice/medications/settings base
- Localization scaffolding in Flutter with ARB generation enabled

### Partially built or still being hardened

- Full end-to-end SOS reliability and no-network behavior
- Full visual polish on every mobile screen
- Complete localization across all rebuilt screens
- Full offline queue replay for every mutation
- FCM production hardening
- Full web page-by-page verification that every screen is reading real data and not fallback/demo states

### Deferred for later phases

- On-device STT/LLM/TTS
- wake word
- fall detection
- OEM preload strategy
- ABHA integration
- DigiLocker integration
- telecom partnerships

---

## What Is Actually Flowing Through The Shared Backend Today

These are the flows that are designed to be real shared-system flows, not isolated app-only features:

### Profile and onboarding data

- The app creates elderly profiles through the shared backend.
- Those profiles live in the shared database.
- The same profile entities are intended to power both the app and web views.

### Medications

- Medication creation, update, delete, taken-state, and adherence are backend-driven.
- The app and web are meant to read from the same medication tables.
- This is one of the strongest shared data paths in the current system.

### SOS

- SOS is designed to write real `sos_events` rows.
- Resolve actions update the same event records.
- Web dashboards are intended to reflect these same records and socket events.

### Device status

- Device registration and heartbeat are shared backend concepts.
- Battery and last-seen style signals are intended to surface in caregiver-facing web pages.

### Voice logs

- Voice interactions are logged to the shared database.
- This creates a base for web-side activity timelines and future analytics.

### Honest caveat

While the architecture is shared and the major routes are now wired, some web pages still need a systematic page-by-page verification pass to confirm each screen is consuming the real live data path and not a partial placeholder shape.

That verification is part of the active roadmap.

---

## Development Progress

There are two useful ways to measure progress:

### 1. Elder-first pilot-ready product

This means:

- a stable Android app
- real voice roundtrip
- medicine management
- SOS
- onboarding
- caregiver web visibility
- localization foundation
- production-grade polish

Estimated completion from current state:

- around `55% to 65%` of the elderly-first pilot-ready product is effectively in place
- around `6 to 10 weeks` of focused development remains to make it feel truly production-grade and deployment-ready

### 2. Full original multi-product vision

This means:

- elderly app
- full caregiver web
- org/studio/admin maturity
- offline/on-device AI roadmap
- payments maturity
- government integrations
- scale, partnerships, and compliance hardening

Estimated completion from current state:

- around `20% to 30%` of the full long-range vision is implemented
- realistic delivery of the broader original vision is closer to `12 to 18 months`, not a few weeks

That is normal. The vision is large.

---

## What We Are Building Next

### Immediate next block

1. Harden SOS fully
- verify DB write, resolve flow, socket fanout, and SMS fallback behavior
- tighten the overlay UX so it feels instant and trustworthy

2. Complete medication experience
- polish taken/missed states
- improve adherence display
- verify shared web visibility end to end

3. Continue mobile visual rebuild
- home
- voice
- SOS
- medications
- health
- onboarding consistency

4. Continue localization
- move rebuilt screens to ARB-backed strings
- finish Hindi + English first
- then expand to the rest of the main Indian languages

5. Hardening
- offline queue
- background tasks
- push reliability
- analyzer cleanup
- release verification

---

## Roadmap By Phase

## Phase A - backend truth

- real voice route
- real SOS lifecycle
- real medication flows
- exact-profile authorization checks
- heartbeat and device registration

## Phase B - elderly-first mobile foundation

- visual system
- typography
- glass surfaces
- dark and light themes
- onboarding rebuild
- profile selection

## Phase C - core user experience

- home
- voice
- medications
- SOS
- health
- settings

## Phase D - resilience

- offline queue
- work manager
- FCM
- low-end Android performance pass
- analytics and error tracking

## Phase E - expansion

- broader phone action assistant
- richer caregiver intelligence
- org/studio workflows
- compliance-sensitive payment orchestration
- optional younger mainstream productivity assistant features

---

## Can Sahayak Expand Beyond Elders?

Yes, and that is one of the strongest long-term opportunities.

The right framing is:

- build `elderly-first`
- evolve into `voice-first phone orchestration`

That means the same action architecture can later support younger users who want fast command-style control of their phone.

### Example expansion commands

- "Open YouTube"
- "Open camera"
- "Call person X"
- "Draft an email to person Y"
- "Send this WhatsApp message to person Z"
- "Set an alarm for 6"
- "Open Maps to the airport"
- "Read my latest notifications"

### Why this is powerful

- Elders need clarity and trust
- Younger users need speed and convenience
- The same underlying tool/action engine can serve both, with different UX shells

### The right way to do it

Do not turn the app into a messy "do everything" assistant too early.

Instead:

- keep the elderly app opinionated and safe
- build a reusable action engine behind it
- later add a second interaction mode for mainstream users

That gives you a sharper product now and a larger platform later.

---

## What Phone Actions Are Easy Vs Hard

### Safe and straightforward

- open apps
- open camera
- dial a number
- compose SMS
- compose email
- open Maps
- open WhatsApp deep links where supported
- create reminders
- open web pages
- open YouTube search or video links

These are generally done through Android intents, deep links, and app-to-app handoff.

### Possible but needs confirmation

- sending WhatsApp messages
- sending emails
- opening a UPI payment
- submitting form content on behalf of the user

These should be implemented as:

- understand intent
- prefill action
- show or speak confirmation
- hand off to the target app

### Fragile or risky if done "silently"

- arbitrary cross-app automation
- tapping buttons inside third-party apps without user confirmation
- bypassing Android safety flows

That usually requires:

- AccessibilityService hacks
- default assistant privileges
- vendor-specific workarounds

Those approaches can become brittle, policy-sensitive, and hard to trust.

For Sahayak, the better product pattern is:

> compose, confirm, and hand off safely

not

> secretly drive every app in the background

---

## How Money Transfer Can Work

This is one of the most important product questions.

### What Sahayak should do

Sahayak should orchestrate the transfer, not directly hold money.

A safe voice-driven flow looks like this:

1. User says:
   - "Beti ko 500 bhejo"

2. Sahayak resolves:
   - who "Beti" means
   - which UPI ID or saved beneficiary to use
   - how much money is intended

3. Sahayak confirms clearly:
   - "Aap 500 rupaye Riya ko bhejna chahte hain. Kya main UPI kholun?"

4. Sahayak opens:
   - BHIM
   - bank UPI app
   - or a UPI deep link

5. User completes:
   - bank app PIN / device biometrics / bank-required confirmation

### What Sahayak should not do

- directly debit bank accounts
- store money
- act like an unlicensed wallet
- bypass banking authentication

### Why banks and NPCI would allow the safe version

Because Sahayak is acting like:

- an intelligent front-end
- a voice UI layer
- an intent generator

while the actual payment authorization still happens through the licensed UPI/bank ecosystem.

### Best practical approach

Short term:

- UPI deep links
- beneficiary whitelisting
- double voice confirmation
- irreversible action guard

Medium term:

- NPCI-compliant flows
- known-recipient safety model
- bank partner or PSP partner support

For feature-phone or no-data contexts, USSD-assisted bank balance and certain banking flows can still be a valuable differentiator, but they must be treated with extreme safety and careful UX.

---

## Suggested Next-Level Features After The Core Vision

Once the core elderly-first product is solid, these are the best high-value extensions.

### For the app

- multilingual voice memory and conversation continuity
- voice shortcuts for routine actions
- trusted contacts graph: "beta", "beti", "doctor", "mandir", "chemist"
- document explain with stronger OCR and translation
- smart reminder intelligence: follow-up if missed
- loneliness and inactivity monitoring with caregiver nudges
- voice tutorial mode for first-time users
- guided large-print "simple mode" for mixed voice + touch users

### For the web

- better caregiver timeline and action audit
- med adherence trends and risk scoring
- device fleet health for NGOs and institutions
- elder-specific command analytics
- content library by district/state/language
- real notification center and alert routing
- caregiver mobile web optimization

### Cross-platform

- richer permissions and intent layer
- assistant action registry
- safer app handoff engine
- stronger analytics and session replay for debugging failed tasks
- real release pipeline and QA matrix for low-end Android phones

### Strategic expansion

- broader "phone assistant" mode for young users
- telecom / OEM integration
- government and hospital deployment packages
- voice commerce and bill pay orchestration

---

## Security and Compliance Principles

This product should follow a few hard rules:

- never silently execute irreversible actions
- never expose secrets in the repository
- never hold funds directly without proper licensing
- treat elder data as sensitive health and family data
- require exact-profile authorization for caregiver views
- log actions for traceability

---

## Local Development

## Run the backend

```powershell
cd C:\dev\shayak\web
pnpm install
pnpm dev:api
```

## Run the app

```powershell
cd C:\dev\shayak\app
flutter pub get
flutter gen-l10n
flutter run
```

For Android emulator, the app is configured to use `10.0.2.2:8080` for local backend access.

---

## Firebase Notes

Real Firebase credentials are intentionally not stored in Git.

If you want to run the app locally with Firebase:

1. regenerate `lib/firebase_options.dart`
2. place your real `android/app/google-services.json`
3. do not commit live keys back into the repository

---

## Current Truth In One Line

Sahayak is no longer just a concept or prototype. It is now a real shared app + web + backend system with the core elderly-first architecture in place, and it is moving from functional MVP engineering toward production-grade quality.
