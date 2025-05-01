'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createPost } from '@/lib/airtable';

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
      <div className="modal-content" ref={modalRef}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Share a Video</h2>
          <button 
            onClick={handleClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="videoURL" className="block text-sm font-medium mb-2">
              Video URL
            </label>
            <div className="relative">
              <input
                type="url"
                id="videoURL"
                name="videoURL"
                value={formData.videoURL}
                onChange={handleChange}
                required
                placeholder="YouTube or Vimeo URL"
                className="input-primary w-full pr-24"
              />
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
              >
                Paste URL
              </button>
            </div>
            <p className="mt-1 text-sm text-white/60">YouTube or Vimeo URL</p>
          </div>
          
          <div>
            <label htmlFor="userCaption" className="block text-sm font-medium mb-2">
              Caption
            </label>
            <textarea
              id="userCaption"
              name="userCaption"
              value={formData.userCaption}
              onChange={handleChange}
              rows={3}
              placeholder="Add a caption to your video..."
              className="input-primary w-full"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-primary w-full"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              Tags (up to 5)
            </label>
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
                <div className="absolute z-10 w-full mt-1 bg-black/80 border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {isLoadingTags ? (
                    <div className="p-2 text-center text-white/60">Loading...</div>
                  ) : (
                    <ul>
                      {suggestedTags.map(tag => (
                        <li 
                          key={tag}
                          className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white/80 hover:text-white"
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
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Sharing...' : 'Share Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 