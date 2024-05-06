document.addEventListener('DOMContentLoaded', function() {
    var memberElement = document.querySelector('[data-ms-member="id"]');
    var isLoggedIn = false; // Assume the user is not logged in by default
  
    if (memberElement && memberElement.textContent.trim()) {
      isLoggedIn = true; // User is considered logged in if the ID is not empty
    }
  
    if (!isLoggedIn) {
      // Function to attach event listener to a container
      function protectContainer(containerId) {
        var container = document.getElementById(containerId);
        if (container) {
          container.addEventListener('click', function(e) {
            if (e.target.matches('[data-protected="true"]')) {
              e.preventDefault(); // Stop the link from navigating
              alert('Please log in to access this feature.'); // Alert or redirect to login
              window.location.href = '/log-in'; // Redirect to login page URL
            }
          });
        }
      }
  
      // Attaching event listeners to both 'post-list' and 'profile-follow' containers
      protectContainer('post-list');
      protectContainer('profile-follow');
    }
  });
  