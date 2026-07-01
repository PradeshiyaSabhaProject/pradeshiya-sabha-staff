import { useState, useEffect } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Dummy Data
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiStat {
  id: string
  label: string
  value: string | number
  subText: string
  icon: string
  color: string
  isPositive: boolean
  change: string
}

export interface Appointment {
  id: string
  time: string
  citizenName: string
  type: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  officer: string
}

export interface Complaint {
  id: string
  ticketNo: string
  citizenName: string
  category: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  submittedAt: string
  assignedTo: string
}

export interface Notice {
  id: string
  title: string
  body: string
  type: 'circular' | 'gazette' | 'urgent' | 'general'
  postedAt: string
}

export interface ActivityLog {
  id: string
  user: string
  action: string
  target: string
  timestamp: string
}

export interface TaskInboxItem {
  id: string
  refId: string
  department: string
  subject: string
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface DepartmentHealthItem {
  id: string
  department: string
  loadPercent: number
  barColor: string
  textColor: string
}

export interface QuickReportItem {
  id: string
  title: string
  subtitle: string
  icon: 'summary' | 'review'
}

const KPI_STATS: KpiStat[] = [
  {
    id: '1',
    label: 'Total Pending Approvals',
    value: 142,
    subText: '+12% from yesterday',
    icon: 'clipboard',
    color: '#1e3a8a',
    isPositive: true,
    change: '+12% from yesterday',
  },
  {
    id: '2',
    label: 'System Efficiency %',
    value: '94.8%',
    subText: 'Target: 92.0%',
    icon: 'gauge',
    color: '#1e3a8a',
    isPositive: true,
    change: 'Target: 92.0%',
  },
  {
    id: '3',
    label: 'Citizen Satisfaction Score',
    value: '4.2/5',
    subText: 'Based on 1.2k surveys',
    icon: 'smile',
    color: '#1e3a8a',
    isPositive: true,
    change: 'Based on 1.2k surveys',
  },
  {
    id: '4',
    label: 'Active Field Units',
    value: 18,
    subText: '7 units in Homagama Town',
    icon: 'users',
    color: '#1e3a8a',
    isPositive: true,
    change: '7 units in Homagama Town',
  },
]

const APPOINTMENTS: Appointment[] = [
  { id: 'a1', time: '08:30', citizenName: 'Kamal Perera', type: 'Property Transfer', status: 'completed', officer: 'Dev Admin' },
  { id: 'a2', time: '09:00', citizenName: 'Nimali Fernando', type: 'Building Permit', status: 'completed', officer: 'Staff Member' },
  { id: 'a3', time: '10:00', citizenName: 'Saman Jayasinghe', type: 'Business Registration', status: 'confirmed', officer: 'Dev Admin' },
  { id: 'a4', time: '11:30', citizenName: 'Chamari Silva', type: 'Complaint Follow-up', status: 'confirmed', officer: 'Staff Member' },
  { id: 'a5', time: '14:00', citizenName: 'Ruwan Weerasekara', type: 'Utility Connection', status: 'pending', officer: 'Dev Admin' },
  { id: 'a6', time: '15:30', citizenName: 'Dilini Rajapaksa', type: 'Marriage Certificate', status: 'pending', officer: 'Staff Member' },
]

const COMPLAINTS: Complaint[] = [
  { id: 'c1', ticketNo: 'CPL-2024-0189', citizenName: 'Asanka Bandara', category: 'Road Damage', status: 'open', submittedAt: '2 hours ago', assignedTo: 'Dev Admin' },
  { id: 'c2', ticketNo: 'CPL-2024-0188', citizenName: 'Manel Gunawardena', category: 'Street Lighting', status: 'in-progress', submittedAt: '5 hours ago', assignedTo: 'Staff Member' },
  { id: 'c3', ticketNo: 'CPL-2024-0185', citizenName: 'Priya Kumari', category: 'Garbage Collection', status: 'in-progress', submittedAt: '1 day ago', assignedTo: 'Staff Member' },
  { id: 'c4', ticketNo: 'CPL-2024-0182', citizenName: 'Nimal Dissanayake', category: 'Drainage Issue', status: 'resolved', submittedAt: '2 days ago', assignedTo: 'Dev Admin' },
  { id: 'c5', ticketNo: 'CPL-2024-0179', citizenName: 'Sandya Wijesinghe', category: 'Noise Complaint', status: 'open', submittedAt: '3 days ago', assignedTo: 'Dev Admin' },
]

const NOTICES: Notice[] = [
  { id: 'n1', title: 'Annual Performance Review', body: 'All staff are required to submit their annual performance self-assessment forms by July 15, 2024.', type: 'circular', postedAt: 'Today, 9:00 AM' },
  { id: 'n2', title: 'Public Holiday — Poson Poya', body: 'The office will remain closed on June 22, 2024 in observance of Poson Poya Day.', type: 'general', postedAt: 'Yesterday' },
  { id: 'n3', title: 'Urgent: Water Supply Interruption', body: 'Scheduled maintenance will interrupt water supply in Wards 4, 7 and 9 from 08:00–16:00 on July 5.', type: 'urgent', postedAt: '2 days ago' },
  { id: 'n4', title: 'Gazette — Local Government Amendment', body: 'The Local Government (Amendment) Act No. 15 of 2024 has been gazetted. Review provisions applicable to Pradeshiya Sabhas.', type: 'gazette', postedAt: '3 days ago' },
]

const ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'l1', user: 'Dev Admin', action: 'Approved', target: 'Building Permit #BP-2204', timestamp: '10 mins ago' },
  { id: 'l2', user: 'Staff Member', action: 'Updated status on', target: 'Complaint CPL-2024-0188', timestamp: '25 mins ago' },
  { id: 'l3', user: 'Dev Admin', action: 'Scheduled appointment for', target: 'Ruwan Weerasekara (15:30)', timestamp: '1 hour ago' },
  { id: 'l4', user: 'Staff Member', action: 'Sent letter to', target: 'Ministry of Local Government', timestamp: '2 hours ago' },
  { id: 'l5', user: 'Dev Admin', action: 'Created asset issue report for', target: 'Road Crack — Main St Ward 3', timestamp: '3 hours ago' },
]

