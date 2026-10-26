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
const PublicPlaceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M3 21h18" />
    <path d="M5 21V8l7-5 7 5v13" />
    <path d="M9 21v-6h6v6" />
    <path d="M9 10h.01M15 10h.01" />
  </svg>
)
const AttendanceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)
const KpiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M18 20V10" />
    <path d="M12 20V4" />
    <path d="M6 20v-6" />
  </svg>
)
const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
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
const InventoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M3 7h18" />
    <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M9 11h6" />
    <path d="M9 15h4" />
  </svg>
)
const VaripanamIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
  </svg>
)
const TradeLicenseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M3 9l1.5-5h15L21 9" />
    <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" />
    <path d="M5 13v7h14v-7" />
    <path d="M10 20v-4h4v4" />
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
  badge?: number | string
  children?: NavChild[]
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
    label: 'KPI & Performance',
    path: '/kpi',
    icon: <KpiIcon />,
    children: [
      { label: 'My KPI Dashboard', path: '/kpi/my-kpi' },
      { label: 'Subordinates & Team KPIs', path: '/kpi/team-kpi' },
      { label: 'Council KPI Benchmarks', path: '/kpi/overview' },
    ],
  },
  {
    label: 'Appointment Management',
    path: '/appointments',
    icon: <CalendarIcon />,
    children: [
      { label: 'Schedule Appointment', path: '/appointments/schedule', roles: ['admin', 'staff', 'manager', 'user', 'citizen'] },
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
    label: 'Inventory Management',
    path: '/inventory-management',
    icon: <InventoryIcon />,
    children: [
      { label: 'Overview', path: '/inventory-management/overview' },
      { label: 'All Inventory', path: '/inventory-management/all' },
      { label: 'Stock Usage', path: '/inventory-management/usage' },
      { label: 'Inventory Request', path: '/inventory-management/request' },
      { label: 'Inventory Approve', path: '/inventory-management/approve', roles: ['admin'] },
    ],
  },
  {
    label: 'Fleet Management',
    path: '/fleet',
    icon: <FleetIcon />,
    children: [
      { label: 'Fleet Dashboard', path: '/fleet/overview' },
      { label: 'Vehicle Registry', path: '/fleet/vehicles' },
      { label: 'Live Dispatch & Location', path: '/fleet/dispatch' },
      { label: 'Fleet Booking', path: '/fleet/bookings' },
      { label: 'Maintenance Workshop', path: '/fleet/maintenance' },
      { label: 'Drivers & Operators', path: '/fleet/drivers' },
      { label: 'Authorizations Desk', path: '/fleet/approvals' },
    ]
  },
  {
    label: 'Varipanam Management',
    path: '/varipanam',
    icon: <VaripanamIcon />,
    roles: ['superadmin', 'admin'],
    children: [
      { label: 'Overview', path: '/varipanam/overview' },
      { label: 'Properties', path: '/varipanam/properties' },
      { label: 'Add New Property', path: '/varipanam/add-property' },
      { label: 'Approvals', path: '/varipanam/approvals', badge: 3 },
      { label: 'Subdivision', path: '/varipanam/subdivision' },
      { label: 'Ownership Change', path: '/varipanam/ownership-change' },
      { label: 'Valuation & Relief', path: '/varipanam/valuation-relief' },
      { label: 'Assessment Notices', path: '/varipanam/notices' },
      { label: 'Billing & Payments', path: '/varipanam/billing-payments' },
      { label: 'Arrears & Warrants', path: '/varipanam/arrears-warrants' },
      { label: 'Field Collection', path: '/varipanam/field-collection' },
      { label: 'Historical Search', path: '/varipanam/historical-search' },
      { label: 'Reports', path: '/varipanam/reports' },
      { label: 'Settings', path: '/varipanam/settings' },
    ],
  },
  {
    label: 'Trade License',
    path: '/trade-license',
    icon: <TradeLicenseIcon />,
    roles: ['superadmin', 'admin', 'staff'],
    children: [
      { label: 'Dashboard', path: '/trade-license/dashboard' },
      { label: 'Trade Applications', path: '/trade-license/applications' },
      { label: 'Assignments & Inspections', path: '/trade-license/inspections' },
      { label: 'Approvals', path: '/trade-license/approvals' },
      { label: 'Licenses & Payments', path: '/trade-license/licenses' },
    ],
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
    label: 'Public Place Booking',
    path: '/public-place-booking',
    icon: <PublicPlaceIcon />,
    roles: ['admin', 'staff', 'manager', 'superadmin'],
    children: [
      { label: 'Staff Booking Dashboard', path: '/public-place-booking/dashboard' },
      { label: 'My Booking', path: '/public-place-booking/my-booking' },
      { label: 'Payment & Billing', path: '/public-place-booking/payments' },
      { label: 'Venue Preparation', path: '/public-place-booking/readiness' },
      { label: 'Permit & Venue Handover', path: '/public-place-booking/handover' },
      { label: 'Final Reconciliation', path: '/public-place-booking/settlement' },
    ],
  },
  {
    label: 'User Management',
    path: '/users',
    icon: <UsersIcon />,
    children: [
      { label: 'Manage Users', path: '/users/manage' },
      { label: 'Create User', path: '/users/create' },
      { label: 'Add Staff Member', path: '/users/staff/create' },
      { label: 'Approve Staff', path: '/users/staff/approve' },
    ],
  },
  { label: 'Profile', path: '/profile', icon: <ProfileIcon /> },
]

