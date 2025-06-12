import { useState, useEffect, useRef } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import PostSlider from './PostSlider';

interface CustomProfileSectionProps {
  userId: string;
  isOwnProfile: boolean;
  userAvatar?: string;
  userName?: string;
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

// Section type for discriminated union
type Section =
  | { id: string; type: 'category'; value: string; name: string; slug: string }
  | { id: string; type: 'tag'; value: string; name: string };

export default function CustomProfileSection({ userId, isOwnProfile, userAvatar, userName }: CustomProfileSectionProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [selectedType, setSelectedType] = useState<'category' | 'tag'>('category');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug?: string }>>([]);
  const [tags, setTags] = useState<Array<{ id: string; name: string }>>([]);
  const [userCategories, setUserCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [userTags, setUserTags] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [posts, setPosts] = useState<{ [key: string]: any[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [search, setSearch] = useState('');
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [tagsLoaded, setTagsLoaded] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  // New state for paginated category posts
  const [categorySectionState, setCategorySectionState] = useState<{ [key: string]: { posts: any[]; offset: string | null; hasMore: boolean; isLoading: boolean } }>({});
  // Add new state for paginated tag posts
  const [tagSectionState, setTagSectionState] = useState<{ [key: string]: { posts: any[]; offset: string | null; hasMore: boolean; isLoading: boolean } }>({});
  const loaderRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Fetch categories and tags
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await fetch('/api/get-categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
        console.log('Canonical categories:', categoriesData.categories);
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

  // Fetch posts for each section (initial load)
  useEffect(() => {
    if (sections.length === 0) return;
    // 1. Set all section states to isLoading: true and empty posts
    const initialCategoryState: typeof categorySectionState = {};
    const initialTagState: typeof tagSectionState = {};
    for (const section of sections) {
      if (section.type === 'category') {
        initialCategoryState[section.id] = { posts: [], offset: null, hasMore: true, isLoading: true };
      } else if (section.type === 'tag') {
        initialTagState[section.id] = { posts: [], offset: null, hasMore: true, isLoading: true };
      }
    }
    setCategorySectionState(initialCategoryState);
    setTagSectionState(initialTagState);

    // 2. Fetch posts for each section and update state individually
    for (const section of sections) {
      if (section.type === 'category') {
        (async () => {
          try {
            const slug = section.slug;
            const res = await fetch(`/api/get-posts-by-category?slug=${encodeURIComponent(slug)}&limit=10&userId=${userId}`);
            if (res.ok) {
              const data = await res.json();
              setCategorySectionState(prev => ({
                ...prev,
                [section.id]: {
                  posts: data.posts || [],
                  offset: data.nextOffset,
                  hasMore: !!data.nextOffset,
                  isLoading: false,
                },
              }));
            } else {
              setCategorySectionState(prev => ({
                ...prev,
                [section.id]: { posts: [], offset: null, hasMore: false, isLoading: false },
              }));
            }
          } catch (error) {
            setCategorySectionState(prev => ({
              ...prev,
              [section.id]: { posts: [], offset: null, hasMore: false, isLoading: false },
            }));
          }
        })();
      } else if (section.type === 'tag') {
        (async () => {
          try {
            const res = await fetch(`/api/get-posts-by-tag?tag=${encodeURIComponent(section.name)}&limit=10&userId=${userId}`);
            if (res.ok) {
              const data = await res.json();
              setTagSectionState(prev => ({
                ...prev,
                [section.id]: {
                  posts: data.posts || [],
                  offset: data.nextOffset,
                  hasMore: !!data.nextOffset,
                  isLoading: false,
                },
              }));
            } else {
              setTagSectionState(prev => ({
                ...prev,
                [section.id]: { posts: [], offset: null, hasMore: false, isLoading: false },
              }));
            }
          } catch (error) {
            setTagSectionState(prev => ({
              ...prev,
              [section.id]: { posts: [], offset: null, hasMore: false, isLoading: false },
            }));
          }
        })();
      }
    }
  }, [sections, userId]);

  // Infinite scroll for category sections
  useEffect(() => {
    const observers: { [key: string]: IntersectionObserver } = {};
    sections.forEach(section => {
      if (section.type === 'category' && loaderRefs.current[section.id]) {
        if (observers[section.id]) observers[section.id].disconnect();
        observers[section.id] = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
            // Fetch next page if hasMore and not already loading
            const state = categorySectionState[section.id];
            if (state && state.hasMore && !state.isLoading) {
              fetchMoreCategoryPosts(section.id, section.name, state.offset);
            }
          }
        }, { threshold: 1 });
        observers[section.id].observe(loaderRefs.current[section.id]!);
      }
    });
    return () => {
      Object.values(observers).forEach(obs => obs.disconnect());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, categorySectionState]);

  // Fetch more posts for a category section
  const fetchMoreCategoryPosts = async (sectionId: string, sectionName: string, offset: string | null) => {
    setCategorySectionState(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        isLoading: true,
      },
    }));
    try {
      // Use get-posts-by-category API (slug param, offset is index)
      const section = sections.find(s => s.id === sectionId);
      if (!section || section.type !== 'category') return;
      console.log('Fetching category posts with slug:', section.slug, 'for section:', section);
      const res = await fetch(`/api/get-posts-by-category?slug=${encodeURIComponent(section.slug)}&limit=10&userId=${userId}&offset=${offset}`);
      if (res.ok) {
        const data = await res.json();
        setCategorySectionState(prev => ({
          ...prev,
          [sectionId]: {
            posts: uniqBy([...(prev[sectionId]?.posts || []), ...(data.posts || [])], post => post.id),
            offset: data.nextOffset,
            hasMore: !!data.nextOffset,
            isLoading: false,
          },
        }));
        setPosts(prev => ({
          ...prev,
          [sectionId]: uniqBy([...(prev[sectionId] || []), ...(data.posts || [])], post => post.id),
        }));
      } else {
        setCategorySectionState(prev => ({
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            hasMore: false,
            isLoading: false,
          },
        }));
      }
    } catch (error) {
      setCategorySectionState(prev => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          hasMore: false,
          isLoading: false,
        },
      }));
    }
  };

  // Infinite scroll for tag sections
  useEffect(() => {
    const observers: { [key: string]: IntersectionObserver } = {};
    sections.forEach(section => {
      if (section.type === 'tag' && loaderRefs.current[section.id]) {
        if (observers[section.id]) observers[section.id].disconnect();
        observers[section.id] = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
            const state = tagSectionState[section.id];
            if (state && state.hasMore && !state.isLoading) {
              fetchMoreTagPosts(section.id, section.name, state.offset);
            }
          }
        }, { threshold: 1 });
        observers[section.id].observe(loaderRefs.current[section.id]!);
      }
    });
    return () => {
      Object.values(observers).forEach(obs => obs.disconnect());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, tagSectionState]);

  // Fetch more posts for a tag section
  const fetchMoreTagPosts = async (sectionId: string, tagName: string, offset: string | null) => {
    setTagSectionState(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        isLoading: true,
      },
    }));
    try {
      const res = await fetch(`/api/get-posts-by-tag?tag=${encodeURIComponent(tagName)}&limit=10&userId=${userId}&offset=${offset}`);
      if (res.ok) {
        const data = await res.json();
        setTagSectionState(prev => ({
          ...prev,
          [sectionId]: {
            posts: uniqBy([...(prev[sectionId]?.posts || []), ...(data.posts || [])], post => post.id),
            offset: data.nextOffset,
            hasMore: !!data.nextOffset,
            isLoading: false,
          },
        }));
      } else {
        setTagSectionState(prev => ({
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            hasMore: false,
            isLoading: false,
          },
        }));
      }
    } catch (error) {
      setTagSectionState(prev => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          hasMore: false,
          isLoading: false,
        },
      }));
    }
  };

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

  // When building userCategories, always use the canonical categories list from /api/get-categories
  // and include slug
  useEffect(() => {
    if (!isAddingSection || !categoriesLoaded || !tagsLoaded || isLoadingOptions) return;
    let cats: { id: string; name: string; slug: string }[] = [];
    let tagsArr: { id: string; name: string }[] = [];
    for (const post of userPosts) {
      // Categories
      if (post.fields.Categories && Array.isArray(post.fields.Categories)) {
        for (const catId of post.fields.Categories) {
          // Always cross-reference canonical categories list by ID
          const cat = categories.find(c => c.id === catId);
          if (cat && typeof cat.slug === 'string') {
            cats.push({ id: cat.id, name: cat.name, slug: cat.slug });
          } else if (cat && !cat.slug) {
            console.warn('Category missing slug in canonical list:', cat);
          }
        }
      }
      // Tags
      if (post.fields.UserTags && Array.isArray(post.fields.UserTags)) {
        for (const tagId of post.fields.UserTags) {
          const tag = tags.find(t => t.id === tagId);
          if (tag) tagsArr.push({ id: tag.id, name: tag.name });
        }
      }
    }
    setUserCategories(cats);
    setUserTags(tagsArr);
  }, [isAddingSection, categoriesLoaded, tagsLoaded, isLoadingOptions, userPosts, categories, tags]);

  // When adding a section, store both name and slug for categories
  const handleAddSection = async () => {
    if (!selectedValue) return;
    let newSection: Section | null = null;
    if (selectedType === 'category') {
      // Always look up the full category object by ID from canonical list
      const selectedCategory = categories.find(c => c.id === selectedValue);
      console.log('Selected category for new section:', selectedCategory);
      if (!selectedCategory) return;
      if (!selectedCategory.slug) {
        console.warn('Cannot add section: selected category missing slug:', selectedCategory);
        return;
      }
      newSection = {
        id: `category-${selectedValue}`,
        type: 'category',
        value: selectedValue,
        name: selectedCategory.name,
        slug: selectedCategory.slug
      };
    } else if (selectedType === 'tag') {
      const selectedTag = userTags.find(t => t.id === selectedValue);
      if (!selectedTag) return;
      newSection = {
        id: `tag-${selectedValue}`,
        type: 'tag',
        value: selectedValue,
        name: selectedTag.name
      };
    }
    if (!newSection) return;
    // Save the full section object (including slug) to the backend
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
    } catch (error) {
      console.error('Error saving section:', error);
    }
    setIsAddingSection(false);
    setSelectedType('category');
    setSelectedValue('');
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
        // Use paginated posts for both category and tag sections
        const sectionPosts = section.type === 'category'
          ? (categorySectionState[section.id]?.posts || [])
          : (tagSectionState[section.id]?.posts || []);
        return (
          <div key={section.id} className="relative">
            <PostSlider
              title={section.type === 'tag' ? `#${section.name}` : section.name}
              posts={sectionPosts}
              isLoading={section.type === 'category'
                ? categorySectionState[section.id]?.isLoading
                : tagSectionState[section.id]?.isLoading}
              hideIcon={!isKnownCategory}
              userAvatar={userAvatar}
              userName={userName}
              onRenderActions={isOwnProfile ? (
                <button
                  onClick={() => handleRemoveSection(section.id)}
                  className="p-2 ml-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                  aria-label="Remove section"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              ) : null}
              hasMore={section.type === 'category'
                ? categorySectionState[section.id]?.hasMore
                : tagSectionState[section.id]?.hasMore}
              onLoadMore={section.type === 'category'
                ? () => {
                    const state = categorySectionState[section.id];
                    if (state && state.hasMore && !state.isLoading) {
                      fetchMoreCategoryPosts(section.id, section.name, state.offset);
                    }
                  }
                : () => {
                    const state = tagSectionState[section.id];
                    if (state && state.hasMore && !state.isLoading) {
                      fetchMoreTagPosts(section.id, section.name, state.offset);
                    }
                  }}
            />
          </div>
        );
      })}
    </div>
  );
} 