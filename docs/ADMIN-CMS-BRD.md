# Layali Al Zahra Website — Admin CMS / Content Management BRD

**Project:** Layali Al Zahra Beauty Lounge website  
**Repository:** `layalialzahra/layali-al-zahra-website`  
**Primary admin URL:** `https://layalialzahra.com/admin`  
**Status:** 🟡 Implementation in progress

> **Change-control:** Every repository/code/configuration change must update this BRD in the same change. A stage is complete only when its applicable checklist and acceptance criteria are implemented and verified.

## Stage 4.1 Correction Status
The previous Stage 4.1 implementation was **not accepted**. The current correction pass is the source of truth for the next live verification.

### Corrections implemented
- Public navigation now maps Home, Services, Packages, Offers and Contact to explicit paths, while Tips, Blog and News retain their clean content paths.
- Blog/News listing cards no longer show hashtag-style tags.
- Listing and detail images use fixed aspect-ratio containers with `object-fit: cover`.
- Public content pages now use explicit editorial typography, spacing and card geometry aligned to the existing Offers page visual system.
- Admin login, Dashboard, Content Library, editor and Settings are now one coherent responsive CMS workspace with a desktop sidebar and mobile drawer.
- Content Library has structured filters, clear create actions, thumbnails, status badges and compact row actions.
- The editor uses a primary content column plus a dedicated media/publishing rail and fixed image preview crop.
- Existing authentication, MongoDB APIs, CRUD, publishing, duplication, deletion, image upload and password-change functionality are preserved.
- The protected demo seed provides two Blog items, two Beauty Tips and two News items; management has loaded the six records for review.

### Master status
| Stage | Status | Current state |
|---|---|---|
| 0 — Baseline & Safety | 🟢 Complete | Completed |
| 1 — MongoDB Production Connection | 🟢 Complete | Completed |
| 2 — Secure Admin Authentication | 🟢 Complete | Completed |
| 3 — CMS Foundation | 🟢 Complete | Completed |
| 4 — Admin Content Editor | 🟢 Complete | Completed |
| 4.1 — Public Content Presentation & Admin UX | 🟡 In progress | Correction implemented; live desktop/mobile acceptance pending |
| 5 — Public Tips/Blog/News | 🔒 Blocked | Must wait for Stage 4.1 acceptance |
| 6 — Offers | ⬜ Not started | Deferred |
| 7 — Services & Packages | ⬜ Not started | Deferred |
| 8 — Gallery & Testimonials | ⬜ Not started | Deferred |
| 9 — SEO & Analytics | ⬜ Not started | Deferred |

## Stage 4.1 Acceptance Gate
- [ ] Services, Packages, Offers and Contact open correctly from the public header on desktop/mobile.
- [ ] Tips page visually matches the existing Offers design language.
- [ ] Blog page visually matches the existing Offers design language.
- [ ] News page visually matches the existing Offers design language.
- [ ] All six management sample records render correctly on the public listing/detail pages.
- [ ] Homepage Tips/Blog/News showcases render correctly with the sample records.
- [ ] Public card/detail image crops are consistent at desktop/mobile widths.
- [ ] Admin login/setup is visually coherent and usable on desktop/mobile.
- [ ] Admin Dashboard, Content Library, editor and Settings form one coherent workspace.
- [ ] First-time admin can identify create/edit/publish/unpublish/duplicate/delete actions without developer assistance.
- [ ] Existing CMS CRUD, image upload, publishing and authentication behavior remain intact.
- [ ] No Stage 5 execution or production-domain cutover before this gate passes.

## Stage 5 Status
Stage 5 remains blocked. Its existing route/API foundations are retained, but six-tip migration and final public acceptance do not begin until Stage 4.1 passes live review.

## Change Log — 2026-09-14 Stage 4.1 Correction Pass
- Reviewed the original repository structure and the established Offers page rather than treating the prior Stage 4.1 implementation as the design baseline.
- Corrected public routing for Services, Packages, Offers and Contact.
- Removed hashtag tags from Blog/News listing cards.
- Standardized public image crop geometry and detail-page editorial typography.
- Rebuilt the admin login, Dashboard, Content Library, editor and Settings into one visual system.
- Preserved the existing CMS/security/API behavior.
- Kept the six management sample records available for review.
- Stage 4.1 remains in progress until live desktop/mobile acceptance is completed.

## Historical Stage Record
Stages 0–4 were previously completed and remain unchanged. The earlier detailed stage evidence and change history remain in the repository history; this current section supersedes any earlier Stage 4.1 claim that the experience had already been accepted.
