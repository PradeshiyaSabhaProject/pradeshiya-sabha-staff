import React, { useState, useMemo } from 'react'
import { useWriteLetterData, type SentLetter } from '../hooks/useWriteLetterData'
import WriteLetterModal from '../components/WriteLetterModal'
import LetterDocumentModal from '../components/LetterDocumentModal'

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500 group-hover:text-[#801028]">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500 group-hover:text-[#801028]">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-500 shrink-0">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-green-500 shrink-0">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-amber-500 shrink-0">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const ClipboardCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-purple-500 shrink-0">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M9 14l2 2 4-4" />
  </svg>
)

const WriteLetterPage: React.FC = () => {
  const { loading, sentLetters, departments, addSentLetter, stats } = useWriteLetterData()
  
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false)
  const [selectedDocLetter, setSelectedDocLetter] = useState<SentLetter | null>(null)
  
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLetters = useMemo(() => {
    return sentLetters.filter(letter => {
      if (deptFilter && letter.department !== deptFilter) return false
      if (statusFilter && letter.status !== statusFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchRef = letter.refNo.toLowerCase().includes(query)
        const matchSub = letter.subject.toLowerCase().includes(query)
        const matchOfficer = letter.recipientOfficer.toLowerCase().includes(query)
        if (!matchRef && !matchSub && !matchOfficer) return false
      }
      return true
    })
  }, [sentLetters, deptFilter, statusFilter, searchQuery])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200'
      case 'IN REVIEW': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'APPROVED': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleCreateLetter = (newLetterData: Omit<SentLetter, 'id' | 'refNo' | 'dateTime' | 'senderName' | 'senderId' | 'status'>) => {
    const created = addSentLetter(newLetterData)
    // Optionally open the doc preview immediately for gratification
    setSelectedDocLetter(created)
  }

  const totalSent = stats.totalSent || 1

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header section with Write Letter Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Write Letter &amp; Sent Correspondence
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Create, view, and download formal letters dispatched by your officer desk to municipal departments.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setIsWriteModalOpen(true)}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusIcon />
            <span>Write a Letter</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            id: 'sent',
            label: 'Total Sent Letters',
            value: stats.totalSent,
            icon: <MailIcon />,
            colorClass: 'text-blue-800 bg-blue-50 border-blue-200',
            iconBoxClass: 'bg-blue-50 text-blue-700 border border-blue-100',
            progressClass: 'bg-blue-600',
            percentage: 100,
            desc: 'All recorded letters'
          },
          {
            id: 'delivered',
            label: 'Delivered Letters',
            value: stats.delivered,
            icon: <CheckCircleIcon />,
            colorClass: 'text-green-800 bg-green-50 border-green-200',
            iconBoxClass: 'bg-green-50 text-green-700 border border-green-100',
            progressClass: 'bg-green-600',
            percentage: Math.round((stats.delivered / totalSent) * 100),
            desc: 'Received by officer'
          },
          {
            id: 'inReview',
            label: 'In Review Queue',
            value: stats.inReview,
            icon: <ClockIcon />,
            colorClass: 'text-amber-800 bg-amber-50 border-amber-200',
            iconBoxClass: 'bg-amber-50 text-amber-700 border border-amber-100',
            progressClass: 'bg-amber-500',
            percentage: Math.round((stats.inReview / totalSent) * 100),
            desc: 'Awaiting assessment'
          },
          {
            id: 'approved',
            label: 'Action Approved',
            value: stats.approved,
            icon: <ClipboardCheckIcon />,
            colorClass: 'text-purple-800 bg-purple-50 border-purple-200',
            iconBoxClass: 'bg-purple-50 text-purple-700 border border-purple-100',
            progressClass: 'bg-purple-600',
            percentage: Math.round((stats.approved / totalSent) * 100),
            desc: 'Formally cleared'
          }
        ].map((card) => (
          <div
            key={card.id}
            className="bg-white border border-gray-300 rounded p-4 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1 font-mono tracking-tight">
                  {card.value.toString().padStart(2, '0')}
                </p>
              </div>
              <div className={`p-2 rounded ${card.iconBoxClass}`}>
                {card.icon}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[11px] text-gray-500 font-medium">{card.desc}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${card.colorClass}`}>
                  {card.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${card.progressClass}`}
                  style={{ width: `${card.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-gray-300 rounded p-3 sm:p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-gray-50/40">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 flex-1">
          {/* Department Filter */}
          <div className="relative w-full sm:w-auto min-w-[170px] h-9">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full h-full appearance-none bg-white border border-gray-300 rounded px-3 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#A31736] pr-8 cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-2.5 pointer-events-none">
              <ChevronDownIcon />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-auto min-w-[140px] h-9">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-full appearance-none bg-white border border-gray-300 rounded px-3 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#A31736] pr-8 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="SENT">SENT</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="IN REVIEW">IN REVIEW</option>
              <option value="APPROVED">APPROVED</option>
            </select>
            <div className="absolute right-3 top-2.5 pointer-events-none">
              <ChevronDownIcon />
            </div>
          </div>

          {(deptFilter || statusFilter || searchQuery) && (
            <button
              type="button"
              onClick={() => { setDeptFilter(''); setStatusFilter(''); setSearchQuery(''); }}
              className="text-xs font-bold text-gray-600 hover:text-[#A31736] px-3 h-9 rounded hover:bg-gray-100 transition-colors cursor-pointer uppercase tracking-wider text-left sm:text-center flex items-center"
            >
              Reset
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72 h-9">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ref no, subject, officer..."
            className="w-full h-full bg-white border border-gray-300 rounded px-3 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#A31736] transition-all"
          />
        </div>
      </div>

      {/* Sent Letters Table */}
      {loading ? (
        <div className="h-96 bg-gray-100 rounded animate-pulse" />
      ) : (
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch] flex-1">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-6">REFERENCE NO</th>
                  <th className="py-3 px-6">SENT DATE &amp; TIME</th>
                  <th className="py-3 px-6">TO DEPARTMENT</th>
                  <th className="py-3 px-6">RECIPIENT OFFICER</th>
                  <th className="py-3 px-6">SUBJECT</th>
                  <th className="py-3 px-6">STATUS</th>
                  <th className="py-3 px-6 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredLetters.map((letter) => (
                  <tr key={letter.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-[#A31736] font-mono whitespace-nowrap">{letter.refNo}</td>
                    <td className="py-3.5 px-6 whitespace-nowrap text-xs font-semibold text-gray-700">{letter.dateTime}</td>
                    <td className="py-3.5 px-6 font-bold text-gray-900 whitespace-nowrap">{letter.department}</td>
                    <td className="py-3.5 px-6 font-semibold text-gray-700 whitespace-nowrap">{letter.recipientOfficer}</td>
                    <td className="py-3.5 px-6 font-medium text-gray-800 max-w-xs truncate" title={letter.subject}>
                      {letter.subject}
                    </td>
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border inline-block ${getStatusStyle(letter.status)}`}>
                        {letter.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDocLetter(letter)}
                          className="p-1.5 border border-gray-300 bg-white rounded hover:bg-gray-100 text-gray-600 hover:text-[#A31736] transition-colors group cursor-pointer shadow-2xs"
                          title="View letter document format"
                        >
                          <EyeIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDocLetter(letter)}
                          className="p-1.5 border border-gray-300 bg-white rounded hover:bg-gray-100 text-gray-600 hover:text-[#A31736] transition-colors group cursor-pointer shadow-2xs"
                          title="Download / Print official letter"
                        >
                          <DownloadIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLetters.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500 font-medium">
                      No sent letters match your criteria. Click <strong>+ Write a Letter</strong> to compose one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 font-semibold text-center sm:text-left">
            <span>Showing {filteredLetters.length} of {sentLetters.length} sent letters</span>
            <span>✓ All correspondence auto-logged with sender ID: EMP-2026-042</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <WriteLetterModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        departments={departments}
        onSubmit={handleCreateLetter}
      />

      <LetterDocumentModal
        letter={selectedDocLetter}
        onClose={() => setSelectedDocLetter(null)}
      />

    </div>
  )
}

export default WriteLetterPage


