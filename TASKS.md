# Malk.tv Project Task List

This document provides a human-readable overview of all current tasks and subtasks for the Malk.tv Beta project, based on the latest tasks.json.

---

## Legend
- **[ ]** Pending
- **[x]** Done
- **[~]** In Progress

---

## Tasks

4. **Video Posting System** [ ]
   - Implement the core functionality for curators to post videos from various platforms.
   - _Priority: High_
   - _Dependencies: 2_
   - **Subtasks:**
     - **Next Up:**
       6. Post Edit and Delete Functionality [ ] — Implement functionality to edit and delete existing posts.
     - **Completed:**
       1. URL Validation and Parsing [x] — Implement URL validation and parsing for YouTube, Vimeo, and Twitch URLs.
       2. Metadata Fetching Service [x] — Create a service to fetch metadata from YouTube, Vimeo, and Twitch APIs.
       3. Post Creation UI [x] — Develop the user interface for creating video posts.
       4. Post Storage and API Endpoints [x] — Implement backend storage and API endpoints for video posts.
       5. Tagging System [x] — Implement comprehensive tagging functionality for video posts.
       7. Video Embedding and Playback [x] — Implement video embedding and playback functionality for different platforms.
       8. Post Performance Testing and Optimization [x] — Test and optimize the video posting system for performance and reliability.

5. **Feed Implementation** [ ]
   - Implement various feed types: following, discovery, tag, and category.
   - _Priority: High_
   - _Dependencies: 4_
   - **Subtasks:**
     - **Next Up:**
       7. Feed Performance Optimization [ ] — Optimize feed performance for speed and efficiency.
     - **Completed:**
       1. Feed Data Architecture [x] — Design and implement the data architecture for different feed types.
       2. Following Feed [x] — Implement the Following feed showing posts from followed curators.
       3. Discovery Feed [x] — Implement the Discovery feed for new content exploration.
       4. Tag Feed [x] — Implement the Tag feed for viewing content by specific tags.
       5. Category Feed [x] — Implement the Category feed for browsing content by categories.
       6. Feed UI Components [x] — Develop reusable UI components for all feed types.

7. **Stations Feature** [ ]
   - Implement the Stations feature for continuous playlist autoplay on curator profiles.
   - _Priority: Medium_
   - _Dependencies: 4_
   - **Subtasks:**
     - **Next Up:**
       1. Station Mode Data Model [ ] — Design and implement the data model for Station Mode.
       2. Station Mode Toggle UI [ ] — Implement the user interface for toggling Station Mode on profiles.
       3. Autoplay Functionality [ ] — Implement continuous autoplay functionality for Station Mode.
       4. Playback Controls [ ] — Implement playback controls for Station Mode.
       5. Playlist Management [ ] — Implement playlist management for Station Mode.
       6. Station Mode UI Integration [ ] — Integrate Station Mode into profile pages and user interface.
       7. Station Performance Optimization [ ] — Optimize Station Mode for performance and reliability.

8. **User Discovery System** [ ]
   - Implement user discovery functionality for onboarding and explore features.
   - _Priority: Medium_
   - _Dependencies: 3, 5_
   - **Subtasks:**
     - **Next Up:**
       1. User Suggestion Algorithm [ ] — Design and implement the algorithm for suggesting users to follow.
       2. Onboarding Suggestion UI [ ] — Implement the user interface for suggesting curators during onboarding.
       3. Discover Carousel [ ] — Implement the Discover carousel for ongoing curator discovery.
       4. User Search Functionality [ ] — Implement user search functionality for finding specific curators.
       5. User Hover Cards [ ] — Implement hover cards showing user preview information.
       6. Similar Curators Feature [ ] — Implement similar curators suggestions on profile pages.
       7. Discovery Analytics and Optimization [ ] — Implement analytics and optimize the user discovery system.

