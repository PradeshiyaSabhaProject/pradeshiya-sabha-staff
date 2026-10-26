/*
 * Trade License service.
 *
 * This repository is a frontend-only application (no backend / database), so – like the
 * Varipanam module – the data is persisted in the browser through this service. Every
 * mutation goes through here and enforces: role permissions (acting designation), workflow
 * state, validation, duplicate prevention and audit logging. The method signatures are
 * async and API-shaped so they can be replaced by HTTP calls when a backend is added.
 */
import type {
  Actor,
  Application,
  ApplicationDocument,
  ApprovalDecision,
  AuditEntry,
  Business,
  BusinessCategory,
  Charge,
  ChargeType,
  ChecklistTemplate,
  CorrectionRequest,
  Inspection,
  InspectionPhoto,
  InspectionType,
  LegalNotice,
  License,
  NoticeReason,
  Payment,
  PaymentMethod,
  TradeLicenseDb,
  TradeLicenseSettings,
} from '../types/tradeLicense'
import {
  DEFAULT_CATEGORIES,
  DEFAULT_CHECKLISTS,
  DEFAULT_SETTINGS,
  INSPECTION_TYPE_DESIGNATION,
  INSPECTION_TYPE_LABELS,
  APPROVAL_STAGE_LABELS,
} from '../config/defaultConfig'
import {
  addDays,
  allowedDesignations,
  calculateLicenseFee,
  calculateStampDuty,
  can,
  canActOnStage,
  canSubmitInspection,
  chargeBalance,
  evaluateInspections,
  isApplicationOpen,
  isValidNic,
  isValidPhone,
  latestInspections,
  licenseValidity,
  nextApprovalStage,
  normalise,
  paymentStatusFor,
  resolveApprovalStages,
  round2,
  validateInspectionReport,
  validatePaymentAmount,
  type TradeAction,
} from '../rules/tradeLicenseRules'

export const TRADE_LICENSE_STORAGE_KEY = 'trade_license_db_v1'

export class TradeLicenseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TradeLicenseError'
  }
}

type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>

// ── Input shapes ────────────────────────────────────────────────────────────
export interface BusinessInput {
  name: string
  natureOfActivity: string
  categoryId: string
  owner: Business['owner']
  premises: Business['premises']
  liabilities: Business['liabilities']
  touristBoardRegistered: boolean
  touristBoardRegNo?: string
  annualAssessmentValue: number | null
  previousYearTurnover: number | null
  previousLicense?: Business['previousLicense']
  survey?: Business['survey']
}

export interface ApplicationInput {
  businessKey?: string
  business?: BusinessInput
  applicant: Application['applicant']
  categoryId: string
  licenseYear: number
  type: Application['type']
  declaredLastYearIncome: number | null
  documents: { label: string; received: boolean; fileName?: string }[]
  processingFee: {
    amount: number
    acknowledgeUnconfirmed?: boolean
    payment?: { method: PaymentMethod; receiptNo: string; date: string }
  }
}

export interface OnlineApplicationInput extends Omit<ApplicationInput, 'processingFee'> {
  portalRef: string
  processingFeeAmount?: number
}

export interface InspectionReportInput {
  checklist: Inspection['checklist']
  photos: Omit<InspectionPhoto, 'id' | 'uploadedAt'>[]
  remarks?: string
  recommendation?: Inspection['recommendation']
  manualReportRef?: string
}

export interface NoticeInput {
  businessKey: string
  applicationId?: string
  reason: NoticeReason
  reasonDetails: string
  issueDate: string
  service: LegalNotice['service']
  responsibleOfficer: string
}

const MAX_PHOTOS = 6
const MAX_PHOTO_CHARS = 2_000_000 // ≈1.5 MB image as data URL

function freshDb(): TradeLicenseDb {
  return {
    version: 1,
    settings: structuredClone(DEFAULT_SETTINGS),
    categories: structuredClone(DEFAULT_CATEGORIES),
    checklists: structuredClone(DEFAULT_CHECKLISTS),
    businesses: [],
    applications: [],
    inspections: [],
    approvals: [],
    charges: [],
    payments: [],
    licenses: [],
    notices: [],
    audit: [],
    sequences: {},
  }
}

export class TradeLicenseService {
  private db: TradeLicenseDb
  private readonly store: KeyValueStore | null
  private readonly clock: () => Date

  constructor(store?: KeyValueStore | null, clock?: () => Date) {
    this.store = store !== undefined ? store : typeof localStorage !== 'undefined' ? localStorage : null
    this.clock = clock ?? (() => new Date())
    this.db = this.load()
  }

  // ── Persistence ───────────────────────────────────────────────────────────
  private load(): TradeLicenseDb {
    try {
      const raw = this.store?.getItem(TRADE_LICENSE_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as TradeLicenseDb
        if (parsed && parsed.version === 1) return { ...freshDb(), ...parsed }
      }
    } catch {
      // corrupted storage – start clean rather than crash the module
    }
    return freshDb()
  }

  private commit(): void {
    try {
      this.store?.setItem(TRADE_LICENSE_STORAGE_KEY, JSON.stringify(this.db))
    } catch {
      throw new TradeLicenseError('Could not save – browser storage is full or unavailable (large photos use most space).')
    }
  }

  /** Runs a mutation atomically: on any error the in-memory state is rolled back. */
  private mutate<T>(fn: () => T): T {
    const backup = JSON.stringify(this.db)
    try {
      const result = fn()
      this.commit()
      return result
    } catch (e) {
      this.db = JSON.parse(backup)
      throw e
    }
  }

  async getSnapshot(): Promise<TradeLicenseDb> {
    this.db = this.load()
    return structuredClone(this.db)
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private nowIso(): string {
    return this.clock().toISOString()
  }
  private today(): string {
    return this.nowIso().slice(0, 10)
  }
  private uid(prefix: string): string {
    const rand =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).slice(2, 10)
    return `${prefix}-${Date.now().toString(36)}-${rand}`
  }
  private nextSeq(name: string): number {
    const n = (this.db.sequences[name] ?? 0) + 1
    this.db.sequences[name] = n
    return n
  }
  private require(actor: Actor, action: TradeAction): void {
    if (!can(actor.designation, action)) {
      throw new TradeLicenseError(
        `${actor.designation} is not authorised for this action. Allowed: ${allowedDesignations(action).join(', ')}.`
      )
    }
  }
  private audit(
    actor: Actor | 'PORTAL',
    action: string,
    entityType: AuditEntry['entityType'],
    entityId: string,
    details: string
  ): void {
    this.db.audit.unshift({
      id: this.uid('aud'),
      at: this.nowIso(),
      actor: actor === 'PORTAL' ? 'Online applicant' : actor.name,
      designation: actor === 'PORTAL' ? 'Public Portal' : actor.designation,
      action,
      entityType,
      entityId,
      details,
    })
    if (this.db.audit.length > 5000) this.db.audit.length = 5000
  }
  private app(id: string): Application {
    const a = this.db.applications.find((x) => x.id === id)
    if (!a) throw new TradeLicenseError('Application not found.')
    return a
  }
  private business(key: string): Business {
    const b = this.db.businesses.find((x) => x.key === key)
    if (!b) throw new TradeLicenseError('Business record not found.')
    return b
  }
  private category(id: string): BusinessCategory {
    const c = this.db.categories.find((x) => x.id === id)
    if (!c) throw new TradeLicenseError('Business category not found.')
    return c
  }
  private touch(a: { updatedAt: string }): void {
    a.updatedAt = this.nowIso()
  }
  private issueBusinessIdIfMissing(b: Business, reason: string): void {
    if (b.businessId) return
    const id = `TLB-${String(this.nextSeq('business')).padStart(6, '0')}`
    b.businessId = id
    b.businessIdHistory.push({ businessId: id, assignedAt: this.nowIso(), reason })
    this.touch(b)
  }

