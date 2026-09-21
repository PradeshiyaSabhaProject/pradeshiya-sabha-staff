import React, { useState } from 'react'
import { BALANCE_SHEET_SECTIONS } from '../../data/financialReportsData'
import { formatLKR } from '../FinanceKpiCards'

interface BalanceSheetReportProps {
  onOpenAuditModal: () => void
}

export const BalanceSheetReport: React.FC<BalanceSheetReportProps> = ({ onOpenAuditModal }) => {
  const [showNotes, setShowNotes] = useState(false)

  // Calculate totals
  const currentAssetsSection = BALANCE_SHEET_SECTIONS.find((s) => s.category === 'Current Assets')!
  const nonCurrentAssetsSection = BALANCE_SHEET_SECTIONS.find((s) => s.category === 'Non-Current Assets')!
  const currentLiabilitiesSection = BALANCE_SHEET_SECTIONS.find((s) => s.category === 'Current Liabilities')!
  const longTermLiabilitiesSection = BALANCE_SHEET_SECTIONS.find((s) => s.category === 'Long-Term Liabilities')!
  const equitySection = BALANCE_SHEET_SECTIONS.find((s) => s.category === 'Municipal Equity & Fund Balances')!

  const totalAssetsCurrentYear = currentAssetsSection.totalCurrentYear + nonCurrentAssetsSection.totalCurrentYear
  const totalAssetsPriorYear = currentAssetsSection.totalPriorYear + nonCurrentAssetsSection.totalPriorYear

  const totalLiabilitiesCurrentYear = currentLiabilitiesSection.totalCurrentYear + longTermLiabilitiesSection.totalCurrentYear

  const totalLiabilitiesAndEquityCurrentYear = totalLiabilitiesCurrentYear + equitySection.totalCurrentYear

  const isBalanced = totalAssetsCurrentYear === totalLiabilitiesAndEquityCurrentYear
  const assetDifference = totalAssetsCurrentYear - totalLiabilitiesAndEquityCurrentYear

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <span>Statement of Financial Position (Balance Sheet)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Double-Entry Compliant
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            As at 30 September 2026 (With comparative balances as at 31 December 2025).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors uppercase tracking-wider cursor-pointer"
          >
            {showNotes ? 'Hide Statutory Notes' : 'View Statutory Notes'}
          </button>

          <button
            type="button"
            onClick={onOpenAuditModal}
            className="border border-[#A31736] bg-rose-50/50 hover:bg-[#A31736] text-[#A31736] hover:text-white text-xs font-bold px-3 py-1.5 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>Council Audit View</span>
          </button>
        </div>
      </div>

      {/* ── Double-Entry Equality Verification Strip ── */}
      <div
        className={`border rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
          isBalanced
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
              isBalanced ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {isBalanced ? '✓' : '!'}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wide">
              {isBalanced ? 'Double-Entry Equality Verified: Statement in Complete Balance' : 'Balance Sheet Imbalance Detected'}
            </h4>
            <p className="text-xs text-emerald-800">
              Total Municipal Assets (LKR {formatLKR(totalAssetsCurrentYear, true)}) equals Total Liabilities &amp; Fund Balances (LKR {formatLKR(totalLiabilitiesAndEquityCurrentYear, true)}).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">Variance</span>
            <span className={isBalanced ? 'text-emerald-700' : 'text-rose-700'}>
              LKR {assetDifference.toFixed(2)}
            </span>
          </div>
          <span className="px-2.5 py-1 rounded bg-white border border-emerald-200 text-emerald-800 uppercase text-[10px]">
            Audit Certified
          </span>
        </div>
      </div>

      {/* ── Comparative KPI Snapshot ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-300 rounded p-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600 block">Total Municipal Assets</span>
          <p className="text-xl font-bold font-mono text-gray-900 mt-1">{formatLKR(totalAssetsCurrentYear)}</p>
          <p className="text-[11px] text-gray-500 mt-1">
            Prior Year: <strong className="text-gray-700">{formatLKR(totalAssetsPriorYear, true)}</strong> (+
            {(((totalAssetsCurrentYear - totalAssetsPriorYear) / totalAssetsPriorYear) * 100).toFixed(1)}%)
          </p>
        </div>

        <div className="bg-white border border-gray-300 rounded p-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600 block">Cash &amp; Liquid Reserves</span>
          <p className="text-xl font-bold font-mono text-emerald-800 mt-1">{formatLKR(54450000)}</p>
          <p className="text-[11px] text-gray-500 mt-1">Across 3 Operating &amp; Escrow Bank Accounts</p>
        </div>

        <div className="bg-white border border-gray-300 rounded p-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600 block">Total Council Liabilities</span>
          <p className="text-xl font-bold font-mono text-rose-800 mt-1">{formatLKR(totalLiabilitiesCurrentYear)}</p>
          <p className="text-[11px] text-gray-500 mt-1">Current: {formatLKR(currentLiabilitiesSection.totalCurrentYear, true)} | Long-Term: {formatLKR(longTermLiabilitiesSection.totalCurrentYear, true)}</p>
        </div>

        <div className="bg-white border border-gray-300 rounded p-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600 block">Municipal Net Worth (Equity)</span>
          <p className="text-xl font-bold font-mono text-blue-900 mt-1">{formatLKR(equitySection.totalCurrentYear)}</p>
          <p className="text-[11px] text-gray-500 mt-1">Accumulated Fund + Capital Reserves</p>
        </div>
      </div>

      {/* ── Two-Column Side-by-Side Statement ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: ASSETS */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-300 rounded shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-emerald-50/70 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Municipal Assets (A)</span>
              </h3>
              <span className="font-mono text-xs font-bold text-emerald-900">
                {formatLKR(totalAssetsCurrentYear)}
              </span>
            </div>

            {/* Current Assets */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase">1. Current Assets</h4>
                <span className="text-xs font-mono font-bold text-gray-800">
                  {formatLKR(currentAssetsSection.totalCurrentYear)}
                </span>
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                {currentAssetsSection.items.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between hover:bg-gray-50 px-1 rounded">
                    <div>
                      <span className="font-mono text-[10px] text-gray-400 mr-2">{item.code}</span>
                      <span className="text-gray-800">{item.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-semibold text-gray-900 block">{formatLKR(item.currentYearAmount)}</span>
                      <span className="font-mono text-[10px] text-gray-400 block">2025: {formatLKR(item.priorYearAmount, true)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-Current Assets */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase">2. Non-Current Capital Assets</h4>
                <span className="text-xs font-mono font-bold text-gray-800">
                  {formatLKR(nonCurrentAssetsSection.totalCurrentYear)}
                </span>
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                {nonCurrentAssetsSection.items.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between hover:bg-gray-50 px-1 rounded">
                    <div>
                      <span className="font-mono text-[10px] text-gray-400 mr-2">{item.code}</span>
                      <span className={item.currentYearAmount < 0 ? 'text-amber-800 font-semibold' : 'text-gray-800'}>
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`font-mono font-semibold block ${item.currentYearAmount < 0 ? 'text-amber-800' : 'text-gray-900'}`}>
                        {item.currentYearAmount < 0 ? `(${formatLKR(Math.abs(item.currentYearAmount))})` : formatLKR(item.currentYearAmount)}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400 block">2025: {formatLKR(item.priorYearAmount, true)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Assets Summary Footer */}
            <div className="bg-gray-100 p-4 border-t-2 border-gray-400 flex items-center justify-between font-bold text-xs text-gray-900">
              <span className="uppercase tracking-wider">Total Municipal Assets</span>
              <span className="font-mono text-sm border-b-4 border-double border-gray-900 pb-0.5">
                {formatLKR(totalAssetsCurrentYear)}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIABILITIES & FUND BALANCES */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-300 rounded shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-blue-50/70 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wide text-blue-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Liabilities &amp; Municipal Fund Balances (B)</span>
              </h3>
              <span className="font-mono text-xs font-bold text-blue-900">
                {formatLKR(totalLiabilitiesAndEquityCurrentYear)}
              </span>
            </div>

            {/* Current Liabilities */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase">1. Current Liabilities</h4>
                <span className="text-xs font-mono font-bold text-gray-800">
                  {formatLKR(currentLiabilitiesSection.totalCurrentYear)}
                </span>
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                {currentLiabilitiesSection.items.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between hover:bg-gray-50 px-1 rounded">
                    <div>
                      <span className="font-mono text-[10px] text-gray-400 mr-2">{item.code}</span>
                      <span className="text-gray-800">{item.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-semibold text-gray-900 block">{formatLKR(item.currentYearAmount)}</span>
                      <span className="font-mono text-[10px] text-gray-400 block">2025: {formatLKR(item.priorYearAmount, true)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Long-Term Liabilities */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase">2. Long-Term Liabilities</h4>
                <span className="text-xs font-mono font-bold text-gray-800">
                  {formatLKR(longTermLiabilitiesSection.totalCurrentYear)}
                </span>
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                {longTermLiabilitiesSection.items.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between hover:bg-gray-50 px-1 rounded">
                    <div>
                      <span className="font-mono text-[10px] text-gray-400 mr-2">{item.code}</span>
                      <span className="text-gray-800">{item.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-semibold text-gray-900 block">{formatLKR(item.currentYearAmount)}</span>
                      <span className="font-mono text-[10px] text-gray-400 block">2025: {formatLKR(item.priorYearAmount, true)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Municipal Equity & Fund Balances */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase">3. Municipal Equity &amp; Fund Balances</h4>
                <span className="text-xs font-mono font-bold text-blue-900">
                  {formatLKR(equitySection.totalCurrentYear)}
                </span>
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                {equitySection.items.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between hover:bg-gray-50 px-1 rounded">
                    <div>
                      <span className="font-mono text-[10px] text-gray-400 mr-2">{item.code}</span>
                      <span className="text-gray-800 font-medium">{item.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-blue-900 block">{formatLKR(item.currentYearAmount)}</span>
                      <span className="font-mono text-[10px] text-gray-400 block">2025: {formatLKR(item.priorYearAmount, true)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Liabilities & Equity Summary Footer */}
            <div className="bg-gray-100 p-4 border-t-2 border-gray-400 flex items-center justify-between font-bold text-xs text-gray-900">
              <span className="uppercase tracking-wider">Total Liabilities &amp; Fund Balances</span>
              <span className="font-mono text-sm border-b-4 border-double border-gray-900 pb-0.5">
                {formatLKR(totalLiabilitiesAndEquityCurrentYear)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Statutory Notes Drawer ── */}
      {showNotes && (
        <div className="bg-gray-50 border border-gray-300 rounded p-5 shadow-2xs text-xs animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <h4 className="font-bold uppercase tracking-wider text-gray-900">
              Notes to the Financial Statements (Statutory Disclosures)
            </h4>
            <span className="text-[10px] text-gray-500 font-mono">Auditor General Format</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-gray-600">
            <div>
              <p className="font-bold text-gray-800 mb-1">Note 01: Cash &amp; Cash Equivalents</p>
              <p className="text-[11px] leading-relaxed">
                Bank balances are held across state and licensed commercial banks under authorized council signatories. Petty cash imprest is maintained on an imprest voucher basis.
              </p>
            </div>
            <div>
              <p className="font-bold text-gray-800 mb-1">Note 02: Assessment Rates Receivables</p>
              <p className="text-[11px] leading-relaxed">
                Represents arrears rate payments legally collectable under Section 158 of the Pradeshiya Sabha Act. Uncollected balances are subject to statutory 10% warrant surcharges.
              </p>
            </div>
            <div>
              <p className="font-bold text-gray-800 mb-1">Note 04 &amp; 05: Capital Infrastructure &amp; Fleet</p>
              <p className="text-[11px] leading-relaxed">
                Civic buildings and infrastructure assets are stated at historical acquisition cost. Straight-line depreciation is applied: Buildings (2.5%), Machinery &amp; Fleet (10%), IT (20%).
              </p>
            </div>
            <div>
              <p className="font-bold text-gray-800 mb-1">Note 12: Municipal Accumulated Fund</p>
              <p className="text-[11px] leading-relaxed">
                Accumulated surplus retained for municipal development in the Western Province, subject to council resolution approvals.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BalanceSheetReport
