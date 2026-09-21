import React, { createContext, useContext, useState, useEffect } from 'react'
import type {
  MonthlyCashFlow,
  WatchlistAccount,
  InvoiceItem,
  PaymentVoucher,
  BankAccountSummary,
  JournalEntry,
  BankStatementRecord,
} from '../data/financeMockData'
import {
  INITIAL_MONTHLY_CASH_FLOW,
  INITIAL_WATCHLIST_ACCOUNTS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_INVOICES,
  INITIAL_PAYMENT_VOUCHERS,
  INITIAL_JOURNAL_ENTRIES,
} from '../data/financeMockData'

interface FinanceKpiSummary {
  totalRevenueYTD: number
  totalExpendituresYTD: number
  netOperatingSurplus: number
  bankCashBalance: number
  revenueTarget: number
  expenditureBudget: number
  revenueGrowthYoY: number
  expenditureGrowthYoY: number
}

interface FinanceContextType {
  monthlyCashFlow: MonthlyCashFlow[]
  watchlistAccounts: WatchlistAccount[]
  bankAccounts: BankAccountSummary[]
  invoices: InvoiceItem[]
  paymentVouchers: PaymentVoucher[]
  journalEntries: JournalEntry[]
  kpiSummary: FinanceKpiSummary
  createInvoice: (invoice: Omit<InvoiceItem, 'id' | 'invoiceNumber'>) => void
  updateInvoicePayment: (invoiceId: string, payment: import('../data/financeMockData').PaymentRecord) => void
  updateInvoiceStatus: (invoiceId: string, status: InvoiceItem['status']) => void
  sendInvoiceReminder: (invoiceId: string, channel: 'SMS' | 'Email') => void
  recordPaymentVoucher: (voucher: Omit<PaymentVoucher, 'id' | 'voucherNumber'>) => void
  importBankStatement: (bankAccountId: string, records: Omit<BankStatementRecord, 'id'>[]) => void
  postJournalEntry: (entry: Omit<JournalEntry, 'id' | 'journalNumber'>) => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

const STORAGE_KEYS = {
  CASH_FLOW: 'ps_finance_cash_flow',
  WATCHLIST: 'ps_finance_watchlist',
  BANK_ACCOUNTS: 'ps_finance_bank_accounts',
  INVOICES: 'ps_finance_invoices',
  VOUCHERS: 'ps_finance_vouchers',
  JOURNALS: 'ps_finance_journals',
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [monthlyCashFlow, setMonthlyCashFlow] = useState<MonthlyCashFlow[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASH_FLOW)
    return saved ? JSON.parse(saved) : INITIAL_MONTHLY_CASH_FLOW
  })

  const [watchlistAccounts, setWatchlistAccounts] = useState<WatchlistAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WATCHLIST)
    return saved ? JSON.parse(saved) : INITIAL_WATCHLIST_ACCOUNTS
  })

  const [bankAccounts, setBankAccounts] = useState<BankAccountSummary[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS)
    return saved ? JSON.parse(saved) : INITIAL_BANK_ACCOUNTS
  })

  const [invoices, setInvoices] = useState<InvoiceItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES)
    return saved ? JSON.parse(saved) : INITIAL_INVOICES
  })

  const [paymentVouchers, setPaymentVouchers] = useState<PaymentVoucher[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VOUCHERS)
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_VOUCHERS
  })

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.JOURNALS)
    return saved ? JSON.parse(saved) : INITIAL_JOURNAL_ENTRIES
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASH_FLOW, JSON.stringify(monthlyCashFlow))
  }, [monthlyCashFlow])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlistAccounts))
  }, [watchlistAccounts])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(bankAccounts))
  }, [bankAccounts])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices))
  }, [invoices])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(paymentVouchers))
  }, [paymentVouchers])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(journalEntries))
  }, [journalEntries])

  // Compute live KPIs
  const totalRevenueYTD = monthlyCashFlow.reduce((sum, item) => sum + item.inflows, 0)
  const totalExpendituresYTD = monthlyCashFlow.reduce((sum, item) => sum + item.outflows, 0)
  const netOperatingSurplus = totalRevenueYTD - totalExpendituresYTD
  const bankCashBalance = bankAccounts.reduce((sum, item) => sum + item.balance, 0)

  const kpiSummary: FinanceKpiSummary = {
    totalRevenueYTD,
    totalExpendituresYTD,
    netOperatingSurplus,
    bankCashBalance,
    revenueTarget: 180000000,
    expenditureBudget: 165000000,
    revenueGrowthYoY: 12.4,
    expenditureGrowthYoY: 6.8,
  }

  const createInvoice = (newInvoice: Omit<InvoiceItem, 'id' | 'invoiceNumber'>) => {
    const id = `inv-${Date.now()}`
    const invoiceNumber = `INV-2026-${String(invoices.length + 942).padStart(4, '0')}`
    const fullInvoice: InvoiceItem = { id, invoiceNumber, ...newInvoice }

    setInvoices((prev) => [fullInvoice, ...prev])

    // Update watchlist account if related to Assessment Rates
    if (newInvoice.category === 'Assessment Rates') {
      setWatchlistAccounts((prev) =>
        prev.map((acc) => {
          if (acc.code === 'REV-101') {
            const newActual = acc.actualYTD + newInvoice.amount
            return {
              ...acc,
              actualYTD: newActual,
              percentage: Math.round((newActual / acc.targetOrBudget) * 1000) / 10,
              recentEntries: [
                {
                  id: `re-${Date.now()}`,
                  date: newInvoice.issueDate,
                  description: `Invoice ${invoiceNumber} - ${newInvoice.customerName}`,
                  type: 'Credit',
                  amount: newInvoice.amount,
                  refNo: invoiceNumber,
                },
                ...acc.recentEntries,
              ],
            }
          }
          return acc
        })
      )
    }
  }

  const updateInvoicePayment = (
    invoiceId: string,
    payment: import('../data/financeMockData').PaymentRecord,
  ) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv
        const newPaidAmount = (inv.paidAmount || 0) + payment.amount
        const newStatus: InvoiceItem['status'] =
          newPaidAmount >= inv.amount
            ? 'Paid'
            : newPaidAmount > 0
              ? 'Partially Paid'
              : inv.status
        return {
          ...inv,
          paidAmount: newPaidAmount,
          status: newStatus,
          paymentHistory: [...(inv.paymentHistory || []), payment],
        }
      }),
    )
    // Also update cash flow inflows for current month
    setMonthlyCashFlow((prev) =>
      prev.map((item) => {
        if (item.shortMonth === 'Sep') {
          const newInflows = item.inflows + payment.amount
          return { ...item, inflows: newInflows, net: newInflows - item.outflows }
        }
        return item
      }),
    )
  }

  const updateInvoiceStatus = (invoiceId: string, status: InvoiceItem['status']) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status } : inv)),
    )
  }

  const sendInvoiceReminder = (invoiceId: string, _channel: 'SMS' | 'Email') => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              remindersSent: (inv.remindersSent || 0) + 1,
              lastReminderDate: new Date().toISOString().split('T')[0],
            }
          : inv,
      ),
    )
  }

  const recordPaymentVoucher = (newVoucher: Omit<PaymentVoucher, 'id' | 'voucherNumber'>) => {
    const id = `pv-${Date.now()}`
    const voucherNumber = `PV-2026-${String(paymentVouchers.length + 1893).padStart(4, '0')}`
    const fullVoucher: PaymentVoucher = { id, voucherNumber, ...newVoucher }

    setPaymentVouchers((prev) => [fullVoucher, ...prev])

    // Update cash flow of current month (September)
    setMonthlyCashFlow((prev) =>
      prev.map((item) => {
        if (item.shortMonth === 'Sep') {
          const newOutflows = item.outflows + newVoucher.amount
          return {
            ...item,
            outflows: newOutflows,
            net: item.inflows - newOutflows,
          }
        }
        return item
      })
    )

    // Update bank balance if primary operating account
    setBankAccounts((prev) =>
      prev.map((acc, index) => {
        if (index === 0) {
          return { ...acc, balance: Math.max(0, acc.balance - newVoucher.amount) }
        }
        return acc
      })
    )

    // Update watchlist if fuel or capital works
    if (newVoucher.category === 'Fuel & Fleet') {
      setWatchlistAccounts((prev) =>
        prev.map((acc) => {
          if (acc.code === 'EXP-304') {
            const newActual = acc.actualYTD + newVoucher.amount
            return {
              ...acc,
              actualYTD: newActual,
              percentage: Math.round((newActual / acc.targetOrBudget) * 1000) / 10,
              status: newActual > acc.allocatedBudget ? 'Over Budget' : acc.status,
              recentEntries: [
                {
                  id: `fe-${Date.now()}`,
                  date: newVoucher.paymentDate,
                  description: `${voucherNumber} - ${newVoucher.payeeName}`,
                  type: 'Debit',
                  amount: newVoucher.amount,
                  refNo: voucherNumber,
                },
                ...acc.recentEntries,
              ],
            }
          }
          return acc
        })
      )
    }
  }

  const importBankStatement = (bankAccountId: string, records: Omit<BankStatementRecord, 'id'>[]) => {
    const netStatementSum = records.reduce((acc, r) => (r.type === 'Credit' ? acc + r.amount : acc - r.amount), 0)

    setBankAccounts((prev) =>
      prev.map((bank) => {
        if (bank.id === bankAccountId) {
          return {
            ...bank,
            balance: bank.balance + netStatementSum,
            lastReconciledDate: new Date().toISOString().split('T')[0],
            unreconciledCount: 0,
          }
        }
        return bank
      })
    )
  }

  const postJournalEntry = (newEntry: Omit<JournalEntry, 'id' | 'journalNumber'>) => {
    const id = `jnl-${Date.now()}`
    const journalNumber = `JV-2026-${String(journalEntries.length + 413).padStart(4, '0')}`
    const fullJournal: JournalEntry = { id, journalNumber, ...newEntry }

    setJournalEntries((prev) => [fullJournal, ...prev])

    // Update corresponding watchlist account if codes match
    setWatchlistAccounts((prev) =>
      prev.map((acc) => {
        if (acc.code === newEntry.debitAccountCode) {
          const newActual = acc.actualYTD + newEntry.amount
          return {
            ...acc,
            actualYTD: newActual,
            percentage: Math.round((newActual / acc.targetOrBudget) * 1000) / 10,
            recentEntries: [
              {
                id: `je-${Date.now()}`,
                date: newEntry.date,
                description: `${journalNumber}: ${newEntry.narration}`,
                type: 'Debit',
                amount: newEntry.amount,
                refNo: journalNumber,
              },
              ...acc.recentEntries,
            ],
          }
        }
        if (acc.code === newEntry.creditAccountCode) {
          const newActual = acc.actualYTD + newEntry.amount
          return {
            ...acc,
            actualYTD: newActual,
            percentage: Math.round((newActual / acc.targetOrBudget) * 1000) / 10,
            recentEntries: [
              {
                id: `je-${Date.now()}`,
                date: newEntry.date,
                description: `${journalNumber}: ${newEntry.narration}`,
                type: 'Credit',
                amount: newEntry.amount,
                refNo: journalNumber,
              },
              ...acc.recentEntries,
            ],
          }
        }
        return acc
      })
    )
  }

  return (
    <FinanceContext.Provider
      value={{
        monthlyCashFlow,
        watchlistAccounts,
        bankAccounts,
        invoices,
        paymentVouchers,
        journalEntries,
        kpiSummary,
        createInvoice,
        updateInvoicePayment,
        updateInvoiceStatus,
        sendInvoiceReminder,
        recordPaymentVoucher,
        importBankStatement,
        postJournalEntry,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}
