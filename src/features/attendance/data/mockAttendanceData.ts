export interface BiometricLog {
  id: string
  employeeId: string
  employeeName: string
  designation: string
  department: string
  avatarUrl?: string
  checkIn: string
  checkOut: string
  date: string
  status: 'Present' | 'Late Entry' | 'Approved Leave' | 'Official Duty' | 'Missed Punch' | 'Absent' | 'Weekend Duty' | 'Overtime'
  workingHours: string
  overtimeHours?: string
  isWeekend?: boolean
  deviceLocation: string
  lateMinutes?: number
  isRegularized?: boolean
  shiftCode?: string
  shiftTiming?: string
  rosterCheckNote?: string
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  designation: string
  department: string
  avatarInitials?: string
  leaveType: 'Annual Leave' | 'Casual Leave' | 'Medical Leave' | 'Duty Leave' | 'Maternity Leave' | 'Compensatory Leave (Comp-Off)' | 'No-Pay Leave'
  startDate: string
  endDate: string
  daysCount: number
  reason: string
  handoverOfficer?: string
  appliedOn: string
  approvalLevels: {
    levelNumber: 1 | 2 | 3
    roleName: string
    approverName: string
    status: 'Approved' | 'Pending' | 'Rejected' | 'Waiting' | 'Cancelled'
    timestamp?: string
    comments?: string
  }[]
  overallStatus: 'Approved' | 'Pending Level 1' | 'Pending Level 2' | 'Pending Level 3' | 'Rejected (Unauthorized No-Pay Leave)' | 'Cancelled by Employee'
  isUnauthorizedNoPay?: boolean
  rejectionReason?: string
  rejectedBy?: string
  cancelledAt?: string
  cancellationReason?: string
}

export interface LeaveBalance {
  employeeId: string
  employeeName: string
  designation: string
  department: string
  casual: { total: number; used: number; remaining: number }
  annual: { total: number; used: number; remaining: number }
  medical: { total: number; used: number; remaining: number }
  duty: { total: number; used: number; remaining: number }
  compOff?: { total: number; used: number; remaining: number }
}

export interface RegularizationRequest {
  id: string
  employeeId: string
  employeeName: string
  department: string
  date: string
  reasonType: 'Forgot to Punch Out' | 'Forgot to Punch In' | 'Official Field Duty' | 'Biometric Machine Fault' | 'Weekend Duty Regularization' | 'Overtime Authorization'
  requestedCheckIn: string
  requestedCheckOut: string
  justification: string
  supervisorStatus: 'Pending' | 'Approved' | 'Rejected'
  supervisorName: string
  appliedDate: string
}

export interface HolidayItem {
  id: string
  date: string
  name: string
  type: 'Public Holiday' | 'Poya Day' | 'Council Special Holiday'
  dayOfWeek: string
}

