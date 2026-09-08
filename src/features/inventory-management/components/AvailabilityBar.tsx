import React from 'react'
import type { ItemStatus } from '../data/initialInventoryData'

interface AvailabilityBarProps {
  quantityAvailable: number
  reorderLevel: number
  maxStock: number
  status: ItemStatus
}

const BAR_COLOR: Record<ItemStatus, string> = {
  'In Stock': 'bg-emerald-600',
  'Low Stock': 'bg-amber-500',
  'Out of Stock': 'bg-red-600',
}

/**
 * Displays a visual progress bar showing current stock level relative to maximum,
 * with a marker indicating the reorder threshold.
 */
export const AvailabilityBar: React.FC<AvailabilityBarProps> = ({
  quantityAvailable,
  reorderLevel,
  maxStock,
  status,
}) => {
  // Calculate safe maximum for percentage math (prevents division by zero)
  const safeMax = Math.max(maxStock, reorderLevel, quantityAvailable, 1)
  // Percentage of bar to fill based on current quantity
  const fillPercent = Math.min(100, Math.round((quantityAvailable / safeMax) * 100))
  // Percentage position of reorder threshold marker
  const reorderPercent = Math.min(100, Math.round((reorderLevel / safeMax) * 100))

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-gray-900">
          {quantityAvailable} <span className="font-normal text-gray-500">avail</span>
        </span>
        <span className="text-[10px] font-medium text-gray-500">Reorder at {reorderLevel}</span>
      </div>

      <div className="relative w-full h-1.5 rounded-sm bg-gray-200 overflow-hidden">
        {/* Fill representing current stock level */}
        <div
          className={`h-full rounded-sm transition-all duration-500 ${BAR_COLOR[status] || 'bg-gray-400'}`}
          style={{ width: `${fillPercent}%` }}
        />
        {/* Marker showing where the reorder threshold sits */}
        <div
          className="absolute top-0 h-full w-[2px] bg-gray-600/80"
          style={{ left: `${reorderPercent}%` }}
          title={`Reorder threshold: ${reorderLevel}`}
        />
      </div>
    </div>
  )
}

export default AvailabilityBar

