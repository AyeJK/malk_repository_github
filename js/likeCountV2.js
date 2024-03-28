document.addEventListener('DOMContentLoaded', function() {
  function updateLikesDisplayForEachPost() {
    const likeCountEls = document.querySelectorAll('[data-like-count]');

    likeCountEls.forEach((likeCountEl) => {
      const count = parseInt(likeCountEl.textContent, 10);
      const postEl = likeCountEl.closest('.post');
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

  // Initially apply the display rules to existing posts
  updateLikesDisplayForEachPost();

  // Setup a MutationObserver to monitor for added nodes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Re-apply the display rules whenever new posts are added
        updateLikesDisplayForEachPost();
      }
    });
  });

  // Start observing the 'post-list' container for changes in its children
  const postList = document.querySelector('#post-list');
  if (postList) {
    observer.observe(postList, {
      childList: true, // observe direct children additions/removals
      subtree: true // observe all descendants
    });
  }
});