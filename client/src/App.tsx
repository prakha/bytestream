import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { MainLayout } from './Layout/MainLayout/MainLayout.tsx'
import { Dashboard } from './pages/Dashboard/index.tsx'
import { LoginPage } from './pages/Login/index.tsx'
import { UploadPage } from './pages/Upload/index.tsx'
import { WatchPage } from './pages/Watch/index.tsx'
import { SubscriptionsPage } from './pages/Subscriptions/index.tsx'
import { TrendingPage } from './pages/Trending/index.tsx'
import { LibraryPage } from './pages/Library/index.tsx'
import { YourVideosPage } from './pages/YourVideos/index.tsx'
import { ProtectedRoute } from './components/ProtectedRoute/index.tsx'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected routes with layout */}
                <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/upload" element={
                        <ProtectedRoute>
                            <UploadPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/subscriptions" element={
                        <ProtectedRoute>
                            <SubscriptionsPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/trending" element={
                        <ProtectedRoute>
                            <TrendingPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/library" element={
                        <ProtectedRoute>
                            <LibraryPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/your-videos" element={
                        <ProtectedRoute>
                            <YourVideosPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/watch/:id" element={
                        <ProtectedRoute>
                            <WatchPage />
                        </ProtectedRoute>
                    } />
                </Route>

                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
