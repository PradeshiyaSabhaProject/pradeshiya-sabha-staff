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
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
        }
      case 'Due soon':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
        }
      case 'Overdue':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
        }
      case 'Warrant issued':
        return {
          bg: 'bg-purple-50 text-purple-900 border-purple-300 font-bold',
          dot: 'bg-purple-600 animate-pulse',
        }
      default:
        return {
          bg: 'bg-gray-50 text-gray-700 border-gray-300',
          dot: 'bg-gray-400',
        }
    }
  }

  const styles = getStyles()
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border whitespace-nowrap ${styles.bg} ${sizeClasses}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />}
      <span>{status}</span>
    </span>
  )
}

export default StatusBadge
