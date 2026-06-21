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
| Storage Layer           | 🟡 Partial |
| Monetization Foundation | ⬜ Pending |
| Component Refactor      | ⬜ Pending |
| Ad Integration          | ⬜ Pending |
| Retention Features      | ⬜ Pending |

### Overall Completion

**~28%**

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

**Status:** 🟡 Partially Completed (Step 3A done)
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

- [ ] Save/load game progress
- [ ] Restore saved game at startup

### Deliverable

Persistence abstraction.

---

# Phase 2 — Monetization Foundation

## Step 4 — AnalyticsService

**Status:** ⬜ Pending
**Priority:** HIGH
**Risk:** Low

### Files

- `services/analytics.service.ts`
- `services/analytics.service.spec.ts`

### Checklist

- [ ] Create analytics service
- [ ] Add unit tests
- [ ] Define typed events
- [ ] Track app launch
- [ ] Track puzzle start
- [ ] Track puzzle completion
- [ ] Track hint usage
- [ ] Track ad display
- [ ] Track session duration
- [ ] Add SSR guards

### Event Types

- `app_launch`
- `puzzle_started`
- `puzzle_completed`
- `hint_used`
- `ad_shown`
- `session_ended`
- `premium_enabled`

### Deliverable

Analytics pipeline for monetization.

---

## Step 5 — PremiumService

**Status:** ⬜ Pending
**Priority:** HIGH
**Risk:** Low-Medium

### Files

- `services/premium.service.ts`
- `services/premium.service.spec.ts`

### Checklist

- [ ] Create premium service
- [ ] Add tests
- [ ] Persist premium state
- [ ] Add entitlement checks
- [ ] Mock subscription provider
- [ ] Prepare server verification contract

### Deliverable

Premium entitlement system.

---

## Step 6 — AdService

**Status:** ⬜ Pending
**Priority:** CRITICAL
**Risk:** Medium

### Files

- `services/ad.service.ts`
- `services/ad.service.spec.ts`

### Checklist

- [ ] Create ad service
- [ ] Add tests
- [ ] Change hints limit 3 → 4
- [ ] Add rewarded credits
- [ ] Add premium bypass
- [ ] Add ad prompt state
- [ ] Preserve 3-sec mock ad
- [ ] Add interstitial eligibility
- [ ] Analytics integration

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

**Status:** ⬜ Pending
**Priority:** HIGH
**Risk:** Medium

### Checklist

- [ ] Move to `services/sudoku.service.ts`
- [ ] Reduce responsibilities
- [ ] Delegate storage
- [ ] Delegate analytics
- [ ] Delegate premium
- [ ] Delegate ads
- [ ] Extract sudoku-grid utilities
- [ ] Add readonly signals
- [ ] Improve SSR safety
- [ ] Fix timer cleanup

### Deliverable

Thin orchestration service.

---

# Phase 4 — Component Extraction

## Step 8 — Split Components

**Status:** ⬜ Pending
**Risk:** Medium

### Components

- [ ] StatsPanel
- [ ] NumberPad
- [ ] Toolbar
- [ ] SudokuBoard
- [ ] HintModal

### Deliverable

Modular UI architecture.

---

## Step 9 — Localize Styling

**Status:** ⬜ Pending
**Risk:** Medium

### Checklist

- [ ] Move board styles
- [ ] Move toolbar styles
- [ ] Move keypad styles
- [ ] Preserve global theme styles
- [ ] Validate responsiveness

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
