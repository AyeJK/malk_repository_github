import "dotenv/config";
import { getNotificationsForUser, fetchRecords, getUserByFirebaseUID, getPost, base } from "../src/lib/airtable";
import { sendNotificationEmail, sendBatchDigestEmail } from "../src/lib/utils";

type AirtableRecord = { id: string; fields: Record<string, any> };

async function main() {
  // 1. Fetch all users
  const users = await fetchRecords("Users");
  for (const user of users) {
    const fields = user.fields || {};
    const email = fields.Email;
    const displayName = fields.DisplayName || email;
    if (!email) continue;

    // Check notification preferences
    const wantsDaily = fields.emailNotificationsDaily;
    const wantsWeekly = fields.emailNotificationsWeekly;
    if (!wantsDaily && !wantsWeekly) continue;

    // For demo, just do daily
    if (wantsDaily) {
      // 2. Fetch notifications for this user
      const notifications = await getNotificationsForUser(user.id, { onlyUnread: false });
      // Filter out notifications already sent by email
      const unsent = notifications.filter(n => !n.fields["Email Sent"]);
      if (unsent.length === 0) continue;

      // 3. For each notification, build the data and send
      for (const notif of unsent) {
        const type = String(notif.fields.Type);
        let data: any = {};
        // Fetch related user/post/comment as needed
        const relatedUserId = notif.fields["Related User"]?.[0];
        if (relatedUserId) {
          const relatedUserResult = await fetchRecords("Users") as AirtableRecord[] | undefined;
          const relatedUserArray = Array.isArray(relatedUserResult) ? relatedUserResult : [];
          const ru = relatedUserArray.find((u) => u && u.id === relatedUserId);
          if (ru) {
            data.relatedUser = ru;
          }
        }
        if (notif.fields["Related Post"] && notif.fields["Related Post"][0]) {
          const post = await getPost(notif.fields["Related Post"][0]);
          if (post) {
            data.post = post;
          }
        }
        // Build the correct data shape for the template
        let notificationData: any = {};
        switch (type) {
          case "New Like":
            notificationData = {
              likerName: data.relatedUser?.fields?.DisplayName || "Someone",
              postTitle: data.post?.fields?.VideoTitle || "your post",
              postUrl: data.post ? `https://malk.tv/posts/${data.post.id}` : "#",
            };
            break;
          case "New Comment":
            notificationData = {
              commenterName: data.relatedUser?.fields?.DisplayName || "Someone",
              commentText: notif.fields["Comment Text"] || "(No comment text)",
              postTitle: data.post?.fields?.VideoTitle || "your post",
              postUrl: data.post ? `https://malk.tv/posts/${data.post.id}` : "#",
            };
            break;
          case "New Follow":
            notificationData = {
              followerName: data.relatedUser?.fields?.DisplayName || "Someone",
              followerProfileUrl: data.relatedUser ? `https://malk.tv/profile/${data.relatedUser.fields.DisplayName}` : "#",
            };
            break;
          case "New Feature":
            notificationData = {
              featureTitle: notif.fields["Feature Title"] || "A new feature!",
              featureDescription: notif.fields["Feature Description"] || "Check it out on Malk!",
              featureUrl: notif.fields["Feature URL"] || undefined,
            };
            break;
          case "New Post by Followed User":
            notificationData = {
              authorName: data.relatedUser?.fields?.DisplayName || "Someone you follow",
              postTitle: data.post?.fields?.VideoTitle || "A new post",
              postExcerpt: data.post?.fields?.UserCaption || "",
              postUrl: data.post ? `https://malk.tv/posts/${data.post.id}` : "#",
            };
            break;
          default:
            continue;
        }
        // Send the email
        await sendNotificationEmail({ type, data: notificationData }, { email, DisplayName: displayName });
        // Mark as sent
        await base("Notifications").update([{ id: notif.id, fields: { "Email Sent": true } }]);
        console.log(`Sent ${type} email to ${email}`);
      }
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}); 