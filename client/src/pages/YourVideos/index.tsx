import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMyVideos } from '../../store/videoSlice';
import { PageWrapper } from '../../components/Wrapper/PageWrapper';
import { 
    VideoCameraIcon, 
    EllipsisVerticalIcon,
    ChartBarIcon,
    ChatBubbleLeftIcon,
    HandThumbUpIcon,
    TrashIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export const YourVideosPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { myVideos, loading } = useAppSelector((state) => state.videos);

    useEffect(() => {
        dispatch(fetchMyVideos());
    }, [dispatch]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'READY':
                return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Ready</span>;
            case 'PROCESSING':
                return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <ArrowPathIcon className="w-3 h-3 animate-spin" />
                    Processing
                </span>;
            default:
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
        }
    };

    return (
        <PageWrapper title="Your Videos">
            <div className="max-w-7xl mx-auto py-8 px-4">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Channel content</h1>
                        <p className="text-gray-500">Manage your videos, check processing status, and track performance.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/upload')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
                    >
                        <VideoCameraIcon className="w-5 h-5" />
                        Create New
                    </button>
                </header>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">Video</th>
                                    <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">Visibility</th>
                                    <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">Views</th>
                                    <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && myVideos.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <ArrowPathIcon className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-4" />
                                            <p className="text-gray-500 font-medium">Loading your dashboard...</p>
                                        </td>
                                    </tr>
                                ) : myVideos.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <VideoCameraIcon className="w-10 h-10 text-gray-300" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">No videos uploaded yet</h3>
                                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Upload your first video to start growing your channel and reach your audience.</p>
                                            <button 
                                                onClick={() => navigate('/upload')}
                                                className="text-purple-600 font-bold hover:underline"
                                            >
                                                Upload your first video →
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    myVideos.map((video) => (
                                        <tr key={video.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-32 aspect-video bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0 border border-gray-100">
                                                        {video.thumbnailUrl ? (
                                                            <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <VideoCameraIcon className="w-8 h-8 text-gray-300" />
                                                            </div>
                                                        )}
                                                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded">10:00</div>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors cursor-pointer" onClick={() => video.status === 'READY' && navigate(`/watch/${video.id}`)}>
                                                            {video.title}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">Add description...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                {getStatusBadge(video.status)}
                                            </td>
                                            <td className="px-6 py-6">
                                                <p className="text-sm text-gray-600 font-medium">{new Date(video.created_at).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Uploaded</p>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-1.5">
                                                    <ChartBarIcon className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-bold text-gray-700">{video.view_count || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                                                        <ChartBarIcon className="w-5 h-5" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                                                        <EllipsisVerticalIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};
