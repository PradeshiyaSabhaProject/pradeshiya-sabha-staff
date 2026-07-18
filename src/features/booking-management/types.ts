export type BookingStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'COMPLETED'

export type FacilityType = 
  | 'Pradeshiya Sabha Town Hall' 
  | 'Mattegoda Community Center' 
  | 'Kottawa Public Ground & Pavilion' 
  | 'Homagama Indoor Sports Complex' 
  | 'Public Crematorium & Chapel' 
  | 'Mobile Stage & Sound Equipment'

export type PaymentStatus = 'PAID' | 'PENDING' | 'REFUNDED' | 'EXEMPT'

export interface BookingAttachment {
  id: string
  name: string
  size: string
  type: 'image' | 'pdf' | 'doc'
  url: string
}

export interface BookingRemark {
  id: string
  text: string
  date: string
  time: string
  author: string
  action?: 'APPROVED' | 'REJECTED' | 'NOTE'
}

export interface FacilityBooking {
  id: string
  refId: string
  facilityName: FacilityType
  citizenName: string
  citizenNic: string
  citizenPhone: string
  citizenEmail: string
  citizenAddress: string
  eventTitle: string
  eventType: string
  bookingDate: string
  timeSlot: string
  submittedDate: string
  submittedTime: string
  expectedAttendees: number
  rentalFee: number
  securityDeposit: number
  paymentStatus: PaymentStatus
  status: BookingStatus
  specialRequirements?: string
  attachments: BookingAttachment[]
  remarks?: BookingRemark[]
  assignedOfficer?: string
  reviewedDate?: string
}
