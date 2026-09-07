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

const EyeCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
  </svg>
)

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
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
  const total = stats.total || 1

  const cards = [
    {
      id: 'total',
      label: 'Total Dossier',
      value: stats.total,
      icon: <ClipboardCheckIcon />,
      colorClass: 'text-gray-800 bg-gray-50 border-gray-200',
      iconBoxClass: 'bg-gray-100 text-gray-700 border border-gray-200',
      progressClass: 'bg-gray-600',
      percentage: 100,
      desc: 'All statutory forms'
    },
    {
      id: 'pending',
      label: 'Pending Intake',
      value: stats.pending,
      icon: <ClockIcon />,
      colorClass: 'text-amber-800 bg-amber-50 border-amber-200',
      iconBoxClass: 'bg-amber-50 text-amber-700 border border-amber-100',
      progressClass: 'bg-amber-500',
      percentage: Math.round((stats.pending / total) * 100),
      desc: 'Awaiting desk check'
    },
    {
      id: 'reviewing',
      label: 'Under Assessment',
      value: stats.reviewing,
      icon: <EyeCircleIcon />,
      colorClass: 'text-blue-800 bg-blue-50 border-blue-200',
      iconBoxClass: 'bg-blue-50 text-blue-700 border border-blue-100',
      progressClass: 'bg-blue-600',
      percentage: Math.round((stats.reviewing / total) * 100),
      desc: 'Officer evaluation'
    },
    {
      id: 'inspection',
      label: 'Field Inspection',
      value: stats.inspection,
      icon: <MapPinIcon />,
      colorClass: 'text-indigo-800 bg-indigo-50 border-indigo-200',
      iconBoxClass: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
      progressClass: 'bg-indigo-600',
      percentage: Math.round((stats.inspection / total) * 100),
      desc: 'On-site technical check'
    },
    {
      id: 'approved',
      label: 'Approved & Issued',
      value: stats.approved,
      icon: <CheckCircleIcon />,
      colorClass: 'text-green-800 bg-green-50 border-green-200',
      iconBoxClass: 'bg-green-50 text-green-700 border border-green-100',
      progressClass: 'bg-green-600',
      percentage: Math.round((stats.approved / total) * 100),
      desc: 'Permits authorized'
    },
    {
      id: 'rejected',
      label: 'Returned / Rejected',
      value: stats.rejected + stats.returned,
      icon: <XCircleIcon />,
      colorClass: 'text-red-800 bg-red-50 border-red-200',
      iconBoxClass: 'bg-red-50 text-red-700 border border-red-100',
      progressClass: 'bg-red-500',
      percentage: Math.round(((stats.rejected + stats.returned) / total) * 100),
      desc: 'Non-compliant forms'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
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
              <span className="text-[10px] text-gray-500 font-medium truncate">{card.desc}</span>
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

export default ApplicationStats

