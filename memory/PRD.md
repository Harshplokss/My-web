# Treasure Hunt — PRD

## Problem Statement (original)
Modern, responsive full-stack login-based challenge platform where users progress through 5 gated levels by solving riddles, puzzles, and multiple-choice/text/image questions. Includes admin dashboard, progress tracking, anti-cheating, leaderboard, badges, certificate of completion, and final-level celebration (confetti + fireworks + applause + secret reveal).

## Stack (adapted to environment)
- Frontend: React 19 + Tailwind + Framer Motion + lucide-react + react-confetti + jsPDF
- Backend: FastAPI (Python) + Motor (async MongoDB)
- Auth: Emergent-managed Google OAuth
- DB: MongoDB

## User Personas
1. **Player** – signs in with Google, plays through 5 gated levels, earns badges + certificate.
2. **Admin** – first user to sign in (or any email in `ADMIN_EMAILS`), manages levels/questions/users.

## Core requirements (from problem statement)
- 5 levels, gated sequentially.
- Multiple question types: multiple_choice, text, image, puzzle, riddle.
- Wrong answer → "Try Again" (no reveal). Correct → success + advance.
- Progress saved in DB; resumes on re-login.
- Anti-cheat: backend enforces lock/unlock; never returns answers in payloads.
- Admin CRUD on levels/questions, view/reset users, export CSV.
- Final level: confetti + fireworks + applause + certificate (PDF download), reveals final answer + secret message.
- Dark cinematic theme with glassmorphism, floating particles, gold accents, premium typography.

## Implemented (2026-02)
- ✅ Auth (Emergent Google OAuth) with httpOnly cookie + Bearer fallback.
- ✅ Models: User, Session, Level, Question, Progress, Settings.
- ✅ API: auth/session, auth/me, auth/logout, levels list, get current question, submit answer, progress, leaderboard, final reveal.
- ✅ Admin API: CRUD levels & questions, list/reset users, CSV export, final settings.
- ✅ Seed script with user-provided riddles + secret word `ecmcf`.
- ✅ Frontend pages: Landing, AuthCallback, Dashboard, LevelPlay, Celebration, Leaderboard, Admin.
- ✅ Visual: glassmorphism cards, gold palette, floating particles, framer-motion entrance animations, sound effects on success, confetti + fireworks + applause for final.
- ✅ Certificate PDF download (jsPDF + html2canvas).
- ✅ Anti-cheating: backend validates current_level + completed_levels on every question/answer endpoint.
- ✅ Data-testid attributes on all interactive elements.

## Backlog / Next
- P1: Timer per question (optional toggle in admin).
- P1: Daily streak tracking.
- P2: Image upload from admin panel (currently URL-based).
- P2: Email notifications on completion (Resend).
- P2: Social share buttons after winning.

## Files map
- Backend: `/app/backend/server.py`, `/app/backend/seed.py`
- Frontend: `/app/frontend/src/App.js`, `/app/frontend/src/pages/*`, `/app/frontend/src/components/*`
- Memory: `/app/memory/PRD.md`, `/app/memory/test_credentials.md`
