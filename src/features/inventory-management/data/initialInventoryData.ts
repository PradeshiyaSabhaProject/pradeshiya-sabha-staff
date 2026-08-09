export type ItemCategory =
  | 'Office Supplies'
  | 'Utilities'
  | 'Facilities'
  | 'IT Equipment'
  | 'Safety Equipment'

export type ItemStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

export interface UsageLog {
  id: string
  itemId: string
  quantityUsed: number
  usedBy: string
  department: string
  notes: string
  usedAt: string
}

export interface InventoryItemRecord {
  id: string
  itemCode: string // e.g. "INV-0021"
  name: string
  category: ItemCategory
  department: string // owning department/store
  unit: string // e.g. "Reams", "Boxes", "Litres"
  quantityAvailable: number
  reorderLevel: number // status becomes "Low Stock" at/below this
  maxStock: number // baseline used to visualize the availability bar
  location: string
  status: ItemStatus
  lastUpdated: string
  usageHistory: UsageLog[]
}

export type ApprovalStatus = 'Pending Approval' | 'Approved' | 'Rejected'

export interface InventoryApprovalRequest {
  id: string
  requestNumber: string // e.g. "INV-REQ-2026-001"
  itemName: string
  quantityRequested: number
  reason: string
  requestedBy: string
  requestedAt: string
  status: ApprovalStatus
  requiredApproverRole: string
  approverName?: string
  approvedAt?: string
  rejectionReason?: string
}

/** Derives the display status from current quantity vs reorder level. */
export function computeItemStatus(quantityAvailable: number, reorderLevel: number): ItemStatus {
  if (quantityAvailable <= 0) return 'Out of Stock'
  if (quantityAvailable <= reorderLevel) return 'Low Stock'
  return 'In Stock'
}

export const INITIAL_ITEMS: InventoryItemRecord[] = [
  {
    id: 'inv-001',
    itemCode: 'INV-0001',
    name: 'Printer Paper A4',
    category: 'Office Supplies',
    department: 'Administration',
    unit: 'Reams',
    quantityAvailable: 120,
    reorderLevel: 40,
    maxStock: 200,
    location: 'Store Room 1 - Shelf A2',
    status: computeItemStatus(120, 40),
    lastUpdated: '2026-08-08',
    usageHistory: [
      {
        id: 'USG-1001',
        itemId: 'inv-001',
        quantityUsed: 30,
        usedBy: 'Nimali Perera',
        department: 'Administration',
        notes: 'Monthly council meeting document printing.',
        usedAt: '2026-08-01',
      },
    ],
  },
  {
    id: 'inv-002',
    itemCode: 'INV-0002',
    name: 'Ballpoint Pens',
    category: 'Office Supplies',
    department: 'Administration',
    unit: 'Boxes',
    quantityAvailable: 35,
    reorderLevel: 30,
    maxStock: 100,
    location: 'Front Desk Cabinet',
    status: computeItemStatus(35, 30),
    lastUpdated: '2026-08-07',
    usageHistory: [],
  },
  {
    id: 'inv-003',
    itemCode: 'INV-0003',
    name: 'Generator Fuel (Diesel)',
    category: 'Utilities',
    department: 'Works & Engineering',
    unit: 'Litres',
    quantityAvailable: 40,
    reorderLevel: 50,
    maxStock: 300,
    location: 'Generator Yard - Tank 1',
    status: computeItemStatus(40, 50),
    lastUpdated: '2026-08-06',
    usageHistory: [
      {
        id: 'USG-1002',
        itemId: 'inv-003',
        quantityUsed: 60,
        usedBy: 'S.M. Bandara',
        department: 'Works & Engineering',
        notes: 'Backup generator run during power outage.',
        usedAt: '2026-08-04',
      },
    ],
  },
  {
    id: 'inv-004',
    itemCode: 'INV-0004',
    name: 'Cleaning Disinfectant',
    category: 'Facilities',
    department: 'Maintenance',
    unit: 'Bottles',
    quantityAvailable: 18,
    reorderLevel: 20,
    maxStock: 60,
    location: 'Maintenance Store',
    status: computeItemStatus(18, 20),
    lastUpdated: '2026-08-05',
    usageHistory: [],
  },
  {
    id: 'inv-005',
    itemCode: 'INV-0005',
    name: 'Printer Toner Cartridge (Black)',
    category: 'IT Equipment',
    department: 'IT & Systems',
    unit: 'Units',
    quantityAvailable: 3,
    reorderLevel: 5,
    maxStock: 20,
    location: 'IT Store Room',
    status: computeItemStatus(3, 5),
    lastUpdated: '2026-08-08',
    usageHistory: [
      {
        id: 'USG-1003',
        itemId: 'inv-005',
        quantityUsed: 2,
        usedBy: 'K.A. Dissanayake',
        department: 'IT & Systems',
        notes: 'Replaced empty cartridges in registry printer.',
        usedAt: '2026-08-07',
      },
    ],
  },
  {
    id: 'inv-006',
    itemCode: 'INV-0006',
    name: 'First Aid Kits',
    category: 'Safety Equipment',
    department: 'Health & Safety',
    unit: 'Kits',
    quantityAvailable: 0,
    reorderLevel: 4,
    maxStock: 15,
    location: 'Safety Store - Rack 3',
    status: computeItemStatus(0, 4),
    lastUpdated: '2026-08-02',
    usageHistory: [
      {
        id: 'USG-1004',
        itemId: 'inv-006',
        quantityUsed: 6,
        usedBy: 'Health & Safety Officer',
        department: 'Health & Safety',
        notes: 'Distributed to field maintenance teams.',
        usedAt: '2026-08-02',
      },
    ],
  },
]

export const INITIAL_REQUESTS: InventoryApprovalRequest[] = [
  {
    id: 'req-001',
    requestNumber: 'INV-REQ-2026-014',
    itemName: 'Printer Toner Cartridge (Black)',
    quantityRequested: 10,
    reason: 'Stock is critically low (3 remaining) and multiple departments print daily.',
    requestedBy: 'Nimali Perera',
    requestedAt: '2026-08-08',
    status: 'Pending Approval',
    requiredApproverRole: 'Administrative Officer',
  },
  {
    id: 'req-002',
    requestNumber: 'INV-REQ-2026-013',
    itemName: 'First Aid Kits',
    quantityRequested: 8,
    reason: 'Out of stock — required for field maintenance and sanitation teams.',
    requestedBy: 'Health & Safety Officer',
    requestedAt: '2026-08-07',
    status: 'Pending Approval',
    requiredApproverRole: 'Administrative Officer',
  },
  {
    id: 'req-003',
    requestNumber: 'INV-REQ-2026-009',
    itemName: 'Cleaning Disinfectant',
    quantityRequested: 24,
    reason: 'Restocking ahead of monsoon season sanitation drive.',
    requestedBy: 'Maintenance Supervisor',
    requestedAt: '2026-07-28',
    status: 'Approved',
    requiredApproverRole: 'Administrative Officer',
    approverName: 'Eng. H.L. Jayawardena',
    approvedAt: '2026-07-29',
  },
]
