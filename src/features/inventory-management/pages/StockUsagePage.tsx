import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInventoryData } from '../hooks/useInventoryData'
import { RecordUsageModal } from '../components/RecordUsageModal'
import { ItemStatusBadge } from '../components/StatusBadges'
import { AvailabilityBar } from '../components/AvailabilityBar'
import type { InventoryItemRecord } from '../data/initialInventoryData'

const StockUsagePage: React.FC = () => {
  const { items, recordUsage } = useInventoryData()
  const [selectedItem, setSelectedItem] = useState<InventoryItemRecord | null>(null)

  // Aggregate usage logs across all items, most recent first
  const allLogs = items
    .flatMap((item) =>
      item.usageHistory.map((log) => ({
        ...log,
        itemName: item.name,
        itemCode: item.itemCode,
        unit: item.unit,
      })),
    )
    .sort((a, b) => (a.usedAt < b.usedAt ? 1 : -1))

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/inventory-management/overview"
              className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] hover:underline"
            >
              Inventory Management
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              Stock Usage
            </span>
          </div>
          <h1 className="text-[26px] font-extrabold text-[#0f172a] tracking-tight">
            Record Stock Usage
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">
            Select an item to record consumption. Available quantity updates immediately.
          </p>
        </div>
      </div>

      {/* ── Item Grid: pick an item to record usage against ── */}
      <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Select an Item</h2>
          <p className="text-xs text-gray-500">Click "Record Usage" to log consumption</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded border border-gray-300 bg-gray-50/60 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    {item.itemCode}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 mt-1">{item.name}</h4>
                  <p className="text-xs text-gray-500">{item.location}</p>
                </div>
                <ItemStatusBadge status={item.status} />
              </div>

              <AvailabilityBar
                quantityAvailable={item.quantityAvailable}
                reorderLevel={item.reorderLevel}
                maxStock={item.maxStock}
                status={item.status}
              />

              <button
                type="button"
                disabled={item.quantityAvailable <= 0}
                onClick={() => setSelectedItem(item)}
                className="mt-auto px-3.5 py-1.5 bg-[#A31736] hover:bg-[#801028] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded text-xs font-semibold uppercase tracking-wider shadow-sm cursor-pointer"
              >
                Record Usage
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Usage History ── */}
      <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Usage History</h2>
          <p className="text-xs text-gray-500">Log of all recorded stock consumption</p>
        </div>

        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">ITEM</th>
                <th className="py-4 px-6">QUANTITY USED</th>
                <th className="py-4 px-6">USED BY</th>
                <th className="py-4 px-6">DEPARTMENT</th>
                <th className="py-4 px-6">NOTES</th>
                <th className="py-4 px-6">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {allLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-6 text-center text-gray-500 text-sm">
                    No usage has been recorded yet.
                  </td>
                </tr>
              ) : (
                allLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-[#1e3a8a]">
                      {log.itemCode}
                      <div className="font-sans font-normal text-gray-700">{log.itemName}</div>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-gray-900">
                      {log.quantityUsed} {log.unit}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-gray-700">{log.usedBy}</td>
                    <td className="py-3.5 px-6 text-xs text-gray-700">{log.department}</td>
                    <td className="py-3.5 px-6 text-xs text-gray-500 italic">{log.notes || '—'}</td>
                    <td className="py-3.5 px-6 text-xs text-gray-600">{log.usedAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RecordUsageModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        onSubmit={recordUsage}
      />
    </div>
  )
}

export default StockUsagePage
