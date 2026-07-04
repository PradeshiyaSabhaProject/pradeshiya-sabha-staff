import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

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
      { label: 'Asset Overview', path: '/assets/overview' }
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
  { label: 'Profile', path: '/profile', icon: <ProfileIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon />, roles: ['admin', 'superadmin'] },
]

// ── Component ──────────────────────────────────────────────────────────────
const Sidebar: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    '/appointments': false,
    '/letters': false,
    '/assets': false,
  })

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
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Admin Portal label */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Staff Portal</p>
        <p className="text-[10px] text-gray-400">Authorized Personnel Only</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-2 min-h-0">
        {visibleNavItems.map((item) => {
          const active = isActive(item.path)
          const visibleChildren = getVisibleChildren(item.children)
          const hasChildren = visibleChildren.length > 0
          const isOpen = openMenus[item.path]

          return (
            <div key={item.path}>
              {hasChildren ? (
                // Expandable item
                <button
                  onClick={() => handleMainItemClick(item, visibleChildren)}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all text-left ${active
                      ? 'bg-[#A31736] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className={active ? 'text-white' : 'text-gray-500'}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleMenu(item.path)
                    }}
                    className={`p-1 rounded transition-colors ${active ? 'hover:bg-white/20' : 'hover:bg-gray-200'
                      }`}
                  >
                    <ChevronDownIcon open={isOpen} />
                  </span>
                </button>
              ) : (
                // Plain link
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all ${active
                      ? 'bg-[#A31736] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className={active ? 'text-white' : 'text-gray-500'}>{item.icon}</span>
                  {item.label}
                </Link>
              )}

              {/* Sub-items */}
              {hasChildren && isOpen && (
                <div className="bg-gray-50 border-t border-b border-gray-100 py-1">
                  {visibleChildren.map((child) => {
                    const childActive = location.pathname === child.path
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`flex items-center pl-14 pr-5 py-2.5 text-sm font-medium transition-all ${childActive
                            ? 'bg-[#A31736]/15 text-[#A31736] font-bold border-r-4 border-[#A31736]'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-[#A31736]'
                          }`}
                      >
                        {child.label}
                      </Link>
                    )
                  })}
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
          className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all ${isActive('/archive')
              ? 'bg-[#A31736] text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-50'
            }`}
        >
          <span className={isActive('/archive') ? 'text-white' : 'text-gray-500'}>
            <ArchiveIcon />
          </span>
          Archive
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <span className="text-gray-500">
            <LogoutIcon />
          </span>
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
