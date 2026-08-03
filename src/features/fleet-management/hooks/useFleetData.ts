import { useState, useEffect, useMemo } from 'react'
import {
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_APPROVAL_REQUESTS,
  type VehicleRecord,
  type DriverRecord,
  type VehicleStatus,
  type MaintenanceLog,
  type FleetApprovalRequest,
  type FleetActionType,
} from '../data/initialFleetData'

const VEHICLES_STORAGE_KEY = 'ps_fleet_vehicles_v1'
const DRIVERS_STORAGE_KEY = 'ps_fleet_drivers_v1'
const APPROVALS_STORAGE_KEY = 'ps_fleet_approvals_v1'

export interface FleetComplianceInfo {
  isPermitOverdue: boolean
  isRevenueOverdue: boolean
  isInsuranceOverdue: boolean
  isPermitExpiringSoon: boolean // <= 14 days
  hasAnyAlert: boolean
  alertMessage: string | null
}

export function getVehicleComplianceInfo(vehicle: VehicleRecord): FleetComplianceInfo {
  const today = '2026-07-12' // reference portal date
  const permitOverdue = vehicle.permitExpiryDate < today
  const revenueOverdue = vehicle.revenueLicenseExpiryDate < today
  const insuranceOverdue = vehicle.insuranceExpiryDate < today

  // Check expiring within 14 days
  const parseDaysDiff = (dateStr: string) => {
    const d1 = new Date(today).getTime()
    const d2 = new Date(dateStr).getTime()
    return Math.floor((d2 - d1) / (1000 * 3600 * 24))
  }

  const permitDays = parseDaysDiff(vehicle.permitExpiryDate)
  const revenueDays = parseDaysDiff(vehicle.revenueLicenseExpiryDate)
  const insuranceDays = parseDaysDiff(vehicle.insuranceExpiryDate)

  const permitSoon = permitDays >= 0 && permitDays <= 14
  const revenueSoon = revenueDays >= 0 && revenueDays <= 14
  const insuranceSoon = insuranceDays >= 0 && insuranceDays <= 14

  const hasAlert =
    permitOverdue ||
    revenueOverdue ||
    insuranceOverdue ||
    permitSoon ||
    revenueSoon ||
    insuranceSoon ||
    vehicle.status === 'Permit Due'

  let alertMessage: string | null = null
  if (permitOverdue || revenueOverdue || insuranceOverdue) {
    const items: string[] = []
    if (permitOverdue) items.push('Route Permit Overdue')
    if (revenueOverdue) items.push('Revenue License Overdue')
    if (insuranceOverdue) items.push('Insurance Overdue')
    alertMessage = items.join(' • ')
  } else if (permitSoon || revenueSoon || insuranceSoon) {
    alertMessage = 'Permit / License renewal due shortly'
  }

  return {
    isPermitOverdue: permitOverdue,
    isRevenueOverdue: revenueOverdue,
    isInsuranceOverdue: insuranceOverdue,
    isPermitExpiringSoon: permitSoon || revenueSoon || insuranceSoon,
    hasAnyAlert: hasAlert,
    alertMessage,
  }
}

