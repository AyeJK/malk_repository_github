document.addEventListener("DOMContentLoaded", function() {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.matches('.post')) {
          if (currentFilter) {
            applyFilters(currentFilter);
          }
        }
      });
    });
  });

  const config = { childList: true, subtree: true };
  observer.observe(document.getElementById('post-list'), config);

  let currentFilter = '';

  const filterPostsByDate = (timeframe) => {
    const now = new Date();
    const posts = document.querySelectorAll('#post-list .post');

    posts.forEach(post => {
      const postDateString = post.getAttribute('data-date');
      const postDate = new Date(postDateString);
      let isVisible = false;

      switch (timeframe) {
        case 'today':
          isVisible = now.toDateString() === postDate.toDateString();
          break;
        case 'thisWeek':
          let startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          let endOfWeek = new Date(startOfWeek.getTime() + (6 * 24 * 60 * 60 * 1000));
          isVisible = postDate >= startOfWeek && postDate <= endOfWeek;
          break;
        case 'thisMonth':
          isVisible = postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
          break;
        case 'thisYear':
          isVisible = postDate.getFullYear() === now.getFullYear();
          break;
      }

      post.style.display = isVisible ? 'block' : 'none';
    });

    // Ensure Finsweet CMS Sort is triggered after filtering
    if (window.FsLibrary) {
      FsLibrary.refreshSort(); // Ensure this method exists or is correct per documentation
    }
  };

  function applyFilters(timeframe) {
    filterPostsByDate(timeframe);
  }

  // Event listeners for date filter buttons
  document.getElementById('filter-today').addEventListener('click', () => { currentFilter = 'today'; applyFilters('today'); });
  document.getElementById('filter-thisWeek').addEventListener('click', () => { currentFilter = 'thisWeek'; applyFilters('thisWeek'); });
  document.getElementById('filter-thisMonth').addEventListener('click', () => { currentFilter = 'thisMonth'; applyFilters('thisMonth'); });
  document.getElementById('filter-thisYear').addEventListener('click', () => { currentFilter = 'thisYear'; applyFilters('thisYear'); });
});
