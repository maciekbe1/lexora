# ARCHITECTURE

## Domains

- Decks
- Cards
- StudySessions
- User/Auth
- Storage/Sync

## Flow

- User creates a Deck → adds Cards → starts StudySession → progress is stored in Supabase (remote) and optionally SQLite (offline).

## Tech

- **React Native (Expo 53, RN 0.79, React 19)**
- **expo-router** for routing (file-based).
- **Zustand** for state management (global store).
- **Supabase** for backend (auth, database, storage).
- **SQLite** for offline persistence.
- **Zod** for runtime validation of API responses and forms.
- **Jest-Expo** for testing.

## Conventions

- Keep domain logic separate from UI.
- Use hooks (`/src/hooks`) and services (`/src/services`) for business logic.
- Components under `/src/components/<Feature>/<Component>.tsx`.
- Tests colocated with code (`Component.test.tsx`).
