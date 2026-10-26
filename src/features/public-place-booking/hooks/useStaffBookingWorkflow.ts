import { useCallback, useMemo, useState } from 'react'
import { useBookingData } from '../../booking-management/hooks/useBookingData'
import type { FacilityBooking } from '../../booking-management/types'
import type { StaffBookingWorkflow } from '../types'

const STORAGE_KEY = 'pradeshiya_public_place_booking_workflow_v1'

type WorkflowByBooking = Record<string, StaffBookingWorkflow>

function createInitialWorkflow(booking: FacilityBooking): StaffBookingWorkflow {
  const isCompleted = booking.status === 'COMPLETED'
  const isPaid = booking.paymentStatus === 'PAID'
  const total = booking.rentalFee + booking.securityDeposit

  return {
    status: booking.status,
    paymentPlan: isPaid ? 'FULL' : 'ADVANCE',
    upfrontAmount: isPaid ? total : booking.securityDeposit,
    upfrontReceived: isPaid,
    balanceReceived: isPaid,
    groundsReady: isCompleted,
    setupReady: isCompleted,
    utilitiesReady: isCompleted,
    permitVerified: isCompleted,
    venueHandedOver: isCompleted,
    venueReturned: isCompleted,
    depositOutcome: isCompleted && booking.securityDeposit > 0 ? 'REFUNDED' : null,
    settlementClosed: isCompleted,
  }
}

function isWorkflowRecord(value: unknown): value is StaffBookingWorkflow {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED']
  return (
    typeof record.status === 'string' && validStatuses.includes(record.status) &&
    (record.paymentPlan === 'ADVANCE' || record.paymentPlan === 'FULL') &&
    typeof record.upfrontAmount === 'number' &&
    typeof record.upfrontReceived === 'boolean' &&
    typeof record.balanceReceived === 'boolean' &&
    typeof record.groundsReady === 'boolean' &&
    typeof record.setupReady === 'boolean' &&
    typeof record.utilitiesReady === 'boolean' &&
    typeof record.permitVerified === 'boolean' &&
    typeof record.venueHandedOver === 'boolean' &&
    typeof record.venueReturned === 'boolean' &&
    (record.depositOutcome === null || record.depositOutcome === 'REFUNDED' || record.depositOutcome === 'RETAINED') &&
    typeof record.settlementClosed === 'boolean'
  )
}

function readSavedWorkflows(): WorkflowByBooking {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (!saved) return {}
  const parsed: unknown = JSON.parse(saved)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Saved public place booking workflow data has an invalid format.')
  }

  return Object.fromEntries(
    Object.entries(parsed).filter((entry): entry is [string, StaffBookingWorkflow] => isWorkflowRecord(entry[1])),
  )
}

export function useStaffBookingWorkflow() {
  const {
    loading: bookingsLoading,
    bookings,
    manualBookingError,
    addManualBooking,
  } = useBookingData()
  const [savedState, setSavedState] = useState(() => {
    try {
      return { workflows: readSavedWorkflows(), error: '' }
    } catch (storageError) {
      return {
        workflows: {},
        error: storageError instanceof Error
          ? `Could not load saved staff workflow data: ${storageError.message}`
          : 'Could not load saved staff workflow data.',
      }
    }
  })
  const workflows = useMemo(
    () => Object.fromEntries(
      bookings.map((booking) => [
        booking.id,
        savedState.workflows[booking.id]
          ? savedState.workflows[booking.id].status === 'PENDING' && booking.status !== 'PENDING'
            ? { ...savedState.workflows[booking.id], status: booking.status }
            : savedState.workflows[booking.id]
          : createInitialWorkflow(booking),
      ]),
    ),
    [bookings, savedState.workflows],
  )

  const updateWorkflow = useCallback(
    (bookingId: string, update: Partial<StaffBookingWorkflow>) => {
      const current = workflows[bookingId]
      if (!current) {
        setSavedState((state) => ({
          ...state,
          error: 'The selected booking workflow is not available. Reload the page and try again.',
        }))
        return false
      }

      const nextWorkflows = { ...workflows, [bookingId]: { ...current, ...update } }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextWorkflows))
        setSavedState({ workflows: nextWorkflows, error: '' })
        return true
      } catch (storageError) {
        setSavedState((state) => ({
          ...state,
          error: storageError instanceof Error
            ? `Could not save the staff workflow update: ${storageError.message}`
            : 'Could not save the staff workflow update.',
        }))
        return false
      }
    },
    [workflows],
  )

  const createManualBooking = useCallback(
    (booking: FacilityBooking, workflow: StaffBookingWorkflow) => {
      const nextWorkflows = { ...workflows, [booking.id]: workflow }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextWorkflows))
      } catch (storageError) {
        setSavedState((state) => ({
          ...state,
          error: storageError instanceof Error
            ? `Could not save the initial booking workflow: ${storageError.message}`
            : 'Could not save the initial booking workflow.',
        }))
        return false
      }

      if (!addManualBooking(booking)) return false
      setSavedState({ workflows: nextWorkflows, error: '' })
      return true
    },
    [addManualBooking, workflows],
  )

  return {
    bookings,
    workflows,
    loading: bookingsLoading,
    error: savedState.error || manualBookingError,
    updateWorkflow,
    createManualBooking,
  }
}
