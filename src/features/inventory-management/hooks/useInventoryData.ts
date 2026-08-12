import { useEffect, useState } from 'react'
import {
  computeItemStatus,
  INITIAL_ITEMS,
  INITIAL_REQUESTS,
  type InventoryApprovalRequest,
  type InventoryItemRecord,
  type UsageLog,
} from '../data/initialInventoryData'

const STORAGE_KEY = 'pradeshiya_inventory_data_v2'

interface StoredData {
  items?: InventoryItemRecord[]
  requests?: InventoryApprovalRequest[]
}

function getInitialData(): { items: InventoryItemRecord[]; requests: InventoryApprovalRequest[] } {
  if (typeof window === 'undefined') {
    return { items: INITIAL_ITEMS, requests: INITIAL_REQUESTS }
  }

  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (!saved) {
    return { items: INITIAL_ITEMS, requests: INITIAL_REQUESTS }
  }

  try {
    const parsed = JSON.parse(saved) as StoredData
    return {
      items: parsed.items?.length ? parsed.items : INITIAL_ITEMS,
      requests: parsed.requests?.length ? parsed.requests : INITIAL_REQUESTS,
    }
  } catch {
    return { items: INITIAL_ITEMS, requests: INITIAL_REQUESTS }
  }
}

export const useInventoryData = () => {
  const [items, setItems] = useState<InventoryItemRecord[]>(() => getInitialData().items)
  const [requests, setRequests] = useState<InventoryApprovalRequest[]>(
    () => getInitialData().requests,
  )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, requests }))
    }
  }, [items, requests])

  /** Records usage of an item, reducing its available quantity and recalculating status. */
  const recordUsage = (
    itemId: string,
    details: { quantityUsed: number; usedBy: string; department: string; notes: string },
  ): InventoryItemRecord | null => {
    const target = items.find((item) => item.id === itemId)
    if (!target || details.quantityUsed <= 0 || target.quantityAvailable < details.quantityUsed) {
      return null
    }

    const today = new Date().toISOString().slice(0, 10)
    const newQuantity = target.quantityAvailable - details.quantityUsed

    const usageEntry: UsageLog = {
      id: `USG-${Date.now()}`,
      itemId,
      quantityUsed: details.quantityUsed,
      usedBy: details.usedBy,
      department: details.department,
      notes: details.notes,
      usedAt: today,
    }

    let updated: InventoryItemRecord | null = null
    setItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item
        updated = {
          ...item,
          quantityAvailable: newQuantity,
          status: computeItemStatus(newQuantity, item.reorderLevel),
          lastUpdated: today,
          usageHistory: [usageEntry, ...item.usageHistory],
        }
        return updated
      }),
    )

    return updated
  }

  /** Creates a new pending stock request. */
  const requestStock = (details: {
    itemName: string
    quantityRequested: number
    reason: string
    requestedBy: string
  }): InventoryApprovalRequest => {
    const newRequest: InventoryApprovalRequest = {
      id: `req-${Date.now()}`,
      requestNumber: `INV-REQ-2026-${String(requests.length + 1).padStart(3, '0')}`,
      itemName: details.itemName,
      quantityRequested: details.quantityRequested,
      reason: details.reason,
      requestedBy: details.requestedBy,
      requestedAt: new Date().toISOString().slice(0, 10),
      status: 'Pending Approval',
      requiredApproverRole: 'Administrative Officer',
    }

    setRequests((current) => [newRequest, ...current])
    return newRequest
  }

  /**
   * Approves a pending request. If an item with a matching name already
   * exists, its stock is increased by the requested quantity. Otherwise the
   * request is simply marked approved (a real backend would create the item).
   */
  const approveRequest = (requestId: string, approverName: string) => {
    const request = requests.find((r) => r.id === requestId)
    if (!request) return

    const today = new Date().toISOString().slice(0, 10)

    setItems((current) =>
      current.map((item) => {
        if (item.name.toLowerCase() !== request.itemName.toLowerCase()) return item
        const newQuantity = item.quantityAvailable + request.quantityRequested
        return {
          ...item,
          quantityAvailable: newQuantity,
          status: computeItemStatus(newQuantity, item.reorderLevel),
          lastUpdated: today,
        }
      }),
    )

    setRequests((current) =>
      current.map((r) =>
        r.id === requestId
          ? { ...r, status: 'Approved', approverName, approvedAt: today }
          : r,
      ),
    )
  }

  /** Rejects a pending request with a reason. */
  const rejectRequest = (requestId: string, rejectionReason: string) => {
    setRequests((current) =>
      current.map((r) => (r.id === requestId ? { ...r, status: 'Rejected', rejectionReason } : r)),
    )
  }

  return {
    items,
    requests,
    recordUsage,
    requestStock,
    approveRequest,
    rejectRequest,
  }
}
