# Copilot instructions for Third Shelf

This file gives focused, actionable guidance for AI coding agents working on this codebase.

1) Big-picture architecture
- Frontend-only React app (Vite + TypeScript) in `src/`.
- Client-side Firebase for Auth + Firestore: `src/lib/firebase.ts` exports `auth` and `db` used throughout.
- App routing and auth gating: `src/App.tsx` uses `AuthProvider` (`src/contexts/AuthContext.tsx`) and `ProtectedRoute`/`PublicRoute` patterns.
- Real-time data flows: Firestore reads use `onSnapshot` (see `src/hooks/useBooks.ts`) and writes use `addDoc`/`updateDoc`/`deleteDoc`.
- AI features call Anthropic/Claude directly from client: `src/lib/ai.ts` uses `fetch` with `VITE_CLAUDE_API_KEY` and a specific `MODEL` constant.

2) Developer workflows & commands
- Local dev: `npm run dev` (runs `vite`).
- Build: `npm run build` (= `tsc && vite build`).
- Preview production build: `npm run preview`.
- Linting: `npm run lint` (ESLint configured for `.ts,.tsx`).

3) Environment & integrations to know immediately
- Firebase env vars (required): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID` — used in `src/lib/firebase.ts`.
- Claude/Anthropic key: `VITE_CLAUDE_API_KEY` used in `src/lib/ai.ts` and called from browser (note: key lives in client env).

4) Project-specific patterns & conventions
- Contexts: Global state is provided via `src/contexts/*` (notably `AuthContext.tsx` and `ThemeContext.tsx`). Use `useAuth()` to access `user`, `loading`, and auth helpers.
- Firestore mapping: documents are converted to app `Book` objects by `toBook` in `src/hooks/useBooks.ts` — it normalizes timestamps to JS `Date` and supply defaults.
- Timestamps: writes use `serverTimestamp()` or `Timestamp.fromDate()` for date fields. When changing date handling, keep the same conversions in both read (`toBook`) and write paths.
- CSS modules: styling is modular; look for `*.module.css` alongside components (e.g., `src/pages/LibraryPage.module.css`, `src/components/books/BookCard.module.css`).
- Routing: primary routes configured in `src/App.tsx`. When adding pages, register them there and inside `components/layout/Layout.tsx` navigation will reflect them.

5) Common edit patterns & examples (copyable)
- Add a Firestore field on create (follow `addBook` pattern in `src/hooks/useBooks.ts`):

  - Use `addDoc(collection(db, 'books'), { /* payload */, created_by: user.uid, created_at: serverTimestamp() })`.

- Read timestamps back to Date (example from `toBook`):

  - `date_started: data.date_started?.toDate?.() || null`

- Call AI helper functions from a component:

  - Import `summariseNotes` / `extractThemes` from `src/lib/ai.ts` and await them; they expect plain strings and return JSON-parsable results.

6) Files to inspect for related changes
- Auth: `src/contexts/AuthContext.tsx`
- Books data & hooks: `src/hooks/useBooks.ts`, `src/components/books/*`, `src/pages/LibraryPage.tsx`
- Firebase config: `src/lib/firebase.ts`
- AI integration: `src/lib/ai.ts`
- Routing / gating: `src/App.tsx`
- Types: `src/types/index.ts` (canonical app types)

7) Safety notes & constraints for AI agents
- Do not add or expose new secret keys in client code; follow existing env var usage pattern (`import.meta.env.VITE_*`).
- Because AI calls are client-side, avoid proposing server-side secret storage changes unless the user asks.
- Keep changes conservative: match existing patterns (contexts, hooks, Firestore mapping) rather than introducing new global state systems.

If anything in these instructions is unclear or you want more examples (tests, CI, or CI lint rules), tell me which area to expand. I'll iterate. 
