# Know Your Route 🚗 ⚡

> **Intelligent Route, Vehicle & Trip Safety Platform**
> Cross-platform mobile application (Android & iOS) powered by a modular NestJS intelligence backend.

---

### 📚 Official Documentation
For complete step-by-step guides, architecture diagrams, and beginner tutorials, explore our [**Comprehensive Documentation Hub**](./documentation/README.md):
- 🚀 [**01 — Getting Started & Beginner's Setup**](./documentation/01-GETTING-STARTED.md)
- 🏛️ [**02 — System Architecture & Data Flow**](./documentation/02-SYSTEM-ARCHITECTURE.md)
- ⚙️ [**03 — Backend API Layer (NestJS)**](./documentation/03-BACKEND-API-LAYER.md)
- 📱 [**04 — Mobile Application Layer (Expo / React Native)**](./documentation/04-MOBILE-APP-LAYER.md)
- 📦 [**05 — Shared Packages Layer**](./documentation/05-SHARED-PACKAGES-LAYER.md)
- 🧠 [**06 — Providers & Intelligence Engines**](./documentation/06-PROVIDERS-AND-INTELLIGENCE.md)
- 🚢 [**07 — Development & Deployment Guide**](./documentation/07-DEVELOPMENT-AND-DEPLOYMENT.md)

---

## 🏗️ Architecture Overview

The system is architected as a **client application over a backend intelligence platform**. The mobile application **never** talks directly to external third-party APIs (Google Maps, OpenWeather, OEM APIs).

```text
React Native Mobile (Expo / Expo Router)
        ↓
Know Your Route Backend (NestJS Monolith)
        ↓
┌───────────────────────┬──────────────────────┐
│    Domain Engines     │  Provider Adapters   │
│  • Route Service      │  • Maps (Mock/Real)  │
│  • Energy Intel       │  • Weather (Mock/Real)│
│  • Safety Engine      │  • Toll (Mock/Real)  │
│  • FASTag Intel       │  • Vehicle (OEM/OCR) │
│  • Trip Cost Engine   │  • AI / LLM          │
└───────────────────────┴──────────────────────┘
        ↓
PostgreSQL (Prisma) + Redis Cache
```

---

## 📁 Monorepo Structure

```text
know-your-route/
├── apps/
│   ├── mobile/         # React Native + Expo + Expo Router + Zustand + TanStack Query
│   └── api/            # NestJS Modular Monolith + Prisma + Redis + Providers
├── packages/
│   ├── types/          # Shared Canonical Domain Contracts (VehicleProfile, RouteProfile, etc.)
│   ├── validation/     # Shared Zod Schemas
│   ├── api-client/     # Resilient HTTP Client with Token Injection & Error Normalization
│   ├── config/         # Shared TypeScript & ESLint configurations
│   └── ui/             # Design Tokens & Theme contracts
├── turbo.json          # Turborepo task pipeline
├── pnpm-workspace.yaml # Monorepo workspace configuration
└── package.json
```

---

## 🚀 Quick Start (First Run)

### 1. Prerequisites
- **Node.js**: >= 20.x
- **pnpm**: >= 9.x (`npm install -g pnpm`)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Start Development Services

#### Run Both Mobile & Backend Monolith concurrently:
```bash
pnpm dev
```

#### Run Backend API alone (`http://localhost:4000/api/v1`):
```bash
pnpm dev:api
```
- Swagger Interactive Documentation: `http://localhost:4000/api/docs`

#### Run Mobile Application:
```bash
pnpm dev:mobile
# or
cd apps/mobile && npx expo start
```
- Press `i` to launch in **iOS Simulator**
- Press `a` to launch in **Android Emulator**
- Press `w` to run in **Web Browser**

---

## ⚙️ Provider Modes (`MOCK` vs `REAL`)

The backend supports zero-friction local development without requiring external credentials:

```bash
# In .env.development:
MAP_PROVIDER=mock
WEATHER_PROVIDER=mock
TOLL_PROVIDER=mock
VEHICLE_PROVIDER=mock
FASTAG_PROVIDER=mock
AI_PROVIDER=mock
```

When deploying to production or connecting live keys, set:
```bash
MAP_PROVIDER=real
GOOGLE_MAPS_API_KEY=your_key_here
```

---

## 📱 Mobile Screen Flow (Phase 1 Target)

```text
Splash / Index
    ↓
Landing Page
    ↓
Login (One-Tap Demo Sign In)
    ↓
Onboarding (Welcome ➔ Vehicle Details ➔ Permissions)
    ↓
Home (Active Vehicle ➔ Plan My Route ➔ Corridors)
    ↓
Routes Comparison (Candidate Routes ➔ Traffic & Toll Breakdown)
    ↓
Route Intelligence Detail (Safety, Weather, Smart Stops, AI Rationale)
    ↓
Live HUD (Speedometer, Real-Time Corridor Feed)
```

---

## 🧪 Verification & Quality

- **Typecheck**: `pnpm typecheck`
- **Lint**: `pnpm lint`
- **Build**: `pnpm build`
- **CI**: Automated GitHub Actions workflow on every push and PR
