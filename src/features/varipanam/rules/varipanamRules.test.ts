import {
  calculateTax,
  allocatePayment,
  computeStatus,
  validateNewProperty,
  recordLocationChange,
  calculateReliefTax,
  distributeSubdivisionArrears,
} from './varipanamRules'
import type { Property, VaripanamSettings, DueQuarter } from '../types/varipanam'
import { DEFAULT_VARIPANAM_SETTINGS } from '../mock/varipanamMockData'

/*
 * Self-contained Test Runner for Varipanam Business Rules
 */

let passedCount = 0
let failedCount = 0

function assert(condition: boolean, message: string) {
  if (condition) {
    passedCount++
    console.log(`  ✓ ${message}`)
  } else {
    failedCount++
    console.error(`  ✗ FAIL: ${message}`)
  }
}

function assertEquals(actual: unknown, expected: unknown, message: string) {
  if (actual === expected) {
    passedCount++
    console.log(`  ✓ ${message}`)
  } else {
    failedCount++
    console.error(`  ✗ FAIL: ${message} (Expected: ${expected}, Got: ${actual})`)
  }
}

console.log('\n======================================================')
console.log('RUNNING VARIPANAM BUSINESS RULES & COMPUTE-STATUS TESTS')
console.log('======================================================\n')

// ── Test Case 1: Domestic Property Payment on 21/01/2026 ─────────────────────
console.log('Test 1: Domestic Property Payment Allocation (Date: 21/01/2026)')
console.log('Annual Tax: Rs. 20,000 (Quarterly Rs. 5,000), Arrears: 2 quarters of 2025 = Rs. 10,000')

const settings: VaripanamSettings = {
  ...DEFAULT_VARIPANAM_SETTINGS,
  taxRates: { ...DEFAULT_VARIPANAM_SETTINGS.taxRates, residential: 10 },
  warrantPenaltyPercentage: 15,
  quarterlyPaymentDiscount: 5,
}

// Assessed value 200,000 at 10% = 20,000 annual, 5,000 quarterly
const taxCalc = calculateTax(200000, 'Residential', settings)
assertEquals(taxCalc.annualTax, 20000, 'Calculates annual tax of Rs. 20,000')
assertEquals(taxCalc.quarterlyTax, 5000, 'Calculates quarterly tax of Rs. 5,000')

const baseDomesticProperty: Property = {
  id: 'test-prop-01',
  assessmentNumber: 'DOM-TEST-01',
  propertyNumber: 'No. 12',
  description: 'Residential single-family house',
  propertyType: 'Residential',
  annualAssessedValue: 200000,
  latitude: 6.842,
  longitude: 80.003,
  zoneId: 'zone-homagama',
  wardId: 'ward-01',
  roadId: 'road-hmg-01',
  currentOwner: {
    id: 'own-01',
    name: 'Perera',
    nic: '1975000001',
    mobile: '+94 77 111 2222',
    postalAddress: 'Homagama',
  },
  status: 'Overdue',
  dues: [
    { id: 'd-25-q3', propertyId: 'test-prop-01', year: 2025, quarter: 3, amount: 5000, paidAmount: 0, status: 'Overdue', dueDate: '2025-09-30' },
    { id: 'd-25-q4', propertyId: 'test-prop-01', year: 2025, quarter: 4, amount: 5000, paidAmount: 0, status: 'Overdue', dueDate: '2025-12-31' },
    { id: 'd-26-q1', propertyId: 'test-prop-01', year: 2026, quarter: 1, amount: 5000, paidAmount: 0, status: 'Due', dueDate: '2026-03-31' },
    { id: 'd-26-q2', propertyId: 'test-prop-01', year: 2026, quarter: 2, amount: 5000, paidAmount: 0, status: 'Due', dueDate: '2026-06-30' },
  ],
  createdAt: '2025-01-01',
  updatedAt: '2026-01-01',
}

