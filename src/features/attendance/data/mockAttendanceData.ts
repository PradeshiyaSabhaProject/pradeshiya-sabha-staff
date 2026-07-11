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
  status: 'Present' | 'Late Entry' | 'Approved Leave' | 'Official Duty' | 'Missed Punch' | 'Absent'
  workingHours: string
  deviceLocation: string
  lateMinutes?: number
  isRegularized?: boolean
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  designation: string
  department: string
  leaveType: 'Annual Leave' | 'Casual Leave' | 'Medical Leave' | 'Duty Leave' | 'Maternity Leave'
  startDate: string
  endDate: string
  daysCount: number
  reason: string
  appliedOn: string
  approvalLevels: {
    levelNumber: 1 | 2 | 3
    roleName: string
    approverName: string
    status: 'Approved' | 'Pending' | 'Rejected' | 'Waiting'
    timestamp?: string
    comments?: string
  }[]
  overallStatus: 'Approved' | 'Pending Level 1' | 'Pending Level 2' | 'Pending Level 3' | 'Rejected'
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
}

export interface RegularizationRequest {
  id: string
  employeeId: string
  employeeName: string
  department: string
  date: string
  reasonType: 'Forgot to Punch Out' | 'Forgot to Punch In' | 'Official Field Duty' | 'Biometric Machine Fault'
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
    checkOut: '04:35 PM',
    date: '2026-07-10',
    status: 'Present',
    workingHours: '8h 13m',
    deviceLocation: 'Main Gate ZKTeco F18 #1'
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
    lateMinutes: 22
  },
  {
    id: 'BIO-103',
    employeeId: 'PS-EMP-0034',
    employeeName: 'Eng. Samantha Bandara',
    designation: 'Technical Officer',
    department: 'Works & Engineering',
    checkIn: '08:15 AM',
    checkOut: '05:10 PM',
    date: '2026-07-10',
    status: 'Present',
    workingHours: '8h 55m',
    deviceLocation: 'Annex Building Biometric #2'
  },
  {
    id: 'BIO-104',
    employeeId: 'PS-EMP-0041',
    employeeName: 'Chaminda Rathnayake',
    designation: 'Public Health Inspector (PHI)',
    department: 'Public Health & Environment',
    checkIn: '08:28 AM',
    checkOut: '--:--',
    date: '2026-07-10',
    status: 'Official Duty',
    workingHours: 'Field Duty',
    deviceLocation: 'Main Gate ZKTeco F18 #1',
    isRegularized: true
  },
  {
    id: 'BIO-105',
    employeeId: 'PS-EMP-0055',
    employeeName: 'Dilani Jayawardena',
    designation: 'Management Assistant',
    department: 'Administration & HR',
    checkIn: '--:--',
    checkOut: '--:--',
    date: '2026-07-10',
    status: 'Approved Leave',
    workingHours: '0h 00m',
    deviceLocation: 'N/A (Leave System)'
  },
  {
    id: 'BIO-106',
    employeeId: 'PS-EMP-0062',
    employeeName: 'Upul Dissanayake',
    designation: 'Works Overseer',
    department: 'Roads & Infrastructure',
    checkIn: '08:29 AM',
    checkOut: '--:--',
    date: '2026-07-10',
    status: 'Missed Punch',
    workingHours: 'Pending Out Punch',
    deviceLocation: 'Main Gate ZKTeco F18 #1'
  },
  {
    id: 'BIO-107',
    employeeId: 'PS-EMP-0078',
    employeeName: 'Anushka Senanayake',
    designation: 'Planning Assistant',
    department: 'Town Planning',
    checkIn: '08:48 AM',
    checkOut: '04:32 PM',
    date: '2026-07-10',
    status: 'Late Entry',
    workingHours: '7h 44m',
    deviceLocation: 'Annex Building Biometric #2',
    lateMinutes: 18
  },
  {
    id: 'BIO-108',
    employeeId: 'PS-EMP-0081',
    employeeName: 'Ruwan Kumara',
    designation: 'Accountant',
    department: 'Revenue & Finance',
    checkIn: '08:18 AM',
    checkOut: '04:45 PM',
    date: '2026-07-10',
    status: 'Present',
    workingHours: '8h 27m',
    deviceLocation: 'Main Gate ZKTeco F18 #1'
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
    duty: { total: 10, used: 3, remaining: 7 }
  },
  {
    employeeId: 'PS-EMP-0019',
    employeeName: 'Nimali Fernando',
    designation: 'Subject Clerk',
    department: 'Works & Engineering',
    casual: { total: 14, used: 6, remaining: 8 },
    annual: { total: 14, used: 4, remaining: 10 },
    medical: { total: 21, used: 5, remaining: 16 },
    duty: { total: 10, used: 0, remaining: 10 }
  },
  {
    employeeId: 'PS-EMP-0034',
    employeeName: 'Eng. Samantha Bandara',
    designation: 'Technical Officer',
    department: 'Works & Engineering',
    casual: { total: 14, used: 2, remaining: 12 },
    annual: { total: 14, used: 3, remaining: 11 },
    medical: { total: 21, used: 1, remaining: 20 },
    duty: { total: 10, used: 4, remaining: 6 }
  },
  {
    employeeId: 'PS-EMP-0041',
    employeeName: 'Chaminda Rathnayake',
    designation: 'Public Health Inspector (PHI)',
    department: 'Public Health & Environment',
    casual: { total: 14, used: 5, remaining: 9 },
    annual: { total: 14, used: 6, remaining: 8 },
    medical: { total: 21, used: 0, remaining: 21 },
    duty: { total: 10, used: 6, remaining: 4 }
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
  }
]

export const MOCK_HOLIDAYS: HolidayItem[] = [
  { id: 'HOL-1', date: '2026-07-10', name: 'Council Working Day', type: 'Council Special Holiday', dayOfWeek: 'Friday' },
  { id: 'HOL-2', date: '2026-07-29', name: 'Esala Full Moon Poya Day', type: 'Poya Day', dayOfWeek: 'Wednesday' },
  { id: 'HOL-3', date: '2026-08-27', name: 'Nikini Full Moon Poya Day', type: 'Poya Day', dayOfWeek: 'Thursday' },
  { id: 'HOL-4', date: '2026-09-25', name: 'Binara Full Moon Poya Day', type: 'Poya Day', dayOfWeek: 'Friday' }
]
