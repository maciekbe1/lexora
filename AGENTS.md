# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Expo Router screens (e.g., `app/(app)/index.tsx`, `app/deck/[id].tsx`, `app/study/[deckId].tsx`).
- `src/components/`: Reusable UI and feature components (deck, flashcards, menus).
- `src/hooks/`: React hooks for state, data loading, side effects.
- `src/services/`: Platform/data services (SQLite, Supabase, storage, sync).
- `src/theme/`: Theming utilities (`useAppTheme`, `ThemedContainer`, `ThemedSurface`).
- `src/store/`: Zustand stores (auth, app init, theme).
- `assets/`: Images, fonts, static resources.
- `tests/` (if present): Jest tests colocated or grouped by feature.

## Build, Test, and Development Commands
- `npm run start`: Start Expo bundler; choose platform on launch.
- `npm run dev`: Start Expo with dev client.
- `npm run ios` / `android` / `web`: Run platform targets.
- `npm run test`: Run Jest tests via `jest-expo`.
- `npm run lint` / `lint:fix`: Lint code and auto-fix issues.
- `npm run typecheck`: TypeScript type checking (no emit).
- `npm run build`: Export production build.
- `npm run clean`: Clear Expo cache and restart.

## Coding Style & Naming Conventions
- **Language**: TypeScript, React/React Native; 2-space indentation.
- **Components**: PascalCase files/exports (e.g., `DeckOptionsMenu.tsx`).
- **Hooks**: `useThing` naming, colocate with features when practical.
- **Imports**: Use `@/` alias for `src/` (e.g., `import { OptionsMenu } from '@/components/menus';`).
- **Linting**: `eslint-config-expo`, `@typescript-eslint`; run `npm run lint` before PRs.
- **APIs**: Prefer explicit types for public APIs.

## Testing Guidelines
- **Framework**: Jest + `jest-expo`.
- **Location/Names**: Near code or in `__tests__`, `*.test.ts(x)`.
- **Determinism**: Mock network/async boundaries (Supabase, FileSystem, storage).
- **Run**: `npm run test`; keep tests fast and isolated.

## Commit & Pull Request Guidelines
- **Commits**: Short imperative subject (≤72 chars). Use scopes (e.g., `ui:`, `hooks:`, `services:`, `theme:`, `fix:`). 
- **PRs must include**: Purpose/summary, linked issues, screenshots for UI changes, and a test plan (commands + outcomes).
- **Diffs**: Keep focused; follow existing patterns (theming via `useAppTheme`, menu via `OptionsMenu`).

## Security & Configuration Tips
- Do not commit secrets; use `.env` and `app.config.ts` extras for Supabase keys/URLs.
- Store tokens in `expo-secure-store`; prefer `AFTER_FIRST_UNLOCK` on iOS.
- Review configs before release; avoid logging sensitive data in production.

