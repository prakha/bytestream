import { Navbar } from './components/Navbar/Navbar.tsx'
import { Sidebar } from './components/Sidebar/Sidebar.tsx'
import { Outlet } from 'react-router'

export const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}