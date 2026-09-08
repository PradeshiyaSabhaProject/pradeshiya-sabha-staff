import React from 'react'
import type { ApprovalStatus, ItemStatus } from '../data/initialInventoryData'

const ITEM_STATUS_STYLES: Record<ItemStatus, string> = {
  'In Stock': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Low Stock': 'bg-amber-50 text-amber-800 border-amber-200',
  'Out of Stock': 'bg-red-50 text-red-800 border-red-200 font-bold',
}

const APPROVAL_STATUS_STYLES: Record<ApprovalStatus, string> = {
  'Pending Approval': 'bg-amber-50 text-amber-800 border-amber-200',
  Approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Rejected: 'bg-red-50 text-red-800 border-red-200 font-bold',
}

/** Displays item stock status (In Stock, Low Stock, Out of Stock) as a styled badge. */
export const ItemStatusBadge: React.FC<{ status: ItemStatus }> = ({ status }) => (
  <span
    className={`text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wide inline-block border ${ITEM_STATUS_STYLES[status] || 'bg-gray-50 text-gray-700 border-gray-300'}`}
  >
    {status}
  </span>
)

/** Displays request approval status (Pending Approval, Approved, Rejected) as a styled badge. */
export const ApprovalStatusBadge: React.FC<{ status: ApprovalStatus }> = ({ status }) => (
  <span
    className={`text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wide inline-block border ${APPROVAL_STATUS_STYLES[status] || 'bg-gray-50 text-gray-700 border-gray-300'}`}
  >
    {status}
  </span>
)

