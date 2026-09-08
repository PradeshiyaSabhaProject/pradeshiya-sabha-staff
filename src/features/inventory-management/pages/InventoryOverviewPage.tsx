import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInventoryData } from '../hooks/useInventoryData'
import { UnavailableItemsPanel } from '../components/UnavailableItemsPanel'
import { AddItemModal } from '../components/AddItemModal'
import { RequestStockModal } from '../components/RequestStockModal'

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const ExportIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
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

const InStockCardIcon = () => (
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

const PendingCardIcon = () => (
  <div className="p-1.5 bg-purple-50/60 rounded text-purple-800 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  </div>
)

/**
 * Dashboard landing page showing inventory statistics (total items, low stock, out of stock, pending requests)
 * and quick-access links to key inventory management tasks and the unavailable items panel.
 */
export const InventoryOverviewPage: React.FC = () => {
  const { items, requests, addItem, requestStock } = useInventoryData()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)

  const totalItems = items.length
  const inStockCount = items.filter((i) => i.status === 'In Stock').length
  const lowStockCount = items.filter((i) => i.status === 'Low Stock').length
  const outOfStockCount = items.filter((i) => i.status === 'Out of Stock').length
  const criticalCount = lowStockCount + outOfStockCount
  const pendingRequests = requests.filter((r) => r.status === 'Pending Approval').length

  const quickLinks = [
    {
      to: '/inventory-management/all',
      label: 'All Stock Directory',
      desc: 'Browse complete catalog, item categories, and store shelves.',
      tag: `${totalItems} Items`,
    },
    {
      to: '/inventory-management/usage',
      label: 'Record Stock Consumption',
      desc: 'Log item usage against departments with automated stock reduction.',
      tag: 'Store Registry',
    },
    {
      to: '/inventory-management/request',
      label: 'Stock Replenishment Request',
      desc: 'Submit official store replenishment requisitions for manager review.',
      tag: 'Requisitions',
    },
    {
      to: '/inventory-management/approve',
      label: 'Administrative Approvals Desk',
      desc: 'Review, authorize or decline departmental stock purchase requests.',
      tag: `${pendingRequests} Pending`,
      highlight: pendingRequests > 0,
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Municipal Inventory & Stores Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real-time stock monitoring, departmental usage tracking, and supply replenishment register.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-4 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <AddIcon />
            <span>+ Add New Item</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRequestModalOpen(true)}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <AddIcon />
            <span>Request Stock</span>
          </button>

          <button
            type="button"
            onClick={() => alert('Exporting INVENTORY_SUMMARY.csv...')}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ExportIcon />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── 4 KPI Summary Cards (Matching Standard Design System) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Inventory Items */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Total Catalog Items
            </span>
            <StorageCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {totalItems}
            </p>
            <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Active Stores
            </span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-3 overflow-hidden">
            <div className="bg-[#1e3a8a] h-1.5 rounded-sm transition-all duration-1000" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Card 2: Safe In-Stock Items */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Adequate Stock Level
            </span>
            <InStockCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tracking-tight">
              {inStockCount}
            </p>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Safe Inventory
            </span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-sm transition-all duration-1000"
              style={{ width: `${totalItems > 0 ? (inStockCount / totalItems) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Card 3: Critical / Reorder Needed */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Critical & Reorder Due
            </span>
            <AlertCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-800 tracking-tight">
              {criticalCount}
            </p>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
              outOfStockCount > 0
                ? 'text-red-800 bg-red-50 border-red-200'
                : 'text-amber-800 bg-amber-50 border-amber-200'
            }`}>
              {outOfStockCount > 0 ? `${outOfStockCount} Out of Stock` : 'Low Stock Alert'}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-3 overflow-hidden">
            <div
              className={`h-1.5 rounded-sm transition-all duration-1000 ${outOfStockCount > 0 ? 'bg-red-600' : 'bg-amber-500'}`}
              style={{ width: `${totalItems > 0 ? (criticalCount / totalItems) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Card 4: Pending Approvals */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Pending Requisitions
            </span>
            <PendingCardIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-900 tracking-tight">
              {pendingRequests}
            </p>
            <span className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Action Required
            </span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-sm mt-3 overflow-hidden">
            <div
              className="bg-[#7e22ce] h-1.5 rounded-sm transition-all duration-1000"
              style={{ width: `${pendingRequests > 0 ? Math.min(pendingRequests * 25, 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Quick Access Desk ── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Inventory Operations & Desk Navigation
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Direct access to stock registers, daily consumption logs, and manager approvals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-5">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="p-4 rounded border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-[#A31736] transition-all shadow-3xs flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider group-hover:text-[#A31736] transition-colors">
                    {link.label}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      link.highlight
                        ? 'bg-amber-50 text-amber-800 border-amber-200 font-extrabold'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {link.tag}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{link.desc}</p>
              </div>
              <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-end text-xs font-bold text-[#1e3a8a] group-hover:text-[#A31736] transition-colors">
                Open Workspace &rarr;
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Critical Attention Table ── */}
      <UnavailableItemsPanel items={items} showViewAllLink={true} />

      {/* ── Modals ── */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addItem}
      />

      <RequestStockModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={requestStock}
      />
    </div>
  )
}

export default InventoryOverviewPage

