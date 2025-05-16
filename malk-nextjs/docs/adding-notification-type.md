# Guide: Adding a New Notification Type

This guide explains how to add a new notification type to your Next.js + Airtable project.

---

## 1. Airtable Setup
- **Add the new type** to the `Type` field in your `Notifications` table.
  - Example: Add `"New Post by Followed User"` as an option.
- **Ensure your table schema** supports any new fields you want to associate (e.g., `Related User`, `Related Post`).

---

## 2. Backend Changes

### a. Update TypeScript Types
- In `src/lib/airtable.ts`, update the `NotificationRecord` type to include your new type:
  ```ts
  export interface NotificationRecord {
    // ...
    fields: {
      // ...
      'Type': 'New Like' | 'New Comment' | 'New Follow' | 'New Feature' | 'New Post by Followed User'; // Add your new type here
      // ...
    }
  }
  ```

### b. Trigger Notification Logic
- Identify where in your backend logic the notification should be created (e.g., after a post is created, after a user is followed, etc.).
- Use the `createNotification` function to create the notification. Example:
  ```ts
  await createNotification({
    'User': [recipientUserId],
    'Type': 'New Post by Followed User',
    'Related User': [actorUserId],
    'Related Post': [postId],
    'Is Read': false
  });
  ```
- If the notification is for multiple users (e.g., all followers), loop through and create one for each.

---

## 3. Frontend Changes

### a. Display the New Notification
- In `src/components/NotificationsDropdown.tsx`, add a case for your new type in the rendering logic:
  ```tsx
  else if (n.fields.Type === 'New Post by Followed User') {
    // Example: Only username is bold
    return (
      <>
        <span className="font-normal">New post by </span>
        <span className="font-semibold">{related.user?.fields?.DisplayName || 'Someone'}</span>
      </>
    );
  }
  ```
- Set the link (`href`) and description (`desc`) as appropriate for your notification.

### b. Test the UI
- Trigger the notification (manually or via a test endpoint).
- Confirm it appears in the dropdown as expected, with the correct styling and link.

---

## 4. Testing & Validation
- **Backend:** Use a test endpoint or manual action to trigger the notification and check Airtable for the new record.
- **Frontend:** Log in as the recipient and confirm the notification appears and behaves as intended.

---

## 5. Cleanup (Optional)
- Remove or disable any test endpoints you created for development.
- Update documentation or comments in your codebase to reflect the new notification type.

---

## Summary Checklist
- [ ] Add new type to Airtable `Notifications` table.
- [ ] Update TypeScript types.
- [ ] Add backend logic to trigger the notification.
- [ ] Update frontend to display the new notification.
- [ ] Test end-to-end.

---

**Tip:**
If your notification involves new relationships (e.g., a new kind of "Related" field), make sure to update both the backend creation logic and the frontend fetching logic for related data. 