9. **Squads (Private Groups)** [ ]
   - Implement private group functionality for sharing within small teams.
   - _Priority: Medium_
   - _Dependencies: 6_
   - **Subtasks:**
     - **Next Up:**
       1. Squad Data Model [ ] — Design and implement the data model for Squads (private groups).
       2. Squad Creation UI [ ] — Implement the user interface for creating new Squads.
       3. Invitation System [ ] — Implement the Squad invitation system with expiring links.
       4. Permission System [ ] — Implement the permission system for Squad content and actions.
       5. Squad-Specific Feed [ ] — Implement Squad-specific feeds for viewing content shared within a Squad.
       6. Squad Management UI [ ] — Implement interfaces for managing Squad settings and members.
       7. Post Sharing to Squads [ ] — Implement functionality to share posts specifically to Squads.
       8. Squad Testing and Optimization [ ] — Test and optimize the Squad feature for performance, security, and usability.

10. **Cross-Platform Sharing** [ ]
   - Implement sharing functionality to external platforms with proper metadata.
   - _Priority: Low_
   - _Dependencies: 4_

11. **In-Platform Search** [ ]
   - Implement YouTube and Vimeo search within the platform for easier posting.
   - _Priority: Low_
   - _Dependencies: 4_

12. **Notifications System V2** [ ]
   - Implement comprehensive notification system with in-app and email options.
   - _Priority: Medium_
   - _Dependencies: 6_
   - **Subtasks:**
     - **Next Up:**
       4. Email Digest System [ ] — Implement the email digest system for batched notifications.
       5. Notification Preferences [ ] — Implement granular notification preferences for users.
       6. Real-Time Notification Delivery [ ] — Implement real-time notification delivery system.
       7. Notification System Testing and Optimization [ ] — Test and optimize the notification system for performance and reliability.
     - **Completed:**
       1. Notification Data Model [x] — Design and implement the data model for the notifications system.
       2. In-App Notification Center [x] — Implement the in-app notification center UI and functionality.
       3. Notification Generation System [x] — Implement the system for generating notifications for different events.

13. **Badge System** [ ]
   - Implement achievement badges for curator milestones.
   - _Priority: Low_
   - _Dependencies: 3, 4_

14. **Moderation Tools** [ ]
   - Implement basic moderation functionality for reported content.
   - _Priority: Low_
   - _Dependencies: 4, 6_

15. **Performance Optimization and Testing** [ ]
   - Optimize performance and implement comprehensive testing.
   - _Priority: High_
   - _Dependencies: 5, 7, 8, 9, 10, 11, 12, 13, 14_


### Completed

1. **Project Setup and Infrastructure** [x]
   - Set up the project repository, development environment, and basic infrastructure.
   - _Priority: High_
   - _Dependencies: None_

2. **Authentication System** [x]
   - Implement user authentication with email, Google, and Apple sign-in options.
   - _Priority: High_
   - _Dependencies: 1_
   - **Subtasks:**
     - **Completed:**
       1. Firebase Auth Integration [x] — Set up and integrate Firebase Authentication in the application.
       2. Login UI and Functionality [x] — Implement the login user interface and functionality.
       3. Registration UI and Functionality [x] — Implement the registration user interface and functionality.
       4. Auth State Management [x] — Implement authentication state management throughout the application.
       5. User Data Management [x] — Implement user data storage and management with Airtable.
       6. Security Enhancements [x] — Implement additional security measures for the authentication system.
       7. Onboarding Flow Integration [x] — Implement the post-registration onboarding flow.

3. **User Profiles** [x]
   - Implement user profile functionality including avatars, banners, bios, and unique handles.
   - _Priority: High_
   - _Dependencies: 2_

6. **Social Interactions** [x]
   - Implement core social features: like, comment with @mention, follow/unfollow.
   - _Priority: Medium_
   - _Dependencies: 3, 4_

16. **Profile Slider Component Replacement** [x]
   - Replace the slider component on Profile pages with the slider component from the Discovery page.
   - _Priority: Medium_
   - _Dependencies: 3, 5_

