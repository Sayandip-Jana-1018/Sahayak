# 🙏 Sahayak

**India's voice-first AI companion for elderly smartphones**

A full-stack platform enabling caregivers and NGOs to support elderly family members through voice commands, medication tracking, SOS alerts, health monitoring, and real-time device management.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 19, TypeScript, TanStack Query, Zustand |
| **Backend** | Fastify 5, Socket.io, BullMQ, Zod validation |
| **Database** | PostgreSQL 16 + Drizzle ORM (17 tables) |
| **Cache/Queue** | Redis 7 |
| **Auth** | Clerk (JWT, phone OTP, email) |
| **AI** | Google Gemini (voice STT/TTS, OCR, emotion, companion, scheme finder) |
| **Maps** | Leaflet + OpenStreetMap (web), GPS tracking |
| **Infra** | Docker, GitHub Actions CI/CD, Cloud Run, Vercel |
| **Observability** | Sentry (error tracking), PostHog (analytics) |
| **Mobile** | Flutter (planned — clean architecture + BLoC) |

---

## Repository Structure

```
sahayak/
├── apps/
│   ├── api/                        # Fastify REST + WebSocket API server
│   │   ├── src/
│   │   │   ├── app.ts              # Route registration (27 routes)
│   │   │   ├── server.ts           # Server bootstrap + workers
│   │   │   ├── routes/
│   │   │   │   ├── ai/             # 5 AI endpoints (voice, companion, emotion, OCR, schemes)
│   │   │   │   ├── dashboard/      # overview.ts, health.ts
│   │   │   │   ├── medications/    # index.ts (GET/POST), [id].ts (PUT/DELETE)
│   │   │   │   ├── onboarding/     # check-onboarding.ts, complete.ts, create-profile.ts
│   │   │   │   ├── sos/            # trigger.ts, events.ts (GET/PUT)
│   │   │   │   ├── device/         # register, status, request-location
│   │   │   │   ├── health-notes/   # GET/POST
│   │   │   │   ├── appointments/   # GET/POST
│   │   │   │   ├── voice-profile/  # multipart upload + quality scoring
│   │   │   │   ├── profile/        # user profile CRUD
│   │   │   │   ├── reminders/      # BullMQ reminder scheduling
│   │   │   │   ├── sms/            # send-install-link.ts
│   │   │   │   ├── studio/         # overview, commands (CRUD), content (CRUD)
│   │   │   │   ├── admin/          # overview (platform stats + 30-day growth)
│   │   │   │   └── demo-request.ts # Landing page demo form
│   │   │   ├── workers/
│   │   │   │   └── loneliness.worker.ts  # 6h cron, Redis cooldown
│   │   │   ├── plugins/
│   │   │   │   └── socket.ts       # Socket.io JWT auth, room management
│   │   │   └── instrument.ts       # Sentry (install SDK before use)
│   │   └── Dockerfile              # Multi-stage Alpine build
│   │
│   └── web/                        # Next.js 14 frontend
│       ├── app/
│       │   ├── layout.tsx          # Root layout (Clerk, fonts, theme)
│       │   ├── page.tsx            # Landing page
│       │   ├── globals.css         # 100KB design system (glassmorphism, animations)
│       │   ├── (auth)/             # Login/register pages
│       │   ├── onboarding/         # 4-step onboarding flow
│       │   ├── dashboard/          # 5 pages: overview, medications, health, sos, settings
│       │   │   ├── layout.tsx      # Sidebar nav, notifications, offline banner, a11y
│       │   │   ├── page.tsx        # Overview — stat cards, location map, activity feed
│       │   │   ├── select-profile/ # Multi-elder profile selector
│       │   │   ├── medications/    # Med list + add modal + prescription OCR
│       │   │   ├── health/         # Health notes + appointments
│       │   │   ├── sos/            # SOS event timeline + resolve
│       │   │   └── settings/       # Theme, language, font, profile
│       │   ├── studio/             # 6 pages: NGO admin panel
│       │   │   ├── layout.tsx      # Purple sidebar
│       │   │   ├── page.tsx        # Overview — org stats, alerts
│       │   │   ├── devices/        # Device status cards, search
│       │   │   ├── flows/          # Custom voice command CRUD
│       │   │   ├── content/        # Categorized local references
│       │   │   └── analytics/      # CSS bar chart, rankings, date range
│       │   └── admin/              # 7 pages: system admin
│       │       ├── layout.tsx      # Red/orange sidebar
│       │       ├── page.tsx        # Platform stats, 30-day growth
│       │       ├── users/          # User list, role management
│       │       ├── organizations/  # Org cards, add form
│       │       ├── ai-usage/       # Token stats, cost breakdown
│       │       ├── sos/            # Platform-wide SOS timeline
│       │       ├── system/         # Service health, CPU/memory
│       │       └── announcements/  # Compose + broadcast
│       ├── components/
│       │   ├── ErrorBoundary.tsx    # Glassmorphic error fallback
│       │   ├── dashboard/
│       │   │   ├── LocationMapCard.tsx   # Leaflet + reverse geocoding
│       │   │   └── NotificationDrawer.tsx
│       │   ├── onboarding/
│       │   │   ├── Step1Welcome.tsx
│       │   │   ├── Step2ElderDetails.tsx
│       │   │   ├── Step3LanguageCustomization.tsx
│       │   │   └── Step4InstallApp.tsx    # Device polling
│       │   ├── hero/               # Landing page 3D iPhone, animations
│       │   ├── sections/           # Landing page sections
│       │   ├── layout/             # Navbar, Footer
│       │   └── ui/
│       │       └── OfflineBanner.tsx
│       ├── store/                  # 7 Zustand stores
│       │   ├── themeStore.ts       # Dark/light mode (persisted)
│       │   ├── fontSizeStore.ts    # Elder-friendly text scaling
│       │   ├── localeStore.ts      # 11-language i18n
│       │   ├── notificationStore.ts # In-app notification queue
│       │   ├── onboardingStore.ts  # Multi-step form state
│       │   ├── sosModalStore.ts    # SOS confirmation dialog
│       │   └── toastStore.ts       # Transient toast messages
│       └── lib/
│           ├── api.ts              # Authenticated fetch (Clerk JWT)
│           └── posthog.tsx         # PostHog analytics (install SDK before use)
│
├── packages/
│   └── db/                         # Shared database package
│       ├── src/
│       │   ├── schema.ts           # 17 Drizzle tables + relations
│       │   └── index.ts            # Exports: db, all tables, operators
│       └── drizzle.config.ts       # Push/migrate config
│
├── docker-compose.yml              # Postgres + Redis + API
├── .github/workflows/
│   ├── ci.yml                      # Lint + typecheck on PRs
│   └── deploy.yml                  # Cloud Run (API) + Vercel (Web)
├── turbo.json                      # Turborepo pipeline
├── pnpm-workspace.yaml
└── README.md
```

