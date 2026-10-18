export type PropertyPaymentStatus = 'Paid' | 'Due soon' | 'Overdue' | 'Warrant issued'

export type PropertyType =
  | 'Commercial'
  | 'Residential'
  | 'Government'
  | 'Religious'
  | 'Bare land'

export interface Zone {
  id: string
  name: string
  code: string
}

export interface Ward {
  id: string
  zoneId: string
  number: number
  name: string
}

export interface Road {
  id: string
  zoneId: string
  wardId: string
  name: string
  code: string
}

export interface LocationHistory {
  id: string
  propertyId: string
  oldLatitude: number
  oldLongitude: number
  newLatitude: number
  newLongitude: number
  changedBy: string
  changedAt: string
  reason: string
}

export interface PropertyIdentifier {
  id: string
  propertyId: string
  oldAssessmentNumber: string
  obsoleteDate: string
  reason: string
  recordedBy: string
}

export interface Owner {
  id: string
  name: string
  nic: string
  mobile: string
  postalAddress: string
  email?: string
}

export interface OwnershipRecord {
  id: string
  propertyId: string
  ownerId: string
  ownerName: string
  nic: string
  mobile: string
  isCurrent: boolean
  effectiveDate: string
  endDate?: string
  deedNumber?: string
  approvedBy: string
}

export interface Valuation {
  id: string
  propertyId: string
  annualAssessedValue: number
  effectiveYear: number
  approvedBy: string
  valuationDate: string
  reportNumber?: string
}

export interface DueQuarter {
  id: string
  propertyId: string
  year: number
  quarter: 1 | 2 | 3 | 4
  amount: number
  paidAmount: number
  status: 'Paid' | 'Due' | 'Overdue' | 'Warrant'
  dueDate: string
}

export interface PaymentQuarterAllocation {
  year: number
  quarter: number
  amount: number
  discount: number
}

export interface Payment {
  id: string
  propertyId: string
  assessmentNumber: string
  receiptNumber: string
  amount: number
  date: string
  status: 'TEMPORARY' | 'OFFICIAL'
  method: 'CASH' | 'CARD' | 'CHEQUE' | 'ONLINE'
  officerId: string
  officerName: string
  quarterAllocations: PaymentQuarterAllocation[]
  notes?: string
}

export interface Receipt {
  id: string
  paymentId: string
  officialReceiptNumber: string
  temporaryReceiptNumber?: string
  counterfoilNumber?: string
  date: string
  reconciledDate?: string
  reconciledBy?: string
  amount: number
  propertyId: string
}

export type WarrantStatus =
  | 'DRAFT'
  | 'AUTHORISED'
  | 'ISSUED'
  | 'ENFORCEMENT'
  | 'RESOLVED'
  | 'CANCELLED'

export interface WarrantChainStep {
  step: 'Counter' | 'CC' | 'Secretary' | 'RelevantCounter' | 'DO'
  stepTitle: string
  status: 'Pending' | 'Completed' | 'Rejected'
  officer: string
  timestamp?: string
  notes?: string
}

export interface Warrant {
  id: string
  propertyId: string
  assessmentNumber: string
  status: WarrantStatus
  issuedDate: string
  signedBy?: string
  warrantCost: number
  penaltyPercentage: number
  cancelReason?: string
  cancelledDate?: string
  chainSteps: WarrantChainStep[]
}

export interface FieldCollection {
  id: string
  officerId: string
  officerName: string
  date: string
  amountCash: number
  amountCard: number
  totalAmount: number
  receiptIds: string[]
  status: 'Pending' | 'Reconciled'
}

export interface Reconciliation {
  id: string
  officerId: string
  officerName: string
  date: string
  cashReceived: number
  cardReceived: number
  cashierId: string
  cashierName: string
  receiptsCount: number
  notes?: string
}

export type AtdStage =
  | 'Counter'
  | 'RevenueInspector'
  | 'ChiefInspector'
  | 'Secretary'
  | 'Completed'
  | 'Rejected'

export interface AtdComment {
  id: string
  author: string
  role: string
  comment: string
  timestamp: string
}

