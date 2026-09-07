import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useInventoryData } from '../hooks/useInventoryData'
import { ItemStatusBadge } from '../components/StatusBadges'
import { AvailabilityBar } from '../components/AvailabilityBar'
import type { ItemCategory } from '../data/initialInventoryData'

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
              All Inventory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#801028] tracking-tight">
            Office Inventory Stock List
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">
            Review current stock levels, locations, and availability across all departments.
          </p>
        </div>

        <span className="px-3.5 py-1.5 bg-orange-50 border border-orange-200 text-orange-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs">
          {lowOrOutCount} Items Need Attention
        </span>
      </div>

      <div className="bg-white p-4 border border-gray-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <input
          type="text"
          placeholder="Search item name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#801028] focus:ring-1 focus:ring-[#801028] transition-all"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ItemCategory | 'All')}
          className="w-full sm:w-56 bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#801028] focus:ring-1 focus:ring-[#801028] transition-all"
        >
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All Categories' : c}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setUnavailableOnly((v) => !v)}
          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer shadow-2xs ${
            unavailableOnly
              ? 'bg-[#801028] border-[#801028] text-white shadow-xs'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {unavailableOnly ? '✓ Unavailable Only' : 'Show Unavailable Only'}
        </button>

        <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">
          Showing <strong className="text-gray-900">{filteredItems.length}</strong> items
        </span>
      </div>

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
    </div>
  )
}

export default AllInventoryPage
