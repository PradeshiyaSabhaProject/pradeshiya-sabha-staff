import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatLKR } from './FinanceKpiCards'
import type { InvoiceItem } from '../data/financeMockData'

type ModalType = 'invoice' | 'voucher' | 'bank' | 'journal' | null

export const QuickActionHub: React.FC = () => {
  const {
    createInvoice,
    recordPaymentVoucher,
    importBankStatement,
    postJournalEntry,
    bankAccounts,
    watchlistAccounts,
  } = useFinance()

  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // ── Invoice Form State ──
  const [invCustomer, setInvCustomer] = useState('')
  const [invNic, setInvNic] = useState('')
  const [invCategory, setInvCategory] = useState<InvoiceItem['category']>('Assessment Tax')
  const [invRefId, setInvRefId] = useState('')
  const [invWard, setInvWard] = useState('Ward 01 - Homagama North')
  const [invAmount, setInvAmount] = useState('')
  const [invDueDate, setInvDueDate] = useState('2026-10-15')
  const [invNotes, setInvNotes] = useState('')

  // ── Voucher Form State ──
  const [vPayee, setVPayee] = useState('')
  const [vCategory, setVCategory] = useState<any>('Fuel & Fleet')
  const [vVoteNo, setVVoteNo] = useState('Vote 3-04 (Vehicular Fuel)')
  const [vAmount, setVAmount] = useState('')
  const [vDate, setVDate] = useState('2026-09-20')
  const [vMethod, setVMethod] = useState<'Cheque' | 'SLIPS EFT' | 'Direct Debit' | 'Petty Cash'>('SLIPS EFT')
  const [vRef, setVRef] = useState('')
  const [vApprovedBy, setVApprovedBy] = useState('Municipal Secretary / Accountant')
  const [vDesc, setVDesc] = useState('')

  // ── Bank Import State ──
  const [selectedBankId, setSelectedBankId] = useState(bankAccounts[0]?.id || '')
  const [fileName, setFileName] = useState<string | null>(null)
  const [isStatementParsed, setIsStatementParsed] = useState(false)

  // ── Journal Form State ──
  const [jDate, setJDate] = useState('2026-09-20')
  const [jDebitCode, setJDebitCode] = useState(watchlistAccounts[0]?.code || 'REV-101')
  const [jCreditCode, setJCreditCode] = useState('LIAB-201')
  const [jAmount, setJAmount] = useState('')
  const [jNarration, setJNarration] = useState('')
  const [jRefDoc, setJRefDoc] = useState('')
  const [jPostedBy, setJPostedBy] = useState('Accountant - G. Jayawardena')

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Handle Invoice Submit
  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!invCustomer || !invAmount) return

    createInvoice({
      customerName: invCustomer,
      customerNICorBRN: invNic || 'N/A',
      category: invCategory,
      propertyOrRefId: invRefId || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: parseFloat(invAmount) || 0,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: invDueDate,
      status: 'Pending',
      wardNumber: invWard,
      notes: invNotes,
    })

    triggerToast(`Invoice successfully issued for ${invCustomer} (${formatLKR(parseFloat(invAmount))})`)
    setActiveModal(null)
    setInvCustomer('')
    setInvNic('')
    setInvAmount('')
    setInvRefId('')
    setInvNotes('')
  }

  // Handle Voucher Submit
  const handleVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vPayee || !vAmount) return

    recordPaymentVoucher({
      payeeName: vPayee,
      category: vCategory,
      voteNumber: vVoteNo,
      amount: parseFloat(vAmount) || 0,
      paymentDate: vDate,
      paymentMethod: vMethod,
      chequeOrEftRef: vRef || `EFT-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Authorized & Paid',
      approvedBy: vApprovedBy,
      description: vDesc || `Payment for ${vCategory}`,
    })

    triggerToast(`Payment Voucher recorded and authorized for ${vPayee} (${formatLKR(parseFloat(vAmount))})`)
    setActiveModal(null)
    setVPayee('')
    setVAmount('')
    setVRef('')
    setVDesc('')
  }

  // Handle Bank Import
  const handleBankImportConfirm = () => {
    importBankStatement(selectedBankId, [
      {
        date: '2026-09-20',
        description: 'Direct Rates Settlement Batch #419',
        reference: 'BOC-STMT-9941',
        type: 'Credit',
        amount: 1250000,
        bankAccountId: selectedBankId,
        status: 'Matched',
      },
      {
        date: '2026-09-19',
        description: 'Standing Order - CEB Streetlight Grid Settlement',
        reference: 'BOC-SO-0012',
        type: 'Debit',
        amount: 790000,
        bankAccountId: selectedBankId,
        status: 'Matched',
      },
    ])

    triggerToast('Bank statement processed! 2 transactions reconciled and bank ledger synchronized.')
    setActiveModal(null)
    setFileName(null)
    setIsStatementParsed(false)
  }

  // Handle Journal Submit
  const handleJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!jAmount || !jNarration) return

    const debitAcc = watchlistAccounts.find((a) => a.code === jDebitCode)
    const creditAcc = watchlistAccounts.find((a) => a.code === jCreditCode)

    postJournalEntry({
      date: jDate,
      debitAccountCode: jDebitCode,
      debitAccountName: debitAcc ? debitAcc.name : `Ledger A/C (${jDebitCode})`,
      creditAccountCode: jCreditCode,
      creditAccountName: creditAcc ? creditAcc.name : `Ledger A/C (${jCreditCode})`,
      amount: parseFloat(jAmount) || 0,
      narration: jNarration,
      referenceDoc: jRefDoc || `DOC-JV-${Math.floor(100 + Math.random() * 900)}`,
      postedBy: jPostedBy,
    })

    triggerToast(`Journal entry posted to General Ledger for ${formatLKR(parseFloat(jAmount))}`)
    setActiveModal(null)
    setJAmount('')
    setJNarration('')
    setJRefDoc('')
  }

  return (
    <>
      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[100] bg-gray-900 text-white px-4 py-3 rounded shadow-xl flex items-center gap-3 border border-emerald-500/50 animate-fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white text-xs ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Action Hub Section (Matching Standard Overview Cards) ── */}
      <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Financial Quick Action Hub
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Execute 1-click fiscal operations, invoice citizens, disburse payment vouchers, and post journal entries.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Operational Shortcuts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {/* Action 1: Create Invoice */}
          <button
            type="button"
            onClick={() => setActiveModal('invoice')}
            className="bg-gray-50/80 hover:bg-white border border-gray-200 hover:border-[#A31736] rounded p-3.5 text-left transition-all group flex items-start gap-3 cursor-pointer shadow-2xs hover:shadow-sm"
          >
            <div className="p-2 rounded bg-emerald-50 text-emerald-800 shrink-0 group-hover:bg-[#A31736] group-hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#A31736] transition-colors uppercase tracking-wider">
                Create Invoice
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                Issue assessment rates, trade license, or stall leases.
              </p>
            </div>
          </button>

          {/* Action 2: Record Payment Voucher */}
          <button
            type="button"
            onClick={() => setActiveModal('voucher')}
            className="bg-gray-50/80 hover:bg-white border border-gray-200 hover:border-[#A31736] rounded p-3.5 text-left transition-all group flex items-start gap-3 cursor-pointer shadow-2xs hover:shadow-sm"
          >
            <div className="p-2 rounded bg-rose-50 text-rose-800 shrink-0 group-hover:bg-[#A31736] group-hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#A31736] transition-colors uppercase tracking-wider">
                Record Voucher
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                Authorize fuel, contractor works, or utility payments.
              </p>
            </div>
          </button>

          {/* Action 3: Import Bank Statement */}
          <button
            type="button"
            onClick={() => setActiveModal('bank')}
            className="bg-gray-50/80 hover:bg-white border border-gray-200 hover:border-[#A31736] rounded p-3.5 text-left transition-all group flex items-start gap-3 cursor-pointer shadow-2xs hover:shadow-sm"
          >
            <div className="p-2 rounded bg-blue-50 text-blue-800 shrink-0 group-hover:bg-[#A31736] group-hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#A31736] transition-colors uppercase tracking-wider">
                Bank Sync & Import
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                Upload .CSV / .OFX from BOC, PB, or Commercial Bank.
              </p>
            </div>
          </button>

          {/* Action 4: Post Journal */}
          <button
            type="button"
            onClick={() => setActiveModal('journal')}
            className="bg-gray-50/80 hover:bg-white border border-gray-200 hover:border-[#A31736] rounded p-3.5 text-left transition-all group flex items-start gap-3 cursor-pointer shadow-2xs hover:shadow-sm"
          >
            <div className="p-2 rounded bg-purple-50 text-purple-800 shrink-0 group-hover:bg-[#A31736] group-hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#A31736] transition-colors uppercase tracking-wider">
                Post Journal Entry
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                Record double-entry General Ledger adjustments (JV).
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ── MODAL 1: CREATE INVOICE ── */}
      {activeModal === 'invoice' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-300 animate-fade-in text-gray-800">
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Issue Municipal Invoice
                </h3>
                <p className="text-xs text-gray-500">Pradeshiya Sabha Revenue Collection Desk</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvoiceSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Customer / Citizen Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. K. D. Gunasekara / Ceylon Retail"
                    value={invCustomer}
                    onChange={(e) => setInvCustomer(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">NIC or Business Reg # (BRN)</label>
                  <input
                    type="text"
                    placeholder="e.g. 198512304918 / PV001928"
                    value={invNic}
                    onChange={(e) => setInvNic(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Revenue Category</label>
                  <select
                    value={invCategory}
                    onChange={(e) => setInvCategory(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  >
                    <option value="Assessment Tax">Assessment Tax (Property Rates)</option>
                    <option value="Trade License">Trade & Business License</option>
                    <option value="Building Application Fee">Building Application & Plan Approval</option>
                    <option value="Market Stall Lease">Market Stall Monthly Lease</option>
                    <option value="Gully Bowser Service">Gully Bowser Municipal Service</option>
                    <option value="Hall Booking">Community Hall / Ground Booking</option>
                    <option value="Advertising Signboard">Advertising Signboard Tax</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Property / Trade / Ref ID</label>
                  <input
                    type="text"
                    placeholder="e.g. AST-KAT-1029 / TL-2026-481"
                    value={invRefId}
                    onChange={(e) => setInvRefId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Invoice Amount (LKR) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 45000"
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs font-mono font-bold text-gray-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Ward Jurisdiction</label>
                <select
                  value={invWard}
                  onChange={(e) => setInvWard(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                >
                  <option>Ward 01 - Homagama North</option>
                  <option>Ward 02 - Homagama Town</option>
                  <option>Ward 03 - Godagama Central</option>
                  <option>Ward 04 - Katuwawala</option>
                  <option>Ward 05 - Meegoda</option>
                  <option>Ward 06 - Pitipana South</option>
                  <option>Ward 07 - Habarakada</option>
                  <option>Ward 08 - Pitipana Techno City</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Notes / Itemization</label>
                <textarea
                  rows={2}
                  placeholder="Additional bill breakdown or surcharge notes..."
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold cursor-pointer uppercase tracking-wider text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#A31736] hover:bg-[#801028] text-white font-bold transition-all shadow-sm cursor-pointer uppercase tracking-wider text-[11px]"
                >
                  Issue & Post Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: RECORD PAYMENT VOUCHER ── */}
      {activeModal === 'voucher' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-300 animate-fade-in text-gray-800">
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Record & Authorize Payment Voucher
                </h3>
                <p className="text-xs text-gray-500">Pradeshiya Sabha Expenditure Treasury Desk</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVoucherSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Payee / Contractor Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ceylon Petroleum Corp / Gamage Engineering"
                    value={vPayee}
                    onChange={(e) => setVPayee(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Expenditure Vote Head</label>
                  <select
                    value={vVoteNo}
                    onChange={(e) => setVVoteNo(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  >
                    <option value="Vote 3-04 (Vehicular Fuel)">Vote 3-04 (Fuel & Lubricants)</option>
                    <option value="Vote 5-01 (Provincial Capital Works)">Vote 5-01 (Capital Road & Drain Works)</option>
                    <option value="Vote 3-12 (Public Street Lighting)">Vote 3-12 (CEB Street Lighting)</option>
                    <option value="Vote 2-01 (Personal Emoluments)">Vote 2-01 (Staff Salaries & Wages)</option>
                    <option value="Vote 4-02 (Solid Waste Disposal)">Vote 4-02 (Garbage Yard & Compost)</option>
                    <option value="Vote 6-01 (Office Administration & IT)">Vote 6-01 (Office Supplies & Software)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Voucher Category</label>
                  <select
                    value={vCategory}
                    onChange={(e) => setVCategory(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  >
                    <option value="Fuel & Fleet">Fuel & Fleet Operations</option>
                    <option value="Capital Works">Capital Development & Construction</option>
                    <option value="Waste Management Contractor">Solid Waste Contractor Services</option>
                    <option value="Utility Bills">Utility Settlements (CEB / Water)</option>
                    <option value="Staff Overtime & Allowances">Staff Overtime & Allowances</option>
                    <option value="Office Supplies & IT">Office Supplies & IT Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Voucher Amount (LKR) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 185000"
                    value={vAmount}
                    onChange={(e) => setVAmount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs font-mono font-bold text-gray-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Payment Method</label>
                  <select
                    value={vMethod}
                    onChange={(e) => setVMethod(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  >
                    <option value="SLIPS EFT">SLIPS Electronic Fund Transfer</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="Direct Debit">Bank Direct Debit</option>
                    <option value="Petty Cash">Petty Cash Imprest</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Cheque # or EFT Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. CHQ-BOC-591024"
                    value={vRef}
                    onChange={(e) => setVRef(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={vDate}
                    onChange={(e) => setVDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Approving Authority</label>
                  <input
                    type="text"
                    value={vApprovedBy}
                    onChange={(e) => setVApprovedBy(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description / Bill Certification</label>
                <textarea
                  rows={2}
                  placeholder="Purpose of disbursement, bill verification notes, and project inspection reference..."
                  value={vDesc}
                  onChange={(e) => setVDesc(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold cursor-pointer uppercase tracking-wider text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#A31736] hover:bg-[#801028] text-white font-bold transition-all shadow-sm cursor-pointer uppercase tracking-wider text-[11px]"
                >
                  Record & Disburse Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: IMPORT BANK STATEMENT ── */}
      {activeModal === 'bank' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-300 animate-fade-in text-gray-800">
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Import & Auto-Reconcile Bank Statement
                </h3>
                <p className="text-xs text-gray-500">Municipal Treasury Bank Feed Sync</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Select Bank Account to Sync</label>
                <select
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} - {b.accountNumber} ({b.accountType}) [Bal: {formatLKR(b.balance)}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-gray-300 hover:border-[#A31736] rounded p-6 text-center bg-gray-50/60 transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-8 h-8 text-gray-400 mx-auto mb-2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>

                {fileName ? (
                  <div>
                    <span className="font-bold text-gray-900 text-xs block">{fileName}</span>
                    <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                      ✓ Ready for parsing (24 transactions found)
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-gray-700">Drag & Drop Bank Statement (.CSV, .OFX, .PDF)</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Supports BOC Corporate Net, People's Wave & Commercial Bank</p>
                    <button
                      type="button"
                      onClick={() => {
                        setFileName('BOC_Current_A_C_Sep2026_Statement.csv')
                        setIsStatementParsed(true)
                      }}
                      className="mt-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold px-3 py-1 rounded text-xs transition-colors cursor-pointer uppercase tracking-wider text-[10px]"
                    >
                      Load Sample Statement File
                    </button>
                  </div>
                )}
              </div>

              {/* Parsed Preview */}
              {isStatementParsed && (
                <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-2">
                  <div className="flex items-center justify-between font-bold text-gray-900 border-b border-gray-200 pb-1">
                    <span className="text-xs uppercase tracking-wider">Automated Matching Engine Summary</span>
                    <span className="text-emerald-700 font-mono text-xs">100% Match Rate</span>
                  </div>
                  <div className="space-y-1 text-gray-600 text-[11px]">
                    <div className="flex justify-between">
                      <span>• Matched Inward Rates & Deposits (2 items):</span>
                      <span className="font-mono font-bold text-emerald-700">+Rs. 1,250,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Matched Standing Orders / Cleared Vouchers (1 item):</span>
                      <span className="font-mono font-bold text-rose-700">-Rs. 790,000</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-1 font-bold text-gray-900">
                      <span>Net Statement Balance Delta:</span>
                      <span className="font-mono text-blue-800">+Rs. 460,000</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null)
                    setFileName(null)
                    setIsStatementParsed(false)
                  }}
                  className="px-3.5 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold cursor-pointer uppercase tracking-wider text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!isStatementParsed}
                  onClick={handleBankImportConfirm}
                  className={`px-4 py-1.5 rounded text-white font-bold transition-all shadow-sm uppercase tracking-wider text-[11px] ${
                    isStatementParsed
                      ? 'bg-[#A31736] hover:bg-[#801028] cursor-pointer'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Confirm & Reconcile Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: POST JOURNAL ENTRY ── */}
      {activeModal === 'journal' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-300 animate-fade-in text-gray-800">
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Post General Ledger Journal Entry
                </h3>
                <p className="text-xs text-gray-500">Double-Entry Financial Adjustment Voucher (JV)</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJournalSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Journal Posting Date</label>
                  <input
                    type="date"
                    value={jDate}
                    onChange={(e) => setJDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Journal Amount (LKR) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 250000"
                    value={jAmount}
                    onChange={(e) => setJAmount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs font-mono font-bold text-gray-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Debit Account (Dr) <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={jDebitCode}
                    onChange={(e) => setJDebitCode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  >
                    {watchlistAccounts.map((acc) => (
                      <option key={acc.code} value={acc.code}>
                        {acc.code} - {acc.name}
                      </option>
                    ))}
                    <option value="EXP-999">EXP-999 - General Operational Expenses</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Credit Account (Cr) <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={jCreditCode}
                    onChange={(e) => setJCreditCode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  >
                    <option value="LIAB-201">LIAB-201 - Accounts Payable / Accrued Bills</option>
                    <option value="REV-901">REV-901 - Assessment Revenue Accruals</option>
                    <option value="BANK-001">BANK-001 - BOC Operating Main Account</option>
                    {watchlistAccounts.map((acc) => (
                      <option key={acc.code} value={acc.code}>
                        {acc.code} - {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Narration / Accounting Explanation <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="State the accounting reason, vote adjustment, or year-end provision details..."
                  value={jNarration}
                  onChange={(e) => setJNarration(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Supporting Document Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. AUD-NOTE-2026-09"
                    value={jRefDoc}
                    onChange={(e) => setJRefDoc(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Posted By Officer</label>
                  <input
                    type="text"
                    value={jPostedBy}
                    onChange={(e) => setJPostedBy(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#A31736]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold cursor-pointer uppercase tracking-wider text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#A31736] hover:bg-[#801028] text-white font-bold transition-all shadow-sm cursor-pointer uppercase tracking-wider text-[11px]"
                >
                  Post to General Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default QuickActionHub
