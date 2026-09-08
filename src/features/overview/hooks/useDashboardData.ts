import { useState, useEffect } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiStat {
  id: string
  label: string
  value: string | number
  subText: string
  icon: 'clipboard' | 'gauge' | 'smile' | 'users' | 'fleet' | 'inventory' | 'calendar' | 'building'
  color: string
  isPositive: boolean
  change: string
  link: string
  trendBadge?: string
}

export interface TaskInboxItem {
  id: string
  refId: string
  module: 'applications' | 'complaints' | 'letters' | 'inventory' | 'fleet' | 'bookings'
  department: string
  subject: string
  citizenOrRequester: string
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'PENDING REVIEW' | 'IN PROGRESS' | 'AWAITING APPROVAL' | 'FIELD DISPATCHED' | 'INSPECTION DUE'
  submittedAt: string
  actionLabel: string
  actionLink: string
}

export interface Appointment {
  id: string
  refNo: string
  time: string
  citizenName: string
  nic: string
  serviceType: string
  status: 'confirmed' | 'pending' | 'completed' | 'in-progress'
  officer: string
  ward: string
}

export interface FacilityBookingItem {
  id: string
  bookingRef: string
  facilityName: string
  applicantName: string
  bookingDate: string
  timeSlot: string
  status: 'Approved' | 'Pending Payment' | 'Under Review'
  amount: string
}

export interface LowStockAlertItem {
  id: string
  itemCode: string
  name: string
  category: string
  currentStock: number
  reorderLevel: number
  unit: string
  status: 'Critical' | 'Low'
}

export interface FleetLiveStatus {
  totalVehicles: number
  onField: number
  available: number
  inMaintenance: number
  activeDispatchesToday: number
}

export interface Notice {
  id: string
  title: string
  body: string
  type: 'circular' | 'gazette' | 'urgent' | 'general'
  postedAt: string
  department: string
}

export interface ActivityLog {
  id: string
  user: string
  role: string
  action: string
  target: string
  timestamp: string
  category: 'permits' | 'complaints' | 'letters' | 'inventory' | 'fleet' | 'attendance'
}

export interface DepartmentHealthItem {
  id: string
  department: string
  activeCases: number
  completedToday: number
  loadPercent: number
  barColor: string
  textColor: string
  status: 'Optimal' | 'Heavy' | 'Overload' | 'Normal'
}

// ─────────────────────────────────────────────────────────────────────────────
// Initial Data Sets
// ─────────────────────────────────────────────────────────────────────────────

const KPI_STATS: KpiStat[] = [
  {
    id: 'kpi-1',
    label: 'Pending Approvals & Permits',
    value: 38,
    subText: '14 urgent building permits & trade files',
    icon: 'clipboard',
    color: '#A31736',
    isPositive: false,
    change: '+6 today',
    link: '/applications/all',
    trendBadge: 'High Priority',
  },
  {
    id: 'kpi-2',
    label: 'Citizen Grievances Active',
    value: 24,
    subText: '19 assigned, 5 awaiting field dispatch',
    icon: 'smile',
    color: '#ea580c',
    isPositive: true,
    change: '8 resolved today',
    link: '/complaints/all',
    trendBadge: '78% Resolution Rate',
  },
  {
    id: 'kpi-3',
    label: 'Active Municipal Fleet',
    value: '16 / 22',
    subText: '4 garbage compactors, 6 bowsers in wards',
    icon: 'fleet',
    color: '#0284c7',
    isPositive: true,
    change: '2 in workshop maintenance',
    link: '/fleet/overview',
    trendBadge: '73% Utilization',
  },
  {
    id: 'kpi-4',
    label: 'Staff Attendance Today',
    value: '94.2%',
    subText: '138 of 146 biometric check-ins confirmed',
    icon: 'users',
    color: '#16a34a',
    isPositive: true,
    change: '4 on approved leave',
    link: '/attendance/dashboard',
    trendBadge: 'On Target',
  },
]

