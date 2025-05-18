import * as React from "react";

type Props = {
  recipientName: string;
  featureTitle: string;
  featureDescription: string;
  featureUrl?: string;
};

export default function NewFeatureNotification({ recipientName, featureTitle, featureDescription, featureUrl }: Props) {
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h2>Hi {recipientName},</h2>
      <p>
        We've just launched a new feature: <strong>{featureTitle}</strong>
      </p>
      <p>{featureDescription}</p>
      {featureUrl && (
        <p>
          <a href={featureUrl} style={{ color: "#4F46E5" }}>Learn more</a>
        </p>
      )}
      <hr />
      <small>You are receiving this because you subscribed to feature notifications.</small>
    </div>
  );
} 