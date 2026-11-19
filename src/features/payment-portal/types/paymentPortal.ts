export type PaymentStatus = 'Paid' | 'Pending Payment'

export type PaymentMethod = 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Online' | 'Cheque'

export interface IncomeCategory {
  id: number
  name: string
  description: string
  icon: string
  enabled: boolean
  route?: string
}

export interface InvoiceLineItem {
  id: string
  description: string
  period: string
  amount: number
}

export interface PaymentPropertySnapshot {
  assessmentNumber: string
  propertyNumber: string
  propertyType: string
  description: string
  address: string
  ward: string
  road: string
  annualValue: number
}

export interface PaymentRecord {
  id: string
  invoiceNumber: string
  date: string // ISO date string YYYY-MM-DD or full ISO
  categoryId: number
  categoryName: string
  payerName: string
  payerNic?: string
  payerPhone?: string
  referenceId: string // e.g. "78/12a" or license no
  amount: number
  paymentMethod: PaymentMethod
  status: PaymentStatus
  officer: string
  notes?: string
  lineItems: InvoiceLineItem[]
  propertyDetails?: PaymentPropertySnapshot
  createdAt: string
}
