# UI_GUIDE

## General

- Use **Tailwind CSS via NativeWind** or Expo styling utilities.
- Classes order: layout → spacing → typography → color → state.
- Prefer utility classes, avoid inline styles duplication.

## Components

- Presentational components: no business logic.
- Accessible: add `aria` / accessibilityLabel for interactive elements.
- Respect safe areas (`react-native-safe-area-context`).

## Navigation

- Use `expo-router` conventions (stack, tabs).
- Screens under `/app/`.
- Keep screen logic thin, delegate to hooks/services.

## Responsiveness

- Support mobile primarily; web fallback OK.
- Use flex layouts, avoid fixed widths.

## Preferences

- Stick to consistent spacing scale.
- Buttons/inputs follow design system pattern.
