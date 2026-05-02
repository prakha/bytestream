import { useNavigate, useLocation } from 'react-router';
import { 
    HomeIcon, 
    FireIcon, 
    QueueListIcon, 
    ClockIcon, 
    VideoCameraIcon,
    ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { 
    HomeIcon as HomeIconSolid,
    FireIcon as FireIconSolid,
    QueueListIcon as QueueListIconSolid,
    ClockIcon as ClockIconSolid,
    VideoCameraIcon as VideoCameraIconSolid
} from '@heroicons/react/24/solid';

const sidebarItems = [
    { name: 'Home', path: '/dashboard', icon: HomeIcon, activeIcon: HomeIconSolid },
    { name: 'Trending', path: '/trending', icon: FireIcon, activeIcon: FireIconSolid },
    { name: 'Subscriptions', path: '/subscriptions', icon: QueueListIcon, activeIcon: QueueListIconSolid },
    { name: 'Library', path: '/library', icon: ClockIcon, activeIcon: ClockIconSolid },
    { name: 'Your Videos', path: '/your-videos', icon: VideoCameraIcon, activeIcon: VideoCameraIconSolid },
];

export const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-20 h-[calc(100vh-80px)] overflow-y-auto">
            <div className="p-4 space-y-2">
                {sidebarItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = isActive ? item.activeIcon : item.icon;
                    
                    return (
                        <button
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer ${
                                isActive 
                                    ? 'bg-purple-50 text-purple-600 font-semibold' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <Icon className={`w-6 h-6 transition-transform duration-200 ${
                                isActive ? 'scale-110' : 'group-hover:scale-110'
                            }`} />
                            <span className="text-sm tracking-wide">{item.name}</span>
                        </button>
                    );
                })}
            </div>

            <div className="mt-auto p-4 border-t border-gray-100">
                <button
                    onClick={() => navigate('/upload')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    <span>Upload New</span>
                </button>
            </div>
            
            <div className="p-6 text-xs text-gray-400">
                <p>© 2024 ByteStream</p>
                <div className="flex gap-2 mt-2">
                    <a href="#" className="hover:text-gray-600">Privacy</a>
                    <span>•</span>
                    <a href="#" className="hover:text-gray-600">Terms</a>
                </div>
            </div>
        </aside>
    );
};
