import React, { useMemo, useState } from 'react'
import { useInventoryData } from '../hooks/useInventoryData'
import { ItemStatusBadge } from '../components/StatusBadges'
import { AvailabilityBar } from '../components/AvailabilityBar'
import { AddItemModal } from '../components/AddItemModal'
import type { ItemCategory } from '../data/initialInventoryData'

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
)

const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-700">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const StorageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-blue-700">
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
    <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
    <line x1="3" y1="12" x2="21" y2="12" />
  </svg>
)

const AlertCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-orange-700">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-amber-700">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
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
 * Allows filtering by category and availability status, with counts of items needing attention.
 */
const AllInventoryPage: React.FC = () => {
  const { items } = useInventoryData()
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState<(ItemCategory | 'All')>('All')
  const [unavailableOnly, setUnavailableOnly] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  /** Filters items by search term (name), category, and availability status based on current filters. */
  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return items.filter((item) => {
      const matchesTerm = !term || item.name.toLowerCase().includes(term)
      const matchesCategory = category === 'All' || item.category === category
      const matchesAvailability = !unavailableOnly || item.status !== 'In Stock'
      return matchesTerm && matchesCategory && matchesAvailability
    })
  }, [items, searchTerm, category, unavailableOnly])

  const lowOrOutCount = items.filter((i) => i.status !== 'In Stock').length
  const totalItems = items.length
  const pendingRequests = 0 // Would come from requests data if available

  const handleClearFilters = () => {
    setSearchTerm('')
    setCategory('All')
    setUnavailableOnly(false)
  }

  const handleAddItem = (_newItem?: any) => {
    // Items are added through the useInventoryData hook
    setIsAddModalOpen(false)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* ── PAGE HEADER with Action Button ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
            Office Inventory Stock List
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Review current stock levels, locations, and availability across all departments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#800020] hover:bg-[#600018] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
        >
          <AddIcon />
          Add New Item
        </button>
      </div>

      {/* ── 3 SUMMARY STAT CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Items */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 flex items-center gap-5 shadow-xs hover:shadow-md transition-all">
          <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-2xl shrink-0">
            <StorageIcon />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              TOTAL ITEMS
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 block tracking-tight">
              {totalItems}
            </span>
          </div>
        </div>

        {/* Card 2: Items Needing Attention */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 flex items-center gap-5 shadow-xs hover:shadow-md transition-all">
          <div className="p-4 bg-orange-50/80 border border-orange-100 rounded-2xl shrink-0">
            <AlertCircleIcon />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              NEEDING ATTENTION
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {lowOrOutCount}
              </span>
              {lowOrOutCount > 0 && (
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                  Alert
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Pending Requests */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 flex items-center gap-5 shadow-xs hover:shadow-md transition-all">
          <div className="p-4 bg-amber-50/80 border border-amber-100 rounded-2xl shrink-0">
            <ClipboardIcon />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              PENDING REQUESTS
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 block tracking-tight">
              {pendingRequests}
            </span>
          </div>
        </div>

      </div>

      {/* ── ADVANCED FILTERS PANEL ──────────────────────────────────────── */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FilterIcon />
            <h3 className="text-sm font-extrabold text-gray-800 tracking-wider uppercase">
              ADVANCED FILTERS
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4 items-end">
          
          {/* Search Input */}
          <div>
            <label htmlFor="searchInput" className="block text-xs font-bold text-gray-600 mb-1.5">
              Search
            </label>
            <input
              id="searchInput"
              type="text"
              placeholder="Item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020] transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label htmlFor="categorySelect" className="block text-xs font-bold text-gray-600 mb-1.5">
              Category
            </label>
            <div className="relative">
              <select
                id="categorySelect"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory | 'All')}
                className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020] pr-10 cursor-pointer"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none">
                <ChevronDownIcon />
              </div>
            </div>
          </div>

          {/* Availability Toggle */}
          <div>
            <label htmlFor="availabilityToggle" className="block text-xs font-bold text-gray-600 mb-1.5">
              Availability
            </label>
            <button
              id="availabilityToggle"
              type="button"
              onClick={() => setUnavailableOnly((v) => !v)}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                unavailableOnly
                  ? 'bg-[#800020] border-[#800020] text-white shadow-xs'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {unavailableOnly ? '✓ Unavailable Only' : 'All Items'}
            </button>
          </div>

          {/* Apply Search Button */}
          <div>
            <button
              type="button"
              onClick={() => {}}
              className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer shadow-xs text-sm"
            >
              Apply Filters
            </button>
          </div>

        </div>
      </div>

      {/* ── INVENTORY TABLE ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">ITEM</th>
                <th className="py-4 px-6">CATEGORY</th>
                <th className="py-4 px-6">AVAILABILITY</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6">LOCATION</th>
                <th className="py-4 px-6">LAST UPDATED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-6 text-center text-gray-500 text-sm">
                    No inventory items match your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-gray-900">{item.name}</div>
                      <div className="text-xs font-mono text-gray-500">
                        {item.itemCode} • {item.unit}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-xs font-medium text-gray-700">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-6 w-56">
                      <AvailabilityBar
                        quantityAvailable={item.quantityAvailable}
                        reorderLevel={item.reorderLevel}
                        maxStock={item.maxStock}
                        status={item.status}
                      />
                    </td>
                    <td className="py-3.5 px-6">
                      <ItemStatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-6 text-xs text-gray-600">{item.location}</td>
                    <td className="py-3.5 px-6 text-xs text-gray-600">{item.lastUpdated}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
      />
    </div>
  )
}

export default AllInventoryPage
