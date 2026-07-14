export interface AppUser {
  id: string
  employeeId: string
  employeeName: string
  designation: string
  department: string
  email: string
  avatarInitials: string
  allowedFeatures: string[]
  tempPassword?: string
  mustChangePassword: boolean
  status: 'Active' | 'Suspended' | 'Deactivated'
  lastLogin?: string
  createdAt: string
  rolePreset: 'Admin' | 'Manager' | 'Staff' | 'Custom'
}

export interface FeatureChild {
  id: string
  label: string
  path: string
}

export interface FeatureItem {
  id: string
  label: string
  path: string
  iconName: string
  description: string
  children?: FeatureChild[]
}

export interface CouncilEmployeeOption {
  employeeId: string
  employeeName: string
  designation: string
  department: string
  email: string
  avatarInitials: string
  status: 'Available' | 'Has Account'
}

export const AVAILABLE_FEATURES: FeatureItem[] = [
  {
    id: 'overview',
    label: 'Overview Dashboard',
    path: '/overview',
    iconName: 'grid',
    description: 'Executive summary, metrics, and high-level council notifications.',
  },
  {
    id: 'attendance',
    label: 'Staff Attendance & Leave',
    path: '/attendance',
    iconName: 'attendance',
    description: 'Biometric daily records, duty rosters, leave applications, and timecards.',
    children: [
      { id: 'attendance_dashboard', label: 'Daily Biometric Dashboard', path: '/attendance/dashboard' },
      { id: 'attendance_timecards', label: 'Employee Timecards', path: '/attendance/timecards' },
      { id: 'attendance_myleave', label: 'My Leave & Applications', path: '/attendance/my-leave' },
      { id: 'attendance_corrections', label: 'My Attendance Corrections', path: '/attendance/my-corrections' },
      { id: 'attendance_approvals', label: 'Manager Approvals Queue', path: '/attendance/approvals' },
      { id: 'attendance_rosters', label: 'Monthly Duty Rosters', path: '/attendance/rosters' },
    ]
  },
  {
    id: 'appointments',
    label: 'Appointment Management',
    path: '/appointments',
    iconName: 'calendar',
    description: 'Schedule public meetings, council officer appointments, and system audits.',
    children: [
      { id: 'appointments_all', label: 'All Appointments', path: '/appointments/all' },
      { id: 'appointments_my', label: 'My Appointments', path: '/appointments/my' },
      { id: 'appointments_audits', label: 'System Audits (Restricted)', path: '/appointments/audits' },
    ]
  },
  {
    id: 'assets',
    label: 'Asset Management',
    path: '/assets',
    iconName: 'asset',
    description: 'Council property directory, GIS mapping, infrastructure maintenance, and valuations.',
    children: [
      { id: 'assets_overview', label: 'Asset Overview', path: '/assets/overview' },
      { id: 'assets_directory', label: 'Asset Directory', path: '/assets/directory' },
      { id: 'assets_gis', label: 'Interactive GIS Mapping', path: '/assets/gis-mapping' },
    ]
  },
  {
    id: 'fleet',
    label: 'Fleet Management',
    path: '/fleet',
    iconName: 'fleet',
    description: 'Council vehicles registry, live GPS dispatch, maintenance workshop, and fuel logs.',
    children: [
      { id: 'fleet_overview', label: 'Fleet Dashboard', path: '/fleet/overview' },
      { id: 'fleet_vehicles', label: 'Vehicle Registry', path: '/fleet/vehicles' },
      { id: 'fleet_dispatch', label: 'Live Dispatch & Location', path: '/fleet/dispatch' },
      { id: 'fleet_maintenance', label: 'Maintenance Workshop', path: '/fleet/maintenance' },
      { id: 'fleet_drivers', label: 'Drivers & Operators', path: '/fleet/drivers' },
      { id: 'fleet_approvals', label: 'Authorizations Desk', path: '/fleet/approvals' },
    ]
  },
  {
    id: 'complaints',
    label: 'Complain Management',
    path: '/complaints',
    iconName: 'complain',
    description: 'Citizen grievances tracking, field officer assignment, resolution logs, and deadlines.',
    children: [
      { id: 'complaints_all', label: 'All Complaints', path: '/complaints/all' },
      { id: 'complaints_my', label: 'My Complaints', path: '/complaints/my' },
    ]
  },
  {
    id: 'letters',
    label: 'Letter Management',
    path: '/letters',
    iconName: 'letter',
    description: 'Inward and outward official correspondence, officer assignments, and dispatch tracking.',
    children: [
      { id: 'letters_all', label: 'All Letters', path: '/letters/all' },
      { id: 'letters_my', label: 'My Letters', path: '/letters/my' },
      { id: 'letters_inward', label: 'Inward Letters', path: '/letters/inward' },
      { id: 'letters_outward', label: 'Outward Letters', path: '/letters/outward' },
      { id: 'letters_assigned', label: 'Assigned Officers', path: '/letters/assigned' },
      { id: 'letters_write', label: 'Write Letter', path: '/letters/write' },
    ]
  },
  {
    id: 'profile',
    label: 'Profile & Security',
    path: '/profile',
    iconName: 'profile',
    description: 'Personal officer profile, credentials, and account activity.',
  },
  {
    id: 'settings',
    label: 'System Settings',
    path: '/settings',
    iconName: 'settings',
    description: 'Portal configuration, language preferences, integration rules, and system backups.',
  },
  {
    id: 'user-management',
    label: 'User Management',
    path: '/users',
    iconName: 'users',
    description: 'Create accounts, assign sidebar module access, reset passwords, and manage user statuses.',
    children: [
      { id: 'users_create', label: 'Create User', path: '/users/create' },
      { id: 'users_manage', label: 'Manage Users', path: '/users/manage' },
    ]
  }
]
