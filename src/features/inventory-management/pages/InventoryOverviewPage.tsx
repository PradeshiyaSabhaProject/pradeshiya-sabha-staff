import React from 'react'
import { Link } from 'react-router-dom'
import { useInventoryData } from '../hooks/useInventoryData'
import { UnavailableItemsPanel } from '../components/UnavailableItemsPanel'

/**
 * Dashboard landing page showing inventory statistics (total items, low stock, out of stock, pending requests)
 * and quick-access links to key inventory management tasks and the unavailable items panel.
 */
export const InventoryOverviewPage: React.FC = () => {
  const { items, requests } = useInventoryData()

  const totalItems = items.length
  const lowStockCount = items.filter((i) => i.status === 'Low Stock').length
  const outOfStockCount = items.filter((i) => i.status === 'Out of Stock').length
  const pendingRequests = requests.filter((r) => r.status === 'Pending Approval').length

  const cards = [
    { label: 'Total Inventory Items', value: totalItems, accent: 'text-[#0f172a]', bg: 'bg-white' },
    { label: 'Low Stock Items', value: lowStockCount, accent: 'text-orange-700', bg: 'bg-orange-50' },
    { label: 'Out of Stock Items', value: outOfStockCount, accent: 'text-[#A31736]', bg: 'bg-red-50' },
    { label: 'Pending Requests', value: pendingRequests, accent: 'text-amber-700', bg: 'bg-amber-50' },
  ]

  const quickLinks = [
    { to: '/inventory-management/all', label: 'All Inventory', desc: 'Browse full stock list' },
    { to: '/inventory-management/usage', label: 'Stock Usage', desc: 'Record item consumption' },
    { to: '/inventory-management/request', label: 'Request Stock', desc: 'Ask for replenishment' },
    { to: '/inventory-management/approve', label: 'Approvals', desc: 'Review pending requests' },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-[26px] font-extrabold text-[#0f172a] tracking-tight">
          Inventory Management Overview
        </h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">
          Monitor office stock levels, track usage, and manage stock requests across all
          departments.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} rounded border border-gray-300 shadow-sm p-5`}
          >
            <p className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
              {card.label}
            </p>
            <p className={`text-3xl font-black mt-2 ${card.accent}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Quick Access</h2>
          <p className="text-xs text-gray-500">Jump straight to a task</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="p-4 rounded border border-gray-300 bg-gray-50/60 hover:bg-gray-50 hover:border-[#A31736]/40 transition-all"
            >
              <h3 className="text-sm font-bold text-gray-900">{link.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <UnavailableItemsPanel items={items} />
    </div>
  )
}

export default InventoryOverviewPage
