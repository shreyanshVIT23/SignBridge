/**
 * Speech Processor Module
 * Handles speech recognition and text processing for sign language conversion
 */

const SpeechProcessor = {
  // Speech recognition instance
  recognition: null,

  // Is speech recognition supported
  isSupported:
    "webkitSpeechRecognition" in window || "SpeechRecognition" in window,

  // Is currently recording
  isRecording: false,

  // Callbacks
  onResult: null,
  onStart: null,
  onEnd: null,
  onError: null,

  /**
   * Initialize speech recognition
   */
  init: function () {
    if (!this.isSupported) {
      console.error("Speech recognition not supported in this browser");
      return false;
    }

    // Create speech recognition instance
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configure recognition
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";

    // Set up event handlers
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (this.onResult) this.onResult(transcript);
    };

    this.recognition.onstart = () => {
      this.isRecording = true;
      if (this.onStart) this.onStart();
    };

    this.recognition.onend = () => {
      this.isRecording = false;
      if (this.onEnd) this.onEnd();
    };

    this.recognition.onerror = (event) => {
      this.isRecording = false;
      if (this.onError) this.onError(event.error);
    };

    return true;
  },

  /**
   * Start speech recognition
   */
  start: function () {
    if (!this.recognition) {
      if (!this.init()) {
        return false;
      }
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error("Speech recognition error:", error);
      return false;
    }
  },

  /**
   * Stop speech recognition
   */
  stop: function () {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
    }
  },

  /**
   * Process text for sign language conversion
   * @param {String} text - Text to process
   * @returns {Array} - Array of words for sign language conversion
   */
  processText: function (text) {
    if (!text) return [];

    // Convert to lowercase
    text = text.toLowerCase();

    // Tokenize text into words
    const words = text.split(/\s+/);

    // Filter out stopwords and process words
    const filteredWords = this.filterStopwords(words);

    // Add tense indicators if needed
    const processedWords = this.addTenseIndicators(filteredWords, text);

    // Check if words have corresponding sign language videos
    return this.checkWordAvailability(processedWords);
  },

  /**
   * Filter out stopwords from words array
   * @param {Array} words - Array of words
   * @returns {Array} - Filtered array of words
   */
  filterStopwords: function (words) {
    // Common stopwords to remove
    const stopwords = [
      "a",
      "an",
      "the",
      "and",
      "but",
      "if",
      "or",
      "because",
      "as",
      "until",
      "while",
      "of",
      "at",
      "by",
      "for",
      "with",
      "about",
      "against",
      "between",
      "into",
      "through",
      "during",
      "before",
      "after",
      "above",
      "below",
      "to",
      "from",
      "up",
      "down",
      "in",
      "out",
      "on",
      "off",
      "over",
      "under",
      "again",
      "further",
      "then",
      "once",
      "here",
      "there",
      "when",
      "where",
      "why",
      "how",
      "all",
      "any",
      "both",
      "each",
      "few",
      "more",
      "most",
      "other",
      "some",
      "such",
      "no",
      "nor",
      "not",
      "only",
      "own",
      "same",
      "so",
      "than",
      "too",
      "very",
      "s",
      "t",
      "can",
      "will",
      "just",
      "don",
      "should",
      "now",
    ];

    return words.filter((word) => !stopwords.includes(word));
  },

  /**
   * Add tense indicators to words array
   * @param {Array} words - Array of words
   * @param {String} originalText - Original text
   * @returns {Array} - Words with tense indicators
   */
  addTenseIndicators: function (words, originalText) {
    // Simple tense detection (can be improved)
    const hasPastTense = /\b(?:was|were|had|did|gone|came|saw|been)\b/.test(
      originalText
    );
    const hasFutureTense = /\b(?:will|shall|going to)\b/.test(originalText);
    const hasContinuousTense = /\b(?:am|is|are)\s+\w+ing\b/.test(originalText);

    let result = [...words];

    // Add tense indicators
    if (hasPastTense) {
      result = ["Before", ...result];
    } else if (hasFutureTense) {
      if (!result.includes("will")) {
        result = ["Will", ...result];
      }
    } else if (hasContinuousTense) {
      result = ["Now", ...result];
    }

    return result;
  },

  /**
   * Check if words have corresponding sign language videos
   * @param {Array} words - Array of words
   * @returns {Array} - Words with availability flag
   */
  checkWordAvailability: function (words) {
    // This would normally check against a database of available videos
    // For now, we'll simulate this with a list of common words we know are available
    const availableWords = [
      "hello",
      "thank",
      "you",
      "welcome",
      "please",
      "sorry",
      "yes",
      "no",
      "help",
      "want",
      "need",
      "what",
      "where",
      "when",
      "who",
      "why",
      "how",
      "name",
      "sign",
      "language",
      "learn",
      "good",
      "bad",
      "happy",
      "sad",
      "angry",
      "tired",
      "hungry",
      "thirsty",
      "hot",
      "cold",
      "love",
      "like",
      "hate",
      "friend",
      "family",
      "mother",
      "father",
      "sister",
      "brother",
      "home",
      "school",
      "work",
      "play",
      "eat",
      "drink",
      "sleep",
      "walk",
      "run",
      "go",
      "come",
      "stop",
      "start",
      "finish",
      "before",
      "after",
      "now",
      "later",
      "tomorrow",
      "yesterday",
      "today",
      "time",
      "day",
      "week",
      "month",
      "year",
      "morning",
      "afternoon",
      "evening",
      "night",
      "me",
      "my",
      "mine",
      "your",
      "yours",
      "we",
      "our",
      "they",
      "their",
      "this",
      "that",
      "these",
      "those",
      "here",
      "there",
      "will",
      "can",
      "cannot",
      "do",
      "does",
      "did",
      "done",
      "make",
      "made",
      "see",
      "saw",
      "seen",
      "look",
      "watch",
      "read",
      "write",
      "speak",
      "talk",
      "listen",
      "hear",
      "understand",
      "know",
      "think",
      "believe",
      "feel",
      "touch",
      "give",
      "take",
      "bring",
      "carry",
      "hold",
      "put",
      "get",
      "buy",
      "sell",
      "pay",
      "cost",
      "money",
      "store",
      "shop",
      "food",
      "water",
      "clothes",
      "house",
      "car",
      "bus",
      "train",
      "plane",
      "boat",
      "bike",
      "walk",
      "street",
      "road",
      "way",
      "path",
      "door",
      "window",
      "room",
      "table",
      "chair",
      "bed",
      "bathroom",
      "kitchen",
      "living",
      "room",
      "computer",
      "phone",
      "television",
      "music",
      "movie",
      "book",
      "paper",
      "pen",
      "pencil",
      "color",
      "red",
      "blue",
      "green",
      "yellow",
      "black",
      "white",
      "big",
      "small",
      "tall",
      "short",
      "long",
      "wide",
      "narrow",
      "high",
      "low",
      "new",
      "old",
      "young",
      "beautiful",
      "ugly",
      "clean",
      "dirty",
      "right",
      "wrong",
      "true",
      "false",
      "same",
      "different",
      "all",
      "some",
      "many",
      "few",
      "more",
      "less",
      "first",
      "last",
      "next",
      "before",
      "will",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
    ];

    return words
      .map((word) => {
        // Check if word is available
        const isAvailable = availableWords.includes(word.toLowerCase());

        // If not available, split into individual letters
        if (!isAvailable) {
          return word.split("").filter((char) => /[a-z0-9]/i.test(char));
        }

        return word;
      })
      .flat();
  },
};

// Export SpeechProcessor module
window.SpeechProcessor = SpeechProcessor;
