import * as React from "react";

type Props = {
  recipientName: string;
  commenterName: string;
  commentText: string;
  postTitle: string;
  postUrl: string;
};

export default function NewCommentNotification({ recipientName, commenterName, commentText, postTitle, postUrl }: Props) {
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h2>Hi {recipientName},</h2>
      <p>
        <strong>{commenterName}</strong> commented on your post: <a href={postUrl}>{postTitle}</a>
      </p>
      <blockquote style={{ margin: "1em 0", padding: "0.5em", background: "#f3f3f3" }}>
        {commentText}
      </blockquote>
      <hr />
      <small>You are receiving this because you subscribed to comment notifications.</small>
    </div>
  );
} 