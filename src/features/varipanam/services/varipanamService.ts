import type {
  Zone,
  Ward,
  Road,
  Property,
  VaripanamSettings,
  AuditEntry,
  Payment,
  FieldCollection,
  AtdApplication,
  LocationHistory,
  PropertyIdentifier,
  PropertySubmission,
  OnlinePaymentAttempt,
  SubdivisionLink,
  AmalgamationLink,
  Owner,
  OwnershipRecord,
  Notice,
  Designation,
} from '../types/varipanam'
import {
  INITIAL_ZONES,
  INITIAL_WARDS,
  INITIAL_ROADS,
  INITIAL_PROPERTIES,
  DEFAULT_VARIPANAM_SETTINGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PAYMENTS,
  INITIAL_FIELD_COLLECTIONS,
  INITIAL_ATD_APPLICATIONS,
  INITIAL_PROPERTY_SUBMISSIONS,
  INITIAL_ONLINE_PAYMENTS,
  INITIAL_SUBDIVISIONS,
  INITIAL_NOTICES,
  INITIAL_LOCATION_HISTORIES,
  INITIAL_IDENTIFIER_HISTORIES,
} from '../mock/varipanamMockData'

const STORAGE_KEYS = {
  SETTINGS: 'varipanam_settings',
  PROPERTIES: 'varipanam_properties',
  ROADS: 'varipanam_roads',
  AUDIT: 'varipanam_audit',
  PAYMENTS: 'varipanam_payments',
  COLLECTIONS: 'varipanam_field_collections',
  ATD: 'varipanam_atd',
  SUBMISSIONS: 'varipanam_submissions',
  ONLINE_PAYMENTS: 'varipanam_online_payments',
  SUBDIVISIONS: 'varipanam_subdivisions',
  AMALGAMATIONS: 'varipanam_amalgamations',
  NOTICES: 'varipanam_notices',
  LOCATION_HISTORIES: 'varipanam_location_histories',
  IDENTIFIERS: 'varipanam_identifiers',
}

