// Main Application Module
const App = {
  // Initialize application
  init() {
    this.setupNavigation();
    this.loadContent();
  },
  
  // Set up navigation
  setupNavigation() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    
    // Define navigation items
    const navItems = [
      { text: 'Home', href: '/' },
      { text: 'Videos', href: '/videos.html', auth: true },
      { text: 'Profile', href: '/profile.html', auth: true },
      { text: 'Login', href: '/login.html', guest: true },
      { text: 'Register', href: '/register.html', guest: true }
    ];
    
    // Create navigation links
    navItems.forEach(item => {
      // Skip if auth/guest requirement doesn't match current state
      if ((item.auth && !Auth.isAuthenticated()) || 
          (item.guest && Auth.isAuthenticated())) {
        return;
      }
      
      const link = document.createElement('a');
      link.href = item.href;
      link.textContent = item.text;
      nav.appendChild(link);
    });
  },
  
  // Load content based on current page
  async loadContent() {
    const contentElement = document.getElementById('content');
    if (!contentElement) return;
    
    // Get current page path
    const path = window.location.pathname;
    
    // Load content based on path
    if (path === '/' || path === '/index.html') {
      await this.loadHomePage(contentElement);
    } else if (path === '/videos.html') {
      await this.loadVideosPage(contentElement);
    } else if (path === '/profile.html') {
      await this.loadProfilePage(contentElement);
    } else if (path === '/login.html') {
      this.loadLoginPage(contentElement);
    } else if (path === '/register.html') {
      this.loadRegisterPage(contentElement);
    } else {
      this.loadNotFoundPage(contentElement);
    }
  },
  
  // Load home page content
  async loadHomePage(container) {
    container.innerHTML = `
      <h2>Welcome to Malk.tv</h2>
      <p>A platform for video sharing and social interaction.</p>
      <div class="featured-content">
        <h3>Featured Videos</h3>
        <div id="featured-videos" class="video-grid"></div>
      </div>
    `;
    
    // Load featured videos
    try {
      const idToken = await Auth.getIdToken();
      const response = await fetch(`${API_ENDPOINTS.airtable}?table=Videos&query={"filterByFormula":"{Featured}=1"}&maxRecords=6`, {
        headers: idToken ? { 'Authorization': `Bearer ${idToken}` } : {}
      });
      
      if (response.ok) {
        const videos = await response.json();
        this.renderVideoGrid(document.getElementById('featured-videos'), videos);
      }
    } catch (error) {
      console.error('Error loading featured videos:', error);
    }
  },
  
  // Load videos page content
  async loadVideosPage(container) {
    // Check if user is authenticated
    if (!Auth.isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }
    
    container.innerHTML = `
      <h2>Videos</h2>
      <div class="video-controls">
        <button id="upload-video" class="btn btn-primary">Upload Video</button>
        <div class="video-filters">
          <select id="video-filter">
            <option value="all">All Videos</option>
            <option value="following">Following</option>
            <option value="liked">Liked</option>
          </select>
        </div>
      </div>
      <div id="videos-list" class="video-grid"></div>
      <div id="load-more" class="load-more">
        <button class="btn btn-secondary">Load More</button>
      </div>
    `;
    
    // Set up event listeners
    document.getElementById('upload-video').addEventListener('click', this.showUploadForm);
    document.getElementById('video-filter').addEventListener('change', this.filterVideos);
    document.getElementById('load-more').addEventListener('click', this.loadMoreVideos);
    
    // Load initial videos
    await this.loadVideos();
  },
  
  // Load profile page content
  async loadProfilePage(container) {
    // Check if user is authenticated
    if (!Auth.isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }
    
    const user = Auth.getUser();
    
    container.innerHTML = `
      <div class="profile-header">
        <h2>${user.displayName || 'User Profile'}</h2>
        <button id="edit-profile" class="btn btn-secondary">Edit Profile</button>
      </div>
      <div class="profile-content">
        <div class="profile-info">
          <h3>Profile Information</h3>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Member since:</strong> ${new Date(user.metadata.creationTime).toLocaleDateString()}</p>
        </div>
        <div class="profile-stats">
          <h3>Statistics</h3>
          <div id="user-stats" class="stats-grid">
            <div class="stat-item">
              <span class="stat-value" id="videos-count">0</span>
              <span class="stat-label">Videos</span>
            </div>
            <div class="stat-item">
              <span class="stat-value" id="followers-count">0</span>
              <span class="stat-label">Followers</span>
            </div>
            <div class="stat-item">
              <span class="stat-value" id="following-count">0</span>
              <span class="stat-label">Following</span>
            </div>
          </div>
        </div>
        <div class="profile-videos">
          <h3>Your Videos</h3>
          <div id="user-videos" class="video-grid"></div>
        </div>
      </div>
    `;
    
    // Load user data
    await this.loadUserData(user.uid);
  },
  
  // Load login page content
  loadLoginPage(container) {
    container.innerHTML = `
      <div class="auth-container">
        <h2>Login</h2>
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="login-email">Email</label>
            <input type="email" id="login-email" required>
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <input type="password" id="login-password" required>
          </div>
          <button type="submit" class="btn btn-primary">Login</button>
        </form>
        <p class="auth-redirect">
          Don't have an account? <a href="/register.html">Register</a>
        </p>
      </div>
    `;
  },
  
  // Load register page content
  loadRegisterPage(container) {
    container.innerHTML = `
      <div class="auth-container">
        <h2>Register</h2>
        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label for="register-name">Name</label>
            <input type="text" id="register-name" required>
          </div>
          <div class="form-group">
            <label for="register-email">Email</label>
            <input type="email" id="register-email" required>
          </div>
          <div class="form-group">
            <label for="register-password">Password</label>
            <input type="password" id="register-password" required>
          </div>
          <button type="submit" class="btn btn-primary">Register</button>
        </form>
        <p class="auth-redirect">
          Already have an account? <a href="/login.html">Login</a>
        </p>
      </div>
    `;
  },
  
  // Load 404 page content
  loadNotFoundPage(container) {
    container.innerHTML = `
      <div class="not-found">
        <h2>404 - Page Not Found</h2>
        <p>The page you are looking for does not exist.</p>
        <a href="/" class="btn btn-primary">Go Home</a>
      </div>
    `;
  },
  
  // Load videos from Airtable
  async loadVideos(filter = 'all', page = 1) {
    const videosContainer = document.getElementById('videos-list');
    if (!videosContainer) return;
    
    try {
      const idToken = await Auth.getIdToken();
      let query = {};
      
      // Apply filters
      if (filter === 'following') {
        query = { filterByFormula: `FIND("${Auth.getUser().uid}", {Followers})` };
      } else if (filter === 'liked') {
        query = { filterByFormula: `FIND("${Auth.getUser().uid}", {Likes})` };
      }
      
      // Add pagination
      query.pageSize = APP_SETTINGS.itemsPerPage;
      query.offset = (page - 1) * APP_SETTINGS.itemsPerPage;
      
      const response = await fetch(`${API_ENDPOINTS.airtable}?table=Videos&query=${JSON.stringify(query)}`, {
        headers: idToken ? { 'Authorization': `Bearer ${idToken}` } : {}
      });
      
      if (response.ok) {
        const videos = await response.json();
        this.renderVideoGrid(videosContainer, videos);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  },
  
  // Render video grid
  renderVideoGrid(container, videos) {
    if (!videos || videos.length === 0) {
      container.innerHTML = '<p>No videos found.</p>';
      return;
    }
    
    const videoHTML = videos.map(video => `
      <div class="video-card" data-id="${video.id}">
        <div class="video-thumbnail">
          <img src="${video.Thumbnail || '/assets/default-thumbnail.jpg'}" alt="${video.Title}">
        </div>
        <div class="video-info">
          <h3>${video.Title}</h3>
          <p>${video.Description || ''}</p>
          <div class="video-meta">
            <span>${video.Views || 0} views</span>
            <span>${new Date(video.Created).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = videoHTML;
    
    // Add click event to video cards
    container.querySelectorAll('.video-card').forEach(card => {
      card.addEventListener('click', () => {
        const videoId = card.getAttribute('data-id');
        window.location.href = `/video.html?id=${videoId}`;
      });
    });
  },
  
  // Load user data from Airtable
  async loadUserData(userId) {
    try {
      const idToken = await Auth.getIdToken();
      const response = await fetch(`${API_ENDPOINTS.airtable}?table=Users&query={"filterByFormula":"{FirebaseUID}='${userId}'"}`, {
        headers: idToken ? { 'Authorization': `Bearer ${idToken}` } : {}
      });
      
      if (response.ok) {
        const users = await response.json();
        if (users.length > 0) {
          const userData = users[0];
          
          // Update stats
          document.getElementById('videos-count').textContent = userData.VideosCount || 0;
          document.getElementById('followers-count').textContent = userData.FollowersCount || 0;
          document.getElementById('following-count').textContent = userData.FollowingCount || 0;
          
          // Load user videos
          await this.loadUserVideos(userId);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  },
  
  // Load user videos
  async loadUserVideos(userId) {
    const videosContainer = document.getElementById('user-videos');
    if (!videosContainer) return;
    
    try {
      const idToken = await Auth.getIdToken();
      const query = {
        filterByFormula: `{UserID}='${userId}'`,
        pageSize: 6
      };
      
      const response = await fetch(`${API_ENDPOINTS.airtable}?table=Videos&query=${JSON.stringify(query)}`, {
        headers: idToken ? { 'Authorization': `Bearer ${idToken}` } : {}
      });
      
      if (response.ok) {
        const videos = await response.json();
        this.renderVideoGrid(videosContainer, videos);
      }
    } catch (error) {
      console.error('Error loading user videos:', error);
    }
  },
  
  // Show upload form
  showUploadForm() {
    // Implementation for video upload form
    console.log('Show upload form');
  },
  
  // Filter videos
  filterVideos(event) {
    const filter = event.target.value;
    this.loadVideos(filter);
  },
  
  // Load more videos
  loadMoreVideos() {
    // Implementation for pagination
    console.log('Load more videos');
  }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
}); 