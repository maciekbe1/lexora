# AI_TASKS

## Roles

- feature → implement new logic/screens/components.
- reviewer → refactor/cleanup existing code.
- stylist → focus on UI, Tailwind/NativeWind, a11y.
- tests → create/update tests for features.

## Routing

- New functionality → feature.
- Editing/refactoring existing code → reviewer.
- Styling/UX/accessibility only → stylist.
- Testing only → tests.

## Output format

\[AGENT: \<feature\|reviewer\|stylist\|tests\>\] \[PLAN\] - steps
\[PATCH\]

```diff
# unified diff
```

\[WHY\] - reasoning \[LOG\] - summary of changes
