/*
 * Trade License business rules – pure functions, no storage, no React.
 * Covered by tradeLicenseRules.test.ts (npm run test:trade-license).
 */
import type {
  Actor,
  Application,
  ApprovalStage,
  Business,
  BusinessCategory,
  Charge,
  ChargeType,
  Designation,
  FeeBand,
  Inspection,
  InspectionOverallStatus,
  InspectionType,
  Payment,
  PaymentStatus,
  TradeLicenseSettings,
} from '../types/tradeLicense'
import { APPROVAL_STAGE_DESIGNATION, INSPECTION_TYPE_DESIGNATION } from '../config/defaultConfig'

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function daysBetween(fromIso: string, toIso: string): number {
  const ms = new Date(toIso.slice(0, 10)).getTime() - new Date(fromIso.slice(0, 10)).getTime()
  return Math.floor(ms / 86_400_000)
}

// ── Fees ────────────────────────────────────────────────────────────────────
export function findFeeBand(value: number, bands: FeeBand[]): FeeBand | null {
  return (
    bands.find(
      (b) => (b.minExclusive === null || value > b.minExclusive) && (b.maxInclusive === null || value <= b.maxInclusive)
    ) ?? null
  )
}

export function calculateStampDuty(licenseFee: number, settings: TradeLicenseSettings): number {
  if (!(licenseFee > 0)) return 0
  return round2(Math.min(licenseFee * settings.stampDutyRate, settings.stampDutyCap))
}

export type FeeCalculation =
  | {
      ok: true
      basis: 'ASSESSMENT_BAND' | 'TOURIST_HOTEL_TURNOVER'
      baseValue: number
      bandLabel?: string
      licenseFee: number
      stampDuty: number
      /** False when the rule used has not been officially confirmed. */
      confirmed: boolean
      explanation: string
    }
  | { ok: false; reason: string }

/**
 * Licence fee per the requirements:
 *  - Tourist Board registered hotel → previous year's turnover × 1%
 *  - Otherwise → fee for the annual assessment value band
 * Stamp duty → licence fee × 10%, capped at Rs. 2,000.
 */
export function calculateLicenseFee(business: Business, settings: TradeLicenseSettings): FeeCalculation {
  if (business.touristBoardRegistered) {
    const turnover = business.previousYearTurnover
    if (turnover === null || turnover === undefined || !(turnover > 0)) {
      return { ok: false, reason: "Previous year's turnover is required for a Tourist Board registered hotel." }
    }
    const licenseFee = round2(turnover * settings.touristHotelTurnoverRate)
    return {
      ok: true,
      basis: 'TOURIST_HOTEL_TURNOVER',
      baseValue: turnover,
      licenseFee,
      stampDuty: calculateStampDuty(licenseFee, settings),
      confirmed: true,
      explanation: `Previous year's turnover × ${(settings.touristHotelTurnoverRate * 100).toFixed(2)}%`,
    }
  }

  const value = business.annualAssessmentValue
  if (value === null || value === undefined || !(value >= 0)) {
    return { ok: false, reason: 'Annual assessment value is not recorded for this business.' }
  }
  const band = findFeeBand(value, settings.feeBands)
  if (!band) {
    return {
      ok: false,
      reason: `No configured fee band covers an annual assessment value of ${value}. Update the fee rules.`,
    }
  }
  if (band.licenseFee === null) {
    return {
      ok: false,
      reason: `The licence fee for assessment band "${band.label}" has not been provided. Configure it in Fee Rules.`,
    }
  }
  return {
    ok: true,
    basis: 'ASSESSMENT_BAND',
    baseValue: value,
    bandLabel: band.label,
    licenseFee: band.licenseFee,
    stampDuty: calculateStampDuty(band.licenseFee, settings),
    confirmed: band.confirmed,
    explanation: `Annual assessment value band "${band.label}"`,
  }
}

// ── Charges & payments ──────────────────────────────────────────────────────
export function chargeBalance(charge: Charge, payments: Payment[]) {
  const paid = round2(payments.filter((p) => p.chargeId === charge.id).reduce((s, p) => s + p.amount, 0))
  const outstanding = round2(Math.max(0, charge.amount - paid))
  const status: PaymentStatus = paid <= 0 ? (charge.amount > 0 ? 'UNPAID' : 'PAID') : outstanding > 0 ? 'PARTIALLY_PAID' : 'PAID'
  return { paid, outstanding, status }
}

/** Combined payment status across one or more charge types of an application. */
export function paymentStatusFor(
  applicationId: string,
  types: ChargeType[],
  charges: Charge[],
  payments: Payment[]
): { status: PaymentStatus; amount: number; paid: number; outstanding: number } {
  const relevant = charges.filter((c) => c.applicationId === applicationId && c.status === 'ACTIVE' && types.includes(c.type))
  if (relevant.length === 0) return { status: 'NOT_ASSESSED', amount: 0, paid: 0, outstanding: 0 }
  let amount = 0
  let paid = 0
  relevant.forEach((c) => {
    const b = chargeBalance(c, payments)
    amount += c.amount
    paid += b.paid
  })
  amount = round2(amount)
  paid = round2(paid)
  const outstanding = round2(Math.max(0, amount - paid))
  const status: PaymentStatus = outstanding <= 0 ? 'PAID' : paid > 0 ? 'PARTIALLY_PAID' : 'UNPAID'
  return { status, amount, paid, outstanding }
}

