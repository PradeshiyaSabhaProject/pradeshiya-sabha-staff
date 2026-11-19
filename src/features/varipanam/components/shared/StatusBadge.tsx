import React from 'react'
import type { PropertyPaymentStatus } from '../../types/varipanam'

interface StatusBadgeProps {
  status: PropertyPaymentStatus
  size?: 'sm' | 'md'
  showDot?: boolean
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', showDot = true }) => {
  const getStyles = () => {
    switch (status) {
      case 'Paid':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        }
      case 'Due soon':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        }
      case 'Overdue':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        }
      case 'Warrant issued':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-600 animate-pulse',
        }
      default:
        return {
          bg: 'bg-gray-100 text-gray-700 border-gray-200',
          dot: 'bg-gray-400',
        }
    }
  }

  const styles = getStyles()
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded border whitespace-nowrap ${styles.bg} ${sizeClasses}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />}
      <span>{status}</span>
    </span>
  )
}

export default StatusBadge
