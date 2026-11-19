import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Building,
  MapPin,
  CheckCircle,
  AlertCircle,
  FileText,
  Receipt,
  RotateCcw,
} from 'lucide-react'
import {
  INITIAL_PROPERTIES,
  INITIAL_WARDS,
  INITIAL_ROADS,
} from '../../varipanam/mock/varipanamMockData'
import type { Property } from '../../varipanam/types/varipanam'
import { formatLKR, formatDate } from '../../varipanam/utils/formatters'
import { usePaymentPortal } from '../context/PaymentPortalContext'
import InvoiceModal from '../components/InvoiceModal'
import type { PaymentRecord } from '../types/paymentPortal'

export const VaripanamCollectionPage: React.FC = () => {
  const navigate = useNavigate()
  const { addPayment, updatePaymentStatus } = usePaymentPortal()

  const [searchInput, setSearchInput] = useState('78/12a')
  const [searchedProperty, setSearchedProperty] = useState<Property | null>(() => {
    // Default search for 78/12a so the user immediately sees a populated example
    return (
      INITIAL_PROPERTIES.find(
        (p) => p.assessmentNumber.toLowerCase() === '78/12a'
      ) || null
    )
  })
  const [hasSearched, setHasSearched] = useState(true)
  const [generatedInvoice, setGeneratedInvoice] = useState<PaymentRecord | null>(null)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  // Lookup ward & road names
  const resolvedLocation = useMemo(() => {
    if (!searchedProperty) return { wardName: 'N/A', roadName: 'N/A' }
    const ward = INITIAL_WARDS.find((w) => w.id === searchedProperty.wardId)
    const road = INITIAL_ROADS.find((r) => r.id === searchedProperty.roadId)
    return {
      wardName: ward ? `${ward.name} (Ward ${ward.number})` : 'Homagama Ward',
      roadName: road ? road.name : 'Council Road',
    }
  }, [searchedProperty])

  // Calculate unpaid dues & total outstanding
  const duesCalculation = useMemo(() => {
    if (!searchedProperty) return { unpaidDues: [], totalOutstanding: 0 }
    const unpaid = searchedProperty.dues.filter((d) => d.amount > d.paidAmount)
    const totalOutstanding = unpaid.reduce(
      (sum, d) => sum + (d.amount - d.paidAmount),
      0
    )
    return { unpaidDues: unpaid, totalOutstanding }
  }, [searchedProperty])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const query = searchInput.trim().toLowerCase()
    setHasSearched(true)
    setSuccessToast(null)

    if (!query) {
      setSearchedProperty(null)
      return
    }

    const match = INITIAL_PROPERTIES.find(
      (p) =>
        p.assessmentNumber.toLowerCase() === query ||
        p.propertyNumber.toLowerCase().includes(query)
    )
    setSearchedProperty(match || null)
  }

  const handleQuickSelect = (assessmentNo: string) => {
    setSearchInput(assessmentNo)
    setHasSearched(true)
    setSuccessToast(null)
    const match = INITIAL_PROPERTIES.find(
      (p) => p.assessmentNumber.toLowerCase() === assessmentNo.toLowerCase()
    )
    setSearchedProperty(match || null)
  }

  const handleGenerateInvoice = () => {
    if (!searchedProperty || duesCalculation.totalOutstanding <= 0) return

    const lineItems = duesCalculation.unpaidDues.map((d, idx) => ({
      id: `item-${searchedProperty.id}-${idx + 1}`,
      description: `Varipanam Assessment Tax - ${d.year} Quarter ${d.quarter}`,
      period: `${d.year} Q${d.quarter}`,
      amount: d.amount - d.paidAmount,
    }))

    const newPayment = addPayment({
      categoryId: 1,
      categoryName: 'Assessment Tax (Varipanam)',
      payerName: searchedProperty.currentOwner.name,
      payerNic: searchedProperty.currentOwner.nic,
      payerPhone: searchedProperty.currentOwner.mobile,
      referenceId: searchedProperty.assessmentNumber,
      amount: duesCalculation.totalOutstanding,
      paymentMethod: 'Cash',
      status: 'Pending Payment',
      officer: 'Homagama PS Staff (Cashier Desk 01)',
      notes: `Counter assessment invoice generated for Assessment No: ${searchedProperty.assessmentNumber} (${duesCalculation.unpaidDues.length} quarters outstanding).`,
      lineItems,
      propertyDetails: {
        assessmentNumber: searchedProperty.assessmentNumber,
        propertyNumber: searchedProperty.propertyNumber,
        propertyType: searchedProperty.propertyType,
        description: searchedProperty.description,
        address: searchedProperty.currentOwner.postalAddress,
        ward: resolvedLocation.wardName,
        road: resolvedLocation.roadName,
        annualValue: searchedProperty.annualAssessedValue,
      },
    })

    setGeneratedInvoice(newPayment)
    setSuccessToast(
      `Invoice ${newPayment.invoiceNumber} for ${formatLKR(newPayment.amount)} has been successfully generated and queued in Total Payments under "Pending Payment".`
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Top Bar: Back Button & Header ── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                to="/payment-portal/collection"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#A31736] transition-colors bg-gray-100 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-gray-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Categories</span>
              </Link>
              <span className="text-gray-300">•</span>
              <span className="text-[11px] font-bold text-[#A31736] uppercase tracking-wider">
                Category #01: Varipanam
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight uppercase">
              ASSESSMENT TAX (VARIPANAM) PAYMENT DESK
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Query property cadastre records, compute quarterly arrears, and generate official payment invoices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/payment-portal/total-payments')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <Receipt className="w-3.5 h-3.5 text-gray-500" />
              <span>View All Invoices</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Search Bar Section ── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <form onSubmit={handleSearch} className="space-y-3">
          <label
            htmlFor="assessmentSearch"
            className="block text-xs font-bold text-gray-700 uppercase tracking-wider"
          >
            Search by Assessment Number
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="assessmentSearch"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter assessment number, e.g. 78/12a, 45/2, 102/1A, 22, 5/A..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[#A31736] focus:border-[#A31736] outline-none text-gray-900 font-semibold uppercase placeholder:normal-case placeholder:font-normal placeholder:text-gray-400 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl transition-all shadow-xs cursor-pointer uppercase tracking-wider shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Find Property</span>
            </button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-gray-400 font-medium text-[11px]">Sample Numbers:</span>
            {['78/12a', '45/2', '102/1A', '22', '5/A'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => handleQuickSelect(sample)}
                className="px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-md bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-[#A31736] border border-gray-200 transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* ── Success Toast Banner ── */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl flex items-start justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs font-semibold">{successToast}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-xs font-bold text-emerald-700 hover:underline uppercase tracking-wider shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── When Property is Found: Details & Dues ── */}
      {searchedProperty ? (
        <div className="space-y-6">
          {/* Property Snapshot Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#A31736]" />
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Assessment Cadastre Record
                </span>
                <span className="font-mono text-xs font-black text-[#A31736] bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                  {searchedProperty.assessmentNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Status:</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${
                    searchedProperty.status === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : searchedProperty.status === 'Warrant issued'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {searchedProperty.status}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
                  Property Number
                </span>
                <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                  {searchedProperty.propertyNumber}
                </span>
                <span className="text-gray-500 text-[11px] block mt-0.5">
                  Type: <strong className="text-gray-700">{searchedProperty.propertyType}</strong>
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
                  Ward & Location
                </span>
                <span className="font-bold text-gray-900 mt-0.5 block">
                  {resolvedLocation.wardName}
                </span>
                <span className="text-gray-500 text-[11px] block mt-0.5">
                  {resolvedLocation.roadName}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
                  Registered Owner
                </span>
                <span className="font-bold text-gray-900 mt-0.5 block">
                  {searchedProperty.currentOwner.name}
                </span>
                <span className="text-gray-500 text-[11px] block mt-0.5">
                  NIC: <strong className="font-mono text-gray-700">{searchedProperty.currentOwner.nic}</strong>
                </span>
                <span className="text-gray-500 text-[11px] block">
                  Mobile: {searchedProperty.currentOwner.mobile}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
                  Assessed Valuation
                </span>
                <span className="font-bold text-[#A31736] text-sm mt-0.5 block font-mono">
                  {formatLKR(searchedProperty.annualAssessedValue)}
                </span>
                <span className="text-gray-400 text-[11px] block mt-0.5">
                  Annual Municipal Base
                </span>
              </div>
            </div>

            <div className="px-5 py-2.5 bg-gray-50/50 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Postal: {searchedProperty.currentOwner.postalAddress}</span>
            </div>
          </div>

          {/* Dues Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 bg-gray-50/50">
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Quarterly Assessment Dues & Balance
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Breakdown of billed quarters, payments credited, and net outstanding balance.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-gray-500 block">Total Outstanding:</span>
                <span className="text-base sm:text-lg font-black text-[#A31736] font-mono">
                  {formatLKR(duesCalculation.totalOutstanding)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px] text-xs">
                <thead>
                  <tr className="bg-gray-100/70 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Year</th>
                    <th className="py-3 px-4">Quarter</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Billed Amount</th>
                    <th className="py-3 px-4 text-right">Paid Amount</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {searchedProperty.dues.map((due) => {
                    const balance = due.amount - due.paidAmount
                    const isSettled = balance <= 0

                    return (
                      <tr key={due.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-900 font-mono">
                          {due.year}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-700">
                          Quarter {due.quarter} (Q{due.quarter})
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {formatDate(due.dueDate)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-gray-700">
                          {formatLKR(due.amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-gray-700">
                          {formatLKR(due.paidAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span className={balance > 0 ? 'text-[#A31736]' : 'text-emerald-700'}>
                            {formatLKR(balance)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                              isSettled
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : due.status === 'Warrant'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {due.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Action Footer with Generate Invoice Button */}
            <div className="p-5 bg-gray-50/50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-gray-500">
                {duesCalculation.totalOutstanding > 0 ? (
                  <span>
                    Ready to issue official revenue invoice for{' '}
                    <strong className="text-gray-900">
                      {duesCalculation.unpaidDues.length} outstanding quarter(s)
                    </strong>
                    .
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    All assessment quarters for this property are fully settled.
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleGenerateInvoice}
                disabled={duesCalculation.totalOutstanding <= 0}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer shadow-xs uppercase tracking-wider shrink-0"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Invoice ({formatLKR(duesCalculation.totalOutstanding)})</span>
              </button>
            </div>
          </div>
        </div>
      ) : hasSearched ? (
        /* Empty State when searched and not found */
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="w-12 h-12 bg-rose-50 text-[#A31736] rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
            No Property Found
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            We could not find any property registered under assessment number &ldquo;{searchInput}&rdquo;. Please verify the assessment number formatting (e.g. 78/12a, 45/2) or pick one of the sample numbers above.
          </p>
          <button
            type="button"
            onClick={() => handleQuickSelect('78/12a')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#A31736] hover:bg-rose-50 border border-[#A31736] rounded-xl transition-all cursor-pointer uppercase tracking-wider"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load Sample 78/12a</span>
          </button>
        </div>
      ) : null}

      {/* Invoice Preview Modal */}
      <InvoiceModal
        payment={generatedInvoice}
        isOpen={generatedInvoice !== null}
        onClose={() => setGeneratedInvoice(null)}
        onMarkPaid={(id) => {
          updatePaymentStatus(id, 'Paid')
          if (generatedInvoice && generatedInvoice.id === id) {
            setGeneratedInvoice({ ...generatedInvoice, status: 'Paid' })
          }
        }}
      />
    </div>
  )
}

export default VaripanamCollectionPage
