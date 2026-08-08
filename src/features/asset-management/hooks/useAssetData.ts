import { useState, useEffect, useMemo } from 'react'

export interface AssetAttachment {
  name: string
  size: string
  type: string
  status?: string
}

export interface AssetRecord {
  id: string
  category: 'Land' | 'Road' | 'Building' | 'Vehicle' | 'Machinery & Equipment' | 'Utility / Infrastructure' | 'Streetlamp' | 'Grounds'
  name: string
  location: string
  dateAdded: string
  status: 'Operational' | 'Under Maintenance' | 'Disputed' | 'Verified' | 'Digitized' | 'Audit Pending'
  value: number
  unit: string
  valuation?: number
  acquisitionDate?: string
  fundingSource?: string
  areaSize?: string
  conditionStatus?: string
  coordinates?: { lat: string; lng: string }
  attachments?: AssetAttachment[]
  depreciation?: string
  // Specialized asset attributes
  wattage?: string // For Streetlamps (e.g. "120W Solar LED")
  poleId?: string // For Streetlamps (e.g. "SL-HML-042")
  acreage?: string // For Lands & Grounds (e.g. "4.2 Acres")
  roadKm?: number // For Roads (e.g. 5.8 km)
}

export interface AssetStats {
  municipalLands: { value: number; label: string; change: string }
  roadInfrastructure: { value: number; label: string; change: string }
  buildingUnits: { value: number; label: string; change: string }
  materialAssets: { value: number; label: string; change: string }
  streetlampsCount?: { value: number; label: string; change: string }
  groundsAcreage?: { value: number; label: string; change: string }
}

