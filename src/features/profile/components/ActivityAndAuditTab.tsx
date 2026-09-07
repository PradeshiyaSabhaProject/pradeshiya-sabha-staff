import React, { useState } from 'react'
import type { ActivityLogItem } from '../types'

interface ActivityAndAuditTabProps {
  logs: ActivityLogItem[]
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const FileTextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#A31736]">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const getModuleBadgeStyle = (moduleName: string): string => {
  switch (moduleName) {
    case 'Letters':
      return 'bg-blue-50 text-blue-700 border border-blue-200'
    case 'Attendance':
      return 'bg-purple-50 text-purple-700 border border-purple-200'
    case 'Appointments':
      return 'bg-orange-50 text-orange-700 border border-orange-200'
    case 'Security':
      return 'bg-red-50 text-red-700 border border-red-200'
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-300'
  }
}

const getStatusDotStyle = (status: string): string => {
  switch (status) {
    case 'Success':
      return 'bg-emerald-500'
    case 'Warning':
      return 'bg-amber-500'
    default:
      return 'bg-blue-500'
  }
}

export const ActivityAndAuditTab: React.FC<ActivityAndAuditTabProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModule, setSelectedModule] = useState<string>('All')

  const filteredLogs = logs.filter((item) => {
    const matchesSearch =
      item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ip.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesModule = selectedModule === 'All' || item.module === selectedModule
    return matchesSearch && matchesModule
  })

  const modules = ['All', 'Letters', 'Attendance', 'Appointments', 'Security']

  let content

  if (filteredLogs.length === 0) {
    content = (
      <div className="text-center py-10 text-gray-400 text-xs">
        <p className="font-semibold text-gray-600">No activity records match your current filter criteria.</p>
      </div>
    )
  } else {
    content = (
      <div className="relative pl-5 sm:pl-7 border-l-2 border-gray-200 space-y-4 my-1">
        {filteredLogs.map((log) => (
          <div key={log.id} className="relative group">
            {/* Timeline Dot */}
            <div
              className={`absolute -left-[27px] sm:-left-[35px] top-2 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${getStatusDotStyle(
                log.status
              )}`}
            />

            <div className="bg-gray-50/70 group-hover:bg-gray-100/90 border border-gray-200 rounded p-3.5 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getModuleBadgeStyle(
                      log.module
                    )}`}
                  >
                    {log.module}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900">{log.action}</h4>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-gray-500 shrink-0">
                  <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                    {log.ip}
                  </span>
                  <span className="font-semibold text-[11px] text-gray-600">{log.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">{log.details}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Controls: Search and Filter Pills */}
      <div className="bg-gray-50/30 border border-gray-300 rounded p-3.5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <div className="relative flex items-center border border-gray-300 rounded bg-white h-9 hover:border-gray-400 focus-within:border-[#A31736] transition-colors">
            <div className="absolute left-3">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search activity, IP address, action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs text-gray-700 bg-transparent py-1.5 pl-9 pr-4 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {modules.map((mod) => {
            const isSelected = selectedModule === mod
            const filterBtnStyle = isSelected
              ? 'bg-[#A31736] text-white shadow-xs'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
            return (
              <button
                key={mod}
                type="button"
                onClick={() => setSelectedModule(mod)}
                className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${filterBtnStyle}`}
              >
                {mod}
              </button>
            )
          })}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white border border-gray-300 rounded p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#A31736]/10">
              <FileTextIcon />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base uppercase tracking-tight">Personal Administrative Audit Trail</h3>
              <p className="text-xs text-gray-500">Immutable log of credentials usage across Homagama Pradeshiya Sabha portal</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded text-gray-700 border border-gray-200">
            {filteredLogs.length} / {logs.length} entries
          </span>
        </div>

        {content}
      </div>
    </div>
  )
}
export default ActivityAndAuditTab
