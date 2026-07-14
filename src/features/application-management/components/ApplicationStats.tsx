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

const EyeCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-amber-500 shrink-0">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
  </svg>
)

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-indigo-500 shrink-0">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

interface ApplicationStatsProps {
  stats: {
    pending: number
    reviewing: number
    inspection: number
    approved: number
    rejected: number
    returned: number
    total: number
  }
}

const ApplicationStats: React.FC<ApplicationStatsProps> = ({ stats }) => {
  const cards = [
    {
      id: 'total',
      label: 'Total Applications',
      value: stats.total,
      icon: <ClipboardCheckIcon />,
      colorClass: 'text-gray-700',
      borderClass: 'border-gray-300',
      bgClass: 'bg-gray-100'
    },
    {
      id: 'pending',
      label: 'Pending Intake',
      value: stats.pending,
      icon: <ClockIcon />,
      colorClass: 'text-orange-500',
      borderClass: 'border-orange-300',
      bgClass: 'bg-orange-50/30'
    },
    {
      id: 'reviewing',
      label: 'Under Review',
      value: stats.reviewing,
      icon: <EyeCircleIcon />,
      colorClass: 'text-amber-500',
      borderClass: 'border-amber-300',
      bgClass: 'bg-amber-50/30'
    },
    {
      id: 'inspection',
      label: 'Field Inspection',
      value: stats.inspection,
      icon: <MapPinIcon />,
      colorClass: 'text-indigo-500',
      borderClass: 'border-indigo-300',
      bgClass: 'bg-indigo-50/30'
    },
    {
      id: 'approved',
      label: 'Approved & Issued',
      value: stats.approved,
      icon: <CheckCircleIcon />,
      colorClass: 'text-green-500',
      borderClass: 'border-green-300',
      bgClass: 'bg-green-50/30'
    },
    {
      id: 'rejected',
      label: 'Returned / Rejected',
      value: stats.rejected + stats.returned,
      icon: <XCircleIcon />,
      colorClass: 'text-red-500',
      borderClass: 'border-red-300',
      bgClass: 'bg-red-50/30'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
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
  )
}

export default ApplicationStats