// 1.A: Warrant NOT issued, customer pays to clear arrears + 2026 Q1
// Expected: 10,000 (arrears) + (5,000 * 95%) = 14,750
const paymentDateJan21 = new Date(2026, 0, 21) // 21 Jan 2026
const allocWithoutWarrant = allocatePayment({
  property: { ...baseDomesticProperty, activeWarrant: undefined },
  paymentAmount: 14750,
  paymentDate: paymentDateJan21,
  settings,
})

assertEquals(allocWithoutWarrant.arrearsPrincipalPaid, 10000, '1.A: Clears Rs. 10,000 arrears principal with no penalty')
assertEquals(allocWithoutWarrant.warrantPenaltyPaid, 0, '1.A: Zero penalty applied when warrant NOT issued')
assertEquals(allocWithoutWarrant.currentYearPaid, 4750, '1.A: Pays Rs. 4,750 for 2026 Q1')
assertEquals(allocWithoutWarrant.discountGiven, 250, '1.A: 5% quarterly discount applied (Rs. 250) for payment in first month')
assertEquals(allocWithoutWarrant.totalPaid, 14750, '1.A: Total paid is Rs. 14,750 (10,000 + 4,750)')

// 1.B: Warrant ISSUED (manual), customer pays Rs. 15,000
// Expected: 10,000 * 115% = 11,500; remaining 3,500 goes to 2026 Q1 with NO 5% discount (part payment)
const propertyWithWarrant: Property = {
  ...baseDomesticProperty,
  status: 'Warrant issued',
  activeWarrant: {
    id: 'war-test-01',
    propertyId: 'test-prop-01',
    assessmentNumber: 'DOM-TEST-01',
    status: 'ISSUED',
    issuedDate: '2026-01-10',
    warrantCost: 1500,
    penaltyPercentage: 15,
    chainSteps: [],
  },
}

const allocWithWarrant = allocatePayment({
  property: propertyWithWarrant,
  paymentAmount: 15000,
  paymentDate: paymentDateJan21,
  settings,
})

assertEquals(allocWithWarrant.arrearsPrincipalPaid, 10000, '1.B: Arrears principal of Rs. 10,000 cleared')
assertEquals(allocWithWarrant.warrantPenaltyPaid, 1500, '1.B: 15% warrant penalty of Rs. 1,500 paid')
assertEquals(allocWithWarrant.currentYearPaid, 3500, '1.B: Remaining Rs. 3,500 goes to 2026 Q1')
assertEquals(allocWithWarrant.discountGiven, 0, '1.B: NO 5% discount on part payment of 2026 Q1')
assertEquals(allocWithWarrant.totalPaid, 15000, '1.B: Total paid is Rs. 15,000 (10,000 + 1,500 + 3,500)')

// ── Test Case 2: computeStatus Pure Function ────────────────────────────────
console.log('\nTest 2: computeStatus() Around Due Dates & Status Transitions')

const sampleDues: DueQuarter[] = [
  { id: 'q1', propertyId: 'p1', year: 2026, quarter: 1, amount: 5000, paidAmount: 0, status: 'Due', dueDate: '2026-03-31' },
]

const testPropForStatus: Property = {
  ...baseDomesticProperty,
  activeWarrant: undefined,
  dues: sampleDues,
}

// 2.A: Date is 2026-01-15 (more than 14 days before 2026-03-31)
const statusJan15 = computeStatus(testPropForStatus, new Date(2026, 0, 15), settings)
assertEquals(statusJan15, 'Due soon', '2.A: Returns "Due soon" for upcoming current quarter dues')

// 2.B: Date is 2026-03-20 (11 days before due date, inside 14-day window)
const statusMar20 = computeStatus(testPropForStatus, new Date(2026, 2, 20), settings)
assertEquals(statusMar20, 'Due soon', '2.B: Returns "Due soon" within 14-day due window')