const INITIAL_ASSETS: AssetRecord[] = [
  // ── STREETLAMPS ──
  {
    id: 'ASSET-SL-4021',
    category: 'Streetlamp',
    name: 'Smart Solar LED Streetlamp Pole #SL-HML-042',
    location: 'High Level Road, Homagama Town Center',
    dateAdded: 'Nov 04, 2026',
    status: 'Operational',
    value: 1,
    unit: 'Pole',
    wattage: '120W Solar LED',
    poleId: 'SL-HML-042',
    conditionStatus: 'Good - Battery 98%',
    coordinates: { lat: '6.8415', lng: '79.9982' }
  },
  {
    id: 'ASSET-SL-4022',
    category: 'Streetlamp',
    name: 'Dual Arm Highway Streetlamp Pole #SL-HML-043',
    location: 'High Level Road Junction',
    dateAdded: 'Nov 04, 2026',
    status: 'Operational',
    value: 1,
    unit: 'Pole',
    wattage: '150W LED Grid',
    poleId: 'SL-HML-043',
    conditionStatus: 'Operational',
    coordinates: { lat: '6.8428', lng: '79.9995' }
  },
  {
    id: 'ASSET-SL-4023',
    category: 'Streetlamp',
    name: 'Station Road LED Lamp Pole #SL-STR-012',
    location: 'Station Road, Homagama Railway Station',
    dateAdded: 'Oct 30, 2026',
    status: 'Under Maintenance',
    value: 1,
    unit: 'Pole',
    wattage: '90W LED',
    poleId: 'SL-STR-012',
    conditionStatus: 'Bulb Replacement Scheduled',
    coordinates: { lat: '6.8450', lng: '80.0015' }
  },

  // ── GROUNDS & PARKS ──
  {
    id: 'ASSET-GR-0901',
    category: 'Grounds',
    name: 'Homagama Municipal Central Sports Ground',
    location: 'Ward 01, Court Complex Road',
    dateAdded: 'Nov 02, 2026',
    status: 'Operational',
    value: 12.5,
    unit: 'Acres',
    acreage: '12.5 Acres',
    valuation: 145000000,
    coordinates: { lat: '6.8432', lng: '79.9968' }
  },
  {
    id: 'ASSET-GR-0902',
    category: 'Grounds',
    name: 'Meegoda Community Play Park & Recreation Area',
    location: 'Ward 06, Meegoda Junction',
    dateAdded: 'Oct 28, 2026',
    status: 'Verified',
    value: 4.8,
    unit: 'Acres',
    acreage: '4.8 Acres',
    valuation: 65000000,
    coordinates: { lat: '6.8550', lng: '80.0420' }
  },

  // ── LANDS ──
  {
    id: 'ASSET-LN-0921',
    category: 'Land',
    name: 'Public Reservation & Forest Reserve Plot A',
    location: 'Ward 01, Town Center',
    dateAdded: 'Oct 22, 2026',
    status: 'Verified',
    value: 8.5,
    unit: 'Perches',
    acreage: '2.5 Acres',
    valuation: 85000000,
    coordinates: { lat: '6.8450', lng: '80.0010' }
  },
  {
    id: 'ASSET-LN-0923',
    category: 'Land',
    name: 'Pitipana Tech City Municipal Reserve Plot',
    location: 'Pitipana South',
    dateAdded: 'Oct 26, 2026',
    status: 'Verified',
    value: 6.2,
    unit: 'Acres',
    acreage: '6.2 Acres',
    valuation: 180000000,
    coordinates: { lat: '6.8330', lng: '80.0150' }
  },

  // ── ROADS & DRAINAGE ──
  {
    id: 'ASSET-RD-0042',
    category: 'Road',
    name: 'Homagama Town Bypass Asphalt Corridor',
    location: 'Ward 04, Central North',
    dateAdded: 'Oct 24, 2026',
    status: 'Verified',
    value: 4.5,
    unit: 'KM',
    roadKm: 4.5,
    coordinates: { lat: '6.8850', lng: '79.9150' }
  },
  {
    id: 'ASSET-RD-0043',
    category: 'Road',
    name: 'Main Station Canal Concrete Drainage Channel',
    location: 'Ward 04, Central North',
    dateAdded: 'Oct 21, 2026',
    status: 'Audit Pending',
    value: 12,
    unit: 'KM',
    roadKm: 12.0,
    coordinates: { lat: '6.8750', lng: '79.9350' }
  },

  // ── CIVIC BUILDINGS ──
  {
    id: 'ASSET-BL-1184',
    category: 'Building',
    name: 'Pradeshiya Sabha Main Administrative Secretariat',
    location: 'High Level Road, Homagama Town Center',
    dateAdded: 'Oct 28, 2026',
    status: 'Operational',
    value: 1,
    unit: 'Units',
    valuation: 320000000,
    coordinates: { lat: '6.8410', lng: '79.9975' }
  },
  {
    id: 'ASSET-BL-1182',
    category: 'Building',
    name: 'Piliyandala Ward Sub-Office & Community Center',
    location: 'Ward 12, Piliyandala',
    dateAdded: 'Oct 23, 2026',
    status: 'Digitized',
    value: 1,
    unit: 'Units',
    coordinates: { lat: '6.8018', lng: '79.9227' }
  },

  // ── UTILITIES ──
  {
    id: 'ASSET-UT-1046',
    category: 'Utility / Infrastructure',
    name: 'Peliyagoda Water Pumping Station',
    location: 'Peliyagoda / Kelani River',
    dateAdded: 'Nov 01, 2026',
    status: 'Operational',
    value: 2,
    unit: 'Plants',
    coordinates: { lat: '6.9520', lng: '79.8880' }
  },
  {
    id: 'ASSET-UT-1044',
    category: 'Utility / Infrastructure',
    name: 'Solar Roof Power Grid Depot',
    location: 'Ward 09, Mattegoda',
    dateAdded: 'Oct 15, 2026',
    status: 'Operational',
    value: 1,
    unit: 'Items',
    coordinates: { lat: '6.8250', lng: '79.9550' }
  }
]

