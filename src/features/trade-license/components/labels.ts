import type { ChargeType, PaymentMethod } from '../types/tradeLicense'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  CHEQUE: 'Cheque',
  BANK_TRANSFER: 'Bank transfer',
  CARD: 'Card',
  ONLINE: 'Online payment',
}

const CHARGE_LABELS: Record<ChargeType, string> = {
  PROCESSING_FEE: 'Processing fee',
  LICENSE_FEE: 'Licence fee',
  STAMP_DUTY: 'Stamp duty',
}

export const chargeLabel = (t: ChargeType) => CHARGE_LABELS[t]