  private validateBusinessInput(input: BusinessInput): void {
    const errors: string[] = []
    if (!input.name.trim()) errors.push('Business name is required.')
    if (!input.natureOfActivity.trim()) errors.push('Nature of activity is required.')
    if (!input.owner.name.trim()) errors.push('Owner / operator name is required.')
    if (!isValidNic(input.owner.nic)) errors.push('Owner NIC is invalid (9 digits + V/X, or 12 digits).')
    if (!isValidPhone(input.owner.phone)) errors.push('Owner phone number is invalid.')
    if (!input.owner.address.trim()) errors.push("Owner's address is required.")
    if (!input.premises.address.trim()) errors.push('Premises address is required.')
    if (!input.liabilities.length) errors.push('Select at least one liability (trade licence, trade tax or business tax).')
    if (input.annualAssessmentValue !== null && input.annualAssessmentValue < 0) errors.push('Assessment value cannot be negative.')
    if (input.previousYearTurnover !== null && input.previousYearTurnover < 0) errors.push('Turnover cannot be negative.')
    if (input.touristBoardRegistered && !(input.previousYearTurnover && input.previousYearTurnover > 0)) {
      errors.push("Previous year's turnover is required for Tourist Board registered hotels.")
    }
    this.category(input.categoryId)
    if (errors.length) throw new TradeLicenseError(errors.join(' '))
  }

  private findDuplicateBusiness(input: Pick<BusinessInput, 'name' | 'owner' | 'premises'>, ignoreKey?: string) {
    return this.db.businesses.find(
      (b) =>
        b.key !== ignoreKey &&
        b.status === 'ACTIVE' &&
        normalise(b.owner.nic) === normalise(input.owner.nic) &&
        normalise(b.name) === normalise(input.name) &&
        normalise(b.premises.address) === normalise(input.premises.address)
    )
  }

  private createBusinessRecord(input: BusinessInput, source: Business['source'], createdBy: string): Business {
    this.validateBusinessInput(input)
    const dup = this.findDuplicateBusiness(input)
    if (dup) {
      throw new TradeLicenseError(
        `This business is already registered (${dup.businessId ?? 'record ' + dup.key}). Select the existing business instead.`
      )
    }
    const b: Business = {
      key: this.uid('biz'),
      businessId: null,
      businessIdHistory: [],
      ...structuredClone(input),
      owner: { ...input.owner, nic: input.owner.nic.trim().toUpperCase() },
      source,
      status: 'ACTIVE',
      createdBy,
      createdAt: this.nowIso(),
      updatedAt: this.nowIso(),
    }
    this.db.businesses.push(b)
    return b
  }

  // ── Business master (Revenue survey) ──────────────────────────────────────
  async registerBusiness(input: BusinessInput, actor: Actor): Promise<Business> {
    return this.mutate(() => {
      this.require(actor, 'BUSINESS_SURVEY')
      const b = this.createBusinessRecord(
        { ...input, survey: input.survey ?? { surveyedBy: actor.name, surveyDate: this.today() } },
        'FIELD_SURVEY',
        actor.name
      )
      this.audit(actor, 'Business registered from field survey', 'BUSINESS', b.key, b.name)
      return structuredClone(b)
    })
  }

  async updateBusiness(key: string, input: BusinessInput, actor: Actor): Promise<Business> {
    return this.mutate(() => {
      if (!can(actor.designation, 'BUSINESS_SURVEY') && !can(actor.designation, 'APPLICATION_EDIT')) {
        this.require(actor, 'BUSINESS_SURVEY')
      }
      const b = this.business(key)
      if (b.businessId && normalise(b.premises.address) !== normalise(input.premises.address)) {
        throw new TradeLicenseError('The premises address has changed. Use "Change Location" so the Business ID is handled correctly.')
      }
      this.validateBusinessInput(input)
      const dup = this.findDuplicateBusiness(input, key)
      if (dup) throw new TradeLicenseError(`Another business record already matches these details (${dup.businessId ?? dup.key}).`)
      Object.assign(b, structuredClone(input), { owner: { ...input.owner, nic: input.owner.nic.trim().toUpperCase() } })
      this.touch(b)
      this.audit(actor, 'Business information updated', 'BUSINESS', b.key, b.name)
      return structuredClone(b)
    })
  }

  /** PDF: "Business ID can change when business in the location is changed". */
  async changeBusinessLocation(key: string, premises: Business['premises'], reason: string, actor: Actor): Promise<Business> {
    return this.mutate(() => {
      this.require(actor, 'BUSINESS_SURVEY')
      const b = this.business(key)
      if (!premises.address.trim()) throw new TradeLicenseError('New premises address is required.')
      if (!reason.trim()) throw new TradeLicenseError('A reason for the location change is required.')
      if (normalise(premises.address) === normalise(b.premises.address)) {
        throw new TradeLicenseError('The new address is the same as the current address.')
      }
      const old = b.businessId
      b.premises = { ...premises }
      if (old) {
        const rec = b.businessIdHistory.find((h) => h.businessId === old && !h.retiredAt)
        if (rec) rec.retiredAt = this.nowIso()
        b.businessId = null
        this.issueBusinessIdIfMissing(b, `Location changed: ${reason}`)
      }
      this.touch(b)
      this.audit(
        actor,
        'Business location changed',
        'BUSINESS',
        b.key,
        old ? `Business ID ${old} → ${b.businessId}. ${reason}` : reason
      )
      return structuredClone(b)
    })
  }

  // ── Applications ──────────────────────────────────────────────────────────
  private assertNoDuplicateApplication(businessKey: string, year: number): void {
    const open = this.db.applications.find(
      (a) => a.businessKey === businessKey && a.licenseYear === year && isApplicationOpen(a)
    )
    if (open) throw new TradeLicenseError(`An open application (${open.ref}) already exists for this business for ${year}.`)
    const lic = this.db.licenses.find((l) => l.businessKey === businessKey && l.licenseYear === year && l.status === 'ACTIVE')
    if (lic) throw new TradeLicenseError(`Licence ${lic.licenseNo} has already been issued to this business for ${year}.`)
  }

  private validateApplicant(applicant: Application['applicant']): void {
    const errors: string[] = []
    if (!applicant.name.trim()) errors.push('Applicant name is required.')
    if (!isValidNic(applicant.nic)) errors.push('Applicant NIC is invalid.')
    if (!isValidPhone(applicant.phone)) errors.push('Applicant phone number is invalid.')
    if (applicant.email && !/^\S+@\S+\.\S+$/.test(applicant.email)) errors.push('Applicant email is invalid.')
    if (errors.length) throw new TradeLicenseError(errors.join(' '))
  }

  private buildApplication(
    input: Omit<ApplicationInput, 'processingFee'>,
    channel: Application['channel'],
    createdBy: string,
    businessKey: string
  ): Application {
    const cat = this.category(input.categoryId)
    const year = input.licenseYear
    const docLabels = new Set([...cat.requiredDocuments, ...input.documents.map((d) => d.label)])
    const documents: ApplicationDocument[] = [...docLabels].map((label) => {
      const given = input.documents.find((d) => d.label === label)
      return { id: this.uid('doc'), label, received: !!given?.received, verified: false, fileName: given?.fileName }
    })
    return {
      id: this.uid('app'),
      ref: `TL/APP/${year}/${String(this.nextSeq(`app-${year}`)).padStart(4, '0')}`,
      licenseYear: year,
      type: input.type,
      channel,
      businessKey,
      applicant: { ...input.applicant, nic: input.applicant.nic.trim().toUpperCase() },
      categoryId: cat.id,
      declaredLastYearIncome: input.declaredLastYearIncome,
      documents,
      requiredInspections: [...cat.requiredInspections],
      mohSignOffRequired: cat.mohSignOffRequired,
      approvalStages: resolveApprovalStages(cat, this.db.settings),
      currentApprovalStage: null,
      status: 'SUBMITTED',
      inspectionStatus: cat.requiredInspections.length ? 'NOT_STARTED' : 'NOT_REQUIRED',
      approvalStatus: 'NOT_STARTED',
      correctionRequests: [],
      createdBy,
      createdAt: this.nowIso(),
      updatedAt: this.nowIso(),
    }
  }

