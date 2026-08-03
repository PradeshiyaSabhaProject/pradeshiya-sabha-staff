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

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header section with Write Letter Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded border border-gray-300 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[#801028] inline-block"></span>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Write Letter &amp; Sent Correspondence</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Create, view, and download formal letters sent by your user account to municipal departments &amp; officers.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setIsWriteModalOpen(true)}
            className="w-full sm:w-auto bg-[#801028] hover:bg-[#600a1c] text-white text-xs font-semibold px-5 py-2.5 rounded shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
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
            colorClass: 'text-blue-500',
            borderClass: 'border-blue-300',
            bgClass: 'bg-blue-50/30'
          },
          {
            id: 'delivered',
            label: 'Delivered',
            value: stats.delivered,
            icon: <CheckCircleIcon />,
            colorClass: 'text-green-500',
            borderClass: 'border-green-300',
            bgClass: 'bg-green-50/30'
          },
          {
            id: 'inReview',
            label: 'In Review',
            value: stats.inReview,
            icon: <ClockIcon />,
            colorClass: 'text-amber-500',
            borderClass: 'border-amber-300',
            bgClass: 'bg-amber-50/30'
          },
          {
            id: 'approved',
            label: 'Approved',
            value: stats.approved,
            icon: <ClipboardCheckIcon />,
            colorClass: 'text-purple-500',
            borderClass: 'border-purple-300',
            bgClass: 'bg-purple-50/30'
          }
        ].map((card) => (
          <div
            key={card.id}
            className={`flex flex-col items-center justify-center p-5 bg-white border rounded shadow-sm hover:shadow transition-shadow ${card.borderClass}`}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <div className={`p-1.5 rounded ${card.bgClass}`}>
                {card.icon}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${card.colorClass}`}>{card.label}</span>
            </div>
            <p className={`text-3xl font-extrabold ${card.colorClass}`}>
              {card.value.toString().padStart(2, '0')}
            </p>
          </div>
        ))}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 flex-1">
          {/* Department Filter */}
          <div className="relative w-full sm:w-auto min-w-[180px]">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-300 rounded px-3.5 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#801028] pr-8 cursor-pointer"
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
          <div className="relative w-full sm:w-auto min-w-[150px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-300 rounded px-3.5 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#801028] pr-8 cursor-pointer"
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
              className="text-xs font-bold text-gray-500 hover:text-[#801028] px-2 py-1 transition-colors cursor-pointer uppercase tracking-wider text-left sm:text-center"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ref no, subject, officer..."
            className="w-full bg-gray-50 border border-gray-300 rounded px-3.5 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#801028] transition-all"
          />
        </div>
      </div>

      {/* Sent Letters Table */}
      {loading ? (
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
      ) : (
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch] flex-1">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50">
                  <th className="py-3.5 px-6">REFERENCE NO</th>
                  <th className="py-3.5 px-6">SENT DATE &amp; TIME</th>
                  <th className="py-3.5 px-6">TO DEPARTMENT</th>
                  <th className="py-3.5 px-6">RECIPIENT OFFICER</th>
                  <th className="py-3.5 px-6">SUBJECT</th>
                  <th className="py-3.5 px-6">STATUS</th>
                  <th className="py-3.5 px-6 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredLetters.map((letter) => (
                  <tr key={letter.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-[#801028] font-mono whitespace-nowrap">{letter.refNo}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-xs font-semibold text-gray-600">{letter.dateTime}</td>
                    <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">{letter.department}</td>
                    <td className="py-4 px-6 font-semibold text-gray-700 whitespace-nowrap">{letter.recipientOfficer}</td>
                    <td className="py-4 px-6 font-medium text-gray-800 max-w-xs truncate" title={letter.subject}>
                      {letter.subject}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase border inline-block ${getStatusStyle(letter.status)}`}>
                        {letter.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDocLetter(letter)}
                          className="p-1.5 border border-gray-300 bg-white rounded hover:bg-gray-100 transition-colors group cursor-pointer shadow-xs"
                          title="View letter document format"
                        >
                          <EyeIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDocLetter(letter)}
                          className="p-1.5 border border-[#801028]/20 bg-white rounded hover:bg-[#801028]/10 text-[#801028] transition-colors group cursor-pointer shadow-xs"
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
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No sent letters match your criteria. Click <strong>+ Write a Letter</strong> to compose one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 font-semibold text-center sm:text-left">
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