const TASK_INBOX: TaskInboxItem[] = [
  {
    id: 't1',
    refId: 'APP-2026-0842',
    module: 'applications',
    department: 'Planning & Building',
    subject: 'Commercial Building Construction Permit (G+3 Floors) - Pitipana South',
    citizenOrRequester: 'K. S. Dissanayake',
    priority: 'URGENT',
    status: 'INSPECTION DUE',
    submittedAt: 'Today, 08:15 AM',
    actionLabel: 'Review Permit',
    actionLink: '/applications/all',
  },
  {
    id: 't2',
    refId: 'CPL-2026-0194',
    module: 'complaints',
    department: 'Health & Sanitation',
    subject: 'Blocked Main Stormwater Drainage & Mosquito Breeding near Ward 05',
    citizenOrRequester: 'Mrs. Rohini Senanayake',
    priority: 'URGENT',
    status: 'FIELD DISPATCHED',
    submittedAt: 'Today, 07:45 AM',
    actionLabel: 'View Ticket',
    actionLink: '/complaints/all',
  },
  {
    id: 't3',
    refId: 'LET-IN-2026-0412',
    module: 'letters',
    department: 'Administration',
    subject: 'Ministry Circular: Decentralized Road Development Budget Allocation',
    citizenOrRequester: 'Ministry of Provincial Councils',
    priority: 'HIGH',
    status: 'PENDING REVIEW',
    submittedAt: 'Yesterday, 04:30 PM',
    actionLabel: 'Open Letter',
    actionLink: '/letters/inward',
  },
  {
    id: 't4',
    refId: 'REQ-2026-0089',
    module: 'inventory',
    department: 'Works & Engineering',
    subject: 'Urgent Material Requisition: 50 bags Portland Cement & Bitumen Tar',
    citizenOrRequester: 'Works Supervisor (N. Alwis)',
    priority: 'HIGH',
    status: 'AWAITING APPROVAL',
    submittedAt: 'Today, 08:30 AM',
    actionLabel: 'Approve Stock',
    actionLink: '/inventory-management/approve',
  },
  {
    id: 't5',
    refId: 'FLT-DIS-0312',
    module: 'fleet',
    department: 'Solid Waste Division',
    subject: 'Route Deviation Alert & Driver Overtime Authorization - Tipper WP-LC-8412',
    citizenOrRequester: 'Transport Officer (M. Fernando)',
    priority: 'MEDIUM',
    status: 'IN PROGRESS',
    submittedAt: 'Today, 09:10 AM',
    actionLabel: 'Inspect Fleet',
    actionLink: '/fleet/dispatch',
  },
  {
    id: 't6',
    refId: 'BKG-2026-0051',
    module: 'bookings',
    department: 'Community Services',
    subject: 'Homagama Central Community Hall Reservation for Cultural Festival',
    citizenOrRequester: 'Sanjaya Rathnayake',
    priority: 'MEDIUM',
    status: 'PENDING REVIEW',
    submittedAt: 'Yesterday, 02:15 PM',
    actionLabel: 'Verify Booking',
    actionLink: '/bookings/approvals',
  },
  {
    id: 't7',
    refId: 'APP-2026-0839',
    module: 'applications',
    department: 'Revenue & Valuation',
    subject: 'Annual Trade License Renewal: Homagama Retail Grocers Association',
    citizenOrRequester: 'H. A. Premadasa',
    priority: 'LOW',
    status: 'IN PROGRESS',
    submittedAt: '2 days ago',
    actionLabel: 'Review File',
    actionLink: '/applications/all',
  },
]

const APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    refNo: 'APT-0941',
    time: '09:30 AM',
    citizenName: 'Kamal Bandara',
    nic: '741289541V',
    serviceType: 'Deed Registration & Street Line',
    status: 'in-progress',
    officer: 'Mr. Sarath Kumara (Planning Officer)',
    ward: 'Ward 03 - Homagama East',
  },
  {
    id: 'a2',
    refNo: 'APT-0942',
    time: '10:15 AM',
    citizenName: 'Nimali Fernando',
    nic: '885623145V',
    serviceType: 'Building Plan Clearance Verification',
    status: 'confirmed',
    officer: 'Eng. Priyantha Silva',
    ward: 'Ward 07 - Pitipana North',
  },
  {
    id: 'a3',
    refNo: 'APT-0943',
    time: '11:00 AM',
    citizenName: 'Sunil Jayawardena',
    nic: '652398412V',
    serviceType: 'Assessment Tax Appeal Hearing',
    status: 'confirmed',
    officer: 'Revenue Assessor',
    ward: 'Ward 02 - Town Centre',
  },
  {
    id: 'a4',
    refNo: 'APT-0944',
    time: '01:30 PM',
    citizenName: 'Damayanthi Perera',
    nic: '817456123V',
    serviceType: 'Public Health Certificate Inspection',
    status: 'pending',
    officer: 'Chief Public Health Inspector (PHI)',
    ward: 'Ward 09 - Meegoda',
  },
  {
    id: 'a5',
    refNo: 'APT-0945',
    time: '02:45 PM',
    citizenName: 'Ruwan Weerasekara',
    nic: '921547896V',
    serviceType: 'Gully Bowser Utility Service Order',
    status: 'pending',
    officer: 'Transport & Utility Desk',
    ward: 'Ward 04 - Katuwana',
  },
]

const FACILITY_BOOKINGS: FacilityBookingItem[] = [
  {
    id: 'b1',
    bookingRef: 'FB-2026-088',
    facilityName: 'Homagama Central Auditorium',
    applicantName: 'National Youth Council',
    bookingDate: '14 Sep 2026',
    timeSlot: '08:00 - 16:00',
    status: 'Approved',
    amount: 'LKR 45,000',
  },
  {
    id: 'b2',
    bookingRef: 'FB-2026-089',
    facilityName: 'Pitipana Community Sports Ground',
    applicantName: 'Western Province Cricket League',
    bookingDate: '18 Sep 2026',
    timeSlot: '07:30 - 18:30',
    status: 'Pending Payment',
    amount: 'LKR 18,500',
  },
  {
    id: 'b3',
    bookingRef: 'FB-2026-090',
    facilityName: 'Meegoda Public Reception Hall',
    applicantName: 'M. W. Wickremasinghe',
    bookingDate: '22 Sep 2026',
    timeSlot: '18:00 - 23:30',
    status: 'Under Review',
    amount: 'LKR 30,000',
  },
]

const LOW_STOCK_ALERTS: LowStockAlertItem[] = [
  {
    id: 'ls1',
    itemCode: 'ST-RDS-004',
    name: 'Cold Patch Asphalt / Bitumen Premix',
    category: 'Roads & Infrastructure',
    currentStock: 6,
    reorderLevel: 25,
    unit: 'Bags (50kg)',
    status: 'Critical',
  },
  {
    id: 'ls2',
    itemCode: 'ST-ELC-019',
    name: 'LED Street Light Bulbs 90W IP65',
    category: 'Electrical & Lighting',
    currentStock: 12,
    reorderLevel: 40,
    unit: 'Units',
    status: 'Low',
  },
  {
    id: 'ls3',
    itemCode: 'ST-SAN-008',
    name: 'Bleaching Powder & Disinfectant Solution',
    category: 'Health & Sanitation',
    currentStock: 8,
    reorderLevel: 30,
    unit: 'Drums (25kg)',
    status: 'Critical',
  },
]

const FLEET_STATUS: FleetLiveStatus = {
  totalVehicles: 22,
  onField: 16,
  available: 4,
  inMaintenance: 2,
  activeDispatchesToday: 28,
}

