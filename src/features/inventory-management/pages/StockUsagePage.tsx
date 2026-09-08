import React, { useMemo, useState } from 'react'
import { useInventoryData } from '../hooks/useInventoryData'
import { RecordUsageModal } from '../components/RecordUsageModal'
import { ItemStatusBadge } from '../components/StatusBadges'
import { AvailabilityBar } from '../components/AvailabilityBar'
import type { InventoryItemRecord } from '../data/initialInventoryData'

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
const LogCardIcon = () => (
  <div className="p-1.5 bg-blue-50/60 rounded text-blue-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  </div>
)

const AvailableCardIcon = () => (
  <div className="p-1.5 bg-emerald-50/60 rounded text-emerald-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  </div>
)

const DepartmentCardIcon = () => (
  <div className="p-1.5 bg-purple-50/60 rounded text-purple-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  </div>
)

/**
 * Page for recording stock consumption against inventory items.
 * Shows selectable items and a chronological log of all recorded usage across the inventory.
 */
export const StockUsagePage: React.FC = () => {
  const { items, recordUsage } = useInventoryData()
  const [selectedItem, setSelectedItem] = useState<InventoryItemRecord | null>(null)
  const [logSearch, setLogSearch] = useState('')
  const [itemSearch, setItemSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  /** Aggregates and sorts usage logs from all items, most recent first, enriched with item metadata. */
  const allLogs = useMemo(() => {
    return items
      .flatMap((item) =>
        item.usageHistory.map((log) => ({
          ...log,
          itemName: item.name,
          itemCode: item.itemCode,
          unit: item.unit,
        })),
      )
      .sort((a, b) => (a.usedAt < b.usedAt ? 1 : -1))
  }, [items])

  // Filtered usage logs
  const filteredLogs = useMemo(() => {
    const q = logSearch.trim().toLowerCase()
    if (!q) return allLogs
    return allLogs.filter(
      (l) =>
        l.itemName.toLowerCase().includes(q) ||
        l.itemCode.toLowerCase().includes(q) ||
        l.usedBy.toLowerCase().includes(q) ||
        l.department.toLowerCase().includes(q) ||
        l.notes.toLowerCase().includes(q),
    )
  }, [allLogs, logSearch])

  // Filtered store items for selection
  const selectableItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.itemCode.toLowerCase().includes(q) ||
        i.department.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q),
    )
  }, [items, itemSearch])

  const totalLogsCount = allLogs.length
  const totalQuantityIssued = allLogs.reduce((acc, curr) => acc + curr.quantityUsed, 0)

  // Pagination for logs
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Municipal Stock Usage & Store Issue Log
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Record consumption against inventory stock balances with immediate ledger updates and historical audit trail.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => alert('Exporting USAGE_HISTORY.csv...')}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded transition-colors shadow-xs uppercase tracking-wider cursor-pointer"
          >
            Export Log CSV
          </button>
        </div>
      </div>

      {/* ── 3 Summary KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Total Issue Records
            </span>
            <LogCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {totalLogsCount}
            </p>
            <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Historical Entries
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Total Units Issued
            </span>
            <AvailableCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tracking-tight">
              {totalQuantityIssued.toLocaleString()} Units
            </p>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Total Dispatched
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Active Stock Catalog
            </span>
            <DepartmentCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-900 tracking-tight">
              {items.length} Items
            </p>
            <span className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Store Registry
            </span>
          </div>
        </div>
      </div>

      {/* ── Item Grid: pick an item to record usage against ── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">
              Select Item to Issue / Record Consumption
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Click "Record Usage" to log item distribution or consumption for an active store item.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search store item..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-8 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
          {selectableItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded border border-gray-300 bg-white hover:border-[#A31736] transition-all shadow-3xs flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-[#1e3a8a]">
                    {item.itemCode}
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 mt-0.5">{item.name}</h4>
                  <p className="text-[11px] text-gray-500 font-medium">{item.category} • {item.location}</p>
                </div>
                <ItemStatusBadge status={item.status} />
              </div>

              <div className="py-1">
                <AvailabilityBar
                  quantityAvailable={item.quantityAvailable}
                  reorderLevel={item.reorderLevel}
                  maxStock={item.maxStock}
                  status={item.status}
                />
              </div>

              <button
                type="button"
                disabled={item.quantityAvailable <= 0}
                onClick={() => setSelectedItem(item)}
                className="mt-auto px-3.5 py-1.5 bg-[#A31736] hover:bg-[#801028] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer text-center"
              >
                {item.quantityAvailable <= 0 ? 'Out of Stock' : 'Record Usage'}
              </button>
            </div>
          ))}

          {selectableItems.length === 0 && (
            <div className="col-span-3 py-8 text-center text-xs text-gray-500 font-medium italic">
              No store items found matching "{itemSearch}".
            </div>
          )}
        </div>
      </div>

      {/* ── Usage History Table ── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">
              Official Stock Consumption History & Issue Audit
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Chronological ledger of materials issued to departments and officers.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Filter by officer, dept, notes..."
              value={logSearch}
              onChange={(e) => {
                setLogSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-8 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-6 w-36">Item Code</th>
                <th className="py-3 px-6">Item Name</th>
                <th className="py-3 px-6">Quantity Used</th>
                <th className="py-3 px-6">Issued / Taken By</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">Remarks & Purpose</th>
                <th className="py-3 px-6 text-right">Date Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-[#1e3a8a]">
                      {log.itemCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-bold text-gray-900 text-xs whitespace-nowrap">
                    {log.itemName}
                  </td>
                  <td className="py-3.5 px-6 font-bold text-[#A31736] text-xs whitespace-nowrap">
                    {log.quantityUsed} {log.unit}
                  </td>
                  <td className="py-3.5 px-6 text-xs text-gray-900 font-medium whitespace-nowrap">
                    {log.usedBy}
                  </td>
                  <td className="py-3.5 px-6 text-xs text-gray-700 font-medium whitespace-nowrap">
                    {log.department}
                  </td>
                  <td className="py-3.5 px-6 text-xs text-gray-500 italic max-w-xs truncate">
                    {log.notes || '—'}
                  </td>
                  <td className="py-3.5 px-6 text-right text-xs text-gray-600 font-mono whitespace-nowrap">
                    {log.usedAt}
                  </td>
                </tr>
              ))}

              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-medium italic">
                    No consumption logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-gray-600 font-semibold">
            Showing {filteredLogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} logs
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer shadow-3xs text-xs font-bold"
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const p = idx + 1
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer ${
                      currentPage === p
                        ? 'bg-[#A31736] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer shadow-3xs text-xs font-bold"
              >
                &gt;
              </button>
            </div>
          )}
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