  private resolveBusinessForApplication(input: Omit<ApplicationInput, 'processingFee'>, createdBy: string): Business {
    if (input.businessKey) {
      const b = this.business(input.businessKey)
      if (b.status !== 'ACTIVE') throw new TradeLicenseError('The selected business is closed.')
      return b
    }
    if (!input.business) throw new TradeLicenseError('Select an existing business or enter the business details.')
    if (input.type === 'RENEWAL') throw new TradeLicenseError('A renewal must be made for an existing registered business.')
    return this.createBusinessRecord({ ...input.business, categoryId: input.categoryId }, 'APPLICATION', createdBy)
  }

  private validateYear(year: number): void {
    const current = this.clock().getFullYear()
    if (!Number.isInteger(year) || year < current - 1 || year > current + 1) {
      throw new TradeLicenseError(`Licence year must be between ${current - 1} and ${current + 1}.`)
    }
  }

  private resolveProcessingFeeAmount(amount: number | undefined, acknowledge: boolean | undefined): number {
    const cfg = this.db.settings.processingFee
    if (cfg.confirmed && cfg.amount !== null) {
      if (amount !== undefined && round2(amount) !== round2(cfg.amount)) {
        throw new TradeLicenseError(`The confirmed processing fee is Rs. ${cfg.amount.toFixed(2)}.`)
      }
      return cfg.amount
    }
    if (amount === undefined || !(amount > 0)) throw new TradeLicenseError('Enter the processing fee amount charged.')
    if (!acknowledge) {
      throw new TradeLicenseError('The processing fee rate is not officially confirmed. Confirm the amount before submitting.')
    }
    return round2(amount)
  }

  private createCharge(app: Application, type: ChargeType, amount: number, actorName: string): Charge {
    const existing = this.db.charges.find((c) => c.applicationId === app.id && c.type === type && c.status === 'ACTIVE')
    if (existing) throw new TradeLicenseError(`A ${type.replace('_', ' ').toLowerCase()} charge already exists for ${app.ref}.`)
    const charge: Charge = {
      id: this.uid('chg'),
      applicationId: app.id,
      businessKey: app.businessKey,
      type,
      amount: round2(amount),
      voteCode: this.db.settings.voteCodes[type] ?? '',
      status: 'ACTIVE',
      createdBy: actorName,
      createdAt: this.nowIso(),
    }
    this.db.charges.push(charge)
    return charge
  }

  /** Officer-assisted application at the Pradeshiya Sabha counter. */
  async createCounterApplication(input: ApplicationInput, actor: Actor): Promise<Application> {
    return this.mutate(() => {
      this.require(actor, 'APPLICATION_CREATE')
      this.validateYear(input.licenseYear)
      this.validateApplicant(input.applicant)
      const amount = this.resolveProcessingFeeAmount(input.processingFee.amount, input.processingFee.acknowledgeUnconfirmed)
      if (!input.processingFee.payment) {
        throw new TradeLicenseError('Record the processing fee payment (receipt) for a counter application.')
      }
      const business = this.resolveBusinessForApplication(input, actor.name)
      this.assertNoDuplicateApplication(business.key, input.licenseYear)
      const app = this.buildApplication(input, 'COUNTER', actor.name, business.key)
      this.db.applications.push(app)
      this.audit(actor, 'Counter application registered', 'APPLICATION', app.id, `${app.ref} – ${business.name}`)
      const charge = this.createCharge(app, 'PROCESSING_FEE', amount, actor.name)
      this.audit(actor, 'Processing fee charge recorded', 'CHARGE', charge.id, `${app.ref} – Rs. ${amount.toFixed(2)}`)
      this.applyPayment(charge, { amount, ...input.processingFee.payment }, actor)
      return structuredClone(this.app(app.id))
    })
  }

  /**
   * Intake point for applications submitted through the public website. The processing fee
   * is recorded as a charge immediately; it stays unpaid until the payment is verified.
   */
  async submitOnlineApplication(input: OnlineApplicationInput, registeredBy?: Actor): Promise<Application> {
    return this.mutate(() => {
      // When an officer imports a portal submission, they must be allowed to register applications.
      if (registeredBy) this.require(registeredBy, 'APPLICATION_CREATE')
      const who: Actor | 'PORTAL' = registeredBy ?? 'PORTAL'
      if (!input.portalRef.trim()) throw new TradeLicenseError('Portal reference is required.')
      const dupRef = this.db.applications.find((a) => a.portalRef && normalise(a.portalRef) === normalise(input.portalRef))
      if (dupRef) throw new TradeLicenseError(`Portal submission ${input.portalRef} is already registered as ${dupRef.ref}.`)
      this.validateYear(input.licenseYear)
      this.validateApplicant(input.applicant)
      const cfg = this.db.settings.processingFee
      const amount = cfg.confirmed && cfg.amount !== null ? cfg.amount : input.processingFeeAmount
      if (!amount || !(amount > 0)) throw new TradeLicenseError('Processing fee amount is required for an online submission.')
      const business = this.resolveBusinessForApplication(input, 'Online applicant')
      this.assertNoDuplicateApplication(business.key, input.licenseYear)
      const app = this.buildApplication(input, 'ONLINE', 'Online applicant', business.key)
      app.portalRef = input.portalRef.trim()
      this.db.applications.push(app)
      this.audit(who, 'Online application received', 'APPLICATION', app.id, `${app.ref} – portal ${app.portalRef}`)
      const charge = this.createCharge(app, 'PROCESSING_FEE', amount, 'Online applicant')
      this.audit(who, 'Processing fee charge recorded (awaiting payment)', 'CHARGE', charge.id, `${app.ref} – Rs. ${amount.toFixed(2)}`)
      return structuredClone(app)
    })
  }

  async updateApplication(
    id: string,
    patch: { applicant?: Application['applicant']; categoryId?: string; declaredLastYearIncome?: number | null },
    actor: Actor
  ): Promise<Application> {
    return this.mutate(() => {
      this.require(actor, 'APPLICATION_EDIT')
      const app = this.app(id)
      if (!['SUBMITTED', 'DOCUMENT_REVIEW', 'RI_REVIEW'].includes(app.status)) {
        throw new TradeLicenseError('The application can only be edited before inspections begin.')
      }
      const changes: string[] = []
      if (patch.applicant) {
        this.validateApplicant(patch.applicant)
        app.applicant = { ...patch.applicant, nic: patch.applicant.nic.trim().toUpperCase() }
        changes.push('applicant')
      }
      if (patch.categoryId && patch.categoryId !== app.categoryId) {
        const cat = this.category(patch.categoryId)
        app.categoryId = cat.id
        app.requiredInspections = [...cat.requiredInspections]
        app.mohSignOffRequired = cat.mohSignOffRequired
        app.approvalStages = resolveApprovalStages(cat, this.db.settings)
        app.inspectionStatus = cat.requiredInspections.length ? 'NOT_STARTED' : 'NOT_REQUIRED'
        cat.requiredDocuments.forEach((label) => {
          if (!app.documents.some((d) => d.label === label)) {
            app.documents.push({ id: this.uid('doc'), label, received: false, verified: false })
          }
        })
        const b = this.business(app.businessKey)
        b.categoryId = cat.id
        this.touch(b)
        changes.push(`category → ${cat.name}`)
      }
      if (patch.declaredLastYearIncome !== undefined) {
        if (patch.declaredLastYearIncome !== null && patch.declaredLastYearIncome < 0) {
          throw new TradeLicenseError('Declared income cannot be negative.')
        }
        app.declaredLastYearIncome = patch.declaredLastYearIncome
        changes.push('declared income')
      }
      this.touch(app)
      this.audit(actor, 'Application updated', 'APPLICATION', app.id, `${app.ref}: ${changes.join(', ') || 'no changes'}`)
      return structuredClone(app)
    })
  }

