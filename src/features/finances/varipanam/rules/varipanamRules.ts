import type {
  Property,
  PropertyPaymentStatus,
  PropertyType,
  VaripanamSettings,
  DueQuarter,
  LocationHistory,
} from '../types/varipanam'

/**
 * Calculates annual and quarterly tax for a property based on its assessed value and type.
 */
export function calculateTax(
  assessedValue: number,
  propertyType: PropertyType,
  settings: VaripanamSettings
): { annualTax: number; quarterlyTax: number; effectiveRate: number } {
  let ratePercentage = settings.taxRates.residential
  switch (propertyType) {
    case 'Commercial':
      ratePercentage = settings.taxRates.commercial
      break
    case 'Government':
      ratePercentage = settings.taxRates.government
      break
    case 'Religious':
      ratePercentage = settings.taxRates.religious
      break
    case 'Bare land':
      ratePercentage = settings.taxRates.bareLand
      break
    case 'Residential':
    default:
      ratePercentage = settings.taxRates.residential
      break
  }

  const annualTax = Math.round((assessedValue * ratePercentage) / 100)
  const quarterlyTax = Math.round(annualTax / 4)
  return { annualTax, quarterlyTax, effectiveRate: ratePercentage }
}

/**
 * Checks if a given payment date qualifies for the 10% annual discount (by Jan 31).
 */
export function isEligibleForAnnualDiscount(date: Date): boolean {
  // Month is 0-indexed in JS: 0 = January
  return date.getMonth() === 0 && date.getDate() <= 31
}

/**
 * Checks if a given payment date qualifies for the 5% quarterly discount (within first month of that quarter).
 * Q1: Jan 1-31 (Month 0)
 * Q2: Apr 1-30 (Month 3)
 * Q3: Jul 1-31 (Month 6)
 * Q4: Oct 1-31 (Month 9)
 */
export function isEligibleForQuarterlyDiscount(date: Date, quarter: number): boolean {
  const month = date.getMonth()
  switch (quarter) {
    case 1:
      return month === 0
    case 2:
      return month === 3
    case 3:
      return month === 6
    case 4:
      return month === 9
    default:
      return false
  }
}

export interface PaymentAllocationResult {
  totalPaid: number
  arrearsPrincipalPaid: number
  warrantPenaltyPaid: number
  currentYearPaid: number
  discountGiven: number
  totalDuesCleared: number
  remainingDues: DueQuarter[]
  details: string[]
}

/**
 * Pure function: Calculates payment allocation against arrears and current year dues.
 * - Prioritizes OLDEST dues first.
 * - Applies 15% warrant penalty ONLY if a signed warrant exists.
 * - Does NOT grant 5% quarterly discount on part-payments.
 * - Grants 5% quarterly discount on full quarter payment if paid within the first month.
 */
export function allocatePayment(params: {
  property: Property
  paymentAmount: number
  paymentDate: Date
  settings: VaripanamSettings
}): PaymentAllocationResult {
  const { property, paymentAmount, paymentDate, settings } = params
  let balance = paymentAmount
  let arrearsPrincipalPaid = 0
  let warrantPenaltyPaid = 0
  let currentYearPaid = 0
  let discountGiven = 0
  let totalDuesCleared = 0
  const details: string[] = []

  const paymentYear = paymentDate.getFullYear()
  const hasWarrant = !!(property.activeWarrant && property.activeWarrant.status === 'ISSUED')
  const penaltyRate = hasWarrant ? (settings.warrantPenaltyPercentage || 15) / 100 : 0

  // Clone dues sorted oldest first (year asc, quarter asc)
  const sortedDues: DueQuarter[] = JSON.parse(JSON.stringify(property.dues)).sort(
    (a: DueQuarter, b: DueQuarter) => a.year - b.year || a.quarter - b.quarter
  )

  // Step 1: Pay Arrears (dues from years prior to paymentYear, or past quarters)
  const arrearsDues = sortedDues.filter((d) => d.year < paymentYear && d.paidAmount < d.amount)
  for (const due of arrearsDues) {
    if (balance <= 0) break

    const unpaidPrincipal = due.amount - due.paidAmount
    const penaltyForDue = hasWarrant ? unpaidPrincipal * penaltyRate : 0
    const totalRequired = unpaidPrincipal + penaltyForDue

    if (balance >= totalRequired) {
      // Fully clear this arrears quarter
      balance -= totalRequired
      arrearsPrincipalPaid += unpaidPrincipal
      warrantPenaltyPaid += penaltyForDue
      due.paidAmount = due.amount
      due.status = 'Paid'
      totalDuesCleared += unpaidPrincipal
      details.push(
        `Cleared arrears for ${due.year} Q${due.quarter}: Principal Rs. ${unpaidPrincipal}` +
          (penaltyForDue > 0 ? ` + Warrant Penalty (15%) Rs. ${penaltyForDue}` : '')
      )
    } else {
      // Partial payment towards arrears (penalty portion paid proportionally if warrant exists)
      const ratio = hasWarrant ? 1 / (1 + penaltyRate) : 1
      const principalPortion = Math.round(balance * ratio)
      const penaltyPortion = balance - principalPortion

      arrearsPrincipalPaid += principalPortion
      warrantPenaltyPaid += penaltyPortion
      due.paidAmount += principalPortion
      balance = 0
      details.push(
        `Partial payment for ${due.year} Q${due.quarter}: Principal Rs. ${principalPortion}` +
          (penaltyPortion > 0 ? ` + Penalty Rs. ${penaltyPortion}` : '')
      )
    }
  }

  // Step 2: Pay Current Year dues
  const currentDues = sortedDues.filter((d) => d.year === paymentYear && d.paidAmount < d.amount)
  for (const due of currentDues) {
    if (balance <= 0) break

    const unpaid = due.amount - due.paidAmount
    const eligibleForDiscount =
      isEligibleForQuarterlyDiscount(paymentDate, due.quarter) && due.paidAmount === 0

    // Full quarter payable with discount if eligible
    const discountedPayable = eligibleForDiscount
      ? Math.round(unpaid * (1 - settings.quarterlyPaymentDiscount / 100))
      : unpaid

    if (balance >= discountedPayable) {
      // Can fully pay this quarter
      balance -= discountedPayable
      due.paidAmount = due.amount
      due.status = 'Paid'
      currentYearPaid += discountedPayable
      totalDuesCleared += due.amount
      const discount = eligibleForDiscount ? unpaid - discountedPayable : 0
      discountGiven += discount
      details.push(
        `Fully paid ${due.year} Q${due.quarter}: Paid Rs. ${discountedPayable}` +
          (discount > 0 ? ` (Includes 5% discount Rs. ${discount})` : '')
      )
    } else {
      // Part payment -> NO 5% DISCOUNT allowed on part payment
      const partAmount = balance
      due.paidAmount += partAmount
      currentYearPaid += partAmount
      balance = 0
      details.push(
        `Part payment for ${due.year} Q${due.quarter}: Rs. ${partAmount} (No 5% discount on partial payments)`
      )
    }
  }

  return {
    totalPaid: paymentAmount - balance,
    arrearsPrincipalPaid,
    warrantPenaltyPaid,
    currentYearPaid,
    discountGiven,
    totalDuesCleared,
    remainingDues: sortedDues,
    details,
  }
}

