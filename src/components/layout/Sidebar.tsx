import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSidebar } from '../../context/SidebarContext'

// ── Icons ──────────────────────────────────────────────────────────────────
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const AssetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)
const FleetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <rect x="1" y="3" width="22" height="13" rx="2" />
    <circle cx="6" cy="20" r="2" />
    <circle cx="18" cy="20" r="2" />
    <path d="M14 9h5v4h-5z" />
  </svg>
)
const ComplainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const LetterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="22,4 12,13 2,4" />
  </svg>
)
const ApplicationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
)
const BookingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M9 16l2 2 4-4" />
  </svg>
)
const AttendanceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)
const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const ArchiveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" rx="1" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
)
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)
const ChevronDownIcon = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

// ── Nav data ───────────────────────────────────────────────────────────────
interface NavChild {
  label: string
  path: string
  roles?: string[]
}

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  children?: NavChild[]
  roles?: string[]
}

const navItems: NavItem[] = [
  { label: 'Overview', path: '/overview', icon: <GridIcon /> },
  {
    label: 'Staff Attendance & Leave',
    path: '/attendance',
    icon: <AttendanceIcon />,
    children: [
      { label: 'Daily Biometric Dashboard', path: '/attendance/dashboard' },
      { label: 'Employee Timecards', path: '/attendance/timecards' },
      { label: 'My Leave & Applications', path: '/attendance/my-leave' },
      { label: 'My Attendance Corrections', path: '/attendance/my-corrections' },
      { label: 'Manager Approvals Queue', path: '/attendance/approvals' },
      { label: 'Monthly Duty Rosters', path: '/attendance/rosters' },
    ],
  },
  {
    label: 'Appointment Management',
    path: '/appointments',
    icon: <CalendarIcon />,
    children: [
      { label: 'All Appointments', path: '/appointments/all', roles: ['admin', 'manager'] },
      { label: 'My Appointments', path: '/appointments/my', roles: ['admin', 'staff', 'manager', 'user', 'citizen'] },
      { label: 'System Audits (Restricted)', path: '/appointments/audits', roles: ['superadmin'] },
    ],
  },
  {
    label: 'Asset Management',
    path: '/assets',
    icon: <AssetIcon />,
    children: [
      { label: 'Asset Overview', path: '/assets/overview' },
      { label: 'Asset Directory', path: '/assets/directory' },
      { label: 'Interactive GIS Mapping', path: '/assets/gis-mapping' },
    ]
  },
  {
    label: 'Fleet Management',
    path: '/fleet',
    icon: <FleetIcon />,
    children: [
      { label: 'Fleet Dashboard', path: '/fleet/overview' },
      { label: 'Vehicle Registry', path: '/fleet/vehicles' },
      { label: 'Live Dispatch & Location', path: '/fleet/dispatch' },
      { label: 'Maintenance Workshop', path: '/fleet/maintenance' },
      { label: 'Drivers & Operators', path: '/fleet/drivers' },
      { label: 'Authorizations Desk', path: '/fleet/approvals' },
    ]
  },
  {
    label: 'Complain Management',
    path: '/complaints',
    icon: <ComplainIcon />,
    children: [
      { label: 'All Complaints', path: '/complaints/all', roles: ['admin', 'manager'] },
      { label: 'My Complaints', path: '/complaints/my', roles: ['admin', 'staff', 'manager', 'user', 'citizen'] },
    ],
  },
  {
    label: 'Letter Management',
    path: '/letters',
    icon: <LetterIcon />,
    children: [
      { label: 'All Letters', path: '/letters/all', roles: ['admin', 'manager'] },
      { label: 'My Letters', path: '/letters/my', roles: ['admin', 'staff', 'manager', 'user', 'citizen'] },
      { label: 'Inward Letters', path: '/letters/inward', roles: ['admin', 'staff', 'manager'] },
      { label: 'Outward Letters', path: '/letters/outward', roles: ['admin', 'staff', 'manager'] },
      { label: 'Assigned Officers', path: '/letters/assigned', roles: ['admin', 'manager', 'superadmin'] },
      { label: 'Write Letter', path: '/letters/write', roles: ['admin', 'staff', 'manager', 'user', 'citizen'] },
    ],
  },
  {
    label: 'Application Management',
    path: '/applications',
    icon: <ApplicationIcon />,
    children: [
      { label: 'All Applications', path: '/applications/all', roles: ['admin', 'manager'] },
      { label: 'My Applications', path: '/applications/my', roles: ['admin', 'staff', 'manager', 'user', 'citizen'] },
      { label: 'Assigned Officers', path: '/applications/officers', roles: ['admin', 'manager', 'superadmin'] },
    ],
  },
  {
    label: 'Booking Management',
    path: '/bookings',
    icon: <BookingIcon />,
    children: [
      { label: 'All Facility Bookings', path: '/bookings/all' },
      { label: 'Approvals Queue', path: '/bookings/approvals' },
      { label: 'Facility Schedule', path: '/bookings/schedule' },
    ],
  },
  {
    label: 'User Management',
    path: '/users',
    icon: <UsersIcon />,
    children: [
      { label: 'Manage Users', path: '/users/manage' },
      { label: 'Create User', path: '/users/create' },
    ],
  },
  { label: 'Profile', path: '/profile', icon: <ProfileIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon />, roles: ['admin', 'superadmin'] },
]

