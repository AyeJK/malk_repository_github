'use client';

import { useState, useRef, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createPost } from '@/lib/airtable';
import { Listbox, Transition } from '@headlessui/react';

// Define the categories
const CATEGORIES = [
  'Music',
  'Comedy',
  'Gaming',
  'Food',
  'Film / TV / Movies',
  'Beauty / Fashion',
  'Learning',
  'Nature',
  'Crafting / Tech',
  'Podcasts',
  'Sports',
  'Travel',
  'Other'
];

interface ShareVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareVideoModal({ isOpen, onClose }: ShareVideoModalProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    videoURL: '',
    userCaption: '',
    category: '',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Function to handle pasting from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setFormData(prev => ({
        ...prev,
        videoURL: text
      }));
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      setError('Failed to access clipboard. Please paste the URL manually.');
    }
  };

  // Function to search for tags
  const searchTags = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestedTags([]);
      return;
    }

    setIsLoadingTags(true);
    try {
      // Call the API endpoint to search for tags
      const response = await fetch(`/api/search-tags?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search tags');
      }
      
      const data = await response.json();
      setSuggestedTags(data.tags.filter((tag: string) => !formData.tags.includes(tag)));
    } catch (err) {
      console.error('Error searching tags:', err);
      // Fallback to mock data if the API call fails
      const mockTags = [
        'gaming', 'tutorial', 'review', 'walkthrough', 'gameplay',
        'music', 'cover', 'original', 'remix', 'live',
        'comedy', 'sketch', 'vlog', 'prank', 'reaction',
        'food', 'recipe', 'cooking', 'baking', 'review'
      ];
      
      const filteredTags = mockTags
        .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
        .filter(tag => !formData.tags.includes(tag));
      
      setSuggestedTags(filteredTags);
    } finally {
      setIsLoadingTags(false);
    }
  };

  // Function to add a tag
  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    
    // Don't add duplicate tags
    if (formData.tags.includes(normalizedTag)) {
      return;
    }
    
    // Don't add more than 5 tags
    if (formData.tags.length >= 5) {
      setError('You can only add up to 5 tags per post.');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, normalizedTag]
    }));
    
    setTagInput('');
    setSuggestedTags([]);
  };

  // Function to remove a tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle tag input change
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    
    // Search for tags as the user types
    searchTags(value);
  };

  // Handle tag input keydown (for adding tags on Enter)
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  // Handle tag selection from suggestions
  const handleTagSelect = (tag: string) => {
    addTag(tag);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to create a post');
      }

      // Create the post
      const result = await createPost({
        firebaseUID: user.uid,
        videoURL: formData.videoURL,
        userCaption: formData.userCaption,
        userTags: formData.tags.length > 0 ? formData.tags : undefined,
        categories: formData.category ? [formData.category] : undefined
      });

      if (!result) {
        throw new Error('Failed to create post');
      }

      setSuccess(true);
      setFormData({
        videoURL: '',
        userCaption: '',
        category: '',
        tags: []
      });
      setTagInput('');

      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
        router.push('/posts');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal is closed
  const handleClose = () => {
    setFormData({
      videoURL: '',
      userCaption: '',
      category: '',
      tags: []
    });
    setTagInput('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal z-50">
      <div className="modal-content font-raleway" ref={modalRef}>
        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-4xl font-lobster flex items-center gap-3">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-4xl">Share a Video</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs text-white/70 italic leading-tight">supported</span>
              <span className="text-xs text-white/70 italic leading-tight">platforms</span>
            </div>
            <div className="h-8 w-px bg-white/20 mx-1" />
            <div className="flex items-center gap-4">
              {/* Vimeo Icon */}
              <a href="https://vimeo.com" target="_blank" rel="noopener noreferrer">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M29.9 8.6c-.1 2.2-1.7 5.2-4.7 9.1-3.1 4-5.7 6-7.8 6.1-1.3 0-2.4-1.2-3.3-3.5-.6-2.2-1.2-4.4-1.8-6.6-.7-2.4-1.4-3.6-2.1-3.6-.2 0-.9.4-2.1 1.2l-1.3-1.7c1.3-1.1 2.6-2.2 3.9-3.3 1.8-1.5 3.1-2.3 3.9-2.3 2-.2 3.2 1.2 3.4 4.1.1 1.1.3 2.2.6 3.3.3 1.2.6 1.8.9 1.8.2 0 .7-.5 1.5-1.5.8-1 1.2-1.7 1.3-2.1.1-.8-.2-1.2-1-1.2-.4 0-.8.1-1.2.3.8-2.6 2.3-3.8 4.5-3.7 1.6.1 2.3 1.1 2.1 3.1z" fill="#3FC4FF"/>
                </svg>
              </a>
              {/* YouTube Lozenge Icon */}
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                <svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0.5" y="0.5" width="39" height="27" rx="8.5" fill="#FF0000" stroke="#FF0000"/>
                  <path d="M27 14.0001C27 13.3478 26.6488 12.7339 26.0858 12.3887L17.9142 7.23607C17.3507 6.89091 16.6493 6.89091 16.0858 7.23607C15.5223 7.58123 15.1711 8.19513 15.1711 8.84737V19.1528C15.1711 19.805 15.5223 20.4189 16.0858 20.7641C16.6493 21.1092 17.3507 21.1092 17.9142 20.7641L26.0858 15.6114C26.6488 15.2662 27 14.6523 27 14.0001Z" fill="white"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/30 border border-green-500 text-green-200 p-4 rounded mb-6">
            Post created successfully! Redirecting...
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type="url"
                id="videoURL"
                name="videoURL"
                value={formData.videoURL}
                onChange={handleChange}
                required
                placeholder="YouTube or Vimeo URL"
                className="input-primary w-full pr-10"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white py-3 px-2 rounded-r-lg transition-colors"
                aria-label="Paste URL"
                style={{ marginRight: 0 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6V4.875A2.625 2.625 0 0013.875 2.25h-3.75A2.625 2.625 0 007.5 4.875V6m9 0v1.125c0 .621-.504 1.125-1.125 1.125h-7.5A1.125 1.125 0 017.5 7.125V6m9 0h1.125A2.625 2.625 0 0121 8.625v10.5A2.625 2.625 0 0118.375 21H5.625A2.625 2.625 0 013 19.125V8.625A2.625 2.625 0 015.625 6H7.5" />
                </svg>
              </button>
            </div>
          </div>
          
          <div>
            <textarea
              id="userCaption"
              name="userCaption"
              value={formData.userCaption}
              onChange={handleChange}
              rows={3}
              placeholder="Write a caption..."
              className="input-primary w-full"
            />
          </div>
          
          <div>
            <Listbox value={formData.category} onChange={value => setFormData(prev => ({ ...prev, category: value }))}>
              <div className="relative">
                <Listbox.Button className="input-primary w-full text-left cursor-pointer">
                  {formData.category || 'Select a category'}
                </Listbox.Button>
                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-[0.75rem] bg-[#ff8178] py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
                    {CATEGORIES.map(category => (
                      <Listbox.Option
                        key={category}
                        value={category}
                        className={({ active }) => `cursor-pointer select-none relative py-2 pl-4 pr-4 ${active ? 'bg-[#e76a5e] text-white' : 'text-white'}`}
                      >
                        {category}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
          
          <div>
            <div className="relative">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add tags..."
                className="input-primary w-full"
                ref={tagInputRef}
              />
              
              {suggestedTags.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-[#ff8178] rounded-[0.75rem] shadow-lg max-h-48 overflow-y-auto py-1 text-base ring-1 ring-black/5">
                  {isLoadingTags ? (
                    <div className="p-2 text-center text-white/60">Loading...</div>
                  ) : (
                    <ul>
                      {suggestedTags.map(tag => (
                        <li
                          key={tag}
                          className="px-4 py-2 cursor-pointer text-white select-none rounded-[0.5rem] transition-colors duration-100 hover:bg-[#e76a5e] hover:text-white"
                          onClick={() => handleTagSelect(tag)}
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => {
                  const gradientClasses = [
                    'bg-red-950/50 text-red-400 hover:bg-red-900/50',
                    'bg-orange-950/50 text-orange-400 hover:bg-orange-900/50',
                    'bg-amber-950/50 text-amber-400 hover:bg-amber-900/50',
                    'bg-rose-950/50 text-rose-400 hover:bg-rose-900/50',
                    'bg-pink-950/50 text-pink-400 hover:bg-pink-900/50'
                  ];
                  return (
                    <span 
                      key={tag}
                      className={`px-3 py-1.5 ${gradientClasses[index % 5]} rounded-lg text-sm flex items-center`}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 opacity-75 hover:opacity-100"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="flex justify-start space-x-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 