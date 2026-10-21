import React from 'react'
import { AlertCircle } from 'lucide-react'

interface NeedsConfirmationBadgeProps {
  label?: string
  settingKey?: string
  tooltip?: string
  className?: string
}

export const NeedsConfirmationBadge: React.FC<NeedsConfirmationBadgeProps> = ({
  label = '',
  settingKey,
  tooltip,
  className = '',
}) => {
  const titleText =
    tooltip ||
    (settingKey
      ? `Policy rate or statutory workflow rule requires council gazette confirmation. Configurable under Varipanam Settings (${settingKey}).`
      : 'Statutory policy rule requires formal council gazette confirmation. Configurable in Settings.')

  return (
    <span
      title={titleText}
      className={`inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full shadow-xs cursor-help ${className}`}
    >
      <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
      <span>{label}</span>
    </span>
  )
}

export default NeedsConfirmationBadge
