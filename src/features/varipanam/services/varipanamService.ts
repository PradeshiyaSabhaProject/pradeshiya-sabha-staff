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
  VaripanamFilterState,
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
  INITIAL_LOCATION_HISTORIES,
  INITIAL_IDENTIFIER_HISTORIES,
} from '../mock/varipanamMockData'

// Simulated local storage keys for persistence during testing
const STORAGE_KEYS = {
  SETTINGS: 'varipanam_settings',
  PROPERTIES: 'varipanam_properties',
  ROADS: 'varipanam_roads',
  AUDIT: 'varipanam_audit',
  PAYMENTS: 'varipanam_payments',
  COLLECTIONS: 'varipanam_field_collections',
  ATD: 'varipanam_atd',
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
      setTimeout(() => resolve(settings), 50)
    })
  }

  async updateSettings(newSettings: Partial<VaripanamSettings>, user = 'Super Admin'): Promise<VaripanamSettings> {
    return new Promise((resolve) => {
      const current = this.load<VaripanamSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_VARIPANAM_SETTINGS)
      const updated = { ...current, ...newSettings }
      this.save(STORAGE_KEYS.SETTINGS, updated)
      this.logAudit({
        entityType: 'Settings',
        entityId: 'global',
        action: 'UPDATE_SETTINGS',
        performedBy: user,
        details: 'Settings configuration updated.',
      })
      setTimeout(() => resolve(updated), 50)
    })
  }

  // ── Geographic Units ────────────────────────────────────────────────────
  async getZones(): Promise<Zone[]> {
    return new Promise((resolve) => setTimeout(() => resolve(INITIAL_ZONES), 30))
  }

  async getWards(zoneId?: string): Promise<Ward[]> {
    return new Promise((resolve) => {
      const wards = zoneId ? INITIAL_WARDS.filter((w) => w.zoneId === zoneId) : INITIAL_WARDS
      setTimeout(() => resolve(wards), 30)
    })
  }

  async getRoads(zoneId?: string): Promise<Road[]> {
    return new Promise((resolve) => {
      const stored = this.load<Road[]>(STORAGE_KEYS.ROADS, INITIAL_ROADS)
      const roads = zoneId ? stored.filter((r) => r.zoneId === zoneId) : stored
      setTimeout(() => resolve(roads), 30)
    })
  }

  async createRoad(road: Omit<Road, 'id'>, user = 'Super Admin'): Promise<Road> {
    return new Promise((resolve) => {
      const stored = this.load<Road[]>(STORAGE_KEYS.ROADS, INITIAL_ROADS)
      const newRoad: Road = {
        ...road,
        id: `road-${Date.now()}`,
      }
      stored.push(newRoad)
      this.save(STORAGE_KEYS.ROADS, stored)
      this.logAudit({
        entityType: 'Property',
        entityId: newRoad.id,
        action: 'CREATE_ROAD',
        performedBy: user,
        details: `Created new road: ${newRoad.name} (${newRoad.code}) in zone ${newRoad.zoneId}`,
      })
      setTimeout(() => resolve(newRoad), 50)
    })
  }

  // ── Properties ──────────────────────────────────────────────────────────
  async getProperties(filters?: Partial<VaripanamFilterState>): Promise<Property[]> {
    return new Promise((resolve) => {
      let list = this.load<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES)

      if (filters) {
        if (filters.zoneId) {
          list = list.filter((p) => p.zoneId === filters.zoneId)
        }
        if (filters.wardId) {
          list = list.filter((p) => p.wardId === filters.wardId)
        }
        if (filters.roadId) {
          list = list.filter((p) => p.roadId === filters.roadId)
        }
        if (filters.status && filters.status !== 'All') {
          list = list.filter((p) => p.status === filters.status)
        }
        if (filters.searchQuery && filters.searchQuery.trim()) {
          const q = filters.searchQuery.trim().toLowerCase()
          list = list.filter(
            (p) =>
              p.assessmentNumber.toLowerCase().includes(q) ||
              p.propertyNumber.toLowerCase().includes(q) ||
              p.currentOwner.name.toLowerCase().includes(q) ||
              p.currentOwner.nic.toLowerCase().includes(q) ||
              p.currentOwner.mobile.toLowerCase().includes(q)
          )
        }
      }

      setTimeout(() => resolve(list), 50)
    })
  }

  async getPropertyById(id: string): Promise<Property | null> {
    return new Promise((resolve) => {
      const list = this.load<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES)
      const found = list.find((p) => p.id === id || p.assessmentNumber.toLowerCase() === id.toLowerCase()) || null
      setTimeout(() => resolve(found), 30)
    })
  }

  async addProperty(
    propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'dues' | 'status'>,
    user = 'Super Admin'
  ): Promise<{ property: Property; warnings: string[] }> {
    return new Promise((resolve, reject) => {
      const list = this.load<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES)

      // Validation 1: Assessment number uniqueness
      const duplicate = list.find(
        (p) => p.assessmentNumber.trim().toLowerCase() === propertyData.assessmentNumber.trim().toLowerCase()
      )
      if (duplicate) {
        return reject(
          new Error(`Assessment number "${propertyData.assessmentNumber}" is already in use by Property ${duplicate.id}.`)
        )
      }

      // Proximity check ~10 meters (approx 0.0001 deg in lat/long)
      const warnings: string[] = []
      const nearby = list.filter((p) => {
        const dLat = Math.abs(p.latitude - propertyData.latitude)
        const dLng = Math.abs(p.longitude - propertyData.longitude)
        return dLat < 0.00015 && dLng < 0.00015
      })
      if (nearby.length > 0) {
        warnings.push(`Another property (${nearby[0].assessmentNumber}) is located within ~15 metres of this coordinate.`)
      }

      const newId = `prop-${Date.now()}`
      const now = new Date().toISOString()
      const newProperty: Property = {
        ...propertyData,
        id: newId,
        status: 'Due soon',
        dues: [
          {
            id: `due-${newId}-2026q1`,
            propertyId: newId,
            year: 2026,
            quarter: 1,
            amount: Math.round((propertyData.annualAssessedValue * 0.1) / 4),
            paidAmount: 0,
            status: 'Due',
            dueDate: '2026-03-31',
          },
        ],
        createdAt: now,
        updatedAt: now,
      }

      list.unshift(newProperty)
      this.save(STORAGE_KEYS.PROPERTIES, list)

      this.logAudit({
        entityType: 'Property',
        entityId: newId,
        action: 'ADD_PROPERTY_BY_MAP',
        performedBy: user,
        details: `Created new property assessment unit ${newProperty.assessmentNumber} at coordinates (${newProperty.latitude.toFixed(5)}, ${newProperty.longitude.toFixed(5)})`,
      })

      setTimeout(() => resolve({ property: newProperty, warnings }), 50)
    })
  }

  async updatePropertyLocation(
    propertyId: string,
    newCoords: { latitude: number; longitude: number },
    reason: string,
    user = 'Super Admin'
  ): Promise<{ property: Property; locationHistory: LocationHistory }> {
    return new Promise((resolve, reject) => {
      const list = this.load<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES)
      const index = list.findIndex((p) => p.id === propertyId)
      if (index === -1) return reject(new Error('Property not found'))

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

      // Append to persistent location history
      const histories = this.load<LocationHistory[]>(STORAGE_KEYS.LOCATION_HISTORIES, INITIAL_LOCATION_HISTORIES)
      histories.unshift(historyEntry)
      this.save(STORAGE_KEYS.LOCATION_HISTORIES, histories)

      // Update property coordinates
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
        details: `Coordinates changed from (${oldProp.latitude}, ${oldProp.longitude}) to (${newCoords.latitude}, ${newCoords.longitude}). Reason: ${reason}`,
      })

      setTimeout(() => resolve({ property: updatedProp, locationHistory: historyEntry }), 50)
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

  // ── Payments & Receipts ──────────────────────────────────────────────────
  async getPayments(propertyId?: string): Promise<Payment[]> {
    return new Promise((resolve) => {
      const list = this.load<Payment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS)
      const filtered = propertyId ? list.filter((p) => p.propertyId === propertyId) : list
      setTimeout(() => resolve(filtered), 30)
    })
  }

  async recordPayment(payment: Omit<Payment, 'id'>, user = 'Super Admin'): Promise<Payment> {
    return new Promise((resolve) => {
      const list = this.load<Payment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS)
      const newPayment: Payment = {
        ...payment,
        id: `pay-${Date.now()}`,
      }
      list.unshift(newPayment)
      this.save(STORAGE_KEYS.PAYMENTS, list)
      this.logAudit({
        entityType: 'Payment',
        entityId: newPayment.id,
        action: 'RECORD_PAYMENT',
        performedBy: user,
        details: `Recorded payment ${newPayment.receiptNumber} of LKR ${newPayment.amount} for property ${newPayment.propertyId}`,
      })
      setTimeout(() => resolve(newPayment), 40)
    })
  }

  // ── Field Collections & Reconciliation ──────────────────────────────────
  async getFieldCollections(): Promise<FieldCollection[]> {
    return new Promise((resolve) => {
      const list = this.load<FieldCollection[]>(STORAGE_KEYS.COLLECTIONS, INITIAL_FIELD_COLLECTIONS)
      setTimeout(() => resolve(list), 30)
    })
  }

  // ── ATD Applications ────────────────────────────────────────────────────
  async getAtdApplications(): Promise<AtdApplication[]> {
    return new Promise((resolve) => {
      const list = this.load<AtdApplication[]>(STORAGE_KEYS.ATD, INITIAL_ATD_APPLICATIONS)
      setTimeout(() => resolve(list), 30)
    })
  }

  // ── Reset Mock Data ─────────────────────────────────────────────────────
  resetMockData(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
  }
}

export const varipanamService = new VaripanamService()
export default varipanamService
