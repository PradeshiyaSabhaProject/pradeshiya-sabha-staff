export type ApplicationStatus = 
  | 'PENDING' 
  | 'REVIEWING' 
  | 'INSPECTION' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'RETURNED'

export type ApplicationFormCategory = 
  | 'Building & Construction Permit' 
  | 'Trade & Business License' 
  | 'Environmental & Tree Cutting Clearance' 
  | 'Water & Sewerage Connection' 
  | 'Public Hall & Ground Booking' 
  | 'Advertisement & Signboard Permit'

export type ApplicationFeeStatus = 'PAID' | 'PENDING' | 'EXEMPT'

export interface ApplicationAttachment {
  id: string
  name: string
  size: string
  type: 'image' | 'pdf' | 'doc'
  url: string
}

export interface ApplicationRemark {
  id: string
  text: string
  date: string
  time: string
  author: string
}

export interface ApplicationCustomData {
  proposedLandArea?: string
  buildingStoreys?: string
  businessName?: string
  businessRegistrationNo?: string
  treeTypeAndCount?: string
  propertyAssessmentNo?: string
  connectionPipeSize?: string
  bookingDate?: string
  expectedAttendees?: string
  signboardDimensions?: string
  displayLocation?: string
}

export interface ApplicationForm {
  id: string
  refId: string
  applicantName: string
  applicantNic: string
  applicantPhone: string
  applicantEmail: string
  applicantAddress: string
  category: ApplicationFormCategory
  date: string
  time: string
  assignedOfficer: string
  assignedInspector?: string
  status: ApplicationStatus
  feeStatus: ApplicationFeeStatus
  feeAmount: number
  description: string
  customData?: ApplicationCustomData
  attachments: ApplicationAttachment[]
  officerRemarks?: ApplicationRemark[]
  applicantNotified?: boolean
  dueDate?: string
}
