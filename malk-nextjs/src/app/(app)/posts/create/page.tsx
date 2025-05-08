'use client';

import { useState, useEffect, useRef } from 'react';
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

export default function CreatePostPage() {
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

  // Redirect to login if not authenticated
  if (!loading && !user) {
    router.push('/login');
    return null;
  }

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

      // Redirect to the posts page after a short delay
      setTimeout(() => {
        router.push('/posts');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Share a Video</h1>
      
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
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-24"
            />
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
            >
              Paste URL
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-400">YouTube or Vimeo URL</p>
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
            required
            rows={4}
            placeholder="Write a Caption"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-400">Write a Caption</p>
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
            required
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a Category</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-400">Select a Category</p>
        </div>
        
        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-2">
            Tags
          </label>
          <div className="relative">
            <input
              type="text"
              id="tags"
              ref={tagInputRef}
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Add Tags"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Tag suggestions dropdown */}
            {suggestedTags.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {isLoadingTags ? (
                  <div className="p-2 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : (
                  <ul>
                    {suggestedTags.map(tag => (
                      <li 
                        key={tag}
                        onClick={() => handleTagSelect(tag)}
                        className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          
          {/* Selected tags */}
          {formData.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span 
                  key={tag} 
                  className="bg-blue-900/30 text-blue-200 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-300 hover:text-blue-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          
          <p className="mt-1 text-sm text-gray-400">Add Tags (up to 5)</p>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
} 