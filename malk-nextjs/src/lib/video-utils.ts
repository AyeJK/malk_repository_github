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
      }
    });

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].snippet.title;
    }
    return null;
  } catch (error) {
    console.error('Error fetching YouTube video title:', error);
    return null;
  }
}

// Function to get video title from Vimeo
async function getVimeoVideoTitle(videoId: string): Promise<string | null> {
  try {
    const response = await axios.get(`https://vimeo.com/api/v2/video/${videoId}.json`);
    if (response.data && response.data.length > 0) {
      return response.data[0].title;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Vimeo video title:', error);
    return null;
  }
}

// Main function to get video title from URL
export async function getVideoTitle(url: string): Promise<string | null> {
  const youtubeId = extractYouTubeVideoId(url);
  if (youtubeId) {
    return getYouTubeVideoTitle(youtubeId);
  }

  const vimeoId = extractVimeoVideoId(url);
  if (vimeoId) {
    return getVimeoVideoTitle(vimeoId);
  }

  return null;
} 