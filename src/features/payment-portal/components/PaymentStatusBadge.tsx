import React from 'react'
import type { PaymentStatus } from '../types/paymentPortal'

interface PaymentStatusBadgeProps {
  status: PaymentStatus
  size?: 'sm' | 'md'
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const isPaid = status === 'Paid'
  const sizeClasses = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border ${sizeClasses} ${
        isPaid
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isPaid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
        }`}
      />
      <span>{status}</span>
    </span>
  )
}

export default PaymentStatusBadge