// 2.C: Date is 2026-04-01 (1 day after 2026-03-31 due date) -> Overdue
const statusApr01 = computeStatus(testPropForStatus, new Date(2026, 3, 1), settings)
assertEquals(statusApr01, 'Overdue', '2.C: Returns "Overdue" when past due date without full payment')

// 2.D: Property has active warrant with status 'ISSUED' -> 'Warrant issued'
const statusWarrant = computeStatus(
  {
    ...testPropForStatus,
    activeWarrant: {
      id: 'w1',
      propertyId: 'p1',
      assessmentNumber: 'DOM-TEST-01',
      status: 'ISSUED',
      issuedDate: '2026-04-05',
      warrantCost: 750,
      penaltyPercentage: 15,
      chainSteps: [],
    },
  },
  new Date(2026, 3, 10),
  settings
)
assertEquals(statusWarrant, 'Warrant issued', '2.D: Returns "Warrant issued" when active signed warrant exists')

// 2.E: All dues are fully paid -> 'Paid'
const fullyPaidProp: Property = {
  ...testPropForStatus,
  activeWarrant: undefined,
  dues: [
    { id: 'q1', propertyId: 'p1', year: 2026, quarter: 1, amount: 5000, paidAmount: 5000, status: 'Paid', dueDate: '2026-03-31' },
  ],
}
const statusPaid = computeStatus(fullyPaidProp, new Date(2026, 0, 20), settings)
assertEquals(statusPaid, 'Paid', '2.E: Returns "Paid" when all dues are fully paid')

// ── Test Case 3: Filtering Properties by Zone & Road ────────────────────────
console.log('\nTest 3: Property Filtering by Zone & Road')

const propertyPool: Property[] = [
  { ...baseDomesticProperty, id: 'p1', zoneId: 'zone-homagama', roadId: 'road-hmg-01' },
  { ...baseDomesticProperty, id: 'p2', zoneId: 'zone-homagama', roadId: 'road-hmg-02' },
  { ...baseDomesticProperty, id: 'p3', zoneId: 'zone-wateraka', roadId: 'road-wtk-01' },
]

const filteredRoadHmg01 = propertyPool.filter((p) => p.zoneId === 'zone-homagama' && p.roadId === 'road-hmg-01')
assertEquals(filteredRoadHmg01.length, 1, '3: Filtering by zone and road returns only properties in that specific road')
assertEquals(filteredRoadHmg01[0].id, 'p1', '3: Correct property returned')

// ── Test Case 4: Duplicate Assessment Number Validation ─────────────────────
console.log('\nTest 4: Duplicate Assessment Number Rejection')

const existingProps: Property[] = [
  { ...baseDomesticProperty, assessmentNumber: '78/12a' },
  { ...baseDomesticProperty, assessmentNumber: '45/2' },
]

const validNew = validateNewProperty('99/New', { latitude: 6.845, longitude: 80.005 }, existingProps)
assert(validNew.isValid, '4.A: Unique assessment number "99/New" is accepted')

const duplicateNew = validateNewProperty('78/12a', { latitude: 6.845, longitude: 80.005 }, existingProps)
assert(!duplicateNew.isValid, '4.B: Exact duplicate assessment number "78/12a" is rejected')

const caseInsensitiveDuplicate = validateNewProperty('  78/12A  ', { latitude: 6.845, longitude: 80.005 }, existingProps)
assert(!caseInsensitiveDuplicate.isValid, '4.C: Trimmed, case-insensitive duplicate assessment number is rejected')

// ── Test Case 5: Location History Immutability ──────────────────────────────
console.log('\nTest 5: Location History Immutability & Coordinate Tracking')

const propBeforeLocationChange: Property = {
  ...baseDomesticProperty,
  latitude: 6.8421,
  longitude: 80.0028,
}

const { updatedProperty, historyEntry } = recordLocationChange(
  propBeforeLocationChange,
  6.8435,
  80.0042,
  'Super Admin',
  'Survey boundary verified by Municipal Cartographer'
)

