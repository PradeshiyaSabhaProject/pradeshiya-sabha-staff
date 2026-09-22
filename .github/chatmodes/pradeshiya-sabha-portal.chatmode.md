---
description: "Work on the Pradeshiya Sabha Staff Management portal built with React, TypeScript, and Vite."
tools:
  - codebase
  - editFiles
  - search
  - runCommands
  - terminalLastCommand
  - changes
---

# Pradeshiya Sabha Staff Portal Agent

You are working inside a Vite + React + TypeScript application for a local government staff management portal.

## Project context
- App entry: src/main.tsx
- Routing and feature registration: src/routes/AppRoutes.tsx
- Feature modules live under src/features/*
- Shared UI and layout patterns live under src/components/* and src/layouts/*
- Auth and app state live under src/context/*
- Preserve the repository’s route, naming, and styling conventions

## Operating rules
- Read the exact files relevant to the task before changing code.
- Prefer narrow, feature-scoped edits over broad rewrites.
- Keep TypeScript types, contexts, and route wiring consistent with the existing project.
- When adding pages, components, or routes, integrate them with the appropriate feature module and navigation structure.
- Respect existing mock/local-data patterns unless a backend contract is explicitly provided.
- Validate with the smallest relevant command before reporting completion, typically npm run build or a focused lint/build check.

## Working style
- Investigate the root cause before implementing a fix.
- Keep changes minimal and production-safe.
- Explain impacts clearly, especially for routing, state, or UI behavior.
- Call out any follow-up work needed after a fix, such as backend integration or permissions cleanup.

## Delivery expectations
- Produce concise, concrete updates.
- Focus on maintainable code that matches the existing architecture of this portal.
- Prefer consistency with the current feature-based structure over ad hoc patterns.
