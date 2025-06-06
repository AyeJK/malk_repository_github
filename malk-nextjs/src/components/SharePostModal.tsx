import { useRef, useState } from 'react';
import RedditIcon from './icons/RedditIcon';
import BlueskyIcon from './icons/BlueskyIcon';

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postUrl: string;
  postTitle?: string;
  thumbnailUrl?: string;
  videoTitle?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  caption?: string;
}

const SOCIALS = [
  {
    name: 'Bluesky',
    icon: <BlueskyIcon className="w-6 h-6" alt="Bluesky" />,
    getUrl: (url: string, title?: string) => `https://bsky.app/intent/compose?text=${encodeURIComponent((title ? title + ' ' : '') + url)}`,
  },
  {
    name: 'Facebook',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" /></svg>
    ),
    getUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'Reddit',
    icon: <RedditIcon className="w-6 h-6" alt="Reddit" />,
    getUrl: (url: string, title?: string) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title || '')}`,
  },
  {
    name: 'WhatsApp',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.366.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347zM12.004 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.762.463 3.479 1.341 4.995L2 22l5.104-1.335c1.47.805 3.13 1.238 4.9 1.238 5.514 0 9.997-4.483 9.997-9.997 0-5.514-4.483-9.997-9.997-9.997z" /></svg>
    ),
    getUrl: (url: string, title?: string) => `https://wa.me/?text=${encodeURIComponent((title ? title + ' ' : '') + url)}`,
  },
];

export default function SharePostModal({ isOpen, onClose, postUrl, postTitle, thumbnailUrl, videoTitle, authorName, authorAvatarUrl, caption }: SharePostModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Close on outside click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && e.target === modalRef.current) {
      onClose();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback or error
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal z-50" ref={modalRef} onClick={handleBackdropClick}>
      <div className="modal-content font-raleway">
        <h2 className="text-4xl font-lobster mb-6">Share this Post</h2>
        {/* Miniature Post Preview */}
        <div className="flex items-center gap-4 mb-6 p-3 rounded-lg bg-white/5">
          <div className="w-36 h-20 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center flex-shrink-0">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt={videoTitle || 'Video thumbnail'} className="object-cover w-full h-full" />
            ) : (
              <span className="text-gray-500 text-xs">No thumbnail</span>
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center flex-shrink-0">
                {authorAvatarUrl ? (
                  <img src={authorAvatarUrl} alt={authorName || 'User avatar'} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-gray-400 text-xs">?</span>
                )}
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-baseline gap-1">
                  {authorName && <span className="text-xs font-semibold text-red-400 truncate">{authorName}</span>}
                  <span className="text-xs text-gray-400">shared</span>
                </div>
                <div className="text-white font-bold truncate text-base leading-tight mt-0.5">{videoTitle || postTitle || 'Untitled Video'}</div>
              </div>
            </div>
            {caption && (
              <div className="text-xs text-gray-300 mt-2 whitespace-pre-line">{caption}</div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          {/* Copy Link Button Only */}
          <button
            onClick={handleCopy}
            className="btn-primary w-full"
            type="button"
          >
            Copy Link
          </button>
          {copied && <span className="text-green-400 text-xs mt-1 block text-center">Copied!</span>}
          {/* Social Buttons */}
          <div className="flex justify-center gap-4 mt-4">
            {SOCIALS.map(social => (
              <button
                key={social.name}
                className="rounded-full bg-white/10 hover:bg-white/20 p-3 transition-colors"
                aria-label={`Share on ${social.name}`}
                onClick={() => {
                  window.open(social.getUrl(postUrl, postTitle), '_blank', 'noopener,noreferrer');
                  onClose();
                }}
                type="button"
              >
                {social.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 