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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#801028]">
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
      return 'bg-blue-100 text-blue-800 border border-blue-200'
    case 'Attendance':
      return 'bg-purple-100 text-purple-800 border border-purple-200'
    case 'Appointments':
      return 'bg-orange-100 text-orange-800 border border-orange-200'
    case 'Security':
      return 'bg-red-100 text-red-800 border border-red-200'
    default:
      return 'bg-gray-200 text-gray-800 border border-gray-300'
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Controls: Search and Filter Pills matching standard top bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative flex items-center border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus-within:border-[#801028] transition-colors">
            <div className="absolute left-3">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search activity, IP address, document ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm text-gray-700 bg-transparent py-2 pl-9 pr-4 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {modules.map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedModule === mod
                  ? 'bg-[#801028] text-white shadow-2xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-[#801028]/10">
              <FileTextIcon />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Personal Administrative Audit Trail</h3>
              <p className="text-xs text-gray-500">Immutable log of credentials usage across Homagama Pradeshiya Sabha portal</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-700 border border-gray-200">
            Showing {filteredLogs.length} of {logs.length} entries
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <p className="font-semibold text-gray-600">No activity records match your current filter criteria.</p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 border-l-2 border-gray-200 space-y-6 my-2">
            {filteredLogs.map((log) => (
              <div key={log.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${getStatusDotStyle(
                    log.status
                  )}`}
                />

                <div className="bg-gray-50/80 group-hover:bg-gray-100/90 border border-gray-200 rounded-xl p-4 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${getModuleBadgeStyle(
                          log.module
                        )}`}
                      >
                        {log.module}
                      </span>
                      <h4 className="font-bold text-sm text-gray-900">{log.action}</h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                      <span className="font-mono text-[11px] bg-white px-2.5 py-0.5 rounded border border-gray-200 text-gray-700">
                        {log.ip}
                      </span>
                      <span className="font-semibold text-gray-600">{log.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
export default ActivityAndAuditTab
