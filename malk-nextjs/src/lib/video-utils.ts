import axios from 'axios';

// YouTube API key
const YOUTUBE_API_KEY = 'AIzaSyBgckAJZtOj0jn2UZCNU8JjFfWoiyGyvGg';

// Function to extract video ID from YouTube URL
export function extractYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Function to extract video ID from Vimeo URL
export function extractVimeoVideoId(url: string): string | null {
  const match = url.match(/vimeo.com\/(\d+)/);
  return match ? match[1] : null;
}

// Function to get video title from YouTube
async function getYouTubeVideoTitle(videoId: string): Promise<string | null> {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'snippet',
        id: videoId,
        key: YOUTUBE_API_KEY
      },
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.data) {
      console.error('YouTube API returned no data');
      return null;
    }

    if (!response.data.items || !Array.isArray(response.data.items) || response.data.items.length === 0) {
      console.error('YouTube API returned no items');
      return null;
    }

    const video = response.data.items[0];
    if (!video.snippet || !video.snippet.title) {
      console.error('YouTube API response missing title');
      return null;
    }

    return video.snippet.title;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.error('YouTube API quota exceeded');
      throw new Error('YouTube API quota exceeded. Please try again later.');
    }
    if (error.response?.status === 429) {
      console.error('YouTube API rate limit exceeded');
      throw new Error('YouTube API rate limit exceeded. Please try again later.');
    }
    console.error('Error fetching YouTube video title:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(`Failed to get YouTube video title: ${error.message}`);
  }
}

// Function to get video title from Vimeo
async function getVimeoVideoTitle(videoId: string): Promise<string | null> {
  try {
    const response = await axios.get(`https://vimeo.com/api/v2/video/${videoId}.json`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.data) {
      console.error('Vimeo API returned no data');
      return null;
    }

    if (!Array.isArray(response.data) || response.data.length === 0) {
      console.error('Vimeo API returned no items');
      return null;
    }

    const video = response.data[0];
    if (!video.title) {
      console.error('Vimeo API response missing title');
      return null;
    }

    return video.title;
  } catch (error: any) {
    if (error.response?.status === 429) {
      console.error('Vimeo API rate limit exceeded');
      throw new Error('Vimeo API rate limit exceeded. Please try again later.');
    }
    console.error('Error fetching Vimeo video title:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(`Failed to get Vimeo video title: ${error.message}`);
  }
}

// Main function to get video title from URL
export async function getVideoTitle(url: string): Promise<string | null> {
  try {
    const youtubeId = extractYouTubeVideoId(url);
    if (youtubeId) {
      return await getYouTubeVideoTitle(youtubeId);
    }

    const vimeoId = extractVimeoVideoId(url);
    if (vimeoId) {
      return await getVimeoVideoTitle(vimeoId);
    }

    console.error('Unsupported video URL format:', url);
    return null;
  } catch (error: any) {
    console.error('Error getting video title:', error);
    throw error;
  }
}

// Function to get YouTube thumbnail URL with fallbacks
export async function getYouTubeThumbnailUrl(videoId: string): Promise<string> {
  const qualities = [
    'maxresdefault.jpg',
    'sddefault.jpg',
    'hqdefault.jpg',
    'mqdefault.jpg',
    'default.jpg'
  ];

  // Try each quality in order until one works
  for (const quality of qualities) {
    const url = `https://img.youtube.com/vi/${videoId}/${quality}`;
    try {
      const response = await axios.head(url);
      if (response.status === 200) {
        return url;
      }
    } catch (error) {
      continue; // Try next quality if this one fails
    }
  }

  // If all qualities fail, return the most reliable one (hqdefault)
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
} 