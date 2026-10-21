import React from 'react'
import type { InvoiceStatus } from '../data/financeMockData'

interface InvoiceLifecycleBadgeProps {
  status: InvoiceStatus
  showStepper?: boolean
  onStatusChange?: (newStatus: InvoiceStatus) => void
}

export const InvoiceLifecycleBadge: React.FC<InvoiceLifecycleBadgeProps> = ({
  status,
  showStepper = false,
  onStatusChange,
}) => {
  // Normalize legacy status
  const currentStatus: InvoiceStatus = status === 'Pending' ? 'Approved & Issued' : status

  const getBadgeStyle = (st: InvoiceStatus) => {
    switch (st) {
      case 'Draft':
        return 'bg-slate-100 text-slate-800 border-slate-300'
      case 'Approved & Issued':
      case 'Pending':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'Partially Paid':
        return 'bg-amber-50 text-amber-800 border-amber-300'
      case 'Paid':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300'
      case 'Overdue':
        return 'bg-rose-50 text-rose-800 border-rose-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLabel = (st: InvoiceStatus) => {
    if (st === 'Paid') return 'Fully Paid'
    if (st === 'Pending') return 'Approved & Issued'
    return st
  }

  const stages: { key: InvoiceStatus; label: string; desc: string }[] = [
    { key: 'Draft', label: 'Draft', desc: 'Creation & Assessment' },
    { key: 'Approved & Issued', label: 'Approved & Issued', desc: 'Dispatched to Citizen' },
    { key: 'Partially Paid', label: 'Partially Paid', desc: 'Part Settlement' },
    { key: 'Paid', label: 'Fully Paid', desc: '100% Cleared' },
    { key: 'Overdue', label: 'Overdue', desc: 'Past Due Date' },
  ]

  const getStageIndex = (st: InvoiceStatus) => {
    if (st === 'Draft') return 0
    if (st === 'Approved & Issued' || st === 'Pending') return 1
    if (st === 'Partially Paid') return 2
    if (st === 'Paid') return 3
    if (st === 'Overdue') return 4
    return 1
  }

  const currentIndex = getStageIndex(currentStatus)

  return (
    <div className="space-y-3">
      {/* Status Badge */}
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border uppercase tracking-wider ${getBadgeStyle(
          currentStatus
        )}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            currentStatus === 'Paid'
              ? 'bg-emerald-600'
              : currentStatus === 'Overdue'
              ? 'bg-rose-600 animate-pulse'
              : currentStatus === 'Partially Paid'
              ? 'bg-amber-600'
              : currentStatus === 'Approved & Issued'
              ? 'bg-blue-600'
              : 'bg-slate-600'
          }`}
        />
        {getLabel(currentStatus)}
      </span>

      {/* 5-Stage Stepper Progress Bar */}
      {showStepper && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
            Invoice Status Lifecycle Stepper (5-Stage)
          </p>

          <div className="relative flex items-center justify-between">
            {/* Background Connector Line */}
            <div className="absolute left-0 top-3.5 right-0 h-0.5 bg-gray-200 -z-0" />
            <div
              className="absolute left-0 top-3.5 h-0.5 bg-[#A31736] transition-all duration-300 -z-0"
              style={{
                width: `${(currentIndex / (stages.length - 1)) * 100}%`,
              }}
            />

            {stages.map((stage, idx) => {
              const isCompleted = idx < currentIndex || currentStatus === 'Paid'
              const isCurrent = idx === currentIndex

              return (
                <div key={stage.key} className="relative z-10 flex flex-col items-center text-center group">
                  <button
                    type="button"
                    disabled={!onStatusChange}
                    onClick={() => onStatusChange && onStatusChange(stage.key)}
                    title={onStatusChange ? `Transition status to ${stage.label}` : undefined}
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCurrent
                        ? 'bg-[#A31736] text-white ring-4 ring-[#A31736]/20 shadow-md scale-110'
                        : isCompleted
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white text-gray-400 border-2 border-gray-300 hover:border-gray-400'
                    } ${onStatusChange ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                  >
                    {isCompleted && !isCurrent ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-3.5 h-3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </button>

                  <span
                    className={`text-[11px] font-bold mt-1.5 transition-colors ${
                      isCurrent
                        ? 'text-[#A31736]'
                        : isCompleted
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-[9px] text-gray-400 hidden sm:inline">{stage.desc}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoiceLifecycleBadge
