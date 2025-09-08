# TEST_GUIDE

## Unit (Jest-Expo)

- Test public contracts of hooks/services.
- Place `*.test.ts` next to implementation file.
- Structure: Arrange → Act → Assert.
- Mock Supabase/network calls explicitly.

## Integration

- For navigation flows: test with `@react-navigation/native-testing`.
- Verify Zustand store updates in response to actions.

## E2E (optional)

- Use Detox/Expo Test when critical flows need full coverage (auth, deck CRUD, study session).

## Rules

- Each new feature: at least 1–2 unit tests.
- Screens with critical logic: add integration test.
- Always validate types and error cases in tests.
