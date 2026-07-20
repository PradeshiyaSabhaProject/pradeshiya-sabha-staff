export interface UserBioProfile {
  empId: string
  fullName: string
  nameWithInitials: string
  designation: string
  grade: string
  department: string
  nic: string
  dateOfBirth: string
  gender: 'Male' | 'Female' | 'Other'
  joinDate: string
  employmentStatus: 'Permanent' | 'Contract' | 'Probation'
  biometricNfcId: string
  verificationStatus: 'Verified' | 'Pending Verification' | 'Suspended'
  officialEmail: string
  personalEmail: string
  mobilePhone: string
  whatsappNumber: string
  emergencyContactName: string
  emergencyContactRelation: string
  emergencyContactPhone: string
  residentialAddress: string
  avatarUrl?: string
}

export interface SecuritySession {
  id: string
  device: string
  browser: string
  ipAddress: string
  location: string
  lastActive: string
  isCurrent: boolean
  deviceType: 'desktop' | 'mobile' | 'tablet'
}

export interface ActivityLogItem {
  id: string
  action: string
  module: 'Attendance' | 'Letters' | 'Appointments' | 'Assets' | 'Security' | 'General'
  timestamp: string
  ip: string
  status: 'Success' | 'Warning' | 'Info'
  details: string
}

export interface DepartmentInfo {
  name: string
  headOfDepartment: string
  location: string
  roomNumber: string
  contactExtension: string
  assignedModules: {
    name: string
    code: string
    permissionLevel: 'Full Admin' | 'Write & Approve' | 'Read & Create' | 'Read Only'
    enabled: boolean
  }[]
  clearances: string[]
}

export interface NotificationPreference {
  id: string
  category: string
  label: string
  description: string
  emailEnabled: boolean
  smsEnabled: boolean
  whatsappEnabled: boolean
}

export interface LeaveSummary {
  annualTotal: number
  annualUsed: number
  casualTotal: number
  casualUsed: number
  medicalTotal: number
  medicalUsed: number
}
