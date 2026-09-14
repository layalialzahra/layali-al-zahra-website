# Layali Al Zahra Website — Admin CMS / Content Management BRD

**Project:** Layali Al Zahra Beauty Lounge website  
**Repository:** `layalialzahra/layali-al-zahra-website`  
**Primary admin URL:** `https://layalialzahra.com/admin`  
**Status:** Planning / implementation to begin  
**Priority:** High — complete as soon as practical

---

## 1. Purpose

Turn the existing hard-coded salon website into a manageable website where the owner can log into a private admin area and update website content **without editing code, GitHub, Replit, or Vercel**.

The first priority is a real CMS for:

- Beauty Tips
- Blog articles
- Salon News / Announcements

The same CMS foundation should later be reusable for:

- Offers
- Services
- Packages
- Testimonials
- Gallery
- Website settings / contact information

---

## 2. Current Situation

The existing website is a Vite + React + TypeScript application deployed through Vercel.

The repository already contains:

- An `AdminPage.tsx` prototype.
- An `api/test.js` MongoDB connection test.
- `mongodb` as a project dependency.
- A `vercel.json` configuration.
- A `TipsPage.tsx` containing six hard-coded tips.

The current admin page is **not a real authentication system**. It accepts any non-empty username and password on the client side.

The current Tips page is **hard-coded in React**, so changing or adding a tip requires source-code changes.

MongoDB was previously started as an experiment but was never fully connected to the production website.

---

## 3. Target Outcome

The finished system should work like this:

```text
PUBLIC WEBSITE
      |
      +--> /beauty-tips
      +--> /blog
      +--> /news
      |
      v
    Backend API
      |
      v
   MongoDB Atlas

ADMIN
      |
      +--> /admin
             |
             v
        Secure Login
             |
             v
       Admin Dashboard
             |
             +--> Content
             +--> Offers
             +--> Services
             +--> Gallery
             +--> Settings
```

The owner should be able to publish content from the admin dashboard and see it appear on the public website without touching the code.

---

# 4. Implementation Stages

## STAGE 0 — Baseline & Safety

**Goal:** Understand and protect the existing site before changing functionality.

### Tasks
- [ ] Inspect current production code and all existing routes/pages.
- [ ] Identify existing API/database experiments.
- [ ] Confirm current Vercel deployment/build works.
- [ ] Create a safe implementation branch or checkpoint where appropriate.
- [ ] Preserve existing public website design/content unless a change is explicitly part of this project.
- [ ] Do not expose database credentials or secrets in frontend code.

**Done when:** Existing website is understood and there is a safe rollback point.

---

## STAGE 1 — MongoDB Production Connection

**Goal:** Connect MongoDB Atlas to the Vercel-hosted website securely.

### Owner actions — non-technical
The owner will be guided step-by-step through:

1. Creating/signing into MongoDB Atlas.
2. Creating the required database/cluster if one does not already exist.
3. Creating a database user.
4. Setting the required network access.
5. Getting the MongoDB connection string.
6. Adding `MONGODB_URI` to **Vercel Project Settings → Environment Variables**.
7. Redeploying the project.
8. Testing the connection through a protected/test API endpoint.

### Developer tasks
- [ ] Create a reusable MongoDB connection helper.
- [ ] Prevent new database connections from being unnecessarily created on every request.
- [ ] Add required collections/models.
- [ ] Remove/replace the old test-only implementation when production APIs are ready.
- [ ] Never put `MONGODB_URI` in React/client-side code.

**Done when:** Vercel production can securely read/write MongoDB data.

---

## STAGE 2 — Secure Admin Authentication

**Goal:** Make `/admin` a genuinely protected admin area.

### Requirements
- [ ] `/admin` is not linked from the public navigation.
- [ ] Login requires real credentials.
- [ ] Credentials are validated server-side.
- [ ] Password is never stored as plain text.
- [ ] Session/authentication is protected against simple client-side bypass.
- [ ] Unauthenticated users cannot access admin APIs.
- [ ] Logout works.
- [ ] Session expiry/security is handled.
- [ ] Admin credentials/secrets are stored through secure environment/configuration, not committed to GitHub.

**Done when:** Visiting `/admin` without authentication cannot provide access to admin data or write APIs.

---

## STAGE 3 — CMS Foundation

**Goal:** Create one reusable content system instead of three separate systems.

