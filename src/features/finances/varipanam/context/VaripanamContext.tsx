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
} from '../types/varipanam'
import { varipanamService } from '../services/varipanamService'
import { DEFAULT_VARIPANAM_SETTINGS } from '../mock/varipanamMockData'

interface VaripanamContextType {
  properties: Property[]
  filteredProperties: Property[]
  zones: Zone[]
  wards: Ward[]
  roads: Road[]
  settings: VaripanamSettings
  fieldCollections: FieldCollection[]
  isLoading: boolean
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
  refreshData: () => Promise<void>
}

const VaripanamContext = createContext<VaripanamContextType | undefined>(undefined)

export const VaripanamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [properties, setProperties] = useState<Property[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [roads, setRoads] = useState<Road[]>([])
  const [settings, setSettings] = useState<VaripanamSettings>(DEFAULT_VARIPANAM_SETTINGS)
  const [fieldCollections, setFieldCollections] = useState<FieldCollection[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

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
      const [propsData, zonesData, wardsData, roadsData, settingsData, collectionsData] = await Promise.all([
        varipanamService.getProperties(),
        varipanamService.getZones(),
        varipanamService.getWards(),
        varipanamService.getRoads(),
        varipanamService.getSettings(),
        varipanamService.getFieldCollections(),
      ])

      setProperties(propsData)
      setZones(zonesData)
      setWards(wardsData)
      setRoads(roadsData)
      setSettings(settingsData)
      setFieldCollections(collectionsData)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

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

  // Add Property
  const addProperty = async (
    propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'dues' | 'status'>
  ) => {
    const res = await varipanamService.addProperty(propertyData)
    setProperties((prev) => [res.property, ...prev])
    setSelectedProperty(res.property)
    setIsPickMode(false)
    setPickedCoords(null)
  }

  // Update Location
  const updatePropertyLocation = async (
    propertyId: string,
    coords: { latitude: number; longitude: number },
    reason: string
  ) => {
    const res = await varipanamService.updatePropertyLocation(propertyId, coords, reason)
    setProperties((prev) => prev.map((p) => (p.id === propertyId ? res.property : p)))
    if (selectedProperty?.id === propertyId) {
      setSelectedProperty(res.property)
    }
    return res
  }

  // Create Road
  const createRoad = async (roadData: Omit<Road, 'id'>) => {
    const newRoad = await varipanamService.createRoad(roadData)
    setRoads((prev) => [...prev, newRoad])
    return newRoad
  }

  // Update Settings
  const updateSettings = async (newSettings: Partial<VaripanamSettings>) => {
    const updated = await varipanamService.updateSettings(newSettings)
    setSettings(updated)
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
        isLoading,
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
        refreshData: loadData,
      }}
    >
      {children}
    </VaripanamContext.Provider>
  )
}

export const useVaripanam = () => {
  const context = useContext(VaripanamContext)
  if (!context) {
    throw new Error('useVaripanam must be used within a VaripanamProvider')
  }
  return context
}