export const MOCK_BIOMETRIC_LOGS: BiometricLog[] = [
  {
    id: 'BIO-101',
    employeeId: 'PS-EMP-0012',
    employeeName: 'Kasun Perera',
    designation: 'Senior Revenue Inspector',
    department: 'Revenue & Finance',
    checkIn: '08:22 AM',
    checkOut: '06:35 PM',
    date: '2026-07-10',
    status: 'Overtime',
    workingHours: '10h 13m',
    overtimeHours: '2h 00m',
    deviceLocation: 'Main Gate ZKTeco F18 #1',
    shiftCode: 'GEN',
    shiftTiming: '08:30 AM - 04:30 PM',
    rosterCheckNote: 'On time + 2h Overtime (Budget Preparation)'
  },
  {
    id: 'BIO-102',
    employeeId: 'PS-EMP-0019',
    employeeName: 'Nimali Fernando',
    designation: 'Subject Clerk (Engineering)',
    department: 'Works & Engineering',
    checkIn: '08:52 AM',
    checkOut: '04:30 PM',
    date: '2026-07-10',
    status: 'Late Entry',
    workingHours: '7h 38m',
    deviceLocation: 'Main Gate ZKTeco F18 #1',
    lateMinutes: 22,
    shiftCode: 'GEN',
    shiftTiming: '08:30 AM - 04:30 PM',
    rosterCheckNote: '+22m late against 08:30 AM GEN Roster'
  },
  {
    id: 'BIO-103',
    employeeId: 'PS-EMP-0041',
    employeeName: 'Chaminda Rathnayake',
    designation: 'Public Health Inspector (PHI)',
    department: 'Public Health & Sanitation',
    checkIn: '06:14 AM',
    checkOut: '02:05 PM',
    date: '2026-07-10',
    status: 'Late Entry',
    workingHours: '7h 51m',
    deviceLocation: 'Sanitation Depot Bio #3',
    lateMinutes: 14,
    shiftCode: 'MRN',
    shiftTiming: '06:00 AM - 02:00 PM',
    rosterCheckNote: '+14m late against 06:00 AM MRN Sanitation Roster'
  },
  {
    id: 'BIO-104',
    employeeId: 'PS-EMP-0084',
    employeeName: 'Ajith Kumara',
    designation: 'Health Overseer',
    department: 'Public Health & Sanitation',
    checkIn: '05:53 AM',
    checkOut: '02:08 PM',
    date: '2026-07-10',
    status: 'Present',
    workingHours: '8h 15m',
    deviceLocation: 'Sanitation Depot Bio #3',
    shiftCode: 'MRN',
    shiftTiming: '06:00 AM - 02:00 PM',
    rosterCheckNote: 'On time against MRN Early Morning Roster'
  },
  {
    id: 'BIO-105',
    employeeId: 'PS-EMP-0063',
    employeeName: 'Sunil Ariyaratne',
    designation: 'Security Supervisor',
    department: 'Municipal Security Desk',
    checkIn: '09:48 PM',
    checkOut: '06:02 AM',
    date: '2026-07-10',
    status: 'Present',
    workingHours: '8h 14m',
    deviceLocation: 'Main Gate ZKTeco F18 #1',
    shiftCode: 'NGT',
    shiftTiming: '10:00 PM - 06:00 AM',
    rosterCheckNote: 'On time against NGT Overnight Security Roster'
  },
  {
    id: 'BIO-106',
    employeeId: 'PS-EMP-0078',
    employeeName: 'W. D. Jayasinghe',
    designation: 'Water Works Engineer',
    department: 'Water Works & Engineering',
    checkIn: '01:54 PM',
    checkOut: '10:10 PM',
    date: '2026-07-10',
    status: 'Present',
    workingHours: '8h 16m',
    deviceLocation: 'Annex Building Biometric #2',
    shiftCode: 'EVE',
    shiftTiming: '02:00 PM - 10:00 PM',
    rosterCheckNote: 'On time against EVE Evening Patrol Roster'
  },
  {
    id: 'BIO-107',
    employeeId: 'PS-EMP-0092',
    employeeName: 'Sanduni Silva',
    designation: 'Accounts Assistant',
    department: 'Revenue & Finance',
    checkIn: '--:--',
    checkOut: '--:--',
    date: '2026-07-10',
    status: 'Approved Leave',
    workingHours: '0h 00m',
    deviceLocation: 'N/A (Scheduled Day Off)',
    shiftCode: 'OFF',
    shiftTiming: 'Rest Day Off',
    rosterCheckNote: 'Verified OFF against Monthly Duty Roster'
  },
  {
    id: 'BIO-108',
    employeeId: 'PS-EMP-0062',
    employeeName: 'Upul Dissanayake',
    designation: 'Works Overseer',
    department: 'Roads & Infrastructure',
    checkIn: '08:29 AM',
    checkOut: '--:--',
    date: '2026-07-10',
    status: 'Missed Punch',
    workingHours: 'Pending Out Punch',
    deviceLocation: 'Main Gate ZKTeco F18 #1',
    shiftCode: 'GEN',
    shiftTiming: '08:30 AM - 04:30 PM',
    rosterCheckNote: 'Out punch missing for GEN Roster'
  },
  {
    id: 'BIO-109',
    employeeId: 'PS-EMP-0012',
    employeeName: 'Kasun Perera',
    designation: 'Senior Revenue Inspector',
    department: 'Revenue & Finance',
    checkIn: '08:25 AM',
    checkOut: '02:35 PM',
    date: '2026-07-11',
    status: 'Weekend Duty',
    workingHours: '6h 10m',
    isWeekend: true,
    deviceLocation: 'Main Gate ZKTeco F18 #1',
    shiftCode: 'WKD',
    shiftTiming: '08:30 AM - 02:30 PM (Saturday)',
    rosterCheckNote: 'Saturday Weekend Duty - Tax Collection Drive & Budget Reconciliation'
  },
  {
    id: 'BIO-110',
    employeeId: 'PS-EMP-0041',
    employeeName: 'Chaminda Rathnayake',
    designation: 'Public Health Inspector (PHI)',
    department: 'Public Health & Sanitation',
    checkIn: '06:05 AM',
    checkOut: '01:15 PM',
    date: '2026-07-12',
    status: 'Weekend Duty',
    workingHours: '7h 10m',
    isWeekend: true,
    deviceLocation: 'Sanitation Depot Bio #3',
    shiftCode: 'EMG',
    shiftTiming: '06:00 AM - 01:00 PM (Sunday)',
    rosterCheckNote: 'Sunday Emergency Weekend Duty - District Dengue Fogging Campaign'
  },
  {
    id: 'BIO-111',
    employeeId: 'PS-EMP-0034',
    employeeName: 'Eng. Samantha Bandara',
    designation: 'Technical Officer',
    department: 'Works & Engineering',
    checkIn: '08:30 AM',
    checkOut: '07:30 PM',
    date: '2026-07-09',
    status: 'Overtime',
    workingHours: '11h 00m',
    overtimeHours: '3h 00m',
    deviceLocation: 'Main Gate ZKTeco F18 #1',
    shiftCode: 'OT+',
    shiftTiming: '08:30 AM - 04:30 PM (+3h OT)',
    rosterCheckNote: '+3h Authorized Overtime - Urgent Culvert & Drainage Inspection'
  },
  {
    id: 'BIO-112',
    employeeId: 'PS-EMP-0084',
    employeeName: 'Ajith Kumara',
    designation: 'Health Overseer',
    department: 'Public Health & Sanitation',
    checkIn: '05:55 AM',
    checkOut: '11:45 AM',
    date: '2026-07-04',
    status: 'Weekend Duty',
    workingHours: '5h 50m',
    isWeekend: true,
    deviceLocation: 'Sanitation Depot Bio #3',
    shiftCode: 'WKD',
    shiftTiming: '06:00 AM - 12:00 PM (Saturday)',
    rosterCheckNote: 'Saturday Half-Day Weekend Duty - Market Sanitation Supervision'
  }
]

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'LV-2026-089',
    employeeId: 'PS-EMP-0019',
    employeeName: 'Nimali Fernando',
    designation: 'Subject Clerk',
    department: 'Works & Engineering',
    leaveType: 'Annual Leave',
    startDate: '2026-07-14',
    endDate: '2026-07-16',
    daysCount: 3,
    reason: 'Family pilgrimage and personal matters outside district.',
    appliedOn: '2026-07-08',
    overallStatus: 'Pending Level 2',
    approvalLevels: [
      {
        levelNumber: 1,
        roleName: 'Line Supervisor (Engineer)',
        approverName: 'Eng. S. Bandara',
        status: 'Approved',
        timestamp: '2026-07-08 14:20',
        comments: 'Work handed over to Subject Clerk 2.'
      },
      {
        levelNumber: 2,
        roleName: 'Department Head',
        approverName: 'Director of Engineering',
        status: 'Pending'
      },
      {
        levelNumber: 3,
        roleName: 'Secretary / HR',
        approverName: 'Mrs. K. Weerasinghe',
        status: 'Waiting'
      }
    ]
  },
  {
    id: 'LV-2026-092',
    employeeId: 'PS-EMP-0041',
    employeeName: 'Chaminda Rathnayake',
    designation: 'Public Health Inspector (PHI)',
    department: 'Public Health & Environment',
    leaveType: 'Duty Leave',
    startDate: '2026-07-13',
    endDate: '2026-07-13',
    daysCount: 1,
    reason: 'Attending Provincial Ministry Dengue Control Summit in Colombo.',
    appliedOn: '2026-07-09',
    overallStatus: 'Approved',
    approvalLevels: [
      {
        levelNumber: 1,
        roleName: 'Medical Officer of Health',
        approverName: 'Dr. R. Silva',
        status: 'Approved',
        timestamp: '2026-07-09 10:15',
        comments: 'Official invitation verified.'
      },
      {
        levelNumber: 2,
        roleName: 'Department Head',
        approverName: 'Chief PHI',
        status: 'Approved',
        timestamp: '2026-07-09 11:40'
      },
      {
        levelNumber: 3,
        roleName: 'Secretary / HR',
        approverName: 'Mrs. K. Weerasinghe',
        status: 'Approved',
        timestamp: '2026-07-09 15:00',
        comments: 'Duty leave recorded.'
      }
    ]
  },
  {
    id: 'LV-2026-094',
    employeeId: 'PS-EMP-0078',
    employeeName: 'Anushka Senanayake',
    designation: 'Planning Assistant',
    department: 'Town Planning',
    leaveType: 'Casual Leave',
    startDate: '2026-07-17',
    endDate: '2026-07-17',
    daysCount: 1,
    reason: 'Personal medical checkup.',
    appliedOn: '2026-07-10',
    overallStatus: 'Pending Level 1',
    approvalLevels: [
      {
        levelNumber: 1,
        roleName: 'Senior Town Planner',
        approverName: 'Mr. P. Karunaratne',
        status: 'Pending'
      },
      {
        levelNumber: 2,
        roleName: 'Department Head',
        approverName: 'Chief Town Planner',
        status: 'Waiting'
      },
      {
        levelNumber: 3,
        roleName: 'Secretary / HR',
        approverName: 'Mrs. K. Weerasinghe',
        status: 'Waiting'
      }
    ]
  },
  {
    id: 'LV-2026-096',
    employeeId: 'PS-EMP-0012',
    employeeName: 'Kasun Perera',
    designation: 'Senior Revenue Inspector',
    department: 'Revenue & Finance',
    leaveType: 'Compensatory Leave (Comp-Off)',
    startDate: '2026-07-20',
    endDate: '2026-07-20',
    daysCount: 1,
    reason: 'Taking Compensatory Off in lieu of Saturday Weekend Duty worked on 2026-07-11 for Council Budget Preparation.',
    appliedOn: '2026-07-13',
    overallStatus: 'Approved',
    approvalLevels: [
      {
        levelNumber: 1,
        roleName: 'Chief Revenue Officer',
        approverName: 'Mr. H. Dissanayake',
        status: 'Approved',
        timestamp: '2026-07-13 11:30',
        comments: 'Saturday biometric check-in verified. Comp-off granted.'
      },
      {
        levelNumber: 2,
        roleName: 'Department Head',
        approverName: 'Director of Finance',
        status: 'Approved',
        timestamp: '2026-07-13 14:15'
      },
      {
        levelNumber: 3,
        roleName: 'Secretary / HR',
        approverName: 'Mrs. K. Weerasinghe',
        status: 'Approved',
        timestamp: '2026-07-13 16:00',
        comments: 'Comp-off ledger updated.'
      }
    ]
  },
  {
    id: 'LV-2026-097',
    employeeId: 'PS-EMP-0041',
    employeeName: 'Chaminda Rathnayake',
    designation: 'Public Health Inspector (PHI)',
    department: 'Public Health & Environment',
    leaveType: 'Compensatory Leave (Comp-Off)',
    startDate: '2026-07-24',
    endDate: '2026-07-24',
    daysCount: 1,
    reason: 'Compensatory leave claimed for Sunday Emergency Dengue Fogging duty performed on 2026-07-12.',
    appliedOn: '2026-07-14',
    overallStatus: 'Pending Level 2',
    approvalLevels: [
      {
        levelNumber: 1,
        roleName: 'Medical Officer of Health',
        approverName: 'Dr. R. Silva',
        status: 'Approved',
        timestamp: '2026-07-14 09:20',
        comments: 'Sunday emergency attendance confirmed.'
      },
      {
        levelNumber: 2,
        roleName: 'Department Head',
        approverName: 'Chief PHI',
        status: 'Pending'
      },
      {
        levelNumber: 3,
        roleName: 'Secretary / HR',
        approverName: 'Mrs. K. Weerasinghe',
        status: 'Waiting'
      }
    ]
  }
]

