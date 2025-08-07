# Typing Trainer App - Development Checklist

## Project Overview
Building a typing practice app modeled after Monkeytype and Mavis Beacon, following the master protocol for solo developer with no budget.

## PHASE 1: Environment Bootstrapping
- [x] Scaffold Vite + React + Tailwind CSS project
- [x] Set up folder structure:
  - [x] `/components/`
  - [x] `/hooks/`
  - [x] `/pages/`
  - [x] `/utils/`
  - [x] `/tests/`
  - [x] `/data/` for static JSON
- [x] Install essential dev tools:
  - [x] ESLint
  - [x] Prettier
  - [x] Vitest (optional)

## PHASE 2: Typing Engine Core
- [x] Build `TypingTestEngine` component:
  - [x] Accepts text blocks
  - [x] Handles key events using `onKeyDown`
  - [x] Calculates WPM, accuracy, and error count in real time
  - [x] Displays inline typing feedback (color-coded)
- [x] Integrate test data loader from static JSON in `/data/`
- [x] Add lowercase-only typing mode

## PHASE 3: Mode Management
- [x] Create a test selector UI (`ModeSelector` component)
- [x] Add configuration schema for TypingMode interface
- [x] Add support for:
  - [x] Punctuation and capitalization mode
  - [x] Programming code snippets (JS/Python syntax-sensitive)
  - [x] Simulated table-entry mode (form-like structure, tab key support)

## PHASE 4: UI and Layout
- [x] Build layout system:
  - [x] Header with user dummy profile and stats
  - [x] Typing test section
  - [x] Settings and mode switcher
- [x] Create mobile and accessibility-friendly layout
- [x] Ensure no mouse is needed to complete any test

## PHASE 5: User & Persistence (Local)
- [x] Build a dummy login system with localStorage-based JWT
- [x] Create `/pages/Profile.tsx` to show user stats
- [x] Save completed test data to localStorage as JSON

## PHASE 6: Backend API (Optional Expansion)
- [ ] Scaffold Node.js + Express server
- [ ] Create endpoints:
  - [ ] `GET /tests`
  - [ ] `POST /submit`
  - [ ] `GET /user/history`
- [ ] Use SQLite locally; plan migration to PostgreSQL if needed

## PHASE 7: Deployment
- [ ] Deploy frontend to Netlify/Vercel
- [ ] Deploy backend (if needed) to Render or Railway
- [ ] Ensure CORS settings and environment variables are handled correctly

## Completion Criteria
- [ ] At least 3 typing modes working
- [ ] Test results stored and retrieved locally
- [ ] Fully keyboard-navigable UI
- [ ] Deployment to free-tier platform completed
- [ ] App tested in latest Chrome + Firefox

## Tech Stack
- **Frontend:** React (Vite) + Tailwind CSS
- **State:** Zustand or Context API
- **Backend:** Node.js + Express (expandable to Supabase/Postgres)
- **Database:** SQLite (local) → PostgreSQL (production)
- **Deployment:** Netlify/Vercel (frontend), Railway/Render (backend)

## Global Constraints
- Solo developer, no budget
- Keyboard-first user experience
- No multiplayer
- User account support via placeholders
- Frontend-first MVP with expandable backend
- Deployable using free-tier services only
