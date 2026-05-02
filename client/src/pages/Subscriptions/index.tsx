import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchSubscribedVideos } from '../../store/videoSlice';
import { PageWrapper } from '../../components/Wrapper/PageWrapper';
import { 
    PlayCircleIcon, 
    ArrowPathIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

export const SubscriptionsPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { subscribedVideos, loading, error } = useAppSelector((state) => state.videos);

    useEffect(() => {
        dispatch(fetchSubscribedVideos());
    }, [dispatch]);

    return (
        <PageWrapper title="Subscriptions">
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-8 p-8 bg-gradient-to-r from-zinc-900 to-black rounded-3xl text-white shadow-2xl border border-white/5">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <UserGroupIcon className="w-10 h-10 text-purple-500" />
                        Subscriptions
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Stay updated with the latest from your favorite creators.
                    </p>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <ArrowPathIcon className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Fetching your subscription feed...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={() => dispatch(fetchSubscribedVideos())}
                            className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : subscribedVideos.length === 0 ? (
                    <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/5">
                        <div className="w-24 h-24 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <UserGroupIcon className="w-12 h-12 text-purple-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-300 mb-3">No subscriptions found</h2>
                        <p className="text-zinc-500 text-lg mb-10 max-w-md mx-auto">
                            Subscribe to creators to see their latest videos right here.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                        >
                            Explore Creators
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {subscribedVideos.map((video) => (
                            <div
                                key={video.id}
                                onClick={() => navigate(`/watch/${video.id}`)}
                                className="group cursor-pointer"
                            >
                                <div className="aspect-video bg-zinc-900 rounded-3xl relative overflow-hidden mb-4 shadow-sm border border-white/5 group-hover:border-purple-500/30 transition-all duration-300">
                                    {video.thumbnailUrl ? (
                                        <img 
                                            src={video.thumbnailUrl} 
                                            alt={video.title} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                                    )}
                                    
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                                            <PlayCircleIcon className="w-10 h-10 text-purple-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-2">
                                    <h3 className="text-gray-100 font-bold text-lg line-clamp-2 leading-snug group-hover:text-purple-400 transition-colors mb-2">
                                        {video.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-[10px] font-bold border border-white/5">
                                            {video.user_id?.charAt(0).toUpperCase() || 'C'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-zinc-400">ByteStream Creator</p>
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