class VaripanamService {
  private load<T>(key: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(key)
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore
    }
    return fallback
  }

  private save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch {
      // ignore
    }
  }

  // ── Settings ─────────────────────────────────────────────────────────────
  async getSettings(): Promise<VaripanamSettings> {
    return new Promise((resolve) => {
      const settings = this.load<VaripanamSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_VARIPANAM_SETTINGS)
      setTimeout(() => resolve(settings), 30)
    })
  }

  async updateSettings(newSettings: Partial<VaripanamSettings>, user = 'Super Admin', actingAs: Designation = 'Super Admin'): Promise<VaripanamSettings> {
    return new Promise((resolve) => {
      const current = this.load<VaripanamSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_VARIPANAM_SETTINGS)
      const updated = { ...current, ...newSettings }
      this.save(STORAGE_KEYS.SETTINGS, updated)
      this.logAudit({
        entityType: 'Settings',
        entityId: 'global',
        action: 'UPDATE_SETTINGS',
        performedBy: user,
        actingAs,
        details: 'Settings configuration updated.',
      })
      setTimeout(() => resolve(updated), 40)
    })
  }

  // ── Geographic Units ────────────────────────────────────────────────────
  async getZones(): Promise<Zone[]> {
    return new Promise((resolve) => setTimeout(() => resolve(INITIAL_ZONES), 20))
  }

  async getWards(zoneId?: string): Promise<Ward[]> {
    return new Promise((resolve) => {
      const wards = zoneId ? INITIAL_WARDS.filter((w) => w.zoneId === zoneId) : INITIAL_WARDS
      setTimeout(() => resolve(wards), 20)
    })
  }

  async getRoads(zoneId?: string): Promise<Road[]> {
    return new Promise((resolve) => {
      const stored = this.load<Road[]>(STORAGE_KEYS.ROADS, INITIAL_ROADS)
      const roads = zoneId ? stored.filter((r) => r.zoneId === zoneId) : stored
      setTimeout(() => resolve(roads), 20)
    })
  }

  async createRoad(roadData: Omit<Road, 'id'>, user = 'Super Admin', actingAs: Designation = 'Super Admin'): Promise<Road> {
    return new Promise((resolve) => {
      const roads = this.load<Road[]>(STORAGE_KEYS.ROADS, INITIAL_ROADS)
      const newRoad: Road = {
        ...roadData,
        id: `road-${Date.now()}`,
      }
      roads.push(newRoad)
      this.save(STORAGE_KEYS.ROADS, roads)
      this.logAudit({
        entityType: 'Property',
        entityId: newRoad.id,
        action: 'CREATE_ROAD',
        performedBy: user,
        actingAs,
        details: `Created new road: ${newRoad.name} (${newRoad.code})`,
      })
      setTimeout(() => resolve(newRoad), 30)
    })
  }

  // ── Properties (Approved Master Registry) ─────────────────────────────────
  async getProperties(): Promise<Property[]> {
    return new Promise((resolve) => {
      const properties = this.load<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES)
      setTimeout(() => resolve(properties), 40)
    })
  }

  async getPropertyById(id: string): Promise<Property | null> {
    return new Promise((resolve) => {
      const properties = this.load<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES)
      const prop = properties.find((p) => p.id === id || p.assessmentNumber.toLowerCase() === id.toLowerCase()) || null
      setTimeout(() => resolve(prop), 30)
    })
  }

  async addProperty(
    propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'dues' | 'status'>,
    user = 'Super Admin',
    actingAs: Designation = 'Super Admin'
  ): Promise<{ property: Property }> {
    return new Promise((resolve, reject) => {
      const properties = this.load<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES)
      const submissions = this.load<PropertySubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_PROPERTY_SUBMISSIONS)

      const existsInApproved = properties.some(
        (p) => p.assessmentNumber.trim().toLowerCase() === propertyData.assessmentNumber.trim().toLowerCase()
      )
      const existsInPending = submissions.some(
        (s) => s.status !== 'APPROVED' && s.assessmentNumber.trim().toLowerCase() === propertyData.assessmentNumber.trim().toLowerCase()
      )

      if (existsInApproved || existsInPending) {
        reject(new Error(`Assessment number "${propertyData.assessmentNumber}" is already in use by an approved or pending property.`))
        return
      }

      const id = `prop-${Date.now()}`
      const quarterlyAmount = Math.round((propertyData.annualAssessedValue * 0.1) / 4)
      const currentYear = 2026

      const newProperty: Property = {
        ...propertyData,
        id,
        approvalStatus: 'APPROVED',
        status: 'Due soon',
        dues: [
          { id: `due-${id}-q1`, propertyId: id, year: currentYear, quarter: 1, amount: quarterlyAmount, paidAmount: 0, status: 'Due', dueDate: '2026-03-31' },
          { id: `due-${id}-q2`, propertyId: id, year: currentYear, quarter: 2, amount: quarterlyAmount, paidAmount: 0, status: 'Due', dueDate: '2026-06-30' },
          { id: `due-${id}-q3`, propertyId: id, year: currentYear, quarter: 3, amount: quarterlyAmount, paidAmount: 0, status: 'Due', dueDate: '2026-09-30' },
          { id: `due-${id}-q4`, propertyId: id, year: currentYear, quarter: 4, amount: quarterlyAmount, paidAmount: 0, status: 'Due', dueDate: '2026-12-31' },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      properties.unshift(newProperty)
      this.save(STORAGE_KEYS.PROPERTIES, properties)

      this.logAudit({
        entityType: 'Property',
        entityId: id,
        action: 'CREATE_PROPERTY',
        performedBy: user,
        actingAs,
        details: `Created approved property record ${newProperty.assessmentNumber} (${newProperty.propertyNumber})`,
      })

      setTimeout(() => resolve({ property: newProperty }), 40)
    })
  }

  async updatePropertyLocation(
    propertyId: string,
    newCoords: { latitude: number; longitude: number },
    reason: string,
    user = 'Super Admin',
    actingAs: Designation = 'Super Admin'
  ): Promise<{ property: Property; locationHistory: LocationHistory }> {
    return new Promise((resolve, reject) => {
      const list = this.load<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES)
      const index = list.findIndex((p) => p.id === propertyId)

      if (index === -1) {
        reject(new Error('Property not found.'))
        return
      }

      const oldProp = list[index]
      const historyEntry: LocationHistory = {
        id: `lh-${Date.now()}`,
        propertyId,
        oldLatitude: oldProp.latitude,
        oldLongitude: oldProp.longitude,
        newLatitude: newCoords.latitude,
        newLongitude: newCoords.longitude,
        changedBy: user,
        changedAt: new Date().toISOString(),
        reason,
      }

      const histories = this.load<LocationHistory[]>(STORAGE_KEYS.LOCATION_HISTORIES, INITIAL_LOCATION_HISTORIES)
      histories.unshift(historyEntry)
      this.save(STORAGE_KEYS.LOCATION_HISTORIES, histories)

      const updatedProp: Property = {
        ...oldProp,
        latitude: newCoords.latitude,
        longitude: newCoords.longitude,
        updatedAt: new Date().toISOString(),
      }
      list[index] = updatedProp
      this.save(STORAGE_KEYS.PROPERTIES, list)

      this.logAudit({
        entityType: 'Property',
        entityId: propertyId,
        action: 'UPDATE_LOCATION',
        performedBy: user,
        actingAs,
        details: `Coordinates changed from (${oldProp.latitude}, ${oldProp.longitude}) to (${newCoords.latitude}, ${newCoords.longitude}). Reason: ${reason}`,
      })

      setTimeout(() => resolve({ property: updatedProp, locationHistory: historyEntry }), 40)
    })
  }

  // ── Property Submissions & Approvals Queue ───────────────────────────────
  async getSubmissions(): Promise<PropertySubmission[]> {
    return new Promise((resolve) => {
      const list = this.load<PropertySubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_PROPERTY_SUBMISSIONS)
      setTimeout(() => resolve(list), 30)
    })
  }

  async submitNewProperty(
    data: Omit<PropertySubmission, 'id' | 'daysWaiting' | 'reviewHistory'>,
    user = 'Super Admin',
    actingAs: Designation = 'Revenue Inspector'
  ): Promise<PropertySubmission> {
    return new Promise((resolve, reject) => {
      const properties = this.load<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES)
      const submissions = this.load<PropertySubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_PROPERTY_SUBMISSIONS)

      const isNewProperty = !data.submissionType || data.submissionType === 'NEW_PROPERTY'
      const existsInApproved = isNewProperty && properties.some((p) => p.assessmentNumber.trim().toLowerCase() === data.assessmentNumber.trim().toLowerCase())
      const existsInPending = submissions.some((s) => s.status === 'PENDING_APPROVAL' && s.assessmentNumber.trim().toLowerCase() === data.assessmentNumber.trim().toLowerCase())

      if (existsInApproved) {
        reject(new Error(`Assessment number "${data.assessmentNumber}" is already in use by an approved cadastral unit.`))
        return
      }

      if (existsInPending) {
        reject(new Error(`An active submission for assessment number "${data.assessmentNumber}" is already awaiting council approval.`))
        return
      }

      const id = `sub-${Date.now()}`
      const newSubmission: PropertySubmission = {
        ...data,
        id,
        daysWaiting: 0,
        reviewHistory: [
          {
            id: `pse-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: user,
            actingAs,
            action: data.status === 'DRAFT' ? 'DRAFT_CREATED' : 'SUBMITTED',
            message: data.status === 'DRAFT' ? 'Property draft saved.' : 'Property dossier submitted for approval.',
          },
        ],
      }

      submissions.unshift(newSubmission)
      this.save(STORAGE_KEYS.SUBMISSIONS, submissions)

      this.logAudit({
        entityType: 'Property',
        entityId: id,
        action: data.status === 'DRAFT' ? 'CREATE_DRAFT' : 'SUBMIT_FOR_APPROVAL',
        performedBy: user,
        actingAs,
        details: `${data.status === 'DRAFT' ? 'Saved draft' : 'Submitted'} property ${data.assessmentNumber} for council approval.`,
      })

      setTimeout(() => resolve(newSubmission), 40)
    })
  }

  async approveSubmission(submissionId: string, comment?: string, user = 'Super Admin', actingAs: Designation = 'Secretary'): Promise<Property> {
    return new Promise((resolve, reject) => {
      const submissions = this.load<PropertySubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_PROPERTY_SUBMISSIONS)
      const sub = submissions.find((s) => s.id === submissionId)
      if (!sub) {
        reject(new Error('Submission not found.'))
        return
      }

      sub.status = 'APPROVED'
      sub.daysWaiting = 0
      sub.reviewHistory.unshift({
        id: `pse-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: user,
        actingAs,
        action: 'APPROVED',
        message: comment || 'Property formally approved and activated in the assessment register.',
      })
      this.save(STORAGE_KEYS.SUBMISSIONS, submissions)

      const properties = this.load<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES)
      const propId = sub.propertyId || `prop-${Date.now()}`
      const quarterlyAmount = Math.round((sub.annualAssessedValue * 0.1) / 4)

      const newProperty: Property = {
        id: propId,
        assessmentNumber: sub.assessmentNumber,
        propertyNumber: sub.propertyNumber,
        description: sub.description,
        propertyType: sub.propertyType,
        annualAssessedValue: sub.annualAssessedValue,
        latitude: sub.latitude,
        longitude: sub.longitude,
        zoneId: sub.zoneId,
        wardId: sub.wardId,
        roadId: sub.roadId,
        currentOwner: {
          id: `own-${Date.now()}`,
          name: sub.ownerName,
          nic: sub.ownerNic,
          mobile: sub.ownerMobile,
          postalAddress: sub.postalAddress,
        },
        approvalStatus: 'APPROVED',
        status: 'Due soon',
        dues: [
          { id: `due-${propId}-q1`, propertyId: propId, year: 2026, quarter: 1, amount: quarterlyAmount, paidAmount: 0, status: 'Due', dueDate: '2026-03-31' },
          { id: `due-${propId}-q2`, propertyId: propId, year: 2026, quarter: 2, amount: quarterlyAmount, paidAmount: 0, status: 'Due', dueDate: '2026-06-30' },
          { id: `due-${propId}-q3`, propertyId: propId, year: 2026, quarter: 3, amount: quarterlyAmount, paidAmount: 0, status: 'Due', dueDate: '2026-09-30' },
          { id: `due-${propId}-q4`, propertyId: propId, year: 2026, quarter: 4, amount: quarterlyAmount, paidAmount: 0, status: 'Due', dueDate: '2026-12-31' },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      properties.unshift(newProperty)
      this.save(STORAGE_KEYS.PROPERTIES, properties)

      this.logAudit({
        entityType: 'Property',
        entityId: newProperty.id,
        action: 'APPROVE_PROPERTY',
        performedBy: user,
        actingAs,
        details: `Approved property ${newProperty.assessmentNumber}. Activated in assessment register. ${comment || ''}`,
      })

      setTimeout(() => resolve(newProperty), 50)
    })
  }

  async sendBackSubmission(submissionId: string, message: string, user = 'Super Admin', actingAs: Designation = 'Secretary'): Promise<PropertySubmission> {
    return new Promise((resolve, reject) => {
      if (!message || message.trim().length < 10) {
        reject(new Error('Send-back message is required with a minimum of 10 characters.'))
        return
      }

      const submissions = this.load<PropertySubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_PROPERTY_SUBMISSIONS)
      const sub = submissions.find((s) => s.id === submissionId)
      if (!sub) {
        reject(new Error('Submission not found.'))
        return
      }

      sub.status = 'SENT_BACK'
      sub.lastMessage = message
      sub.reviewHistory.unshift({
        id: `pse-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: user,
        actingAs,
        action: 'SENT_BACK',
        message,
      })
      this.save(STORAGE_KEYS.SUBMISSIONS, submissions)

      this.logAudit({
        entityType: 'Property',
        entityId: sub.id,
        action: 'SEND_BACK_SUBMISSION',
        performedBy: user,
        actingAs,
        details: `Submission sent back with message: "${message}"`,
      })

      setTimeout(() => resolve(sub), 40)
    })
  }

  // ── ATD Applications (Flowchart 2) ──────────────────────────────────────
  async getAtdApplications(): Promise<AtdApplication[]> {
    return new Promise((resolve) => {
      const list = this.load<AtdApplication[]>(STORAGE_KEYS.ATD, INITIAL_ATD_APPLICATIONS)
      setTimeout(() => resolve(list), 30)
    })
  }

  async createAtdApplication(data: Omit<AtdApplication, 'id' | 'createdAt' | 'updatedAt' | 'comments'>, user = 'Super Admin', actingAs: Designation = 'Subject Counter'): Promise<AtdApplication> {
    return new Promise((resolve) => {
      const list = this.load<AtdApplication[]>(STORAGE_KEYS.ATD, INITIAL_ATD_APPLICATIONS)
      const newAtd: AtdApplication = {
        ...data,
        id: `atd-${Date.now()}`,
        comments: [
          {
            id: `c-${Date.now()}`,
            author: user,
            role: actingAs,
            actingAs,
            comment: 'Dossier registered at front desk. ATD receipt issued.',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      list.unshift(newAtd)
      this.save(STORAGE_KEYS.ATD, list)
      this.logAudit({
        entityType: 'ATD',
        entityId: newAtd.id,
        action: 'CREATE_ATD_APPLICATION',
        performedBy: user,
        actingAs,
        details: `Registered ATD Application ${newAtd.atdNumber} for applicant ${newAtd.applicantName}`,
      })
      setTimeout(() => resolve(newAtd), 40)
    })
  }

  async updateAtdApplication(id: string, updates: Partial<AtdApplication>, user = 'Super Admin', actingAs: Designation = 'Revenue Inspector'): Promise<AtdApplication> {
    return new Promise((resolve, reject) => {
      const list = this.load<AtdApplication[]>(STORAGE_KEYS.ATD, INITIAL_ATD_APPLICATIONS)
      const index = list.findIndex((a) => a.id === id)
      if (index === -1) {
        reject(new Error('ATD application not found.'))
        return
      }

      const updated = {
        ...list[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      list[index] = updated
      this.save(STORAGE_KEYS.ATD, list)

      this.logAudit({
        entityType: 'ATD',
        entityId: id,
        action: 'UPDATE_ATD_STAGE',
        performedBy: user,
        actingAs,
        details: `ATD Application ${updated.atdNumber} advanced to ${updated.stage}. Status: ${updated.status}`,
      })

      setTimeout(() => resolve(updated), 40)
    })
  }

  // ── Online Payments & Mock Gateway ──────────────────────────────────────
  async getOnlinePayments(): Promise<OnlinePaymentAttempt[]> {
    return new Promise((resolve) => {
      const list = this.load<OnlinePaymentAttempt[]>(STORAGE_KEYS.ONLINE_PAYMENTS, INITIAL_ONLINE_PAYMENTS)
      setTimeout(() => resolve(list), 30)
    })
  }

  async simulateOnlinePayment(data: Omit<OnlinePaymentAttempt, 'id' | 'timestamp' | 'transactionRef'>): Promise<OnlinePaymentAttempt> {
    return new Promise((resolve) => {
      const list = this.load<OnlinePaymentAttempt[]>(STORAGE_KEYS.ONLINE_PAYMENTS, INITIAL_ONLINE_PAYMENTS)
      const newAttempt: OnlinePaymentAttempt = {
        ...data,
        id: `olp-${Date.now()}`,
        timestamp: new Date().toISOString(),
        transactionRef: `GW-${Date.now().toString().slice(-6)}`,
        receiptNumber: data.status === 'SUCCESS' ? `E-REC-${Date.now().toString().slice(-4)}` : undefined,
        smsSent: data.status === 'SUCCESS',
        emailSent: data.status === 'SUCCESS',
      }
      list.unshift(newAttempt)
      this.save(STORAGE_KEYS.ONLINE_PAYMENTS, list)
      setTimeout(() => resolve(newAttempt), 40)
    })
  }

  // ── Subdivision ──────────────────────────────────────────────────────────
  async getSubdivisions(): Promise<SubdivisionLink[]> {
    return new Promise((resolve) => {
      const list = this.load<SubdivisionLink[]>(STORAGE_KEYS.SUBDIVISIONS, INITIAL_SUBDIVISIONS)
      setTimeout(() => resolve(list), 30)
    })
  }

  async createSubdivision(subdivision: Omit<SubdivisionLink, 'id' | 'createdDate'>, user = 'Super Admin', actingAs: Designation = 'Secretary'): Promise<SubdivisionLink> {
    return new Promise((resolve) => {
      const list = this.load<SubdivisionLink[]>(STORAGE_KEYS.SUBDIVISIONS, INITIAL_SUBDIVISIONS)
      const newSub: SubdivisionLink = {
        ...subdivision,
        id: `subdiv-${Date.now()}`,
        createdDate: new Date().toISOString().split('T')[0],
      }
      list.unshift(newSub)
      this.save(STORAGE_KEYS.SUBDIVISIONS, list)

      this.logAudit({
        entityType: 'Subdivision',
        entityId: newSub.id,
        action: 'SUBDIVIDE_PROPERTY',
        performedBy: user,
        actingAs,
        details: `Subdivided parent property ${newSub.parentPropertyId} into child plot ${newSub.childAssessmentNumber}. Arrears transferred: LKR ${newSub.allocatedArrears}.`,
      })

      setTimeout(() => resolve(newSub), 40)
    })
  }

  // ── Amalgamation ─────────────────────────────────────────────────────────
  async getAmalgamations(): Promise<AmalgamationLink[]> {
    return new Promise((resolve) => {
      const list = this.load<AmalgamationLink[]>(STORAGE_KEYS.AMALGAMATIONS, [])
      setTimeout(() => resolve(list), 30)
    })
  }

  async createAmalgamation(
    amalgamation: Omit<AmalgamationLink, 'id' | 'createdDate'>,
    user = 'Super Admin',
    actingAs: Designation = 'Secretary'
  ): Promise<AmalgamationLink> {
    return new Promise((resolve) => {
      const list = this.load<AmalgamationLink[]>(STORAGE_KEYS.AMALGAMATIONS, [])
      const newAmalg: AmalgamationLink = {
        ...amalgamation,
        id: `amalg-${Date.now()}`,
        createdDate: new Date().toISOString().split('T')[0],
      }
      list.unshift(newAmalg)
      this.save(STORAGE_KEYS.AMALGAMATIONS, list)

      this.logAudit({
        entityType: 'Subdivision',
        entityId: newAmalg.id,
        action: 'AMALGAMATE_PROPERTIES',
        performedBy: user,
        actingAs,
        details: `Amalgamated constituent plots [${newAmalg.parentPropertyIds.join(', ')}] into consolidated assessment #${newAmalg.amalgamatedAssessmentNumber}. Combined arrears: LKR ${newAmalg.totalArrearsTransferred}.`,
      })

      setTimeout(() => resolve(newAmalg), 40)
    })
  }

  // ── Ownership Title Transfers ─────────────────────────────────────────────
  async transferOwnership(
    propertyId: string,
    newOwner: Owner,
    details: {
      transferGround: string
      deedNumber: string
      notaryReportRef?: string
      effectiveDate: string
      arrearsAcknowledged: boolean
    },
    user = 'Super Admin',
    actingAs: Designation = 'Secretary'
  ): Promise<{ property: Property; ownershipRecord: OwnershipRecord }> {
    return new Promise((resolve, reject) => {
      const list = this.load<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES)
      const index = list.findIndex((p) => p.id === propertyId)
      if (index === -1) {
        reject(new Error('Property not found.'))
        return
      }

      const prop = list[index]
      const oldOwner = prop.currentOwner

      const ownershipRecord: OwnershipRecord = {
        id: `own-${Date.now()}`,
        propertyId,
        ownerId: oldOwner.id,
        ownerName: oldOwner.name,
        nic: oldOwner.nic,
        mobile: oldOwner.mobile,
        isCurrent: false,
        effectiveDate: details.effectiveDate,
        endDate: new Date().toISOString().split('T')[0],
        deedNumber: details.deedNumber,
        notes: `Transfer Ground: ${details.transferGround}. Notary Ref: ${details.notaryReportRef || 'N/A'}. Arrears debt liability acknowledged by transferee.`,
        approvedBy: user,
        actingAs,
      }

      const existingHistory = prop.ownerHistory || []
      const updatedProp: Property = {
        ...prop,
        currentOwner: {
          ...newOwner,
          id: `owner-${Date.now()}`,
        },
        ownerHistory: [ownershipRecord, ...existingHistory],
        updatedAt: new Date().toISOString(),
      }

      list[index] = updatedProp
      this.save(STORAGE_KEYS.PROPERTIES, list)

      this.logAudit({
        entityType: 'Ownership',
        entityId: propertyId,
        action: 'TRANSFER_OWNERSHIP',
        performedBy: user,
        actingAs,
        details: `Ownership of assessment #${prop.assessmentNumber} transferred from ${oldOwner.name} (${oldOwner.nic}) to ${newOwner.name} (${newOwner.nic}) under ${details.transferGround}. Deed No: ${details.deedNumber}. Outstanding arrears remain continuously attached to property.`,
      })

      setTimeout(() => resolve({ property: updatedProp, ownershipRecord }), 40)
    })
  }

  // ── Notices ──────────────────────────────────────────────────────────────
  async getNotices(): Promise<Notice[]> {
    return new Promise((resolve) => {
      const list = this.load<Notice[]>(STORAGE_KEYS.NOTICES, INITIAL_NOTICES)
      setTimeout(() => resolve(list), 30)
    })
  }

  // ── Payments & Field Collections ─────────────────────────────────────────
  async getPayments(propertyId?: string): Promise<Payment[]> {
    return new Promise((resolve) => {
      const list = this.load<Payment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS)
      const filtered = propertyId ? list.filter((p) => p.propertyId === propertyId) : list
      setTimeout(() => resolve(filtered), 30)
    })
  }

  async recordPayment(payment: Omit<Payment, 'id'>, user = 'Super Admin', actingAs: Designation = 'Counter Officer'): Promise<Payment> {
    return new Promise((resolve) => {
      const list = this.load<Payment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS)
      const newPayment: Payment = {
        ...payment,
        id: `pay-${Date.now()}`,
        actingAs,
      }
      list.unshift(newPayment)
      this.save(STORAGE_KEYS.PAYMENTS, list)

      this.logAudit({
        entityType: 'Payment',
        entityId: newPayment.id,
        action: 'RECORD_PAYMENT',
        performedBy: user,
        actingAs,
        details: `Recorded ${newPayment.status} payment ${newPayment.receiptNumber} of LKR ${newPayment.amount} via ${newPayment.channel}`,
      })

      setTimeout(() => resolve(newPayment), 40)
    })
  }

  async getFieldCollections(): Promise<FieldCollection[]> {
    return new Promise((resolve) => {
      const list = this.load<FieldCollection[]>(STORAGE_KEYS.COLLECTIONS, INITIAL_FIELD_COLLECTIONS)
      setTimeout(() => resolve(list), 30)
    })
  }

  async reconcileFieldCollection(collectionId: string, cashierName: string, actingAs: Designation = 'Counter Officer'): Promise<void> {
    return new Promise((resolve, reject) => {
      const collections = this.load<FieldCollection[]>(STORAGE_KEYS.COLLECTIONS, INITIAL_FIELD_COLLECTIONS)
      const col = collections.find((c) => c.id === collectionId)
      if (!col) {
        reject(new Error('Collection record not found.'))
        return
      }

      col.status = 'Reconciled'
      this.save(STORAGE_KEYS.COLLECTIONS, collections)

      // Promote payments from TEMPORARY to OFFICIAL
      const payments = this.load<Payment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS)
      payments.forEach((p) => {
        if (col.receiptIds.includes(p.receiptNumber) || col.receiptIds.includes(p.temporaryReceiptNumber || '')) {
          p.status = 'OFFICIAL'
          p.officialReceiptNumber = `OFF-REC-${Date.now().toString().slice(-4)}`
        }
      })
      this.save(STORAGE_KEYS.PAYMENTS, payments)

      this.logAudit({
        entityType: 'Reconciliation',
        entityId: collectionId,
        action: 'RECONCILE_FIELD_COLLECTION',
        performedBy: cashierName,
        actingAs,
        details: `Reconciled field collection ${collectionId}. Promoted field receipts to official receipts.`,
      })

      setTimeout(() => resolve(), 50)
    })
  }

  // ── History & Audits ────────────────────────────────────────────────────
  async getAuditLogs(propertyId?: string): Promise<AuditEntry[]> {
    return new Promise((resolve) => {
      const list = this.load<AuditEntry[]>(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS)
      const filtered = propertyId ? list.filter((a) => a.entityId === propertyId) : list
      setTimeout(() => resolve(filtered), 30)
    })
  }

  async logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<AuditEntry> {
    const list = this.load<AuditEntry[]>(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS)
    const newEntry: AuditEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    }
    list.unshift(newEntry)
    this.save(STORAGE_KEYS.AUDIT, list)
    return newEntry
  }

  async getLocationHistories(propertyId: string): Promise<LocationHistory[]> {
    return new Promise((resolve) => {
      const list = this.load<LocationHistory[]>(STORAGE_KEYS.LOCATION_HISTORIES, INITIAL_LOCATION_HISTORIES)
      resolve(list.filter((h) => h.propertyId === propertyId))
    })
  }

  async getIdentifierHistories(propertyId: string): Promise<PropertyIdentifier[]> {
    return new Promise((resolve) => {
      const list = this.load<PropertyIdentifier[]>(STORAGE_KEYS.IDENTIFIERS, INITIAL_IDENTIFIER_HISTORIES)
      resolve(list.filter((h) => h.propertyId === propertyId))
    })
  }

  // ── Pending Badges Count Helper ─────────────────────────────────────────
  async getPendingCounts(): Promise<{ pendingApprovals: number; pendingAtd: number }> {
    const submissions = this.load<PropertySubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_PROPERTY_SUBMISSIONS)
    const atds = this.load<AtdApplication[]>(STORAGE_KEYS.ATD, INITIAL_ATD_APPLICATIONS)
    return {
      pendingApprovals: submissions.filter((s) => s.status === 'PENDING_APPROVAL').length,
      pendingAtd: atds.filter((a) => a.status === 'In Progress').length,
    }
  }

  // ── Reset Mock Data ─────────────────────────────────────────────────────
  resetMockData(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
  }
}

export const varipanamService = new VaripanamService()
export default varipanamService
