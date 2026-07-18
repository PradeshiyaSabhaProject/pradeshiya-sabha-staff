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
      colorClass: 'text-gray-700',
      borderClass: 'border-gray-300',
      bgClass: 'bg-gray-100'
    },
    {
      id: 'pending',
      label: 'Pending Intake',
      value: stats.pending.toString().padStart(2, '0'),
      icon: <ClockIcon />,
      colorClass: 'text-orange-500',
      borderClass: 'border-orange-300',
      bgClass: 'bg-orange-50/30'
    },
    {
      id: 'approved',
      label: 'Approved & Reserved',
      value: stats.approved.toString().padStart(2, '0'),
      icon: <CheckCircleIcon />,
      colorClass: 'text-green-500',
      borderClass: 'border-green-300',
      bgClass: 'bg-green-50/30'
    },
    {
      id: 'rejected',
      label: 'Rejected / Cancelled',
      value: stats.rejected.toString().padStart(2, '0'),
      icon: <XCircleIcon />,
      colorClass: 'text-red-500',
      borderClass: 'border-red-300',
      bgClass: 'bg-red-50/30'
    },
    {
      id: 'completed',
      label: 'Completed Events',
      value: stats.completed.toString().padStart(2, '0'),
      icon: <TrophyIcon />,
      colorClass: 'text-indigo-500',
      borderClass: 'border-indigo-300',
      bgClass: 'bg-indigo-50/30'
    },
    {
      id: 'revenue',
      label: 'Rental Revenue',
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      icon: <BanknoteIcon />,
      colorClass: 'text-emerald-600',
      borderClass: 'border-emerald-300',
      bgClass: 'bg-emerald-50/30'
    }
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`flex flex-col items-center justify-center p-4 sm:p-5 bg-white border rounded shadow-sm hover:shadow transition-shadow ${card.borderClass}`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
            <div className={`p-1.5 rounded ${card.bgClass}`}>
              {card.icon}
            </div>
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center ${card.colorClass}`}>
              {card.label}
            </span>
          </div>
          <p className={`text-2xl sm:text-3xl font-extrabold ${card.colorClass}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}

export default BookingStats
