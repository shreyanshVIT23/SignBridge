/**
 * SilentBridge Main Application
 * Connects all modules and handles the UI
 */

document.addEventListener('DOMContentLoaded', function() {
  // App state
  const state = {
    currentView: 'home',
    isAuthenticated: Auth.isAuthenticated(),
    currentUser: Auth.getCurrentUser(),
    processedWords: [],
    originalText: ''
  };

  // Initialize app
  initApp();

  /**
   * Initialize the application
   */
  function initApp() {
    // Render initial view
    renderApp();
    
    // Initialize speech processor
    SpeechProcessor.init();
    SpeechProcessor.onResult = handleSpeechResult;
    SpeechProcessor.onStart = handleSpeechStart;
    SpeechProcessor.onEnd = handleSpeechEnd;
    SpeechProcessor.onError = handleSpeechError;
  }

  /**
   * Render the application based on current state
   */
  function renderApp() {
    const appElement = document.getElementById('app');
    
    // Render navbar
    const navbarHtml = renderNavbar();
    
    // Render main content based on current view
    let contentHtml = '';
    
    switch (state.currentView) {
      case 'home':
        contentHtml = renderHomeView();
        break;
      case 'login':
        contentHtml = renderLoginView();
        break;
      case 'register':
        contentHtml = renderRegisterView();
        break;
      case 'converter':
        contentHtml = renderConverterView();
        break;
      case 'about':
        contentHtml = renderAboutView();
        break;
      default:
        contentHtml = renderHomeView();
    }
    
    // Update app HTML
    appElement.innerHTML = navbarHtml + contentHtml;
    
    // Add event listeners after DOM update
    addEventListeners();
    
    // Initialize video player if on converter view
    if (state.currentView === 'converter') {
      const videoElement = document.getElementById('videoPlayer');
      if (videoElement) {
        SignLanguagePlayer.init(videoElement);
        
        // Set callback for word change
        SignLanguagePlayer.onWordChange = (index) => {
          const wordItems = document.querySelectorAll('.word-item');
          
          // Remove active class from all words
          wordItems.forEach(item => item.classList.remove('active'));
          
          // Add active class to current word
          if (index >= 0 && index < wordItems.length) {
            wordItems[index].classList.add('active');
          }
        };
        
        // Set callback for playback complete
        SignLanguagePlayer.onPlaybackComplete = () => {
          const playButton = document.getElementById('playButton');
          if (playButton) {
            playButton.innerHTML = '<i class="fas fa-play"></i> Play';
          }
        };
      }
    }
  }

  /**
   * Render the navbar
   * @returns {String} - Navbar HTML
   */
  function renderNavbar() {
    return `
      <nav class="navbar">
        <a href="#" class="navbar-brand" data-view="home">
          <i class="fas fa-sign-language"></i> SilentBridge
        </a>
        <ul class="navbar-nav">
          ${state.isAuthenticated ? `
            <li class="nav-item">
              <a href="#" class="nav-link" data-view="converter">Converter</a>
            </li>
          ` : ''}
          <li class="nav-item">
            <a href="#" class="nav-link" data-view="about">About</a>
          </li>
          ${state.isAuthenticated ? `
            <li class="nav-item">
              <span class="nav-link">Welcome, ${state.currentUser?.username || 'User'}</span>
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link" id="logout-button">Logout</a>
            </li>
          ` : `
            <li class="nav-item">
              <a href="#" class="nav-link" data-view="login">Login</a>
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link" data-view="register">Register</a>
            </li>
          `}
        </ul>
      </nav>
    `;
  }

  /**
   * Render the home view
   * @returns {String} - Home view HTML
   */
  function renderHomeView() {
    return `
      <div class="container">
        <div style="text-align: center; margin-top: 4rem;">
          <h1 style="color: var(--primary-color); font-size: 3rem; margin-bottom: 1.5rem;">
            Welcome to SilentBridge
          </h1>
          <p style="font-size: 1.2rem; margin-bottom: 2rem; color: var(--secondary-color);">
            Breaking communication barriers with audio to sign language conversion
          </p>
          <div>
            ${state.isAuthenticated ? `
              <button class="btn btn-primary" style="padding: 0.75rem 2rem; font-size: 1.2rem;" data-view="converter">
                Start Converting
              </button>
            ` : `
              <button class="btn btn-primary" style="padding: 0.75rem 2rem; font-size: 1.2rem;" data-view="register">
                Get Started
              </button>
            `}
          </div>
          <div style="margin-top: 3rem;">
            <img src="https://via.placeholder.com/800x400?text=SilentBridge" alt="SilentBridge" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render the login view
   * @returns {String} - Login view HTML
   */
  function renderLoginView() {
    return `
      <div class="container">
        <div class="auth-container">
          <h2 class="auth-header">Login to SilentBridge</h2>
          <div id="login-alert"></div>
          <form class="auth-form" id="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn">Login</button>
          </form>
          <div class="auth-footer">
            Don't have an account? <a href="#" data-view="register">Register</a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render the register view
   * @returns {String} - Register view HTML
   */
  function renderRegisterView() {
    return `
      <div class="container">
        <div class="auth-container">
          <h2 class="auth-header">Create an Account</h2>
          <div id="register-alert"></div>
          <form class="auth-form" id="register-form">
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required>
            </div>
            <div class="form-group">
              <label for="confirm-password">Confirm Password</label>
              <input type="password" id="confirm-password" name="confirm-password" required>
            </div>
            <button type="submit" class="btn">Register</button>
          </form>
          <div class="auth-footer">
            Already have an account? <a href="#" data-view="login">Login</a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render the converter view
   * @returns {String} - Converter view HTML
   */
  function renderConverterView() {
    if (!state.isAuthenticated) {
      // Redirect to login if not authenticated
      state.currentView = 'login';
      renderApp();
      return '';
    }
    
    return `
      <div class="container">
        <div class="main-content">
          <div class="input-section">
            <h2 class="section-title">Enter Text or Use Mic</h2>
            <div class="speech-input">
              <input type="text" id="speechToText" placeholder="Type or speak here...">
              <button id="micButton" class="mic-btn">
                <i class="fas fa-microphone"></i>
              </button>
            </div>
            <button id="submitButton" class="submit-btn">Convert to Sign Language</button>
            
            <h3 style="color: var(--primary-color); margin-bottom: 1rem;">Original Text:</h3>
            <p id="originalText" style="margin-bottom: 1.5rem; color: var(--secondary-color); font-size: 1.1rem;">
              ${state.originalText || 'No text entered yet'}
            </p>
            
            <h3 style="color: var(--primary-color); margin-bottom: 1rem;">Key Words:</h3>
            <ul class="word-list" id="wordList">
              ${state.processedWords.map(word => `
                <li class="word-item">${word}</li>
              `).join('')}
            </ul>
          </div>
          
          <div class="output-section">
            <h2 class="section-title">Sign Language Animation</h2>
            <div class="video-container">
              <div class="video-controls">
                <button id="playButton" class="control-btn">
                  <i class="fas fa-play"></i> Play
                </button>
                <button id="resetButton" class="control-btn">
                  <i class="fas fa-redo"></i> Reset
                </button>
              </div>
              <video id="videoPlayer" width="100%">
                Your browser does not support HTML5 video.
              </video>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render the about view
   * @returns {String} - About view HTML
   */
  function renderAboutView() {
    return `
      <div class="container">
        <div style="max-width: 800px; margin: 0 auto; padding: 2rem;">
          <h1 style="color: var(--primary-color); margin-bottom: 1.5rem;">About SilentBridge</h1>
          
          <p style="margin-bottom: 1.5rem; line-height: 1.6;">
            SilentBridge is an innovative web application designed to bridge the communication gap between the hearing and deaf communities. 
            Our platform converts spoken language into sign language animations, making communication more accessible for everyone.
          </p>
          
          <h2 style="color: var(--secondary-color); margin: 1.5rem 0 1rem;">How It Works</h2>
          
          <ol style="margin-bottom: 1.5rem; line-height: 1.6;">
            <li>Speak or type your message into the converter</li>
            <li>Our advanced natural language processing system identifies key words and phrases</li>
            <li>The system converts these words into sign language animations</li>
            <li>Watch as our 3D avatar demonstrates the corresponding signs</li>
          </ol>
          
          <h2 style="color: var(--secondary-color); margin: 1.5rem 0 1rem;">Features</h2>
          
          <ul style="margin-bottom: 1.5rem; line-height: 1.6;">
            <li>Real-time speech recognition</li>
            <li>Text input for quiet environments</li>
            <li>High-quality 3D sign language animations</li>
            <li>User accounts to save your history</li>
            <li>Responsive design for all devices</li>
          </ul>
          
          <p style="margin-top: 2rem; font-style: italic; color: var(--accent-color);">
            SilentBridge: Breaking barriers, building bridges.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Add event listeners to the DOM
   */
  function addEventListeners() {
    // Navigation links
    document.querySelectorAll('[data-view]').forEach(element => {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        state.currentView = e.target.getAttribute('data-view');
        renderApp();
      });
    });
    
    // Logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
        state.isAuthenticated = false;
        state.currentUser = null;
        state.currentView = 'home';
        renderApp();
      });
    }
    
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', handleRegister);
    }
    
    // Converter view elements
    if (state.currentView === 'converter') {
      // Mic button
      const micButton = document.getElementById('micButton');
      if (micButton) {
        micButton.addEventListener('click', toggleSpeechRecognition);
      }
      
      // Submit button
      const submitButton = document.getElementById('submitButton');
      if (submitButton) {
        submitButton.addEventListener('click', handleTextSubmit);
      }
      
      // Play button
      const playButton = document.getElementById('playButton');
      if (playButton) {
        playButton.addEventListener('click', toggleVideoPlayback);
      }
      
      // Reset button
      const resetButton = document.getElementById('resetButton');
      if (resetButton) {
        resetButton.addEventListener('click', resetConverter);
      }
    }
  }

  /**
   * Handle login form submission
   * @param {Event} e - Form submit event
   */
  async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const alertElement = document.getElementById('login-alert');
    
    try {
      // Show loading state
      e.target.querySelector('button').innerHTML = '<span class="loader"></span>';
      e.target.querySelector('button').disabled = true;
      
      // Attempt login
      const result = await Auth.login({ email, password });
      
      // Update state
      state.isAuthenticated = true;
      state.currentUser = result.user;
      state.currentView = 'converter';
      
      // Render app
      renderApp();
    } catch (error) {
      // Show error
      alertElement.innerHTML = `
        <div class="alert alert-error">
          ${error.message || 'Login failed. Please check your credentials.'}
        </div>
      `;
      
      // Reset button
      e.target.querySelector('button').innerHTML = 'Login';
      e.target.querySelector('button').disabled = false;
    }
  }

  /**
   * Handle register form submission
   * @param {Event} e - Form submit event
   */
  async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const alertElement = document.getElementById('register-alert');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      alertElement.innerHTML = `
        <div class="alert alert-error">
          Passwords do not match.
        </div>
      `;
      return;
    }
    
    try {
      // Show loading state
      e.target.querySelector('button').innerHTML = '<span class="loader"></span>';
      e.target.querySelector('button').disabled = true;
      
      // Attempt registration
      const result = await Auth.register({ username, email, password });
      
      // Update state
      state.isAuthenticated = true;
      state.currentUser = result.user;
      state.currentView = 'converter';
      
      // Render app
      renderApp();
    } catch (error) {
      // Show error
      alertElement.innerHTML = `
        <div class="alert alert-error">
          ${error.message || 'Registration failed. Please try again.'}
        </div>
      `;
      
      // Reset button
      e.target.querySelector('button').innerHTML = 'Register';
      e.target.querySelector('button').disabled = false;
    }
  }

  /**
   * Toggle speech recognition
   */
  function toggleSpeechRecognition() {
    const micButton = document.getElementById('micButton');
    
    if (SpeechProcessor.isRecording) {
      SpeechProcessor.stop();
      micButton.classList.remove('recording');
      micButton.innerHTML = '<i class="fas fa-microphone"></i>';
    } else {
      const success = SpeechProcessor.start();
      
      if (success) {
        micButton.classList.add('recording');
        micButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
      } else {
        // Show error if speech recognition failed
        alert('Speech recognition is not supported in your browser or permission was denied.');
      }
    }
  }

  /**
   * Handle speech recognition result
   * @param {String} transcript - Speech recognition result
   */
  function handleSpeechResult(transcript) {
    const speechInput = document.getElementById('speechToText');
    if (speechInput) {
      speechInput.value = transcript;
    }
  }

  /**
   * Handle speech recognition start
   */
  function handleSpeechStart() {
    console.log('Speech recognition started');
  }

  /**
   * Handle speech recognition end
   */
  function handleSpeechEnd() {
    const micButton = document.getElementById('micButton');
    if (micButton) {
      micButton.classList.remove('recording');
      micButton.innerHTML = '<i class="fas fa-microphone"></i>';
    }
  }

  /**
   * Handle speech recognition error
   * @param {String} error - Speech recognition error
   */
  function handleSpeechError(error) {
    console.error('Speech recognition error:', error);
    
    const micButton = document.getElementById('micButton');
    if (micButton) {
      micButton.classList.remove('recording');
      micButton.innerHTML = '<i class="fas fa-microphone"></i>';
    }
    
    // Show error message
    alert(`Speech recognition error: ${error}`);
  }

  /**
   * Handle text submission for conversion
   */
  function handleTextSubmit() {
    const speechInput = document.getElementById('speechToText');
    const originalTextElement = document.getElementById('originalText');
    const wordListElement = document.getElementById('wordList');
    
    if (!speechInput || !speechInput.value.trim()) {
      alert('Please enter or speak some text first.');
      return;
    }
    
    // Get text and process it
    const text = speechInput.value.trim();
    const processedWords = SpeechProcessor.processText(text);
    
    // Update state
    state.originalText = text;
    state.processedWords = processedWords;
    
    // Update UI
    if (originalTextElement) {
      originalTextElement.textContent = text;
    }
    
    if (wordListElement) {
      wordListElement.innerHTML = processedWords.map(word => `
        <li class="word-item">${word}</li>
      `).join('');
    }
    
    // Load words into player
    SignLanguagePlayer.loadWords(processedWords);
    
    // Update play button
    const playButton = document.getElementById('playButton');
    if (playButton) {
      playButton.innerHTML = '<i class="fas fa-play"></i> Play';
    }
  }

  /**
   * Toggle video playback
   */
  function toggleVideoPlayback() {
    const playButton = document.getElementById('playButton');
    
    if (SignLanguagePlayer.isPlaying) {
      SignLanguagePlayer.pause();
      if (playButton) {
        playButton.innerHTML = '<i class="fas fa-play"></i> Play';
      }
    } else {
      const success = SignLanguagePlayer.play();
      
      if (success) {
        if (playButton) {
          playButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
        }
      } else {
        alert('No words to play. Please convert some text first.');
      }
    }
  }

  /**
   * Reset converter
   */
  function resetConverter() {
    // Reset state
    state.originalText = '';
    state.processedWords = [];
    
    // Reset UI
    const speechInput = document.getElementById('speechToText');
    const originalTextElement = document.getElementById('originalText');
    const wordListElement = document.getElementById('wordList');
    
    if (speechInput) {
      speechInput.value = '';
    }
    
    if (originalTextElement) {
      originalTextElement.textContent = 'No text entered yet';
    }
    
    if (wordListElement) {
      wordListElement.innerHTML = '';
    }
    
    // Reset player
    SignLanguagePlayer.reset();
    
    // Update play button
    const playButton = document.getElementById('playButton');
    if (playButton) {
      playButton.innerHTML = '<i class="fas fa-play"></i> Play';
    }
  }
});
