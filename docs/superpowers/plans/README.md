# Layali CMS implementation plan index

Read the approved design specification before any plan. Read the Notion project hub's four child pages — `decisions.md`, `stages.md`, `log.md`, `agents.md` — before every implementation task.

## Order

1. [Core Content CMS](2026-10-12-layali-core-cms.md): services, offers, packages, FAQs, CRUD APIs, migration snapshots and admin UI.
2. [Google Reviews](2026-10-12-layali-google-reviews.md): API prerequisite gate, sync, explicit publish/unpublish and local deletion.
3. [Homepage Crawlability and Cutover](2026-10-12-layali-crawlability-cutover.md): rendering feasibility, crawler-facing HTML, one-family-at-a-time migration and release gates.

The master plan is [Layali CMS Expansion](2026-10-12-layali-cms-expansion.md).

## Approval boundary

These are planning documents only. They do not authorise code implementation, production data migration, deployment or public cutover. The owner must review and approve the plan set first. Google sync work must stop if required API access is not verified. Rendering implementation must stop for owner review if the feasibility spike requires a broad architectural change.