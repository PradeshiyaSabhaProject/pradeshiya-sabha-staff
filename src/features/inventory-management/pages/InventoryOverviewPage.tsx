import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AddItemModal } from '../components/AddItemModal'
import { RecordUsageModal } from '../components/RecordUsageModal'
import { RequestStockModal } from '../components/RequestStockModal'
import { useInventoryData } from '../hooks/useInventoryData'

const InventoryOverviewPage: React.FC = () => {
  const { items, stats, filteredItems, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter, addItem, recordUsage, requestStock } = useInventoryData()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const selectedItem = useMemo(() => items.find((item) => item.id === selectedItemId) ?? null, [items, selectedItemId])

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Inventory Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Track stock levels, usage, and replenishment requests for council stores.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setIsAddModalOpen(true)} className="rounded-xl bg-[#A31736] px-4 py-2.5 text-sm font-semibold text-white shadow-sm">+ Add Item</button>
          <button type="button" onClick={() => setIsRequestModalOpen(true)} className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700">Request Stock</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="mt-2 text-3xl font-black text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="mt-2 text-3xl font-black text-amber-600">{stats.lowStock}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <p className="mt-2 text-3xl font-black text-red-600">{stats.outOfStock}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending Requests</p>
          <p className="mt-2 text-3xl font-black text-[#1e3a8a]">{stats.pendingRequests}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full lg:w-72">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Search inventory</label>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or location" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700" />
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700">
              <option value="All">All Categories</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Cleaning Supplies">Cleaning Supplies</option>
              <option value="IT Equipment">IT Equipment</option>
              <option value="Safety Equipment">Safety Equipment</option>
              <option value="Furniture">Furniture</option>
              <option value="Tools & Hardware">Tools & Hardware</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700">
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredItems.map((item) => (
          <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{item.itemCode}</p>
                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.category} • {item.department}</p>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${item.status === 'Out of Stock' ? 'border-red-200 bg-red-50 text-red-700' : item.status === 'Low Stock' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{item.status}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Available</p>
                <p className="mt-1 text-xl font-black text-gray-900">{item.quantityAvailable} {item.unit}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Reorder Level</p>
                <p className="mt-1 text-xl font-black text-gray-900">{item.reorderLevel} {item.unit}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p><span className="font-semibold">Location:</span> {item.location}</p>
              <p className="mt-1"><span className="font-semibold">Last Updated:</span> {item.lastUpdated}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => { setSelectedItemId(item.id); setIsUsageModalOpen(true) }} className="rounded-xl border border-gray-300 px-3.5 py-2 text-sm font-semibold text-gray-700">Record Usage</button>
              <Link to="/inventory-management/approve" className="rounded-xl border border-gray-300 px-3.5 py-2 text-sm font-semibold text-gray-700">Approvals</Link>
            </div>
          </div>
        ))}
      </div>

      <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={(item) => { addItem(item); setIsAddModalOpen(false) }} />
      <RecordUsageModal isOpen={isUsageModalOpen} onClose={() => setIsUsageModalOpen(false)} item={selectedItem} onRecordUsage={(itemId, details) => { recordUsage(itemId, details); setIsUsageModalOpen(false) }} />
      <RequestStockModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} onRequest={(details) => { requestStock(details); setIsRequestModalOpen(false) }} />
    </div>
  )
}

export default InventoryOverviewPage
