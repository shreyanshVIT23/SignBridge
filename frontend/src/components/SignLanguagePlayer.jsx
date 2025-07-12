

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Volume2,
  Loader2,
  AlertCircle,
  Hand,
  MessageSquare,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Settings,
  Copy,
  Check,
} from "lucide-react";

const SignLanguagePlayer = () => {
  const [inputText, setInputText] = useState("");
  const [videoPaths, setVideoPaths] = useState([]);
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const BASE_URL = "http://localhost:8000";

  const videoRefs = useRef([]);
  const preloadedVideos = useRef(new Set());

  const handleConvert = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError("");
    setVideoPaths([]);
    setCurrentVideoIndex(0);
    setProgress(0);
    setIsPlaying(false);
    setIsPaused(false);
    preloadedVideos.current.clear();

    try {
      const response = await fetch(
        `${BASE_URL}/videos/process-text/?text=${encodeURIComponent(inputText)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to process text");
      }

      const data = await response.json();
      setGeneratedText(data.generated_text);

      const fullPaths = data.video_paths.map((path) => `${BASE_URL}/${path}`);
      setVideoPaths(fullPaths);
    } catch (error) {
      console.error("Error processing text:", error);
      setError(error.message || "Failed to process text. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Hide all videos except the current one
  const hideAllVideos = () => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        video.style.visibility = "hidden";
        video.style.width = "0";
        video.style.height = "0";
      }
    });
  };

  // Show a specific video
  const showVideo = (index) => {
    if (videoRefs.current[index]) {
      const video = videoRefs.current[index];
      video.style.visibility = "visible";
      video.style.width = "100%";
      video.style.height = "100%";
    }
  };

  useEffect(() => {
    if (videoPaths.length === 0) return;

    // Hide all videos initially
    hideAllVideos();

    // Show the current video
    showVideo(currentVideoIndex);

    // Preload next videos
    if (currentVideoIndex < videoPaths.length - 1) {
      const nextIndex = currentVideoIndex + 1;
      if (!preloadedVideos.current.has(nextIndex)) {
        preloadedVideos.current.add(nextIndex);
        const video = videoRefs.current[nextIndex];
        if (video) {
          video.load();
        }
      }
    }
  }, [currentVideoIndex, videoPaths]);

  const playVideos = async () => {
    if (videoPaths.length === 0) return;

    setIsPlaying(true);
    setIsPaused(false);
    setCurrentVideoIndex(0);
    setError("");
    setBuffering(true);

    try {
      hideAllVideos();
      showVideo(0);
      await videoRefs.current[0].play();
      setBuffering(false);
    } catch (err) {
      console.error("Playback error:", err);
      setError("Failed to start playback. Please try again.");
      setBuffering(false);
    }
  };

  const togglePlayPause = async () => {
    if (!videoRefs.current[currentVideoIndex]) return;

    if (isPaused) {
      try {
        await videoRefs.current[currentVideoIndex].play();
        setIsPaused(false);
      } catch (err) {
        console.error("Resume error:", err);
      }
    } else {
      videoRefs.current[currentVideoIndex].pause();
      setIsPaused(true);
    }
  };

  const skipForward = () => {
    if (currentVideoIndex >= videoPaths.length - 1) return;

    // Hide current video
    hideAllVideos();

    // Show next video
    const nextIndex = currentVideoIndex + 1;
    showVideo(nextIndex);

    setCurrentVideoIndex(nextIndex);

    if (isPlaying && !isPaused) {
      videoRefs.current[nextIndex].play().catch((err) => {
        console.error("Skip forward error:", err);
      });
    }
  };

  const skipBack = () => {
    if (currentVideoIndex <= 0) return;

    // Hide current video
    hideAllVideos();

    // Show previous video
    const prevIndex = currentVideoIndex - 1;
    showVideo(prevIndex);

    setCurrentVideoIndex(prevIndex);

    if (isPlaying && !isPaused) {
      videoRefs.current[prevIndex].play().catch((err) => {
        console.error("Skip backward error:", err);
      });
    }
  };

  const resetPlayback = () => {
    if (videoRefs.current[0]) {
      videoRefs.current[0].currentTime = 0;
    }

    // Hide all videos
    hideAllVideos();

    // Reset to first video
    setCurrentVideoIndex(0);
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
  };

  const handleVideoEnd = () => {
    if (currentVideoIndex < videoPaths.length - 1) {
      // Hide current video
      hideAllVideos();

      // Show next video
      const nextIndex = currentVideoIndex + 1;
      showVideo(nextIndex);

      setCurrentVideoIndex(nextIndex);

      if (isPlaying && !isPaused) {
        videoRefs.current[nextIndex].play().catch((err) => {
          console.error("Auto-play next error:", err);
        });
      }
    } else {
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRefs.current[currentVideoIndex]) return;

    const current = videoRefs.current[currentVideoIndex].currentTime;
    const duration = videoRefs.current[currentVideoIndex].duration || 1;
    const videoProgress = (current / duration) * 100;
    const totalProgress =
      ((currentVideoIndex + videoProgress / 100) / videoPaths.length) * 100;
    setProgress(totalProgress);
  };

  const handleWaiting = () => {
    setBuffering(true);
  };

  const handlePlaying = () => {
    setBuffering(false);
  };

  useEffect(() => {
    if (videoRefs.current[currentVideoIndex]) {
      videoRefs.current[currentVideoIndex].playbackRate = playbackRate;
    }
  }, [playbackRate, currentVideoIndex]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Hand className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sign Language Converter
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Convert your text into sign language videos with AI-powered
          translation and smooth playback controls.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Enter Text to Convert
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message here... (e.g., 'Hello, how are you today?')"
              rows={4}
              className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-x focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-lg"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {inputText.length} characters
              </span>
            </div>
          </div>

          <button
            onClick={handleConvert}
            disabled={isLoading || !inputText.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-lg">Processing your text...</span>
              </>
            ) : (
              <>
                <Volume2 className="h-6 w-6" />
                <span className="text-lg">Convert to Sign Language</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 flex items-start space-x-4">
          <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">
              Error
            </h3>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {generatedText && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-3">
              <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span>Generated Text</span>
            </h3>
            <button
              onClick={() => copyToClipboard(generatedText)}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {copied ? "Copied!" : "Copy"}
              </span>
            </button>
          </div>
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg bg-white dark:bg-gray-600 p-4 rounded-lg">
            {generatedText}
          </p>
        </div>
      )}

      {videoPaths.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-3">
                <Play className="h-6 w-6" />
                <span>Sign Language Videos</span>
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-white bg-white/20 px-3 py-1 rounded-lg">
                  {currentVideoIndex + 1} of {videoPaths.length}
                </span>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {showSettings && (
            <div className="bg-gray-100 dark:bg-gray-700 px-8 py-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Playback Speed:
                  </span>
                  <select
                    value={playbackRate}
                    onChange={(e) =>
                      setPlaybackRate(parseFloat(e.target.value))
                    }
                    className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="0.25">0.25x</option>
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1.0">Normal</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2.0">2x</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="relative bg-black aspect-video overflow-hidden">
            {buffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
              </div>
            )}

            {videoPaths.map((path, index) => (
              <video
                key={index}
                ref={(el) => (videoRefs.current[index] = el)}
                className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
                playsInline
                onEnded={handleVideoEnd}
                onTimeUpdate={handleTimeUpdate}
                onWaiting={handleWaiting}
                onPlaying={handlePlaying}
                onError={() => {
                  setError(`Failed to load video: ${path}`);
                  setIsPlaying(false);
                  setBuffering(false);
                }}
              >
                <source src={path} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ))}

            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20 z-30">
              <div className="flex items-center space-x-4">
                <button
                  onClick={skipBack}
                  disabled={currentVideoIndex === 0}
                  className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <SkipBack className="h-6 w-6" />
                </button>
                <button
                  onClick={togglePlayPause}
                  disabled={!isPlaying}
                  className="p-4 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPaused ? (
                    <Play className="h-8 w-8" />
                  ) : (
                    <Pause className="h-8 w-8" />
                  )}
                </button>
                <button
                  onClick={skipForward}
                  disabled={currentVideoIndex === videoPaths.length - 1}
                  className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <SkipForward className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-8 py-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={playVideos}
                disabled={isPlaying && !isPaused}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                <Play className="h-5 w-5" />
                <span>Play from Start</span>
              </button>

              <button
                onClick={togglePlayPause}
                disabled={!isPlaying}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                {isPaused ? (
                  <Play className="h-5 w-5" />
                ) : (
                  <Pause className="h-5 w-5" />
                )}
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>

              <button
                onClick={resetPlayback}
                disabled={!videoPaths.length}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignLanguagePlayer;
