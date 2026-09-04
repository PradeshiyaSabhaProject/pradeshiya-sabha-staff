import React from 'react'
import type { ItemStatus } from '../data/initialInventoryData'

interface AvailabilityBarProps {
  quantityAvailable: number
  reorderLevel: number
  maxStock: number
  status: ItemStatus
}

const BAR_COLOR: Record<ItemStatus, string> = {
  'In Stock': 'bg-emerald-500',
  'Low Stock': 'bg-orange-500',
  'Out of Stock': 'bg-[#A31736]',
}

/**
 * Displays a visual progress bar showing current stock level relative to maximum,
 * with a marker indicating the reorder threshold. Color changes based on item status.
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
        <span className="text-xs font-bold text-gray-800">
          {quantityAvailable} <span className="font-normal text-gray-400">available</span>
        </span>
        <span className="text-[10px] text-gray-400">reorder at {reorderLevel}</span>
      </div>

      <div className="relative w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
        {/* Fill representing current stock level */}
        <div
          className={`h-full rounded-full transition-all duration-300 ${BAR_COLOR[status]}`}
          style={{ width: `${fillPercent}%` }}
        />
        {/* Marker showing where the reorder threshold sits */}
        <div
          className="absolute top-0 h-full w-[2px] bg-gray-500/60"
          style={{ left: `${reorderPercent}%` }}
          title={`Reorder level: ${reorderLevel}`}
        />
      </div>
    </div>
  )
}
