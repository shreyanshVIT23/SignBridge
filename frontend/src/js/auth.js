/**
 * Authentication Module
 * Handles user registration, login, and session management
 */

const Auth = {
  // API URL
  apiUrl: '/api',
  
  // Token key in localStorage
  tokenKey: 'silentbridge_token',
  
  // User key in localStorage
  userKey: 'silentbridge_user',
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Promise with registration result
   */
  register: async function(userData) {
    try {
      const response = await fetch(`${this.apiUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Save token and user data
      localStorage.setItem(this.tokenKey, data.token);
      localStorage.setItem(this.userKey, JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  /**
   * Login user
   * @param {Object} credentials - User login credentials
   * @returns {Promise} - Promise with login result
   */
  login: async function(credentials) {
    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Save token and user data
      localStorage.setItem(this.tokenKey, data.token);
      localStorage.setItem(this.userKey, JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Logout user
   */
  logout: function() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    window.location.href = '/';
  },
  
  /**
   * Get current user
   * @returns {Object|null} - User object or null if not logged in
   */
  getCurrentUser: function() {
    const userJson = localStorage.getItem(this.userKey);
    return userJson ? JSON.parse(userJson) : null;
  },
  
  /**
   * Check if user is authenticated
   * @returns {Boolean} - True if user is authenticated
   */
  isAuthenticated: function() {
    return !!localStorage.getItem(this.tokenKey);
  },
  
  /**
   * Get auth token
   * @returns {String|null} - Auth token or null if not logged in
   */
  getToken: function() {
    return localStorage.getItem(this.tokenKey);
  },
  
  /**
   * Make authenticated API request
   * @param {String} url - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise} - Promise with API response
   */
  authFetch: async function(url, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token');
    }
    
    const authOptions = {
      ...options,
      headers: {
        ...options.headers,
        'x-auth-token': token
      }
    };
    
    return fetch(url, authOptions);
  }
};

// Export Auth module
window.Auth = Auth;
