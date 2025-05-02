import { useState, useEffect } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import PostSlider from './PostSlider';

interface CustomProfileSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

function uniqBy<T>(arr: T[], key: (item: T) => any): T[] {
  const seen = new Set();
  return arr.filter(item => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export default function CustomProfileSection({ userId, isOwnProfile }: CustomProfileSectionProps) {
  const [sections, setSections] = useState<Array<{
    id: string;
    type: 'category' | 'tag';
    value: string;
    name: string;
  }>>([]);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [selectedType, setSelectedType] = useState<'category' | 'tag'>('category');
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [tags, setTags] = useState<Array<{ id: string; name: string }>>([]);
  const [userCategories, setUserCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [userTags, setUserTags] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [posts, setPosts] = useState<{ [key: string]: any[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [search, setSearch] = useState('');
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [tagsLoaded, setTagsLoaded] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  // Fetch categories and tags
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await fetch('/api/get-categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
        setCategoriesLoaded(true);

        const tagsResponse = await fetch('/api/get-top-tags?limit=1000');
        const tagsData = await tagsResponse.json();
        setTags(tagsData.tags || []);
        setTagsLoaded(true);
      } catch (error) {
        console.error('Error fetching categories and tags:', error);
        setCategoriesLoaded(true);
        setTagsLoaded(true);
      }
    };
    fetchData();
  }, []);

  // Fetch user's custom sections
  useEffect(() => {
    const fetchSections = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/profile-sections?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch sections');
        const data = await response.json();
        setSections(data.sections || []);
      } catch (error) {
        console.error('Error fetching sections:', error);
        setSections([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSections();
  }, [userId]);

  // Fetch posts for each section
  useEffect(() => {
    const fetchPosts = async () => {
      const newPosts: { [key: string]: any[] } = {};
      for (const section of sections) {
        try {
          let response;
          if (section.type === 'category') {
            response = await fetch(`/api/category-feed?category=${encodeURIComponent(section.name)}&limit=10&userId=${userId}`);
          } else {
            response = await fetch(`/api/get-posts-by-tag?tag=${encodeURIComponent(section.name)}&userId=${userId}`);
          }
          if (response.ok) {
            const data = await response.json();
            newPosts[section.id] = data.posts || [];
          }
        } catch (error) {
          console.error(`Error fetching posts for section ${section.name}:`, error);
          newPosts[section.id] = [];
        }
      }
      setPosts(newPosts);
    };
    if (sections.length > 0) {
      fetchPosts();
    }
  }, [sections, userId]);

  // Fetch user's posts (wait for Add Section UI)
  useEffect(() => {
    if (!isAddingSection) return;
    setIsLoadingOptions(true);
    const fetchUserPosts = async () => {
      try {
        const response = await fetch(`/api/get-user-posts?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user posts');
        const data = await response.json();
        setUserPosts(data.posts || []);
      } catch (error) {
        setUserPosts([]);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchUserPosts();
  }, [isAddingSection, userId]);

  // Extract user categories/tags only when all data is loaded
  useEffect(() => {
    if (!isAddingSection || !categoriesLoaded || !tagsLoaded || isLoadingOptions) return;
    // Debug logging
    console.log('User posts:', userPosts);
    console.log('All categories:', categories);
    console.log('All tags:', tags);
    let cats: { id: string; name: string }[] = [];
    let tagsArr: { id: string; name: string }[] = [];
    for (const post of userPosts) {
      // Categories
      if (post.fields.Categories && Array.isArray(post.fields.Categories)) {
        for (const catId of post.fields.Categories) {
          const cat = categories.find(c => c.id === catId);
          if (cat) cats.push(cat);
          else console.log('Category not found for ID:', catId);
        }
      }
      // Tags
      if (post.fields.UserTags && Array.isArray(post.fields.UserTags)) {
        for (const tagId of post.fields.UserTags) {
          const tag = tags.find(t => t.id === tagId);
          if (tag) tagsArr.push(tag);
          else console.log('Tag not found for ID:', tagId);
        }
      }
    }
    setUserCategories(uniqBy(cats, c => c.id));
    setUserTags(uniqBy(tagsArr, t => t.id));
  }, [isAddingSection, categoriesLoaded, tagsLoaded, isLoadingOptions, userPosts, categories, tags]);

  const handleAddSection = async () => {
    if (!selectedValue) return;
    const selectedItem = selectedType === 'category'
      ? userCategories.find(c => c.id === selectedValue)
      : userTags.find(t => t.id === selectedValue);
    if (!selectedItem) return;
    const newSection = {
      id: `${selectedType}-${selectedValue}`,
      type: selectedType,
      value: selectedValue,
      name: selectedItem.name
    };
    const updatedSections = [...sections, newSection];
    try {
      const response = await fetch('/api/profile-sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sections: updatedSections
        })
      });
      if (!response.ok) throw new Error('Failed to save section');
      setSections(updatedSections);
      setIsAddingSection(false);
      setSelectedValue('');
      setSearch('');
    } catch (error) {
      console.error('Error saving section:', error);
    }
  };

  const handleRemoveSection = async (sectionId: string) => {
    const updatedSections = sections.filter(s => s.id !== sectionId);
    try {
      const response = await fetch('/api/profile-sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sections: updatedSections
        })
      });
      if (!response.ok) throw new Error('Failed to remove section');
      setSections(updatedSections);
    } catch (error) {
      console.error('Error removing section:', error);
    }
  };

  // Filtered options for dropdown
  const filteredOptions = (selectedType === 'category' ? userCategories : userTags)
    .filter(opt => opt.name.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) {
    return <div className="text-center py-4">Loading sections...</div>;
  }

  return (
    <div className="space-y-8">
      {sections.map(section => {
        const knownCategories = [
          'music','comedy','gaming','food','film / tv / movies','beauty / fashion','learning','nature','crafting / tech','podcasts','sports','travel','following'
        ];
        const isKnownCategory = knownCategories.includes(section.name.toLowerCase());
        return (
          <div key={section.id} className="relative">
            <PostSlider
              title={section.name}
              posts={posts[section.id] || []}
              isLoading={!posts[section.id]}
              hideIcon={!isKnownCategory}
              onRenderActions={isOwnProfile ? (
                <button
                  onClick={() => handleRemoveSection(section.id)}
                  className="p-2 ml-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                  aria-label="Remove section"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              ) : null}
            />
          </div>
        );
      })}

      {isOwnProfile && (
        <div className="mt-8">
          {/* Limit to 8 sections */}
          {sections.length >= 8 ? (
            <div className="text-red-500 font-semibold text-center py-4">You can only create up to 8 sections.</div>
          ) : isAddingSection ? (
            <div className="bg-[#1a232b] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6 flex flex-col items-stretch w-full">
              {/* Header */}
              <div className="text-xl font-bold text-white mb-2">Display your posts from a specific category or tag</div>
              {/* Toggle for Category/Tag */}
              <div className="flex gap-4 mb-4">
                <button
                  className={`px-6 py-2 rounded-lg font-bold text-lg transition-all duration-200 shadow-sm ${selectedType === 'category' ? 'bg-red-600/20 text-red-500' : 'bg-white/10 text-white hover:bg-red-600/20 hover:text-red-500'}`}
                  onClick={() => { setSelectedType('category'); setSelectedValue(''); setSearch(''); }}
                >
                  Category
                </button>
                <button
                  className={`px-6 py-2 rounded-lg font-bold text-lg transition-all duration-200 shadow-sm ${selectedType === 'tag' ? 'bg-red-600/20 text-red-500' : 'bg-white/10 text-white hover:bg-red-600/20 hover:text-red-500'}`}
                  onClick={() => { setSelectedType('tag'); setSelectedValue(''); setSearch(''); }}
                >
                  Tag
                </button>
              </div>
              {/* Searchable Dropdown */}
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder={`Search ${selectedType}...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-[#11161b] border border-white/10 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-red-600 placeholder-gray-400"
                  disabled={isLoadingOptions}
                />
                <select
                  value={selectedValue}
                  onChange={e => setSelectedValue(e.target.value)}
                  className="bg-[#11161b] border border-white/10 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  disabled={isLoadingOptions || filteredOptions.length === 0}
                >
                  <option value="">Select {selectedType}...</option>
                  {filteredOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                {isLoadingOptions && <div className="text-red-500 text-base">Loading options...</div>}
                {!isLoadingOptions && filteredOptions.length === 0 && (
                  <div className="text-red-500 text-base">No {selectedType}s found. You need to post with a {selectedType} first.</div>
                )}
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => { setIsAddingSection(false); setSearch(''); }}
                  className="px-6 py-2 text-lg font-bold text-white bg-white/10 hover:bg-red-500/10 hover:text-red-500 rounded-lg shadow transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSection}
                  disabled={!selectedValue}
                  className="px-6 py-2 text-lg font-bold text-white bg-red-950 hover:bg-red-900 rounded-lg shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Section
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingSection(true)}
              className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-red-700 text-white rounded-lg shadow-lg transition-all duration-200 font-bold text-lg"
            >
              <PlusIcon className="w-7 h-7" />
              <span>Add Section</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
} 