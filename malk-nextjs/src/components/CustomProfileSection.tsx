import { useState, useEffect } from 'react';
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

export default function CustomProfileSection({ userId, isOwnProfile, userAvatar, userName }: CustomProfileSectionProps) {
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
              title={section.type === 'tag' ? `#${section.name}` : section.name}
              posts={posts[section.id] || []}
              isLoading={!posts[section.id]}
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
            />
          </div>
        );
      })}
    </div>
  );
} 