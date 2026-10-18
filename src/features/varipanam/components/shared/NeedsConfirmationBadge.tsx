import React from 'react'

interface NeedsConfirmationBadgeProps {
  label?: string
  tooltip?: string
  className?: string
}

export const NeedsConfirmationBadge: React.FC<NeedsConfirmationBadgeProps> = ({
  label = 'Needs confirmation',
  tooltip = 'This rate or rule is subject to municipal council gazette confirmation and is configurable in Settings.',
  className = '',
}) => {
  return (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 cursor-help select-none ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3 text-amber-600">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>{label}</span>
    </span>
  )
}

export default NeedsConfirmationBadge