export function validatePaymentAmount(
  amount: number,
  outstanding: number,
  settings: TradeLicenseSettings
): string | null {
  if (!(amount > 0)) return 'Payment amount must be greater than zero.'
  if (round2(amount) > round2(outstanding)) return `Payment exceeds the outstanding balance (Rs. ${outstanding.toFixed(2)}).`
  if (round2(amount) < round2(outstanding) && !settings.allowPartialPayments) {
    return 'Partial payments are not enabled. Record the full outstanding amount or enable partial payments in Fee Rules.'
  }
  return null
}

// ── Workflow ────────────────────────────────────────────────────────────────
export function resolveApprovalStages(category: BusinessCategory | undefined, settings: TradeLicenseSettings): ApprovalStage[] {
  const stages = category && category.approvalStages.length > 0 ? category.approvalStages : settings.approvalChain
  // Secretary signature and Chairman final signature are always part of the process (PDF).
  const required: ApprovalStage[] = [...stages]
  if (!required.includes('SECRETARY')) required.push('SECRETARY')
  if (!required.includes('CHAIRMAN')) required.push('CHAIRMAN')
  const order: ApprovalStage[] = ['RI_VERIFICATION', 'CHIEF_INSPECTOR', 'SECRETARY', 'CHAIRMAN']
  return order.filter((s) => required.includes(s))
}

export function nextApprovalStage(stages: ApprovalStage[], current: ApprovalStage): ApprovalStage | null {
  const i = stages.indexOf(current)
  return i >= 0 && i < stages.length - 1 ? stages[i + 1] : null
}

/** Latest (highest round, not cancelled) inspection per required type. */
export function latestInspections(app: Application, inspections: Inspection[]): Partial<Record<InspectionType, Inspection>> {
  const out: Partial<Record<InspectionType, Inspection>> = {}
  inspections
    .filter((i) => i.applicationId === app.id && i.status !== 'CANCELLED')
    .forEach((i) => {
      const cur = out[i.type]
      if (!cur || i.round > cur.round) out[i.type] = i
    })
  return out
}

export function inspectionPassed(app: Application, insp: Inspection): boolean {
  if (insp.status !== 'REPORT_SUBMITTED' || insp.recommendation !== 'RECOMMEND') return false
  if (insp.type === 'PHI' && app.mohSignOffRequired) return insp.mohSignOff?.decision === 'ENDORSED'
  return true
}

export function inspectionComplete(app: Application, insp: Inspection): boolean {
  if (insp.status !== 'REPORT_SUBMITTED') return false
  if (insp.type === 'PHI' && app.mohSignOffRequired && insp.recommendation === 'RECOMMEND') return !!insp.mohSignOff
  return true
}

export interface InspectionOutcome {
  status: InspectionOverallStatus
  allComplete: boolean
  failingTypes: InspectionType[]
  unassignedTypes: InspectionType[]
}

export function evaluateInspections(app: Application, inspections: Inspection[]): InspectionOutcome {
  if (app.requiredInspections.length === 0) {
    return { status: 'NOT_REQUIRED', allComplete: true, failingTypes: [], unassignedTypes: [] }
  }
  const latest = latestInspections(app, inspections)
  const unassignedTypes = app.requiredInspections.filter((t) => !latest[t])
  const records = app.requiredInspections.map((t) => latest[t]).filter((x): x is Inspection => !!x)
  const allComplete = unassignedTypes.length === 0 && records.every((r) => inspectionComplete(app, r))
  const failingTypes = records.filter((r) => inspectionComplete(app, r) && !inspectionPassed(app, r)).map((r) => r.type)
  const isReinspection = records.some((r) => r.round > 1)

  let status: InspectionOverallStatus
  if (records.length === 0) status = 'NOT_STARTED'
  else if (allComplete && failingTypes.length === 0) status = 'PASSED'
  else if (allComplete && failingTypes.length > 0) status = 'CORRECTIONS_REQUIRED'
  else status = isReinspection ? 'REINSPECTION' : 'IN_PROGRESS'
  return { status, allComplete, failingTypes, unassignedTypes }
}

export function validateInspectionReport(
  checklist: Inspection['checklist'],
  recommendation: Inspection['recommendation'] | undefined,
  remarks: string | undefined
): string[] {
  const errors: string[] = []
  const unanswered = checklist.filter((c) => c.mandatory && !c.result)
  if (unanswered.length > 0) errors.push(`${unanswered.length} mandatory checklist item(s) have not been answered.`)
  if (!recommendation) errors.push('Select a recommendation.')
  const nonCompliant = checklist.filter((c) => c.mandatory && c.result === 'NON_COMPLIANT')
  if (recommendation === 'RECOMMEND' && nonCompliant.length > 0) {
    errors.push('Cannot recommend approval while mandatory items are non-compliant. Request corrections instead.')
  }
  if (recommendation && recommendation !== 'RECOMMEND' && !remarks?.trim()) {
    errors.push('Remarks are required when corrections are requested or approval is not recommended.')
  }
  return errors
}

