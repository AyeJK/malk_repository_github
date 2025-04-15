document.addEventListener('DOMContentLoaded', function() {
  var memberElement = document.querySelector('[data-ms-member="id"]');
  var isLoggedIn = false; // Assume the user is not logged in by default

  if (memberElement && memberElement.textContent.trim()) {
    isLoggedIn = true; // User is considered logged in if the ID is not empty
  }

  if (!isLoggedIn) {
    // Attaching event listener to the 'post-list' container
    var postList = document.getElementById('post-list');
    if (postList) {
      postList.addEventListener('click', function(e) {
        if (e.target.matches('[data-protected="true"]')) {
          e.preventDefault(); // Stop the link from navigating
          alert('Please log in to access this feature.'); // Alert or redirect to login
          window.location.href = '/log-in'; // page URL to redirect users to
        }
      });
    }
  }
});
