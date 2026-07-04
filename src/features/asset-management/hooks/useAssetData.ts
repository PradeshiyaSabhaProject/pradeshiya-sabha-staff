import { useState, useEffect, useMemo } from 'react'

export interface AssetAttachment {
  name: string
  size: string
  type: string
  status?: string
}

export interface AssetRecord {
  id: string
  category: 'Land' | 'Road' | 'Building' | 'Vehicle' | 'Machinery & Equipment' | 'Utility / Infrastructure'
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
}


export interface AssetStats {
  municipalLands: { value: number; label: string; change: string }
  roadInfrastructure: { value: number; label: string; change: string }
  buildingUnits: { value: number; label: string; change: string }
  materialAssets: { value: number; label: string; change: string }
}

const INITIAL_ASSETS: AssetRecord[] = [
  {
    id: 'ASSET-UT-1046',
    category: 'Utility / Infrastructure',
    name: 'Peliyagoda Water Pumping Station',
    location: 'Peliyagoda / Kelani River',
    dateAdded: 'Nov 01, 2023',
    status: 'Operational',
    value: 2,
    unit: 'Plants',
    coordinates: { lat: '6.9520', lng: '79.8880' }
  },
  {
    id: 'ASSET-BL-1184',
    category: 'Building',
    name: 'Diyatha Uyana Civic Center',
    location: 'Sri Jayawardenepura Kotte',
    dateAdded: 'Oct 28, 2023',
    status: 'Operational',
    value: 1,
    unit: 'Units',
    coordinates: { lat: '6.9010', lng: '79.9180' }
  },
  {
    id: 'ASSET-LN-0923',
    category: 'Land',
    name: 'Mount Lavinia Coastal Reserve',
    location: 'Mount Lavinia',
    dateAdded: 'Oct 26, 2023',
    status: 'Verified',
    value: 3,
    unit: 'Plots',
    coordinates: { lat: '6.8330', lng: '79.8640' }
  },
  {
    id: 'ASSET-RD-0042',
    category: 'Road',
    name: 'Surface Roadway',
    location: 'Ward 04, Central North',
    dateAdded: 'Oct 24, 2023',
    status: 'Verified',
    value: 4.5,
    unit: 'KM',
    coordinates: { lat: '6.8850', lng: '79.9150' }
  },
  {
    id: 'ASSET-BL-1182',
    category: 'Building',
    name: 'Community Hall',
    location: 'Ward 12, Piliyandala',
    dateAdded: 'Oct 23, 2023',
    status: 'Digitized',
    value: 1,
    unit: 'Units',
    coordinates: { lat: '6.8018', lng: '79.9227' }
  },
  {
    id: 'ASSET-LN-0921',
    category: 'Land',
    name: 'Public Reservation',
    location: 'Ward 01, Town Center',
    dateAdded: 'Oct 22, 2023',
    status: 'Verified',
    value: 2,
    unit: 'Plots',
    coordinates: { lat: '6.8450', lng: '80.0010' }
  },
  {
    id: 'ASSET-RD-0043',
    category: 'Road',
    name: 'Drainage Channel',
    location: 'Ward 04, Central North',
    dateAdded: 'Oct 21, 2023',
    status: 'Audit Pending',
    value: 12,
    unit: 'KM',
    coordinates: { lat: '6.8750', lng: '79.9350' }
  },
  {
    id: 'ASSET-VH-0512',
    category: 'Vehicle',
    name: 'Garbage Compactor',
    location: 'Ward 02, Homagama',
    dateAdded: 'Oct 20, 2023',
    status: 'Operational',
    value: 1,
    unit: 'Items',
    coordinates: { lat: '6.8441', lng: '80.0024' }
  },
  {
    id: 'ASSET-EQ-0881',
    category: 'Machinery & Equipment',
    name: 'Water Pump',
    location: 'Ward 07, Pitipana',
    dateAdded: 'Oct 18, 2023',
    status: 'Under Maintenance',
    value: 3,
    unit: 'Items',
    coordinates: { lat: '6.8320', lng: '80.0150' }
  },
  {
    id: 'ASSET-UT-1044',
    category: 'Utility / Infrastructure',
    name: 'Solar Power Grid',
    location: 'Ward 09, Mattegoda',
    dateAdded: 'Oct 15, 2023',
    status: 'Operational',
    value: 1,
    unit: 'Items',
    coordinates: { lat: '6.8250', lng: '79.9550' }
  },
  {
    id: 'ASSET-LN-0922',
    category: 'Land',
    name: "Children's Park",
    location: 'Ward 05, Godagama',
    dateAdded: 'Oct 12, 2023',
    status: 'Disputed',
    value: 1,
    unit: 'Plots',
    coordinates: { lat: '6.8525', lng: '80.0233' }
  },
  {
    id: 'ASSET-BL-1183',
    category: 'Building',
    name: 'Pradeshiya Sabha Office',
    location: 'Ward 03, Homagama',
    dateAdded: 'Oct 10, 2023',
    status: 'Operational',
    value: 1,
    unit: 'Units',
    coordinates: { lat: '6.8430', lng: '79.9980' }
  },
  {
    id: 'ASSET-VH-0513',
    category: 'Vehicle',
    name: 'Ambulance',
    location: 'Ward 02, Homagama',
    dateAdded: 'Oct 08, 2023',
    status: 'Operational',
    value: 1,
    unit: 'Items',
    coordinates: { lat: '6.8445', lng: '80.0030' }
  },
  {
    id: 'ASSET-EQ-0882',
    category: 'Machinery & Equipment',
    name: 'Excavator',
    location: 'Ward 11, Pannipitiya',
    dateAdded: 'Oct 05, 2023',
    status: 'Under Maintenance',
    value: 1,
    unit: 'Items',
    coordinates: { lat: '6.8480', lng: '79.9463' }
  },
  {
    id: 'ASSET-UT-1045',
    category: 'Utility / Infrastructure',
    name: 'Water Purification Plant',
    location: 'Ward 08, Meegoda',
    dateAdded: 'Oct 01, 2023',
    status: 'Operational',
    value: 1,
    unit: 'Items',
    coordinates: { lat: '6.8550', lng: '80.0650' }
  },
]

