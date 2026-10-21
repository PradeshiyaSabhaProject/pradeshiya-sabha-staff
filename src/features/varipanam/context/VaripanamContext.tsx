import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type {
  Property,
  Zone,
  Ward,
  Road,
  VaripanamSettings,
  VaripanamFilterState,
  FieldCollection,
  LocationHistory,
  PropertySubmission,
  AtdApplication,
  OnlinePaymentAttempt,
  SubdivisionLink,
  Notice,
  Designation,
  AuditEntry,
  Payment,
  SubmissionDocument,
} from '../types/varipanam'
import { varipanamService } from '../services/varipanamService'
import {
  DEFAULT_VARIPANAM_SETTINGS,
  INITIAL_ZONES,
  INITIAL_WARDS,
  INITIAL_ROADS,
  INITIAL_PROPERTIES,
  INITIAL_FIELD_COLLECTIONS,
  INITIAL_PROPERTY_SUBMISSIONS,
  INITIAL_ATD_APPLICATIONS,
  INITIAL_ONLINE_PAYMENTS,
  INITIAL_SUBDIVISIONS,
  INITIAL_NOTICES,
} from '../mock/varipanamMockData'

interface VaripanamContextType {
  properties: Property[]
  filteredProperties: Property[]
  zones: Zone[]
  wards: Ward[]
  roads: Road[]
  settings: VaripanamSettings
  fieldCollections: FieldCollection[]
  propertySubmissions: PropertySubmission[]
  atdApplications: AtdApplication[]
  onlinePayments: OnlinePaymentAttempt[]
  subdivisions: SubdivisionLink[]
  notices: Notice[]
  isLoading: boolean
  actingDesignation: Designation
  setActingDesignation: (designation: Designation) => void
  pendingApprovalsCount: number
  pendingAtdCount: number
  filters: VaripanamFilterState
  setFilters: (filters: Partial<VaripanamFilterState>) => void
  resetFilters: () => void
  selectedProperty: Property | null
  setSelectedProperty: (prop: Property | null) => void
  isPickMode: boolean
  setIsPickMode: (active: boolean) => void
  pickedCoords: { latitude: number; longitude: number } | null
  setPickedCoords: (coords: { latitude: number; longitude: number } | null) => void
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
  mobileTab: 'map' | 'list'
  setMobileTab: (tab: 'map' | 'list') => void
  addProperty: (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'dues' | 'status'>) => Promise<void>
  updatePropertyLocation: (propertyId: string, coords: { latitude: number; longitude: number }, reason: string) => Promise<{ property: Property; locationHistory: LocationHistory }>
  createRoad: (roadData: Omit<Road, 'id'>) => Promise<Road>
  updateSettings: (newSettings: Partial<VaripanamSettings>) => Promise<void>
  submitNewProperty: (data: Omit<PropertySubmission, 'id' | 'daysWaiting' | 'reviewHistory'>) => Promise<PropertySubmission>
  approveSubmission: (submissionId: string, comment?: string) => Promise<Property>
  sendBackSubmission: (submissionId: string, message: string) => Promise<PropertySubmission>
  updateSubmissionDocuments: (submissionId: string, documents: SubmissionDocument[]) => void
  createAtdApplication: (data: Omit<AtdApplication, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => Promise<AtdApplication>
  updateAtdApplication: (id: string, updates: Partial<AtdApplication>) => Promise<AtdApplication>
  simulateOnlinePayment: (data: Omit<OnlinePaymentAttempt, 'id' | 'timestamp' | 'transactionRef'>) => Promise<OnlinePaymentAttempt>
  createSubdivision: (subdivision: Omit<SubdivisionLink, 'id' | 'createdDate'>) => Promise<SubdivisionLink>
  reconcileFieldCollection: (collectionId: string, cashierName: string) => Promise<void>
  recordPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment>
  logAudit: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => Promise<AuditEntry>
  refreshData: () => Promise<void>
}

const VaripanamContext = createContext<VaripanamContextType | undefined>(undefined)

export const VaripanamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES)
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES)
  const [wards, setWards] = useState<Ward[]>(INITIAL_WARDS)
  const [roads, setRoads] = useState<Road[]>(INITIAL_ROADS)
  const [settings, setSettings] = useState<VaripanamSettings>(DEFAULT_VARIPANAM_SETTINGS)
  const [fieldCollections, setFieldCollections] = useState<FieldCollection[]>(INITIAL_FIELD_COLLECTIONS)
  const [propertySubmissions, setPropertySubmissions] = useState<PropertySubmission[]>(INITIAL_PROPERTY_SUBMISSIONS)
  const [atdApplications, setAtdApplications] = useState<AtdApplication[]>(INITIAL_ATD_APPLICATIONS)
  const [onlinePayments, setOnlinePayments] = useState<OnlinePaymentAttempt[]>(INITIAL_ONLINE_PAYMENTS)
  const [subdivisions, setSubdivisions] = useState<SubdivisionLink[]>(INITIAL_SUBDIVISIONS)
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Acting designation chosen by Super Admin for workflows and audit logging
  const [actingDesignation, setActingDesignation] = useState<Designation>('Super Admin')

  // Selected property for Map <-> List synchronization
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  // Map Pick Mode & Add Property Drawer
  const [isPickMode, setIsPickMode] = useState<boolean>(false)
  const [pickedCoords, setPickedCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)

  // Mobile Tabs
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map')

  // Read filters from URL query parameters
  const filters: VaripanamFilterState = useMemo(() => {
    return {
      zoneId: searchParams.get('zoneId') || '',
      wardId: searchParams.get('wardId') || '',
      roadId: searchParams.get('roadId') || '',
      status: searchParams.get('status') || 'All',
      periodYear: parseInt(searchParams.get('year') || '2026', 10),
      periodQuarter: parseInt(searchParams.get('quarter') || '0', 10),
      searchQuery: searchParams.get('q') || '',
    }
  }, [searchParams])

  // Update filters in URL query parameters
  const setFilters = useCallback(
    (newFilters: Partial<VaripanamFilterState>) => {
      const merged = { ...filters, ...newFilters }
      const params = new URLSearchParams()

      if (merged.zoneId) params.set('zoneId', merged.zoneId)
      if (merged.wardId) params.set('wardId', merged.wardId)
      if (merged.roadId) params.set('roadId', merged.roadId)
      if (merged.status && merged.status !== 'All') params.set('status', merged.status)
      if (merged.periodYear && merged.periodYear !== 2026) params.set('year', merged.periodYear.toString())
      if (merged.periodQuarter && merged.periodQuarter > 0) params.set('quarter', merged.periodQuarter.toString())
      if (merged.searchQuery && merged.searchQuery.trim()) params.set('q', merged.searchQuery.trim())

      setSearchParams(params, { replace: true })
    },
    [filters, setSearchParams]
  )

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  // Load initial data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [
        propsData,
        zonesData,
        wardsData,
        roadsData,
        settingsData,
        collectionsData,
        submissionsData,
        atdData,
        onlineData,
        subdivData,
        noticesData,
      ] = await Promise.all([
        varipanamService.getProperties(),
        varipanamService.getZones(),
        varipanamService.getWards(),
        varipanamService.getRoads(),
        varipanamService.getSettings(),
        varipanamService.getFieldCollections(),
        varipanamService.getSubmissions(),
        varipanamService.getAtdApplications(),
        varipanamService.getOnlinePayments(),
        varipanamService.getSubdivisions(),
        varipanamService.getNotices(),
      ])

      setProperties(propsData)
      setZones(zonesData)
      setWards(wardsData)
      setRoads(roadsData)
      setSettings(settingsData)
      setFieldCollections(collectionsData)
      setPropertySubmissions(submissionsData)
      setAtdApplications(atdData)
      setOnlinePayments(onlineData)
      setSubdivisions(subdivData)
      setNotices(noticesData)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData()
  }, [loadData])

  // Pending counts for badges
  const pendingApprovalsCount = useMemo(() => {
    return propertySubmissions.filter((s) => s.status === 'PENDING_APPROVAL').length
  }, [propertySubmissions])

  const pendingAtdCount = useMemo(() => {
    return atdApplications.filter((a) => a.status === 'In Progress').length
  }, [atdApplications])

  // Filter properties client-side based on URL filters
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (filters.zoneId && p.zoneId !== filters.zoneId) return false
      if (filters.wardId && p.wardId !== filters.wardId) return false
      if (filters.roadId && p.roadId !== filters.roadId) return false
      if (filters.status && filters.status !== 'All' && p.status !== filters.status) return false

      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.trim().toLowerCase()
        const matches =
          p.assessmentNumber.toLowerCase().includes(q) ||
          p.propertyNumber.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.currentOwner.name.toLowerCase().includes(q) ||
          p.currentOwner.nic.toLowerCase().includes(q) ||
          p.currentOwner.mobile.toLowerCase().includes(q)
        if (!matches) return false
      }

      return true
    })
  }, [properties, filters])

  // Actions
  const addProperty = async (
    propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'dues' | 'status'>
  ) => {
    const res = await varipanamService.addProperty(propertyData, 'Super Admin', actingDesignation)
    setProperties((prev) => [res.property, ...prev])
    setSelectedProperty(res.property)
    setIsPickMode(false)
    setPickedCoords(null)
  }

  const updatePropertyLocation = async (
    propertyId: string,
    coords: { latitude: number; longitude: number },
    reason: string
  ) => {
    const res = await varipanamService.updatePropertyLocation(propertyId, coords, reason, 'Super Admin', actingDesignation)
    setProperties((prev) => prev.map((p) => (p.id === propertyId ? res.property : p)))
    if (selectedProperty?.id === propertyId) {
      setSelectedProperty(res.property)
    }
    return res
  }

  const createRoad = async (roadData: Omit<Road, 'id'>) => {
    const newRoad = await varipanamService.createRoad(roadData, 'Super Admin', actingDesignation)
    setRoads((prev) => [...prev, newRoad])
    return newRoad
  }

  const updateSettings = async (newSettings: Partial<VaripanamSettings>) => {
    const updated = await varipanamService.updateSettings(newSettings, 'Super Admin', actingDesignation)
    setSettings(updated)
  }

  const submitNewProperty = async (data: Omit<PropertySubmission, 'id' | 'daysWaiting' | 'reviewHistory'>) => {
    const sub = await varipanamService.submitNewProperty(data, 'Super Admin', actingDesignation)
    setPropertySubmissions((prev) => [sub, ...prev])
    return sub
  }

  const approveSubmission = async (submissionId: string, comment?: string) => {
    const approvedProperty = await varipanamService.approveSubmission(submissionId, comment, 'Super Admin', actingDesignation)
    setPropertySubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status: 'APPROVED', daysWaiting: 0 } : s))
    )
    setProperties((prev) => [approvedProperty, ...prev])
    return approvedProperty
  }

  const sendBackSubmission = async (submissionId: string, message: string) => {
    const updated = await varipanamService.sendBackSubmission(submissionId, message, 'Super Admin', actingDesignation)
    setPropertySubmissions((prev) => prev.map((s) => (s.id === submissionId ? updated : s)))
    return updated
  }

  const updateSubmissionDocuments = (submissionId: string, documents: SubmissionDocument[]) => {
    setPropertySubmissions((prev) => {
      const updated = prev.map((s) => (s.id === submissionId ? { ...s, documents } : s))
      try {
        localStorage.setItem('varipanam_submissions', JSON.stringify(updated))
      } catch {
        // ignore storage errors
      }
      return updated
    })
  }

  const createAtdApplication = async (data: Omit<AtdApplication, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    const newAtd = await varipanamService.createAtdApplication(data, 'Super Admin', actingDesignation)
    setAtdApplications((prev) => [newAtd, ...prev])
    return newAtd
  }

  const updateAtdApplication = async (id: string, updates: Partial<AtdApplication>) => {
    const updated = await varipanamService.updateAtdApplication(id, updates, 'Super Admin', actingDesignation)
    setAtdApplications((prev) => prev.map((a) => (a.id === id ? updated : a)))
    return updated
  }

  const simulateOnlinePayment = async (data: Omit<OnlinePaymentAttempt, 'id' | 'timestamp' | 'transactionRef'>) => {
    const res = await varipanamService.simulateOnlinePayment(data)
    setOnlinePayments((prev) => [res, ...prev])
    return res
  }

  const createSubdivision = async (subdivision: Omit<SubdivisionLink, 'id' | 'createdDate'>) => {
    const res = await varipanamService.createSubdivision(subdivision, 'Super Admin', actingDesignation)
    setSubdivisions((prev) => [res, ...prev])
    return res
  }

  const reconcileFieldCollection = async (collectionId: string, cashierName: string) => {
    await varipanamService.reconcileFieldCollection(collectionId, cashierName, actingDesignation)
    setFieldCollections((prev) =>
      prev.map((c) => (c.id === collectionId ? { ...c, status: 'Reconciled' } : c))
    )
  }

  const recordPayment = async (payment: Omit<Payment, 'id'>) => {
    return await varipanamService.recordPayment(payment, 'Super Admin', actingDesignation)
  }

  const logAudit = async (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
    return await varipanamService.logAudit({ ...entry, actingAs: entry.actingAs || actingDesignation })
  }

  return (
    <VaripanamContext.Provider
      value={{
        properties,
        filteredProperties,
        zones,
        wards,
        roads,
        settings,
        fieldCollections,
        propertySubmissions,
        atdApplications,
        onlinePayments,
        subdivisions,
        notices,
        isLoading,
        actingDesignation,
        setActingDesignation,
        pendingApprovalsCount,
        pendingAtdCount,
        filters,
        setFilters,
        resetFilters,
        selectedProperty,
        setSelectedProperty,
        isPickMode,
        setIsPickMode,
        pickedCoords,
        setPickedCoords,
        isDrawerOpen,
        setIsDrawerOpen,
        mobileTab,
        setMobileTab,
        addProperty,
        updatePropertyLocation,
        createRoad,
        updateSettings,
        submitNewProperty,
        approveSubmission,
        sendBackSubmission,
        updateSubmissionDocuments,
        createAtdApplication,
        updateAtdApplication,
        simulateOnlinePayment,
        createSubdivision,
        reconcileFieldCollection,
        recordPayment,
        logAudit,
        refreshData: loadData,
      }}
    >
      {children}
    </VaripanamContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useVaripanam = () => {
  const context = useContext(VaripanamContext)
  if (!context) {
    throw new Error('useVaripanam must be used within a VaripanamProvider')
  }
  return context
}
