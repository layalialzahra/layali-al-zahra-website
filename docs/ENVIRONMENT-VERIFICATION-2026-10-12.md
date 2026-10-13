# Task 02 — Non-production environment and database verification

**Date:** 2026-10-12  
**Repository/branch reviewed:** `layalialzahra/layali-al-zahra-website` / `feat/layali-managed-content-cms`  
**Starting checkpoint:** `aa6a8a43cdf029340fb8145023c97db0cf4892de` (Task 01 final checkpoint; documentation updates made after this point move the branch HEAD).  
**Outcome:** **BLOCKED — no currently authorised and isolated non-production environment/database could be verified.** The environment-discovery task is documented; CMS runtime acceptance remains blocked.

## Objective and safety constraints

Identify an authorised non-production target and verify its actual hosting project, URL, environment configuration, database identity, access and isolation from production before testing CMS CRUD, authentication, uploads, public reads or migration. Do not reconnect Vercel, deploy, migrate production, or substitute the production environment for staging.

## Evidence inspected

1. **Project records:** Reviewed the Notion Project Hub, decisions, stages, Short Task List and Task Updates & Logs, plus the GitHub CMS status checkpoint, Admin CMS BRD, Core CMS implementation plan and repository environment/configuration files.
2. **Repository environment template — `.env.example`:** Contains a placeholder `MONGODB_URI`, sets `MONGODB_DB_NAME=layalialzahra`, and includes placeholders for admin/session and Google Business Profile settings. It does not identify a staging cluster, staging database name, environment-specific credentials or a verified isolated test target. The URI is a placeholder, not evidence of connectivity.
3. **Database connection helper — `api/_lib/mongodb.js`:** Reads `process.env.MONGODB_URI` and uses `process.env.MONGODB_DB_NAME || "layalialzahra"`. The code does not enforce that Preview/staging must use a separate cluster/database, nor does it refuse to run when an environment is incorrectly pointed at production. Therefore code configuration alone cannot prove isolation.
4. **Historical BRD evidence — `docs/ADMIN-CMS-BRD.md`:** Records that the existing CMS's MongoDB Atlas production connection uses database `layalialzahra`, and that the newer Vercel project had MongoDB/admin variables configured in both Production and Preview. It also records a previously healthy “staging admin service”. However, the record does not provide a currently verified Vercel project identity, active deployment/URL, current environment-variable mapping, a distinct Preview/staging database identity, or proof that Preview cannot write to production. The mention of variables in both Production and Preview is a specific isolation risk that must be resolved, not proof that the values are the same or different.
5. **Current owner instruction:** Vercel is intentionally disconnected and current feature-branch changes are not deployed. Do not reconnect it during implementation to investigate or test.
6. **Provider-level access:** The available connected tools in this task do not expose current Vercel project/environment settings or MongoDB Atlas cluster/database/user/network-access configuration. Secret values were not requested, accessed, copied or recorded. Consequently, current hosting status, runtime connectivity, database identity, credentials/access permissions and production isolation could not be independently confirmed.

## Findings and decision

- **A safe target is not confirmed.** Historical documentation indicates a previously used staging admin service, but it does not establish that it remains available or that it has a separate, safe database.
- **Production is explicitly not an acceptable substitute.** Existing BRD records identify `layalialzahra` as the production database. No test writes, migration, upload, live API request or deployment was performed for this task.
- **Do not infer safety from the name “Preview” or “staging”.** A target is acceptable only after its actual project/environment and database mapping are evidenced, with write access isolated from production.
- **No CMS acceptance tests were run.** This is deliberate: without verified isolation, CRUD/auth/upload/migration testing could alter production data or assets.
- **Task status:** Environment discovery and evidence reconciliation are complete; the required safe environment remains unavailable/unverified. The CMS acceptance gate is still blocked.

## Evidence required to unblock

An owner-authorised staging/preview target must be identified and verified with all of the following, without placing secret values in Notion or GitHub:

1. Exact hosting provider/project and non-production deployment URL, with the environment identified as Preview/staging (not Production).
2. Environment-specific configuration evidence showing which database the target uses. The database must be a dedicated staging database or isolated staging cluster, not the production database `layalialzahra`.
3. Confirmation that staging credentials cannot write to production and that cluster/database access controls, network access and roles are appropriately restricted.
4. Confirmation of the target's authentication/setup state and authorised tester access.
5. If upload acceptance is required, a non-production Blob store/token or an explicitly isolated test prefix with clear cleanup boundaries.
6. An approved test-data and cleanup plan. Do not copy production secrets or use production customer/content data unless separately authorised and safely sanitised.

Evidence can be supplied through an owner-approved dashboard review or redacted configuration metadata. Never paste connection strings, passwords, tokens, OAuth secrets or full environment-variable values into project documentation.

## Next action

**Blocked pending owner/provider evidence:** obtain explicit identification and authorisation for the non-production hosting target and isolated database, then verify the items above. Keep Vercel disconnected. Once isolation is proven, proceed with Short Task List Tasks 03–12 in order as applicable, including Core CMS Task 6 Steps 2–5 and a real staging migration comparison. Do not mark those acceptance tasks complete based on unit tests or CI alone.

## Completion checklist

- [x] Inspected current project records and repository configuration relevant to environment selection.
- [x] Identified the configured database default and lack of an enforced staging/production isolation guard in the connection helper.
- [x] Reconciled historical BRD claims about a staging service with the missing current isolation evidence.
- [x] Recorded why production and unverified Preview settings are not acceptable substitutes.
- [x] Recorded evidence needed to unblock and the no-secret-handling boundary.
- [ ] Verified an authorised, currently available non-production target and isolated database — **BLOCKED**.
- [ ] Ran CMS runtime acceptance or staging migration — **not run; unsafe until the blocker is resolved**.
