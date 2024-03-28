document.addEventListener("DOMContentLoaded", function() {
  // Reference to the video URL input field
  const videoUrlField = document.getElementById('video-url-2');
  
  // Reference to the submit button by its ID
  const submitButton = document.getElementById('form-submit');

  submitButton.addEventListener('click', function(e) {
    // Get the value from the video URL field
    const urlValue = videoUrlField.value;

    // Regular expressions to test for YouTube and Vimeo URLs
    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube.com|youtu.be)\/.+$/;
    const vimeoPattern = /^(https?:\/\/)?(www\.)?vimeo.com\/.+$/;

    // Check if the URL value matches either YouTube or Vimeo URL patterns
    if (!youtubePattern.test(urlValue) && !vimeoPattern.test(urlValue)) {
      e.preventDefault(); // Prevent the default button click action, which is form submission
      alert('Please enter a valid YouTube or Vimeo URL.'); // Alert the user
    }
  });
});