  async withdrawApplication(id: string, reason: string, actor: Actor): Promise<Application> {
    return this.mutate(() => {
      this.require(actor, 'APPLICATION_EDIT')
      const app = this.app(id)
      if (!isApplicationOpen(app) || app.status === 'APPROVED') {
        throw new TradeLicenseError('Only applications that are still in progress can be withdrawn.')
      }
      if (!reason.trim()) throw new TradeLicenseError('A reason is required to withdraw an application.')
      app.status = 'WITHDRAWN'
      this.touch(app)
      this.audit(actor, 'Application withdrawn', 'APPLICATION', app.id, `${app.ref}: ${reason}`)
      return structuredClone(app)
    })
  }

  async updateDocuments(id: string, documents: ApplicationDocument[], actor: Actor): Promise<Application> {
    return this.mutate(() => {
      this.require(actor, 'DOCUMENT_VERIFY')
      const app = this.app(id)
      if (!['SUBMITTED', 'DOCUMENT_REVIEW', 'RI_REVIEW'].includes(app.status)) {
        throw new TradeLicenseError('Documents can only be changed before inspections begin.')
      }
      const labels = new Set<string>()
      documents.forEach((d) => {
        if (!d.label.trim()) throw new TradeLicenseError('Document name cannot be empty.')
        const k = normalise(d.label)
        if (labels.has(k)) throw new TradeLicenseError(`Duplicate document "${d.label}".`)
        labels.add(k)
        if (d.verified && !d.received) throw new TradeLicenseError(`"${d.label}" cannot be verified before it is received.`)
      })
      const cat = this.category(app.categoryId)
      cat.requiredDocuments.forEach((req) => {
        if (!labels.has(normalise(req))) throw new TradeLicenseError(`"${req}" is a required document for this category.`)
      })
      app.documents = documents.map((d) => ({ ...d, id: d.id || this.uid('doc') }))
      this.touch(app)
      this.audit(actor, 'Documents updated', 'APPLICATION', app.id, app.ref)
      return structuredClone(app)
    })
  }

  async completeDocumentVerification(id: string, actor: Actor): Promise<Application> {
    return this.mutate(() => {
      this.require(actor, 'DOCUMENT_VERIFY')
      const app = this.app(id)
      if (app.status !== 'DOCUMENT_REVIEW') {
        throw new TradeLicenseError(
          app.status === 'SUBMITTED'
            ? 'The processing fee must be paid before documents are validated.'
            : 'Documents have already been validated.'
        )
      }
      const missing = app.documents.filter((d) => !d.received || !d.verified)
      if (missing.length) {
        throw new TradeLicenseError(`Not yet received/verified: ${missing.map((d) => d.label).join(', ')}.`)
      }
      app.documentsVerifiedBy = actor.name
      app.documentsVerifiedAt = this.nowIso()
      app.status = 'RI_REVIEW'
      this.touch(app)
      this.audit(actor, 'Documents validated – forwarded to RI', 'APPLICATION', app.id, app.ref)
      return structuredClone(app)
    })
  }

  // ── RI review & inspections ───────────────────────────────────────────────
  async completeRiReview(
    id: string,
    input: { requiredInspections: InspectionType[]; notes?: string },
    actor: Actor
  ): Promise<Application> {
    return this.mutate(() => {
      this.require(actor, 'RI_REVIEW')
      const app = this.app(id)
      if (app.status !== 'RI_REVIEW') throw new TradeLicenseError('This application is not awaiting RI review.')
      const cat = this.category(app.categoryId)
      const missing = cat.requiredInspections.filter((t) => !input.requiredInspections.includes(t))
      if (missing.length) {
        throw new TradeLicenseError(
          `Mandatory inspections for ${cat.name} cannot be removed: ${missing.map((t) => INSPECTION_TYPE_LABELS[t]).join(', ')}.`
        )
      }
      app.requiredInspections = [...new Set(input.requiredInspections)]
      app.riReview = { by: actor.name, at: this.nowIso(), notes: input.notes?.trim() || undefined }
      this.audit(
        actor,
        'RI review completed',
        'APPLICATION',
        app.id,
        `${app.ref}: inspections → ${app.requiredInspections.map((t) => INSPECTION_TYPE_LABELS[t]).join(', ') || 'none'}`
      )
      if (app.requiredInspections.length === 0) {
        app.inspectionStatus = 'NOT_REQUIRED'
        this.startApproval(app, actor)
      } else {
        app.status = 'UNDER_INSPECTION'
        app.inspectionStatus = 'NOT_STARTED'
      }
      this.touch(app)
      return structuredClone(app)
    })
  }

  private checklistFor(app: Application, type: InspectionType): Pick<Inspection, 'checklist' | 'checklistTemplateId'> {
    const tpl = this.db.checklists.find((c) => c.categoryId === app.categoryId && c.inspectionType === type)
    return {
      checklistTemplateId: tpl?.id,
      checklist: (tpl?.items ?? []).map((i) => ({ itemId: i.id, label: i.label, mandatory: i.mandatory, result: null })),
    }
  }

  async assignInspection(
    applicationId: string,
    type: InspectionType,
    input: { assignedTo: string; dueDate?: string },
    actor: Actor
  ): Promise<Inspection> {
    return this.mutate(() => {
      this.require(actor, 'INSPECTION_ASSIGN')
      const app = this.app(applicationId)
      if (app.status !== 'UNDER_INSPECTION') throw new TradeLicenseError('Inspections can only be assigned while the application is under inspection.')
      if (!app.requiredInspections.includes(type)) throw new TradeLicenseError(`${INSPECTION_TYPE_LABELS[type]} is not required for this application.`)
      if (!input.assignedTo.trim()) throw new TradeLicenseError('Enter the name of the officer being assigned.')
      if (input.dueDate && input.dueDate < this.today()) throw new TradeLicenseError('Due date cannot be in the past.')
      const latest = latestInspections(app, this.db.inspections)[type]
      if (latest && latest.status === 'ASSIGNED') {
        throw new TradeLicenseError(`${INSPECTION_TYPE_LABELS[type]} is already assigned to ${latest.assignedTo}. Reassign it instead.`)
      }
      if (latest) throw new TradeLicenseError(`${INSPECTION_TYPE_LABELS[type]} has already been reported for this round.`)
      const insp: Inspection = {
        id: this.uid('insp'),
        applicationId: app.id,
        type,
        round: 1,
        assignedTo: input.assignedTo.trim(),
        assignedBy: actor.name,
        assignedAt: this.nowIso(),
        dueDate: input.dueDate || undefined,
        status: 'ASSIGNED',
        photos: [],
        ...this.checklistFor(app, type),
      }
      this.db.inspections.push(insp)
      this.recompute(app, actor)
      this.audit(actor, 'Inspection assigned', 'INSPECTION', insp.id, `${app.ref}: ${INSPECTION_TYPE_LABELS[type]} → ${insp.assignedTo}`)
      return structuredClone(insp)
    })
  }

  async reassignInspection(inspectionId: string, assignedTo: string, actor: Actor): Promise<Inspection> {
    return this.mutate(() => {
      this.require(actor, 'INSPECTION_ASSIGN')
      const insp = this.db.inspections.find((i) => i.id === inspectionId)
      if (!insp) throw new TradeLicenseError('Inspection not found.')
      if (insp.status !== 'ASSIGNED') throw new TradeLicenseError('Only open inspections can be reassigned.')
      if (!assignedTo.trim()) throw new TradeLicenseError('Enter the name of the officer.')
      const prev = insp.assignedTo
      insp.assignedTo = assignedTo.trim()
      this.audit(actor, 'Inspection reassigned', 'INSPECTION', insp.id, `${prev} → ${insp.assignedTo}`)
      return structuredClone(insp)
    })
  }

