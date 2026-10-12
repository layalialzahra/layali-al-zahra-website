# Layali Al Zahra CMS Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable safe admin management of services, offers, packages, FAQs and selected Google reviews while preserving the current public site.

**Architecture:** Implement the core structured content CMS first, then the external Google Reviews integration, then the crawlable homepage integration. Each subsystem has its own plan and acceptance gate. Reuse the current Vercel API, MongoDB, admin session and Blob upload patterns; retain the current hard-coded public content until migration is verified and cutover is explicitly approved.

**Tech Stack:** React 18, TypeScript, Vite, Vercel serverless functions, MongoDB Atlas, Vercel Blob. Introduce a small test setup only after confirming compatibility with the current Vite config.

**Spec:** `docs/superpowers/specs/2026-10-12-layali-cms-expansion-design.md`

## Global Constraints

- Preserve current public design, routes, booking URLs, content and existing Blog/Beauty Tips/News behavior.
- Reuse `api/_lib/auth.js`, `api/_lib/mongodb.js`, existing admin UI patterns and Blob upload endpoint where appropriate.
- Admin write routes require an authenticated admin and same-origin validation.
- Public routes expose published records only.
- Google sync and review publishing are separate actions; selecting a review does not publish it.
- Local review deletion must never modify Google and must not silently reappear on sync.
- Do not change the public source of truth until migration and acceptance checks pass.
- Do not claim a test, deployment, API access or live-state check unless it was actually performed.
- Avoid unrelated cleanup, especially tracked `node_modules/` and `build/`; minimise coherent commits and do not push feature implementation to `main` without release approval.
- Repository is public; the owner has chosen to keep it public until project completion. Treat this as an accepted risk, never commit secrets, and do not change visibility without instruction.

## Review Focus

1. Existing price labels such as “AED 99.75” and “From” values must display unchanged rather than being coerced into numbers.
2. Recurring offer labels such as “Every Monday” must not be treated as date expiry values.
3. Existing public content must remain visible if MongoDB is unavailable, migration is incomplete or the feature has not been approved for cutover.
4. An unauthenticated or cross-origin write must not mutate a managed-content collection.
5. A failed Google sync or deleted local review must not clear, republish or unexpectedly restore the homepage review set.

## Plan set and order

1. **Core CMS:** [Core content modules plan](2026-10-12-layali-core-cms.md)
2. **Reviews:** [Google Reviews sync and publishing plan](2026-10-12-layali-google-reviews.md) — depends on core CMS patterns and verified API access.
3. **SEO/cutover:** [Homepage crawlability and migration plan](2026-10-12-layali-crawlability-cutover.md) — depends on core CMS and review publishing; the rendering approach must be validated before implementation.

Do not begin a downstream plan until its dependency and the relevant open decisions are satisfied. Each plan ends with a review gate; no plan authorises production cutover by itself.

## Cross-plan release gates

- [x] Owner authorised proceeding with the next planned task on 2026-10-12.
- [x] Repository visibility state and owner decision recorded: remain public until project completion. The implementation branch is `feat/layali-managed-content-cms`; production deployment/cutover remains prohibited without verification and approval.
- [x] Add and verify `npm test` in GitHub Actions (Node.js 20); tests and build passed on commit `bdc0fcb1b64b158b052390b5f2061a2ddd589267`.
- [ ] Confirm Google Business Profile API/OAuth access before building live sync.
- [ ] Decide review deletion suppression and source-edit/removal behavior before sync acceptance.
- [ ] Validate the least invasive crawlable rendering approach against current Vite/Vercel deployment.
- [ ] Owner explicitly approves migration/cutover after staging verification.

---