---

## Database Schema — 17 Tables

### Core Tables
| Table | Purpose | Key Relations |
|-------|---------|--------------|
| `users` | All platform users | → organizations, → caregiver_links |
| `elderly_profiles` | One per elder, center of data model | → users (createdBy), → all health/device/sos tables |
| `caregiver_links` | Family↔Elder M:N relationship | → users, → elderly_profiles |
| `organizations` | NGOs, hospitals, CSCs, govt bodies | → users (members) |

### Health & Medication
| Table | Purpose |
|-------|---------|
| `medication_reminders` | Active prescriptions (name, dosage, times, dates) |
| `medication_logs` | Per-dose tracking (pending/taken/missed/skipped) |
| `health_notes` | Free-text caregiver health notes |
| `appointments` | Doctor visits (doctor, specialty, date, location) |

### Safety & Voice
| Table | Purpose |
|-------|---------|
| `sos_events` | Emergency events (trigger type, GPS, severity, resolution) |
| `voice_command_logs` | Every voice interaction (intent, confidence, latency) |
| `voice_profile_samples` | Audio fingerprint files for elder identification |

### Device & Infrastructure
| Table | Purpose |
|-------|---------|
| `device_registrations` | Per-elder enrolled phone (model, FCM token, active status, heartbeat) |
| `content_library` | Regional references: hospitals, emergency numbers, govt offices |
| `custom_voice_commands` | NGO-defined trigger phrases and responses |
| `ai_usage_logs` | AI API call tracking (tokens, cost, feature) |
| `announcements` | Admin broadcast messages (target, priority) |
| `demo_requests` | Landing page demo form submissions |

### Supported Languages
Hindi, Tamil, Bengali, Marathi, Telugu, Kannada, Gujarati, Punjabi, Malayalam, Urdu, English

---

## Quick Start

### Prerequisites
- **Node.js** ≥ 20 | **pnpm** ≥ 9
- **PostgreSQL** 16 (local or Docker or Supabase/Neon)
- **Redis** 7 (local or Docker)

