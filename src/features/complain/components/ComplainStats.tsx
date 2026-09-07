import React from 'react'

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-amber-700">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-emerald-700">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const XCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-red-700">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const ClipboardCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-purple-700">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M9 14l2 2 4-4" />
  </svg>
)

interface ComplainStatsProps {
  stats: {
    pending: number
    approved: number
    rejected: number
    completed: number
  }
}

const ComplainStats: React.FC<ComplainStatsProps> = ({ stats }) => {
  const cards = [
    {
      id: 'pending',
      label: 'Pending Inquiries',
      value: stats.pending,
      icon: <ClockIcon />,
      iconBg: 'bg-amber-50',
      valColor: 'text-amber-700',
      badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
      badgeText: 'Needs Action',
      barColor: 'bg-amber-600',
      barWidth: '75%',
    },
    {
      id: 'approved',
      label: 'Approved & Assigned',
      value: stats.approved,
      icon: <CheckCircleIcon />,
      iconBg: 'bg-emerald-50',
      valColor: 'text-emerald-700',
      badgeColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      badgeText: 'In Progress',
      barColor: 'bg-emerald-600',
      barWidth: '60%',
    },
    {
      id: 'completed',
      label: 'Resolved Grievances',
      value: stats.completed,
      icon: <ClipboardCheckIcon />,
      iconBg: 'bg-purple-50',
      valColor: 'text-purple-700',
      badgeColor: 'text-purple-800 bg-purple-50 border-purple-200',
      badgeText: 'Fulfilled',
      barColor: 'bg-purple-600',
      barWidth: '90%',
    },
    {
      id: 'rejected',
      label: 'Declined / Disputed',
      value: stats.rejected,
      icon: <XCircleIcon />,
      iconBg: 'bg-red-50',
      valColor: 'text-red-700',
      badgeColor: 'text-red-800 bg-red-50 border-red-200',
      badgeText: 'Closed',
      barColor: 'bg-red-600',
      barWidth: '25%',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              {card.label}
            </span>
            <div className={`p-1.5 rounded ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${card.valColor}`}>
              {card.value.toString().padStart(2, '0')}
            </p>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${card.badgeColor}`}>
              {card.badgeText}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-3 overflow-hidden">
            <div className={`${card.barColor} h-1.5 rounded-sm transition-all duration-1000`} style={{ width: card.barWidth }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default ComplainStats