export const MOCK_LEAVE_BALANCES: LeaveBalance[] = [
  {
    employeeId: 'PS-EMP-0012',
    employeeName: 'Kasun Perera',
    designation: 'Senior Revenue Inspector',
    department: 'Revenue & Finance',
    casual: { total: 14, used: 4, remaining: 10 },
    annual: { total: 14, used: 5, remaining: 9 },
    medical: { total: 21, used: 2, remaining: 19 },
    duty: { total: 10, used: 3, remaining: 7 },
    compOff: { total: 6, used: 1, remaining: 5 }
  },
  {
    employeeId: 'PS-EMP-0019',
    employeeName: 'Nimali Fernando',
    designation: 'Subject Clerk',
    department: 'Works & Engineering',
    casual: { total: 14, used: 6, remaining: 8 },
    annual: { total: 14, used: 4, remaining: 10 },
    medical: { total: 21, used: 5, remaining: 16 },
    duty: { total: 10, used: 0, remaining: 10 },
    compOff: { total: 4, used: 0, remaining: 4 }
  },
  {
    employeeId: 'PS-EMP-0034',
    employeeName: 'Eng. Samantha Bandara',
    designation: 'Technical Officer',
    department: 'Works & Engineering',
    casual: { total: 14, used: 2, remaining: 12 },
    annual: { total: 14, used: 3, remaining: 11 },
    medical: { total: 21, used: 1, remaining: 20 },
    duty: { total: 10, used: 4, remaining: 6 },
    compOff: { total: 8, used: 2, remaining: 6 }
  },
  {
    employeeId: 'PS-EMP-0041',
    employeeName: 'Chaminda Rathnayake',
    designation: 'Public Health Inspector (PHI)',
    department: 'Public Health & Environment',
    casual: { total: 14, used: 5, remaining: 9 },
    annual: { total: 14, used: 6, remaining: 8 },
    medical: { total: 21, used: 0, remaining: 21 },
    duty: { total: 10, used: 6, remaining: 4 },
    compOff: { total: 5, used: 0, remaining: 5 }
  }
]

