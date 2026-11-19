import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { MOCK_PAYMENTS } from '../data/mockPayments'
import type { PaymentRecord, PaymentStatus } from '../types/paymentPortal'

interface AddPaymentInput {
  invoiceNumber?: string
  date?: string
  categoryId: number
  categoryName: string
  payerName: string
  payerNic?: string
  payerPhone?: string
  referenceId: string
  amount: number
  paymentMethod: PaymentRecord['paymentMethod']
  status: PaymentStatus
  officer: string
  notes?: string
  lineItems: PaymentRecord['lineItems']
  propertyDetails?: PaymentRecord['propertyDetails']
}

interface PaymentPortalContextType {
  payments: PaymentRecord[]
  addPayment: (input: AddPaymentInput) => PaymentRecord
  updatePaymentStatus: (id: string, status: PaymentStatus) => void
  getPaymentById: (id: string) => PaymentRecord | undefined
  getPaymentByInvoiceNo: (invoiceNo: string) => PaymentRecord | undefined
  lastRefreshed: Date
  refreshData: () => void
  stats: {
    totalCollectedThisMonth: number
    invoicesGeneratedToday: number
    pendingPaymentsCount: number
    pendingPaymentsAmount: number
    collectionsToday: number
    totalInvoicesCount: number
  }
}

const PaymentPortalContext = createContext<PaymentPortalContextType | undefined>(undefined)

export const PaymentPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<PaymentRecord[]>(MOCK_PAYMENTS)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  const refreshData = useCallback(() => {
    setLastRefreshed(new Date())
  }, [])

  const addPayment = useCallback((input: AddPaymentInput): PaymentRecord => {
    // Generate sequential invoice number if not passed
    let invoiceNumber = input.invoiceNumber
    if (!invoiceNumber) {
      const highestNum = payments.reduce((max, p) => {
        const match = p.invoiceNumber.match(/INV-2026-(\d+)/)
        if (match) {
          const val = parseInt(match[1], 10)
          return Math.max(max, isNaN(val) ? 0 : val)
        }
        return max
      }, 18)
      const nextNum = highestNum + 1
      invoiceNumber = `INV-2026-${String(nextNum).padStart(4, '0')}`
    }

    const todayStr = new Date().toISOString().slice(0, 10)
    const newRecord: PaymentRecord = {
      id: `pay-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      invoiceNumber,
      date: input.date || todayStr,
      categoryId: input.categoryId,
      categoryName: input.categoryName,
      payerName: input.payerName,
      payerNic: input.payerNic,
      payerPhone: input.payerPhone,
      referenceId: input.referenceId,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      status: input.status,
      officer: input.officer || 'Homagama PS Staff (Cashier)',
      notes: input.notes,
      lineItems: input.lineItems,
      propertyDetails: input.propertyDetails,
      createdAt: new Date().toISOString(),
    }

    setPayments((prev) => [newRecord, ...prev])
    return newRecord
  }, [payments])

  const updatePaymentStatus = useCallback((id: string, status: PaymentStatus) => {
    setPayments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    )
  }, [])

  const getPaymentById = useCallback(
    (id: string) => payments.find((p) => p.id === id),
    [payments]
  )

  const getPaymentByInvoiceNo = useCallback(
    (invoiceNo: string) =>
      payments.find((p) => p.invoiceNumber.toLowerCase() === invoiceNo.trim().toLowerCase()),
    [payments]
  )

  // Calculate statistics from payments
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    const currentMonthPrefix = todayStr.slice(0, 7)

    let totalCollectedThisMonth = 0
    let invoicesGeneratedToday = 0
    let pendingPaymentsCount = 0
    let pendingPaymentsAmount = 0
    let collectionsToday = 0

    payments.forEach((p) => {
      const isToday = p.date === todayStr || p.createdAt.startsWith(todayStr)
      const isThisMonth = p.date.startsWith(currentMonthPrefix) || p.createdAt.startsWith(currentMonthPrefix)

      if (isToday) {
        invoicesGeneratedToday += 1
      }

      if (p.status === 'Paid') {
        if (isThisMonth) {
          totalCollectedThisMonth += p.amount
        }
        if (isToday) {
          collectionsToday += p.amount
        }
      } else if (p.status === 'Pending Payment') {
        pendingPaymentsCount += 1
        pendingPaymentsAmount += p.amount
      }
    })

    return {
      totalCollectedThisMonth,
      invoicesGeneratedToday,
      pendingPaymentsCount,
      pendingPaymentsAmount,
      collectionsToday,
      totalInvoicesCount: payments.length,
    }
  }, [payments])

  const value = useMemo(
    () => ({
      payments,
      addPayment,
      updatePaymentStatus,
      getPaymentById,
      getPaymentByInvoiceNo,
      lastRefreshed,
      refreshData,
      stats,
    }),
    [
      payments,
      addPayment,
      updatePaymentStatus,
      getPaymentById,
      getPaymentByInvoiceNo,
      lastRefreshed,
      refreshData,
      stats,
    ]
  )

  return (
    <PaymentPortalContext.Provider value={value}>
      {children}
    </PaymentPortalContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePaymentPortal = (): PaymentPortalContextType => {
  const context = useContext(PaymentPortalContext)
  if (!context) {
    throw new Error('usePaymentPortal must be used within a PaymentPortalProvider')
  }
  return context
}

export const PaymentPortalLayout: React.FC = () => {
  return (
    <PaymentPortalProvider>
      <Outlet />
    </PaymentPortalProvider>
  )
}

export default PaymentPortalLayout
