# Responsive Design Audit — Malk.tv
*Date: 2024-06-14*

## Overview
This audit reviews all major UI components, layouts, and key pages (including Landing, Login, and Signup) for responsive design issues across mobile, tablet, and desktop breakpoints. The focus is on Tailwind usage, fixed widths, overflow, and layout bugs.

---

## Audit Table

| Component/Page         | Breakpoint(s) | Issue Description                                                                 | Severity | Code Reference                |
|-----------------------|---------------|-----------------------------------------------------------------------------------|----------|-------------------------------|
| **ClientLayout**      | <640px        | Main content uses `ml-64`/`ml-[72px]` for sidebar, may cause horizontal scroll    | Major    | ClientLayout.tsx              |
| **Sidebar**           | <768px        | Sidebar overlay uses fixed width, may block content, not always scrollable        | Major    | Sidebar.tsx                   |
| **Navbar**            | <400px        | Logo and buttons can overflow, spacing tight, icons may overlap                   | Major    | Navbar.tsx                    |
| **PostSlider**        | <640px        | Cards use `w-[300px]`, can overflow viewport, scroll buttons overlap on mobile    | Major    | PostSlider.tsx                |
| **PostCard**          | <640px        | Padding and font sizes not reduced, video iframe may overflow                     | Major    | PostCard.tsx                  |
| **PostDetail**        | <640px        | `max-w-4xl mx-auto px-4 py-6`—content squished, padding too large                | Minor    | PostDetail.tsx                |
| **Modals (All)**      | <400px        | `max-w-md`/`p-6`—content overflows, buttons squished, no scroll on modal body     | Major    | DeletePostModal.tsx, SharePostModal.tsx, EditPostModal.tsx |
| **Forms/Inputs**      | <400px        | Inputs/buttons may overflow, no responsive font/spacing, hardcoded paddings       | Minor    | Comments.tsx, EditPostModal.tsx |
| **CustomProfileSection** | <640px     | Sliders/cards overflow, section actions overlap, not enough vertical spacing      | Major    | CustomProfileSection.tsx      |
| **NotificationsDropdown** | <400px    | Fixed width (`w-[480px]`), overflows viewport, not scrollable on mobile           | Major    | NotificationsDropdown.tsx     |
| **Button**            | <400px        | Large buttons may overflow, icons/text not always responsive                      | Minor    | ui/button.tsx                 |
| **LazyPostCard**      | <640px        | Skeleton card uses fixed widths, may overflow on mobile                           | Minor    | LazyPostCard.tsx              |
| **ShareVideoModal**   | <400px        | Modal content and preview grid overflows, not enough wrapping                     | Major    | ShareVideoModal.tsx           |
| **Landing Page**      | <400px        | Large paddings (`px-16`, `md:px-24`), headings and buttons can overflow, input forms may squish or overflow on very small screens. No explicit mobile breakpoints for some paddings. | Major    | (landing)/page.tsx            |
| **Login Page**        | <400px        | Uses `px-16`, `md:px-24` for main container, which can cause horizontal scroll on very small screens. Form and buttons are wide, may overflow. | Major    | login/page.tsx                |
| **Signup Page**       | <400px        | Uses `px-16`, `md:px-24`, multi-step form with wide containers, profile image picker may overflow. Some headings and buttons can squish or overflow on very small screens. | Major    | signup/page.tsx               |

---

## Common Patterns/Root Causes
- **Fixed Widths:** Many components and pages use hardcoded widths (`w-[300px]`, `w-64`, `max-w-md`, `w-[480px]`, `px-16`, `md:px-24`) without responsive alternatives for small screens.
- **Missing Responsive Classes:** Not all containers/elements use `sm:`, `md:`, `lg:` for padding, font, or layout.
- **Overflow Issues:** Horizontal sliders, modals, dropdowns, and main page containers can overflow on small screens.
- **No Scroll on Modals:** Modals with lots of content don't allow scrolling on mobile.
- **Navigation Overlap:** Navbar and Sidebar can overlap or block content on mobile.
- **Wide Forms:** Login and Signup forms use wide paddings and containers, which can cause horizontal scroll or squishing on mobile.

---

## Prioritization
**Critical/Major (should fix first):**
- PostSlider, Sidebar, Navbar, Modals, NotificationsDropdown, CustomProfileSection, Landing Page, Login Page, Signup Page

**Minor (polish after core fixes):**
- PostDetail, PostCard, Button, LazyPostCard, Forms/Inputs

---

## Next Steps
1. Refactor fixed widths and paddings to use responsive Tailwind classes or `w-full`/`max-w-xs`/`max-w-sm` etc., especially on Landing, Login, and Signup pages.
2. Add/adjust breakpoints for paddings, font sizes, and layout direction on all main pages and forms.
3. Ensure all modals, dropdowns, and page containers are scrollable and never overflow the viewport.
4. Test all navigation, overlays, and forms for accessibility and usability on mobile.
5. Document and track each fix as a subtask under the main Responsive Refactor.

---

*Generated by Judy, your Night City netrunner. Ping if you want to start fixing a specific component or need a deeper dive on any issue!* 