export interface AtdDocument {
  id: string
  type: 'Deed' | 'SurveyPlan' | 'NotaryReport' | 'BuildingPlan' | 'COC' | 'Other'
  name: string
  uploadedAt: string
  fileSize?: string
}

export interface AtdApplication {
  id: string
  atdNumber: string
  atdReceiptNumber: string
  propertyId?: string
  assessmentNumber?: string
  applicantName: string
  applicantNic: string
  applicantMobile: string
  requestType: 'NewNumber' | 'OwnershipChange' | 'DescriptionChange'
  stage: AtdStage
  comments: AtdComment[]
  documents: AtdDocument[]
  valuationReport?: {
    recommendedValue: number
    notes: string
    officer: string
    date: string
  }
  status: 'In Progress' | 'Approved' | 'Rejected'
  createdAt: string
  updatedAt: string
}

export interface SubdivisionLink {
  id: string
  parentPropertyId: string
  childPropertyId: string
  surveyPlanNumber: string
  deedNumber: string
  splitRule: string
  arrearsSplitPercentage: number
  createdDate: string
}

export interface ReliefRecord {
  id: string
  propertyId: string
  type: 'Poverty' | 'ClosedBusiness'
  percentage: number
  effectiveYear: number
  expiryDate: string
  approvedBy: string
  reason: string
}

export interface Notice {
  id: string
  propertyId: string
  assessmentNumber: string
  year: number
  noticeType: 'AnnualAssessment' | 'FinalWarning' | 'WarrantNotice'
  amountDue: number
  generatedDate: string
  sentVia: 'PRINT' | 'SMS' | 'IN_APP'
  deliveryStatus: 'SENT' | 'DELIVERED' | 'FAILED'
}

export interface AuditEntry {
  id: string
  entityType: 'Property' | 'Warrant' | 'Payment' | 'Reconciliation' | 'Ownership' | 'Valuation' | 'ATD' | 'Settings'
  entityId: string
  action: string
  performedBy: string
  timestamp: string
  details: string | Record<string, unknown>
}

export interface Property {
  id: string
  assessmentNumber: string // e.g. "78/12a", unique, never overwritten
  propertyNumber: string // e.g. "No. 45"
  description: string // e.g. "Single storey residential housing unit"
  propertyType: PropertyType
  annualAssessedValue: number // in LKR
  latitude: number
  longitude: number
  zoneId: string
  wardId: string
  roadId: string
  currentOwner: Owner
  secondaryOwner?: Owner // up to 2 owners can share an assessment unit
  status: PropertyPaymentStatus
  dues: DueQuarter[]
  activeWarrant?: Warrant
  relief?: ReliefRecord
  subdivisionParentId?: string
  subdivisionChildIds?: string[]
  createdAt: string
  updatedAt: string
}

export interface VaripanamSettings {
  taxRates: {
    residential: number // default 10%
    commercial: number // default 15%
    government: number // default 7%
    religious: number // default 0%
    bareLand: number // default 7%
  }
  yearlyPaymentDiscount: number // default 10% (by Jan 31)
  quarterlyPaymentDiscount: number // default 5% (first month of quarter)
  gracePeriodQuarters: number // default 2
  warrantPenaltyPercentage: number // default 15%
  dueSoonWindowDays: number // default 14
  quarterDueDates: {
    Q1: string // "03-31"
    Q2: string // "06-30"
    Q3: string // "09-30"
    Q4: string // "12-31"
  }
  mapCentre: [number, number] // [6.8415, 80.0035] Homagama
  defaultZoom: number // 14
  sabhaBoundaryGeoJson?: {
    type: string
    coordinates: number[][][]
  }
  subdivisionArrearsRule: 'EQUAL_SPLIT' | 'VALUE_PROPORTIONAL' | 'ASSIGN_TO_PRIMARY'
  confirmationFlags: {
    taxRatesConfirmed: boolean
    warrantPenaltyConfirmed: boolean
    subdivisionRuleConfirmed: boolean
    dueDatesConfirmed: boolean
  }
}

export interface VaripanamFilterState {
  zoneId: string
  wardId: string
  roadId: string
  status: string // 'All' | 'Paid' | 'Due soon' | 'Overdue' | 'Warrant issued'
  periodYear: number
  periodQuarter: number // 0 for all, 1-4
  searchQuery: string
}