### Content types
- `blog`
- `tip`
- `news`

### Common fields
- Title
- Slug
- Short description / excerpt
- Main content
- Featured image
- Category
- Tags
- Author/source label where appropriate
- Related service
- SEO title
- Meta description
- Social/OG image where useful
- Draft / Published status
- Published date
- Created date
- Updated date

### Admin actions
- [ ] Create
- [ ] Edit
- [ ] Delete
- [ ] Save draft
- [ ] Publish
- [ ] Unpublish
- [ ] Search
- [ ] Filter by type/category/status
- [ ] Preview

**Done when:** Owner can manage Blog, Tips and News from one dashboard without code changes.

---

## STAGE 4 — Admin Content Editor

**Goal:** Make publishing simple for a non-technical owner.

### New Content flow

```text
Admin Dashboard
      ↓
+ New Content
      ↓
Choose: Blog / Beauty Tip / News
      ↓
Enter content
      ↓
Upload image
      ↓
Add SEO information
      ↓
Save Draft / Publish
```

### Editor requirements
- [ ] Simple title field.
- [ ] Auto-generated editable URL slug.
- [ ] Rich-text/article editor.
- [ ] Image upload.
- [ ] Category selection.
- [ ] Related service selection.
- [ ] SEO fields.
- [ ] Draft/publish controls.
- [ ] Delete confirmation.
- [ ] Mobile-friendly admin interface.

**Done when:** A non-technical user can publish a complete article independently.

---

## STAGE 5 — Public Beauty Journal / Tips / News

**Goal:** Replace the current static Tips implementation with database-driven content.

### Public pages
- [ ] `/beauty-tips`
- [ ] `/blog`
- [ ] `/news`
- [ ] Individual article pages using readable slugs.

### Example URLs

```text
/beauty-tips/dubai-hard-water-hair
/blog/how-to-prepare-your-hair-for-eid
/news/ramadan-opening-hours
```

### Public functionality
- [ ] Featured article.
- [ ] Latest articles.
- [ ] Category filtering.
- [ ] Article cards.
- [ ] Full article view.
- [ ] Related articles.
- [ ] Related salon service / booking CTA.
- [ ] Responsive design.
- [ ] Proper SEO metadata.
- [ ] Social sharing metadata.
- [ ] Search-engine-friendly URLs.

### Existing content
The six current hard-coded beauty tips should be migrated into the CMS so existing useful content is not lost.

**Done when:** Public Tips/Blog/News pages read from MongoDB and no longer depend on hard-coded article arrays.

---

## STAGE 6 — Offers Management

**Goal:** Allow salon offers to be changed without code.

### Fields
- Offer title
- Description
- Image
- Price
- Original price
- Discount
- Start date
- End date
- Included services
- Published/hidden status

### Admin actions
- [ ] Add
- [ ] Edit
- [ ] Publish/unpublish
- [ ] Delete
- [ ] Expiry handling

**Done when:** The public Offers page can be controlled from the admin dashboard.

---

## STAGE 7 — Services & Packages Management

**Goal:** Move frequently changing salon information out of source code.

### Services
- Service name
- Category
- Description
- Price / price range
- Duration where applicable
- Image
- Featured status
- Published status

### Packages
- Package name
- Description
- Included services
- Price
- Original price where applicable
- Image
- Validity
- Published status

**Done when:** Owner can update services/packages from the dashboard.

---

## STAGE 8 — Gallery & Testimonials

### Gallery
- [ ] Upload images.
- [ ] Categorize images.
- [ ] Add alt text.
- [ ] Publish/hide.
- [ ] Delete.

### Testimonials
- [ ] Client display name.
- [ ] Review text.
- [ ] Rating.
- [ ] Date.
- [ ] Optional image.
- [ ] Publish/hide.

**Done when:** Gallery and testimonials can be managed without code.

---

## STAGE 9 — SEO & Analytics

### SEO
- [ ] Per-page metadata.
- [ ] Article metadata.
- [ ] Canonical URLs where appropriate.
- [ ] Open Graph metadata.
- [ ] XML sitemap strategy.
- [ ] Structured data where appropriate.
- [ ] Internal links between content and salon services.

### Analytics
- [ ] Confirm existing analytics integration.
- [ ] Track article/page performance where appropriate.
- [ ] Avoid storing unnecessary personal data in the CMS.

