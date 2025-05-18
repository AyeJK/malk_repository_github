import * as React from "react";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
import NewLikeNotification from "@/components/NewLikeNotification";
import NewCommentNotification from "@/components/NewCommentNotification";
import NewFollowNotification from "@/components/NewFollowNotification";
import NewFeatureNotification from "@/components/NewFeatureNotification";
import NewPostByFollowedUserNotification from "@/components/NewPostByFollowedUserNotification";
import BatchDigest from "@/components/BatchDigest";

type NotificationType =
  | "New Like"
  | "New Comment"
  | "New Follow"
  | "New Feature"
  | "New Post by Followed User";

type Notification = {
  type: NotificationType;
  data: any; // shape depends on type
};

type User = {
  email: string;
  DisplayName: string;
};

export async function sendNotificationEmail(notification: Notification, user: User) {
  switch (notification.type) {
    case "New Like":
      await resend.emails.send({
        from: "noreply@malk.tv",
        to: user.email,
        subject: "Someone liked your post!",
        react: (
          <NewLikeNotification
            recipientName={user.DisplayName}
            likerName={notification.data.likerName}
            postTitle={notification.data.postTitle}
            postUrl={notification.data.postUrl}
          />
        ),
      });
      break;
    case "New Comment":
      await resend.emails.send({
        from: "noreply@malk.tv",
        to: user.email,
        subject: "New comment on your post!",
        react: (
          <NewCommentNotification
            recipientName={user.DisplayName}
            commenterName={notification.data.commenterName}
            commentText={notification.data.commentText}
            postTitle={notification.data.postTitle}
            postUrl={notification.data.postUrl}
          />
        ),
      });
      break;
    case "New Follow":
      await resend.emails.send({
        from: "noreply@malk.tv",
        to: user.email,
        subject: "You have a new follower!",
        react: (
          <NewFollowNotification
            recipientName={user.DisplayName}
            followerName={notification.data.followerName}
            followerProfileUrl={notification.data.followerProfileUrl}
          />
        ),
      });
      break;
    case "New Feature":
      await resend.emails.send({
        from: "noreply@malk.tv",
        to: user.email,
        subject: `New feature: ${notification.data.featureTitle}`,
        react: (
          <NewFeatureNotification
            recipientName={user.DisplayName}
            featureTitle={notification.data.featureTitle}
            featureDescription={notification.data.featureDescription}
            featureUrl={notification.data.featureUrl}
          />
        ),
      });
      break;
    case "New Post by Followed User":
      await resend.emails.send({
        from: "noreply@malk.tv",
        to: user.email,
        subject: `New post by ${notification.data.authorName}`,
        react: (
          <NewPostByFollowedUserNotification
            recipientName={user.DisplayName}
            authorName={notification.data.authorName}
            postTitle={notification.data.postTitle}
            postExcerpt={notification.data.postExcerpt}
            postUrl={notification.data.postUrl}
          />
        ),
      });
      break;
    default:
      throw new Error("Unknown notification type");
  }
}

export async function sendBatchDigestEmail(
  user: User,
  period: "daily" | "weekly",
  notifications: { type: string; message: string; url?: string }[]
) {
  await resend.emails.send({
    from: "noreply@malk.tv",
    to: user.email,
    subject: `Your ${period} Malk notifications`,
    react: (
      <BatchDigest
        recipientName={user.DisplayName}
        period={period}
        notifications={notifications}
      />
    ),
  });
} 