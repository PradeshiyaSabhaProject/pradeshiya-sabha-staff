import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const navLinks = [
    { name: 'Overview', path: '/overview', icon: '📊' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ]

  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <h1 className="font-bold text-lg text-cyan-400">Pradeshiya Sabha</h1>
              <p className="text-xs text-slate-400">Governance Portal</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{link.icon}</span>
                  {link.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-slate-950">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div className="text-sm">
                <p className="font-medium truncate max-w-[100px]">{user?.name}</p>
                <p className="text-xs text-slate-400">Admin</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="text-slate-400 hover:text-rose-400 transition-colors p-1"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-200">
              {location.pathname === '/overview' ? 'Overview Dashboard' : 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
            </button>
          </div>
        </header>

        {/* Main Content (<Outlet />) */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
export default DashboardLayout