assertEquals(historyEntry.oldLatitude, 6.8421, '5.A: Old latitude (6.8421) is preserved in history')
assertEquals(historyEntry.oldLongitude, 80.0028, '5.A: Old longitude (80.0028) is preserved in history')
assertEquals(historyEntry.newLatitude, 6.8435, '5.B: New latitude is recorded in history entry')
assertEquals(historyEntry.newLongitude, 80.0042, '5.B: New longitude is recorded in history entry')
assertEquals(historyEntry.reason, 'Survey boundary verified by Municipal Cartographer', '5.C: Change reason is preserved')
assertEquals(updatedProperty.latitude, 6.8435, '5.D: Property coordinates updated to new position')
assert(propBeforeLocationChange.latitude === 6.8421, '5.E: Original property object was not mutated directly')

// ── Test Case 6: Commercial Property Tax Rate Calculation ──────────────────
console.log('\nTest 6: Commercial Property Tax Calculation (15% rate)')
const commCalc = calculateTax(1000000, 'Commercial', settings)
assertEquals(commCalc.effectiveRate, 15, '6.A: Commercial effective rate is 15%')
assertEquals(commCalc.annualTax, 150000, '6.B: Calculates annual tax of Rs. 150,000 for 1,000,000 assessed value')
assertEquals(commCalc.quarterlyTax, 37500, '6.C: Calculates quarterly tax of Rs. 37,500')

// ── Test Case 7: Valuation Relief Remissions (Poverty & Closed Business) ─────
console.log('\nTest 7: Statutory Valuation Relief Remissions')
const povertyRelief = calculateReliefTax(20000, 'Poverty')
assertEquals(povertyRelief.netTax, 0, '7.A: Poverty relief grants 100% remission (net tax = Rs. 0)')
assertEquals(povertyRelief.reliefAmount, 20000, '7.B: Poverty relief remits full Rs. 20,000')

const businessClosedRelief = calculateReliefTax(20000, 'ClosedBusiness')
assertEquals(businessClosedRelief.netTax, 10000, '7.C: Closed business grants 50% remission (net tax = Rs. 10,000)')
assertEquals(businessClosedRelief.reliefAmount, 10000, '7.D: Closed business relief remits Rs. 10,000')

// ── Test Case 8: Subdivision Arrears Distribution Rules ─────────────────────
console.log('\nTest 8: Subdivision Arrears Distribution')
const childPlots = [
  { id: 'child-1', assessedValue: 600000 },
  { id: 'child-2', assessedValue: 400000 },
]

const equalSplit = distributeSubdivisionArrears(10000, childPlots, 'EQUAL_SPLIT')
assertEquals(equalSplit['child-1'], 5000, '8.A: Equal split divides 50% (Rs. 5,000) to child-1')
assertEquals(equalSplit['child-2'], 5000, '8.B: Equal split divides 50% (Rs. 5,000) to child-2')

const propSplit = distributeSubdivisionArrears(10000, childPlots, 'VALUE_PROPORTIONAL')
assertEquals(propSplit['child-1'], 6000, '8.C: Proportional split allocates 60% (Rs. 6,000) based on assessed value')
assertEquals(propSplit['child-2'], 4000, '8.D: Proportional split allocates 40% (Rs. 4,000) based on assessed value')

const primarySplit = distributeSubdivisionArrears(10000, childPlots, 'ASSIGN_TO_PRIMARY')
assertEquals(primarySplit['child-1'], 10000, '8.E: Assign to primary allocates 100% (Rs. 10,000) to primary unit')
assertEquals(primarySplit['child-2'], 0, '8.F: Assign to primary allocates Rs. 0 to secondary unit')

console.log('\n------------------------------------------------------')
console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`)
console.log('------------------------------------------------------\n')

if (failedCount > 0) {
  process.exit(1)
}
