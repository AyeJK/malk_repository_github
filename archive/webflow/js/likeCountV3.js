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
          likesTextEl && (likesTextEl.style.display = 'none');
          likeTextEl && (likeTextEl.style.display = 'none');
        } else if (count === 1) {
          likesTextEl && (likesTextEl.style.display = 'none');
          likeTextEl && (likeTextEl.style.display = 'block');
        } else {
          likesTextEl && (likesTextEl.style.display = 'block');
          likeTextEl && (likeTextEl.style.display = 'none');
        }
      });
    }
  
    function debounce(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    }
  
    const observer = new MutationObserver(debounce(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          updateLikesDisplayForEachPost();
        }
      });
    }, 100));
  
    const postList = document.querySelector('#post-list');
    if (postList) {
      observer.observe(postList, {
        childList: true,
        subtree: true
      });
    }
  });
  