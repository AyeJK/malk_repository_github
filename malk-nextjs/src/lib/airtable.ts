import Airtable from 'airtable';
import { getVideoTitle } from './video-utils';

// Initialize Airtable
export const base = new Airtable({
  apiKey: process.env.AIRTABLE_PAT || process.env.NEXT_PUBLIC_AIRTABLE_PAT,
}).base(process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');

// Add initialization check
if (!process.env.AIRTABLE_PAT && !process.env.NEXT_PUBLIC_AIRTABLE_PAT) {
  console.error('Airtable API key is missing. Please set either AIRTABLE_PAT or NEXT_PUBLIC_AIRTABLE_PAT');
}
if (!process.env.AIRTABLE_BASE_ID && !process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID) {
  console.error('Airtable Base ID is missing. Please set either AIRTABLE_BASE_ID or NEXT_PUBLIC_AIRTABLE_BASE_ID');
}

// Define types for our data
export interface ContentItem {
  id: string;
  fields: {
    Name: string;
    Description?: string;
    Status?: string;
    [key: string]: any;
  };
}

export interface UserRecord {
  id: string;
  fields: {
    FirebaseUID: string;
    Email: string;
    CreatedAt: string;
    LastLogin: string;
    PostCount?: number;
    DisplayName?: string;
    FirstName?: string;
    LastName?: string;
    Bio?: string;
    SocialLink?: string;
    ProfileImage?: string;
    BannerImage?: string;
    Role?: string;
    Posts?: string[]; // Array of Post record IDs
    LikedPosts?: string[]; // Array of Post record IDs
    UserIsFollowing?: string[]; // Array of User record IDs
    UsersFollowedCount?: number;
    FollowingThisUser?: string[]; // Array of User record IDs
    FollowerCount?: number;
    Playlists?: string[]; // Array of Playlist record IDs
    PlaylistCount?: number;
    LastModified?: string;
    LastLikeAction?: string;
    LastFollowAction?: string;
    Feedback?: string[]; // Array of Feedback record IDs
    ProfileURL?: string;
    [key: string]: any;
  };
}

export interface PostRecord {
  id: string;
  fields: {
    PostId?: string;
    FirebaseUID: string[]; // Link to Users table
    DisplayName?: string;
    PostCount?: number;
    Slug?: string;
    VideoTitle?: string;
    VideoURL: string;
    'Video ID'?: string;
    UserCaption: string;
    UserTags?: string[]; // Link to Tags table
    Categories?: string[]; // Link to Categories table
    UserLikes?: string[];
    LikeCount?: number;
    Playlists?: string[];
    PlaylistCount?: number;
    LikeFieldLastModified?: string;
    LastModified?: string;
    DateCreated?: string;
    ThumbnailURL?: string;
    'Post URL'?: string;
    [key: string]: any;
  };
}

interface CreatePostParams {
  firebaseUID: string;
  videoURL: string;
  userCaption: string;
  userTags?: string[];
  categories?: string[];
  importId?: string;
}

// Notification record interface
export interface NotificationRecord {
  id: string;
  fields: {
    'Notification ID'?: number;
    'User (Recipient)': string[]; // Linked to Users table
    'Type': 'New Like' | 'New Comment' | 'New Follow' | 'New Feature';
    'Related User'?: string[]; // Linked to Users table
    'Related Post'?: string[]; // Linked to Posts table
    'Related Comment'?: string[]; // Linked to Comments table
    'Is Read'?: boolean;
    'Email Sent'?: boolean;
    'Created At'?: string;
    [key: string]: any;
  };
}

// Function to list all tables in the base
export async function listTables(): Promise<string[]> {
  try {
    // Airtable API doesn't provide a direct way to list tables
    // We'll need to make a request to the base and check the response
    console.log('Attempting to list tables...');
    console.log('Base ID:', process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID);
    
    const knownTables = ['Content', 'posts', 'Users'];
    const availableTables: string[] = [];
    
    // Try to access each known table
    for (const tableName of knownTables) {
      try {
        const records = await base(tableName).select({ maxRecords: 1 }).firstPage();
        console.log(`Table '${tableName}' exists with ${records.length} records`);
        availableTables.push(tableName);
      } catch (error) {
        console.error(`Error accessing table '${tableName}':`, error);
        // Table doesn't exist or there's an error accessing it
      }
    }
    
    return availableTables;
  } catch (error) {
    console.error('Error listing tables:', error);
    return [];
  }
}

// Function to get column names from a table
export async function getColumnNames(tableName: string): Promise<string[]> {
  try {
    console.log(`Getting column names for table: ${tableName}`);
    const records = await base(tableName).select({ maxRecords: 1 }).firstPage();
    
    if (records.length === 0) {
      console.log(`No records found in table '${tableName}'`);
      return [];
    }
    
    // Get all field names from the first record
    const columnNames = Object.keys(records[0].fields);
    console.log(`Column names for table '${tableName}':`, columnNames);
    return columnNames;
  } catch (error) {
    console.error(`Error getting column names for table '${tableName}':`, error);
    return [];
  }
}

// Function to fetch all records from a table
export async function fetchRecords(tableName: string): Promise<ContentItem[]> {
  try {
    const records = await base(tableName).select().all();
    return records.map(record => ({
      id: record.id,
      fields: record.fields as any,
    }));
  } catch (error) {
    console.error('Error fetching records:', error);
    return [];
  }
}

// Function to fetch a single record by ID
export async function fetchRecordById(tableName: string, recordId: string): Promise<ContentItem | null> {
  try {
    const record = await base(tableName).find(recordId);
    return {
      id: record.id,
      fields: record.fields as any,
    };
  } catch (error) {
    console.error('Error fetching record:', error);
    return null;
  }
}

// Function to create a new record
export async function createRecord(tableName: string, fields: Record<string, any>): Promise<ContentItem | null> {
  try {
    const record = await base(tableName).create([
      { fields }
    ]);
    return {
      id: record[0].id,
      fields: record[0].fields as any,
    };
  } catch (error) {
    console.error('Error creating record:', error);
    return null;
  }
}

// Function to update a record
export async function updateRecord(tableName: string, recordId: string, fields: Record<string, any>): Promise<ContentItem | null> {
  try {
    const record = await base(tableName).update([
      { id: recordId, fields }
    ]);
    return {
      id: record[0].id,
      fields: record[0].fields as any,
    };
  } catch (error) {
    console.error('Error updating record:', error);
    return null;
  }
}

// Function to delete a record
export async function deleteRecord(tableName: string, recordId: string): Promise<boolean> {
  try {
    await base(tableName).destroy([recordId]);
    return true;
  } catch (error) {
    console.error('Error deleting record:', error);
    return false;
  }
}

// Function to create or update a user record
export async function upsertUser(userData: {
  email: string;
  firebaseUID: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  socialLink?: string;
  profileImage?: string;
  bannerImage?: string;
  role?: string;
  postCount?: number;
  profileURL?: string;
}): Promise<UserRecord | null> {
  try {
    console.log('Attempting to upsert user:', userData.email);
    console.log('Airtable Base ID:', process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID);
    console.log('Airtable PAT available:', !!process.env.NEXT_PUBLIC_AIRTABLE_PAT || !!process.env.AIRTABLE_PAT);
    
    // First, try to find an existing user with the same Firebase UID
    const records = await base('Users').select({
      filterByFormula: `{FirebaseUID} = '${userData.firebaseUID}'`,
      maxRecords: 1
    }).firstPage();

    console.log('Existing user records found:', records.length);
    
    const now = new Date().toISOString();
    
    if (records.length > 0) {
      // Update existing user
      console.log('Updating existing user record:', records[0].id);
      const record = records[0];
      const updatedFields: Record<string, any> = {
        Email: userData.email,
        LastLogin: now
      };
      
      // Only update optional fields if they are provided
      if (userData.displayName !== undefined) updatedFields.DisplayName = userData.displayName;
      if (userData.firstName !== undefined) updatedFields.FirstName = userData.firstName;
      if (userData.lastName !== undefined) updatedFields.LastName = userData.lastName;
      if (userData.bio !== undefined) updatedFields.Bio = userData.bio;
      if (userData.socialLink !== undefined) updatedFields.SocialLink = userData.socialLink;
      if (userData.profileImage !== undefined) updatedFields.ProfileImage = userData.profileImage;
      if (userData.bannerImage !== undefined) updatedFields.BannerImage = userData.bannerImage;
      if (userData.role !== undefined) updatedFields.Role = userData.role;
      if (userData.profileURL !== undefined) updatedFields.ProfileURL = userData.profileURL;
      
      try {
        const updatedRecord = await base('Users').update([
          {
            id: record.id,
            fields: updatedFields
          }
        ]);
        
        console.log('User record updated successfully:', updatedRecord[0].id);
        
        return {
          id: updatedRecord[0].id,
          fields: updatedRecord[0].fields as any
        };
      } catch (updateError) {
        console.error('Error updating user record:', updateError);
        throw updateError;
      }
    } else {
      // Create new user
      console.log('Creating new user record');
      const newFields: Record<string, any> = {
        FirebaseUID: userData.firebaseUID,
        Email: userData.email,
        CreatedAt: now,
        LastLogin: now,
        Role: userData.role || 'User'
      };
      
      // Add optional fields if provided
      if (userData.displayName) newFields.DisplayName = userData.displayName;
      if (userData.firstName) newFields.FirstName = userData.firstName;
      if (userData.lastName) newFields.LastName = userData.lastName;
      if (userData.bio) newFields.Bio = userData.bio;
      if (userData.socialLink) newFields.SocialLink = userData.socialLink;
      if (userData.profileImage) newFields.ProfileImage = userData.profileImage;
      if (userData.bannerImage) newFields.BannerImage = userData.bannerImage;
      if (userData.profileURL) newFields.ProfileURL = userData.profileURL;
      
      // Initialize empty arrays for linked records
      newFields.Posts = [];
      newFields.LikedPosts = [];
      newFields.UserIsFollowing = [];
      newFields.FollowingThisUser = [];
      newFields.Playlists = [];
      newFields.Feedback = [];
      
      try {
        const newRecord = await base('Users').create([
          {
            fields: newFields
          }
        ]);
        
        console.log('User record created successfully:', newRecord[0].id);
        
        return {
          id: newRecord[0].id,
          fields: newRecord[0].fields as any
        };
      } catch (createError) {
        console.error('Error creating user record:', createError);
        throw createError;
      }
    }
  } catch (error) {
    console.error('Error upserting user:', error);
    return null;
  }
}

// Function to get user by Firebase UID
export async function getUserByFirebaseUID(firebaseUID: string): Promise<UserRecord | null> {
  try {
    const records = await base('Users').select({
      filterByFormula: `{FirebaseUID} = '${firebaseUID}'`,
      maxRecords: 1
    }).firstPage();

    if (records.length > 0) {
      return {
        id: records[0].id,
        fields: records[0].fields as any
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user by Firebase UID:', error);
    return null;
  }
}

// Function to ensure Posts table exists
export async function ensurePostsTableExists(): Promise<boolean> {
  try {
    // Try to access the Posts table
    const table = base('Posts');
    const records = await table.select({
      maxRecords: 1
    }).firstPage();
    
    console.log('Posts table exists with', records.length, 'records');
    return true;
  } catch (error) {
    console.error('Error accessing Posts table:', error);
    console.log('Please create the Posts table in Airtable with the following fields:');
    console.log('- PostID (Formula): CONCATENATE(FirebaseUID, "-p-", RIGHT(RECORD_ID(), 17))');
    console.log('- FirebaseUID (Link to Users)');
    console.log('- DisplayName (Lookup from Users)');
    console.log('- Postcount (Lookup from Users)');
    console.log('- Slug (Formula): CONCATENATE(FirebaseUID, "-p-", RIGHT(RECORD_ID(), 17))');
    console.log('- VideoURL (URL)');
    console.log('- UserCaption (Long Text)');
    console.log('- UserTags (Link to Tags)');
    console.log('- Categories (Link to Categories)');
    console.log('- UserLikes (Link to Users)');
    console.log('- LikeCount (Lookup from Users)');
    console.log('- Playlists (Link to Playlists)');
    console.log('- PlaylistCount (Lookup from Playlists)');
    console.log('- LikeFieldLastModified (Calculated)');
    console.log('- DateCreated (Calculated)');
    console.log('- ThumbnailURL (Formula): "https://img.youtube.com/vi/" & {Video ID} & "/maxresdefault.jpg"');
    console.log('- PostURL (Unused)');
    return false;
  }
}

// Function to create a new post
export async function createPost(params: CreatePostParams) {
  try {
    console.log('Creating post with data:', {
      firebaseUID: params.firebaseUID,
      videoURL: params.videoURL,
      userCaption: params.userCaption,
      userTags: params.userTags,
      categories: params.categories
    });

    // First, find the user's Airtable record ID using their Firebase UID
    console.log('Looking up user with Firebase UID:', params.firebaseUID);
    const userRecords = await base('Users').select({
      filterByFormula: `{FirebaseUID} = '${params.firebaseUID}'`,
      maxRecords: 1
    }).firstPage();

    if (userRecords.length === 0) {
      throw new Error(`User with Firebase UID ${params.firebaseUID} not found in Airtable`);
    }

    console.log('User record found:', userRecords[0].id);
    const userAirtableId = userRecords[0].id;

    // Get video title
    let videoTitle;
    try {
      videoTitle = await getVideoTitle(params.videoURL);
      console.log('Successfully got video title:', videoTitle);
    } catch (titleError) {
      console.error('Error getting video title:', titleError);
      videoTitle = 'Title unavailable';
    }

    // Create tags if they don't exist
    const tagIds = [];
    if (params.userTags && params.userTags.length > 0) {
      for (const tagName of params.userTags) {
        try {
          const tagId = await createTagIfNotExists(tagName);
          if (tagId) {
            tagIds.push(tagId);
          }
        } catch (tagError) {
          console.error(`Error creating tag "${tagName}":`, tagError);
        }
      }
      console.log('Tag IDs:', tagIds);
    }

    // Add categories if provided
    const categoryIds = [];
    if (params.categories && params.categories.length > 0) {
      for (const categoryName of params.categories) {
        try {
          const categoryId = await createCategoryIfNotExists(categoryName);
          if (categoryId) {
            categoryIds.push(categoryId);
          }
        } catch (categoryError) {
          console.error(`Error creating category "${categoryName}":`, categoryError);
        }
      }
    }

    // Create the post fields
    const fields: any = {
      FirebaseUID: [userAirtableId], // Use the Airtable record ID instead of Firebase UID
      VideoURL: params.videoURL,
      UserCaption: params.userCaption,
      VideoTitle: videoTitle // Add video title
    };

    // Add tags if we have any
    if (tagIds.length > 0) {
      fields.UserTags = tagIds;
    }

    // Add categories if we have any
    if (categoryIds.length > 0) {
      fields.Categories = categoryIds;
    }

    // Add import ID if provided
    if (params.importId) {
      fields.ImportId = params.importId;
    }

    try {
      const records = await base('Posts').create([{ fields }]);
      return records[0];
    } catch (createError: any) {
      console.error('Error creating post record:', {
        error: createError.message,
        fields: fields,
        details: createError.details || 'No additional details'
      });
      throw new Error(`Failed to create post: ${createError.message}`);
    }
  } catch (error: any) {
    console.error('Error in createPost:', {
      error: error.message,
      params: params,
      stack: error.stack
    });
    throw error;
  }
}

// Helper function to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Function to get a user's posts
export async function getUserPosts(firebaseUID: string): Promise<PostRecord[]> {
  try {
    console.log('Fetching posts for user with Firebase UID:', firebaseUID);
    
    // Get all posts for this user by filtering on the FirebaseUID field
    const posts = await base('Posts').select({
      filterByFormula: `{FirebaseUID} = '${firebaseUID}'`,
      sort: [{ field: 'DisplayDate', direction: 'desc' }]
    }).all();
    
    console.log(`Found ${posts.length} posts for user with Firebase UID: ${firebaseUID}`);
    console.log('User posts:', posts.map(post => ({
      id: post.id,
      fields: {
        VideoTitle: post.fields.VideoTitle,
        FirebaseUID: post.fields.FirebaseUID
      }
    })));
    
    return posts.map(post => ({
      id: post.id,
      fields: post.fields as any
    }));
  } catch (error) {
    console.error('Error getting user posts:', error);
    return [];
  }
}

// Function to ensure the Users table exists
export async function ensureUsersTableExists(): Promise<boolean> {
  try {
    console.log('Checking if Users table exists...');
    
    // Try to access the Users table
    try {
      const records = await base('Users').select({ maxRecords: 1 }).firstPage();
      console.log('Users table exists with', records.length, 'records');
      return true;
    } catch (error) {
      console.log('Users table does not exist or cannot be accessed');
      
      // Note: Airtable API doesn't provide a direct way to create tables
      // This would typically be done through the Airtable UI
      console.log('Please create a Users table in your Airtable base with the following fields:');
      console.log('- FirebaseUID (Single line text)');
      console.log('- Email (Single line text)');
      console.log('- CreatedAt (Date time)');
      console.log('- LastLogin (Date time)');
      console.log('- LastModified (Date time)');
      console.log('- PostCount (Number)');
      console.log('- DisplayName (Single line text)');
      console.log('- FirstName (Single line text)');
      console.log('- LastName (Single line text)');
      console.log('- Bio (Long text)');
      console.log('- SocialLink (URL)');
      console.log('- ProfileImage (URL)');
      console.log('- BannerImage (URL)');
      console.log('- Role (Single line text)');
      console.log('- Posts (Multiple select)');
      console.log('- LikedPosts (Multiple select)');
      console.log('- UserIsFollowing (Multiple select)');
      console.log('- UsersFollowedCount (Number)');
      console.log('- FollowingThisUser (Multiple select)');
      console.log('- FollowerCount (Number)');
      console.log('- Playlists (Multiple select)');
      console.log('- PlaylistCount (Number)');
      console.log('- LastLikeAction (Date time)');
      console.log('- LastFollowAction (Date time)');
      console.log('- Feedback (Multiple select)');
      console.log('- ProfileURL (Single line text)');
      
      return false;
    }
  } catch (error) {
    console.error('Error checking Users table:', error);
    return false;
  }
}

// Function to search for tags
export async function searchTags(query: string): Promise<string[]> {
  try {
    // Check if the Tags table exists
    try {
      await base('Tags').select({ maxRecords: 1 }).firstPage();
    } catch (error) {
      console.error('Tags table does not exist or cannot be accessed:', error);
      return [];
    }

    // Search for tags that match the query
    const records = await base('Tags').select({
      filterByFormula: `SEARCH('${query.toLowerCase()}', LOWER({Name}))`,
      maxRecords: 10
    }).firstPage();

    // Extract tag names from the records
    return records.map(record => record.fields.Name as string);
  } catch (error) {
    console.error('Error searching tags:', error);
    return [];
  }
}

// Function to create a tag if it doesn't exist
export async function createTagIfNotExists(tagName: string): Promise<string | null> {
  try {
    // Normalize the tag name
    const normalizedTagName = tagName.toLowerCase().trim();
    
    // Check if the tag already exists
    const records = await base('Tags').select({
      filterByFormula: `{Name} = '${normalizedTagName}'`,
      maxRecords: 1
    }).firstPage();
    
    if (records.length > 0) {
      // Tag already exists, return its ID
      return records[0].id;
    }
    
    // Tag doesn't exist, create it
    const newRecord = await base('Tags').create([
      { fields: { Name: normalizedTagName } }
    ]);
    
    return newRecord[0].id;
  } catch (error) {
    console.error('Error creating tag:', error);
    return null;
  }
}

// Function to ensure Categories table exists
export async function ensureCategoriesTableExists(): Promise<boolean> {
  try {
    // Try to access the Categories table
    const table = base('Categories');
    const records = await table.select({
      maxRecords: 1
    }).firstPage();
    
    console.log('Categories table exists with', records.length, 'records');
    return true;
  } catch (error) {
    console.error('Error accessing Categories table:', error);
    console.log('Please create the Categories table in Airtable with the following fields:');
    console.log('- Name (Single line text)');
    console.log('- Description (Long text)');
    console.log('- Slug (Formula): LOWER(REPLACE({Name}, " ", "-"))');
    return false;
  }
}

// Function to create a category if it doesn't exist
export async function createCategoryIfNotExists(categoryName: string): Promise<string | null> {
  try {
    // Normalize the category name
    const normalizedCategoryName = categoryName.trim();
    
    // Check if the category already exists
    const records = await base('Categories').select({
      filterByFormula: `{Name} = '${normalizedCategoryName}'`,
      maxRecords: 1
    }).firstPage();
    
    if (records.length > 0) {
      // Category already exists, return its ID
      return records[0].id;
    }
    
    // Category doesn't exist, create it
    const newRecord = await base('Categories').create([
      { fields: { Name: normalizedCategoryName } }
    ]);
    
    return newRecord[0].id;
  } catch (error) {
    console.error('Error creating category:', error);
    return null;
  }
}

/**
 * Get all posts from Airtable, sorted by date created (newest first)
 */
export async function getAllPosts(): Promise<PostRecord[]> {
  try {
    // Ensure the Posts table exists
    await ensurePostsTableExists();
    
    // Get all records from the Posts table, sorted by DisplayDate in descending order
    const records = await base('Posts').select({
      sort: [{ field: 'DisplayDate', direction: 'desc' }],
      view: 'Grid view'
    }).all();
    
    console.log('Fetched posts:', records.map(record => ({
      id: record.id,
      fields: {
        VideoTitle: record.fields.VideoTitle,
        FirebaseUID: record.fields.FirebaseUID
      }
    })));
    
    return records.map(record => ({
      id: record.id,
      fields: record.fields as any,
    }));
  } catch (error) {
    console.error('Error getting all posts:', error);
    return [];
  }
}

// Function to get a user's liked posts
export async function getUserLikedPosts(firebaseUID: string): Promise<PostRecord[]> {
  try {
    console.log('Fetching liked posts for user with Firebase UID:', firebaseUID);
    
    // First, get the user record to access the LikedPosts field
    const userRecord = await getUserByFirebaseUID(firebaseUID);
    if (!userRecord) {
      console.error('User not found:', firebaseUID);
      return [];
    }
    
    // Get the liked post IDs from the user record
    const likedPostIds = userRecord.fields.LikedPosts || [];
    console.log(`User has ${likedPostIds.length} liked posts`);
    
    if (likedPostIds.length === 0) {
      return [];
    }
    
    // Fetch the posts using the liked post IDs
    const posts = await base('Posts').select({
      filterByFormula: `OR(${likedPostIds.map(id => `RECORD_ID() = '${id}'`).join(',')})`,
      sort: [{ field: 'DisplayDate', direction: 'desc' }]
    }).all();
    
    console.log(`Found ${posts.length} liked posts for user with Firebase UID: ${firebaseUID}`);
    
    return posts.map(post => ({
      id: post.id,
      fields: post.fields as any
    }));
  } catch (error) {
    console.error('Error getting user liked posts:', error);
    return [];
  }
}

// Function to get the Airtable client
export function getAirtableClient() {
  return base;
}

export async function getPost(postId: string): Promise<PostRecord | null> {
  try {
    const record = await base('Posts').find(postId);
    return {
      id: record.id,
      fields: record.fields as any,
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

// Function to get invite code record by code value
export async function getInviteCodeRecord(inviteCode: string) {
  try {
    const records = await base('Invite Codes').select({
      filterByFormula: `{Invite Code} = '${inviteCode}'`,
      maxRecords: 1
    }).firstPage();
    if (records.length > 0) {
      return {
        id: records[0].id,
        fields: records[0].fields as any
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting invite code record:', error);
    return null;
  }
}

// Create a notification
export async function createNotification(fields: Omit<NotificationRecord['fields'], 'Notification ID' | 'Created At'>): Promise<NotificationRecord | null> {
  try {
    const record = await base('Notifications').create([{ fields }]);
    return {
      id: record[0].id,
      fields: record[0].fields as NotificationRecord['fields'],
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

// Fetch notifications for a user (by User (Recipient) record ID)
export async function getNotificationsForUser(userId: string, options: { onlyUnread?: boolean } = {}): Promise<NotificationRecord[]> {
  try {
    const filterByFormula = `AND({User (Recipient)} = '${userId}'${options.onlyUnread ? ", {Is Read} = FALSE()" : ''})`;
    const records = await base('Notifications')
      .select({
        filterByFormula,
        sort: [{ field: 'Created At', direction: 'desc' }],
        maxRecords: 100,
      })
      .all();
    return records.map(record => ({
      id: record.id,
      fields: record.fields as NotificationRecord['fields'],
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

// Mark a notification as read
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    await base('Notifications').update([{ id: notificationId, fields: { 'Is Read': true } }]);
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
} 