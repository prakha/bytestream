import { useNavigate, useLocation } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { logout } from '../../../../store/authSlice';

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 cursor-pointer flex-shrink-0"
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight hidden lg:block">
                            <span className="text-purple-600">Byte</span>Stream
                        </span>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-2xl mx-8 hidden md:block">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search videos..."
                                className="w-full bg-gray-100 border-none rounded-2xl py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                            />
                        </div>
                    </div>

                    {/* Right side actions */}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
                            <button
                                onClick={() => navigate('/upload')}
                                className={`flex items-center gap-2 px-6 py-2.5 text-base font-medium rounded-xl transition-all cursor-pointer ${location.pathname === '/upload'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Upload
                            </button>

                            <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-base font-semibold shadow-md">
                                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-base text-gray-500 hover:text-red-500 transition-colors cursor-pointer font-medium"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-2.5 bg-purple-600 text-white text-base font-medium rounded-xl hover:bg-purple-700 transition-all cursor-pointer shadow-lg shadow-purple-200 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};