// ── Sub-component ──────────────────────────────────────────────────────────
interface SidebarNavItemProps {
  item: NavItem
  visibleChildren: NavChild[]
  isOpen: boolean
  isDesktopCollapsed: boolean
  setIsMobileOpen: (open: boolean) => void
  toggleMenu: (path: string) => void
  handleMainItemClick: (item: NavItem, visibleChildren: NavChild[]) => void
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  visibleChildren,
  isOpen,
  isDesktopCollapsed,
  setIsMobileOpen,
  toggleMenu,
  handleMainItemClick,
}) => {
  const location = useLocation()
  const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  const hasChildren = visibleChildren.length > 0
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    '/varipanam': true,
  })

  const toggleSubMenu = (path: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [path]: !prev[path] }))
  }

  return (
    <div className="relative group">
      {hasChildren ? (
        // Expandable item
        <div
          className={`w-full flex items-center justify-between text-sm font-medium transition-all ${
            active ? 'bg-[#A31736] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <button
            type="button"
            onClick={() => handleMainItemClick(item, visibleChildren)}
            title={isDesktopCollapsed ? item.label : undefined}
            className={`flex-1 flex items-center gap-3 py-3 text-left transition-all ${
              isDesktopCollapsed ? 'lg:justify-center lg:px-0 lg:py-3.5' : 'px-5'
            }`}
          >
            <span className={active ? 'text-white' : 'text-gray-500'}>{item.icon}</span>
            <span className={`flex-1 ${isDesktopCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
          </button>
          <button
            type="button"
            onClick={() => toggleMenu(item.path)}
            className={`p-1 mr-3 rounded transition-colors ${
              active ? 'hover:bg-white/20' : 'hover:bg-gray-200'
            } ${isDesktopCollapsed ? 'lg:hidden' : ''}`}
            aria-label={isOpen ? 'Collapse submenu' : 'Expand submenu'}
          >
            <ChevronDownIcon open={isOpen} />
          </button>
        </div>
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
            const hasSubChildren = child.children && child.children.length > 0
            const childActive =
              location.pathname === child.path ||
              (child.path === '/varipanam/properties' && location.pathname.startsWith('/varipanam/properties/')) ||
              (child.path === '/trade-license/applications' && location.pathname.startsWith('/trade-license/applications/')) ||
              (hasSubChildren && location.pathname.startsWith(child.path))
            const isSubOpen = openSubMenus[child.path] ?? location.pathname.startsWith(child.path)

            if (hasSubChildren) {
              return (
                <div key={child.path} className="border-t border-gray-200/40 first:border-0">
                  <div
                    className={`flex items-center justify-between pl-8 pr-3 py-2 text-xs font-bold transition-all ${
                      childActive ? 'text-[#A31736] bg-[#A31736]/10' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Link
                      to={child.children![0].path}
                      onClick={() => setIsMobileOpen(false)}
                      className="flex-1 flex items-center gap-2 truncate"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${childActive ? 'bg-[#A31736]' : 'bg-gray-400'}`} />
                      <span className="truncate">{child.label}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleSubMenu(child.path)}
                      className="p-1 hover:bg-black/5 rounded cursor-pointer"
                      title={isSubOpen ? 'Collapse sub-menu' : 'Expand sub-menu'}
                    >
                      <ChevronDownIcon open={isSubOpen} />
                    </button>
                  </div>

                  {isSubOpen && (
                    <div className="bg-gray-100/60 py-1 border-l-2 border-[#A31736]/40 ml-8 mb-1">
                      {child.children!.map((subChild) => {
                        const subActive =
                          location.pathname === subChild.path ||
                          (subChild.path === '/varipanam/properties' &&
                            location.pathname.startsWith('/varipanam/properties/')) ||
                          (subChild.path === '/finances/varipanam/properties' &&
                            location.pathname.startsWith('/finances/varipanam/properties/'))

                        return (
                          <Link
                            key={subChild.path}
                            to={subChild.path}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center justify-between pl-5 pr-3 py-1.5 text-xs font-medium transition-all ${
                              subActive
                                ? 'bg-[#A31736]/15 text-[#A31736] font-bold border-r-4 border-[#A31736]'
                                : 'text-gray-600 hover:bg-gray-200/70 hover:text-[#A31736]'
                            }`}
                          >
                            <span className="truncate">{subChild.label}</span>
                            {subChild.badge !== undefined && (
                              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-black rounded-full bg-[#A31736] text-white shrink-0">
                                {subChild.badge}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={child.path}
                to={child.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between pl-12 pr-5 py-2.5 text-sm font-medium transition-all ${
                  childActive
                    ? 'bg-[#A31736]/15 text-[#A31736] font-bold border-r-4 border-[#A31736]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#A31736]'
                }`}
              >
                <div className="flex items-center min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full mr-2.5 shrink-0 transition-colors ${childActive ? 'bg-[#A31736]' : 'bg-gray-300'}`} />
                  <span className="truncate">{child.label}</span>
                </div>
                {child.badge !== undefined && (
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] font-black rounded-full bg-[#A31736] text-white shrink-0">
                    {child.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}

      {/* Flyout menu / tooltip when collapsed on desktop */}
      {isDesktopCollapsed && (
        <div className="hidden lg:group-hover:block absolute left-full top-0 ml-1 z-[60] bg-gray-900 text-white rounded-lg shadow-xl py-2 px-3 min-w-[220px] pointer-events-auto transition-opacity duration-150 max-h-[85vh] overflow-y-auto">
          <div className="font-semibold text-xs pb-1.5 border-b border-gray-700 text-gray-100">
            {item.label}
          </div>
          {hasChildren ? (
            <div className="mt-1 flex flex-col gap-1 pt-1">
              {visibleChildren.map((child) => {
                const hasSubChildren = child.children && child.children.length > 0
                const childActive =
                  location.pathname === child.path ||
                  (child.path === '/varipanam/properties' && location.pathname.startsWith('/varipanam/properties/')) ||
                  (hasSubChildren && location.pathname.startsWith(child.path))

                if (hasSubChildren) {
                  return (
                    <div key={child.path} className="pt-1.5 mt-1 border-t border-gray-700/60">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-0.5">
                        {child.label}
                      </div>
                      {child.children!.map((sub) => {
                        const subActive =
                          location.pathname === sub.path ||
                          (sub.path === '/varipanam/properties' && location.pathname.startsWith('/varipanam/properties/')) ||
                          (sub.path === '/finances/varipanam/properties' && location.pathname.startsWith('/finances/varipanam/properties/'))
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center justify-between text-xs py-1 px-2.5 rounded transition-colors ${
                              subActive
                                ? 'bg-[#A31736] text-white font-semibold'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            <span className="truncate">{sub.label}</span>
                            {sub.badge !== undefined && (
                              <span className="ml-1.5 px-1.5 py-0.2 text-[9px] font-black rounded-full bg-rose-600 text-white">
                                {sub.badge}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )
                }

                return (
                  <Link
                    key={child.path}
                    to={child.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded transition-colors ${
                      childActive
                        ? 'bg-[#A31736] text-white font-semibold'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{child.label}</span>
                    {child.badge !== undefined && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-black rounded-full bg-rose-600 text-white shrink-0">
                        {child.badge}
                      </span>
                    )}
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
}

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
    '/attendance': false,
    '/appointments': false,
    '/letters': false,
    '/applications': false,
    '/assets': false,
    '/inventory-management': false,
    '/fleet': false,
    '/varipanam': false,
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
        <button
          type="button"
          aria-label="Close navigation sidebar"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 border-none outline-none cursor-default"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Floating Edge Button to Reveal Sidebar on Mobile when hidden */}
      {!isMobileOpen && (
        <button
          type="button"
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
            type="button"
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
            type="button"
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
            const visibleChildren = getVisibleChildren(item.children)
            const isOpen = openMenus[item.path]

            return (
              <SidebarNavItem
                key={item.path}
                item={item}
                visibleChildren={visibleChildren}
                isOpen={isOpen}
                isDesktopCollapsed={isDesktopCollapsed}
                setIsMobileOpen={setIsMobileOpen}
                toggleMenu={toggleMenu}
                handleMainItemClick={handleMainItemClick}
              />
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
          type="button"
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
