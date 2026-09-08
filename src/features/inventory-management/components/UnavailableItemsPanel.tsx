import React from 'react'
import { Link } from 'react-router-dom'
import type { InventoryItemRecord } from '../data/initialInventoryData'
import { ItemStatusBadge } from './StatusBadges'

interface UnavailableItemsPanelProps {
  items: InventoryItemRecord[]
  /** If true, shows a "View All Inventory" link in the header (used on the Overview page). */
  showViewAllLink?: boolean
}

/** Returns the most recent usage log entry for an item, if any. */
function getLastUsage(item: InventoryItemRecord) {
  if (!item.usageHistory.length) return null
  return [...item.usageHistory].sort((a, b) => (a.usedAt < b.usedAt ? 1 : -1))[0]
}

/**
 * Displays a table of items with low or out-of-stock status, sorted by urgency.
 * Shows item details and the last staff member who used the item for quick follow-up.
 */
export const UnavailableItemsPanel: React.FC<UnavailableItemsPanelProps> = ({
  items,
  showViewAllLink = false,
}) => {
  const unavailable = items
    .filter((item) => item.status !== 'In Stock')
    .sort((a, b) => {
      if (a.status === b.status) return a.quantityAvailable - b.quantityAvailable
      return a.status === 'Out of Stock' ? -1 : 1
    })

  return (
    <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
        <div>
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">
            Critical Stock Attention & Reorder List
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Low or out-of-stock materials requiring immediate purchase order or requisition.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-bold text-red-800 bg-red-50 px-2.5 py-0.5 rounded border border-red-200 uppercase tracking-wide">
            {unavailable.length} Critical Item{unavailable.length === 1 ? '' : 's'}
          </span>
          {showViewAllLink && (
            <Link
              to="/inventory-management/all"
              className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] hover:underline whitespace-nowrap"
            >
              View Full Stock List &rarr;
            </Link>
          )}
        </div>
      </div>

      {unavailable.length === 0 ? (
        <div className="p-12 text-center text-xs text-gray-500 font-medium italic">
          All inventory items are currently above safe reorder thresholds.
        </div>
      ) : (
        <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-6 w-36">Item Code</th>
                <th className="py-3 px-6">Item Name & Category</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6">Available Qty</th>
                <th className="py-3 px-6">Storage Location</th>
                <th className="py-3 px-6">Last Issued To</th>
                <th className="py-3 px-6 text-right">Last Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {unavailable.map((item) => {
                const lastUsage = getLastUsage(item)
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-gray-50 ${
                      item.status === 'Out of Stock' ? 'bg-red-50/20' : 'bg-amber-50/15'
                    }`}
                  >
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-[#1e3a8a]">
                        {item.itemCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <p className="font-bold text-gray-900 text-xs">{item.name}</p>
                      <p className="text-[11px] text-gray-500 font-medium">{item.category} • {item.department}</p>
                    </td>
                    <td className="py-3.5 px-6 text-center whitespace-nowrap">
                      <ItemStatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <span className="font-bold text-gray-900 text-xs">
                        {item.quantityAvailable} {item.unit}
                      </span>
                      <span className="block text-[11px] text-gray-500 font-medium">
                        Reorder at {item.reorderLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-gray-700 font-medium whitespace-nowrap">
                      {item.location}
                    </td>
                    <td className="py-3.5 px-6 text-xs whitespace-nowrap">
                      {lastUsage ? (
                        <>
                          <div className="font-bold text-gray-900 text-xs">{lastUsage.usedBy}</div>
                          <div className="text-[11px] text-gray-500 font-medium">{lastUsage.department}</div>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">No usage recorded</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right text-xs text-gray-500 whitespace-nowrap">
                      {lastUsage ? lastUsage.usedAt : item.lastUpdated}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default UnavailableItemsPanel