  async submitInspectionReport(inspectionId: string, input: InspectionReportInput, actor: Actor): Promise<Inspection> {
    return this.mutate(() => {
      const insp = this.db.inspections.find((i) => i.id === inspectionId)
      if (!insp) throw new TradeLicenseError('Inspection not found.')
      if (!canSubmitInspection(actor.designation, insp.type)) {
        throw new TradeLicenseError(`Only a ${INSPECTION_TYPE_DESIGNATION[insp.type]} can submit this report.`)
      }
      if (insp.status !== 'ASSIGNED') throw new TradeLicenseError('A report has already been submitted for this inspection.')
      const app = this.app(insp.applicationId)
      // Keep the checklist structure fixed; only results/notes come from the officer.
      const checklist = insp.checklist.map((c) => {
        const given = input.checklist.find((g) => g.itemId === c.itemId)
        return { ...c, result: given?.result ?? null, note: given?.note?.trim() || undefined }
      })
      const errors = validateInspectionReport(checklist, input.recommendation, input.remarks)
      if (checklist.length === 0 && !input.remarks?.trim()) {
        errors.push('No checklist is configured for this category – detailed remarks are required.')
      }
      if (input.photos.length > MAX_PHOTOS) errors.push(`A maximum of ${MAX_PHOTOS} photographs can be attached.`)
      input.photos.forEach((p) => {
        if (!p.dataUrl.startsWith('data:image/')) errors.push(`${p.name} is not an image.`)
        else if (p.dataUrl.length > MAX_PHOTO_CHARS) errors.push(`${p.name} is too large (max ≈1.5 MB).`)
      })
      if (errors.length) throw new TradeLicenseError(errors.join(' '))
      insp.checklist = checklist
      insp.photos = input.photos.map((p) => ({ ...p, id: this.uid('ph'), uploadedAt: this.nowIso() }))
      insp.remarks = input.remarks?.trim() || undefined
      insp.recommendation = input.recommendation
      insp.manualReportRef = input.manualReportRef?.trim() || undefined
      insp.reportSubmittedBy = actor.name
      insp.reportSubmittedAt = this.nowIso()
      insp.status = 'REPORT_SUBMITTED'
      this.audit(
        actor,
        'Inspection report submitted',
        'INSPECTION',
        insp.id,
        `${app.ref}: ${INSPECTION_TYPE_LABELS[insp.type]} (round ${insp.round}) – ${insp.recommendation}`
      )
      this.recompute(app, actor)
      return structuredClone(insp)
    })
  }

  async mohSignOff(
    inspectionId: string,
    input: { decision: 'ENDORSED' | 'NOT_ENDORSED'; remarks?: string },
    actor: Actor
  ): Promise<Inspection> {
    return this.mutate(() => {
      if (actor.designation !== 'Medical Officer of Health') {
        throw new TradeLicenseError('Only the Medical Officer of Health can sign off PHI reports.')
      }
      const insp = this.db.inspections.find((i) => i.id === inspectionId)
      if (!insp) throw new TradeLicenseError('Inspection not found.')
      const app = this.app(insp.applicationId)
      if (insp.type !== 'PHI') throw new TradeLicenseError('MOH sign-off applies to PHI reports only.')
      if (insp.status !== 'REPORT_SUBMITTED') throw new TradeLicenseError('The PHI report has not been submitted yet.')
      if (insp.mohSignOff) throw new TradeLicenseError('This report has already been signed off by the MOH.')
      if (input.decision === 'NOT_ENDORSED' && !input.remarks?.trim()) {
        throw new TradeLicenseError('Remarks are required when the MOH does not endorse the report.')
      }
      insp.mohSignOff = { by: actor.name, at: this.nowIso(), decision: input.decision, remarks: input.remarks?.trim() || undefined }
      this.audit(actor, `PHI report ${input.decision === 'ENDORSED' ? 'endorsed' : 'not endorsed'} by MOH`, 'INSPECTION', insp.id, app.ref)
      this.recompute(app, actor)
      return structuredClone(insp)
    })
  }

  /** Re-evaluates inspection outcomes and moves the application on when all are complete. */
  private recompute(app: Application, actor: Actor): void {
    if (app.status !== 'UNDER_INSPECTION') return
    const outcome = evaluateInspections(app, this.db.inspections)
    app.inspectionStatus = outcome.status
    this.touch(app)
    if (!outcome.allComplete) return
    if (outcome.failingTypes.length > 0) {
      const latest = latestInspections(app, this.db.inspections)
      const issues = outcome.failingTypes
        .map((t) => {
          const i = latest[t]!
          const nc = i.checklist.filter((c) => c.result === 'NON_COMPLIANT').map((c) => c.label + (c.note ? ` (${c.note})` : ''))
          const moh = i.mohSignOff?.decision === 'NOT_ENDORSED' ? ` MOH: ${i.mohSignOff.remarks ?? 'not endorsed'}.` : ''
          return `${INSPECTION_TYPE_LABELS[t]}: ${[...nc, i.remarks].filter(Boolean).join('; ')}.${moh}`
        })
        .join('\n')
      const cr: CorrectionRequest = {
        id: this.uid('cr'),
        source: 'INSPECTION',
        issues,
        raisedBy: actor.name,
        raisedByDesignation: actor.designation,
        raisedAt: this.nowIso(),
        deadline: addDays(this.today(), this.db.settings.correctionDeadlineDays),
        status: 'OPEN',
        reinspectionTypes: outcome.failingTypes,
      }
      app.correctionRequests.push(cr)
      app.status = 'CORRECTIONS_REQUESTED'
      app.inspectionStatus = 'CORRECTIONS_REQUIRED'
      this.audit(actor, 'Rectification order issued', 'APPLICATION', app.id, `${app.ref}: deadline ${cr.deadline}`)
    } else {
      app.inspectionStatus = 'PASSED'
      this.startApproval(app, actor)
    }
  }

  private startApproval(app: Application, actor: Actor): void {
    app.approvalStages = resolveApprovalStages(this.category(app.categoryId), this.db.settings)
    app.status = 'IN_APPROVAL'
    app.approvalStatus = 'PENDING'
    app.currentApprovalStage = app.approvalStages[0]
    this.touch(app)
    this.audit(actor, 'Forwarded for approval', 'APPLICATION', app.id, `${app.ref} → ${APPROVAL_STAGE_LABELS[app.currentApprovalStage]}`)
  }

  async rectifyCorrection(
    applicationId: string,
    correctionId: string,
    input: { note: string; reinspectionTypes?: InspectionType[] },
    actor: Actor
  ): Promise<Application> {
    return this.mutate(() => {
      this.require(actor, 'CORRECTION_MANAGE')
      const app = this.app(applicationId)
      const cr = app.correctionRequests.find((c) => c.id === correctionId)
      if (!cr) throw new TradeLicenseError('Correction request not found.')
      if (app.status !== 'CORRECTIONS_REQUESTED' || cr.status === 'RECTIFIED') {
        throw new TradeLicenseError('This correction request is not open.')
      }
      if (!input.note.trim()) throw new TradeLicenseError('Describe how the issues were rectified.')
      const types = [...new Set([...cr.reinspectionTypes, ...(input.reinspectionTypes ?? [])])].filter((t) =>
        app.requiredInspections.includes(t)
      )
      cr.status = 'RECTIFIED'
      cr.resolvedAt = this.nowIso()
      cr.resolutionNote = input.note.trim()
      cr.reinspectionTypes = types
      this.audit(actor, 'Corrections marked as rectified', 'APPLICATION', app.id, `${app.ref}: ${cr.resolutionNote}`)
      if (types.length > 0) {
        const latest = latestInspections(app, this.db.inspections)
        types.forEach((t) => {
          const prev = latest[t]
          const insp: Inspection = {
            id: this.uid('insp'),
            applicationId: app.id,
            type: t,
            round: (prev?.round ?? 0) + 1,
            assignedTo: prev?.assignedTo ?? 'To be assigned',
            assignedBy: actor.name,
            assignedAt: this.nowIso(),
            status: 'ASSIGNED',
            photos: [],
            ...this.checklistFor(app, t),
          }
          this.db.inspections.push(insp)
          this.audit(actor, 'Reinspection scheduled', 'INSPECTION', insp.id, `${app.ref}: ${INSPECTION_TYPE_LABELS[t]} round ${insp.round}`)
        })
        app.status = 'UNDER_INSPECTION'
        app.approvalStatus = 'NOT_STARTED'
        app.currentApprovalStage = null
        app.inspectionStatus = 'REINSPECTION'
        this.touch(app)
      } else {
        this.startApproval(app, actor)
      }
      return structuredClone(app)
    })
  }

  async markCorrectionDeadlineMissed(applicationId: string, correctionId: string, actor: Actor): Promise<Application> {
    return this.mutate(() => {
      this.require(actor, 'CORRECTION_MANAGE')
      const app = this.app(applicationId)
      const cr = app.correctionRequests.find((c) => c.id === correctionId)
      if (!cr || cr.status !== 'OPEN') throw new TradeLicenseError('Open correction request not found.')
      if (cr.deadline >= this.today()) throw new TradeLicenseError(`The deadline (${cr.deadline}) has not passed yet.`)
      cr.status = 'DEADLINE_MISSED'
      this.touch(app)
      this.audit(actor, 'Rectification deadline missed', 'APPLICATION', app.id, `${app.ref}: deadline ${cr.deadline}`)
      return structuredClone(app)
    })
  }

  // ── Approvals ─────────────────────────────────────────────────────────────
  async recordApprovalDecision(
    applicationId: string,
    input: { decision: ApprovalDecision['decision']; remarks: string },
    actor: Actor
  ): Promise<Application> {
    return this.mutate(() => {
      const app = this.app(applicationId)
      if (app.status !== 'IN_APPROVAL' || !app.currentApprovalStage) {
        throw new TradeLicenseError('This application is not awaiting approval.')
      }
      const stage = app.currentApprovalStage
      if (!canActOnStage(actor.designation, stage)) {
        throw new TradeLicenseError(`Only the officer responsible for "${APPROVAL_STAGE_LABELS[stage]}" can decide at this stage.`)
      }
      if (input.decision !== 'APPROVED' && !input.remarks.trim()) {
        throw new TradeLicenseError('Remarks are required to reject or return an application.')
      }
      const decision: ApprovalDecision = {
        id: this.uid('apr'),
        applicationId: app.id,
        stage,
        decision: input.decision,
        officer: actor.name,
        designation: actor.designation,
        remarks: input.remarks.trim(),
        at: this.nowIso(),
      }
      this.db.approvals.push(decision)
      this.audit(actor, `${APPROVAL_STAGE_LABELS[stage]}: ${input.decision}`, 'APPROVAL', decision.id, `${app.ref}${decision.remarks ? ' – ' + decision.remarks : ''}`)

      if (input.decision === 'APPROVED') {
        const next = nextApprovalStage(app.approvalStages, stage)
        if (next) {
          app.currentApprovalStage = next
        } else {
          app.currentApprovalStage = null
          app.approvalStatus = 'APPROVED'
          app.status = 'APPROVED'
        }
      } else if (input.decision === 'REJECTED') {
        app.currentApprovalStage = null
        app.approvalStatus = 'REJECTED'
        app.status = 'REJECTED'
        app.rejectionReason = decision.remarks
      } else {
        app.currentApprovalStage = null
        app.approvalStatus = 'RETURNED'
        app.status = 'CORRECTIONS_REQUESTED'
        app.correctionRequests.push({
          id: this.uid('cr'),
          source: 'APPROVAL',
          issues: decision.remarks,
          raisedBy: actor.name,
          raisedByDesignation: actor.designation,
          raisedAt: this.nowIso(),
          deadline: addDays(this.today(), this.db.settings.correctionDeadlineDays),
          status: 'OPEN',
          reinspectionTypes: [],
        })
      }
      this.touch(app)
      return structuredClone(app)
    })
  }

  // ── Fees, licence issuance, payments ──────────────────────────────────────
  async assessLicenseFee(
    applicationId: string,
    input: { mode: 'RULE' | 'MANUAL'; manualAmount?: number; manualReason?: string; confirmUnconfirmedRule?: boolean },
    actor: Actor
  ): Promise<Application> {
    return this.mutate(() => {
      this.require(actor, 'FEE_ASSESS')
      const app = this.app(applicationId)
      if (app.status !== 'APPROVED') throw new TradeLicenseError('The licence fee is assessed after final (Chairman) approval.')
      const existing = this.db.charges.filter(
        (c) => c.applicationId === app.id && c.status === 'ACTIVE' && (c.type === 'LICENSE_FEE' || c.type === 'STAMP_DUTY')
      )
      if (existing.some((c) => chargeBalance(c, this.db.payments).paid > 0)) {
        throw new TradeLicenseError('Payments have already been recorded against the licence fee – it cannot be re-assessed.')
      }
      const business = this.business(app.businessKey)
      let assessment: NonNullable<Application['feeAssessment']>
      if (input.mode === 'RULE') {
        const calc = calculateLicenseFee(business, this.db.settings)
        if (!calc.ok) throw new TradeLicenseError(calc.reason)
        if (!calc.confirmed && !input.confirmUnconfirmedRule) {
          throw new TradeLicenseError('This fee rate is not officially confirmed. Confirm it is approved before applying.')
        }
        assessment = {
          basis: calc.basis,
          baseValue: calc.baseValue,
          bandLabel: calc.bandLabel,
          licenseFee: calc.licenseFee,
          stampDuty: calc.stampDuty,
          ruleConfirmed: calc.confirmed,
          assessedBy: actor.name,
          assessedAt: this.nowIso(),
        }
      } else {
        const amt = input.manualAmount
        if (amt === undefined || !(amt > 0)) throw new TradeLicenseError('Enter the licence fee amount.')
        if (!input.manualReason?.trim()) throw new TradeLicenseError('A justification / approval reference is required for a manually entered fee.')
        assessment = {
          basis: 'MANUAL',
          baseValue: null,
          licenseFee: round2(amt),
          stampDuty: calculateStampDuty(round2(amt), this.db.settings),
          ruleConfirmed: false,
          manualReason: input.manualReason.trim(),
          assessedBy: actor.name,
          assessedAt: this.nowIso(),
        }
      }
      existing.forEach((c) => {
        c.status = 'CANCELLED'
        this.audit(actor, 'Charge cancelled (re-assessment)', 'CHARGE', c.id, `${app.ref} ${c.type}`)
      })
      app.feeAssessment = assessment
      const fee = this.createCharge(app, 'LICENSE_FEE', assessment.licenseFee, actor.name)
      this.audit(actor, 'Licence fee assessed', 'CHARGE', fee.id, `${app.ref}: Rs. ${assessment.licenseFee.toFixed(2)} (${assessment.basis})`)
      if (assessment.stampDuty > 0) {
        const sd = this.createCharge(app, 'STAMP_DUTY', assessment.stampDuty, actor.name)
        this.audit(actor, 'Stamp duty assessed', 'CHARGE', sd.id, `${app.ref}: Rs. ${assessment.stampDuty.toFixed(2)}`)
      }
      this.touch(app)
      return structuredClone(app)
    })
  }

  /** Issues the licence. Unpaid fees do NOT block issuance (PDF: "License should be issued even if the fee isn't paid"). */
  async issueLicense(applicationId: string, actor: Actor): Promise<License> {
    return this.mutate(() => {
      this.require(actor, 'LICENSE_ISSUE')
      const app = this.app(applicationId)
      if (app.status === 'LICENSED') throw new TradeLicenseError('A licence has already been issued for this application.')
      if (app.status !== 'APPROVED' || app.approvalStatus !== 'APPROVED') {
        throw new TradeLicenseError('The application must complete all approval stages before a licence is issued.')
      }
      if (!app.feeAssessment) throw new TradeLicenseError('Assess the licence fee first so the amount due is recorded.')
      const dup = this.db.licenses.find((l) => l.businessKey === app.businessKey && l.licenseYear === app.licenseYear && l.status === 'ACTIVE')
      if (dup) throw new TradeLicenseError(`Licence ${dup.licenseNo} already exists for this business for ${app.licenseYear}.`)
      const business = this.business(app.businessKey)
      this.issueBusinessIdIfMissing(business, 'Issued at licence issuance')
      const balance = paymentStatusFor(app.id, ['LICENSE_FEE', 'STAMP_DUTY'], this.db.charges, this.db.payments)
      // A licence issued for a different year than today (advance or late) covers that licence year.
      const issueYear = Number(this.today().slice(0, 4))
      const startDate = app.licenseYear !== issueYear ? `${app.licenseYear}-01-01` : this.today()
      const validity = licenseValidity(startDate, this.db.settings)
      const lic: License = {
        id: this.uid('lic'),
        licenseNo: `TL/${app.licenseYear}/${String(this.nextSeq(`lic-${app.licenseYear}`)).padStart(4, '0')}`,
        applicationId: app.id,
        businessKey: business.key,
        businessId: business.businessId!,
        licenseYear: app.licenseYear,
        issueDate: this.today(),
        validFrom: validity.validFrom,
        validUntil: validity.validUntil,
        validityConfirmed: validity.confirmed,
        issuedBy: actor.name,
        status: 'ACTIVE',
        outstandingAtIssue: balance.outstanding,
      }
      this.db.licenses.push(lic)
      app.licenseId = lic.id
      app.status = 'LICENSED'
      this.touch(app)
      this.audit(
        actor,
        'Licence issued',
        'LICENSE',
        lic.id,
        `${lic.licenseNo} for ${business.name}${balance.outstanding > 0 ? ` – outstanding Rs. ${balance.outstanding.toFixed(2)}` : ''}`
      )
      return structuredClone(lic)
    })
  }

  private applyPayment(
    charge: Charge,
    input: { amount: number; date: string; method: PaymentMethod; receiptNo: string },
    actor: Actor
  ): Payment {
    if (charge.status !== 'ACTIVE') throw new TradeLicenseError('This charge has been cancelled.')
    const receipt = input.receiptNo.trim()
    if (!receipt) throw new TradeLicenseError('Receipt / reference number is required.')
    if (this.db.payments.some((p) => normalise(p.receiptNo) === normalise(receipt))) {
      throw new TradeLicenseError(`Receipt number ${receipt} has already been recorded.`)
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new TradeLicenseError('Payment date is required.')
    if (input.date > this.today()) throw new TradeLicenseError('Payment date cannot be in the future.')
    const { outstanding } = chargeBalance(charge, this.db.payments)
    const err = validatePaymentAmount(input.amount, outstanding, this.db.settings)
    if (err) throw new TradeLicenseError(err)
    const app = this.app(charge.applicationId)
    const payment: Payment = {
      id: this.uid('pay'),
      chargeId: charge.id,
      applicationId: charge.applicationId,
      type: charge.type,
      amount: round2(input.amount),
      date: input.date,
      method: input.method,
      receiptNo: receipt,
      recordedBy: actor.name,
      recordedAt: this.nowIso(),
    }
    this.db.payments.push(payment)
    this.audit(actor, 'Payment recorded', 'PAYMENT', payment.id, `${app.ref} ${charge.type}: Rs. ${payment.amount.toFixed(2)} (receipt ${receipt})`)

    if (charge.type === 'PROCESSING_FEE' && chargeBalance(charge, this.db.payments).status === 'PAID') {
      const b = this.business(charge.businessKey)
      const had = b.businessId
      this.issueBusinessIdIfMissing(b, 'Issued on payment of processing fee')
      if (!had && b.businessId) this.audit(actor, 'Business ID issued', 'BUSINESS', b.key, `${b.businessId} – ${b.name}`)
      if (app.status === 'SUBMITTED') {
        app.status = 'DOCUMENT_REVIEW'
        this.touch(app)
      }
    }
    return payment
  }

  async recordPayment(
    chargeId: string,
    input: { amount: number; date: string; method: PaymentMethod; receiptNo: string },
    actor: Actor
  ): Promise<Payment> {
    return this.mutate(() => {
      this.require(actor, 'PAYMENT_RECORD')
      const charge = this.db.charges.find((c) => c.id === chargeId)
      if (!charge) throw new TradeLicenseError('Charge not found.')
      return structuredClone(this.applyPayment(charge, input, actor))
    })
  }

  // ── Non-compliance & legal notices ────────────────────────────────────────
  async issueNotice(input: NoticeInput, actor: Actor): Promise<LegalNotice> {
    return this.mutate(() => {
      this.require(actor, 'NOTICE_MANAGE')
      const b = this.business(input.businessKey)
      if (!input.reasonDetails.trim()) throw new TradeLicenseError('Describe the reason for non-compliance.')
      if (!/^\d{4}-\d{2}-\d{2}$/.test(input.issueDate)) throw new TradeLicenseError('Notice issue date is required.')
      if (input.issueDate > this.today()) throw new TradeLicenseError('Notice issue date cannot be in the future.')
      if (!input.service.servedBy.trim() || !input.service.servedOn) throw new TradeLicenseError('Record who served the notice and when.')
      if (input.service.servedOn < input.issueDate) throw new TradeLicenseError('Service date cannot be before the issue date.')
      if (!input.responsibleOfficer.trim()) throw new TradeLicenseError('Responsible officer is required.')
      const dup = this.db.notices.find(
        (n) => n.businessKey === b.key && n.reason === input.reason && ['ISSUED', 'REFERRED_TO_LEGAL', 'COURT_ACTION'].includes(n.status)
      )
      if (dup) throw new TradeLicenseError(`Notice ${dup.noticeNo} is already active for this business for the same reason.`)
      const year = Number(input.issueDate.slice(0, 4))
      const notice: LegalNotice = {
        id: this.uid('ntc'),
        noticeNo: `TL/LN/${year}/${String(this.nextSeq(`notice-${year}`)).padStart(4, '0')}`,
        businessKey: b.key,
        applicationId: input.applicationId,
        reason: input.reason,
        reasonDetails: input.reasonDetails.trim(),
        issueDate: input.issueDate,
        // Compliance period runs from the date the notice was served.
        deadline: addDays(input.service.servedOn, this.db.settings.legalNoticeDays),
        service: { ...input.service },
        responsibleOfficer: input.responsibleOfficer.trim(),
        status: 'ISSUED',
        createdBy: actor.name,
        createdAt: this.nowIso(),
        updatedAt: this.nowIso(),
      }
      this.db.notices.push(notice)
      this.audit(actor, '14-day legal notice issued', 'NOTICE', notice.id, `${notice.noticeNo} – ${b.name} (deadline ${notice.deadline})`)
      return structuredClone(notice)
    })
  }

  async updateNotice(
    id: string,
    action:
      | { type: 'RESPONSE'; date: string; details: string; complied: boolean }
      | { type: 'REFER_LEGAL'; remarks?: string }
      | { type: 'COURT'; court: string; caseNo: string; hearingDate?: string; outcome?: string }
      | { type: 'PROHIBITION'; ref: string; date: string; details: string }
      | { type: 'CLOSE'; remarks: string },
    actor: Actor
  ): Promise<LegalNotice> {
    return this.mutate(() => {
      this.require(actor, 'NOTICE_MANAGE')
      const n = this.db.notices.find((x) => x.id === id)
      if (!n) throw new TradeLicenseError('Notice not found.')
      if (n.status === 'CLOSED' || n.status === 'COMPLIED') throw new TradeLicenseError('This notice is already closed.')
      switch (action.type) {
        case 'RESPONSE':
          if (!action.details.trim() || !action.date) throw new TradeLicenseError('Response date and details are required.')
          n.response = { date: action.date, details: action.details.trim(), recordedBy: actor.name }
          if (action.complied) n.status = 'COMPLIED'
          break
        case 'REFER_LEGAL':
          if (n.status !== 'ISSUED') throw new TradeLicenseError('Only notices in the 14-day stage can be referred.')
          if (n.deadline >= this.today()) throw new TradeLicenseError(`The 14-day period ends on ${n.deadline}; it cannot be referred yet.`)
          n.legalReferral = { date: this.today(), referredBy: actor.name, remarks: action.remarks?.trim() || undefined }
          n.status = 'REFERRED_TO_LEGAL'
          break
        case 'COURT':
          if (n.status !== 'REFERRED_TO_LEGAL' && n.status !== 'COURT_ACTION') throw new TradeLicenseError('Refer the case for legal action first.')
          if (!action.court.trim() || !action.caseNo.trim()) throw new TradeLicenseError('Court and case number are required.')
          n.court = { court: action.court.trim(), caseNo: action.caseNo.trim(), hearingDate: action.hearingDate || undefined, outcome: action.outcome?.trim() || undefined }
          n.status = 'COURT_ACTION'
          break
        case 'PROHIBITION':
          if (n.status !== 'COURT_ACTION') throw new TradeLicenseError('Prohibition / closure orders are recorded for cases before court.')
          if (!action.ref.trim() || !action.date || !action.details.trim()) throw new TradeLicenseError('Order reference, date and details are required.')
          n.prohibitionOrder = { ref: action.ref.trim(), date: action.date, details: action.details.trim() }
          break
        case 'CLOSE':
          if (!action.remarks.trim()) throw new TradeLicenseError('Closing remarks are required.')
          n.status = 'CLOSED'
          n.response = n.response ?? { date: this.today(), details: action.remarks.trim(), recordedBy: actor.name }
          break
      }
      this.touch(n)
      this.audit(actor, `Notice ${action.type.toLowerCase().replace('_', ' ')}`, 'NOTICE', n.id, n.noticeNo)
      return structuredClone(n)
    })
  }

  // ── Configuration ─────────────────────────────────────────────────────────
  async updateSettings(patch: Partial<TradeLicenseSettings>, actor: Actor): Promise<TradeLicenseSettings> {
    return this.mutate(() => {
      this.require(actor, 'SETTINGS_MANAGE')
      const next: TradeLicenseSettings = { ...this.db.settings, ...structuredClone(patch) }
      const errors: string[] = []
      next.feeBands.forEach((b) => {
        if (!b.label.trim()) errors.push('Every fee band needs a label.')
        if (b.licenseFee !== null && !(b.licenseFee >= 0)) errors.push(`Band ${b.label}: fee must be zero or more.`)
        if (b.minExclusive !== null && b.maxInclusive !== null && b.maxInclusive <= b.minExclusive) {
          errors.push(`Band ${b.label}: upper limit must be above the lower limit.`)
        }
        if (b.confirmed && b.licenseFee === null) errors.push(`Band ${b.label}: enter a fee before confirming it.`)
      })
      const sorted = [...next.feeBands].sort((a, b) => (a.minExclusive ?? -Infinity) - (b.minExclusive ?? -Infinity))
      for (let i = 1; i < sorted.length; i++) {
        const prevMax = sorted[i - 1].maxInclusive
        const curMin = sorted[i].minExclusive
        if (prevMax === null || (curMin !== null && curMin < prevMax) || curMin === null) {
          errors.push(`Fee bands "${sorted[i - 1].label}" and "${sorted[i].label}" overlap.`)
        }
      }
      if (next.processingFee.confirmed && !(next.processingFee.amount && next.processingFee.amount > 0)) {
        errors.push('Enter the processing fee amount before confirming it.')
      }
      if (!(next.stampDutyRate >= 0 && next.stampDutyRate <= 1)) errors.push('Stamp duty rate must be between 0% and 100%.')
      if (!(next.stampDutyCap >= 0)) errors.push('Stamp duty cap must be zero or more.')
      if (!(next.touristHotelTurnoverRate >= 0 && next.touristHotelTurnoverRate <= 1)) errors.push('Turnover rate must be between 0% and 100%.')
      if (!(next.correctionDeadlineDays >= 1)) errors.push('Rectification deadline must be at least 1 day.')
      if (!(next.legalNoticeDays >= 1)) errors.push('Legal notice period must be at least 1 day.')
      if (!(next.overdueApplicationDays >= 1)) errors.push('Overdue threshold must be at least 1 day.')
      if (!next.approvalChain.includes('SECRETARY') || !next.approvalChain.includes('CHAIRMAN')) {
        errors.push('The approval chain must include the Secretary and the Chairman.')
      }
      if (errors.length) throw new TradeLicenseError([...new Set(errors)].join(' '))
      this.db.settings = next
      this.audit(actor, 'Trade licence rules updated', 'SETTINGS', 'settings', Object.keys(patch).join(', '))
      return structuredClone(next)
    })
  }

  async updateCategory(category: BusinessCategory, actor: Actor): Promise<BusinessCategory> {
    return this.mutate(() => {
      this.require(actor, 'SETTINGS_MANAGE')
      if (!category.name.trim()) throw new TradeLicenseError('Category name is required.')
      const dupName = this.db.categories.find((c) => c.id !== category.id && normalise(c.name) === normalise(category.name))
      if (dupName) throw new TradeLicenseError(`A category named "${category.name}" already exists.`)
      if (category.approvalStages.length && (!category.approvalStages.includes('SECRETARY') || !category.approvalStages.includes('CHAIRMAN'))) {
        throw new TradeLicenseError('Category approval stages must include the Secretary and the Chairman.')
      }
      const idx = category.id ? this.db.categories.findIndex((c) => c.id === category.id) : -1
      const clean: BusinessCategory = {
        ...structuredClone(category),
        id: category.id || this.uid('cat'),
        name: category.name.trim(),
        requiredDocuments: [...new Set(category.requiredDocuments.map((d) => d.trim()).filter(Boolean))],
      }
      if (idx >= 0) this.db.categories[idx] = clean
      else this.db.categories.push(clean)
      // Make sure a checklist template exists for every required inspection type.
      clean.requiredInspections.forEach((t) => {
        if (!this.db.checklists.some((c) => c.categoryId === clean.id && c.inspectionType === t)) {
          this.db.checklists.push({ id: this.uid('chk'), categoryId: clean.id, inspectionType: t, items: [], confirmed: false, updatedAt: this.nowIso() })
        }
      })
      this.audit(actor, idx >= 0 ? 'Business category updated' : 'Business category created', 'SETTINGS', clean.id, clean.name)
      return structuredClone(clean)
    })
  }

  async updateChecklist(template: ChecklistTemplate, actor: Actor): Promise<ChecklistTemplate> {
    return this.mutate(() => {
      this.require(actor, 'SETTINGS_MANAGE')
      const idx = this.db.checklists.findIndex((c) => c.id === template.id)
      if (idx < 0) throw new TradeLicenseError('Checklist template not found.')
      const items = template.items.map((i) => ({ ...i, label: i.label.trim() })).filter((i) => i.label)
      const labels = new Set(items.map((i) => normalise(i.label)))
      if (labels.size !== items.length) throw new TradeLicenseError('Checklist items must be unique.')
      if (template.confirmed && items.length === 0) throw new TradeLicenseError('Add at least one condition before confirming the checklist.')
      this.db.checklists[idx] = {
        ...template,
        items: items.map((i) => ({ ...i, id: i.id || this.uid('ci') })),
        updatedAt: this.nowIso(),
      }
      this.audit(actor, 'Inspection checklist updated', 'SETTINGS', template.id, `${template.categoryId} / ${template.inspectionType}`)
      return structuredClone(this.db.checklists[idx])
    })
  }
}

export const tradeLicenseService = new TradeLicenseService()
