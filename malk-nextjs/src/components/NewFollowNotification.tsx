import * as React from "react";

type Props = {
  recipientName: string;
  followerName: string;
  followerProfileUrl: string;
};

export default function NewFollowNotification({ recipientName, followerName, followerProfileUrl }: Props) {
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h2>Hi {recipientName},</h2>
      <p>
        <strong><a href={followerProfileUrl}>{followerName}</a></strong> just followed you!
      </p>
      <hr />
      <small>You are receiving this because you subscribed to follow notifications.</small>
    </div>
  );
} 