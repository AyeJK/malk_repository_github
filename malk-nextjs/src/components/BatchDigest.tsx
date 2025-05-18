import * as React from "react";

type Notification = {
  type: string;
  message: string;
  url?: string;
};

type Props = {
  recipientName: string;
  period: "daily" | "weekly";
  notifications: Notification[];
};

export default function BatchDigest({ recipientName, period, notifications }: Props) {
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h2>{`Your ${period} Malk notifications`}</h2>
      <p>Hello {recipientName}, here's what you missed:</p>
      <ul>
        {notifications.map((notif, i) => (
          <li key={i}>
            {notif.message}
            {notif.url && (
              <>
                {" "}
                <a href={notif.url} style={{ color: "#4F46E5" }}>
                  View
                </a>
              </>
            )}
          </li>
        ))}
      </ul>
      <hr />
      <small>You can manage your notification preferences in your account settings.</small>
    </div>
  );
} 