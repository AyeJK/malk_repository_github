'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    displayName: '',
    bio: '',
    socialLink: '',
    profileImage: '',
    bannerImage: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setError('Not authenticated');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // First get the user by Firebase UID
        const userResponse = await fetch(`/api/get-user-by-id?id=${currentUser.uid}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();
        
        if (!userData.user) {
          throw new Error('User not found');
        }
        
        const userRecord = userData.user;
        setUserData(userRecord);
        
        // Initialize form data
        setFormData({
          id: userRecord.id,
          firstName: userRecord.fields?.FirstName || '',
          lastName: userRecord.fields?.LastName || '',
          email: userRecord.fields?.Email || '',
          displayName: userRecord.fields?.DisplayName || '',
          bio: userRecord.fields?.Bio || '',
          socialLink: userRecord.fields?.SocialLink || '',
          profileImage: userRecord.fields?.ProfileImage || '',
          bannerImage: userRecord.fields?.BannerImage || ''
        });
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Get the current user's ID token
      const idToken = currentUser ? await currentUser.getIdToken() : null;
      
      if (!idToken) {
        toast.error('You must be logged in to upload images');
        return;
      }

      // Create a FormData object
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Upload the image
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      // Update the form data with the new image URL
      setFormData(prev => ({
        ...prev,
        [type === 'profile' ? 'profileImage' : 'bannerImage']: data.url
      }));

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    
    try {
      // Get the current user's ID token
      const idToken = currentUser ? await currentUser.getIdToken() : null;
      
      if (!idToken) {
        toast.error('You must be logged in to update your profile');
        return;
      }
      
      console.log('Current user:', currentUser);
      console.log('Submitting form data:', formData);
      
      console.log('Making request with token...');
      const response = await fetch('/api/update-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(formData)
      });

      // Log the raw response for debugging
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Server returned invalid JSON');
      }
      
      if (!response.ok) {
        console.error('Update failed:', data);
        throw new Error(data.error || 'Failed to update profile');
      }

      setUserData(data.record);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Full-width Banner Image */}
      <div className="relative w-full h-48 md:h-64 bg-black group">
        {formData.bannerImage ? (
          <Image
            src={formData.bannerImage}
            alt="Profile Banner"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-dark to-accent"></div>
        )}
        {/* Banner Upload Overlay */}
        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <div className="flex flex-col items-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Change Banner Image</span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'banner')}
            className="hidden"
          />
        </label>
      </div>

      {/* Content Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative -mt-24">
          {/* Profile Image */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-dark-lighter bg-dark-lighter group">
            {formData.profileImage ? (
              <Image
                src={formData.profileImage}
                alt={formData.displayName || 'User Profile'}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            {/* Profile Image Upload Overlay */}
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <div className="flex flex-col items-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs">Edit</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'profile')}
                className="hidden"
              />
            </label>
          </div>

          {/* User Info Form */}
          <div className="mt-6 bg-dark-lighter rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Social Link</label>
                <input
                  type="url"
                  name="socialLink"
                  value={formData.socialLink}
                  onChange={handleInputChange}
                  className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="mt-8 bg-dark-lighter rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Additional Settings</h2>
          {/* Add more settings sections here */}
        </div>
      </div>
    </div>
  );
} 