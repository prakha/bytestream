import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
    fetchVideoById, 
    clearCurrentVideo, 
    subscribeToCreator, 
    unsubscribeFromCreator, 
    checkSubscriptionStatus, 
    incrementView,
    toggleLike,
    fetchLikeStatus
} from '../../store/videoSlice';
import VideoPlayer from '../../components/VideoPlayer';
import {
    HandThumbUpIcon,
    HandThumbDownIcon,
    ShareIcon,
    EllipsisHorizontalIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';

export const WatchPage = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { currentVideo, videos, subscriptionStatus, isLiked } = useAppSelector((state) => state.videos);
    const relatedVideos = videos.filter(v => v.id !== id).slice(0, 10);
    console.log("currentVideo", currentVideo)

    useEffect(() => {
        if (id) {
            dispatch(fetchVideoById(id));
            dispatch(incrementView(id));
            dispatch(fetchLikeStatus(id));
        }
        return () => {
            dispatch(clearCurrentVideo());
        };
    }, [id, dispatch]);

    useEffect(() => {
        if (currentVideo?.user_id) {
            dispatch(checkSubscriptionStatus(currentVideo.user_id));
        }
    }, [currentVideo?.user_id, dispatch]);

    const handleSubscription = () => {
        if (!currentVideo?.user_id) return;
        
        if (subscriptionStatus?.isSubscribed) {
            dispatch(unsubscribeFromCreator(currentVideo.user_id));
        } else {
            dispatch(subscribeToCreator(currentVideo.user_id));
        }
    };

    if (!currentVideo) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-gray-400">
                    <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
                    <p className="text-sm font-medium animate-pulse">Loading experience...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            <div className="max-w-[1700px] mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Player Container */}
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border border-white/5">
                        {currentVideo.streamUrl ? (
                            <VideoPlayer
                                src={currentVideo.streamUrl}
                                poster={currentVideo.thumbnailUrl}
                                autoPlay={true}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                <div className="text-center p-8">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <ArrowPathIcon className="w-10 h-10 text-white/20 animate-spin" />
                                    </div>
                                    <h2 className="text-xl font-bold mb-2">Video is being prepared</h2>
                                    <p className="text-zinc-500 max-w-xs mx-auto">We're transcoding this video for the best possible quality. Please check back in a moment.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Video Meta */}
                    <div className="mt-5 space-y-4">
                        <h1 className="text-xl lg:text-2xl font-bold line-clamp-2 leading-tight">
                            {currentVideo.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-white/10 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0" />
                                <div>
                                    <div className="flex items-center gap-1">
                                        <h3 className="font-bold text-base">Content Creator</h3>
                                        <CheckBadgeIcon className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <p className="text-zinc-400 text-xs">
                                        {subscriptionStatus?.subscriberCount || 0} subscribers
                                    </p>
                                </div>
                                <button 
                                    onClick={handleSubscription}
                                    className={`ml-4 px-6 py-2 text-sm font-bold rounded-full transition-all duration-300 ${
                                        subscriptionStatus?.isSubscribed 
                                            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' 
                                            : 'bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/10'
                                    }`}
                                >
                                    {subscriptionStatus?.isSubscribed ? 'Subscribed' : 'Subscribe'}
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-white/10 rounded-full overflow-hidden">
                                    <button 
                                        onClick={() => id && dispatch(toggleLike(id))}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                                            isLiked 
                                                ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100' 
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                    >
                                        <HandThumbUpIcon className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                        <span className="text-sm font-medium">{isLiked ? 'Liked' : 'Like'}</span>
                                    </button>
                                    <button className="px-4 py-2 hover:bg-white/10 transition-colors">
                                        <HandThumbDownIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                                    <ShareIcon className="w-5 h-5" />
                                    <span className="text-sm font-medium">Share</span>
                                </button>
                                <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                                    <EllipsisHorizontalIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Description Box */}
                        <div className="bg-white/5 rounded-xl p-4 hover:bg-white/[0.08] transition-colors cursor-pointer">
                            <div className="flex gap-3 text-sm font-bold mb-1">
                                <span>1.5M views</span>
                                <span>2 days ago</span>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3">
                                This is a sample description for the video. In a real application, this would be fetched from the database.
                                The design uses a dark theme with subtle borders and glassmorphism effects for a premium look.
                            </p>
                            <button className="mt-2 text-sm font-bold hover:text-zinc-400">Show more</button>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Related Videos */}
                <div className="w-full lg:w-[400px] flex-shrink-0 space-y-4">
                    <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider px-1">Up Next</h3>
                    {relatedVideos.map((video) => (
                        <div 
                            key={video.id} 
                            onClick={() => navigate(`/watch/${video.id}`)}
                            className="flex gap-3 group cursor-pointer"
                        >
                            <div className="w-40 aspect-video bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                                {video.thumbnailUrl ? (
                                    <img 
                                        src={video.thumbnailUrl} 
                                        alt={video.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-700 animate-pulse" />
                                )}
                                <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-[10px] font-bold rounded">
                                    12:45
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold line-clamp-2 group-hover:text-zinc-300 transition-colors leading-snug">
                                    {video.title}
                                </h4>
                                <p className="text-xs text-zinc-500 mt-1">ByteStream Creator</p>
                                <p className="text-xs text-zinc-500">500K views • 1 month ago</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

// Placeholder for missing icons in imports above
const ArrowPathIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);
