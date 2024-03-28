document.addEventListener('DOMContentLoaded', function() {
    // Function to update visibility for each post
    function updateLikesDisplayForEachPost() {
      // Select all like count elements
      const likeCountEls = document.querySelectorAll('[data-like-count]');
  
      likeCountEls.forEach((likeCountEl) => {
        const count = parseInt(likeCountEl.textContent, 10);
        // Assuming each like count element is contained within a post element,
        // and "likes" and "like" text fields are siblings of the like count element.
        const postEl = likeCountEl.closest('.post'); // Change '.post' to the actual class of your post container
        const likesTextEl = postEl.querySelector('[data-text-likes]');
        const likeTextEl = postEl.querySelector('[data-text-like]');
  
        if (count === 0) {
          likeCountEl.style.display = 'none';
          if (likesTextEl) likesTextEl.style.display = 'none';
          if (likeTextEl) likeTextEl.style.display = 'none';
        } else if (count === 1) {
          if (likesTextEl) likesTextEl.style.display = 'none';
          if (likeTextEl) likeTextEl.style.display = 'block';
        } else {
          if (likesTextEl) likesTextEl.style.display = 'block';
          if (likeTextEl) likeTextEl.style.display = 'none';
        }
      });
    }
  
    // Call the function initially to set the correct state for all posts
    updateLikesDisplayForEachPost();
  });
  