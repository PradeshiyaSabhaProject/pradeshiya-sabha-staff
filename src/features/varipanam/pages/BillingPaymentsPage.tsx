import React, { useState } from 'react'
import {
  Receipt,
  FileSpreadsheet,
  Globe,
  Plus,
  CheckCircle,
  Smartphone,
} from 'lucide-react'
import { useVaripanam } from '../context/VaripanamContext'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'
import { formatLKR } from '../utils/formatters'
import { allocatePayment } from '../rules/varipanamRules'

export const BillingPaymentsPage: React.FC = () => {
  const {
    properties,
    onlinePayments,
    simulateOnlinePayment,
    recordPayment,
    settings,
  } = useVaripanam()

  const [activeTab, setActiveTab] = useState<'dues' | 'payments' | 'online'>('dues')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '')
  const [showCounterPaymentModal, setShowCounterPaymentModal] = useState<boolean>(false)
  const [showOnlineSimulatorModal, setShowOnlineSimulatorModal] = useState<boolean>(false)

  // Counter payment form
  const [counterPayAmount, setCounterPayAmount] = useState<string>('14750')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'CHEQUE'>('CASH')
  const [receiptNumber] = useState<string>('REC-OFF-84920')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Online payment simulator state
  const [simNic, setSimNic] = useState<string>('197512400321')
  const [simMethod, setSimMethod] = useState<'CARD' | 'LANKA_QR' | 'BANK_APP' | 'GOV_PAY' | 'ONLINE_BANKING'>('CARD')
  const [simOption, setSimOption] = useState<'FULL_YEAR' | 'QUARTERLY'>('QUARTERLY')
  const [isSimulating, setIsSimulating] = useState<boolean>(false)

  const selectedProp = properties.find((p) => p.id === selectedPropertyId)

  // Allocation preview for counter payment
  const allocationPreview = selectedProp
    ? allocatePayment({
        property: selectedProp,
        paymentAmount: Number(counterPayAmount) || 0,
        paymentDate: new Date(),
        settings,
      })
    : null

  const handleCommitCounterPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProp) return

    await recordPayment({
      propertyId: selectedProp.id,
      assessmentNumber: selectedProp.assessmentNumber,
      receiptNumber,
      amount: Number(counterPayAmount) || 0,
      date: new Date().toISOString().slice(0, 10),
      status: 'OFFICIAL',
      channel: 'counter',
      method: paymentMethod,
      officerId: 'usr-001',
      officerName: 'Counter Officer',
      actingAs: 'Counter Officer',
      quarterAllocations: [
        {
          year: 2026,
          quarter: 1,
          amount: Number(counterPayAmount) || 0,
          discount: allocationPreview?.discountGiven || 0,
        },
      ],
      notes: 'Counter payment recorded at Pradeshiya Sabha Revenue Desk',
      officialReceiptNumber: receiptNumber,
    })

    setSuccessMessage(`Payment of ${formatLKR(Number(counterPayAmount))} committed successfully. Official receipt ${receiptNumber} generated.`)
    setShowCounterPaymentModal(false)
  }

  const handleSimulateOnlinePayment = async () => {
    if (!selectedProp) return
    setIsSimulating(true)
    try {
      const result = await simulateOnlinePayment({
        propertyId: selectedProp.id,
        assessmentNumber: selectedProp.assessmentNumber,
        nic: simNic.trim(),
        customerName: selectedProp.currentOwner.name,
        quarterType: simOption,
        selectedQuarters: simOption === 'FULL_YEAR' ? [1, 2, 3, 4] : [1],
        totalPayable: 14750,
        baseDue: 5000,
        arrears: 10000,
        discount: 250,
        paymentMethod: simMethod,
        status: 'SUCCESS',
        receiptNumber: `E-RCP-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        smsSent: true,
        emailSent: true,
      })

      setSuccessMessage(`Online payment completed! Digital e-Receipt ${result.receiptNumber} issued. SMS notification dispatched to ${selectedProp.currentOwner.mobile}.`)
      setShowOnlineSimulatorModal(false)
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Billing & Revenue Payments</h1>
            <NeedsConfirmationBadge tooltip="Tax calculation rates (Residential 10%, Commercial 15%) and discount window awaiting gazette finalization." />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Dues assessment ledger, official counter receipting, and online payment gateway transaction monitoring.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
          <button
            type="button"
            onClick={() => setActiveTab('dues')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'dues' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
            }`}
          >
            Dues Ledger
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'payments' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
            }`}
          >
            Counter Payments
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('online')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'online' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
            }`}
          >
            Online Gateways ({onlinePayments.length})
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ── TAB 1: Dues Ledger ── */}
      {activeTab === 'dues' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#A31736]" />
              <span>Assessment Units Quarterly Dues</span>
            </h2>
            <button
              type="button"
              onClick={() => setShowCounterPaymentModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>RECORD COUNTER PAYMENT</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Assessment No</th>
                  <th className="p-3.5">Owner</th>
                  <th className="p-3.5">Annual Value</th>
                  <th className="p-3.5">Annual Tax</th>
                  <th className="p-3.5">Arrears</th>
                  <th className="p-3.5">Current Q Due</th>
                  <th className="p-3.5">Warrant Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {properties.map((prop) => {
                  const arrears = prop.dues
                    .filter((d) => d.year < 2026 && d.status !== 'Paid')
                    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)
                  const currentDue = prop.dues
                    .filter((d) => d.year === 2026 && d.status !== 'Paid')
                    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)

                  return (
                    <tr key={prop.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 font-black text-gray-900">{prop.assessmentNumber}</td>
                      <td className="p-3.5 font-semibold text-gray-800">{prop.currentOwner.name}</td>
                      <td className="p-3.5 font-mono">{formatLKR(prop.annualAssessedValue)}</td>
                      <td className="p-3.5 font-mono font-bold text-gray-900">
                        {formatLKR(prop.annualAssessedValue * 0.1)}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-rose-700">{formatLKR(arrears)}</td>
                      <td className="p-3.5 font-mono font-semibold text-amber-800">{formatLKR(currentDue)}</td>
                      <td className="p-3.5">
                        {prop.activeWarrant ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                            Warrant Issued
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">None</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPropertyId(prop.id)
                            setShowCounterPaymentModal(true)
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-[#A31736] hover:bg-rose-50 rounded-lg"
                        >
                          Collect
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: Counter Payments Desk ── */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#A31736]" />
              <span>Counter Receipts & Allocation Log</span>
            </h2>
            <button
              type="button"
              onClick={() => setShowCounterPaymentModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>ISSUE COUNTER RECEIPT</span>
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-600">
            <p className="font-bold text-gray-800">Pradeshiya Sabha Cash Counter Protocol:</p>
            <p className="mt-0.5">
              Cash payments settled at the counter issue official counterfoil receipts with statutory seal. Allocations strictly clear oldest arrears prior to current quarter dues.
            </p>
          </div>
        </div>
      )}

      {/* ── TAB 3: Online Payment Gateway Monitoring & Simulator ── */}
      {activeTab === 'online' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#A31736]" />
                <span>Online Gateway Attempts (Flowchart 1 Audit)</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time monitoring of citizen transactions via LankaQR, GovPay, Credit Card, and Bank App.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowOnlineSimulatorModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Smartphone className="w-4 h-4" />
              <span>SIMULATE CITIZEN ONLINE PAYMENT</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Transaction Ref</th>
                  <th className="p-3.5">Customer & NIC</th>
                  <th className="p-3.5">Assessment No</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Total Paid</th>
                  <th className="p-3.5">Discount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">e-Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {onlinePayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-gray-900">{p.transactionRef}</td>
                    <td className="p-3.5">
                      <p className="font-semibold text-gray-800">{p.customerName}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{p.nic}</p>
                    </td>
                    <td className="p-3.5 font-mono">{p.assessmentNumber}</td>
                    <td className="p-3.5 font-semibold text-blue-700">{p.paymentMethod}</td>
                    <td className="p-3.5 font-mono font-bold text-gray-900">{formatLKR(p.totalPayable)}</td>
                    <td className="p-3.5 font-mono text-emerald-600 font-semibold">{formatLKR(p.discount)}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'FAILED'
                            ? 'bg-rose-100 text-rose-800'
                            : p.status === 'TIMEOUT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono text-[11px] text-gray-600">
                      {p.receiptNumber || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal: Record Counter Payment ── */}
      {showCounterPaymentModal && selectedProp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#A31736]" />
              <span>Record Official Counterfoil Payment</span>
            </h3>

            <form onSubmit={handleCommitCounterPayment} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Target Assessment Unit *</label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.assessmentNumber} — {p.currentOwner.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Payment Amount (LKR) *</label>
                  <input
                    type="number"
                    value={counterPayAmount}
                    onChange={(e) => setCounterPayAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 outline-none focus:border-[#A31736]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'CASH' | 'CARD' | 'CHEQUE')}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="CHEQUE">Bank Cheque</option>
                  </select>
                </div>
              </div>

              {/* Allocation Preview Box */}
              {allocationPreview && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                  <p className="font-bold text-gray-800">Allocation Breakdown (Oldest First Rule):</p>
                  <div className="flex justify-between text-gray-600">
                    <span>Arrears Principal Cleared:</span>
                    <span className="font-mono font-bold text-rose-700">{formatLKR(allocationPreview.arrearsPrincipalPaid)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Warrant Penalty Paid:</span>
                    <span className="font-mono font-bold text-purple-700">{formatLKR(allocationPreview.warrantPenaltyPaid)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Current Year Rate Paid:</span>
                    <span className="font-mono font-bold text-emerald-700">{formatLKR(allocationPreview.currentYearPaid)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Prompt Payment Discount Given:</span>
                    <span className="font-mono font-bold text-blue-700">{formatLKR(allocationPreview.discountGiven)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCounterPaymentModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-lg cursor-pointer"
                >
                  Issue Official Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Online Payment Simulator ── */}
      {showOnlineSimulatorModal && selectedProp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>Simulate Citizen Online Portal Payment</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Citizen NIC</label>
                <input
                  type="text"
                  value={simNic}
                  onChange={(e) => setSimNic(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Online Channel</label>
                <select
                  value={simMethod}
                  onChange={(e) => setSimMethod(e.target.value as 'CARD' | 'LANKA_QR' | 'BANK_APP' | 'GOV_PAY' | 'ONLINE_BANKING')}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                >
                  <option value="CARD">Visa / Mastercard / UnionPay</option>
                  <option value="LANKA_QR">LankaQR Instant Code</option>
                  <option value="GOV_PAY">LankaPay GovPay</option>
                  <option value="BANK_APP">Commercial Bank Direct App</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Payment Schedule</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimOption('QUARTERLY')}
                    className={`p-2 rounded-lg border text-center font-bold ${
                      simOption === 'QUARTERLY' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'
                    }`}
                  >
                    Current Quarter (Q1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimOption('FULL_YEAR')}
                    className={`p-2 rounded-lg border text-center font-bold ${
                      simOption === 'FULL_YEAR' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'
                    }`}
                  >
                    Full Year (10% Rebate)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOnlineSimulatorModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulateOnlinePayment}
                disabled={isSimulating}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                Execute Mock Payment & Dispatch SMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BillingPaymentsPage