export function useAssetData() {
  const [loading, setLoading] = useState(true)
  const [assets, setAssets] = useState<AssetRecord[]>(() => {
    const saved = localStorage.getItem('pradeshiya_assets')
    return saved ? JSON.parse(saved) : INITIAL_ASSETS
  })

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 5

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(timer)
  }, [])

  // Persist assets to localStorage when modified
  const saveAssets = (updatedAssets: AssetRecord[]) => {
    setAssets(updatedAssets)
    localStorage.setItem('pradeshiya_assets', JSON.stringify(updatedAssets))
  }

  // Reset page on filter change
  useEffect(() => {
    setTimeout(() => {
      setCurrentPage(1)
    }, 0)
  }, [categoryFilter, statusFilter, searchQuery])

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesCategory = !categoryFilter || asset.category === categoryFilter
      const matchesStatus = !statusFilter || asset.status.toLowerCase() === statusFilter.toLowerCase()

      const query = searchQuery.trim().toLowerCase()
      const matchesSearch = !query ||
        asset.id.toLowerCase().includes(query) ||
        asset.name.toLowerCase().includes(query) ||
        asset.location.toLowerCase().includes(query) ||
        asset.category.toLowerCase().includes(query)

      return matchesCategory && matchesStatus && matchesSearch
    })
  }, [assets, categoryFilter, statusFilter, searchQuery])

  // Total pages
  const totalItems = filteredAssets.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1

  // Paginated Assets
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredAssets.slice(startIndex, startIndex + pageSize)
  }, [filteredAssets, currentPage, pageSize])

  // Dynamic KPI Stats calculations based on a high baseline to match mockup visual styles
  const stats = useMemo<AssetStats>(() => {
    // Baseline counts from mockup:
    // Municipal Lands: 842 Plots, Road Infrastructure: 450 KM, Building Units: 1200 Units, Material Assets: 24.5k
    let landVal = 840
    let roadVal = 433.5
    let buildingVal = 1198
    let materialVal = 24490

    // Accumulate custom added quantities
    assets.forEach((asset) => {
      // Find items not in INITIAL_ASSETS to prevent double counting
      const isInitial = INITIAL_ASSETS.some((init) => init.id === asset.id)
      if (!isInitial) {
        if (asset.category === 'Land') {
          landVal += asset.value || 1
        } else if (asset.category === 'Road') {
          roadVal += asset.value || 0
        } else if (asset.category === 'Building') {
          buildingVal += asset.value || 1
        } else {
          // Vehicles, Machinery, Utilities fall under Material Assets
          materialVal += asset.value || 1
        }
      }
    })

    return {
      municipalLands: {
        value: landVal,
        label: 'Municipal Lands',
        change: '+2.4%',
      },
      roadInfrastructure: {
        value: Number(roadVal.toFixed(1)),
        label: 'Road Infrastructure',
        change: 'Updated Today',
      },
      buildingUnits: {
        value: buildingVal,
        label: 'Building Units',
        change: '12 Pending',
      },
      materialAssets: {
        value: materialVal,
        label: 'Material Assets',
        change: 'Stocked',
      },
    }
  }, [assets])

  const addAsset = (newAssetData: Omit<AssetRecord, 'id' | 'dateAdded'>) => {
    // Generate code suffix based on category
    let prefix = 'ASSET-LN' // Default Land
    if (newAssetData.category === 'Road') prefix = 'ASSET-RD'
    else if (newAssetData.category === 'Building') prefix = 'ASSET-BL'
    else if (newAssetData.category === 'Vehicle') prefix = 'ASSET-VH'
    else if (newAssetData.category === 'Machinery & Equipment') prefix = 'ASSET-EQ'
    else if (newAssetData.category === 'Utility / Infrastructure') prefix = 'ASSET-UT'

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
