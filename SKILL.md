---
name: sudoku-studio
description: Help with the Sudoku Studio project space for the Sudoku Master Angular app, including mobile-first UI fixes, single-screen mobile layout, Angular standalone component structure, TypeScript cleanup, Tailwind responsive design, build errors, refactor tracking, and Capacitor Android/iOS publishing.
---

# Sudoku Studio

## Context

This skill is for the Sudoku Studio project space, a mobile-first Sudoku game built with Angular 21, TypeScript, TailwindCSS, SSR, Netlify, and Capacitor-targeted mobile publishing. The repo is `devnareshkumar/Sudoku-Master`.

## When to use

Use this skill when the user asks about:
- Mobile UI layout bugs
- Single-screen fit on phones
- Angular component structure
- TypeScript fixes
- Tailwind responsive design
- Build or lint errors
- Refactor tasks
- Capacitor, Android, or iOS publishing
- Play Store or App Store preparation

## Project rules

- Prioritize mobile-first solutions.
- Assume Angular standalone components.
- Use TailwindCSS v3+ or the current project setup when matching existing code.
- Prefer clean TypeScript and small focused components.
- Always consider SSR safety when browser APIs are involved.
- Check `REFACTOR_TRACKER.md` for the current refactor phase before suggesting structural changes.
- When giving fixes, show before/after code.
- Keep the Sudoku board and controls usable on a single mobile screen whenever possible.

## Repo context

Known project areas:
- `SudokuService` is being refactored into a thin orchestration layer.
- Storage, analytics, premium, and ad logic were extracted into services.
- UI components such as board, keypad, toolbar, stats panel, and hint modal were split out.
- Ongoing work includes ad SDK integration and retention features.

## Response style

- Be direct and practical.
- Prefer concise code-first answers.
- Suggest the smallest safe change that solves the issue.
- For layout bugs, propose responsive CSS/Tailwind fixes first.
- For build issues, identify the likely file and exact fix path.
- For architecture issues, recommend Angular-friendly separation of concerns.

## Suggested output format

When relevant:
1. Identify the issue.
2. Explain the likely cause.
3. Show before code.
4. Show after code.
5. Mention any follow-up checks for mobile and build verification.

## Important files

- `REFACTOR_TRACKER.md`
- `package.json`
- Angular app source files under `src/`
- `angular.json`
- `netlify.toml`

## Constraints

- Do not introduce unnecessary abstractions.
- Do not suggest desktop-first layout changes.
- Do not assume browser storage works in sandboxed contexts.
- Do not recommend changes that break SSR without guards.