/*
 * Trade License Management – domain types
 *
 * Source of rules: "Pradeshiya Sabha | Finance & Service Requirements – 2. Trade Licence".
 * Application status, inspection status, approval status and payment status are kept
 * deliberately separate (see Application below). Payment statuses are always derived
 * from charges + payments so they can never drift out of sync.
 */

// ── Officers ────────────────────────────────────────────────────────────────
export type Designation =
  | 'Counter Officer'
  | 'Cashier'
  | 'Revenue Inspector'
  | 'Public Health Inspector'
  | 'Medical Officer of Health'
  | 'Environmental Officer'
  | 'Fire Safety Officer'
  | 'Chief Inspector'
  | 'Secretary'
  | 'Chairman'
  | 'System Administrator'

export interface Actor {
  name: string
  /** Office recorded in the audit log / decisions. */
  designation: Designation
  /** All offices this user may act for (derived from the portal role). Defaults to [designation]. */
  designations?: Designation[]
}

// ── Configuration ───────────────────────────────────────────────────────────
export type InspectionType = 'RI_BYLAW' | 'PHI' | 'ENVIRONMENTAL' | 'FIRE'
export type ApprovalStage = 'RI_VERIFICATION' | 'CHIEF_INSPECTOR' | 'SECRETARY' | 'CHAIRMAN'
export type LiabilityType = 'TRADE_LICENSE' | 'TRADE_TAX' | 'BUSINESS_TAX'
export type ChargeType = 'PROCESSING_FEE' | 'LICENSE_FEE' | 'STAMP_DUTY'

export interface BusinessCategory {
  id: string
  name: string
  description: string
  requiredInspections: InspectionType[]
  /** PHI report must be endorsed by the MOH (PDF: "manual report -> signed by MOH"). */
  mohSignOffRequired: boolean
  /** Approval stages for this category. Empty = use the global approval chain. */
  approvalStages: ApprovalStage[]
  requiredDocuments: string[]
  active: boolean
  /** False until the official approval matrix confirms this category's set-up. */
  confirmed: boolean
}

export interface ChecklistItem {
  id: string
  label: string
  mandatory: boolean
}

export interface ChecklistTemplate {
  id: string
  categoryId: string
  inspectionType: InspectionType
  items: ChecklistItem[]
  /** Conditions must be provided by the Pradeshiya Sabha (By-Laws). */
  confirmed: boolean
  updatedAt: string
}

export interface FeeBand {
  id: string
  /** Label exactly as it appears in the requirements table, e.g. "500", ">1500". */
  label: string
  /** Assessment value must be greater than this (null = no lower limit). */
  minExclusive: number | null
  /** Assessment value must be less than or equal to this (null = no upper limit). */
  maxInclusive: number | null
  /** Trade licence fee in Rs. null = not provided in the requirements. */
  licenseFee: number | null
  confirmed: boolean
}

export interface ConfigurableAmount {
  amount: number | null
  confirmed: boolean
}

export interface TradeLicenseSettings {
  feeBands: FeeBand[]
  /** Tourist Board registered hotel: previous year's turnover × rate (PDF: 1%). */
  touristHotelTurnoverRate: number
  /** Stamp duty = licence fee × rate, capped (PDF: 10%, Rs. 2,000). */
  stampDutyRate: number
  stampDutyCap: number
  processingFee: ConfigurableAmount
  allowPartialPayments: boolean
  partialPaymentsConfirmed: boolean
  /** PDF: annual cycle ending 31 December – "must be formally confirmed". */
  validityEndsDec31: boolean
  validityConfirmed: boolean
  approvalChain: ApprovalStage[]
  approvalChainConfirmed: boolean
  /** Deadline given for rectification orders (diagram: 14–30 days). */
  correctionDeadlineDays: number
  /** Legal notice compliance period (PDF: 14 days). */
  legalNoticeDays: number
  /** Open applications older than this are flagged overdue on the dashboard. */
  overdueApplicationDays: number
  overdueApplicationDaysConfirmed: boolean
  /** Votes / accounts each charge maps to. Empty until finance confirms. */
  voteCodes: Record<ChargeType, string>
}

// ── Business master (Revenue survey / registration) ─────────────────────────
export interface BusinessIdRecord {
  businessId: string
  assignedAt: string
  retiredAt?: string
  reason: string
}

