// Authentication Module
const Auth = {
  // Current user state
  currentUser: null,
  
  // Initialize auth state
  init() {
    // Listen for auth state changes
    firebase.auth().onAuthStateChanged(user => {
      this.currentUser = user;
      this.updateUI(user);
    });
    
    // Set up auth UI elements
    this.setupAuthUI();
  },
  
  // Set up authentication UI elements
  setupAuthUI() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutButton = document.getElementById('logout-button');
    
    if (loginForm) {
      loginForm.addEventListener('submit', this.handleLogin.bind(this));
    }
    
    if (registerForm) {
      registerForm.addEventListener('submit', this.handleRegister.bind(this));
    }
    
    if (logoutButton) {
      logoutButton.addEventListener('click', this.handleLogout.bind(this));
    }
  },
  
  // Handle user login
  async handleLogin(event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // Verify token with our backend
      const response = await fetch(API_ENDPOINTS.auth.verify, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken })
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      // Redirect to dashboard or home page
      window.location.href = '/';
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
    }
  },
  
  // Handle user registration
  async handleRegister(event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    
    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      
      // Update user profile
      await userCredential.user.updateProfile({
        displayName: name
      });
      
      // Create user record in Airtable
      const idToken = await userCredential.user.getIdToken();
      await fetch(API_ENDPOINTS.airtable.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          table: 'Users',
          fields: {
            Name: name,
            Email: email,
            FirebaseUID: userCredential.user.uid
          }
        })
      });
      
      // Redirect to dashboard or home page
      window.location.href = '/';
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed: ' + error.message);
    }
  },
  
  // Handle user logout
  async handleLogout() {
    try {
      await firebase.auth().signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed: ' + error.message);
    }
  },
  
  // Update UI based on auth state
  updateUI(user) {
    const authElements = document.querySelectorAll('.auth-required');
    const guestElements = document.querySelectorAll('.guest-required');
    
    if (user) {
      // User is signed in
      authElements.forEach(element => {
        element.style.display = 'block';
      });
      
      guestElements.forEach(element => {
        element.style.display = 'none';
      });
      
      // Update user info
      const userNameElement = document.getElementById('user-name');
      if (userNameElement) {
        userNameElement.textContent = user.displayName || user.email;
      }
    } else {
      // User is signed out
      authElements.forEach(element => {
        element.style.display = 'none';
      });
      
      guestElements.forEach(element => {
        element.style.display = 'block';
      });
    }
  },
  
  // Get current user
  getUser() {
    return this.currentUser;
  },
  
  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  },
  
  // Get user ID token
  async getIdToken() {
    if (!this.currentUser) {
      return null;
    }
    
    return await this.currentUser.getIdToken();
  }
};

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
}); 