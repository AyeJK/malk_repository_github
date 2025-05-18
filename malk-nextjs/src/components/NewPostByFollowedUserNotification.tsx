import * as React from "react";

type Props = {
  recipientName: string;
  authorName: string;
  postTitle: string;
  postExcerpt: string;
  postUrl: string;
};

export default function NewPostByFollowedUserNotification({
  recipientName,
  authorName,
  postTitle,
  postExcerpt,
  postUrl,
}: Props) {
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h2>Hi {recipientName},</h2>
      <p>
        <strong>{authorName}</strong> (someone you follow) just posted: <a href={postUrl}>{postTitle}</a>
      </p>
      <p>{postExcerpt}</p>
      <hr />
      <small>You are receiving this because you subscribed to new post notifications.</small>
    </div>
  );
} 