export function useAssetData() {
  const [assets, setAssets] = useState<AssetRecord[]>(() => {
    const saved = localStorage.getItem('pradeshiya_sabha_assets')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse assets from localStorage', e)
      }
    }
    return INITIAL_ASSETS
  })

  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const saveAssets = (newAssets: AssetRecord[]) => {
    setAssets(newAssets)
    localStorage.setItem('pradeshiya_sabha_assets', JSON.stringify(newAssets))
  }

  // Filtering
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (categoryFilter !== 'All' && asset.category !== categoryFilter) return false
      if (statusFilter !== 'All' && asset.status !== statusFilter) return false
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchesName = asset.name.toLowerCase().includes(query)
        const matchesId = asset.id.toLowerCase().includes(query)
        const matchesLoc = asset.location.toLowerCase().includes(query)
        const matchesPole = asset.poleId ? asset.poleId.toLowerCase().includes(query) : false
        if (!matchesName && !matchesId && !matchesLoc && !matchesPole) return false
      }
      return true
    })
  }, [assets, categoryFilter, statusFilter, searchQuery])

  // Pagination
  const totalItems = filteredAssets.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1

  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAssets.slice(start, start + pageSize)
  }, [filteredAssets, currentPage, pageSize])

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [categoryFilter, statusFilter, searchQuery])

  // Stats calculation
  const stats: AssetStats = useMemo(() => {
    let landVal = 0
    let roadVal = 0
    let buildingVal = 0
    let materialVal = 0
    let lampsCount = 0
    let groundsAcres = 0

    assets.forEach((a) => {
      if (a.category === 'Land') landVal += a.value
      else if (a.category === 'Road') roadVal += a.value
      else if (a.category === 'Building') buildingVal += a.value
      else if (a.category === 'Streetlamp') lampsCount += a.value
      else if (a.category === 'Grounds') groundsAcres += a.value
      else materialVal += a.value
    })

    return {
      municipalLands: {
        value: Number(landVal.toFixed(1)),
        label: 'Municipal Lands',
        change: '+2.4% vs last year',
      },
      roadInfrastructure: {
        value: Number(roadVal.toFixed(1)),
        label: 'Road Infrastructure',
        change: 'Updated Today',
      },
      buildingUnits: {
        value: buildingVal,
        label: 'Building Units',
        change: 'Operational',
      },
      materialAssets: {
        value: materialVal,
        label: 'Material Assets',
        change: 'Stocked',
      },
      streetlampsCount: {
        value: lampsCount,
        label: 'Smart Streetlamps',
        change: 'Grid Operational',
      },
      groundsAcreage: {
        value: Number(groundsAcres.toFixed(1)),
        label: 'Public Grounds (Acres)',
        change: 'Maintained',
      }
    }
  }, [assets])

  const addAsset = (newAssetData: Omit<AssetRecord, 'id' | 'dateAdded'>) => {
    let prefix = 'ASSET-LN'
    if (newAssetData.category === 'Road') prefix = 'ASSET-RD'
    else if (newAssetData.category === 'Building') prefix = 'ASSET-BL'
    else if (newAssetData.category === 'Vehicle') prefix = 'ASSET-VH'
    else if (newAssetData.category === 'Machinery & Equipment') prefix = 'ASSET-EQ'
    else if (newAssetData.category === 'Utility / Infrastructure') prefix = 'ASSET-UT'
    else if (newAssetData.category === 'Streetlamp') prefix = 'ASSET-SL'
    else if (newAssetData.category === 'Grounds') prefix = 'ASSET-GR'

    const randNum = Math.floor(1000 + Math.random() * 9000)
    const newId = `${prefix}-${randNum}`

    const formatDate = (date: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    }

    const newRecord: AssetRecord = {
      ...newAssetData,
      id: newId,
      dateAdded: formatDate(new Date()),
    }

    const updated = [newRecord, ...assets]
    saveAssets(updated)
    return newRecord
  }

  const updateAsset = (
    id: string,
    updatedData: Partial<Omit<AssetRecord, 'id' | 'dateAdded'>>
  ) => {
    const updated = assets.map((asset) =>
      asset.id === id ? { ...asset, ...updatedData } : asset
    )
    saveAssets(updated)
    return updated.find((a) => a.id === id) as AssetRecord
  }

  return {
    loading,
    assets: paginatedAssets,
    allAssets: filteredAssets,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    setCurrentPage,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    addAsset,
    updateAsset,
    stats,
  }
}
