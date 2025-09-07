# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Expo Router screens (e.g., `app/(app)/index.tsx`, `app/deck/[id].tsx`, `app/study/[deckId].tsx`).
- `src/components/`: Reusable UI and feature components (e.g., deck, flashcards, menus).
- `src/hooks/`: React hooks for state, data loading, and side effects.
- `src/services/`: Platform and data services (SQLite local DB, Supabase, storage, sync).
- `src/theme/`: Theming utilities (`useAppTheme`, `ThemedContainer`, `ThemedSurface`).
- `src/store/`: Zustand stores (auth, app init, theme).
- `assets/`: Images, fonts, static resources.
- `tests/` (if present): Jest tests colocated or grouped by feature.

## Build, Test, and Development Commands
- `npm run start`: Start Expo bundler (choose platform on launch).
- `npm run dev`: Start Expo with dev client.
- `npm run ios` / `npm run android` / `npm run web`: Run platform targets.
- `npm run test`: Run Jest tests (via `jest-expo`).
- `npm run lint` / `npm run lint:fix`: Lint code and auto-fix issues.
- `npm run typecheck`: TypeScript type checking without emit.
- `npm run build`: Export production build (Expo EAS not covered here).
- `npm run clean`: Clear Expo cache and restart.

## Coding Style & Naming Conventions
- Language: TypeScript, React/React Native.
- Indentation: 2 spaces; prefer explicit types for public APIs.
- Components: PascalCase files and exports (e.g., `DeckOptionsMenu.tsx`).
- Hooks: `useThing` naming, colocate with features where practical.
- Paths: Use `@/` alias for imports from `src/`.
- Linting: `eslint-config-expo`, `@typescript-eslint` rules; run `npm run lint` before PRs.

## Testing Guidelines
- Framework: Jest + `jest-expo`.
- Place tests near code or in `__tests__` with `*.test.ts(x)` naming.
- Keep tests deterministic; mock network/async boundaries (Supabase, FileSystem).
- Run `npm run test` locally; ensure new logic is covered by unit tests where feasible.

## Commit & Pull Request Guidelines
- Commits: Short imperative subject (<=72 chars), concise body when needed.
- Scope examples: `ui:`, `hooks:`, `services:`, `theme:`, `fix:`.
- PRs must include: purpose/summary, linked issues, screenshots for UI changes, test plan (commands + outcomes).
- Keep diffs focused; follow existing patterns (e.g., theming via `useAppTheme`, menu via `OptionsMenu`).

## Security & Configuration Tips
- Do not commit secrets; use `.env` and `app.config.ts` extras for Supabase keys/URLs.
- Use `expo-secure-store` for tokens; prefer `AFTER_FIRST_UNLOCK` accessibility on iOS.