export interface Business {
  key: string
  /** Official Business ID – issued when the processing fee is paid; kept for the future. */
  businessId: string | null
  businessIdHistory: BusinessIdRecord[]
  name: string
  natureOfActivity: string
  categoryId: string
  owner: {
    name: string
    nic: string
    phone: string
    email?: string
    address: string
  }
  premises: {
    address: string
    assessmentNo?: string
    road?: string
    ward?: string
    buildingNature?: 'Permanent' | 'Temporary'
    buildingOwnerName?: string
    buildingOwnerAddress?: string
  }
  liabilities: LiabilityType[]
  touristBoardRegistered: boolean
  touristBoardRegNo?: string
  annualAssessmentValue: number | null
  previousYearTurnover: number | null
  previousLicense?: { number: string; year?: number }
  source: 'FIELD_SURVEY' | 'APPLICATION'
  survey?: { surveyedBy: string; surveyDate: string; notes?: string }
  status: 'ACTIVE' | 'CLOSED'
  createdBy: string
  createdAt: string
  updatedAt: string
}

// ── Applications ────────────────────────────────────────────────────────────
export type ApplicationStatus =
  | 'SUBMITTED'
  | 'DOCUMENT_REVIEW'
  | 'RI_REVIEW'
  | 'UNDER_INSPECTION'
  | 'CORRECTIONS_REQUESTED'
  | 'IN_APPROVAL'
  | 'APPROVED'
  | 'LICENSED'
  | 'REJECTED'
  | 'WITHDRAWN'

export type InspectionOverallStatus =
  | 'NOT_REQUIRED'
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'CORRECTIONS_REQUIRED'
  | 'REINSPECTION'
  | 'PASSED'

export type ApprovalOverallStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED'
export type PaymentStatus = 'NOT_ASSESSED' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID'

export interface ApplicationDocument {
  id: string
  label: string
  received: boolean
  verified: boolean
  fileName?: string
  remarks?: string
}

export interface CorrectionRequest {
  id: string
  source: 'INSPECTION' | 'APPROVAL'
  issues: string
  raisedBy: string
  raisedByDesignation: Designation
  raisedAt: string
  deadline: string
  status: 'OPEN' | 'RECTIFIED' | 'DEADLINE_MISSED'
  /** Inspection types that must be re-done once rectified. */
  reinspectionTypes: InspectionType[]
  resolvedAt?: string
  resolutionNote?: string
}

export interface FeeAssessment {
  basis: 'ASSESSMENT_BAND' | 'TOURIST_HOTEL_TURNOVER' | 'MANUAL'
  baseValue: number | null
  bandLabel?: string
  licenseFee: number
  stampDuty: number
  ruleConfirmed: boolean
  manualReason?: string
  assessedBy: string
  assessedAt: string
}

