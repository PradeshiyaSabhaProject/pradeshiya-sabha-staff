import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  useDashboardData,
  type TaskInboxItem,
  type Notice,
} from './hooks/useDashboardData'

// ─────────────────────────────────────────────────────────────────────────────
// Custom Icons
// ─────────────────────────────────────────────────────────────────────────────
const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#A31736]">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M8 10h.01" />
    <path d="M16 10h.01" />
    <path d="M8 14h.01" />
    <path d="M16 14h.01" />
  </svg>
)

const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#A31736]">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <polyline points="9 14 11 16 15 12" />
  </svg>
)

const SmileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#ea580c]">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
)

const FleetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#0284c7]">
    <rect x="1" y="3" width="22" height="13" rx="2" />
    <circle cx="6" cy="20" r="2" />
    <circle cx="18" cy="20" r="2" />
    <path d="M14 9h5v4h-5z" />
  </svg>
)

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#16a34a]">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const RefreshIcon = ({ spin }: { spin?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={`w-4 h-4 ${spin ? 'animate-spin' : ''}`}
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const AlertTriangleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-amber-600">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-green-600">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const ArrowUpRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

// ─────────────────────────────────────────────────────────────────────────────
// Priority & Status Styling Helpers
// ─────────────────────────────────────────────────────────────────────────────
const PRIORITY_BADGES: Record<string, string> = {
  URGENT: 'bg-red-50 text-red-700 border-red-200',
  HIGH: 'bg-orange-50 text-orange-800 border-orange-200',
  MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
  LOW: 'bg-gray-100 text-gray-700 border-gray-200',
}

