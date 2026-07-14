import type { AppUser, CouncilEmployeeOption } from '../types'

export const AVAILABLE_EMPLOYEES: CouncilEmployeeOption[] = [
  {
    employeeId: 'PS-EMP-0012',
    employeeName: 'Kasun Perera',
    designation: 'Senior Revenue Inspector',
    department: 'Revenue & Finance',
    email: 'k.perera@pradeshiyasabha.gov.lk',
    avatarInitials: 'KP',
    status: 'Has Account'
  },
  {
    employeeId: 'PS-EMP-0019',
    employeeName: 'Nimali Fernando',
    designation: 'Subject Clerk (Engineering)',
    department: 'Works & Engineering',
    email: 'n.fernando@pradeshiyasabha.gov.lk',
    avatarInitials: 'NF',
    status: 'Has Account'
  },
  {
    employeeId: 'PS-EMP-0041',
    employeeName: 'Chaminda Rathnayake',
    designation: 'Public Health Inspector (PHI)',
    department: 'Public Health & Sanitation',
    email: 'c.rathnayake@pradeshiyasabha.gov.lk',
    avatarInitials: 'CR',
    status: 'Has Account'
  },
  {
    employeeId: 'PS-EMP-0063',
    employeeName: 'Sunil Ariyaratne',
    designation: 'Security Supervisor',
    department: 'Municipal Security Desk',
    email: 's.ariyaratne@pradeshiyasabha.gov.lk',
    avatarInitials: 'SA',
    status: 'Available'
  },
  {
    employeeId: 'PS-EMP-0078',
    employeeName: 'W. D. Jayasinghe',
    designation: 'Chief Water Engineer',
    department: 'Water Works & Engineering',
    email: 'w.jayasinghe@pradeshiyasabha.gov.lk',
    avatarInitials: 'WJ',
    status: 'Available'
  },
  {
    employeeId: 'PS-EMP-0084',
    employeeName: 'Ajith Kumara',
    designation: 'Health Overseer',
    department: 'Public Health & Sanitation',
    email: 'a.kumara@pradeshiyasabha.gov.lk',
    avatarInitials: 'AK',
    status: 'Available'
  },
  {
    employeeId: 'PS-EMP-0092',
    employeeName: 'Sanduni Silva',
    designation: 'Finance Officer',
    department: 'Revenue & Finance',
    email: 's.silva@pradeshiyasabha.gov.lk',
    avatarInitials: 'SS',
    status: 'Available'
  },
  {
    employeeId: 'PS-EMP-0105',
    employeeName: 'Tharindu Madusanka',
    designation: 'Fleet Coordinator',
    department: 'Fleet & Logistics',
    email: 't.madusanka@pradeshiyasabha.gov.lk',
    avatarInitials: 'TM',
    status: 'Available'
  },
  {
    employeeId: 'PS-EMP-0118',
    employeeName: 'Dilani Perera',
    designation: 'Administrative Secretary',
    department: 'Administration',
    email: 'd.perera@pradeshiyasabha.gov.lk',
    avatarInitials: 'DP',
    status: 'Available'
  },
  {
    employeeId: 'PS-EMP-0124',
    employeeName: 'Roshan Bandara',
    designation: 'GIS Specialist & Surveyor',
    department: 'Town Planning & GIS',
    email: 'r.bandara@pradeshiyasabha.gov.lk',
    avatarInitials: 'RB',
    status: 'Available'
  }
]

export const INITIAL_APP_USERS: AppUser[] = [
  {
    id: 'USR-2026-001',
    employeeId: 'PS-EMP-0012',
    employeeName: 'Kasun Perera',
    designation: 'Senior Revenue Inspector',
    department: 'Revenue & Finance',
    email: 'k.perera@pradeshiyasabha.gov.lk',
    avatarInitials: 'KP',
    allowedFeatures: [
      'overview',
      'attendance', 'attendance_dashboard', 'attendance_timecards', 'attendance_myleave', 'attendance_corrections', 'attendance_approvals', 'attendance_rosters',
      'appointments', 'appointments_all', 'appointments_my', 'appointments_audits',
      'assets', 'assets_overview', 'assets_directory', 'assets_gis',
      'fleet', 'fleet_overview', 'fleet_vehicles', 'fleet_dispatch', 'fleet_maintenance', 'fleet_drivers', 'fleet_approvals',
      'complaints', 'complaints_all', 'complaints_my',
      'letters', 'letters_all', 'letters_my', 'letters_inward', 'letters_outward', 'letters_assigned', 'letters_write',
      'profile',
      'settings',
      'user-management', 'users_create', 'users_manage'
    ],
    mustChangePassword: false,
    status: 'Active',
    lastLogin: '2026-07-14 11:30 AM',
    createdAt: '2026-01-10',
    rolePreset: 'Admin'
  },
  {
    id: 'USR-2026-002',
    employeeId: 'PS-EMP-0019',
    employeeName: 'Nimali Fernando',
    designation: 'Subject Clerk (Engineering)',
    department: 'Works & Engineering',
    email: 'n.fernando@pradeshiyasabha.gov.lk',
    avatarInitials: 'NF',
    allowedFeatures: [
      'overview',
      'attendance', 'attendance_dashboard', 'attendance_timecards', 'attendance_myleave', 'attendance_corrections',
      'assets', 'assets_overview', 'assets_directory',
      'letters', 'letters_my', 'letters_inward', 'letters_outward', 'letters_write',
      'profile'
    ],
    mustChangePassword: false,
    status: 'Active',
    lastLogin: '2026-07-14 09:15 AM',
    createdAt: '2026-02-15',
    rolePreset: 'Staff'
  },
  {
    id: 'USR-2026-003',
    employeeId: 'PS-EMP-0041',
    employeeName: 'Chaminda Rathnayake',
    designation: 'Public Health Inspector (PHI)',
    department: 'Public Health & Sanitation',
    email: 'c.rathnayake@pradeshiyasabha.gov.lk',
    avatarInitials: 'CR',
    allowedFeatures: [
      'overview',
      'attendance', 'attendance_dashboard', 'attendance_timecards', 'attendance_myleave', 'attendance_corrections', 'attendance_approvals',
      'complaints', 'complaints_all', 'complaints_my',
      'letters', 'letters_my', 'letters_write',
      'profile'
    ],
    mustChangePassword: true,
    status: 'Active',
    lastLogin: '2026-07-13 04:45 PM',
    createdAt: '2026-03-01',
    rolePreset: 'Manager'
  }
]
