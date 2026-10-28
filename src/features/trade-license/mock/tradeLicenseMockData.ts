/*
 * Sample (dummy) data for the Trade License module.
 *
 * The records are not hand-written JSON: they are produced by running the real workflow
 * through TradeLicenseService on an in-memory store with a simulated clock. That way every
 * sample application, inspection, approval, charge, payment, licence and notice is
 * consistent with the module's rules, and the sample data can never put the module into a
 * state that real usage could not reach.
 *
 * All names, NIC numbers, phone numbers and addresses are fictitious.
 * The Rs. 500 processing fee used here is a sample value only – the real amount is not in
 * the requirements and stays "unconfirmed" in Fee Rules.
 */
import { TradeLicenseService, type ApplicationInput, type BusinessInput } from '../services/tradeLicenseService'
import type { Actor, Application, Designation, InspectionType, TradeLicenseDb } from '../types/tradeLicense'

const SAMPLE_PROCESSING_FEE = 500
const DAY = 86_400_000

const officer = (name: string, designation: Designation): Actor => ({ name, designation })
const COUNTER = officer('S. Jayasinghe', 'Counter Officer')
const CASHIER = officer('N. Fernando', 'Cashier')
const RI = officer('R. Perera', 'Revenue Inspector')
const PHI = officer('D. Silva', 'Public Health Inspector')
const MOH = officer('Dr. A. Wickramasinghe', 'Medical Officer of Health')
const ENV = officer('M. Gunawardena', 'Environmental Officer')
const FIRE = officer('L. Bandara', 'Fire Safety Officer')
const CI = officer('P. Herath', 'Chief Inspector')
const SECRETARY = officer('W. Dissanayake', 'Secretary')
const CHAIRMAN = officer('H. Kumara', 'Chairman')

const INSPECTOR: Record<InspectionType, Actor> = { RI_BYLAW: RI, PHI, ENVIRONMENTAL: ENV, FIRE }

type BizSeed = Omit<BusinessInput, 'liabilities' | 'touristBoardRegistered' | 'previousYearTurnover'> &
  Partial<Pick<BusinessInput, 'liabilities' | 'touristBoardRegistered' | 'previousYearTurnover'>>

const biz = (b: BizSeed): BusinessInput => ({
  liabilities: ['TRADE_LICENSE'],
  touristBoardRegistered: false,
  previousYearTurnover: null,
  ...b,
})

const owner = (name: string, nic: string, phone: string, address: string) => ({ name, nic, phone, address })

