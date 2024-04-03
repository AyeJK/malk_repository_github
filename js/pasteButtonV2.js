document.addEventListener("DOMContentLoaded", function() {
    var pasteButton = document.querySelector('#paste-button');
    pasteButton.addEventListener('click', function(event) {
      event.preventDefault();
  
      navigator.clipboard.readText().then(function(clipText) {
        var videoUrlField = document.getElementById('video-url-2');
        videoUrlField.value = clipText;
  
        // Manually dispatch an 'input' event after setting the value
        var event = new Event('input', {
          bubbles: true,
          cancelable: true,
        });
        videoUrlField.dispatchEvent(event);
      }).catch(function(err) {
        console.error('Could not paste text: ', err);
      });
    });
  });
  