export const MOCK_REGULARIZATIONS: RegularizationRequest[] = [
  {
    id: 'REG-2026-041',
    employeeId: 'PS-EMP-0062',
    employeeName: 'Upul Dissanayake',
    department: 'Roads & Infrastructure',
    date: '2026-07-09',
    reasonType: 'Forgot to Punch Out',
    requestedCheckIn: '08:29 AM',
    requestedCheckOut: '04:40 PM',
    justification: 'Supervising urgent road repair at Kandy road junction until 4:40 PM. Forgot biometric scan on exit.',
    supervisorStatus: 'Pending',
    supervisorName: 'Eng. S. Bandara',
    appliedDate: '2026-07-10'
  },
  {
    id: 'REG-2026-039',
    employeeId: 'PS-EMP-0041',
    employeeName: 'Chaminda Rathnayake',
    department: 'Public Health & Environment',
    date: '2026-07-08',
    reasonType: 'Official Field Duty',
    requestedCheckIn: '08:30 AM',
    requestedCheckOut: '04:30 PM',
    justification: 'Court evidence attendance at Kandy Magistrate Court for sanitary violation case #MC-412.',
    supervisorStatus: 'Approved',
    supervisorName: 'Chief PHI',
    appliedDate: '2026-07-08'
  },
  {
    id: 'REG-2026-045',
    employeeId: 'PS-EMP-0012',
    employeeName: 'Kasun Perera',
    department: 'Revenue & Finance',
    date: '2026-07-04',
    reasonType: 'Weekend Duty Regularization',
    requestedCheckIn: '08:30 AM',
    requestedCheckOut: '02:30 PM',
    justification: 'Saturday Special Weekend Duty for emergency assessment rate calculation and audit preparation. Biometric punch verified.',
    supervisorStatus: 'Approved',
    supervisorName: 'Chief Revenue Officer',
    appliedDate: '2026-07-05'
  },
  {
    id: 'REG-2026-048',
    employeeId: 'PS-EMP-0034',
    employeeName: 'Eng. Samantha Bandara',
    department: 'Works & Engineering',
    date: '2026-07-09',
    reasonType: 'Overtime Authorization',
    requestedCheckIn: '08:30 AM',
    requestedCheckOut: '07:30 PM',
    justification: 'Supervising urgent flood drainage culvert repair at Kandy Road until 7:30 PM (+3 hours Authorized Overtime).',
    supervisorStatus: 'Approved',
    supervisorName: 'Director of Engineering',
    appliedDate: '2026-07-10'
  }
]

export const MOCK_HOLIDAYS: HolidayItem[] = [
  { id: 'HOL-1', date: '2026-07-10', name: 'Council Working Day', type: 'Council Special Holiday', dayOfWeek: 'Friday' },
  { id: 'HOL-2', date: '2026-07-29', name: 'Esala Full Moon Poya Day', type: 'Poya Day', dayOfWeek: 'Wednesday' },
  { id: 'HOL-3', date: '2026-08-27', name: 'Nikini Full Moon Poya Day', type: 'Poya Day', dayOfWeek: 'Thursday' },
  { id: 'HOL-4', date: '2026-09-25', name: 'Binara Full Moon Poya Day', type: 'Poya Day', dayOfWeek: 'Friday' }
]

