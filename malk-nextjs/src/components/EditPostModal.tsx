import React, { useState, useRef, useEffect, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';

interface TagOption { id: string; name: string; slug?: string; }
interface CategoryOption { id: string; name: string; slug?: string; }

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    fields: {
      UserCaption: string;
      UserTags?: string[];
      Categories?: string[];
      ThumbnailURL?: string;
      VideoTitle?: string;
    };
  };
  onSave: (updatedFields: { UserCaption: string; UserTags?: string[]; Categories?: string[] }) => void;
  authorName?: string;
  authorAvatarUrl?: string;
}

// Helper to create a new tag in Airtable and return its record ID
async function createTag(name: string): Promise<TagOption> {
  const res = await fetch('/api/get-tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create tag');
  const data = await res.json();
  return data.tag; // Should return { id, name, slug }
}

// Helper to look up a tag by name using search-tags API
async function getTagIdByName(name: string): Promise<string | null> {
  const res = await fetch(`/api/search-tags?q=${encodeURIComponent(name)}`);
  if (!res.ok) return null;
  const data = await res.json();
  const match = (data.tags || []).find((t: any) => t.name?.toLowerCase() === name.toLowerCase());
  return match ? match.id : null;
}

export default function EditPostModal({ isOpen, onClose, post, onSave, authorName, authorAvatarUrl }: EditPostModalProps) {
  const [caption, setCaption] = useState(post.fields.UserCaption || '');
  const [category, setCategory] = useState<CategoryOption | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<TagOption[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch tag and category names for current post
  useEffect(() => {
    async function fetchInitialData() {
      setCaption(post.fields.UserCaption || '');
      // Fetch categories
      const catIds = post.fields.Categories || [];
      let catOptions: CategoryOption[] = [];
      if (catIds.length > 0) {
        const res = await fetch(`/api/get-categories?ids=${catIds.join(',')}`);
        const data = await res.json();
        catOptions = data.categories || [];
        setCategories(catOptions);
        // Set the selected category to the one matching the post's category ID
        const postCategoryId = catIds[0];
        if (postCategoryId) {
          const selectedCat = catOptions.find(cat => cat.id === postCategoryId);
          setCategory(selectedCat || null);
        } else {
          setCategory(null);
        }
      } else {
        // Fetch all categories for dropdown
        const res = await fetch('/api/get-categories');
        const data = await res.json();
        setCategories(data.categories || []);
        setCategory(null);
      }
      // Fetch tags
      const tagIds = post.fields.UserTags || [];
      if (tagIds.length > 0) {
        const res = await fetch(`/api/get-tags?ids=${tagIds.join(',')}`);
        const data = await res.json();
        setTags(data.tags || []);
      } else {
        setTags([]);
      }
    }
    if (isOpen) fetchInitialData();
    // eslint-disable-next-line
  }, [isOpen, post]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && e.target === modalRef.current) {
      onClose();
    }
  };

  // Tag search logic (returns TagOption[])
  const searchTags = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestedTags([]);
      return;
    }
    setIsLoadingTags(true);
    try {
      const response = await fetch(`/api/search-tags?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search tags');
      const data = await response.json();
      setSuggestedTags(
        (data.tags || []).map((t: any) =>
          typeof t === 'string' ? { id: t, name: t } : t
        ).filter((t: TagOption) => !tags.some(tag => tag.id === t.id))
      );
    } catch (err) {
      setSuggestedTags([]);
    } finally {
      setIsLoadingTags(false);
    }
  };

  const addTag = (tag: TagOption | string) => {
    let newTag: TagOption;
    if (typeof tag === 'string') {
      // Check if already exists in tags
      if (tags.some(t => t.name.toLowerCase() === tag.toLowerCase())) return;
      if (tags.length >= 5) {
        setError('You can only add up to 5 tags per post.');
        return;
      }
      // Create a new tag object with a temp id
      newTag = { id: `new:${tag.trim().toLowerCase()}`, name: tag.trim() };
    } else {
      if (tags.some(t => t.id === tag.id)) return;
      if (tags.length >= 5) {
        setError('You can only add up to 5 tags per post.');
        return;
      }
      newTag = tag;
    }
    setTags(prev => [...prev, newTag]);
    setTagInput('');
    setSuggestedTags([]);
  };

  const removeTag = (tagId: string) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId));
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    searchTags(value);
    setIsTagDropdownOpen(!!value && value.length > 1);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      // If there's a matching suggestion, add it; otherwise, add as new tag
      const match = suggestedTags.find(t => t.name.toLowerCase() === tagInput.trim().toLowerCase());
      if (match) {
        addTag(match);
      } else {
        addTag(tagInput.trim());
      }
    }
  };

  const handleTagSelect = (tag: TagOption) => {
    addTag(tag);
    setIsTagDropdownOpen(false);
  };

  // Close tag dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isTagDropdownOpen &&
        tagDropdownRef.current &&
        tagInputRef.current &&
        !tagDropdownRef.current.contains(event.target as Node) &&
        !tagInputRef.current.contains(event.target as Node)
      ) {
        setIsTagDropdownOpen(false);
      }
    }
    if (isTagDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTagDropdownOpen]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    if (!caption.trim()) {
      setError('Caption is required.');
      setLoading(false);
      return;
    }
    try {
      // Ensure all tags are Airtable record IDs
      let tagIds: string[] = [];
      for (const tag of tags) {
        if (tag.id.startsWith('new:')) {
          // Create the tag in Airtable
          const createdTag = await createTag(tag.name);
          tagIds.push(createdTag.id);
        } else if (tag.id.startsWith('rec')) {
          tagIds.push(tag.id);
        } else {
          // Try to look up the tag by name
          const foundId = await getTagIdByName(tag.name);
          if (foundId) {
            tagIds.push(foundId);
          } else {
            // Fallback: create the tag if not found
            const createdTag = await createTag(tag.name);
            tagIds.push(createdTag.id);
          }
        }
      }
      await onSave({
        UserCaption: caption.trim(),
        UserTags: tagIds,
        Categories: category ? [category.id] : undefined,
      });
      setLoading(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save post');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal z-50" ref={modalRef} onClick={handleBackdropClick}>
      <div className="modal-content font-raleway">
        <h2 className="text-4xl font-lobster mb-6">Edit Post</h2>
        {/* Post Preview */}
        <div className="flex items-center gap-4 mb-6 p-3 rounded-lg bg-white/5">
          <div className="w-36 h-20 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center flex-shrink-0">
            {post.fields.ThumbnailURL ? (
              <img src={post.fields.ThumbnailURL} alt={post.fields.VideoTitle || 'Video thumbnail'} className="object-cover w-full h-full" />
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
                <div className="text-white font-bold truncate text-base leading-tight mt-0.5">{post.fields.VideoTitle || 'Untitled Video'}</div>
              </div>
            </div>
            {post.fields.UserCaption && (
              <div className="text-xs text-gray-300 mt-2 whitespace-pre-line">{post.fields.UserCaption}</div>
            )}
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block mb-2 text-gray-300 font-semibold">Edit Caption</label>
            <textarea
              className="w-full p-3 rounded bg-white/5 text-white mb-2 whitespace-pre-line font-raleway"
              rows={3}
              value={caption}
              onChange={e => setCaption(e.target.value)}
            />
          </div>
          {/* Category field (Listbox) */}
          <div>
            <label className="block mb-2 text-gray-300 font-semibold">Edit Category</label>
            <Listbox value={category} onChange={setCategory}>
              <div className="relative">
                <Listbox.Button className="input-primary w-full text-left cursor-pointer">
                  {category ? category.name : 'Select a category'}
                </Listbox.Button>
                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-[0.75rem] bg-[#ff8178] py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
                    {categories.map(cat => (
                      <Listbox.Option
                        key={cat.id}
                        value={cat}
                        className={({ active }) => `cursor-pointer select-none relative py-2 pl-4 pr-4 ${active ? 'bg-[#e76a5e] text-white' : 'text-white'}`}
                      >
                        {cat.name}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
          {/* Tag field (autocomplete, chips) */}
          <div>
            <label className="block mb-2 text-gray-300 font-semibold">Edit Tags</label>
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
                onFocus={() => setIsTagDropdownOpen(tagInput.length > 1 && suggestedTags.length > 0)}
              />
              {isTagDropdownOpen && suggestedTags.length > 0 && (
                <div
                  className="absolute z-10 w-full mt-1 bg-[#ff8178] rounded-[0.75rem] shadow-lg max-h-48 overflow-y-auto py-1 text-base ring-1 ring-black/5"
                  ref={tagDropdownRef}
                >
                  {isLoadingTags ? (
                    <div className="p-2 text-center text-white/60">Loading...</div>
                  ) : (
                    <ul>
                      {suggestedTags.map(tag => (
                        <li
                          key={tag.id}
                          className="px-4 py-2 cursor-pointer text-white select-none rounded-[0.5rem] transition-colors duration-100 hover:bg-[#e76a5e] hover:text-white"
                          onClick={() => handleTagSelect(tag)}
                        >
                          {tag.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => {
                  const gradientClasses = [
                    'bg-red-950/50 text-red-400 hover:bg-red-900/50',
                    'bg-orange-950/50 text-orange-400 hover:bg-orange-900/50',
                    'bg-amber-950/50 text-amber-400 hover:bg-amber-900/50',
                    'bg-rose-950/50 text-rose-400 hover:bg-rose-900/50',
                    'bg-pink-950/50 text-pink-400 hover:bg-pink-900/50'
                  ];
                  return (
                    <span
                      key={tag.id}
                      className={`px-3 py-1.5 ${gradientClasses[index % 5]} rounded-lg text-sm flex items-center`}
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => removeTag(tag.id)}
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
          {error && <div className="text-red-400 mb-2 font-semibold">{error}</div>}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              className="btn-secondary px-6 py-2 rounded font-semibold"
              onClick={onClose}
              disabled={loading}
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn-primary px-6 py-2 rounded font-semibold"
              onClick={handleSave}
              disabled={loading}
              type="button"
            >
              {loading ? 'Saving Post' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 