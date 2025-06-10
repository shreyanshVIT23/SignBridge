/**
 * Sign Language Player Module
 * Handles the playback of sign language animations
 */

const SignLanguagePlayer = {
  // Video element
  videoElement: null,
  
  // Current word index
  currentIndex: 0,
  
  // Words to play
  words: [],
  
  // Video sources
  videoSources: [],
  
  // Is playing
  isPlaying: false,
  
  // Callbacks
  onWordChange: null,
  onPlaybackComplete: null,
  
  /**
   * Initialize the player
   * @param {HTMLElement} videoElement - Video element to use for playback
   */
  init: function(videoElement) {
    this.videoElement = videoElement;
    
    // Set up event listeners
    this.videoElement.addEventListener('ended', this.handleVideoEnd.bind(this));
    
    return this;
  },
  
  /**
   * Load words for playback
   * @param {Array} words - Array of words to play
   */
  loadWords: function(words) {
    this.words = words;
    this.currentIndex = 0;
    this.videoSources = this.words.map(word => `/assets/${word}.mp4`);
    
    // Reset video
    this.videoElement.pause();
    this.videoElement.removeAttribute('src');
    this.isPlaying = false;
    
    return this;
  },
  
  /**
   * Start playback
   */
  play: function() {
    if (!this.words.length) {
      console.warn('No words loaded for playback');
      return false;
    }
    
    this.isPlaying = true;
    this.playCurrentWord();
    return true;
  },
  
  /**
   * Pause playback
   */
  pause: function() {
    this.videoElement.pause();
    this.isPlaying = false;
  },
  
  /**
   * Toggle play/pause
   */
  togglePlayPause: function() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  },
  
  /**
   * Play current word
   */
  playCurrentWord: function() {
    // Highlight current word
    if (this.onWordChange) {
      this.onWordChange(this.currentIndex);
    }
    
    // Set video source and play
    this.videoElement.src = this.videoSources[this.currentIndex];
    this.videoElement.load();
    
    const playPromise = this.videoElement.play();
    
    // Handle play promise (required for modern browsers)
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('Playback error:', error);
      });
    }
  },
  
  /**
   * Handle video end event
   */
  handleVideoEnd: function() {
    // Move to next word
    this.currentIndex++;
    
    // Check if we've played all words
    if (this.currentIndex >= this.words.length) {
      this.isPlaying = false;
      
      if (this.onPlaybackComplete) {
        this.onPlaybackComplete();
      }
      
      return;
    }
    
    // Play next word if still playing
    if (this.isPlaying) {
      this.playCurrentWord();
    }
  },
  
  /**
   * Reset player
   */
  reset: function() {
    this.words = [];
    this.videoSources = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    
    // Reset video
    this.videoElement.pause();
    this.videoElement.removeAttribute('src');
    
    if (this.onWordChange) {
      this.onWordChange(-1);
    }
  }
};

// Export SignLanguagePlayer module
window.SignLanguagePlayer = SignLanguagePlayer;
