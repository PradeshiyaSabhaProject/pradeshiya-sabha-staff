import React from 'react'
import { useDashboardData } from './hooks/useDashboardData'

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Icons
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <polyline points="9 14 11 16 15 12" />
  </svg>
)

const GaugeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const SmileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
)

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1e3a8a]">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const TrendUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-[#c2410c] shrink-0">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-[#ea580c] shrink-0">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const SummaryReportIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const FinancialReportIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Priority Badges
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PRIORITY_BADGES: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700',
  HIGH:   'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-orange-100 text-orange-800',
  LOW:    'bg-gray-200 text-gray-700',
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Component
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const OverviewPage: React.FC = () => {
  const { loading, kpiStats, taskInbox, departmentHealth, quickReports } = useDashboardData()

  const skeleton = (h = 'h-28') => (
    <div className={`${h} bg-gray-100 rounded-2xl animate-pulse`} />
  )

  const renderKpiIcon = (iconType: string) => {
    switch (iconType) {
      case 'clipboard': return <ClipboardIcon />
      case 'gauge':     return <GaugeIcon />
      case 'smile':     return <SmileIcon />
      case 'users':     return <UsersIcon />
      default:          return <ClipboardIcon />
    }
  }

  const renderSubtext = (stat: { icon: string; subText: string }) => {
    if (stat.icon === 'clipboard') {
      return (
        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#c2410c]">
          <TrendUpIcon />
          <span>{stat.subText}</span>
        </div>
      )
    }
    if (stat.icon === 'gauge') {
      return (
        <div className="mt-2 flex items-center gap-1 text-xs font-medium text-[#ea580c]">
          <TargetIcon />
          <span>{stat.subText}</span>
        </div>
      )
    }
    if (stat.icon === 'users') {
      return (
        <div className="mt-2 text-xs font-medium text-[#1d4ed8]">
          <span>{stat.subText}</span>
        </div>
      )
    }
    return (
      <div className="mt-2 text-xs font-medium text-gray-500">
        <span>{stat.subText}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">

      {/* â”€â”€ 1. Top KPI Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [1, 2, 3, 4].map(i => <div key={i}>{skeleton('h-32')}</div>)
          : kpiStats.map(stat => (
            <div
              key={stat.id}
              className="bg-white border border-gray-300 rounded p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600">{stat.label}</span>
                <div className="p-1.5 bg-blue-50/60 rounded">
                  {renderKpiIcon(stat.icon)}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
              </div>
              {renderSubtext(stat)}
            </div>
          ))
        }
      </div>

      {/* â”€â”€ 2. Two Column Layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Box: Centralized Task Inbox (takes 2 columns) */}
        <div className="lg:col-span-2 bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Centralized Task Inbox</h2>
            <div className="flex items-center gap-2">
              <button className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-1.5 rounded border border-gray-300 transition-colors uppercase tracking-wider cursor-pointer">
                Filter
              </button>
              <button className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-4 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer">
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-6">REF ID</th>
                  <th className="py-3 px-6">DEPARTMENT</th>
                  <th className="py-3 px-6">TASK SUBJECT</th>
                  <th className="py-3 px-6">PRIORITY</th>
                  <th className="py-3 px-6 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {loading ? (
                  [1, 2, 3, 4, 5, 6].map(i => (
                    <tr key={i}>
                      <td colSpan={5} className="py-4 px-6">{skeleton('h-8')}</td>
                    </tr>
                  ))
                ) : (
                  taskInbox?.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-3.5 px-6 font-mono text-xs font-semibold text-gray-600 whitespace-nowrap">{item.refId}</td>
                      <td className="py-3.5 px-6 font-bold text-gray-900 whitespace-nowrap">{item.department}</td>
                      <td className="py-3.5 px-6 text-gray-800 max-w-sm">{item.subject}</td>
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wide inline-block border ${PRIORITY_BADGES[item.priority]}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <button className="border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-all text-xs font-semibold px-4 py-1 rounded bg-white shadow-xs cursor-pointer uppercase tracking-wider">
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Departmental Health + Quick Reports */}
        <div className="lg:col-span-1 flex flex-col gap-6">

          {/* Departmental Health Card */}
          <div className="bg-white border border-gray-300 rounded p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wide">Departmental Health</h2>
              <div className="space-y-5">
                {loading ? (
                  [1, 2, 3].map(i => <div key={i}>{skeleton('h-10')}</div>)
                ) : (
                  departmentHealth?.map(dept => (
                    <div key={dept.id}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-semibold text-gray-800">{dept.department}</span>
                        <span className={`text-sm font-bold ${dept.textColor}`}>{dept.loadPercent}% Load</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-sm h-2 overflow-hidden">
                        <div
                          className={`${dept.barColor} h-2 rounded-sm transition-all duration-1000`}
                          style={{ width: `${dept.loadPercent}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-200 text-center">
              <a
                href="#analytics"
                className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] hover:text-blue-800 inline-flex items-center gap-1.5 transition-colors"
              >
                View Full Analytics <span className="text-base leading-none">â†’</span>
              </a>
            </div>
          </div>

          {/* Quick Reports Card */}
          <div className="bg-white border border-gray-300 rounded p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">Quick Reports</h2>
            <div className="space-y-3">
              {loading ? (
                [1, 2].map(i => <div key={i}>{skeleton('h-16')}</div>)
              ) : (
                quickReports?.map(report => (
                  <div
                    key={report.id}
                    className="border border-gray-300 rounded p-4 flex items-center gap-4 hover:border-[#A31736] hover:bg-gray-50 transition-all cursor-pointer group"
                  >
                    <div className="bg-[#A31736] text-white w-10 h-10 rounded flex items-center justify-center shrink-0 shadow-sm">
                      {report.icon === 'summary' ? <SummaryReportIcon /> : <FinancialReportIcon />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-[#A31736] transition-colors truncate">
                        {report.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{report.subtitle}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fleet Management Quick Access Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-slate-700 rounded p-6 shadow-md text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-400/30">
                  New Module
                </span>
                <span className="text-xs text-slate-400">Pradeshiya Sabha Fleet</span>
              </div>
              <h3 className="text-lg font-bold text-white">Fleet Management System</h3>
              <p className="text-xs text-slate-300 mt-1">
                Maintain municipal vehicles, assign drivers, monitor live ward dispatches, put vehicles into workshop maintenance, and track route permits.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-300">Council Transport</span>
              <a
                href="/fleet/overview"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded transition-all shadow-sm"
              >
                Open Fleet Dashboard â†’
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

export default OverviewPage

