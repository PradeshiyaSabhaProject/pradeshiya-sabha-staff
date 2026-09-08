import React, { useMemo, useState } from 'react'
import { useInventoryData } from '../hooks/useInventoryData'
import { ItemStatusBadge } from '../components/StatusBadges'
import { AvailabilityBar } from '../components/AvailabilityBar'
import { AddItemModal } from '../components/AddItemModal'
import { RecordUsageModal } from '../components/RecordUsageModal'
import type { InventoryItemRecord, ItemCategory, ItemStatus } from '../data/initialInventoryData'

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-700">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-400 shrink-0 pointer-events-none">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const StorageCardIcon = () => (
  <div className="p-1.5 bg-blue-50/60 rounded text-blue-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  </div>
)

const SafeCardIcon = () => (
  <div className="p-1.5 bg-emerald-50/60 rounded text-emerald-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  </div>
)

const AlertCardIcon = () => (
  <div className="p-1.5 bg-amber-50/60 rounded text-amber-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  </div>
)

const ALL_CATEGORIES: (ItemCategory | 'All')[] = [
  'All',
  'Office Supplies',
  'Utilities',
  'Facilities',
  'IT Equipment',
  'Safety Equipment',
]

/**
 * Displays a searchable and filterable table of all inventory items.
 * Allows filtering by category, department, and availability status with local pagination and inspection drawer.
 */
