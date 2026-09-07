import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInventoryData } from '../hooks/useInventoryData'
import { UnavailableItemsPanel } from '../components/UnavailableItemsPanel'
import { AddItemModal } from '../components/AddItemModal'

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-700">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-orange-700">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const TrendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-red-700">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
)

const ChecklistIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-amber-700">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
  </svg>
)

/**
 * Dashboard landing page showing inventory statistics (total items, low stock, out of stock, pending requests)
 * and quick-access links to key inventory management tasks and the unavailable items panel.
 */
export const InventoryOverviewPage: React.FC = () => {
  const { items, requests } = useInventoryData()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const totalItems = items.length
  const lowStockCount = items.filter((i) => i.status === 'Low Stock').length
  const outOfStockCount = items.filter((i) => i.status === 'Out of Stock').length
  const pendingRequests = requests.filter((r) => r.status === 'Pending Approval').length


  const handleAddItem = (_newItem?: any) => {
    // Items are added through the useInventoryData hook
    setIsAddModalOpen(false)
  }

  const quickLinks = [
    { to: '/inventory-management/all', label: 'All Inventory', desc: 'Browse full stock list' },
    { to: '/inventory-management/usage', label: 'Stock Usage', desc: 'Record item consumption' },
    { to: '/inventory-management/request', label: 'Request Stock', desc: 'Ask for replenishment' },
    { to: '/inventory-management/approve', label: 'Approvals', desc: 'Review pending requests' },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* ── Page Header with Action Buttons ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold text-black tracking-tight">Inventory Management Overview</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">
            Monitor office stock levels, track usage, and manage stock requests across all departments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-4 py-2.5 rounded shadow-sm transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <PlusIcon />
            <span>New Request</span>
          </button>

          <button
            type="button"
            onClick={() => alert('Export Report triggered (Simulated)')}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded transition-all flex items-center gap-2 cursor-pointer shadow-sm uppercase tracking-wider"
          >
            <DownloadIcon />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* ── Summary Cards (redesigned to match Asset pattern) ────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Total Inventory Items */}
        <div className="bg-white border border-gray-300 rounded p-5 shadow-sm flex flex-col justify-between cursor-default hover:shadow transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Total Inventory Items</span>
              <p className="text-2xl font-black text-gray-900 tracking-tight mt-1.5">{totalItems}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                All Items
              </span>
              <div className="p-1.5 bg-blue-50 rounded">
                <BoxIcon />
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-5 overflow-hidden">
            <div className="bg-[#1e40af] h-1.5 rounded-sm transition-all duration-1000" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Card 2: Low Stock Items */}
        <div className="bg-white border border-gray-300 rounded p-5 shadow-sm flex flex-col justify-between cursor-default hover:shadow transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Low Stock Items</span>
              <p className="text-2xl font-black text-gray-900 tracking-tight mt-1.5">{lowStockCount}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                Needs Reorder
              </span>
              <div className="p-1.5 bg-orange-50 rounded">
                <AlertIcon />
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-5 overflow-hidden">
            <div className="bg-[#ea580c] h-1.5 rounded-sm transition-all duration-1000" style={{ width: `${lowStockCount > 0 ? Math.min(lowStockCount * 10, 100) : 0}%` }} />
          </div>
        </div>

        {/* Card 3: Out of Stock Items */}
        <div className="bg-white border border-gray-300 rounded p-5 shadow-sm flex flex-col justify-between cursor-default hover:shadow transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Out of Stock Items</span>
              <p className="text-2xl font-black text-gray-900 tracking-tight mt-1.5">{outOfStockCount}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Critical
              </span>
              <div className="p-1.5 bg-red-50 rounded">
                <TrendIcon />
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-5 overflow-hidden">
            <div className="bg-[#dc2626] h-1.5 rounded-sm transition-all duration-1000" style={{ width: `${outOfStockCount > 0 ? Math.min(outOfStockCount * 15, 100) : 0}%` }} />
          </div>
        </div>

        {/* Card 4: Pending Requests */}
        <div className="bg-white border border-gray-300 rounded p-5 shadow-sm flex flex-col justify-between cursor-default hover:shadow transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Pending Requests</span>
              <div className="flex items-center gap-3 mt-1.5">
                <p className="text-2xl font-black text-gray-900 tracking-tight">{pendingRequests}</p>
                {pendingRequests > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Review
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Awaiting Review
              </span>
              <div className="p-1.5 bg-amber-50 rounded">
                <ChecklistIcon />
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-5 overflow-hidden">
            <div className="bg-[#b45309] h-1.5 rounded-sm transition-all duration-1000" style={{ width: `${pendingRequests > 0 ? Math.min(pendingRequests * 20, 100) : 0}%` }} />
          </div>
        </div>

      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Quick Access</h2>
          <p className="text-xs text-gray-500">Jump straight to a task</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-gray-50 hover:border-[#801028]/40 transition-all shadow-2xs hover:shadow-xs"
            >
              <h3 className="text-sm font-bold text-gray-900">{link.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <UnavailableItemsPanel items={items} showViewAllLink={true} />

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
      />
    </div>
  )
}

export default InventoryOverviewPage
