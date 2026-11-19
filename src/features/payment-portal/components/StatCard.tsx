import React from 'react'

interface StatCardProps {
  label: string
  value: string
  subValue?: string
  trendBadge?: string
  icon: React.ReactNode
  iconBgColor?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  trendBadge,
  icon,
  iconBgColor = 'bg-rose-50 text-[#A31736] border-rose-100',
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-[#A31736] transition-all flex flex-col justify-between group">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 truncate">
          {label}
        </span>
        <div className={`p-2 rounded-xl shrink-0 border transition-transform group-hover:scale-105 ${iconBgColor}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight truncate">
            {value}
          </p>
          {trendBadge && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
              {trendBadge}
            </span>
          )}
        </div>
        {subValue && (
          <p className="text-xs text-gray-500 font-medium mt-1 truncate">
            {subValue}
          </p>
        )}
      </div>
    </div>
  )
}

export default StatCard
