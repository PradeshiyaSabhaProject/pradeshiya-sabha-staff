import React from 'react'

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const XCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const ClipboardCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M9 14l2 2 4-4" />
  </svg>
)

interface LetterStatsProps {
  stats: {
    pending: number
    approved: number
    rejected: number
    completed: number
  }
}

const LetterStats: React.FC<LetterStatsProps> = ({ stats }) => {
  const total = stats.pending + stats.approved + stats.rejected + stats.completed || 1

  const cards = [
    {
      id: 'pending',
      label: 'Pending Inquiries',
      value: stats.pending,
      icon: <ClockIcon />,
      colorClass: 'text-amber-800 bg-amber-50 border-amber-200',
      iconBoxClass: 'bg-amber-50 text-amber-700 border border-amber-100',
      progressClass: 'bg-amber-500',
      percentage: Math.round((stats.pending / total) * 100),
      desc: 'In review queue'
    },
    {
      id: 'approved',
      label: 'Approved & Active',
      value: stats.approved,
      icon: <CheckCircleIcon />,
      colorClass: 'text-blue-800 bg-blue-50 border-blue-200',
      iconBoxClass: 'bg-blue-50 text-blue-700 border border-blue-100',
      progressClass: 'bg-blue-600',
      percentage: Math.round((stats.approved / total) * 100),
      desc: 'Action authorized'
    },
    {
      id: 'rejected',
      label: 'Rejected Letters',
      value: stats.rejected,
      icon: <XCircleIcon />,
      colorClass: 'text-red-800 bg-red-50 border-red-200',
      iconBoxClass: 'bg-red-50 text-red-700 border border-red-100',
      progressClass: 'bg-red-500',
      percentage: Math.round((stats.rejected / total) * 100),
      desc: 'Non-compliant'
    },
    {
      id: 'completed',
      label: 'Completed & Resolved',
      value: stats.completed,
      icon: <ClipboardCheckIcon />,
      colorClass: 'text-green-800 bg-green-50 border-green-200',
      iconBoxClass: 'bg-green-50 text-green-700 border border-green-100',
      progressClass: 'bg-green-600',
      percentage: Math.round((stats.completed / total) * 100),
      desc: 'Formally closed'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
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
  )
}

export default LetterStats


