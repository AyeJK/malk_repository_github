# Plan: Feed Virtualization Implementation

*Date: [Fill in current date]*

## Overview

As the Malk.tv platform scales, rendering large numbers of posts in both vertical and horizontal feeds can cause performance bottlenecks. This PRD outlines the plan to implement frontend virtualization (windowing) for all major feed components, ensuring smooth scrolling, reduced memory usage, and improved user experience across devices.

---

## Goals
- Implement virtualization for all vertical and horizontal feed components
- Support efficient rendering of large lists (hundreds/thousands of posts)
- Maintain or improve UX (loading states, infinite scroll, etc.)
- Ensure compatibility with existing post card components and API pagination

---

## Scope

### 1. Vertical Feeds
- **Affected Components:**
  - `FollowingClient.tsx` (Following feed)
  - `PostsClient.tsx` (Latest posts feed)
  - `ProfileClient.tsx` (User profile posts feed)
- **Current State:**
  - Use `.map()` to render all posts at once
  - Use `LazyPostCard` with intersection observer for basic lazy loading
- **Update Plan:**
  - Replace `.map()` with a virtualized list (e.g., `react-window`'s `FixedSizeList`)
  - Implement overscan buffer for smooth scrolling
  - Trigger `onLoadMore` when user scrolls near the end (infinite scroll)
  - Maintain loading and error states
  - Memoize post card components for performance

### 2. Horizontal Feeds
- **Affected Components:**
  - `PostSlider.tsx` (used in Discover and other pages)
- **Current State:**
  - Renders all posts in a horizontal scroll container
- **Update Plan:**
  - Replace with a virtualized horizontal list/grid (e.g., `react-window`'s `FixedSizeList` or `FixedSizeGrid` with `layout="horizontal"`)
  - Maintain scroll buttons and loading indicators
  - Support dynamic item sizing if needed

### 3. API & Data
- Ensure all feed API endpoints support cursor-based or paginated loading
- Update frontend to request more posts as user scrolls

---

## Implementation Steps
1. **Create Base Virtualized Feed Components**
   - `VirtualizedFeed.tsx` for vertical feeds
   - `VirtualizedHorizontalFeed.tsx` for horizontal feeds
2. **Refactor Existing Feeds**
   - Update `FollowingClient.tsx`, `PostsClient.tsx`, `ProfileClient.tsx` to use `VirtualizedFeed`
   - Update `PostSlider.tsx` to use `VirtualizedHorizontalFeed`
3. **API Adjustments**
   - Ensure endpoints support pagination/cursor
   - Update frontend to handle paginated data
4. **Performance & UX**
   - Add loading placeholders, error boundaries
   - Memoize post card components
   - Test on mobile and desktop
5. **Testing & QA**
   - Test with large datasets
   - Monitor memory and scroll performance
   - Validate accessibility and keyboard navigation

---

## Out of Scope
- Backend optimizations not related to feed pagination
- Major redesign of post card UI

---

## Success Criteria
- Feeds render smoothly with 1000+ posts
- No significant increase in memory or CPU usage
- Infinite scroll and loading states work as expected
- No regressions in UX or accessibility

---

## References
- [react-window documentation](https://react-window.vercel.app/)
- [Current feed components: LazyPostCard, PostSlider, etc.]

---

*Prepared by: Judy (AI Assistant)*
*For: Jeremy (Malk.tv)* 