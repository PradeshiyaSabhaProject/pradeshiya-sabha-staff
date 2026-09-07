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

const CalendarCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[#801028] shrink-0">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M9 16l2 2 4-4" />
  </svg>
)

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-indigo-500 shrink-0">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const BanknoteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-emerald-600 shrink-0">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
)

interface BookingStatsProps {
  stats: {
    pending: number
    approved: number
    rejected: number
    completed: number
    total: number
    totalRevenue: number
  }
}

const BookingStats: React.FC<BookingStatsProps> = ({ stats }) => {
  const cards = [
    {
      id: 'total',
      label: 'Total Bookings',
      value: stats.total.toString().padStart(2, '0'),
      icon: <CalendarCheckIcon />,
      iconBg: 'bg-gray-100 text-gray-700',
      progressColor: 'bg-gray-700',
      percentage: '100%'
    },
    {
      id: 'pending',
      label: 'Pending Intake',
      value: stats.pending.toString().padStart(2, '0'),
      icon: <ClockIcon />,
      iconBg: 'bg-orange-50 text-orange-600',
      progressColor: 'bg-orange-500',
      percentage: `${stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%`
    },
    {
      id: 'approved',
      label: 'Approved & Reserved',
      value: stats.approved.toString().padStart(2, '0'),
      icon: <CheckCircleIcon />,
      iconBg: 'bg-emerald-50 text-emerald-600',
      progressColor: 'bg-emerald-600',
      percentage: `${stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%`
    },
    {
      id: 'rejected',
      label: 'Rejected / Cancelled',
      value: stats.rejected.toString().padStart(2, '0'),
      icon: <XCircleIcon />,
      iconBg: 'bg-red-50 text-red-600',
      progressColor: 'bg-red-600',
      percentage: `${stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%`
    },
    {
      id: 'completed',
      label: 'Completed Events',
      value: stats.completed.toString().padStart(2, '0'),
      icon: <TrophyIcon />,
      iconBg: 'bg-indigo-50 text-indigo-600',
      progressColor: 'bg-indigo-600',
      percentage: `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%`
    },
    {
      id: 'revenue',
      label: 'Rental Revenue',
      value: `Rs. ${(stats.totalRevenue / 1000).toFixed(0)}k`,
      icon: <BanknoteIcon />,
      iconBg: 'bg-emerald-50 text-emerald-700',
      progressColor: 'bg-emerald-700',
      percentage: 'Rs. ' + stats.totalRevenue.toLocaleString()
    }
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white p-4 sm:p-5 rounded border border-gray-300 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">
              {card.label}
            </span>
            <div className={`p-2 rounded shrink-0 ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {card.value}
              </span>
              <span className="text-[10px] font-semibold text-gray-400">
                {card.percentage}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full ${card.progressColor}`}
                style={{ width: card.percentage.includes('%') ? card.percentage : '100%' }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default BookingStats