const NOTICES: Notice[] = [
  {
    id: 'n1',
    title: 'Urgent: Monsoon Pre-Sanitation Drainage Clearance Operations',
    body: 'All engineering & health field teams must clear priority drainage blockages along High-Level Road & Meegoda canal corridors before 15th Sep.',
    type: 'urgent',
    postedAt: 'Today, 08:00 AM',
    department: 'Engineering & Works',
  },
  {
    id: 'n2',
    title: 'Gazette Notice: Assessment Tax Revision Cycle 2026-2027',
    body: 'The revised commercial and residential rates assessments have been published. Rate collection desks should issue notices in Wards 1 to 10.',
    type: 'gazette',
    postedAt: 'Yesterday',
    department: 'Revenue & Finance',
  },
  {
    id: 'n3',
    title: 'Circular No. PS/2026/08 - Biometric Attendance Compliance',
    body: 'All department heads are instructed to verify and approve subordinate pending leave requests and timecard corrections by Friday.',
    type: 'circular',
    postedAt: '2 days ago',
    department: 'Administration',
  },
]

const ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'l1',
    user: 'Eng. Priyantha Silva',
    role: 'Chief Engineer',
    action: 'Approved Site Inspection Report for',
    target: 'Commercial Complex #APP-2026-0814',
    timestamp: '8 mins ago',
    category: 'permits',
  },
  {
    id: 'l2',
    user: 'K. Weerasinghe',
    role: 'PHI Officer',
    action: 'Dispatched health inspection team to',
    target: 'Homagama Central Market',
    timestamp: '22 mins ago',
    category: 'complaints',
  },
  {
    id: 'l3',
    user: 'M. Fernando',
    role: 'Transport Officer',
    action: 'Assigned Gully Bowser WP-NB-4412 to',
    target: 'Ward 04 Emergency Call',
    timestamp: '45 mins ago',
    category: 'fleet',
  },
  {
    id: 'l4',
    user: 'N. Alwis',
    role: 'Storekeeper',
    action: 'Submitted Stock Requisition #REQ-0089 for',
    target: 'Asphalt & Road Repair Materials',
    timestamp: '1 hour ago',
    category: 'inventory',
  },
  {
    id: 'l5',
    user: 'Dev Admin',
    role: 'Council Secretary',
    action: 'Forwarded Ministry Inward Letter #LET-0412 to',
    target: 'Finance Committee',
    timestamp: '2 hours ago',
    category: 'letters',
  },
]

const DEPARTMENT_HEALTH: DepartmentHealthItem[] = [
  {
    id: 'dh1',
    department: 'Planning & Building Permits',
    activeCases: 42,
    completedToday: 11,
    loadPercent: 88,
    barColor: 'bg-[#dc2626]',
    textColor: 'text-red-600',
    status: 'Overload',
  },
  {
    id: 'dh2',
    department: 'Works & Infrastructure',
    activeCases: 29,
    completedToday: 14,
    loadPercent: 72,
    barColor: 'bg-[#f97316]',
    textColor: 'text-orange-500',
    status: 'Heavy',
  },
  {
    id: 'dh3',
    department: 'Health, PHI & Sanitation',
    activeCases: 19,
    completedToday: 18,
    loadPercent: 54,
    barColor: 'bg-[#0284c7]',
    textColor: 'text-sky-600',
    status: 'Normal',
  },
  {
    id: 'dh4',
    department: 'Revenue & Tax Assessment',
    activeCases: 15,
    completedToday: 26,
    loadPercent: 38,
    barColor: 'bg-[#16a34a]',
    textColor: 'text-green-600',
    status: 'Optimal',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Hook Implementation
// ─────────────────────────────────────────────────────────────────────────────

export function useDashboardData() {
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  const refreshData = () => {
    setLoading(true)
    setTimeout(() => {
      setLastRefreshed(new Date())
      setLoading(false)
    }, 400)
  }

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  return {
    loading,
    lastRefreshed,
    refreshData,
    kpiStats: KPI_STATS,
    taskInbox: TASK_INBOX,
    appointments: APPOINTMENTS,
    facilityBookings: FACILITY_BOOKINGS,
    lowStockAlerts: LOW_STOCK_ALERTS,
    fleetStatus: FLEET_STATUS,
    notices: NOTICES,
    activityLogs: ACTIVITY_LOGS,
    departmentHealth: DEPARTMENT_HEALTH,
  }
}