// ── Component ──────────────────────────────────────────────────────────────
const Sidebar: React.FC = () => {
  const { user, logout } = useAuth()
  const {
    isMobileOpen,
    setIsMobileOpen,
    isDesktopCollapsed,
    setIsDesktopCollapsed,
    toggleDesktopSidebar,
  } = useSidebar()
  const location = useLocation()
  const navigate = useNavigate()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    '/attendance': true,
    '/appointments': false,
    '/letters': false,
    '/applications': false,
    '/assets': false,
    '/fleet': false,
    '/users': false,
  })

  useEffect(() => {
    if (isMobileOpen) {
      setIsMobileOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const toggleMenu = (path: string) => {
    setOpenMenus((prev) => ({ ...prev, [path]: !prev[path] }))
  }

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const getVisibleChildren = (children?: NavChild[]): NavChild[] => {
    if (!children) return []
    return children.filter((child) => {
      if (!child.roles || child.roles.length === 0) return true
      return user?.role ? child.roles.includes(user.role) : true
    })
  }

  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true
    return user?.role ? item.roles.includes(user.role) : true
  })

  const handleMainItemClick = (item: NavItem, visibleChildren: NavChild[]) => {
    if (isDesktopCollapsed && window.innerWidth >= 1024) {
      setIsDesktopCollapsed(false)
    }
    if (visibleChildren.length > 0) {
      const firstChild = visibleChildren[0]
      if (location.pathname === firstChild.path) {
        toggleMenu(item.path)
      } else {
        if (!openMenus[item.path]) {
          setOpenMenus((prev) => ({ ...prev, [item.path]: true }))
        }
        navigate(firstChild.path)
      }
    } else {
      toggleMenu(item.path)
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Floating Edge Button to Reveal Sidebar on Mobile when hidden */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          aria-label="Reveal Sidebar Menu"
          title="Reveal / Open Navigation Menu"
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 lg:hidden bg-[#A31736] text-white py-3 px-2 rounded-r-xl shadow-2xl border border-l-0 border-[#801028] flex items-center justify-center hover:bg-[#801028] active:scale-95 transition-all cursor-pointer group"
        >
          <div className="flex flex-col items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5 group-hover:translate-x-0.5 transition-transform">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider [writing-mode:vertical-lr] rotate-180">Menu</span>
          </div>
        </button>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'
        } ${isDesktopCollapsed ? 'w-64 lg:w-16' : 'w-64 lg:w-56'}`}
      >
        {/* Admin Portal label & Toggle Buttons */}
        <div
          className={`px-4 py-4 border-b border-gray-100 flex items-center justify-between min-h-[58px] ${
            isDesktopCollapsed ? 'lg:justify-center lg:px-2' : ''
          }`}
        >
          <div className={`${isDesktopCollapsed ? 'lg:hidden' : 'block'} overflow-hidden`}>
            <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase whitespace-nowrap">
              Staff Portal
            </p>
            <p className="text-[10px] text-gray-400 whitespace-nowrap">Authorized Personnel Only</p>
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close Sidebar"
            title="Hide / Close menu"
            className="px-2.5 py-1 rounded-lg text-gray-600 hover:text-red-700 hover:bg-red-50 lg:hidden transition-colors shrink-0 flex items-center gap-1 font-bold text-xs bg-gray-100 border border-gray-200"
          >
            <span>Close</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Desktop collapse / expand button right on sidebar */}
          <button
            onClick={toggleDesktopSidebar}
            title={isDesktopCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className={`hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-[#A31736] hover:bg-gray-100 transition-colors shrink-0 ${
              isDesktopCollapsed ? '' : 'ml-auto'
            }`}
          >
            {isDesktopCollapsed ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            )}
          </button>
        </div>

        {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-2 min-h-0">
        {visibleNavItems.map((item) => {
          const active = isActive(item.path)
          const visibleChildren = getVisibleChildren(item.children)
          const hasChildren = visibleChildren.length > 0
          const isOpen = openMenus[item.path]

          return (
            <div key={item.path} className="relative group">
              {hasChildren ? (
                // Expandable item
                <button
                  onClick={() => handleMainItemClick(item, visibleChildren)}
                  title={isDesktopCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 py-3 text-sm font-medium transition-all text-left ${
                    active ? 'bg-[#A31736] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
                  } ${isDesktopCollapsed ? 'lg:justify-center lg:px-0 lg:py-3.5' : 'px-5'}`}
                >
                  <span className={active ? 'text-white' : 'text-gray-500'}>{item.icon}</span>
                  <span className={`flex-1 ${isDesktopCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleMenu(item.path)
                    }}
                    className={`p-1 rounded transition-colors ${
                      active ? 'hover:bg-white/20' : 'hover:bg-gray-200'
                    } ${isDesktopCollapsed ? 'lg:hidden' : ''}`}
                  >
                    <ChevronDownIcon open={isOpen} />
                  </span>
                </button>
              ) : (
                // Plain link
                <Link
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  title={isDesktopCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 py-3 text-sm font-medium transition-all ${
                    active ? 'bg-[#A31736] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
                  } ${isDesktopCollapsed ? 'lg:justify-center lg:px-0 lg:py-3.5' : 'px-5'}`}
                >
                  <span className={active ? 'text-white' : 'text-gray-500'}>{item.icon}</span>
                  <span className={isDesktopCollapsed ? 'lg:hidden' : ''}>{item.label}</span>
                </Link>
              )}

              {/* Sub-items drawer when expanded */}
              {hasChildren && isOpen && (
                <div className={`bg-gray-50 border-t border-b border-gray-100 py-1 ${isDesktopCollapsed ? 'lg:hidden' : ''}`}>
                  {visibleChildren.map((child) => {
                    const childActive = location.pathname === child.path
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center pl-12 pr-5 py-2.5 text-sm font-medium transition-all ${
                          childActive
                            ? 'bg-[#A31736]/15 text-[#A31736] font-bold border-r-4 border-[#A31736]'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-[#A31736]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-2.5 shrink-0 transition-colors ${childActive ? 'bg-[#A31736]' : 'bg-gray-300'}`}></span>
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Flyout menu / tooltip when collapsed on desktop */}
              {isDesktopCollapsed && (
                <div className="hidden lg:group-hover:block absolute left-full top-0 ml-1 z-[60] bg-gray-900 text-white rounded-lg shadow-xl py-2 px-3 min-w-[200px] pointer-events-auto transition-opacity duration-150">
                  <div className="font-semibold text-xs pb-1.5 border-b border-gray-700 text-gray-100">
                    {item.label}
                  </div>
                  {hasChildren ? (
                    <div className="mt-1 flex flex-col gap-1 pt-1">
                      {visibleChildren.map((child) => {
                        const childActive = location.pathname === child.path
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setIsMobileOpen(false)}
                            className={`text-xs py-1.5 px-2.5 rounded transition-colors block ${
                              childActive
                                ? 'bg-[#A31736] text-white font-semibold'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className="text-xs text-gray-300 hover:text-white block pt-1.5"
                    >
                      Go to {item.label}
                    </Link>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom: Archive + Logout */}
      <div className="border-t border-gray-200 py-2">
        <Link
          to="/archive"
          onClick={() => setIsMobileOpen(false)}
          title={isDesktopCollapsed ? 'Archive' : undefined}
          className={`flex items-center gap-3 py-3 text-sm font-medium transition-all relative group ${
            isActive('/archive') ? 'bg-[#A31736] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
          } ${isDesktopCollapsed ? 'lg:justify-center lg:px-0' : 'px-5'}`}
        >
          <span className={isActive('/archive') ? 'text-white' : 'text-gray-500'}>
            <ArchiveIcon />
          </span>
          <span className={isDesktopCollapsed ? 'lg:hidden' : ''}>Archive</span>
          {isDesktopCollapsed && (
            <div className="hidden lg:group-hover:block absolute left-full top-1/2 -translate-y-1/2 ml-1 z-[60] bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap">
              Archive
            </div>
          )}
        </Link>
        <button
          onClick={() => {
            setIsMobileOpen(false)
            logout()
          }}
          title={isDesktopCollapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors relative group ${
            isDesktopCollapsed ? 'lg:justify-center lg:px-0' : 'px-5'
          }`}
        >
          <span className="text-gray-500 group-hover:text-red-700 transition-colors">
            <LogoutIcon />
          </span>
          <span className={isDesktopCollapsed ? 'lg:hidden' : ''}>Logout</span>
          {isDesktopCollapsed && (
            <div className="hidden lg:group-hover:block absolute left-full top-1/2 -translate-y-1/2 ml-1 z-[60] bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
    </>
  )
}

export default Sidebar

