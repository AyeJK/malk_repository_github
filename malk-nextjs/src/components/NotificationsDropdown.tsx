'use client';
import React, { useEffect, useState } from 'react';
import { BellIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Raleway } from 'next/font/google';
import DefaultAvatar from './DefaultAvatar';

interface Notification {
  id: string;
  fields: any;
}

interface User {
  id: string;
  fields: any;
}

interface Post {
  id: string;
  fields: any;
  VideoTitle?: string;
  ThumbnailURL?: string;
}

const raleway = Raleway({ subsets: ['latin'], weight: '700' });

function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function NotificationsDropdown({ open }: { open: boolean }) {
  const { user, airtableUser } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<Record<string, { user?: User; post?: Post }>>({});

  // Helper to mark a notification as read
  const markAsRead = async (notificationId: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId }),
    });
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, fields: { ...n.fields, 'Is Read': true } } : n));
  };

  // Helper to mark all as read
  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.fields['Is Read']);
    await Promise.all(unread.map(n => markAsRead(n.id)));
  };

  // Handler for notification click: mark as read and navigate
  const handleNotificationClick = async (n: Notification, related: any) => {
    if (n.fields['Is Read']) return;
    await markAsRead(n.id);
    // Determine navigation target
    if ((n.fields.Type === 'New Like' || n.fields.Type === 'New Comment' || n.fields.Type === 'New Feature') && related.post) {
      console.log('Navigating to post:', `/post/${related.post.id}`);
      router.push(`/post/${related.post.id}`);
    } else if (n.fields.Type === 'New Follow' && related.user) {
      const displayName = related.user.fields?.DisplayName;
      console.log('Navigating to profile:', `/profile/${displayName ? encodeURIComponent(displayName) : related.user.id}`);
      router.push(`/profile/${displayName ? encodeURIComponent(displayName) : related.user.id}`);
    }
  };

  useEffect(() => {
    if (!user || !airtableUser) return;
    setLoading(true);
    fetch(`/api/notifications?firebaseUID=${user.uid}`)
      .then(res => res.json())
      .then(async data => {
        setNotifications(data.notifications || []);
        // Fetch related user/post for each notification
        const promises = (data.notifications || []).map(async (n: Notification) => {
          const d: any = {};
          if (n.fields['Related User'] && n.fields['Related User'][0]) {
            d.user = await fetch(`/api/get-user?ids=${n.fields['Related User'][0]}`).then(r => r.json()).then(r => r.users?.[0]);
          }
          if (n.fields['Related Post'] && n.fields['Related Post'][0]) {
            d.post = await fetch(`/api/get-post?id=${n.fields['Related Post'][0]}`).then(r => r.json()).then(r => r.post);
          }
          return [n.id, d];
        });
        const resolved = await Promise.all(promises);
        setDetails(Object.fromEntries(resolved));
        setLoading(false);
      });
  }, [user, airtableUser]);

  if (!open) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-[480px] max-w-2xl bg-[#181818] rounded-xl shadow-2xl drop-shadow-2xl z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`${raleway.className} text-lg`} style={{ color: '#ff8178' }}>Notifications</span>
          <a href="/settings" title="Settings" className="ml-1 hover:text-[#ff8178] transition-colors">
            <Cog6ToothIcon className="w-5 h-5 align-middle inline" />
          </a>
        </div>
        <button
          className="p-1 rounded hover:bg-white/10 text-xs font-semibold text-blue-400"
          onClick={markAllAsRead}
          disabled={notifications.every(n => n.fields['Is Read'])}
        >
          Mark all as read
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto divide-y divide-neutral-800">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No notifications</div>
        ) : notifications.map(n => {
          const related = details[n.id] || {};
          // Debug logs for notification rendering
          console.log('Notification:', n);
          console.log('Related post:', related.post);
          console.log('Notification type:', n.fields.Type);
          let profileImg = related.user?.fields?.ProfileImage;
          let postThumb = related.post?.ThumbnailURL;
          let title = '';
          let desc = '';
          let href = '#';
          let showWarning = false;
          if (n.fields.Type === 'New Like') {
            title = `<b>${related.user?.fields?.DisplayName || 'Someone'}</b> liked your post`;
            desc = related.post?.VideoTitle || '';
            if (related.post) {
              href = `/posts/${related.post.id}`;
            } else {
              showWarning = true;
            }
          } else if (n.fields.Type === 'New Comment') {
            title = `<b>${related.user?.fields?.DisplayName || 'Someone'}</b> commented on your post`;
            desc = related.post?.VideoTitle || '';
            if (related.post) {
              href = `/posts/${related.post.id}`;
            } else {
              showWarning = true;
            }
          } else if (n.fields.Type === 'New Follow') {
            title = `<b>${related.user?.fields?.DisplayName || 'Someone'}</b> followed you`;
            if (related.user) {
              const displayName = related.user.fields?.DisplayName;
              href = `/profile/${displayName ? encodeURIComponent(displayName) : related.user.id}`;
            }
          } else if (n.fields.Type === 'New Feature') {
            title = `Your post was featured!`;
            desc = related.post?.VideoTitle || '';
            postThumb = related.post?.ThumbnailURL;
            if (related.post) {
              href = `/post/${related.post.id}`;
            } else {
              showWarning = true;
            }
          }
          const isRead = n.fields['Is Read'];
          return (
            <Link
              key={n.id}
              href={href}
              onClick={async (e) => {
                if (href === '#') {
                  e.preventDefault();
                  return;
                }
                await markAsRead(n.id);
              }}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-neutral-800 transition cursor-pointer ${isRead ? 'opacity-60' : 'bg-neutral-900 font-bold'}`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-700 border border-neutral-700">
                {profileImg ? (
                  <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <DefaultAvatar userId={related.user?.fields?.FirebaseUID} userName={related.user?.fields?.DisplayName} />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="text-white whitespace-normal leading-tight">
                  {(() => {
                    // Render display name bold, rest normal
                    if (n.fields.Type === 'New Like') {
                      return <><span className="font-semibold">{related.user?.fields?.DisplayName || 'Someone'}</span> liked your post</>;
                    } else if (n.fields.Type === 'New Comment') {
                      return <><span className="font-semibold">{related.user?.fields?.DisplayName || 'Someone'}</span> commented on your post</>;
                    } else if (n.fields.Type === 'New Follow') {
                      return <><span className="font-semibold">{related.user?.fields?.DisplayName || 'Someone'}</span> followed you</>;
                    } else {
                      return <span className="font-semibold">{title}</span>;
                    }
                  })()}
                </div>
                {(n.fields.Type === 'New Like' || n.fields.Type === 'New Comment') && desc && (
                  <div className="text-sm text-gray-400 truncate leading-tight">{desc}</div>
                )}
                {(n.fields.Type !== 'New Like' && n.fields.Type !== 'New Comment' && desc) && (
                  <div className="text-sm text-gray-400 truncate leading-tight">{desc}</div>
                )}
                <div className="text-xs text-gray-500 mt-0.5">{n.fields['Created At'] ? timeAgo(n.fields['Created At']) : ''}</div>
                {showWarning && <div className="text-xs text-red-400 mt-1">Post not found</div>}
              </div>
              {postThumb && (
                <img src={postThumb} alt="Thumbnail" className="w-14 h-10 rounded-lg object-cover border border-neutral-700 ml-2" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
} 