**Done when:** New content is technically prepared for search visibility and measurable performance.

---

# 5. Admin Dashboard — Target Structure

```text
ADMIN DASHBOARD

Dashboard
│
├── Content
│   ├── All Content
│   ├── Blog
│   ├── Beauty Tips
│   └── Salon News
│
├── Website
│   ├── Services
│   ├── Packages
│   ├── Offers
│   ├── Gallery
│   └── Testimonials
│
└── Settings
    ├── Contact Details
    ├── SEO Defaults
    └── Admin Account
```

The first release should focus on **Content**. Additional website-management sections should be added only after the core CMS is stable.

---

# 6. Security Requirements

This is a production website, so the following are mandatory:

- Database credentials must never be committed to GitHub.
- MongoDB credentials must be stored in Vercel environment variables.
- Admin password must not be stored in frontend code.
- Admin APIs must require authentication.
- Client-side `isLoggedIn` state must never be treated as security.
- Write operations must be protected server-side.
- Input must be validated/sanitized.
- Delete operations should require confirmation.
- Authentication/session secrets must be stored securely.
- Production error responses must not expose database credentials or sensitive implementation details.

---

# 7. Non-Technical Owner Workflow

After completion, the owner should only need to do this:

### Publish a Beauty Tip

1. Open `layalialzahra.com/admin`.
2. Log in.
3. Open **Content → Beauty Tips**.
4. Click **Add New**.
5. Enter title and article.
6. Upload image.
7. Add SEO title/description if desired.
8. Click **Publish**.
9. The article appears on the public website.

### Change an existing article

1. Open Admin.
2. Find the article.
3. Click Edit.
4. Make changes.
5. Save/Publish.

**No coding knowledge should be required.**

---

# 8. Definition of Done — Core Release

The core project is considered complete when all of the following are true:

- [ ] `/admin` is privately accessible through real authentication.
- [ ] MongoDB Atlas is connected to production through Vercel securely.
- [ ] Admin APIs are authenticated.
- [ ] Blog/Tips/News can be created from the dashboard.
- [ ] Content can be edited/deleted/published/unpublished.
- [ ] Images can be uploaded and displayed.
- [ ] Existing six Tips are migrated.
- [ ] Public Tips page is database-driven.
- [ ] Blog and News public pages work.
- [ ] Individual article URLs work.
- [ ] SEO metadata works for articles.
- [ ] Existing public website functionality remains intact.
- [ ] Production build succeeds.
- [ ] Production deployment is tested.
- [ ] Owner can independently publish a new article without touching code.

---

# 9. Implementation Order / Priority

| Priority | Stage | Status |
|---|---|---|
| P0 | Stage 0 — Baseline & Safety | ⬜ Not started |
| P0 | Stage 1 — MongoDB Production Connection | ⬜ Not started |
| P0 | Stage 2 — Secure Admin Authentication | ⬜ Not started |
| P0 | Stage 3 — CMS Foundation | ⬜ Not started |
| P0 | Stage 4 — Admin Content Editor | ⬜ Not started |
| P0 | Stage 5 — Public Tips/Blog/News | ⬜ Not started |
| P1 | Stage 6 — Offers | ⬜ Not started |
| P1 | Stage 7 — Services & Packages | ⬜ Not started |
| P2 | Stage 8 — Gallery & Testimonials | ⬜ Not started |
| P2 | Stage 9 — SEO & Analytics | ⬜ Not started |

**Core MVP = Stages 0–5.**

The first milestone should be a fully working secure admin CMS for Blog/Tips/News. Do not delay the MVP by trying to build every possible salon-management feature at once.

---

# 10. Important Project Rule

When continuing this project in a future conversation, use this document as the source of truth for scope and implementation order.

Before making major changes:

1. Check the current repository state.
2. Check which stage is marked complete.
3. Continue from the first incomplete stage.
4. Do not rebuild completed functionality unnecessarily.
5. Preserve the existing public design unless a redesign is specifically requested.
6. Explain any owner action needed in simple, step-by-step language.

---

## Current Starting Point

The repository already has an unfinished Admin prototype and MongoDB test endpoint. These are **starting materials, not completed production functionality**.

The project should now proceed by making MongoDB production-ready, implementing secure authentication, then building the CMS and connecting the public content pages to it.
