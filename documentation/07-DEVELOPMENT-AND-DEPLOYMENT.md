# 🚢 07 — Development & Deployment Guide

> **Scope:** Day-to-day developer workflows, step-by-step tutorial for adding new features end-to-end, Turborepo commands, Docker deployment, and mobile app store releases via EAS.

---

## 📋 Table of Contents
1. [Day-to-Day Command Reference](#1-day-to-day-command-reference)
2. [End-to-End Tutorial: Adding a New Feature](#2-end-to-end-tutorial-adding-a-new-feature)
3. [Testing Strategy](#3-testing-strategy)
4. [Backend Production Deployment (Docker & Cloud)](#4-backend-production-deployment-docker--cloud)
5. [Mobile Production Deployment (EAS / App Stores)](#5-mobile-production-deployment-eas--app-stores)
6. [Continuous Integration (GitHub Actions)](#6-continuous-integration-github-actions)

---

## 1. Day-to-Day Command Reference

All primary commands are managed through **Turborepo** from the project root:

| Command | What it does | When to use |
| :--- | :--- | :--- |
| `pnpm dev` | Starts both the **Backend API** and the **Mobile Expo Bundler** simultaneously. | Everyday development when working on full-stack flows. |
| `pnpm dev:api` | Starts **only** the NestJS backend on `http://localhost:4000`. | When focusing purely on backend endpoints, Prisma, or algorithms. |
| `pnpm dev:mobile` | Starts **only** the Expo Metro bundler on `http://localhost:8081`. | When refining UI screens, layout, or frontend interactions. |
| `pnpm typecheck` | Validates TypeScript compilation across **all** packages and apps. | Before committing code or opening a Pull Request. |
| `pnpm lint` | Runs ESLint across the entire monorepo. | To catch style issues, dead code, or syntax defects. |
| `pnpm format` | Formats all `.ts`, `.tsx`, `.json`, and `.md` files using Prettier. | Keep the repository consistently formatted. |
| `pnpm test` | Runs Jest unit and service integration test suites. | Ensure business algorithms remain verified. |
| `pnpm build` | Compiles production distributions for backend and packages. | Verify production build readiness. |
| `pnpm clean` | Wipes all cache directories (`.turbo`, `dist`, `node_modules`). | When resolving dependency conflicts or corrupted caches. |

---

## 2. End-to-End Tutorial: Adding a New Feature

To understand how the layers of Know Your Route work together, let's walk through adding a real-world feature: **"Tyre Pressure PSI Monitoring"**.

```mermaid
flowchart LR
    Step1["1. packages/types<br/>Add TyrePressure interface"] --> Step2["2. packages/validation<br/>Add Zod validator"]
    Step2 --> Step3["3. apps/api (Prisma)<br/>Add schema field"]
    Step3 --> Step4["4. apps/api (Service)<br/>Compute tyre risk"]
    Step4 --> Step5["5. apps/mobile<br/>Update Store & Screen UI"]
```

### Step 1: Update Domain Contracts (`packages/types`)
Open `packages/types/src/vehicle.ts` and add tyre metadata:

```typescript
export interface TyrePressureStatus {
  frontLeftPsi: number;
  frontRightPsi: number;
  rearLeftPsi: number;
  rearRightPsi: number;
  isUnderInflated: boolean;
}

export interface VehicleProfile {
  // ... existing fields
  tyrePressure?: TyrePressureStatus;
}
```

---

### Step 2: Add Runtime Validation (`packages/validation`)
Open `packages/validation/src/vehicle.schema.ts` and add validation rules:

```typescript
export const TyrePressureSchema = z.object({
  frontLeftPsi: z.number().min(15).max(50),
  frontRightPsi: z.number().min(15).max(50),
  rearLeftPsi: z.number().min(15).max(50),
  rearRightPsi: z.number().min(15).max(50),
});
```

---

### Step 3: Update Database Schema (`apps/api`)
Open `apps/api/prisma/schema.prisma` and add the new field to the `Vehicle` model:

```prisma
model Vehicle {
  // ... existing fields
  tyrePressureJson  Json?
}
```

Run Prisma migration to update your database:
```bash
cd apps/api
npx prisma migrate dev --name add_tyre_pressure
```

---

### Step 4: Add Backend Service Logic (`apps/api`)
In `apps/api/src/vehicles/vehicles.service.ts`:

```typescript
evaluateTyres(psi: number[]): boolean {
  // Standard recommended car tyre pressure is ~32-35 PSI.
  // Flag as under-inflated if any tyre falls below 28 PSI.
  return psi.some(pressure => pressure < 28);
}
```

---

### Step 5: Render in the Mobile UI (`apps/mobile`)
In `apps/mobile/app/(tabs)/vehicle.tsx`, display a visual alert badge:

```tsx
{vehicle.tyrePressure?.isUnderInflated && (
  <View style={styles.tyreWarningBadge}>
    <AlertTriangle size={18} color={theme.colors.danger} />
    <Text style={styles.warningText}>
      Low Tyre Pressure Detected! Check before highway departure.
    </Text>
  </View>
)}
```

Because of our monorepo architecture, TypeScript guarantees full type safety and auto-complete across all 5 steps!

---

## 3. Testing Strategy

Run tests across the entire monorepo:
```bash
pnpm test
```

### Unit Tests
- Business logic in `EnergyService` (verifying EV kWh vs Petrol Litre conversions).
- Scoring algorithms in `SafetyService`.
- FASTag balance shortfall calculations in `FastagService`.

### Static Type Checks
Before submitting code, always run:
```bash
pnpm typecheck
```
Turborepo will check all packages in parallel and report any TypeScript mismatches.

---

## 4. Backend Production Deployment (Docker & Cloud)

### Production Dockerfile (`apps/api/Dockerfile`)
The backend is packaged into a slim, production-ready Alpine container:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build --filter=@know-your-route/api

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm
COPY --from=builder /app /app
EXPOSE 4000
CMD ["pnpm", "--filter", "@know-your-route/api", "start:prod"]
```

### Deploying to Cloud Providers:
1. **Google Cloud Run / AWS ECS:**
   ```bash
   docker build -t know-your-route-api -f apps/api/Dockerfile .
   docker run -p 4000:4000 --env-file .env.production know-your-route-api
   ```
2. **Production Database:**  
   Use managed PostgreSQL (e.g. AWS RDS, Supabase, Neon, or Railway) and set:
   ```bash
   DATABASE_URL="postgresql://user:pass@ep-cool-db.us-east-1.aws.neon.tech/know_your_route?sslmode=require"
   npx prisma migrate deploy
   ```
3. **Production Redis:**  
   Use AWS ElastiCache, Upstash, or Redis Cloud and set `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD`.

---

## 5. Mobile Production Deployment (EAS / App Stores)

The mobile application is deployed to Google Play Store (Android) and Apple App Store (iOS) using **EAS (Expo Application Services)**.

The configuration file is located at [`apps/mobile/eas.json`](file:///Users/ravichandola/Documents/Know_Your_Route/apps/mobile/eas.json):

```json
{
  "cli": {
    "version": ">= 14.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Steps to Build Native Binaries:

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Build Android Package (`.apk` or `.aab` for Google Play):**
   ```bash
   cd apps/mobile
   eas build --platform android --profile production
   ```

3. **Build iOS Package (`.ipa` for Apple App Store / TestFlight):**
   ```bash
   cd apps/mobile
   eas build --platform ios --profile production
   ```

4. **Over-The-Air (OTA) Instant Updates:**  
   Push bug fixes to users without waiting for App Store approval:
   ```bash
   cd apps/mobile
   eas update --branch production --message "Fix route comparison card spacing"
   ```

---

## 6. Continuous Integration (GitHub Actions)

Located at `.github/workflows/ci.yml`.  
Every push and pull request runs automated verification:

```mermaid
flowchart LR
    Push["Git Push / PR"] --> Install["pnpm install"]
    Install --> Lint["pnpm lint"]
    Install --> Typecheck["pnpm typecheck"]
    Install --> Test["pnpm test"]
    Install --> Build["pnpm build"]
    
    Lint --> Pass["✅ Merge Ready"]
    Typecheck --> Pass
    Test --> Pass
    Build --> Pass
```

If any developer introduces a TypeScript error or broken test, the CI pipeline fails immediately, ensuring `main` branch stability.

---

## 🎉 Congratulations!

You now have a complete, 360-degree understanding of the **Know Your Route** platform:
- From how to launch the app on your computer in 30 seconds (`01-GETTING-STARTED.md`)
- To the high-level system architecture and data flows (`02-SYSTEM-ARCHITECTURE.md`)
- To the NestJS backend monolith & database models (`03-BACKEND-API-LAYER.md`)
- To the React Native / Expo screens and Zustand stores (`04-MOBILE-APP-LAYER.md`)
- To the shared packages and Zod validation rules (`05-SHARED-PACKAGES-LAYER.md`)
- To the provider strategy pattern and intelligence algorithms (`06-PROVIDERS-AND-INTELLIGENCE.md`)
- And finally, to deployment and store release pipelines (`07-DEVELOPMENT-AND-DEPLOYMENT.md`)

Happy coding! 🚗 ⚡
