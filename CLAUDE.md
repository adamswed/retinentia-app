# Retinentia App — Claude Code Context

## Overview
A Next.js flashcard/index card application. Users create, flip, edit, and delete
index cards with terms and definitions. Includes AI-powered definition lookup via
Vertex AI and Wikipedia/Wiktionary lookups.

## Tech Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Auth**: Firebase Auth (email/password, Google, GitHub OAuth)
- **Database**: Firestore (via Firebase Admin SDK on server, Firebase client SDK on client)
- **AI**: Vertex AI via `firebase/vertex.ts`
- **Styling**: SASS Modules (`.module.scss` co-located with components)
- **Forms**: react-hook-form + Zod for validation
- **Rich text**: react-quill-new (for card definitions)
- **Security**: xss sanitization, ReCAPTCHA v3 on registration, Upstash Redis (rate limiting)

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint check

## Project Structure

    actions/          # Next.js server actions ('use server') — Firebase Admin calls go here
    app/              # App Router pages and layouts
      (auth)/         # Auth pages: sign-in, sign-up, forgot-password, email-sign-in
      (terms)/        # Static pages: privacy policy, terms
      account/        # Account management: update password, delete account
      api/            # Route handlers: /api/consent, /api/refresh-token
      main/           # Main app page (index card view)
      welcome/        # Welcome/onboarding page
    components/       # All UI components, grouped by feature
    context/          # React Context providers (see State Management below)
    firebase/
      client.ts       # Firebase client SDK init
      server.ts       # Firebase Admin SDK init (Firestore + Auth)
      vertex.ts       # Vertex AI client
    lib/
      constants.ts    # App-wide constants (MAX_INDEX_CARDS=300, quotas, versioned dates)
      utils.ts        # Shared utility functions
      wikimedia/      # Wikimedia API auth
    models/           # TypeScript interfaces and types
      index-cards.model.ts  # IndexCard, InitialState, ReducerAction, CardContext types
      actions.model.ts      # CARD_ACTIONS enum for useReducer
    validation/
      xss-config.ts   # XSS sanitizers: sanitizePlainText(), sanitizeQuillContent()
      indexCard.ts    # Zod schema for card data
      registerUser.ts # Zod schema for registration
      account.ts      # Zod schema for account updates
    styles/           # Global styles and shared SASS

## State Management
The app uses React Context + useReducer for card list state and useState for UI state.
There are 5 active context providers:

| File | Purpose |
|---|---|
| `context/auth-context.tsx` | Firebase Auth state, login/logout methods, custom claims |
| `context/card-list-context.tsx` | Index card list — useReducer with CARD_ACTIONS |
| `context/card-context.tsx` | Per-card UI state (flip, edit mode, delete, swipe, speech) |
| `context/device-context.tsx` | Device/viewport detection |
| `context/message-modal-context.tsx` | Global modal/toast messages |

`card-list-context.tsx` is the primary candidate for Zustand migration — it holds
`IndexCard[]`, list length, list mode, and scroll prevention via useReducer.

## Auth Architecture
- Client-side: Firebase Auth SDK (`firebase/client.ts`)
- Server-side: Firebase Admin SDK (`firebase/server.ts`) — token verification on every server action
- Session cookies managed via `/api/refresh-token` route
- Every server action verifies the Firebase ID token before touching Firestore
- Pattern: all server actions accept `authToken: string` and call `auth.verifyIdToken()`

## Security Rules — Do Not Change Without Careful Review
- `validation/xss-config.ts` — All card input is sanitized before Firestore writes
- ReCAPTCHA v3 is required on registration (do not remove `recaptcha-provider.tsx`)
- Token verification must remain on every server action in `actions/`
- `jose` library is used for JWT handling in API routes

## Key Constants (`lib/constants.ts`)
- `MAX_INDEX_CARDS = 300` — hard cap per user
- `MAX_DAILY_AI_DEFINITION_QUOTA = 300` — Vertex AI daily limit
- `TERMS_VERSION` / `PRIVACY_VERSION` — used for consent tracking

## Coding Conventions
- Files: kebab-case (`card-button.tsx`, `card-button.module.scss`)
- Components: PascalCase (`CardButton`)
- Server actions: camelCase function names, always top-level in `actions/` files
- No `any` in TypeScript — use proper types from `models/`
- Co-locate styles: every component with styles has a `.module.scss` beside it
- `'use server'` at top of all files in `actions/`
- `'use client'` at top of context files and interactive components

## Planned Migrations (In-Progress / Upcoming)
Implement in this order — each step builds on the previous:

1. **Cypress E2E tests** — implementation-agnostic; survives all refactors; provides safety net for everything below
2. **Zustand migration** — `context/card-list-context.tsx` → Zustand store; E2E covers regressions
3. **Tailwind CSS** — replace SASS modules; no test setup exists yet
4. **Shadcn UI** — depends on Tailwind being in place first
5. **Jest unit tests** — write after architecture stabilizes so they only need to be written once
6. **Refactor** — clean up once everything above is stable and tested
