import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchVideos } from '../../store/videoSlice';
import { PageWrapper } from '../../components/Wrapper/PageWrapper';
import { 
    PlayCircleIcon, 
    VideoCameraIcon,
    ArrowPathIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export const Dashboard = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { videos, loading, error } = useAppSelector((state) => state.videos);
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchVideos());
        }
    }, [dispatch, isAuthenticated]);

    return (
        <PageWrapper title="Explore">
            <div className="max-w-[1600px] mx-auto">
                {/* Welcome Header */}
                <header className="mb-8 p-8 bg-gradient-to-r from-purple-900 to-blue-900 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.email?.split('@')[0]}!</h1>
                        <p className="text-purple-100/80 text-lg max-w-lg">
                            Discover the latest streams or share your own journey with the world.
                        </p>
                    </div>
                    {/* Abstract background blobs */}
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-purple-500 rounded-full blur-[80px] opacity-20 animate-pulse" />
                    <div className="absolute bottom-[-20%] left-[20%] w-48 h-48 bg-blue-400 rounded-full blur-[60px] opacity-10 animate-pulse" />
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <ArrowPathIcon className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Curating your personalized feed...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-3xl border border-red-100">
                        <ExclamationCircleIcon className="w-16 h-16 text-red-400 mb-4" />
                        <h2 className="text-xl font-semibold text-red-900 mb-2">Something went wrong</h2>
                        <p className="text-red-600/80 mb-6">{error}</p>
                        <button
                            onClick={() => dispatch(fetchVideos())}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 cursor-pointer font-medium"
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                            Try Again
                        </button>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-24 h-24 bg-purple-50 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-inner">
                            <VideoCameraIcon className="w-12 h-12 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your library is empty</h2>
                        <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
                            Be the first to upload a video and start your creator journey today.
                        </p>
                        <button
                            onClick={() => navigate('/upload')}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-200 cursor-pointer"
                        >
                            Create Your First Video
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {videos.map((video) => (
                            <div
                                key={video.id}
                                onClick={() => navigate(`/watch/${video.id}`)}
                                className="group cursor-pointer"
                            >
                                {/* Thumbnail Container */}
                                <div className="aspect-video bg-gray-200 rounded-3xl relative overflow-hidden mb-4 shadow-sm group-hover:shadow-2xl group-hover:shadow-purple-100 transition-all duration-300">
                                    {/* Thumbnail Image */}
                                    {video.thumbnailUrl ? (
                                        <img 
                                            src={video.thumbnailUrl} 
                                            alt={video.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100" />
                                    )}
                                    
                                    {/* Play Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 backdrop-blur-[2px]">
                                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                                            <PlayCircleIcon className="w-10 h-10 text-purple-600" />
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="absolute top-4 right-4">
                                        <div className={`px-3 py-1.5 rounded-2xl backdrop-blur-md border border-white/20 flex items-center gap-2 text-xs font-bold shadow-lg ${
                                            video.status === 'READY'
                                                ? 'bg-green-500/80 text-white'
                                                : video.status === 'PENDING'
                                                ? 'bg-amber-500/80 text-white'
                                                : 'bg-red-500/80 text-white'
                                        }`}>
                                            <span className={`w-2 h-2 rounded-full animate-pulse ${
                                                video.status === 'READY' ? 'bg-white' : 'bg-white/80'
                                            }`} />
                                            {video.status}
                                        </div>
                                    </div>

                                    {/* Time Tag Placeholder */}
                                    <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/70 text-white text-[10px] font-bold rounded-lg backdrop-blur-sm">
                                        12:45
                                    </div>
                                </div>

                                {/* Video Info */}
                                <div className="px-2">
                                    <h3 className="text-gray-900 font-bold text-lg line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors mb-2">
                                        {video.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-400 to-blue-400 flex items-center justify-center text-white text-[10px] font-bold">
                                            {user?.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-700">ByteStream Creator</p>
                                            <p className="text-xs">1.2M views • 2 hours ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PageWrapper>
    );
};