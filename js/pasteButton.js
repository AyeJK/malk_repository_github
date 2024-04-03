document.addEventListener("DOMContentLoaded", function() {
  var pasteButton = document.querySelector('#paste-button');
  pasteButton.addEventListener('click', function(event) {
    // Prevent any default button action
    event.preventDefault();

    // Attempt to read from clipboard
    navigator.clipboard.readText().then(function(clipText) {
      document.getElementById('video-url-2').value = clipText;
    }).catch(function(err) {
      // Handle any errors (e.g., permission denied)
      console.error('Could not paste text: ', err);
    });
  });
});
