import React from 'react'

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-orange-500 shrink-0">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-green-500 shrink-0">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const XCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-red-500 shrink-0">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const ClipboardCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-purple-500 shrink-0">
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
      label: 'Pending Complaints',
      value: stats.pending,
      icon: <ClockIcon />,
      colorClass: 'text-orange-500',
      borderClass: 'border-orange-300',
      bgClass: 'bg-orange-50/30'
    },
    {
      id: 'approved',
      label: 'Approved Complaints',
      value: stats.approved,
      icon: <CheckCircleIcon />,
      colorClass: 'text-green-500',
      borderClass: 'border-green-300',
      bgClass: 'bg-green-50/30'
    },
    {
      id: 'rejected',
      label: 'Rejected Complaints',
      value: stats.rejected,
      icon: <XCircleIcon />,
      colorClass: 'text-red-500',
      borderClass: 'border-red-300',
      bgClass: 'bg-red-50/30'
    },
    {
      id: 'completed',
      label: 'Completed Complaints',
      value: stats.completed,
      icon: <ClipboardCheckIcon />,
      colorClass: 'text-purple-500',
      borderClass: 'border-purple-300',
      bgClass: 'bg-purple-50/30'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`flex flex-col items-center justify-center p-6 bg-white border-2 rounded-xl shadow-sm hover:shadow-md transition-shadow ${card.borderClass}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-1.5 rounded-full ${card.bgClass}`}>
              {card.icon}
            </div>
            <span className={`text-sm font-semibold ${card.colorClass}`}>{card.label}</span>
          </div>
          <p className={`text-4xl font-extrabold ${card.colorClass}`}>
            {card.value.toString().padStart(2, '0')}
          </p>
        </div>
      ))}
    </div>
  )
}

export default ComplainStats
