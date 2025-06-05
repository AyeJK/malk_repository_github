
# Malk.tv Beta Phase – Product Requirements Document

## 1. Introduction
Malk.tv is evolving from a proof‑of‑concept into a public Beta capable of supporting thousands of users who value human‑curated video discovery.  
This document is the single source of truth for designers, developers, and stakeholders, detailing what must be built, how success will be measured, and the constraints under which the team will operate during the Beta phase.

## 2. Product overview
### 2.1 Problem statement
Current video platforms prioritise creator uploads and algorithmic feeds, resulting in impersonal discovery, click‑bait bias, and limited tools for curators. Audiences who prefer recommendations from real people struggle to find niche or high‑quality content.

### 2.2 Solution summary
Malk.tv empowers **Curators** to collect, tag, and share videos from any major source (YouTube, Vimeo, Twitch, etc.).  
Viewers follow Curators, squads of friends, or tags to receive personalised, human‑filtered feeds, real‑time notifications, and email digests.  
The Beta introduces social *Stations*, squads, discovery improvements, and scalable infrastructure.

## 3. Goals and objectives

| Objective | Metric / target | Time frame |
|-----------|-----------------|------------|
| Proven scalability | 5 000 MAU with ≤ 1 s p95 page‑load | < 3 months post‑launch |
| User engagement | ≥ 2 min median session, ≥ 40 % D7 retention (Curators) | Month 1 |
| Community growth | 10 000 curated videos, 500 active Curator profiles | Month 2 |
| Reliability & performance | ≥ 99.5 % uptime, < 0.1 % API error rate, ≤ 100 ms server RT | Continuous |

## 4. Target audience

| Persona | Key needs |
|---------|-----------|
| Tastemaker curator | One‑click import, tagging, playlists, reputation‑building badges |
| Viewer / follower | Trustworthy recommendations, easy follow, multi‑device access |
| Professional amplifier | Quick sharing to maintain relevance, analytics on reach |
| Brand / influence builder | Community‑building tools, cross‑platform share, profile branding |
| Content creator (secondary) | Wider reach without extra upload work |
| Accessibility persona | Mobile, low‑bandwidth, and assistive‑tech support |

## 5. Features and requirements

### 5.1 Functional requirements
* **Authentication & profiles** – email/OAuth sign‑in, avatar, banner, bio, unique `@handle`  
* **Video posting** – URL ingest, metadata fetch, caption, tags, edit/delete  
* **Feeds** – following, discovery, tag, category  
* **Social interactions** – like, comment with @mention, follow/unfollow  
* **Stations** – continuous playlist autoplay on Curator profile  
* **User discovery** – onboarding suggestions and Discover carousel  
* **Squads (private groups)** – 1–20 members, group feed, invite, permissions  
* **Cross‑platform share** – Facebook, Reddit, X with OG preview & share counts  
* **In‑platform search** – YouTube & Vimeo autocomplete before posting  
* **Notifications v2** – in‑app centre + batched email digests, granular prefs  

### 5.2 Non‑functional requirements

| Category | Requirement |
|----------|-------------|
| Performance | ≤ 100 ms server response, ≤ 1 s LCP |
| Scalability | Horizontal scaling via Vercel edge + Airtable cache |
| Security | OWASP Top‑10 compliant, Firebase Rules row‑level auth |
| Privacy | GDPR & CCPA ready, explicit email‑consent opt‑in |
| Accessibility | WCAG AA colour/contrast, keyboard nav, focus rings |

## 6. User stories and acceptance criteria

| ID | User story | Acceptance criteria |
|----|------------|---------------------|
| ST‑101 | As a visitor, I can sign up with email, Google, or Apple so I can create a profile. | • Sign‑up succeeds with validated email or OAuth • Unique `@handle` generated • User redirected to onboarding |
| ST‑102 | As a Curator, I can paste any YouTube/Vimeo/Twitch URL to create a post. | • Metadata auto‑fetched • Caption & tags added • Post appears in profile/feed |
| ST‑103 | As a Curator, I can toggle Station Mode to autoplay a playlist on my profile. | • Toggle persists • First video auto‑plays • Next/skip controls work mobile & desktop |
| ST‑104 | As a user, I can @mention another user in a comment. | • Editor supports `@` autocomplete • Mentioned user gets notification |
| ST‑105 | As a user, I receive follow suggestions during onboarding based on overlapping likes/tags. | • Algorithm < 200 ms • Carousel shows ≥ 5 suggestions • Skipping marks them “seen” |
| ST‑106 | As a user, I can create a Squad, invite up to 20 members, and share videos visible only to that group. | • Only members view Squad feed • Invite link expires 24 h • Permissions enforced |
| ST‑107 | As a viewer, I can share a Malk post to Facebook, Reddit, or X. | • OG meta preview • Share count increments |
| ST‑108 | As a Curator, I earn badges for milestones (e.g., 100 posts). | • Badge on profile/hover‑card • Server verifies milestone |
| ST‑109 | As a user, I can search YouTube/Vimeo within Malk before posting. | • Autocomplete lists title, channel, duration, thumbnail • Selecting pre‑fills post dialog |
| ST‑110 | As a user, I receive in‑app and email notifications batched daily or weekly per my preferences. | • Settings off/daily/weekly • Digest ≤ 20 items • Unsubscribe footer present |
| ST‑111 | As an authenticated user, my session is securely stored with refresh tokens rotated every 7 days. | • Token theft blocked • Rotation tested |
| ST‑112 | As a developer, I have a normalised database schema supporting Curators, posts, squads, badges, notifications. | • ER diagram reviewed • Indexed FKs • Migrations pass CI |
| ST‑113 | As a moderator, I can soft‑delete reported posts (edge‑case). | • Soft delete hides post • Action logged |

## 7. Technical requirements / stack

| Layer | Technology & version | Notes |
|-------|----------------------|-------|
| Front‑end | Next.js (App Router), React 18, TypeScript, TailwindCSS | SSR + island hydration; Vercel preview |
| Back‑end API | Next.js API routes (Node 18) | Serverless; cold‑start optimised |
| Data | Airtable base with ISR cache; evaluate Postgres | Rapid schema iteration; cache mitigates API limits |
| Auth & security | Firebase Auth, Firebase Rules, Google reCAPTCHA | Multi‑provider, row‑level security |
| Email | Resend + React Email | Transactional + digest; domain‑verified |
| CI/CD | GitHub Actions → Vercel Preview | PR environments, unit + e2e (Playwright) |
| Tooling | Cursor.ai, ChatGPT | AI pair‑programming |
| Monitoring | Vercel Analytics | Error tracking, Web Vitals |

## 8. Design and user interface
* **Social first:** curator avatar & handle on every video card  
* **Zero‑friction curation:** single dialog for URL paste → publish  
* **Clarity over cleverness:** icons + labels until action repeated thrice  
* **Motion with meaning:** micro‑animations on like, follow, station toggle  
* **Accessibility baked‑in:** colour‑blind‑safe palette, alt text, focus rings, reduced‑motion support  


---
*Last updated: 04 Jun 2025*
