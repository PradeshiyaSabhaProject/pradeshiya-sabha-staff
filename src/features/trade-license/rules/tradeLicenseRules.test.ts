/*
 * Self-contained tests for the Trade License rules and end-to-end service workflow.
 * Run: npm run test:trade-license
 */
import { DEFAULT_SETTINGS } from '../config/defaultConfig'
import {
  calculateLicenseFee,
  calculateStampDuty,
  findFeeBand,
  isValidNic,
  resolveApprovalStages,
  validateInspectionReport,
  validatePaymentAmount,
} from './tradeLicenseRules'
import { reportIssues, reportNotApplied, reportNotLicensed, reportUnpaid, dashboardMetrics } from './selectors'
import { TradeLicenseService, type BusinessInput, type ApplicationInput } from '../services/tradeLicenseService'
import type { Actor, Business, Designation } from '../types/tradeLicense'

let passed = 0
let failed = 0
function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++
    console.log(`  ✓ ${msg}`)
  } else {
    failed++
    console.error(`  ✗ FAIL: ${msg}`)
  }
}
function eq(actual: unknown, expected: unknown, msg: string) {
  assert(actual === expected, `${msg}${actual === expected ? '' : ` (expected ${String(expected)}, got ${String(actual)})`}`)
}
async function rejects(p: Promise<unknown>, includes: string, msg: string) {
  try {
    await p
    assert(false, `${msg} (did not throw)`)
  } catch (e) {
    const m = (e as Error).message
    assert(m.toLowerCase().includes(includes.toLowerCase()), `${msg}${m.toLowerCase().includes(includes.toLowerCase()) ? '' : ` (got "${m}")`}`)
  }
}

const settings = structuredClone(DEFAULT_SETTINGS)
const baseBusiness = (over: Partial<Business> = {}): Business => ({
  key: 'b1',
  businessId: null,
  businessIdHistory: [],
  name: 'Test Store',
  natureOfActivity: 'Grocery',
  categoryId: 'cat-general',
  owner: { name: 'A Perera', nic: '199012345678', phone: '0771234567', address: 'Homagama' },
  premises: { address: '12 High Level Rd' },
  liabilities: ['TRADE_LICENSE'],
  touristBoardRegistered: false,
  annualAssessmentValue: 2000,
  previousYearTurnover: null,
  source: 'FIELD_SURVEY',
  status: 'ACTIVE',
  createdBy: 'x',
  createdAt: '',
  updatedAt: '',
  ...over,
})