const MODULE_TAGS: Record<string, { label: string; color: string }> = {
  applications: { label: 'Permit', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  complaints: { label: 'Grievance', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  letters: { label: 'Inward Letter', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  inventory: { label: 'Store Req', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  fleet: { label: 'Transport', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  bookings: { label: 'Facility', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
}

const APPOINTMENT_STATUS_BADGES: Record<string, string> = {
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export const OverviewPage: React.FC = () => {
  const {
    loading,
    lastRefreshed,
    refreshData,
    kpiStats,
    taskInbox,
    appointments,
    facilityBookings,
    lowStockAlerts,
    fleetStatus,
    notices,
    activityLogs,
    departmentHealth,
  } = useDashboardData()

  // State
  const [activeModuleTab, setActiveModuleTab] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Filtered Task Inbox
  const filteredTasks = useMemo(() => {
    return taskInbox.filter((task: TaskInboxItem) => {
      const matchModule = activeModuleTab === 'all' || task.module === activeModuleTab
      const matchPriority = priorityFilter === 'all' || task.priority === priorityFilter
      const matchSearch =
        searchQuery.trim() === '' ||
        task.refId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.citizenOrRequester.toLowerCase().includes(searchQuery.toLowerCase())

      return matchModule && matchPriority && matchSearch
    })
  }, [taskInbox, activeModuleTab, priorityFilter, searchQuery])

  // Skeleton Helper
  const renderSkeleton = (h = 'h-28') => (
    <div className={`${h} bg-gray-100 rounded animate-pulse border border-gray-200`} />
  )

  const handleExportSummary = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      alert('Municipal Daily Executive Summary exported successfully (CSV / PDF ready).')
    }, 800)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* ── 1. Page Header & Operational Shift Banner ──────────────────────── */}
      <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Active Shift: 08:00 - 16:30
              </span>
              <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                Synced at {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase mt-1">
              Homagama Pradeshiya Sabha • Municipal Command Overview
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Live multi-department governance hub: monitor approvals, citizen grievances, fleet dispatch, store logistics, and biometric attendance.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={refreshData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold px-3.5 py-2 rounded border border-gray-300 transition-colors uppercase tracking-wider shadow-2xs cursor-pointer"
              title="Refresh all municipal live data feeds"
            >
              <RefreshIcon spin={loading} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleExportSummary}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-4 py-2 rounded transition-colors shadow-2xs uppercase tracking-wider cursor-pointer"
            >
              <DownloadIcon />
              <span>{isExporting ? 'Exporting...' : 'Executive Export'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Top Executive KPI Summary Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? [1, 2, 3, 4].map(i => <div key={i}>{renderSkeleton('h-36')}</div>)
          : kpiStats.map(stat => (
            <Link
              key={stat.id}
              to={stat.link}
              className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-[#A31736] transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate">
                  {stat.label}
                </span>
                <div className="p-1.5 bg-rose-50 rounded shrink-0 border border-rose-100 group-hover:scale-105 transition-transform">
                  {stat.icon === 'clipboard' && <ClipboardIcon />}
                  {stat.icon === 'smile' && <SmileIcon />}
                  {stat.icon === 'fleet' && <FleetIcon />}
                  {stat.icon === 'users' && <UsersIcon />}
                </div>
              </div>

              <div className="mt-2.5">
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {stat.value}
                  </p>
                  {stat.trendBadge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                      {stat.trendBadge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium mt-1 truncate">
                  {stat.subText}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className={`font-semibold ${stat.isPositive ? 'text-emerald-700' : 'text-[#A31736]'}`}>
                  {stat.change}
                </span>
                <span className="text-[11px] font-bold text-[#A31736] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                  Open Desk <ArrowUpRightIcon />
                </span>
              </div>
            </Link>
          ))}
      </div>

      {/* ── 3. Main Central Operational Split (2/3 vs 1/3) ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left 2 Columns: Centralized Operational Task Queue ──────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Centralized Action Queue */}
          <div className="bg-white border border-gray-300 rounded shadow-xs overflow-hidden flex flex-col">
            {/* Box Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/70">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <BuildingIcon />
                    Centralized Municipal Action Queue
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Unified triage queue across Building Permits, Citizen Complaints, Inward Letters, Inventory, and Fleet Operations.
                  </p>
                </div>
                <span className="self-start sm:self-auto text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#A31736]/10 text-[#A31736] border border-[#A31736]/20">
                  {filteredTasks.length} Pending Actions
                </span>
              </div>

              {/* Module Filter Tabs */}
              <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                {[
                  { id: 'all', label: 'All Operations' },
                  { id: 'applications', label: 'Permits & Applications' },
                  { id: 'complaints', label: 'Citizen Grievances' },
                  { id: 'letters', label: 'Inward Letters' },
                  { id: 'inventory', label: 'Inventory Stores' },
                  { id: 'fleet', label: 'Fleet & Logistics' },
                  { id: 'bookings', label: 'Public Bookings' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveModuleTab(tab.id)}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                      activeModuleTab === tab.id
                        ? 'bg-[#A31736] text-white shadow-2xs'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search & Priority Controls */}
              <div className="mt-3 flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by Ref ID, Subject, Citizen Name, or Department..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[#A31736] focus:border-[#A31736] outline-none text-gray-800"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-1.5 text-xs bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[#A31736] focus:border-[#A31736] outline-none text-gray-700 font-semibold cursor-pointer uppercase tracking-wider"
                  >
                    <option value="all">Priority: All</option>
                    <option value="URGENT">Urgent Only</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-4">REF ID & MODULE</th>
                    <th className="py-3 px-4">DEPARTMENT</th>
                    <th className="py-3 px-4">TASK SUBJECT & REQUESTER</th>
                    <th className="py-3 px-4">PRIORITY</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {loading ? (
                    [1, 2, 3, 4, 5].map(i => (
                      <tr key={i}>
                        <td colSpan={6} className="p-4">{renderSkeleton('h-10')}</td>
                      </tr>
                    ))
                  ) : filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 text-xs font-semibold">
                        No pending operational actions found for the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map(item => {
                      const modTag = MODULE_TAGS[item.module] || { label: 'Task', color: 'bg-gray-100 text-gray-700' }
                      return (
                        <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-mono text-xs font-bold text-gray-900">{item.refId}</div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider inline-block mt-0.5 ${modTag.color}`}>
                              {modTag.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="text-xs font-bold text-gray-800">{item.department}</div>
                            <div className="text-[10px] text-gray-500">{item.submittedAt}</div>
                          </td>
                          <td className="py-3 px-4 max-w-[280px]">
                            <div className="text-xs font-semibold text-gray-900 group-hover:text-[#A31736] transition-colors line-clamp-2">
                              {item.subject}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                              Req: <span className="font-medium text-gray-700">{item.citizenOrRequester}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider inline-block ${PRIORITY_BADGES[item.priority]}`}>
                              {item.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <Link
                              to={item.actionLink}
                              className="inline-flex items-center gap-1 border border-[#A31736] text-[#A31736] hover:bg-[#A31736] hover:text-white transition-all text-xs font-bold px-3 py-1.5 rounded bg-white shadow-2xs uppercase tracking-wider cursor-pointer"
                            >
                              <span>{item.actionLabel}</span>
                              <ArrowUpRightIcon />
                            </Link>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
              <span>Showing {filteredTasks.length} active operational queues</span>
              <div className="flex items-center gap-3">
                <Link to="/applications/all" className="font-bold text-[#A31736] hover:underline uppercase tracking-wider text-[11px]">
                  All Applications →
                </Link>
                <Link to="/complaints/all" className="font-bold text-[#A31736] hover:underline uppercase tracking-wider text-[11px]">
                  All Complaints →
                </Link>
                <Link to="/inventory-management/approve" className="font-bold text-[#A31736] hover:underline uppercase tracking-wider text-[11px]">
                  Inventory Approvals →
                </Link>
              </div>
            </div>
          </div>

          {/* ── Low Stock Watchlist & Live Fleet Dispatch Strip ──────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Inventory Critical Alerts */}
            <div className="bg-white border border-gray-300 rounded p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangleIcon />
                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-900">
                      Stores Low Stock Alerts
                    </h3>
                  </div>
                  <Link
                    to="/inventory-management/overview"
                    className="text-[11px] font-bold text-[#A31736] hover:underline uppercase tracking-wider"
                  >
                    View Stores →
                  </Link>
                </div>
                <div className="space-y-2.5">
                  {loading
                    ? [1, 2, 3].map(i => <div key={i}>{renderSkeleton('h-12')}</div>)
                    : lowStockAlerts.map(alertItem => (
                      <div
                        key={alertItem.id}
                        className="p-2.5 rounded border border-gray-200 bg-rose-50/30 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-gray-600">{alertItem.itemCode}</span>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-red-100 text-red-700 border border-red-200">
                              {alertItem.status}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-gray-900 truncate mt-0.5">{alertItem.name}</p>
                          <p className="text-[10px] text-gray-500">
                            Available: <span className="font-bold text-red-600">{alertItem.currentStock} {alertItem.unit}</span> (Min: {alertItem.reorderLevel})
                          </p>
                        </div>
                        <Link
                          to="/inventory-management/request"
                          className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white border border-gray-300 hover:border-[#A31736] hover:text-[#A31736] rounded shrink-0 shadow-2xs"
                        >
                          Reorder
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Fleet & Ward Dispatches Status */}
            <div className="bg-white border border-gray-300 rounded p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <FleetIcon />
                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-900">
                      Live Fleet Operations
                    </h3>
                  </div>
                  <Link
                    to="/fleet/overview"
                    className="text-[11px] font-bold text-[#A31736] hover:underline uppercase tracking-wider"
                  >
                    Fleet Desk →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-sky-50 border border-sky-200 rounded p-2.5 text-center">
                    <p className="text-xl font-black text-sky-800">{fleetStatus.onField}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Vehicles on Field</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 text-center">
                    <p className="text-xl font-black text-emerald-800">{fleetStatus.available}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Ready Standby</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded p-2.5 text-center">
                    <p className="text-xl font-black text-amber-800">{fleetStatus.inMaintenance}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">In Workshop</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-center">
                    <p className="text-xl font-black text-slate-800">{fleetStatus.activeDispatchesToday}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Dispatches Today</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 font-medium">GPS Active Tracking: <strong className="text-gray-800">100%</strong></span>
                  <Link to="/fleet/dispatch" className="font-bold text-[#A31736] hover:underline uppercase tracking-wider">
                    Live Map →
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* ── Recent Activity Stream / Audit Trail ────────────────────────── */}
          <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 flex items-center gap-2">
                <CheckCircleIcon />
                Recent Council Operational Activity Stream
              </h3>
              <span className="text-xs text-gray-400 font-medium">Real-time audit</span>
            </div>

            <div className="divide-y divide-gray-100">
              {loading
                ? [1, 2, 3].map(i => <div key={i} className="py-2.5">{renderSkeleton('h-10')}</div>)
                : activityLogs.map(log => (
                  <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-[#A31736] mt-1.5 shrink-0" />
                      <div>
                        <p className="text-gray-800 font-medium">
                          <strong className="text-gray-900 font-bold">{log.user}</strong> ({log.role}) {log.action}{' '}
                          <span className="font-bold text-[#A31736]">{log.target}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium shrink-0 whitespace-nowrap">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
            </div>
          </div>

        </div>

        {/* ── Right Column: Side Modules & Today's Appointments ────────────── */}
        <div className="space-y-6">

          {/* Today's Citizen Appointments Widget */}
          <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5">
                <CalendarIcon />
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                  Today's Citizen Appointments
                </h3>
              </div>
              <Link
                to="/appointments/all"
                className="text-[11px] font-bold text-[#A31736] hover:underline uppercase tracking-wider"
              >
                All ({appointments.length}) →
              </Link>
            </div>

            <div className="space-y-2.5">
              {loading
                ? [1, 2, 3, 4].map(i => <div key={i}>{renderSkeleton('h-14')}</div>)
                : appointments.map(apt => (
                  <div
                    key={apt.id}
                    className="p-3 rounded border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-[#A31736] transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-black text-[#A31736]">{apt.time}</span>
                          <span className="text-xs font-bold text-gray-900">{apt.citizenName}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 font-medium mt-0.5">{apt.serviceType}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${APPOINTMENT_STATUS_BADGES[apt.status]}`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                      <span>Officer: <strong className="text-gray-700">{apt.officer}</strong></span>
                      <span className="text-gray-400">{apt.ward}</span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-3 text-center">
              <Link
                to="/appointments/schedule"
                className="w-full inline-block py-1.5 text-center text-xs font-bold uppercase tracking-wider bg-gray-100 hover:bg-[#A31736] hover:text-white rounded border border-gray-300 transition-colors"
              >
                + Schedule Walk-in Appointment
              </Link>
            </div>
          </div>

          {/* Departmental Workload & Health */}
          <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                Departmental Processing Load
              </h3>
              <Link
                to="/kpi/overview"
                className="text-[11px] font-bold text-[#A31736] hover:underline uppercase tracking-wider"
              >
                KPI Details →
              </Link>
            </div>

            <div className="space-y-3.5">
              {loading
                ? [1, 2, 3, 4].map(i => <div key={i}>{renderSkeleton('h-10')}</div>)
                : departmentHealth.map(dept => (
                  <div key={dept.id}>
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="font-bold text-gray-800 truncate">{dept.department}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`font-extrabold ${dept.textColor}`}>{dept.loadPercent}%</span>
                        <span className="text-[10px] text-gray-400">({dept.status})</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-sm h-2 overflow-hidden border border-gray-200">
                      <div
                        className={`${dept.barColor} h-2 rounded-sm transition-all duration-700`}
                        style={{ width: `${dept.loadPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-0.5">
                      <span>{dept.activeCases} active cases</span>
                      <span>{dept.completedToday} closed today</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Public Facility Reservations Widget */}
          <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                Facility Reservations
              </h3>
              <Link
                to="/bookings/all"
                className="text-[11px] font-bold text-[#A31736] hover:underline uppercase tracking-wider"
              >
                Manage Bookings →
              </Link>
            </div>

            <div className="space-y-2">
              {loading
                ? [1, 2].map(i => <div key={i}>{renderSkeleton('h-14')}</div>)
                : facilityBookings.map(item => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded border border-gray-200 bg-gray-50/50 hover:bg-white text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{item.facilityName}</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      {item.bookingDate} • {item.timeSlot}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500">
                      <span>Applicant: {item.applicantName}</span>
                      <strong className="text-gray-700">{item.amount}</strong>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Official Notices & Gazettes */}
          <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                Official Notices & Gazettes
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                Circulars
              </span>
            </div>

            <div className="space-y-2.5">
              {loading
                ? [1, 2].map(i => <div key={i}>{renderSkeleton('h-16')}</div>)
                : notices.map(notice => (
                  <div
                    key={notice.id}
                    onClick={() => setSelectedNotice(notice)}
                    className="p-3 rounded border border-gray-200 bg-amber-50/20 hover:bg-amber-50/60 hover:border-amber-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        {notice.type}
                      </span>
                      <span className="text-[10px] text-gray-400">{notice.postedAt}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 mt-1 line-clamp-2">
                      {notice.title}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                      {notice.body}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Command Nav Hub */}
          <div className="bg-slate-900 border border-slate-800 rounded p-4 sm:p-5 shadow-md text-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Council Quick Operations Hub
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/attendance/dashboard"
                className="p-2.5 rounded bg-slate-800/80 hover:bg-[#A31736] border border-slate-700 transition-all flex flex-col justify-between group"
              >
                <span className="font-bold text-white text-[11px]">Staff Biometrics</span>
                <span className="text-[10px] text-slate-400 group-hover:text-white mt-1">Clock-in Roster →</span>
              </Link>
              <Link
                to="/fleet/overview"
                className="p-2.5 rounded bg-slate-800/80 hover:bg-[#A31736] border border-slate-700 transition-all flex flex-col justify-between group"
              >
                <span className="font-bold text-white text-[11px]">Fleet Logistics</span>
                <span className="text-[10px] text-slate-400 group-hover:text-white mt-1">Live Map & Wards →</span>
              </Link>
              <Link
                to="/inventory-management/all"
                className="p-2.5 rounded bg-slate-800/80 hover:bg-[#A31736] border border-slate-700 transition-all flex flex-col justify-between group"
              >
                <span className="font-bold text-white text-[11px]">Stores & Stock</span>
                <span className="text-[10px] text-slate-400 group-hover:text-white mt-1">Inventory Desk →</span>
              </Link>
              <Link
                to="/assets/gis-mapping"
                className="p-2.5 rounded bg-slate-800/80 hover:bg-[#A31736] border border-slate-700 transition-all flex flex-col justify-between group"
              >
                <span className="font-bold text-white text-[11px]">GIS Asset Map</span>
                <span className="text-[10px] text-slate-400 group-hover:text-white mt-1">Council Assets →</span>
              </Link>
              <Link
                to="/letters/inward"
                className="p-2.5 rounded bg-slate-800/80 hover:bg-[#A31736] border border-slate-700 transition-all flex flex-col justify-between group"
              >
                <span className="font-bold text-white text-[11px]">Official Letters</span>
                <span className="text-[10px] text-slate-400 group-hover:text-white mt-1">Inward Registry →</span>
              </Link>
              <Link
                to="/kpi/overview"
                className="p-2.5 rounded bg-slate-800/80 hover:bg-[#A31736] border border-slate-700 transition-all flex flex-col justify-between group"
              >
                <span className="font-bold text-white text-[11px]">KPI Benchmarks</span>
                <span className="text-[10px] text-slate-400 group-hover:text-white mt-1">Performance →</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* ── Notice Detail Modal ────────────────────────────────────────────── */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-300 rounded shadow-xl max-w-lg w-full p-6 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                {selectedNotice.type} • {selectedNotice.department}
              </span>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-bold text-gray-900">{selectedNotice.title}</h3>
              <p className="text-xs text-gray-500 mt-1">Posted: {selectedNotice.postedAt}</p>
              <p className="text-sm text-gray-700 mt-3 leading-relaxed bg-gray-50 p-4 rounded border border-gray-200">
                {selectedNotice.body}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#A31736] hover:bg-[#801028] text-white rounded cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default OverviewPage
