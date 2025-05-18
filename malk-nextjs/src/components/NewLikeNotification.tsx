import * as React from "react";

type Props = {
  recipientName: string;
  likerName: string;
  postTitle: string;
  postUrl: string;
};

export default function NewLikeNotification({ recipientName, likerName, postTitle, postUrl }: Props) {
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h2>Hi {recipientName},</h2>
      <p>
        <strong>{likerName}</strong> liked your post: <a href={postUrl}>{postTitle}</a>
      </p>
      <hr />
      <small>You are receiving this because you subscribed to like notifications.</small>
    </div>
  );
} 