/**
 * Pure function: Computes the payment status of a property.
 * MUST NEVER mutate the property, change due amounts, or issue warrants.
 *
 * Status definition:
 * - 'Warrant issued': active warrant with status 'ISSUED'
 * - 'Overdue': has unpaid dues past their due date
 * - 'Due soon': upcoming quarter due date is within settings.dueSoonWindowDays (default 14 days)
 * - 'Paid': all due amounts up to the evaluation date are fully settled
 */
export function computeStatus(
  property: Property,
  today: Date = new Date(),
  settings: VaripanamSettings
): PropertyPaymentStatus {
  // 1. Warrant issued check
  if (property.activeWarrant && property.activeWarrant.status === 'ISSUED') {
    return 'Warrant issued'
  }

  // Local date formatted as YYYY-MM-DD
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  const todayDateStr = `${y}-${m}-${d}`

  const todayTime = today.getTime()
  const windowMs = (settings.dueSoonWindowDays || 14) * 24 * 60 * 60 * 1000

  let hasOverdue = false
  let hasDueSoon = false
  let hasPendingCurrentDues = false

  for (const due of property.dues) {
    const isUnpaid = due.paidAmount < due.amount
    if (!isUnpaid) continue

    const dueDateTime = new Date(due.dueDate + 'T23:59:59Z').getTime()
    const dueDateIso = due.dueDate

    if (dueDateIso < todayDateStr) {
      // Due date has passed and payment is incomplete
      hasOverdue = true
    } else if (dueDateTime >= todayTime && dueDateTime - todayTime <= windowMs) {
      // Due date is within the dueSoonWindow
      hasDueSoon = true
      hasPendingCurrentDues = true
    } else {
      hasPendingCurrentDues = true
    }
  }

  if (hasOverdue) {
    return 'Overdue'
  }

  if (hasDueSoon || hasPendingCurrentDues) {
    return 'Due soon'
  }

  return 'Paid'
}

/**
 * Validates adding a new property:
 * - Assessment number must be unique and non-empty.
 * - Coordinates must be valid numbers.
 * - Proximity warning if another property is within ~15 meters.
 */
export function validateNewProperty(
  newAssessmentNumber: string,
  newCoords: { latitude: number; longitude: number },
  existingProperties: Property[]
): { isValid: boolean; error?: string; warning?: string } {
  const trimmed = newAssessmentNumber.trim()
  if (!trimmed) {
    return { isValid: false, error: 'Assessment number is required.' }
  }

  const isDuplicate = existingProperties.some(
    (p) => p.assessmentNumber.trim().toLowerCase() === trimmed.toLowerCase()
  )
  if (isDuplicate) {
    return {
      isValid: false,
      error: `Assessment number "${trimmed}" is already assigned to an existing property unit. It cannot be duplicated or overwritten.`,
    }
  }

  // Check ~15m proximity (~0.00015 deg lat/long)
  const nearby = existingProperties.find((p) => {
    const dLat = Math.abs(p.latitude - newCoords.latitude)
    const dLng = Math.abs(p.longitude - newCoords.longitude)
    return dLat < 0.00015 && dLng < 0.00015
  })

  let warning: string | undefined
  if (nearby) {
    warning = `Warning: This pin is within ~15 meters of existing property ${nearby.assessmentNumber}. Ensure this is a distinct assessment unit.`
  }

  return { isValid: true, warning }
}

/**
 * Creates an immutable location history record.
 */
export function recordLocationChange(
  property: Property,
  newLatitude: number,
  newLongitude: number,
  changedBy: string,
  reason: string
): { updatedProperty: Property; historyEntry: LocationHistory } {
  const historyEntry: LocationHistory = {
    id: `lh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    propertyId: property.id,
    oldLatitude: property.latitude,
    oldLongitude: property.longitude,
    newLatitude,
    newLongitude,
    changedBy,
    changedAt: new Date().toISOString(),
    reason,
  }

  const updatedProperty: Property = {
    ...property,
    latitude: newLatitude,
    longitude: newLongitude,
    updatedAt: new Date().toISOString(),
  }

  return { updatedProperty, historyEntry }
}
