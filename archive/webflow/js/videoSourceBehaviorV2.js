document.addEventListener("DOMContentLoaded", function() {
  const videoUrlField = document.getElementById('video-url-2');
  const videoEmbedContainer = document.getElementById('user-video-embed');
  const submitButton = document.getElementById('form-submit');

  // Define video sources in a structured way
  const videoSources = [
{
  name: 'YouTube',
  pattern: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)(\S*)$/,
  getEmbedUrl: function(url) {
    console.log(`Processing URL: ${url}`);
    let videoId;
    // Check if URL is a regular YouTube link
    const regularYouTubeMatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
    if (regularYouTubeMatch) {
      videoId = regularYouTubeMatch[1];
      console.log(`Found regular YouTube link, video ID: ${videoId}`);
    } else {
      // Check if URL is a shortened YouTube link
      const shortenedYouTubeMatch = url.match(/youtu\.be\/([\w-]+)/);
      if (shortenedYouTubeMatch) {
        videoId = shortenedYouTubeMatch[1];
        console.log(`Found shortened YouTube link, video ID: ${videoId}`);
      } else {
        console.log(`No match found for shortened YouTube link.`);
      }
    }

    // If we have a videoId, return the embed URL
    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      console.log(`Generated embed URL: ${embedUrl}`);
      return embedUrl;
    } else {
      // No valid video ID found
      console.log(`No valid video ID found for URL: ${url}`);
      return null;
    }
  }
},
    {
      name: 'Vimeo',
      pattern: /^(https?:\/\/)?(www\.)?vimeo.com\/(\d+)/,
      getEmbedUrl: function(url) {
        const match = url.match(this.pattern);
        if (match && match[3]) {
          return "https://player.vimeo.com/video/" + match[3];
        }
        return null;
      }
    },
    // Add other video sources here following the same structure
  ];

  function updateVideoDisplay(videoUrl) {
    for (let source of videoSources) {
      if (source.pattern.test(videoUrl)) {
        console.log(`${source.name} URL detected`);
        const embedUrl = source.getEmbedUrl(videoUrl);
        if (embedUrl) {
          console.log(`Converted to embed URL: ${embedUrl}`);
          videoEmbedContainer.querySelector('iframe').src = embedUrl;
          videoEmbedContainer.style.display = 'block';
          return;
        }
      }
    }

    // If no sources match, hide the video container
    videoEmbedContainer.style.display = 'none';
  }

  videoUrlField.addEventListener('input', function() {
    updateVideoDisplay(videoUrlField.value);
  });

  submitButton.addEventListener('click', function(e) {
    const urlValue = videoUrlField.value;
    let isValidSource = false;

    for (let source of videoSources) {
      if (source.pattern.test(urlValue)) {
        isValidSource = true;
        break;
      }
    }

    if (!isValidSource) {
      e.preventDefault();
      alert('Please enter a valid video URL.');
    }
  });
});