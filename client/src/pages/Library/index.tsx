import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchLikedVideos, fetchWatchHistory } from '../../store/videoSlice';
import { PageWrapper } from '../../components/Wrapper/PageWrapper';
import { 
    ClockIcon, 
    HandThumbUpIcon, 
    ChevronRightIcon,
    PlayCircleIcon
} from '@heroicons/react/24/outline';

export const LibraryPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { likedVideos, watchHistory, loading } = useAppSelector((state) => state.videos);

    useEffect(() => {
        dispatch(fetchLikedVideos());
        dispatch(fetchWatchHistory());
    }, [dispatch]);

    const VideoShelf = ({ title, icon: Icon, videos, emptyMessage }: any) => (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    <span className="text-sm font-medium text-gray-400 ml-2">
                        {videos.length} videos
                    </span>
                </div>
                {videos.length > 0 && (
                    <button className="flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                        View All
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                )}
            </div>

            {videos.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium">{emptyMessage}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {videos.slice(0, 5).map((video: any) => (
                        <div 
                            key={video.id}
                            onClick={() => navigate(`/watch/${video.id}`)}
                            className="group cursor-pointer"
                        >
                            <div className="aspect-video bg-gray-200 rounded-xl relative overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-all duration-300">
                                {video.thumbnailUrl ? (
                                    <img 
                                        src={video.thumbnailUrl} 
                                        alt={video.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                        <PlayCircleIcon className="w-12 h-12 text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center scale-90 group-hover:scale-100 transition-transform shadow-lg">
                                        <PlayCircleIcon className="w-8 h-8 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors">
                                {video.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                                {new Date(video.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );

    return (
        <PageWrapper title="Library">
            <div className="max-w-7xl mx-auto py-8">
                <header className="mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Library</h1>
                    <p className="text-gray-500 text-lg">Manage your history, likes, and playlists in one place.</p>
                </header>

                <VideoShelf 
                    title="History" 
                    icon={ClockIcon} 
                    videos={watchHistory}
                    emptyMessage="You haven't watched any videos yet."
                />

                <div className="h-px bg-gray-100 my-12" />

                <VideoShelf 
                    title="Liked Videos" 
                    icon={HandThumbUpIcon} 
                    videos={likedVideos}
                    emptyMessage="Videos you like will appear here."
                />
            </div>
        </PageWrapper>
    );
};