export function useFleetData() {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>(() => {
    const saved = localStorage.getItem(VEHICLES_STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // fallback
      }
    }
    return INITIAL_VEHICLES
  })

  const [drivers, setDrivers] = useState<DriverRecord[]>(() => {
    const saved = localStorage.getItem(DRIVERS_STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // fallback
      }
    }
    return INITIAL_DRIVERS
  })

  const [approvalRequests, setApprovalRequests] = useState<FleetApprovalRequest[]>(() => {
    const saved = localStorage.getItem(APPROVALS_STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // fallback
      }
    }
    return INITIAL_APPROVAL_REQUESTS
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [showOnlyPermitAlerts, setShowOnlyPermitAlerts] = useState(false)

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles))
  }, [vehicles])

  useEffect(() => {
    localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(drivers))
  }, [drivers])

  useEffect(() => {
    localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(approvalRequests))
  }, [approvalRequests])

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchSearch =
        v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.currentLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.assignedDriverName?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchCategory = categoryFilter === 'All' || v.category === categoryFilter
      const matchStatus = statusFilter === 'All' || v.status === statusFilter

      const compliance = getVehicleComplianceInfo(v)
      const matchPermitAlert = !showOnlyPermitAlerts || compliance.hasAnyAlert

      return matchSearch && matchCategory && matchStatus && matchPermitAlert
    })
  }, [vehicles, searchQuery, categoryFilter, statusFilter, showOnlyPermitAlerts])

  // KPI calculations
  const stats = useMemo(() => {
    const total = vehicles.length
    const available = vehicles.filter((v) => v.status === 'Available').length
    const onMission = vehicles.filter((v) => v.status === 'On Mission').length
    const inMaintenance = vehicles.filter((v) => v.status === 'In Maintenance').length
    const permitAlerts = vehicles.filter((v) => getVehicleComplianceInfo(v).hasAnyAlert).length

    return {
      total,
      available,
      onMission,
      inMaintenance,
      permitAlerts,
    }
  }, [vehicles])

  // Actions
  const addVehicle = (
    newV: Omit<
      VehicleRecord,
      'id' | 'maintenanceHistory' | 'assignedDriverName' | 'assignedDriverId'
    > & {
      assignedDriverId?: string | null
    }
  ) => {
    const driver = newV.assignedDriverId
      ? drivers.find((d) => d.id === newV.assignedDriverId)
      : null

    const vehicleId = `VEH-${Date.now().toString().slice(-4)}`
    const record: VehicleRecord = {
      ...newV,
      id: vehicleId,
      assignedDriverId: driver ? driver.id : null,
      assignedDriverName: driver ? driver.name : null,
      maintenanceHistory: [],
    }

    setVehicles((prev) => [record, ...prev])

    // Update driver assigned vehicle
    if (driver) {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === driver.id
            ? { ...d, assignedVehicleId: vehicleId, assignedVehicleReg: record.registrationNumber }
            : d
        )
      )
    }
  }

  const putInMaintenance = (
    vehicleId: string,
    maintenanceData: {
      workshopName: string
      maintenanceType: string
      startDate: string
      estimatedCompletionDate: string
      notes: string
      estimatedCostLKR: number
    }
  ) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== vehicleId) return v

        const newLog: MaintenanceLog = {
          id: `MAINT-${Date.now()}`,
          vehicleId: v.id,
          workshopName: maintenanceData.workshopName,
          maintenanceType: maintenanceData.maintenanceType,
          startDate: maintenanceData.startDate,
          estimatedCompletionDate: maintenanceData.estimatedCompletionDate,
          costLKR: maintenanceData.estimatedCostLKR,
          notes: maintenanceData.notes,
          status: 'In Progress',
        }

        return {
          ...v,
          status: 'In Maintenance',
          currentLocation: `${maintenanceData.workshopName} (Under Maintenance)`,
          activeMaintenance: maintenanceData,
          activeMission: undefined,
          maintenanceHistory: [newLog, ...v.maintenanceHistory],
        }
      })
    )
  }

  const completeMaintenance = (vehicleId: string, actualCost?: number, notes?: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== vehicleId) return v

        const updatedHistory = v.maintenanceHistory.map((log, idx) => {
          if (idx === 0 && log.status === 'In Progress') {
            return {
              ...log,
              status: 'Completed' as const,
              completedDate: new Date().toISOString().split('T')[0],
              costLKR: actualCost ?? log.costLKR,
              notes: notes ? `${log.notes} | ${notes}` : log.notes,
            }
          }
          return log
        })

        const compliance = getVehicleComplianceInfo(v)

        return {
          ...v,
          status: compliance.hasAnyAlert ? 'Permit Due' : 'Available',
          currentLocation: 'Municipal Depot - Service Return Bay',
          activeMaintenance: undefined,
          maintenanceHistory: updatedHistory,
        }
      })
    )
  }

  const dispatchVehicle = (
    vehicleId: string,
    mission: {
      destination?: string
      destinationWard?: string
      purpose: string
      estimatedReturn: string
      driverId?: string | null
    }
  ) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== vehicleId) return v

        let assignedDriverId = v.assignedDriverId
        let assignedDriverName = v.assignedDriverName
        if (mission.driverId) {
          const drv = drivers.find((d) => d.id === mission.driverId)
          if (drv) {
            assignedDriverId = drv.id
            assignedDriverName = drv.name
          }
        }

        return {
          ...v,
          status: 'On Mission',
          currentLocation: mission.destinationWard || mission.destination || 'Field Mission',
          assignedDriverId,
          assignedDriverName,
          activeMission: {
            destination: mission.destinationWard || mission.destination || 'Field Mission',
            purpose: mission.purpose,
            dispatchedAt: new Date().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            estimatedReturn: mission.estimatedReturn,
          },
        }
      })
    )
  }

  const returnVehicleFromMission = (vehicleId: string, returnLocation?: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== vehicleId) return v
        const compliance = getVehicleComplianceInfo(v)

        return {
          ...v,
          status: compliance.hasAnyAlert ? 'Permit Due' : 'Available',
          currentLocation: returnLocation || 'Municipal Depot - Central Parking',
          activeMission: undefined,
        }
      })
    )
  }

  const assignDriver = (vehicleId: string, driverId: string | null) => {
    const drv = driverId ? drivers.find((d) => d.id === driverId) : null

    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== vehicleId) return v
        return {
          ...v,
          assignedDriverId: drv ? drv.id : null,
          assignedDriverName: drv ? drv.name : null,
        }
      })
    )

    // Update drivers list
    setDrivers((prev) =>
      prev.map((d) => {
        // Clear previous assignment if same vehicle
        if (d.assignedVehicleId === vehicleId && d.id !== driverId) {
          return { ...d, assignedVehicleId: null, assignedVehicleReg: null }
        }
        if (d.id === driverId) {
          const targetV = vehicles.find((v) => v.id === vehicleId)
          return {
            ...d,
            assignedVehicleId: vehicleId,
            assignedVehicleReg: targetV ? targetV.registrationNumber : null,
          }
        }
        return d
      })
    )
  }

  const renewPermit = (
    vehicleId: string,
    newDates: {
      permitExpiryDate: string
      revenueLicenseExpiryDate: string
      insuranceExpiryDate: string
    }
  ) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== vehicleId) return v
        const newV = {
          ...v,
          permitExpiryDate: newDates.permitExpiryDate,
          revenueLicenseExpiryDate: newDates.revenueLicenseExpiryDate,
          insuranceExpiryDate: newDates.insuranceExpiryDate,
        }

        const compliance = getVehicleComplianceInfo(newV)
        let updatedStatus: VehicleStatus = newV.status
        if (newV.status === 'Permit Due' && !compliance.hasAnyAlert) {
          updatedStatus = 'Available'
        }

        return {
          ...newV,
          status: updatedStatus,
        }
      })
    )
  }

  const submitApprovalRequest = (
    actionType: FleetActionType,
    title: string,
    description: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
    options?: {
      targetVehicleId?: string
      targetVehicleReg?: string
      targetDriverName?: string
      requiredApproverRole?: string
      requestedBy?: string
    }
  ): FleetApprovalRequest => {
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    const randomSuffix = 100 + (array[0] % 900)

    const newReq: FleetApprovalRequest = {
      id: `REQ-${Date.now()}`,
      requestNumber: `FL-REQ-2026-${randomSuffix}`,
      actionType,
      title,
      description,
      requestedBy: options?.requestedBy || 'Current Council User (Officer)',
      requestedAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      targetVehicleId: options?.targetVehicleId,
      targetVehicleReg: options?.targetVehicleReg,
      targetDriverName: options?.targetDriverName,
      status: 'Pending Approval',
      payload,
      requiredApproverRole: options?.requiredApproverRole || 'Municipal Engineer / Secretary',
    }

    setApprovalRequests((prev) => [newReq, ...prev])
    return newReq
  }

  const approveRequest = (requestId: string, approverName = 'Authorized Manager / Secretary') => {
    const req = approvalRequests.find((r) => r.id === requestId)
    if (req?.status !== 'Pending Approval') return

    if (req.actionType === 'ADD_VEHICLE' && req.payload) {
      addVehicle(req.payload)
    } else if (req.actionType === 'DISPATCH_VEHICLE' && req.payload) {
      dispatchVehicle(req.payload.vehicleId, req.payload.mission)
    } else if (req.actionType === 'SCHEDULE_MAINTENANCE' && req.payload) {
      putInMaintenance(req.payload.vehicleId, req.payload.maintenanceData)
    } else if (req.actionType === 'COMPLETE_MAINTENANCE' && req.payload) {
      completeMaintenance(req.payload.vehicleId, req.payload.actualCost, req.payload.notes)
    } else if (req.actionType === 'ASSIGN_DRIVER' && req.payload) {
      assignDriver(req.payload.vehicleId, req.payload.driverId)
    } else if (req.actionType === 'RETURN_MISSION' && req.payload) {
      returnVehicleFromMission(req.payload.vehicleId)
    } else if (req.actionType === 'RENEW_PERMIT' && req.payload) {
      renewPermit(req.payload.vehicleId, req.payload.dates)
    }

    setApprovalRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Approved' as const,
              approverName,
              approvedAt: new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
            }
          : r
      )
    )
  }

  const rejectRequest = (
    requestId: string,
    rejectionReason: string,
    approverName = 'Authorized Manager / Secretary'
  ) => {
    setApprovalRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Rejected' as const,
              approverName,
              approvedAt: new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              rejectionReason,
            }
          : r
      )
    )
  }

  return {
    vehicles,
    filteredVehicles,
    drivers,
    approvalRequests,
    stats,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    showOnlyPermitAlerts,
    setShowOnlyPermitAlerts,
    addVehicle,
    putInMaintenance,
    completeMaintenance,
    dispatchVehicle,
    returnVehicleFromMission,
    assignDriver,
    renewPermit,
    submitApprovalRequest,
    approveRequest,
    rejectRequest,
  }
}

