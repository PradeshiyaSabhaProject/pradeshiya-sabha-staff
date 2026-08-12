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
  // usageHistory is stored newest-first (recordUsage prepends), but sort
  // defensively in case of manually-seeded mock data.
  return [...item.usageHistory].sort((a, b) => (a.usedAt < b.usedAt ? 1 : -1))[0]
}

export const UnavailableItemsPanel: React.FC<UnavailableItemsPanelProps> = ({
  items,
  showViewAllLink = false,
}) => {
  const unavailable = items
    .filter((item) => item.status !== 'In Stock')
    // Out of Stock items surface above Low Stock items — most urgent first.
    .sort((a, b) => {
      if (a.status === b.status) return a.quantityAvailable - b.quantityAvailable
      return a.status === 'Out of Stock' ? -1 : 1
    })

  return (
    <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Needs Attention</h2>
          <p className="text-xs text-gray-500">
            Low or out-of-stock items, with who last took stock — for quick follow-up
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="px-3.5 py-1.5 bg-red-50 border border-red-200 text-[#A31736] rounded text-xs font-bold uppercase tracking-wider">
            {unavailable.length} Item{unavailable.length === 1 ? '' : 's'}
          </span>
          {showViewAllLink && (
            <Link
              to="/inventory-management/all"
              className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] hover:underline whitespace-nowrap"
            >
              View All Inventory
            </Link>
          )}
        </div>
      </div>

      {unavailable.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-500">
          Nothing needs attention right now — all items are above their reorder level.
        </div>
      ) : (
        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">ITEM</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6">AVAILABLE</th>
                <th className="py-4 px-6">LOCATION</th>
                <th className="py-4 px-6">LAST TAKEN BY</th>
                <th className="py-4 px-6">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {unavailable.map((item) => {
                const lastUsage = getLastUsage(item)
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      item.status === 'Out of Stock' ? 'bg-red-50/40' : 'bg-orange-50/30'
                    } hover:bg-gray-50`}
                  >
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-gray-900">{item.name}</div>
                      <div className="text-xs font-mono text-gray-500">{item.itemCode}</div>
                    </td>
                    <td className="py-3.5 px-6">
                      <ItemStatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-6 font-bold text-gray-900">
                      {item.quantityAvailable} {item.unit}
                      <span className="block font-normal text-[10px] text-gray-400">
                        reorder at {item.reorderLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-gray-600">{item.location}</td>
                    <td className="py-3.5 px-6 text-xs">
                      {lastUsage ? (
                        <>
                          <div className="font-semibold text-gray-800">{lastUsage.usedBy}</div>
                          <div className="text-gray-500">{lastUsage.department}</div>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">No usage recorded</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-gray-600">
                      {lastUsage ? lastUsage.usedAt : '—'}
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
