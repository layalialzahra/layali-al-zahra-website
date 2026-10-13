# Migration Source Reconciliation — 2026-10-12

**Project:** Layali Al Zahra Website CMS  
**Repository:** `layalialzahra/layali-al-zahra-website`  
**Branch:** `feat/layali-managed-content-cms`  
**Tested commit:** `acc1accdb15c93ae43df285dd28179b0d606c671`  
**Status:** Source-to-migration comparison PASS. Database/staging comparison NOT RUN; blocked by Task 02.

## Authoritative source

The migration builder reads the existing public-content source files directly:
- Services: `src/data/legacy-services.js`, composed from `legacy-services-part-1.js`, `legacy-services-part-2.js` and `legacy-services-part-3.js`.
- Offers: `src/data/legacy-offers.js`.
- Packages: `src/data/legacy-packages.js`.
- FAQs: `src/data/legacy-faqs.js`.

The existing public Services, Offers and Packages pages were also checked for their shared Zylu booking destination. No source content was edited during reconciliation.

## Comparison result

| Collection | Expected | Compared | Discrepancies |
| --- | ---: | ---: | ---: |
| Services | 15 | 15 | 0 |
| Offers | 5 | 5 | 0 |
| Packages | 23 | 23 | 0 |
| FAQs | 13 | 13 | 0 |
| **Total** | **56** | **56** | **0** |

Automated checks compare every record in source order and compare the following values:

- **Services:** source ID/slug, title, image path/URL, category, list order and every subservice name and exact price string.
- **Offers:** title, description, badge/price label, image path, exact recurring/descriptive validity label, validity type, order and booking destination.
- **Packages:** title, description, exact price label, category, image path, order and booking destination.
- **FAQs:** exact question and answer, page assignment (`services`, `offers`, `packages`) and order within each page. Assignment counts are 5, 4 and 4 respectively.
- **Shared booking destination:** `https://store.zylu.co/business/layali-al-zahra-beauty-salon-llc/services`, matching the existing public-page booking fallback.
- **Counts/dry-run:** the migration dry-run returns `{ services: 15, offers: 5, packages: 23, faqs: 13 }` and performs no database write.

## Mapping-generated fields (not source discrepancies)

The migration adds values required by the managed schema where the legacy source has no equivalent:
- Service description is set to an empty string because the legacy service records have no description field.
- Image alt text defaults to the source title.
- Service subservice IDs are generated from each subservice name plus its one-based position within that service.
- Offer/package slugs are normalized from their source titles; service slugs use existing source IDs.
- Offer/package booking URLs use the existing public-page fallback destination.
- Sort order is the zero-based index of the source record; FAQ order restarts within each source page.
- Records are marked published to preserve the existing public-source visibility in the migration snapshot.

These are explicit mapping rules, not edits to authoritative source content. Original price and validity labels remain strings; values such as `AED 187.95`, `AED 105`, `Every Monday` and `Midday Special` are not reformatted or converted into dates/numbers.

## Discrepancy log

**No source-to-migration field discrepancies were found. No source values were changed.** The regression test `tests/managed-content-migration-snapshot.test.js` asserts all 56 projections against the authoritative source arrays, including labels, images, ordering, FAQ assignment, exact price strings and booking URLs.

## Verification evidence

Build verification [38281562425](https://github.com/layalialzahra/layali-al-zahra-website/actions/runs/38281562425) passed on tested commit `acc1accdb15c93ae43df285dd28179b0d606c671`:
- Dependency audit: 0 vulnerabilities.
- Node tests: 120 passed, 0 failed.
- Vitest: 29 passed across 7 files.
- Client build, SSR build and homepage SSR smoke test passed.

## Acceptance boundary / outstanding checks

This is a source-to-migration projection comparison. It does **not** prove that records already exist in MongoDB or that the migration has been applied. No database was connected, no writes were performed, and no migration was applied. Task 02 remains blocked until an authorised isolated non-production database is verified. Compare live collection records, migration repeat-run behavior and rollback only in that approved environment. Do not use the production-identified default database, reconnect Vercel, deploy, or switch public data sources as part of this task.