export const AllInventoryPage: React.FC = () => {
  const { items, addItem, recordUsage } = useInventoryData()
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState<ItemCategory | 'All'>('All')
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'All'>('All')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedItemForInspect, setSelectedItemForInspect] = useState<InventoryItemRecord | null>(null)
  const [selectedItemForUsage, setSelectedItemForUsage] = useState<InventoryItemRecord | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => {
      if (i.department) set.add(i.department)
    })
    return ['All', ...Array.from(set)]
  }, [items])

  /** Filters items by search term, category, status, and department. */
  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return items.filter((item) => {
      const matchesTerm =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.itemCode.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term)
      const matchesCategory = category === 'All' || item.category === category
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter
      const matchesDepartment = departmentFilter === 'All' || item.department === departmentFilter
      return matchesTerm && matchesCategory && matchesStatus && matchesDepartment
    })
  }, [items, searchTerm, category, statusFilter, departmentFilter])

  const totalItems = items.length
  const inStockCount = items.filter((i) => i.status === 'In Stock').length
  const criticalCount = items.filter((i) => i.status !== 'In Stock').length

  // Local pagination
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1
  const paginatedList = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleClearFilters = () => {
    setSearchTerm('')
    setCategory('All')
    setStatusFilter('All')
    setDepartmentFilter('All')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Municipal Stock Directory & Store Ledger
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Complete register of council store items, unit quantities, reorder thresholds, and physical store locations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-4 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
          >
            <AddIcon />
            <span>+ Add New Item</span>
          </button>
        </div>
      </div>

      {/* ── 3 Summary KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Catalog Items */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Total Stock Items
            </span>
            <StorageCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {totalItems}
            </p>
            <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Verified Register
            </span>
          </div>
        </div>

        {/* Card 2: Adequate Stock Level */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Adequate Stock Level
            </span>
            <SafeCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tracking-tight">
              {inStockCount}
            </p>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              In Safe Supply
            </span>
          </div>
        </div>

        {/* Card 3: Critical & Low Stock */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Attention Required
            </span>
            <AlertCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-800 tracking-tight">
              {criticalCount}
            </p>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Reorder Due
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Container: Filter Toolbar + Table ── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
              Municipal Inventory Stock Ledger
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Review current stock balances, storage locations, and consumption records across all departments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert('Exporting STOCK_DIRECTORY.csv...')}
              className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer text-center"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-gray-50/50 border-b border-gray-200 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FilterIcon />
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Directory Filters & Criteria
              </h3>
            </div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-bold text-[#A31736] hover:text-[#801028] transition-colors cursor-pointer uppercase tracking-wider self-start md:self-auto"
            >
              Clear All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div>
              <label htmlFor="searchInput" className="block text-[11px] font-semibold text-gray-600 mb-1">
                Search Code / Name
              </label>
              <input
                id="searchInput"
                type="text"
                placeholder="Search item, code, location..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9 font-medium"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="categorySelect" className="block text-[11px] font-semibold text-gray-600 mb-1">
                Item Category
              </label>
              <div className="relative">
                <select
                  id="categorySelect"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value as ItemCategory | 'All')
                    setCurrentPage(1)
                  }}
                  className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#A31736] pr-8 cursor-pointer h-9 font-medium"
                >
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c === 'All' ? 'All Categories' : c}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-2.5 pointer-events-none">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="statusSelect" className="block text-[11px] font-semibold text-gray-600 mb-1">
                Stock Status
              </label>
              <div className="relative">
                <select
                  id="statusSelect"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as ItemStatus | 'All')
                    setCurrentPage(1)
                  }}
                  className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#A31736] pr-8 cursor-pointer h-9 font-medium"
                >
                  <option value="All">All Statuses</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
                <div className="absolute right-2.5 top-2.5 pointer-events-none">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <label htmlFor="departmentSelect" className="block text-[11px] font-semibold text-gray-600 mb-1">
                Owning Department
              </label>
              <div className="relative">
                <select
                  id="departmentSelect"
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#A31736] pr-8 cursor-pointer h-9 font-medium"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d === 'All' ? 'All Departments' : d}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-2.5 pointer-events-none">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Data Table */}
        <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-6 w-36">Item Code</th>
                <th className="py-3 px-6">Item Name & Category</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6 w-52">Stock Availability</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6">Location</th>
                <th className="py-3 px-6 text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {paginatedList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  {/* Item Code */}
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-[#1e3a8a]">
                      {item.itemCode}
                    </span>
                  </td>

                  {/* Name & Category */}
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <p className="font-bold text-gray-900 text-xs">{item.name}</p>
                    <p className="text-[11px] text-gray-500 font-medium">
                      {item.category} • {item.unit}
                    </p>
                  </td>

                  {/* Department */}
                  <td className="py-3.5 px-6 text-xs text-gray-700 font-medium whitespace-nowrap">
                    {item.department}
                  </td>

                  {/* Availability Bar */}
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <AvailabilityBar
                      quantityAvailable={item.quantityAvailable}
                      reorderLevel={item.reorderLevel}
                      maxStock={item.maxStock}
                      status={item.status}
                    />
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-6 text-center whitespace-nowrap">
                    <ItemStatusBadge status={item.status} />
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-6 text-xs text-gray-600 font-medium whitespace-nowrap">
                    {item.location}
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedItemForUsage(item)}
                        className="text-xs font-bold text-[#A31736] hover:underline cursor-pointer uppercase tracking-wider"
                      >
                        Use
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedItemForInspect(item)}
                        className="text-xs font-bold text-[#1e3a8a] hover:underline cursor-pointer uppercase tracking-wider"
                      >
                        Inspect &rarr;
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedList.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-medium italic">
                    No inventory records found matching the specified directory criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-gray-600 font-semibold">
            Showing {filteredItems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredItems.length)} of {filteredItems.length} inventory items
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

      {/* ── Inspection Drawer / Modal ── */}
      {selectedItemForInspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded border border-gray-300 shadow-2xl p-6 max-w-md w-full relative z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#1e3a8a]">{selectedItemForInspect.itemCode}</span>
                <h3 className="font-bold text-gray-900 text-base uppercase tracking-wide">
                  Store Item Inspection Dossier
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForInspect(null)}
                className="text-gray-400 hover:text-gray-700 font-bold text-base cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-gray-700">
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="font-semibold text-gray-500">Item Name:</span>
                <span className="font-bold text-gray-900 text-right">{selectedItemForInspect.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="font-semibold text-gray-500">Category:</span>
                <span className="font-semibold text-gray-900">{selectedItemForInspect.category}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="font-semibold text-gray-500">Owning Department:</span>
                <span className="font-medium text-gray-900">{selectedItemForInspect.department}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="font-semibold text-gray-500">Storage Location:</span>
                <span className="font-medium text-gray-900 text-right">{selectedItemForInspect.location}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="font-semibold text-gray-500">Available Quantity:</span>
                <span className="font-bold text-gray-900">{selectedItemForInspect.quantityAvailable} {selectedItemForInspect.unit}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="font-semibold text-gray-500">Reorder Threshold:</span>
                <span className="font-medium text-amber-800">{selectedItemForInspect.reorderLevel} {selectedItemForInspect.unit}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="font-semibold text-gray-500">Stock Status:</span>
                <ItemStatusBadge status={selectedItemForInspect.status} />
              </div>
              <div className="flex justify-between pb-1">
                <span className="font-semibold text-gray-500">Last Updated:</span>
                <span className="text-gray-600">{selectedItemForInspect.lastUpdated}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedItemForInspect(null)}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = selectedItemForInspect
                  setSelectedItemForInspect(null)
                  setSelectedItemForUsage(target)
                }}
                className="px-4 py-2 bg-[#A31736] hover:bg-[#801028] text-white rounded text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
              >
                Record Usage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addItem}
      />

      <RecordUsageModal
        isOpen={!!selectedItemForUsage}
        onClose={() => setSelectedItemForUsage(null)}
        item={selectedItemForUsage}
        onSubmit={recordUsage}
      />
    </div>
  )
}

export default AllInventoryPage

