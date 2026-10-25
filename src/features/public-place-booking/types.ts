import type { BookingStatus } from '../booking-management/types'

export type PaymentPlan = 'ADVANCE' | 'FULL'
export type DepositOutcome = 'REFUNDED' | 'RETAINED'

export interface StaffBookingWorkflow {
  status: BookingStatus
  paymentPlan: PaymentPlan
  upfrontAmount: number
  upfrontReceived: boolean
  balanceReceived: boolean
  groundsReady: boolean
  setupReady: boolean
  utilitiesReady: boolean
  permitVerified: boolean
  venueHandedOver: boolean
  venueReturned: boolean
  depositOutcome: DepositOutcome | null
  settlementClosed: boolean
}