export interface Application {
  id: string
  ref: string
  licenseYear: number
  type: 'NEW' | 'RENEWAL'
  channel: 'ONLINE' | 'COUNTER'
  portalRef?: string
  businessKey: string
  applicant: {
    name: string
    nic: string
    phone: string
    email?: string
    relationship: 'Owner' | 'Authorised Agent'
  }
  categoryId: string
  declaredLastYearIncome: number | null
  documents: ApplicationDocument[]
  documentsVerifiedBy?: string
  documentsVerifiedAt?: string
  requiredInspections: InspectionType[]
  mohSignOffRequired: boolean
  riReview?: { by: string; at: string; notes?: string }
  approvalStages: ApprovalStage[]
  currentApprovalStage: ApprovalStage | null
  status: ApplicationStatus
  inspectionStatus: InspectionOverallStatus
  approvalStatus: ApprovalOverallStatus
  feeAssessment?: FeeAssessment
  licenseId?: string
  correctionRequests: CorrectionRequest[]
  rejectionReason?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

// ── Inspections ─────────────────────────────────────────────────────────────
export type ChecklistResult = 'COMPLIANT' | 'NON_COMPLIANT' | 'NA'
export type InspectionRecommendation = 'RECOMMEND' | 'CORRECTIONS_REQUIRED' | 'NOT_RECOMMENDED'

export interface InspectionPhoto {
  id: string
  name: string
  dataUrl: string
  uploadedAt: string
}

export interface Inspection {
  id: string
  applicationId: string
  type: InspectionType
  round: number
  assignedTo: string
  assignedBy: string
  assignedAt: string
  dueDate?: string
  status: 'ASSIGNED' | 'REPORT_SUBMITTED' | 'CANCELLED'
  checklistTemplateId?: string
  checklist: { itemId: string; label: string; mandatory: boolean; result: ChecklistResult | null; note?: string }[]
  photos: InspectionPhoto[]
  remarks?: string
  recommendation?: InspectionRecommendation
  manualReportRef?: string
  reportSubmittedBy?: string
  reportSubmittedAt?: string
  mohSignOff?: { by: string; at: string; decision: 'ENDORSED' | 'NOT_ENDORSED'; remarks?: string }
}

// ── Approvals ───────────────────────────────────────────────────────────────
export interface ApprovalDecision {
  id: string
  applicationId: string
  stage: ApprovalStage
  decision: 'APPROVED' | 'REJECTED' | 'RETURNED'
  officer: string
  designation: Designation
  remarks: string
  at: string
}

// ── Finance ─────────────────────────────────────────────────────────────────
export type PaymentMethod = 'CASH' | 'CHEQUE' | 'BANK_TRANSFER' | 'CARD' | 'ONLINE'

export interface Charge {
  id: string
  applicationId: string
  businessKey: string
  type: ChargeType
  amount: number
  voteCode: string
  status: 'ACTIVE' | 'CANCELLED'
  createdBy: string
  createdAt: string
}

export interface Payment {
  id: string
  chargeId: string
  applicationId: string
  type: ChargeType
  amount: number
  date: string
  method: PaymentMethod
  receiptNo: string
  recordedBy: string
  recordedAt: string
}

export interface License {
  id: string
  licenseNo: string
  applicationId: string
  businessKey: string
  businessId: string
  licenseYear: number
  issueDate: string
  validFrom: string
  validUntil: string
  validityConfirmed: boolean
  issuedBy: string
  status: 'ACTIVE' | 'REVOKED'
  outstandingAtIssue: number
}

// ── Non-compliance & legal notice ───────────────────────────────────────────
export type NoticeReason = 'NO_LICENSE' | 'UNPAID_FEE' | 'CORRECTIONS_NOT_MET' | 'OTHER'
export type NoticeStatus = 'ISSUED' | 'COMPLIED' | 'REFERRED_TO_LEGAL' | 'COURT_ACTION' | 'CLOSED'

export interface LegalNotice {
  id: string
  noticeNo: string
  businessKey: string
  applicationId?: string
  reason: NoticeReason
  reasonDetails: string
  issueDate: string
  deadline: string
  service: { method: 'HAND_DELIVERED' | 'REGISTERED_POST' | 'AFFIXED_AT_PREMISES' | 'OTHER'; servedBy: string; servedOn: string; details?: string }
  responsibleOfficer: string
  status: NoticeStatus
  response?: { date: string; details: string; recordedBy: string }
  legalReferral?: { date: string; referredBy: string; remarks?: string }
  court?: { court: string; caseNo: string; hearingDate?: string; outcome?: string }
  prohibitionOrder?: { ref: string; date: string; details: string }
  createdBy: string
  createdAt: string
  updatedAt: string
}

// ── Audit ───────────────────────────────────────────────────────────────────
export interface AuditEntry {
  id: string
  at: string
  actor: string
  designation: Designation | 'Public Portal'
  action: string
  entityType: 'APPLICATION' | 'BUSINESS' | 'INSPECTION' | 'APPROVAL' | 'CHARGE' | 'PAYMENT' | 'LICENSE' | 'NOTICE' | 'SETTINGS'
  entityId: string
  details: string
}

// ── Persistence root ────────────────────────────────────────────────────────
export interface TradeLicenseDb {
  version: 1
  settings: TradeLicenseSettings
  categories: BusinessCategory[]
  checklists: ChecklistTemplate[]
  businesses: Business[]
  applications: Application[]
  inspections: Inspection[]
  approvals: ApprovalDecision[]
  charges: Charge[]
  payments: Payment[]
  licenses: License[]
  notices: LegalNotice[]
  audit: AuditEntry[]
  sequences: Record<string, number>
}
