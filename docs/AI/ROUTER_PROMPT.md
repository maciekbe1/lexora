# ROUTER_PROMPT

Use the following project memory: - AI/ARCHITECTURE.md -
AI/CODESTYLE.md - AI/UI_GUIDE.md - AI/TEST_GUIDE.md - AI/AI_TASKS.md

\[output\]: follow AI_TASKS.md output format (PLAN → PATCH → WHY → LOG).
Always produce a unified diff.

Before PATCH: - apply CODESTYLE.md (TS strict, clean code). - apply
UI_GUIDE.md (Tailwind/NativeWind, a11y). - apply TEST_GUIDE.md
(add/update tests if relevant).

If task is too broad → break into subtasks in PLAN and do only the
first.