async function main() {
  console.log('\n== Fee rules (PDF) ==')
  eq(calculateStampDuty(1000, settings), 100, 'Stamp duty = 10% of Rs. 1,000')
  eq(calculateStampDuty(50000, settings), 2000, 'Stamp duty capped at Rs. 2,000')
  eq(calculateStampDuty(20000, settings), 2000, 'Stamp duty exactly at cap')
  eq(calculateStampDuty(0, settings), 0, 'No stamp duty on zero fee')

  const band = calculateLicenseFee(baseBusiness(), settings)
  assert(band.ok && band.licenseFee === 1000 && band.stampDuty === 100 && band.confirmed, '>1500 assessment → Rs. 1,000 licence fee (confirmed)')
  const hotel = calculateLicenseFee(baseBusiness({ touristBoardRegistered: true, previousYearTurnover: 3_456_789 }), settings)
  assert(hotel.ok && hotel.licenseFee === 34567.89 && hotel.stampDuty === 2000, 'Tourist hotel → 1% of previous turnover, stamp duty capped')
  const hotelMissing = calculateLicenseFee(baseBusiness({ touristBoardRegistered: true, previousYearTurnover: null }), settings)
  assert(!hotelMissing.ok, 'Tourist hotel without turnover cannot be calculated')
  const unconfigured = calculateLicenseFee(baseBusiness({ annualAssessmentValue: 600 }), settings)
  assert(!unconfigured.ok && unconfigured.reason.includes('750'), 'Band "750" has no fee in PDF → not invented, error returned')
  const gap = calculateLicenseFee(baseBusiness({ annualAssessmentValue: 1200 }), settings)
  assert(!gap.ok && gap.reason.includes('No configured fee band'), 'Value 1001–1500 is not covered by any PDF band')
  eq(findFeeBand(1500, settings.feeBands), null, '1500 exactly is not ">1500"')
  eq(findFeeBand(1500.01, settings.feeBands)?.label, '>1500', '1500.01 is ">1500"')
  const s2 = { ...settings, feeBands: settings.feeBands.map((b) => (b.label === '750' ? { ...b, licenseFee: 400 } : b)) }
  const unconf = calculateLicenseFee(baseBusiness({ annualAssessmentValue: 600 }), s2)
  assert(unconf.ok && !unconf.confirmed, 'Configured but unconfirmed band is flagged unconfirmed')

  console.log('\n== Other rules ==')
  assert(isValidNic('901234567V') && isValidNic('199012345678') && !isValidNic('12345'), 'NIC validation')
  eq(validatePaymentAmount(500, 1000, settings)?.includes('Partial') ?? false, true, 'Partial payment blocked unless enabled')
  eq(validatePaymentAmount(500, 1000, { ...settings, allowPartialPayments: true }), null, 'Partial payment allowed when enabled')
  assert(!!validatePaymentAmount(1500, 1000, settings), 'Over-payment blocked')
  const stages = resolveApprovalStages({ approvalStages: ['RI_VERIFICATION'] } as never, settings)
  assert(stages.join() === 'RI_VERIFICATION,SECRETARY,CHAIRMAN', 'Secretary & Chairman always included')
  const errs = validateInspectionReport([{ itemId: 'a', label: 'A', mandatory: true, result: 'NON_COMPLIANT' }], 'RECOMMEND', '')
  assert(errs.some((e) => e.includes('Cannot recommend')), 'Cannot recommend with mandatory non-compliance')

  console.log('\n== End-to-end workflow (service) ==')
  const mem = new Map<string, string>()
  const store = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) }
  let now = new Date('2026-03-01T09:00:00Z')
  const svc = new TradeLicenseService(store, () => now)
  const as = (designation: Designation, name = designation): Actor => ({ name, designation })
  const admin = as('System Administrator')

  const food: BusinessInput = {
    name: 'Lanka Bites',
    natureOfActivity: 'Restaurant',
    categoryId: 'cat-food',
    owner: { name: 'N Silva', nic: '198812345678', phone: '0712345678', address: 'Godagama' },
    premises: { address: '45 Main St, Homagama', assessmentNo: '45/A', buildingNature: 'Permanent' },
    liabilities: ['TRADE_LICENSE', 'TRADE_TAX'],
    touristBoardRegistered: false,
    annualAssessmentValue: 1800,
    previousYearTurnover: null,
  }
  const appInput = (over: Partial<ApplicationInput> = {}): ApplicationInput => ({
    business: food,
    applicant: { name: 'N Silva', nic: '198812345678', phone: '0712345678', relationship: 'Owner' },
    categoryId: 'cat-food',
    licenseYear: 2026,
    type: 'NEW',
    declaredLastYearIncome: 1_200_000,
    documents: [
      { label: 'Completed application form (Part A)', received: true },
      { label: "Copy of applicant's NIC", received: true },
    ],
    processingFee: { amount: 500, acknowledgeUnconfirmed: true, payment: { method: 'CASH', receiptNo: 'R-001', date: '2026-03-01' } },
    ...over,
  })

  await rejects(svc.createCounterApplication(appInput(), as('Public Health Inspector')), 'not authorised', 'PHI cannot create applications')
  await rejects(
    svc.createCounterApplication(appInput({ processingFee: { amount: 500, payment: { method: 'CASH', receiptNo: 'R-0', date: '2026-03-01' } } }), as('Counter Officer')),
    'not officially confirmed',
    'Unconfirmed processing fee must be acknowledged'
  )
  const app = await svc.createCounterApplication(appInput(), as('Counter Officer'))
  let db = await svc.getSnapshot()
  const biz = db.businesses[0]
  eq(app.status, 'DOCUMENT_REVIEW', 'Counter application with paid processing fee → document review')
  assert(!!biz.businessId?.startsWith('TLB-'), `Business ID issued on processing fee payment (${biz.businessId})`)
  eq(db.charges.filter((c) => c.type === 'PROCESSING_FEE').length, 1, 'Processing fee recorded as its own charge')
  await rejects(svc.createCounterApplication(appInput({ businessKey: biz.key, business: undefined }), as('Counter Officer')), 'already exists', 'Duplicate open application blocked')
  await rejects(svc.createCounterApplication(appInput(), as('Counter Officer')), 'already registered', 'Duplicate business record blocked')

  await rejects(svc.completeDocumentVerification(app.id, as('Counter Officer')), 'not yet received/verified', 'Documents must be verified')
  await svc.updateDocuments(app.id, app.documents.map((d) => ({ ...d, verified: true })), as('Counter Officer'))
  let a = await svc.completeDocumentVerification(app.id, as('Counter Officer'))
  eq(a.status, 'RI_REVIEW', 'Documents validated → RI review')

  await rejects(svc.completeRiReview(app.id, { requiredInspections: ['RI_BYLAW'] }, as('Revenue Inspector')), 'cannot be removed', 'Category-mandatory PHI inspection cannot be dropped')
  a = await svc.completeRiReview(app.id, { requiredInspections: ['RI_BYLAW', 'PHI'] }, as('Revenue Inspector'))
  eq(a.status, 'UNDER_INSPECTION', 'RI review → under inspection')

  const ri = await svc.assignInspection(app.id, 'RI_BYLAW', { assignedTo: 'RI Perera' }, as('Revenue Inspector'))
  const phi = await svc.assignInspection(app.id, 'PHI', { assignedTo: 'PHI Silva' }, as('Revenue Inspector'))
  assert(phi.checklist.some((c) => c.label.includes('Food safety')), 'Food category uses food-specific PHI checklist')
  assert(!ri.checklist.some((c) => c.label.includes('Food safety')), 'RI checklist differs from PHI checklist')
  await rejects(svc.assignInspection(app.id, 'PHI', { assignedTo: 'x' }, as('Revenue Inspector')), 'already assigned', 'Cannot double-assign')

  const pass = (insp: typeof ri) => insp.checklist.map((c) => ({ ...c, result: 'COMPLIANT' as const }))
  await rejects(
    svc.submitInspectionReport(phi.id, { checklist: pass(phi), photos: [], recommendation: 'RECOMMEND' }, as('Revenue Inspector')),
    'Only a Public Health Inspector',
    'RI cannot submit PHI report'
  )
  await svc.submitInspectionReport(ri.id, { checklist: pass(ri), photos: [], recommendation: 'RECOMMEND' }, as('Revenue Inspector'))
  const failChecklist = phi.checklist.map((c, i) => ({ ...c, result: (i === 0 ? 'NON_COMPLIANT' : 'COMPLIANT') as 'NON_COMPLIANT' | 'COMPLIANT' }))
  await svc.submitInspectionReport(
    phi.id,
    { checklist: failChecklist, photos: [{ name: 'kitchen.jpg', dataUrl: 'data:image/png;base64,AAAA' }], recommendation: 'CORRECTIONS_REQUIRED', remarks: 'Kitchen hygiene' },
    as('Public Health Inspector')
  )
  db = await svc.getSnapshot()
  a = db.applications[0]
  eq(a.status, 'CORRECTIONS_REQUESTED', 'Failed PHI → corrections requested')
  eq(a.inspectionStatus, 'CORRECTIONS_REQUIRED', 'Inspection status kept separate: corrections required')
  const cr = a.correctionRequests[0]
  eq(cr.deadline, '2026-03-15', 'Rectification deadline = 14 days')
  assert(cr.reinspectionTypes.join() === 'PHI', 'Only failed inspection is re-inspected')

  a = await svc.rectifyCorrection(app.id, cr.id, { note: 'Kitchen cleaned' }, as('Revenue Inspector'))
  eq(a.inspectionStatus, 'REINSPECTION', 'Reinspection scheduled')
  db = await svc.getSnapshot()
  const phi2 = db.inspections.find((i) => i.type === 'PHI' && i.round === 2)!
  eq(phi2.assignedTo, 'PHI Silva', 'Reinspection assigned to same PHI (round 2)')
  await svc.submitInspectionReport(phi2.id, { checklist: pass(phi2), photos: [], recommendation: 'RECOMMEND' }, as('Public Health Inspector'))
  db = await svc.getSnapshot()
  eq(db.applications[0].status, 'UNDER_INSPECTION', 'Passed PHI still waits for MOH sign-off')
  await rejects(svc.mohSignOff(phi2.id, { decision: 'ENDORSED' }, as('Public Health Inspector')), 'Medical Officer', 'Only MOH signs off')
  await svc.mohSignOff(phi2.id, { decision: 'ENDORSED' }, as('Medical Officer of Health'))
  db = await svc.getSnapshot()
  a = db.applications[0]
  eq(a.status, 'IN_APPROVAL', 'All inspections passed → in approval')
  eq(a.currentApprovalStage, 'RI_VERIFICATION', 'First stage: RI verification')

  await rejects(svc.recordApprovalDecision(app.id, { decision: 'APPROVED', remarks: '' }, as('Chairman')), 'Only the officer', 'Chairman cannot skip ahead')
  await svc.recordApprovalDecision(app.id, { decision: 'APPROVED', remarks: '' }, as('Revenue Inspector'))
  a = await svc.recordApprovalDecision(app.id, { decision: 'RETURNED', remarks: 'Signboard missing' }, as('Chief Inspector'))
  eq(a.status, 'CORRECTIONS_REQUESTED', 'CI returns for correction')
  eq(a.approvalStatus, 'RETURNED', 'Approval status = returned')
  a = await svc.rectifyCorrection(app.id, a.correctionRequests[1].id, { note: 'Signboard installed' }, as('Revenue Inspector'))
  eq(a.currentApprovalStage, 'RI_VERIFICATION', 'After rectification, approval chain restarts')
  for (const d of ['Revenue Inspector', 'Chief Inspector', 'Secretary', 'Chairman'] as Designation[]) {
    a = await svc.recordApprovalDecision(app.id, { decision: 'APPROVED', remarks: '' }, as(d))
  }
  eq(a.status, 'APPROVED', 'Chairman final approval → approved')
  db = await svc.getSnapshot()
  eq(db.approvals.length, 6, 'Every decision recorded with officer and date')

  await rejects(svc.issueLicense(app.id, as('Counter Officer')), 'Assess the licence fee', 'Fee must be assessed before issuance')
  a = await svc.assessLicenseFee(app.id, { mode: 'RULE' }, as('Counter Officer'))
  eq(a.feeAssessment?.licenseFee, 1000, 'Licence fee from >1500 band')
  eq(a.feeAssessment?.stampDuty, 100, 'Stamp duty 10%')
  db = await svc.getSnapshot()
  eq(db.charges.filter((c) => c.status === 'ACTIVE').length, 3, 'Processing fee, licence fee and stamp duty are separate charges')

  const lic = await svc.issueLicense(app.id, as('Counter Officer'))
  eq(lic.outstandingAtIssue, 1100, 'Licence ISSUED even though Rs. 1,100 unpaid')
  eq(lic.validUntil, '2026-12-31', 'Validity to 31 December (configurable)')
  await rejects(svc.issueLicense(app.id, as('Counter Officer')), 'already been issued', 'Duplicate licence blocked')
  db = await svc.getSnapshot()
  eq(reportUnpaid(db).length, 1, 'Unpaid licence appears in "not paid" report')

  const feeCharge = db.charges.find((c) => c.type === 'LICENSE_FEE' && c.status === 'ACTIVE')!
  await rejects(svc.recordPayment(feeCharge.id, { amount: 1000, date: '2026-03-01', method: 'CASH', receiptNo: 'r-001' }, as('Cashier')), 'already been recorded', 'Duplicate receipt number blocked')
  await rejects(svc.recordPayment(feeCharge.id, { amount: 400, date: '2026-03-01', method: 'CASH', receiptNo: 'R-002' }, as('Cashier')), 'Partial', 'Partial payment blocked by default')
  await svc.recordPayment(feeCharge.id, { amount: 1000, date: '2026-03-01', method: 'CASH', receiptNo: 'R-002' }, as('Cashier'))
  const sdCharge = db.charges.find((c) => c.type === 'STAMP_DUTY' && c.status === 'ACTIVE')!
  await svc.recordPayment(sdCharge.id, { amount: 100, date: '2026-03-01', method: 'CASH', receiptNo: 'R-003' }, as('Cashier'))
  db = await svc.getSnapshot()
  eq(reportUnpaid(db).length, 0, 'Fully paid licence leaves the unpaid report')
  await rejects(svc.assessLicenseFee(app.id, { mode: 'RULE' }, as('Counter Officer')), 'after final', 'Cannot re-assess after issue')

  console.log('\n== Online channel, survey, location change, reports, notices ==')
  const online = await svc.submitOnlineApplication({
    portalRef: 'WEB-1001',
    business: { ...food, name: 'Hill Salon', categoryId: 'cat-salon', premises: { address: '9 Temple Rd' } },
    applicant: { name: 'K Fernando', nic: '199512345678', phone: '0761234567', relationship: 'Owner' },
    categoryId: 'cat-salon',
    licenseYear: 2026,
    type: 'NEW',
    declaredLastYearIncome: null,
    documents: [],
    processingFeeAmount: 500,
  })
  eq(online.status, 'SUBMITTED', 'Online application waits for processing-fee payment')
  db = await svc.getSnapshot()
  assert(db.businesses.find((b) => b.key === online.businessKey)?.businessId === null, 'No Business ID until processing fee is paid')
  await rejects(svc.submitOnlineApplication({ ...(online as never), portalRef: 'web-1001', processingFeeAmount: 500, documents: [] }), 'already registered', 'Same portal submission cannot be imported twice')
  const pf = db.charges.find((c) => c.applicationId === online.id)!
  await svc.recordPayment(pf.id, { amount: 500, date: '2026-03-01', method: 'ONLINE', receiptNo: 'PG-77' }, as('Cashier'))
  db = await svc.getSnapshot()
  eq(db.applications.find((x) => x.id === online.id)?.status, 'DOCUMENT_REVIEW', 'Verified online payment → document review')

  const surveyed = await svc.registerBusiness(
    { ...food, name: 'Corner Hardware', categoryId: 'cat-general', premises: { address: '3 Station Rd' }, annualAssessmentValue: 900 },
    as('Revenue Inspector')
  )
  db = await svc.getSnapshot()
  assert(reportNotApplied(db, 2026).some((b) => b.key === surveyed.key), 'Surveyed business without application in "not submitted" report')
  assert(reportNotLicensed(db, 2026).some((r) => r.business.key === surveyed.key), 'Surveyed business in "not licensed" report')
  assert(!reportNotLicensed(db, 2026).some((r) => r.business.key === biz.key), 'Licensed business not in "not licensed" report')

  const before = db.businesses.find((b) => b.key === biz.key)!.businessId
  const moved = await svc.changeBusinessLocation(biz.key, { address: '88 New Rd, Homagama' }, 'Relocated', as('Revenue Inspector'))
  assert(!!moved.businessId && moved.businessId !== before, `Location change issues new Business ID (${before} → ${moved.businessId})`)
  assert(moved.businessIdHistory.some((h) => h.businessId === before && !!h.retiredAt), 'Old Business ID retained in history')

  const notice = await svc.issueNotice(
    {
      businessKey: surveyed.key,
      reason: 'NO_LICENSE',
      reasonDetails: 'Operating without a trade licence',
      issueDate: '2026-03-01',
      service: { method: 'HAND_DELIVERED', servedBy: 'RI Perera', servedOn: '2026-03-02' },
      responsibleOfficer: 'RI Perera',
    },
    as('Revenue Inspector')
  )
  eq(notice.deadline, '2026-03-16', '14-day deadline from service date')
  await rejects(svc.issueNotice({ ...notice, reasonDetails: 'again' } as never, as('Revenue Inspector')), 'already active', 'Duplicate active notice blocked')
  await rejects(svc.updateNotice(notice.id, { type: 'REFER_LEGAL' }, as('Chief Inspector')), 'cannot be referred yet', 'Cannot escalate before 14 days')
  now = new Date('2026-03-20T09:00:00Z')
  let n = await svc.updateNotice(notice.id, { type: 'REFER_LEGAL', remarks: 'No response' }, as('Chief Inspector'))
  eq(n.status, 'REFERRED_TO_LEGAL', 'Escalated after deadline')
  n = await svc.updateNotice(notice.id, { type: 'COURT', court: "Homagama Magistrate's Court", caseNo: 'MC/123/26' }, as('Secretary'))
  eq(n.status, 'COURT_ACTION', 'Court reference recorded')
  db = await svc.getSnapshot()
  assert(reportIssues(db, '2026-03-20').some((r) => r.business?.key === surveyed.key), 'Notice appears in "businesses with issues"')

  const m = dashboardMetrics(db, '2026-03-20', 2026)
  eq(m.issuedLicenses, 1, 'Dashboard: 1 licence issued')
  eq(m.totalBusinesses, 3, 'Dashboard: 3 businesses')
  assert(db.audit.length > 20, `Audit log captured ${db.audit.length} entries`)

  await rejects(svc.updateSettings({ processingFee: { amount: null, confirmed: true } }, as('System Administrator')), 'before confirming', 'Cannot confirm empty processing fee')
  await rejects(svc.updateSettings({ approvalChain: ['RI_VERIFICATION', 'SECRETARY'] }, admin), 'Chairman', 'Chairman cannot be removed from chain')
  await rejects(svc.updateSettings({ stampDutyRate: 0.2 }, as('Counter Officer')), 'not authorised', 'Counter officer cannot change rules')

  console.log(`\n${passed} passed, ${failed} failed\n`)
  if (failed > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
