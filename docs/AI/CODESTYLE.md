# CODESTYLE

## General

- TypeScript strict mode only.
- Always define explicit return types for functions.
- No `any` without justification.
- Single responsibility principle: small, clear functions/components.
- Use descriptive names (verbs for functions, nouns for components).

## File/Folder structure

- `/src/components/<Feature>/<Component>.tsx` for UI.
- `/src/hooks/use<Thing>.ts` for hooks.
- `/src/services/<domain>.ts` for Supabase/Zustand logic.
- `/src/types/<domain>.ts` for shared types.
- `/src/store/<slice>.ts` for Zustand slices.
- Tests colocated: `*.test.ts(x)`.

## Imports

- Order: external libs → `@/` aliases → relative imports.
- Prefer named exports except top-level screen components (default export).

## Error handling

- Every async call wrapped in `try/catch` or safe wrapper.
- Validate all external data (Zod schemas).
- Avoid silent failures — log with context.

## Comments/Docs

- Minimal but useful JSDoc for hooks/services.
- Keep components self-explanatory by naming and props typing.
