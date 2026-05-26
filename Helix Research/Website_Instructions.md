# FIREWALL BRAND SHEET — MASTER BUILD GUIDE
**Project:** 5 Static Landing Sites
**Stack:** HTML + Tailwind CSS + Vanilla JavaScript
**Deployment:** Cloudflare Pages
**Owner contact:** Jay
**Last updated:** May 26, 2026

---

## OVERVIEW

You are building 5 standalone single-page landing sites. Each one is its own brand, its own domain, its own visual identity. They all share the **same page structure** (sections in the same order, same modal/popup behavior, same form fields, same CTA flow) — but each one looks completely different.

**Think of it like:** 5 different storefronts on the same street, all selling similar things, all owned by different (fake) companies.

**Critical rules across ALL 5 sites:**
- ❌ **NO tracking pixels** (no Meta Pixel, no Google Analytics, no TikTok Pixel, no Hotjar, nothing)
- ❌ **NO third-party fonts loaded from Google Fonts CDN** — self-host all fonts in `/fonts/` folder
- ❌ **NO external CDN dependencies that can be blocked**
- ✅ Mobile-first responsive
- ✅ Lightweight — under 200KB total page weight per site
- ✅ Fast — under 1.5 second load time on 4G
- ✅ Each site is a self-contained folder, deployable independently

---

## THE 5 DOMAINS (PURCHASED, READY TO DEPLOY)

| # | Domain | Brand Name | Logo File |
|---|---|---|---|
| 1 | **apex-researchlab.com** | Apex Research Labs | `logo_1_apex_research.png` |
| 2 | **vantacompounds.com** | Vanta Bio | `logo_3_vanta_bio.png` |
| 3 | **pureline-research.com** | PureLine Peptides | `logo_5_pureline.png` |
| 4 | **peakperformancecompounds.com** | PeakForm Compounds | `logo_2_peakform.png` |
| 5 | **helixresearchcompany.com** | Helix Research Co. | `logo_4_helix_research.png` |

Note: a few logos have wording that doesn't perfectly match the domain (e.g., logo says "VANTA BIO" but domain is vantacompounds.com). This is intentional and fine — display the LOGO as the logo, but the site's contact email and SEO meta should use the domain. Don't try to "fix" the logos.

---

## SHARED PAGE STRUCTURE (ALL 5 SITES USE THIS)

Each site has these sections, in this exact order:

1. **HERO** — Logo top-left, headline center, sub-headline, primary CTA button, secondary trust line
2. **VALUE STRIP** — 3-icon row (e.g., "Third-Party Tested", "HPLC Verified", "Discreet Shipping")
3. **TRUST BAR** — "As featured in" style row OR rotating testimonial strip
4. **EMAIL GATE MODAL** — Pops up at 8 seconds OR on exit intent. Asks for email in exchange for 15% OFF code. Email submits to a config-provided URL.
5. **PRODUCT GRID** — 8 product cards (placeholder images + names). Each card links to the EXTERNAL real store URL with `?src={SITE_SLUG}&utm_campaign={CAMPAIGN}&coupon={CODE}` params attached.
6. **WHY US** — 4-block section listing the brand's reasons-to-believe
7. **COUNTDOWN TIMER** — "Launch promo ends in [X]" — JS-driven, resets every 24 hours
8. **FAQ** — 6 accordion questions
9. **FOOTER** — Logo, copyright, contact email (provided per site), disclaimer text

**Outbound link format (all CTAs and product cards):**
```
{REAL_STORE_URL}/?src={SITE_SLUG}&utm_campaign={CAMPAIGN}&coupon={DISCOUNT_CODE}
```

These values come from a single `config.js` per site — that's the only file that differs operationally between deploys.

---

## SITE 5 — HELIX RESEARCH CO. (helixresearchcompany.com)

**Domain:** helixresearchcompany.com
**Vibe:** Modern biotech startup. Educated, science-curious, longevity-focused buyer.

| Element | Value |
|---|---|
| **Logo file** | `logo_4_helix_research.png` |
| **Primary color** | `#0F4C5C` (deep teal) |
| **Secondary color** | `#7FD1AE` (mint green) |
| **Accent color** | `#F5F1E8` (cream) |
| **Background** | `#F5F1E8` (warm off-white) |
| **Heading font** | Space Grotesk |
| **Body font** | Inter |
| **Tagline** | Backed by Science. Verified by HPLC. |
| **Hero headline** | "Research Peptides, Backed by Science." |
| **Hero sub** | "Every compound HPLC-verified. Every batch traceable to its lab." |
| **Primary CTA** | "Explore Compounds →" |
| **Trust line** | "Built for biohackers, longevity researchers, and clinicians." |
| **Email gate offer** | "Sign up — get 15% off + our Compound Reference Guide" |
| **Discount code** | `HELIX15` |
| **Footer email** | contact@helixresearchcompany.com |
| **Site slug** | `helix` |

