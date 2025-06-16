const SequentialVideoPlayer = ({ videos }) => {
    const videoRef = useRef(null);
    const preloadVideoRef = useRef(null);
    const currentIndexRef = useRef(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
  
    useEffect(() => {
      if (!videos || videos.length === 0) return;
      
      const playNextVideo = () => {
        if (currentIndexRef.current >= videos.length - 1) {
          // Loop back to start if at end
          currentIndexRef.current = 0;
        } else {
          currentIndexRef.current += 1;
        }
        
        videoRef.current.src = videos[currentIndexRef.current];
        videoRef.current.play().catch(e => console.error("Play failed:", e));
        preloadNextVideo();
      };
  
      const preloadNextVideo = () => {
        const nextIndex = (currentIndexRef.current + 1) % videos.length;
        preloadVideoRef.current.src = videos[nextIndex];
        preloadVideoRef.current.load();
      };
  
      const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;
        setProgress(duration ? (currentTime / duration) * 100 : 0);
      };
  
      const video = videoRef.current;
      video.addEventListener('ended', playNextVideo);
      video.addEventListener('timeupdate', handleTimeUpdate);
      
      // Initial setup
      videoRef.current.src = videos[0];
      videoRef.current.play().catch(e => console.error("Initial play failed:", e));
      preloadNextVideo();
  
      return () => {
        video.removeEventListener('ended', playNextVideo);
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }, [videos]);
  
    const togglePlayPause = () => {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };
  
    if (!videos || videos.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">No videos available</p>
        </div>
      );
    }
  
    return (
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Main video player */}
        <div 
          className="relative w-full bg-black rounded-lg overflow-hidden cursor-pointer"
          onClick={togglePlayPause}
        >
          <video
            ref={videoRef}
            className="w-full h-auto max-h-[70vh]"
            playsInline
            preload="auto"
            muted={false}
          />
          
          {/* Play/Pause overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black bg-opacity-50 rounded-full p-4">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
          <div 
            className="h-full bg-purple-600 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Preload video (hidden) */}
        <video
          ref={preloadVideoRef}
          className="hidden"
          preload="auto"
        />
      </div>
    );
  };
export default SequentialVideoPlayer;  