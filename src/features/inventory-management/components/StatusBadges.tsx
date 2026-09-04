import React from 'react'
import type { ApprovalStatus, ItemStatus } from '../data/initialInventoryData'

const ITEM_STATUS_STYLES: Record<ItemStatus, string> = {
  'In Stock': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Low Stock': 'bg-orange-50 text-orange-700 border-orange-200',
  'Out of Stock': 'bg-red-50 text-[#A31736] border-red-200',
}

const APPROVAL_STATUS_STYLES: Record<ApprovalStatus, string> = {
  'Pending Approval': 'bg-amber-50 text-amber-700 border-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-red-50 text-[#A31736] border-red-200',
}

/** Displays item stock status (In Stock, Low Stock, Out of Stock) as a styled badge. */
export const ItemStatusBadge: React.FC<{ status: ItemStatus }> = ({ status }) => (
  <span
    className={`text-[11px] px-2.5 py-0.5 rounded border uppercase tracking-wider font-semibold whitespace-nowrap ${ITEM_STATUS_STYLES[status]}`}
  >
    {status}
  </span>
)

/** Displays request approval status (Pending Approval, Approved, Rejected) as a styled badge. */
export const ApprovalStatusBadge: React.FC<{ status: ApprovalStatus }> = ({ status }) => (
  <span
    className={`text-[11px] px-2.5 py-0.5 rounded border uppercase tracking-wider font-semibold whitespace-nowrap ${APPROVAL_STATUS_STYLES[status]}`}
  >
    {status}
  </span>
)