const TASK_INBOX: TaskInboxItem[] = [
  { id: 't1', refId: '#HPS-2201', department: 'Planning', subject: 'Boundary Wall Construction Approval - Pitipana', priority: 'URGENT' },
  { id: 't2', refId: '#HPS-2202', department: 'Revenue', subject: 'Commercial Tax Appeal: Block B-42 Retail', priority: 'MEDIUM' },
  { id: 't3', refId: '#HPS-2203', department: 'Health', subject: 'Sanitation Inspection Report - Public Market', priority: 'HIGH' },
  { id: 't4', refId: '#HPS-2204', department: 'Engineering', subject: 'Road Maintenance Request: High Level Rd Junction', priority: 'MEDIUM' },
  { id: 't5', refId: '#HPS-2205', department: 'Admin', subject: 'Quarterly Budget Review Preparation', priority: 'LOW' },
  { id: 't6', refId: '#HPS-2206', department: 'Planning', subject: 'Industrial Zone Expansion Proposal Review', priority: 'HIGH' },
]

const DEPARTMENT_HEALTH: DepartmentHealthItem[] = [
  { id: 'dh1', department: 'Planning', loadPercent: 88, barColor: 'bg-[#dc2626]', textColor: 'text-red-600' },
  { id: 'dh2', department: 'Revenue', loadPercent: 62, barColor: 'bg-[#f97316]', textColor: 'text-orange-500' },
  { id: 'dh3', department: 'Health', loadPercent: 45, barColor: 'bg-[#1e3a8a]', textColor: 'text-[#1e3a8a]' },
]

const QUICK_REPORTS: QuickReportItem[] = [
  { id: 'qr1', title: 'Weekly Executive Summary', subtitle: 'Last updated 2 days ago', icon: 'summary' },
  { id: 'qr2', title: 'Monthly Financial Review', subtitle: 'Available for Download', icon: 'review' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useDashboardData() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  return {
    loading,
    kpiStats: KPI_STATS,
    appointments: APPOINTMENTS,
    complaints: COMPLAINTS,
    notices: NOTICES,
    activityLogs: ACTIVITY_LOGS,
    taskInbox: TASK_INBOX,
    departmentHealth: DEPARTMENT_HEALTH,
    quickReports: QUICK_REPORTS,
  }
}
