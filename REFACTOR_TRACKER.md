# Sudoku Master — Refactor & Monetization Tracker

## Project Goal

Transform **Sudoku Master** from a monolithic Angular Sudoku app into a scalable, production-ready, monetizable platform with:

- Clean architecture
- Service separation
- Monetization support (Ads + Premium)
- Retention systems (Daily Challenges, Streaks)
- Future backend integration
- Better maintainability

---

# Progress Summary

| Area                    | Progress   |
| ----------------------- | ---------- |
| Regression Protection   | ✅ Done    |
| Domain Models           | ✅ Done    |
| Storage Layer           | ✅ Done    |
| Monetization Foundation | ✅ Done    |
| Component Refactor      | ⬜ Pending |
| Ad Integration          | 🟡 Partial |
| Retention Features      | ⬜ Pending |

### Overall Completion

**~65%**

---

# Refactor Roadmap

---

# Phase 1 — Foundation

## Step 1 — Regression Protection

**Status:** ✅ Completed
**Risk:** Low

### Checklist

- [x] Expand `app.spec.ts`
- [x] Add characterization tests
- [x] Test puzzle generation
- [x] Test note mode
- [x] Test mistakes
- [x] Test undo
- [x] Test pause
- [x] Test win state
- [x] Test statistics
- [x] Test hint behavior
- [x] Test rewarded ad timeout flow
- [x] Add SSR safety tests

### Deliverable

Safe regression suite before refactor.

---

## Step 2 — Extract Domain Models

**Status:** ✅ Completed
**Risk:** Low

### Files Added

- `models/game-state.ts`
- `models/ad-state.ts`
- `models/user-state.ts`

### Checklist

- [x] Move game interfaces/types
- [x] Add persisted DTOs
- [x] Add ad state models
- [x] Add premium models
- [x] Preserve compatibility imports

### Deliverable

Stable domain contracts.

---

## Step 3 — Extract StorageService

**Status:** ✅ Completed
**Risk:** Medium

### Files Added

- `services/storage.service.ts`
- `services/storage.service.spec.ts`

### Completed

- [x] Create storage service
- [x] Add storage tests
- [x] Centralize storage keys
- [x] Add SSR-safe browser checks
- [x] Add schema versioning
- [x] JSON fallback handling
- [x] Notes serialization
- [x] Save/load settings
- [x] Save/load premium state

### Pending

- [x] Save/load game progress
- [x] Restore saved game at startup

### Deliverable

Persistence abstraction.

---

# Phase 2 — Monetization Foundation

## Step 4 — AnalyticsService

**Status:** ✅ Completed
**Priority:** HIGH
**Risk:** Low

### Files

- `services/analytics.service.ts`
- `services/analytics.service.spec.ts`

### Checklist

- [x] Create analytics service
- [x] Add unit tests
- [x] Define typed events
- [x] Track app launch
- [x] Track puzzle start
- [x] Track puzzle completion
- [x] Track hint usage
- [x] Track ad display
- [x] Track session duration
- [x] Add SSR-safe browser integration

### Event Types

- `app_launch`
- `puzzle_started`
- `puzzle_completed`
- `hint_used`
- `ad_shown`
- `session_ended`
- `premium_enabled`

### Deliverable

Analytics pipeline for monetization with core event tracking now wired into app startup and session lifecycle.

---

## Step 5 — PremiumService

**Status:** ✅ Completed
**Priority:** HIGH
**Risk:** Low-Medium

### Files

- `services/premium.service.ts`
- `services/premium.service.spec.ts`

### Checklist

- [x] Create premium service
- [x] Add tests
- [x] Persist premium state
- [x] Add entitlement checks
- [x] Mock subscription provider
- [x] Prepare server verification contract

### Deliverable

Premium entitlement system foundation is in place and storage-backed.

---

## Step 6 — AdService

**Status:** ✅ Completed
**Priority:** CRITICAL
**Risk:** Medium

### Files

- `services/ad.service.ts`
- `services/ad.service.spec.ts`

### Checklist

- [x] Create ad service
- [x] Add tests
- [x] Change hints limit 3 → 4
- [x] Add rewarded credits
- [x] Add premium bypass
- [x] Add ad prompt state
- [x] Preserve 3-sec mock ad
- [x] Add interstitial eligibility
- [x] Analytics integration

### Business Rules

- 4 free hints per puzzle
- 5th hint requires rewarded ad
- Premium users bypass ads
- Rewarded ad grants 1 extra hint

### Deliverable

Monetization-ready hint gating.

---

# Phase 3 — Core Service Cleanup

## Step 7 — Refactor SudokuService

**Status:** ✅ Completed
**Priority:** HIGH
**Risk:** Medium

### Checklist

- [x] Move to `services/sudoku.service.ts`
- [x] Reduce responsibilities
- [x] Delegate storage
- [x] Delegate analytics
- [x] Delegate premium
- [x] Delegate ads
- [x] Extract sudoku-grid utilities
- [x] Add readonly signals
- [x] Improve SSR safety
- [x] Fix timer cleanup

### Architectural Outcome

SudokuService now functions as a thin orchestration layer: it coordinates gameplay state and user interactions while delegating persistence, analytics, premium checks, ad behavior, and grid-logic helpers to dedicated services and utilities.

### Deliverable

Thin orchestration service.

---

# Phase 4 — Component Extraction

## Step 8 — Split Components

**Status:** ✅ Completed
**Risk:** Medium

### Components

- [x] StatsPanel
- [x] NumberPad
- [x] Toolbar
- [x] SudokuBoard
- [x] HintModal

### Deliverable

Modular UI architecture.

---

## Step 9 — Localize Styling

**Status:** ✅ Completed
**Risk:** Medium

### Checklist

- [x] Move board styles
- [x] Move toolbar styles
- [x] Move keypad styles
- [x] Preserve global theme styles
- [x] Validate responsiveness

### Deliverable

Component-level styling.

---

# Phase 5 — Ad Provider Integration

## Step 10 — Monetization SDK Integration

**Status:** ⬜ Pending
**Priority:** CRITICAL

### Checklist

- [ ] Create ad provider interface
- [ ] Add mock provider
- [ ] Reserve banner slots
- [ ] Rewarded ad provider
- [ ] Interstitial provider
- [ ] Premium suppression
- [ ] Consent integration

### Recommended Providers

- Google AdSense
- Google Ad Manager

### Deliverable

Real ad monetization.

---

# Phase 6 — Retention Features

## Step 11 — Growth Systems

**Status:** ⬜ Future

### Features

- [ ] Daily challenges
- [ ] Streak system
- [ ] Achievements
- [ ] Leaderboards
- [ ] Cloud sync
- [ ] Puzzle identity
- [ ] Completion history

### Deliverable

Retention + engagement loops.

---

# Commit Tracker

- [x] Commit 1 — Regression tests + Domain models
- [x] Commit 2 — Storage service
- [ ] Commit 3 — Analytics service
- [ ] Commit 4 — Premium service
- [ ] Commit 5 — Ad service
- [ ] Commit 6 — SudokuService cleanup
- [ ] Commit 7 — Component extraction
- [ ] Commit 8 — Monetization SDK

---

# AI Refactor Workflow

After every step:

```bash
npm run lint
npm run test
npm run build
```

If all pass:

```bash
git add .
git commit -m "meaningful commit message"
```

---

# Resume Point (Next Weekend)

## Start from:

### Step 4 — AnalyticsService

Current branch is ready to continue from analytics extraction.