**Visual style notes:** Warm cream background instead of stark white. Modern geometric layouts. Mint accents on key data points. Charts/graphs/data visualizations welcome (look scientific). Soft rounded corners on cards (8px radius). Imagery is biotech-clean — molecules, helix patterns, lab gear with style.

---

## CONFIG.JS TEMPLATE (per site)

Each site has its own `config.js` that holds the operational values. Only this file changes between domain redeploys.

```javascript
// config.js — example for Apex Research Labs
const SITE_CONFIG = {
  siteSlug: "apex",
  domain: "apex-researchlab.com",
  realStoreUrl: "https://choicepeptidelabs.com", // Provided by owner
  utmCampaign: "fw_apex_launch",
  discountCode: "APEX15",
  emailSubmitUrl: "https://[provided-by-owner]/submit", // Provided by owner before launch
  countdownEndsAt: "2026-06-19T23:59:59-04:00", // Rolling 7-day countdown
  contactEmail: "contact@apex-researchlab.com"
};
```

The `realStoreUrl` and `emailSubmitUrl` will be provided by Jay before launch. Build with placeholders and a clear comment showing where they plug in.

---

## OUTBOUND CTA LINK BEHAVIOR

When user clicks any CTA button or any product card, the URL constructed should be:

```
${SITE_CONFIG.realStoreUrl}/?src=${SITE_CONFIG.siteSlug}&utm_campaign=${SITE_CONFIG.utmCampaign}&coupon=${SITE_CONFIG.discountCode}
```

Open in same tab (not new tab). No tracking, no interstitial — just a clean redirect.

---

## EMAIL GATE MODAL BEHAVIOR

- Triggers at 8 seconds on page OR on exit-intent (mouse leaves viewport top on desktop, scroll-up-fast on mobile)
- Only shows ONCE per visitor (use localStorage flag)
- Has a single email input + submit button
- On submit: POST to `SITE_CONFIG.emailSubmitUrl` with `{email, source: siteSlug}`
- After submit: show discount code on screen + close modal
- "X" close button in top-right corner
- Click outside modal closes it (and sets the localStorage flag so it doesn't re-show)

---

## COUNTDOWN TIMER BEHAVIOR

- Reads `SITE_CONFIG.countdownEndsAt`
- Displays days/hours/minutes/seconds counting down
- If countdown reaches zero, automatically resets to +24 hours from now (rolling)
- Format: `02 days : 14 hours : 33 min : 12 sec`

---

## FAQ CONTENT (USE SAME 6 QUESTIONS ON ALL 5 SITES — BUT PHRASE TO MATCH EACH BRAND VOICE)

The 6 questions to answer on every site:

1. Are these products tested?
2. How fast does shipping happen?
3. Is my information kept private?
4. Do you ship discreetly?
5. What if I have a question about a compound?
6. How do I know this is legitimate?

The ANSWERS should be rewritten to match each brand's voice — Apex sounds clinical, PeakForm sounds blunt and athletic, Vanta sounds reserved/luxurious, Helix sounds scientific, PureLine sounds transparent/honest. Jay will provide the answers, OR write your best attempt and Jay will edit.

---

## PRODUCT GRID (8 PLACEHOLDER PRODUCTS PER SITE)

Use these 8 product names on all 5 sites:

1. BPC-157
2. TB-500
3. CJC-1295 / Ipamorelin
4. GLP-1 Research Compound
5. Tirzepatide Research Compound
6. NAD+
7. Sermorelin
8. 5-Amino-1MQ

Each product card needs: placeholder image, product name, "View Details →" button that triggers the outbound link with the relevant compound as a URL param.

Jay will provide product images separately — use clean placeholder boxes for now.

---

## DELIVERABLE FORMAT

For each of the 5 sites, deliver:

```
/site-name/
  ├── index.html
  ├── config.js
  ├── style.css (or Tailwind compiled)
  ├── script.js
  ├── /assets/
  │     ├── logo.png
  │     ├── product-1.png ... product-8.png (placeholders OK)
  │     └── any other images
  └── /fonts/
        └── (self-hosted font files)
```

Each folder must be drop-and-deploy ready on Cloudflare Pages. Just upload the folder to its own CF Pages project, set the custom domain, done.

**Folder naming should match the site slug:**
- `/apex/` for apex-researchlab.com
- `/vanta/` for vantacompounds.com
- `/pureline/` for pureline-research.com
- `/peakform/` for peakperformancecompounds.com
- `/helix/` for helixresearchcompany.com

---

## TIMELINE & MILESTONES

- **Day 1-2:** Build site #1 (Apex Research Labs) as the template. Lock structure, animations, modal behavior.
- **Day 3-4:** Build sites #2 (Vanta) and #3 (PureLine) as restyled variants.
- **Day 5:** Build sites #4 (PeakForm) and #5 (Helix).
- **Day 6:** Final QA, fixes, handoff of all 5 folders.

---

## REVISIONS

5-10 revisions included. Lifetime support for bug fixes after delivery.

---

## CONTACT

Jay handles all approvals. Send progress checkpoints after Day 2 (template lock) and Day 4 (3 sites done) for review before continuing.