### 1. Clone & Install
```bash
git clone https://github.com/Sayandip-Jana-1018/Sahayak.git
cd sahayak
pnpm install
```

### 2. Environment Variables
```bash
# apps/api/.env
DATABASE_URL=postgresql://user:pass@host:5432/sahayak
REDIS_URL=redis://localhost:6379
CLERK_SECRET_KEY=sk_test_...
GEMINI_API_KEY=...

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# packages/db/.env
DATABASE_URL=postgresql://user:pass@host:5432/sahayak
```

### 3. Database Setup
```bash
# Option A: Docker
docker compose up -d postgres redis

# Push schema
pnpm db:push
```

### 4. Run Development
```bash
pnpm dev          # Both web + API
pnpm dev:web      # http://localhost:3000
pnpm dev:api      # http://localhost:8080
```

---

## API Endpoints — 27 Routes

### Auth & Onboarding
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/onboarding/status` | Check onboarding, return all linked profiles |
| `POST` | `/api/onboarding/complete` | Mark onboarding done |
| `POST` | `/api/onboarding/create-profile` | Create elder + caregiver link |

### Dashboard
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/dashboard/overview` | Profile + stats + activity + location |
| `GET` | `/api/dashboard/health` | Health summary |

### Medications
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/medications` | List medications for profile |
| `POST` | `/api/medications` | Add medication |
| `PUT` | `/api/medications/:id` | Update medication |
| `DELETE` | `/api/medications/:id` | Delete medication |

### Health
| Method | Path | Purpose |
|--------|------|---------|
| `GET/POST` | `/api/health-notes` | Health notes CRUD |
| `GET/POST` | `/api/appointments` | Appointments CRUD |

### SOS
| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/sos/trigger` | Trigger SOS (lat/lng, type, severity) |
| `GET` | `/api/sos/events` | Paginated SOS events |
| `PUT` | `/api/sos/events/:id` | Resolve SOS event |

### Device
| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/device/register` | Register device (APK first launch) |
| `GET` | `/api/device/status/:id` | Connection + battery status |
| `POST` | `/api/device/request-location` | Request GPS via Socket.io |

### AI (Gemini)
| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/ai/voice-demo` | Voice command processing |
| `POST` | `/api/ai/companion` | AI companion chat |
| `POST` | `/api/ai/emotion` | Emotion detection from voice |
| `POST` | `/api/ai/scheme-finder` | Government scheme recommendations |
| `POST` | `/api/ai/prescription-ocr` | Medicine extraction from photo |

### Studio (NGO Admin)
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/studio/overview` | Org stats |
| `GET/POST/DELETE` | `/api/studio/commands` | Custom voice commands CRUD |
| `GET/POST/DELETE` | `/api/studio/content` | Content library CRUD |

### Admin (System Admin)
| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/admin/overview` | Platform stats + 30-day growth chart |

---

## Design System

Premium glassmorphic design with Indian government aesthetic touches.

### CSS Variables
```css
--glass-bg        /* Semi-transparent card fill */
--glass-border    /* Frosted border */
--glass-shadow    /* Depth shadow */
--text-primary    /* White (dark) / Charcoal (light) */
--text-secondary  /* Muted text */
--sah-accent-1    /* Saffron orange */
--sah-accent-2    /* Emerald green */
--sah-rose        /* SOS pink */
```

### Themes
- **Dark mode**: Navy-black backgrounds, frosted glass cards, white text
- **Light mode**: Warm off-white, subtle shadows, charcoal text
- **Elder-friendly**: 3 font sizes (normal/large/xlarge), 54dp min touch targets

---

## WebSocket Events (Socket.io)

| Event | Direction | Purpose |
|-------|-----------|---------|
| `sos_triggered` | Server → Client | Real-time SOS alert to family |
| `device_registered` | Server → Client | Device connected notification |
| `request_location` | Server → Device | GPS request from caregiver |
| `location_update` | Device → Server | GPS coordinates from elder's phone |
| `med_reminder` | Server → Device | Medication reminder push |

---

## Deployment

### Docker (API)
```bash
docker compose up --build
```

### Vercel (Web)
Connect repo → set `apps/web` as root

### CI/CD
- `.github/workflows/ci.yml` — lint + typecheck on PRs
- `.github/workflows/deploy.yml` — Cloud Run (API) + Vercel (Web)

---

## License
Private — Sahayak Project