// ── Licence validity ────────────────────────────────────────────────────────
export function licenseValidity(issueDateIso: string, settings: TradeLicenseSettings) {
  const issue = issueDateIso.slice(0, 10)
  const year = Number(issue.slice(0, 4))
  return {
    validFrom: issue,
    validUntil: settings.validityEndsDec31 ? `${year}-12-31` : addDays(issue, 364),
    confirmed: settings.validityConfirmed,
  }
}

const CLOSED: Application['status'][] = ['LICENSED', 'REJECTED', 'WITHDRAWN']

export function isApplicationOpen(app: Application): boolean {
  return !CLOSED.includes(app.status)
}

export function isApplicationOverdue(app: Application, todayIso: string, settings: TradeLicenseSettings): boolean {
  if (!isApplicationOpen(app)) return false
  const correctionOverdue = app.correctionRequests.some(
    (c) => (c.status === 'OPEN' && c.deadline < todayIso.slice(0, 10)) || c.status === 'DEADLINE_MISSED'
  )
  if (correctionOverdue) return true
  // Only count waiting time that is the council's responsibility (not time waiting on the applicant).
  if (app.status === 'CORRECTIONS_REQUESTED') return false
  return daysBetween(app.createdAt, todayIso) > settings.overdueApplicationDays
}

// ── Permissions ─────────────────────────────────────────────────────────────
export type TradeAction =
  | 'APPLICATION_CREATE'
  | 'APPLICATION_EDIT'
  | 'DOCUMENT_VERIFY'
  | 'BUSINESS_SURVEY'
  | 'RI_REVIEW'
  | 'INSPECTION_ASSIGN'
  | 'CORRECTION_MANAGE'
  | 'FEE_ASSESS'
  | 'PAYMENT_RECORD'
  | 'LICENSE_ISSUE'
  | 'NOTICE_MANAGE'
  | 'SETTINGS_MANAGE'

const PERMISSIONS: Record<TradeAction, Designation[]> = {
  APPLICATION_CREATE: ['Counter Officer', 'Revenue Inspector'],
  APPLICATION_EDIT: ['Counter Officer', 'Revenue Inspector'],
  DOCUMENT_VERIFY: ['Counter Officer', 'Revenue Inspector'],
  BUSINESS_SURVEY: ['Revenue Inspector'],
  RI_REVIEW: ['Revenue Inspector'],
  INSPECTION_ASSIGN: ['Revenue Inspector', 'Chief Inspector'],
  CORRECTION_MANAGE: ['Revenue Inspector', 'Chief Inspector'],
  FEE_ASSESS: ['Counter Officer', 'Revenue Inspector'],
  PAYMENT_RECORD: ['Counter Officer', 'Cashier'],
  LICENSE_ISSUE: ['Counter Officer', 'Secretary'],
  NOTICE_MANAGE: ['Revenue Inspector', 'Chief Inspector', 'Secretary'],
  SETTINGS_MANAGE: ['System Administrator', 'Secretary'],
}

/** Someone who acts: a single office, a list of offices, or an Actor. */
export type Who = Designation | Designation[] | Actor | undefined | null

export function officesOf(who: Who): Designation[] {
  if (!who) return []
  if (typeof who === 'string') return [who]
  if (Array.isArray(who)) return who
  return who.designations && who.designations.length ? who.designations : [who.designation]
}

/** First office of `who` that is in `allowed`, or null. */
export function pickOffice(who: Who, allowed: Designation[]): Designation | null {
  return officesOf(who).find((d) => allowed.includes(d)) ?? null
}

export function can(who: Who, action: TradeAction): boolean {
  return pickOffice(who, PERMISSIONS[action]) !== null
}

export function allowedDesignations(action: TradeAction): Designation[] {
  return PERMISSIONS[action]
}

export function canSubmitInspection(who: Who, type: InspectionType): boolean {
  return officesOf(who).includes(INSPECTION_TYPE_DESIGNATION[type])
}

export function canActOnStage(who: Who, stage: ApprovalStage | null): boolean {
  return !!stage && officesOf(who).includes(APPROVAL_STAGE_DESIGNATION[stage])
}

// ── Input validation ────────────────────────────────────────────────────────
export function isValidNic(nic: string): boolean {
  const v = nic.trim().toUpperCase()
  return /^\d{9}[VX]$/.test(v) || /^\d{12}$/.test(v)
}

export function isValidPhone(phone: string): boolean {
  const v = phone.replace(/[\s-]/g, '')
  return /^(0\d{9}|\+94\d{9})$/.test(v)
}

export function normalise(s: string | undefined): string {
  return (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}