/** Builds the sample database. `now` is "today"; sample events are spread over the previous ~2 months. */
export async function buildSampleDb(now: Date = new Date()): Promise<TradeLicenseDb> {
  const mem = new Map<string, string>()
  const store = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) }
  let clock = new Date(now.getTime() - 60 * DAY)
  const svc = new TradeLicenseService(store, () => clock)
  const at = (daysAgo: number, hour = 10) => {
    const d = new Date(now.getTime() - daysAgo * DAY)
    d.setHours(hour, (daysAgo * 7) % 60, 0, 0)
    clock = d
  }
  const today = () => {
    const d = clock
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  const year = now.getFullYear()
  let receipt = 1000
  const nextReceipt = () => `PS/R/${year}/${++receipt}`

  const docsFor = (categoryId: string) => {
    const base = [
      { label: 'Completed application form (Part A)', received: true },
      { label: "Copy of applicant's NIC", received: true },
    ]
    return categoryId === 'cat-hotel' ? [...base, { label: 'Tourist Board registration certificate (if registered)', received: true }] : base
  }

  const counterApp = async (b: BusinessInput, extra: Partial<ApplicationInput> = {}) =>
    svc.createCounterApplication(
      {
        business: b,
        applicant: { name: b.owner.name, nic: b.owner.nic, phone: b.owner.phone, relationship: 'Owner' },
        categoryId: b.categoryId,
        licenseYear: year,
        type: 'NEW',
        declaredLastYearIncome: null,
        documents: docsFor(b.categoryId),
        processingFee: {
          amount: SAMPLE_PROCESSING_FEE,
          acknowledgeUnconfirmed: true,
          payment: { method: 'CASH', receiptNo: nextReceipt(), date: today() },
        },
        ...extra,
      },
      COUNTER
    )

  const onlineApp = async (b: BusinessInput, portalRef: string) =>
    svc.submitOnlineApplication({
      portalRef,
      business: b,
      applicant: { name: b.owner.name, nic: b.owner.nic, phone: b.owner.phone, email: b.owner.email, relationship: 'Owner' },
      categoryId: b.categoryId,
      licenseYear: year,
      type: 'NEW',
      declaredLastYearIncome: null,
      documents: docsFor(b.categoryId),
      processingFeeAmount: SAMPLE_PROCESSING_FEE,
    })

  const snapshotApp = async (id: string): Promise<Application> => (await svc.getSnapshot()).applications.find((a) => a.id === id)!

  const verifyDocs = async (id: string) => {
    const app = await snapshotApp(id)
    await svc.updateDocuments(id, app.documents.map((d) => ({ ...d, received: true, verified: true })), COUNTER)
    await svc.completeDocumentVerification(id, COUNTER)
  }

  const riReview = async (id: string, notes: string) => {
    const app = await snapshotApp(id)
    await svc.completeRiReview(id, { requiredInspections: app.requiredInspections, notes }, RI)
  }

  const assignAll = async (id: string, daysDue = 7) => {
    const app = await snapshotApp(id)
    for (const t of app.requiredInspections) {
      const due = new Date(clock.getTime() + daysDue * DAY).toISOString().slice(0, 10)
      await svc.assignInspection(id, t, { assignedTo: INSPECTOR[t].name, dueDate: due }, RI)
    }
  }

  /** Submits the open report of `type`. failItems = number of checklist items marked non-compliant. */
  const report = async (id: string, type: InspectionType, failItems = 0, remarks?: string) => {
    const db = await svc.getSnapshot()
    const insp = db.inspections.filter((i) => i.applicationId === id && i.type === type && i.status === 'ASSIGNED').pop()!
    const checklist = insp.checklist.map((c, i) => ({ ...c, result: i < failItems ? ('NON_COMPLIANT' as const) : ('COMPLIANT' as const) }))
    await svc.submitInspectionReport(
      insp.id,
      {
        checklist,
        photos: [],
        recommendation: failItems > 0 ? 'CORRECTIONS_REQUIRED' : 'RECOMMEND',
        remarks: remarks ?? (failItems > 0 ? 'Deficiencies observed during the site visit.' : 'Premises inspected – satisfactory.'),
        manualReportRef: type === 'PHI' ? `PHI/HMG/${year}/${100 + db.inspections.length}` : undefined,
      },
      INSPECTOR[type]
    )
    if (type === 'PHI' && failItems === 0) {
      const after = await svc.getSnapshot()
      const app = after.applications.find((a) => a.id === id)!
      if (app.mohSignOffRequired) await svc.mohSignOff(insp.id, { decision: 'ENDORSED' }, MOH)
    }
  }

  const passAll = async (id: string) => {
    const app = await snapshotApp(id)
    for (const t of app.requiredInspections) await report(id, t)
  }

  const approveUpTo = async (id: string, last: 'RI' | 'CI' | 'SECRETARY' | 'CHAIRMAN') => {
    const chain: [Actor, string][] = [
      [RI, 'Business verified on site.'],
      [CI, 'Inspection reports reviewed.'],
      [SECRETARY, ''],
      [CHAIRMAN, ''],
    ]
    const stop = { RI: 1, CI: 2, SECRETARY: 3, CHAIRMAN: 4 }[last]
    for (const [who, remarks] of chain.slice(0, stop)) {
      await svc.recordApprovalDecision(id, { decision: 'APPROVED', remarks }, who)
    }
  }

  const payCharge = async (appId: string, type: 'LICENSE_FEE' | 'STAMP_DUTY' | 'PROCESSING_FEE', method: 'CASH' | 'CHEQUE' | 'BANK_TRANSFER' | 'ONLINE' = 'CASH') => {
    const db = await svc.getSnapshot()
    const ch = db.charges.find((c) => c.applicationId === appId && c.type === type && c.status === 'ACTIVE')!
    await svc.recordPayment(ch.id, { amount: ch.amount, date: today(), method, receiptNo: nextReceipt() }, CASHIER)
  }

  // ── 1. Lanka Bites – food, fully processed, licensed and fully paid ────────
  at(58)
  const a1 = await counterApp(
    biz({
      name: 'Lanka Bites Restaurant',
      natureOfActivity: 'Restaurant & take-away',
      categoryId: 'cat-food',
      owner: owner('Nimal Silva', '197812345671', '0712345671', 'No. 12, Temple Road, Godagama'),
      premises: { address: 'No. 45, High Level Road, Homagama', assessmentNo: 'HMG/45', ward: 'Homagama Town', buildingNature: 'Permanent' },
      annualAssessmentValue: 2400,
      liabilities: ['TRADE_LICENSE', 'TRADE_TAX'],
    })
  )
  at(57); await verifyDocs(a1.id)
  at(55); await riReview(a1.id, 'Restaurant operating at registered premises.'); await assignAll(a1.id)
  at(52); await report(a1.id, 'RI_BYLAW')
  at(50); await report(a1.id, 'PHI', 2, 'Kitchen floor drainage and food handler medical certificates pending.')
  at(44); await svc.rectifyCorrection(a1.id, (await snapshotApp(a1.id)).correctionRequests[0].id, { note: 'Drainage repaired; medical certificates submitted.' }, RI)
  at(42); await report(a1.id, 'PHI')
  at(40); await approveUpTo(a1.id, 'CHAIRMAN')
  at(38); await svc.assessLicenseFee(a1.id, { mode: 'RULE' }, COUNTER); await svc.issueLicense(a1.id, COUNTER)
  at(36); await payCharge(a1.id, 'LICENSE_FEE'); await payCharge(a1.id, 'STAMP_DUTY')

  // ── 2. Hill Top Hotel – Tourist Board hotel, licensed, fee UNPAID ──────────
  at(54)
  const a2 = await counterApp(
    biz({
      name: 'Hill Top Hotel',
      natureOfActivity: 'Tourist hotel (24 rooms)',
      categoryId: 'cat-hotel',
      owner: owner('Kumudini Ratnayake', '198523456782', '0772345672', 'No. 8, Lake Drive, Kottawa'),
      premises: { address: 'No. 210, Avissawella Road, Meegoda', assessmentNo: 'MGD/210', ward: 'Meegoda', buildingNature: 'Permanent' },
      annualAssessmentValue: 5200,
      touristBoardRegistered: true,
      touristBoardRegNo: 'SLTDA/HOT/2021/0457',
      previousYearTurnover: 4_250_000,
    })
  )
  at(53); await verifyDocs(a2.id)
  at(51); await riReview(a2.id, 'SLTDA registration verified.'); await assignAll(a2.id)
  at(47); await passAll(a2.id)
  at(43); await approveUpTo(a2.id, 'CHAIRMAN')
  at(41); await svc.assessLicenseFee(a2.id, { mode: 'RULE' }, COUNTER); await svc.issueLicense(a2.id, COUNTER)

  // ── 3. Sunrise Hardware – general trade, licensed, stamp duty outstanding ──
  at(50)
  const a3 = await counterApp(
    biz({
      name: 'Sunrise Hardware',
      natureOfActivity: 'Hardware & building materials',
      categoryId: 'cat-general',
      owner: owner('Ruwan Jayawardena', '198034567893', '0703456783', 'No. 3/1, School Lane, Pitipana'),
      premises: { address: 'No. 77, Main Street, Homagama', assessmentNo: 'HMG/77', ward: 'Homagama Town', buildingNature: 'Permanent' },
      annualAssessmentValue: 1800,
      liabilities: ['TRADE_LICENSE', 'BUSINESS_TAX'],
      previousLicense: { number: `TL/${year - 1}/0213`, year: year - 1 },
    })
  )
  at(49); await verifyDocs(a3.id)
  at(48); await riReview(a3.id, 'Renewal – no change of premises.'); await assignAll(a3.id)
  at(46); await passAll(a3.id)
  at(39); await approveUpTo(a3.id, 'CHAIRMAN')
  at(37); await svc.assessLicenseFee(a3.id, { mode: 'RULE' }, COUNTER); await svc.issueLicense(a3.id, COUNTER)
  at(30); await payCharge(a3.id, 'LICENSE_FEE', 'CHEQUE')

  // ── 4. Green Chem Traders – chemical trade, environmental deficiencies, deadline passed
  at(45)
  const a4 = await counterApp(
    biz({
      name: 'Green Chem Traders',
      natureOfActivity: 'Agro-chemical storage & sales',
      categoryId: 'cat-chemical',
      owner: owner('Tharindu Weerasinghe', '199045678904', '0764567894', 'No. 19, Station Road, Panagoda'),
      premises: { address: 'No. 5, Industrial Estate Road, Galawilawatta', assessmentNo: 'GLW/5', ward: 'Galawilawatta', buildingNature: 'Permanent' },
      annualAssessmentValue: 3100,
    })
  )
  at(44); await verifyDocs(a4.id)
  at(42); await riReview(a4.id, 'Chemical storage – environmental and fire approvals required.'); await assignAll(a4.id, 10)
  at(36); await report(a4.id, 'RI_BYLAW'); await report(a4.id, 'PHI'); await report(a4.id, 'FIRE')
  at(30); await report(a4.id, 'ENVIRONMENTAL', 1, 'No bunded storage area for chemical containers; wastewater discharged to roadside drain.')

  // ── 5. Nirmala Bakery – food, waiting for the Secretary ────────────────────
  at(33)
  const a5 = await counterApp(
    biz({
      name: 'Nirmala Bakery',
      natureOfActivity: 'Bakery & confectionery',
      categoryId: 'cat-food',
      owner: owner('Nirmala Gunasekara', '198856789015', '0715678905', 'No. 41, Kandy Road, Homagama'),
      premises: { address: 'No. 41A, Kandy Road, Homagama', assessmentNo: 'HMG/41A', ward: 'Homagama North', buildingNature: 'Permanent' },
      annualAssessmentValue: 1650,
    })
  )
  at(32); await verifyDocs(a5.id)
  at(30); await riReview(a5.id, 'Bakery with on-site production.'); await assignAll(a5.id)
  at(25); await passAll(a5.id)
  at(20); await approveUpTo(a5.id, 'CI')

  // ── 6. Royal Lodge – approved by Chairman, licence fee not yet assessed ────
  at(28)
  const a6 = await counterApp(
    biz({
      name: 'Royal Lodge',
      natureOfActivity: 'Guest house (8 rooms)',
      categoryId: 'cat-hotel',
      owner: owner('Sanjeewa Abeysekara', '197967890126', '0786789016', 'No. 2, Church Road, Kahathuduwa'),
      premises: { address: 'No. 18, Pitipana Road, Homagama', assessmentNo: 'HMG/18', ward: 'Pitipana', buildingNature: 'Permanent' },
      annualAssessmentValue: 2900,
    })
  )
  at(27); await verifyDocs(a6.id)
  at(25); await riReview(a6.id, 'Guest house – not Tourist Board registered.'); await assignAll(a6.id)
  at(21); await passAll(a6.id)
  at(12); await approveUpTo(a6.id, 'CHAIRMAN')

  // ── 7. Glamour Salon – online application, inspections in progress ───────
  at(18)
  const a7 = await onlineApp(
    biz({
      name: 'Glamour Beauty Salon',
      natureOfActivity: 'Hair & beauty salon',
      categoryId: 'cat-salon',
      owner: { ...owner('Dilini Madushani', '199578901237', '0757890127', 'No. 9, Flower Road, Homagama'), email: 'dilini.salon@example.com' },
      premises: { address: 'No. 102, High Level Road, Homagama', ward: 'Homagama Town', buildingNature: 'Permanent' },
      annualAssessmentValue: 1900,
    }),
    `WEB-${year}-00412`
  )
  at(17); await payCharge(a7.id, 'PROCESSING_FEE', 'ONLINE')
  at(16); await verifyDocs(a7.id)
  at(14); await riReview(a7.id, 'Online application – premises confirmed.'); await assignAll(a7.id, 10)
  at(9); await report(a7.id, 'RI_BYLAW')

  // ── 8. Quick Fix Garage – rejected by the Chief Inspector ─────────────────
  at(26)
  const a8 = await counterApp(
    biz({
      name: 'Quick Fix Garage',
      natureOfActivity: 'Vehicle repair workshop',
      categoryId: 'cat-general',
      owner: owner('Chaminda Rodrigo', '198289012348', '0718901238', 'No. 66, Old Road, Meegoda'),
      premises: { address: 'No. 66/2, Old Road, Meegoda', ward: 'Meegoda', buildingNature: 'Temporary' },
      annualAssessmentValue: 1700,
    })
  )
  at(25); await verifyDocs(a8.id)
  at(23); await riReview(a8.id, 'Workshop operates on a road reservation.'); await assignAll(a8.id)
  at(20); await report(a8.id, 'RI_BYLAW')
  at(15); await svc.recordApprovalDecision(a8.id, { decision: 'APPROVED', remarks: 'Forwarded for CI decision.' }, RI)
  at(13); await svc.recordApprovalDecision(a8.id, { decision: 'REJECTED', remarks: 'Premises located within the road reservation – not permitted under the by-laws.' }, CI)

  // ── 9. Kamal Stores – waiting for RI review for more than 30 days (overdue)
  at(36)
  const a9 = await counterApp(
    biz({
      name: 'Kamal Stores',
      natureOfActivity: 'Grocery retail',
      categoryId: 'cat-general',
      owner: owner('Kamal Pathirana', '197590123459', '0779012349', 'No. 7, Hospital Road, Homagama'),
      premises: { address: 'No. 7/1, Hospital Road, Homagama', assessmentNo: 'HMG/7-1', ward: 'Homagama South', buildingNature: 'Permanent' },
      annualAssessmentValue: 1600,
    })
  )
  at(35); await verifyDocs(a9.id)

  // ── 10. Saman Communication – online, documents being validated ───────────
  at(6)
  const a10 = await onlineApp(
    biz({
      name: 'Saman Communication',
      natureOfActivity: 'Mobile phone sales & repairs',
      categoryId: 'cat-general',
      owner: { ...owner('Saman Kumara', '199301234560', '0710123450', 'No. 25, Park Road, Kottawa'), email: 'saman.comm@example.com' },
      premises: { address: 'No. 15, Bus Stand Complex, Homagama', ward: 'Homagama Town', buildingNature: 'Permanent' },
      annualAssessmentValue: 1550,
    }),
    `WEB-${year}-00431`
  )
  at(5); await payCharge(a10.id, 'PROCESSING_FEE', 'ONLINE')

  // ── 11. City Pharmacy – online, processing fee not yet paid ───────────────
  at(2)
  await onlineApp(
    biz({
      name: 'City Pharmacy',
      natureOfActivity: 'Pharmacy',
      categoryId: 'cat-general',
      owner: { ...owner('Ishara Senanayake', '199112345601', '0761234501', 'No. 4, Lake Road, Homagama'), email: 'citypharmacy@example.com' },
      premises: { address: 'No. 88, High Level Road, Homagama', ward: 'Homagama Town', buildingNature: 'Permanent' },
      annualAssessmentValue: 2100,
    }),
    `WEB-${year}-00447`
  )

  // ── Field-survey businesses with no application yet ──────────────────────
  at(40)
  const tyre = await svc.registerBusiness(
    biz({
      name: 'Ruwan Tyre Works',
      natureOfActivity: 'Tyre repair',
      categoryId: 'cat-general',
      owner: owner('Ruwan Lakmal', '198712345612', '0771234512', 'No. 30, Cemetery Road, Homagama'),
      premises: { address: 'No. 30A, Cemetery Road, Homagama', ward: 'Homagama South', buildingNature: 'Temporary' },
      annualAssessmentValue: 900,
      survey: { surveyedBy: RI.name, surveyDate: today(), notes: 'Operating without a trade licence.' },
    }),
    RI
  )
  at(24)
  await svc.registerBusiness(
    biz({
      name: 'Madhu Textiles',
      natureOfActivity: 'Textile retail',
      categoryId: 'cat-general',
      owner: owner('Madhuka Peiris', '199223456723', '0702345623', 'No. 11, Market Road, Godagama'),
      premises: { address: 'No. 11, Market Road, Godagama', ward: 'Godagama', buildingNature: 'Permanent' },
      annualAssessmentValue: 1700,
      liabilities: ['TRADE_LICENSE', 'BUSINESS_TAX'],
      survey: { surveyedBy: RI.name, surveyDate: today(), notes: 'Owner informed to apply.' },
    }),
    RI
  )

  // ── 14-day legal notice – escalated after the deadline ────────────────────
  at(38)
  const notice = await svc.issueNotice(
    {
      businessKey: tyre.key,
      reason: 'NO_LICENSE',
      reasonDetails: 'Operating a tyre repair business without a trade licence.',
      issueDate: today(),
      service: { method: 'HAND_DELIVERED', servedBy: RI.name, servedOn: today(), details: 'Received by the owner.' },
      responsibleOfficer: RI.name,
    },
    RI
  )
  at(20); await svc.updateNotice(notice.id, { type: 'REFER_LEGAL', remarks: 'No response within 14 days.' }, CI)

  clock = now
  const snap = await svc.getSnapshot()
  // Events were simulated out of date order (one business at a time) – keep the audit log newest-first.
  snap.audit.sort((x, y) => y.at.localeCompare(x.at))
  return snap
}
