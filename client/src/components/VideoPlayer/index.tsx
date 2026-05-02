import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
    PlayIcon, 
    PauseIcon, 
    SpeakerWaveIcon, 
    SpeakerXMarkIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/solid';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    autoPlay?: boolean;
    className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    src,
    poster,
    autoPlay = false,
    className = '',
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls: Hls | null = null;

        const initPlayer = () => {
            setIsLoading(true);
            setError(null);

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                video.addEventListener('loadedmetadata', () => {
                    setIsLoading(false);
                    setDuration(video.duration);
                    if (autoPlay) {
                        video.play().catch(e => console.error("Autoplay failed:", e));
                    }
                });
                video.addEventListener('error', () => {
                    setError('Native HLS playback failed.');
                    setIsLoading(false);
                });
            } else if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });

                hls.loadSource(src);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setIsLoading(false);
                    setDuration(video.duration);
                    if (autoPlay) {
                        video.play().catch(e => console.error("Autoplay failed:", e));
                    }
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                hls?.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                hls?.recoverMediaError();
                                break;
                            default:
                                hls?.destroy();
                                setError(`Playback error: ${data.details}`);
                                break;
                        }
                    }
                });
            } else {
                setError('HLS is not supported in this browser.');
                setIsLoading(false);
            }
        };

        initPlayer();

        const handleTimeUpdate = () => {
            setProgress((video.currentTime / video.duration) * 100);
        };

        const handlePlayState = () => setIsPlaying(true);
        const handlePauseState = () => setIsPlaying(false);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', handlePlayState);
        video.addEventListener('pause', handlePauseState);

        return () => {
            if (hls) hls.destroy();
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('play', handlePlayState);
            video.removeEventListener('pause', handlePauseState);
        };
    }, [src, autoPlay]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) {
            videoRef.current.volume = val;
            videoRef.current.muted = val === 0;
            setIsMuted(val === 0);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        if (videoRef.current) {
            videoRef.current.currentTime = pos * videoRef.current.duration;
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return [h, m, s]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":");
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    return (
        <div 
            ref={containerRef}
            className={`group relative w-full h-full bg-black overflow-hidden select-none ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                poster={poster}
                className="w-full h-full object-contain cursor-pointer"
                playsInline
                onClick={togglePlay}
            />

            {/* Loading Spinner */}
            {isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40 backdrop-blur-sm">
                    <ArrowPathIcon className="w-12 h-12 text-white animate-spin opacity-80" />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-900/90 backdrop-blur-md px-6 text-center">
                    <div>
                        <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Playback Error</h3>
                        <p className="text-gray-400 mb-6 max-w-md">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all active:scale-95"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Overlay Controls */}
            <div className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                {/* Gradient Bottom */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                {/* Big Play/Pause Center (Only visible briefly or when paused) */}
                {!isPlaying && !isLoading && !error && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                            <PlayIcon className="w-10 h-10 text-white ml-1" />
                        </div>
                    </div>
                )}

                {/* Control Bar */}
                <div className="relative px-4 pb-4 space-y-3">
                    {/* Progress Bar */}
                    <div 
                        className="group/progress relative h-1.5 w-full bg-white/20 rounded-full cursor-pointer transition-all hover:h-2"
                        onClick={handleSeek}
                    >
                        <div 
                            className="absolute top-0 left-0 h-full bg-red-600 rounded-full flex items-center justify-end"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="w-3 h-3 bg-red-600 rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 text-white">
                        <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="hover:scale-110 transition-transform">
                                {isPlaying ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7" />}
                            </button>

                            <div className="flex items-center gap-2 group/volume">
                                <button onClick={toggleMute} className="hover:scale-110 transition-transform">
                                    {isMuted || volume === 0 ? <SpeakerXMarkIcon className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6" />}
                                </button>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.05" 
                                    value={isMuted ? 0 : volume} 
                                    onChange={handleVolumeChange}
                                    className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 accent-white h-1 cursor-pointer"
                                />
                            </div>

                            <div className="text-sm font-medium tabular-nums">
                                <span>{formatTime(videoRef.current?.currentTime || 0)}</span>
                                <span className="mx-1 opacity-50">/</span>
                                <span className="opacity-70">{formatTime(duration)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button onClick={toggleFullscreen} className="hover:scale-110 transition-transform">
                                {isFullscreen ? <ArrowsPointingInIcon className="w-6 h-6" /> : <ArrowsPointingOutIcon className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
