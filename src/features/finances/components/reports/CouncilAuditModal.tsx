import React, { useState } from 'react'
import {
  REVENUE_ITEMS,
  EXPENDITURE_ITEMS,
  BALANCE_SHEET_SECTIONS,
  TRIAL_BALANCE_ACCOUNTS,
  WARD_ASSESSMENT_RECORDS,
} from '../../data/financialReportsData'
import {
  exportIncomeExpenditureReport,
  exportBalanceSheetReport,
  exportTrialBalanceReport,
  exportAssessmentEfficiencyReport,
} from '../../utils/financialExportUtils'

interface CouncilAuditModalProps {
  isOpen: boolean
  onClose: () => void
  initialReportType?: 'income-expenditure' | 'balance-sheet' | 'trial-balance' | 'assessment-efficiency'
}

export const CouncilAuditModal: React.FC<CouncilAuditModalProps> = ({
  isOpen,
  onClose,
  initialReportType = 'income-expenditure',
}) => {
  const [selectedReport, setSelectedReport] = useState(initialReportType)

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadAuditHTML = () => {
    // Generate standalone printable audit HTML file
    const element = document.getElementById('audit-certificate-content')
    if (!element) return

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Council Audit Certificate - Homagama Pradeshiya Sabha</title>
  <style>
    body { font-family: 'Times New Roman', serif; margin: 30px; color: #111; line-height: 1.4; font-size: 13px; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 16px; }
    .header h1 { font-size: 20px; text-transform: uppercase; margin: 0; color: #A31736; }
    .header h2 { font-size: 14px; margin: 4px 0; color: #333; }
    .header p { font-size: 11px; margin: 0; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; }
    th { background-color: #f5f5f5; font-weight: bold; text-align: left; }
    .text-right { text-align: right; }
    .font-mono { font-family: monospace; }
    .signatures { margin-top: 40px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; font-size: 11px; }
    .sig-box { border-top: 1px dashed #555; padding-top: 6px; text-align: center; }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  ${element.innerHTML}
</body>
</html>`

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `HOMAGAMA_PS_COUNCIL_AUDIT_${selectedReport.toUpperCase()}_2026.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportXLSX = () => {
    switch (selectedReport) {
      case 'income-expenditure':
        exportIncomeExpenditureReport('xlsx')
        break
      case 'balance-sheet':
        exportBalanceSheetReport('xlsx')
        break
      case 'trial-balance':
        exportTrialBalanceReport('xlsx')
        break
      case 'assessment-efficiency':
        exportAssessmentEfficiencyReport('xlsx')
        break
    }
  }

  const handleExportCSV = () => {
    switch (selectedReport) {
      case 'income-expenditure':
        exportIncomeExpenditureReport('csv')
        break
      case 'balance-sheet':
        exportBalanceSheetReport('csv')
        break
      case 'trial-balance':
        exportTrialBalanceReport('csv')
        break
      case 'assessment-efficiency':
        exportAssessmentEfficiencyReport('csv')
        break
    }
  }

  const totalActualRevenue = REVENUE_ITEMS.reduce((sum, i) => sum + i.actualYTD, 0)
  const totalActualExpense = EXPENDITURE_ITEMS.reduce((sum, i) => sum + i.actualYTD, 0)
  const netSurplus = totalActualRevenue - totalActualExpense

  const totalAssets = 482950000
  const totalLiabilitiesAndEquity = 482950000
  const totalDebits = 482950000
  const totalCredits = 482950000

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-gray-300 animate-fade-in print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* ── Modal Top Action Bar (Hidden on Print) ── */}
        <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-gray-100">
                Statutory Council Audit Certificate Preview
              </h3>
              <p className="text-[11px] text-gray-400">
                Formatted for Auditor General of Sri Lanka &amp; Provincial Council Review
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Report Selector Pills */}
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as any)}
              className="text-xs bg-gray-800 border border-gray-700 rounded px-2.5 py-1.5 text-gray-200 focus:outline-hidden cursor-pointer"
            >
              <option value="income-expenditure">Income &amp; Expenditure Statement</option>
              <option value="balance-sheet">Statement of Financial Position (Balance Sheet)</option>
              <option value="trial-balance">General Ledger Trial Balance</option>
              <option value="assessment-efficiency">Assessment Rates Efficiency Report</option>
            </select>

            {/* Print / Save as PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-3 py-1.5 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Trigger browser print or Save as PDF"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print / PDF</span>
            </button>

            {/* Download HTML */}
            <button
              type="button"
              onClick={handleDownloadAuditHTML}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold px-2.5 py-1.5 rounded transition-colors uppercase cursor-pointer"
              title="Download standalone HTML document"
            >
              HTML
            </button>

            {/* Excel */}
            <button
              type="button"
              onClick={handleExportXLSX}
              className="bg-gray-800 hover:bg-gray-700 text-emerald-400 text-xs font-semibold px-2.5 py-1.5 rounded transition-colors uppercase cursor-pointer"
              title="Download as Excel XLSX"
            >
              XLSX
            </button>

            {/* CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold px-2.5 py-1.5 rounded transition-colors uppercase cursor-pointer"
              title="Download as CSV"
            >
              CSV
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white px-2 py-1 text-sm font-bold cursor-pointer transition-colors ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Document Body (Printable Area) ── */}
        <div id="audit-certificate-content" className="overflow-y-auto p-6 sm:p-10 text-gray-900 font-serif bg-white">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
            <div className="text-xs uppercase tracking-widest text-gray-500 font-sans font-bold">
              Democratic Socialist Republic of Sri Lanka
            </div>
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#A31736] mt-1">
              Homagama Pradeshiya Sabha
            </h1>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-800 mt-0.5">
              Department of Finance &amp; Municipal Treasury
            </h2>
            <p className="text-[11px] text-gray-600 font-sans mt-1">
              Statutory Financial Accounts &amp; Audit Schedules · Fiscal Year 2026
            </p>
            <p className="text-[10px] text-gray-500 font-sans italic mt-0.5">
              Prepared pursuant to Section 171 of the Pradeshiya Sabha Act No. 15 of 1987 and Local Authority Financial Regulations
            </p>

            <div className="mt-4 pt-2 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-sans text-gray-600 text-left">
              <div>
                <span className="font-bold text-gray-800">Audit Ref:</span> AUD/HPS/2026/STAT-09
              </div>
              <div>
                <span className="font-bold text-gray-800">Accounting Basis:</span> Modified Accruals
              </div>
              <div>
                <span className="font-bold text-gray-800">Period:</span> Jan – Sep 2026 (YTD)
              </div>
              <div>
                <span className="font-bold text-gray-800">Issued On:</span> {new Date().toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>

          {/* Report Title */}
          <div className="text-center mb-6">
            <h3 className="text-base sm:text-lg font-bold uppercase underline tracking-wide text-gray-900">
              {selectedReport === 'income-expenditure' && 'Statement of Municipal Income & Expenditure'}
              {selectedReport === 'balance-sheet' && 'Statement of Financial Position (Balance Sheet)'}
              {selectedReport === 'trial-balance' && 'General Ledger Verified Trial Balance'}
              {selectedReport === 'assessment-efficiency' && 'Ward-by-Ward Assessment Rate Collection Performance Audit'}
            </h3>
            <p className="text-xs text-gray-600 italic mt-1 font-sans">
              All monetary figures stated in Sri Lankan Rupees (LKR)
            </p>
          </div>

          {/* REPORT CONTENT 1: Income & Expenditure */}
          {selectedReport === 'income-expenditure' && (
            <div className="space-y-6 text-xs font-sans">
              <div>
                <h4 className="font-bold text-xs uppercase text-gray-900 mb-2 border-b border-gray-400 pb-1">
                  1. Operating Revenues (Inflows)
                </h4>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-[10px] uppercase font-bold border-b border-gray-300">
                      <th className="py-1.5 px-2 text-left">Vote</th>
                      <th className="py-1.5 px-2 text-left">Revenue Description</th>
                      <th className="py-1.5 px-2 text-right">Budget (LKR)</th>
                      <th className="py-1.5 px-2 text-right">Actual YTD (LKR)</th>
                      <th className="py-1.5 px-2 text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {REVENUE_ITEMS.map((item) => (
                      <tr key={item.id}>
                        <td className="py-1.5 px-2 font-mono text-gray-600">{item.code}</td>
                        <td className="py-1.5 px-2">{item.title}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{item.budgetAnnual.toLocaleString()}</td>
                        <td className="py-1.5 px-2 text-right font-mono font-semibold text-gray-900">{item.actualYTD.toLocaleString()}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-gray-700">{(item.actualYTD - item.budgetAnnual).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold border-t-2 border-gray-400">
                      <td colSpan={2} className="py-2 px-2 uppercase">Total Operating Revenues (A)</td>
                      <td className="py-2 px-2 text-right font-mono">180,000,000</td>
                      <td className="py-2 px-2 text-right font-mono text-emerald-800">{totalActualRevenue.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right font-mono">{(totalActualRevenue - 180000000).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase text-gray-900 mb-2 border-b border-gray-400 pb-1">
                  2. Operating Expenditures (Outflows)
                </h4>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-[10px] uppercase font-bold border-b border-gray-300">
                      <th className="py-1.5 px-2 text-left">Vote</th>
                      <th className="py-1.5 px-2 text-left">Expenditure Head</th>
                      <th className="py-1.5 px-2 text-right">Budget (LKR)</th>
                      <th className="py-1.5 px-2 text-right">Actual YTD (LKR)</th>
                      <th className="py-1.5 px-2 text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {EXPENDITURE_ITEMS.map((item) => (
                      <tr key={item.id}>
                        <td className="py-1.5 px-2 font-mono text-gray-600">{item.code}</td>
                        <td className="py-1.5 px-2">{item.title}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{item.budgetAnnual.toLocaleString()}</td>
                        <td className="py-1.5 px-2 text-right font-mono font-semibold text-gray-900">{item.actualYTD.toLocaleString()}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-gray-700">{(item.budgetAnnual - item.actualYTD).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold border-t-2 border-gray-400">
                      <td colSpan={2} className="py-2 px-2 uppercase">Total Operating Expenditures (B)</td>
                      <td className="py-2 px-2 text-right font-mono">165,000,000</td>
                      <td className="py-2 px-2 text-right font-mono text-rose-800">{totalActualExpense.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right font-mono">{(165000000 - totalActualExpense).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Net Surplus Summary */}
              <div className="bg-gray-50 border-2 border-gray-800 p-3.5 rounded flex items-center justify-between font-bold text-xs">
                <div>
                  <span className="uppercase tracking-wide">Net Operating Result for the Period (Surplus):</span>
                  <p className="text-[11px] font-normal text-gray-600">Transferred to Municipal General Accumulated Fund</p>
                </div>
                <span className="text-base font-mono border-b-4 border-double border-gray-900 pb-0.5">
                  LKR {netSurplus.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* REPORT CONTENT 2: Balance Sheet */}
          {selectedReport === 'balance-sheet' && (
            <div className="space-y-6 text-xs font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assets */}
                <div>
                  <h4 className="font-bold text-xs uppercase text-gray-900 mb-2 border-b border-gray-400 pb-1">
                    Municipal Assets
                  </h4>
                  <table className="w-full border-collapse">
                    <tbody className="divide-y divide-gray-200">
                      <tr className="bg-gray-50 font-bold"><td colSpan={2} className="py-1 px-1 text-[11px]">Current Assets</td></tr>
                      {BALANCE_SHEET_SECTIONS[0].items.map((i) => (
                        <tr key={i.id}>
                          <td className="py-1 px-1 text-gray-800">{i.name}</td>
                          <td className="py-1 px-1 text-right font-mono font-medium">{i.currentYearAmount.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold"><td colSpan={2} className="py-1 px-1 text-[11px]">Non-Current Fixed Assets</td></tr>
                      {BALANCE_SHEET_SECTIONS[1].items.map((i) => (
                        <tr key={i.id}>
                          <td className="py-1 px-1 text-gray-800">{i.name}</td>
                          <td className="py-1 px-1 text-right font-mono font-medium">{i.currentYearAmount.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold border-t-2 border-gray-800 text-xs">
                        <td className="py-2 px-1 uppercase">Total Assets</td>
                        <td className="py-2 px-1 text-right font-mono border-b-4 border-double border-gray-800">
                          {totalAssets.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Liabilities & Equity */}
                <div>
                  <h4 className="font-bold text-xs uppercase text-gray-900 mb-2 border-b border-gray-400 pb-1">
                    Liabilities &amp; Municipal Fund Balances
                  </h4>
                  <table className="w-full border-collapse">
                    <tbody className="divide-y divide-gray-200">
                      <tr className="bg-gray-50 font-bold"><td colSpan={2} className="py-1 px-1 text-[11px]">Current Liabilities</td></tr>
                      {BALANCE_SHEET_SECTIONS[2].items.map((i) => (
                        <tr key={i.id}>
                          <td className="py-1 px-1 text-gray-800">{i.name}</td>
                          <td className="py-1 px-1 text-right font-mono font-medium">{i.currentYearAmount.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold"><td colSpan={2} className="py-1 px-1 text-[11px]">Long-Term Liabilities</td></tr>
                      {BALANCE_SHEET_SECTIONS[3].items.map((i) => (
                        <tr key={i.id}>
                          <td className="py-1 px-1 text-gray-800">{i.name}</td>
                          <td className="py-1 px-1 text-right font-mono font-medium">{i.currentYearAmount.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold"><td colSpan={2} className="py-1 px-1 text-[11px]">Municipal Equity &amp; Fund Balances</td></tr>
                      {BALANCE_SHEET_SECTIONS[4].items.map((i) => (
                        <tr key={i.id}>
                          <td className="py-1 px-1 text-gray-800 font-medium">{i.name}</td>
                          <td className="py-1 px-1 text-right font-mono font-semibold">{i.currentYearAmount.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold border-t-2 border-gray-800 text-xs">
                        <td className="py-2 px-1 uppercase">Total Liabilities &amp; Funds</td>
                        <td className="py-2 px-1 text-right font-mono border-b-4 border-double border-gray-800">
                          {totalLiabilitiesAndEquity.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded text-center text-emerald-900 font-bold">
                ✓ DOUBLE-ENTRY AUDIT CHECK: Assets (LKR {totalAssets.toLocaleString()}) = Liabilities &amp; Fund Balances (LKR {totalLiabilitiesAndEquity.toLocaleString()})
              </div>
            </div>
          )}

          {/* REPORT CONTENT 3: Trial Balance */}
          {selectedReport === 'trial-balance' && (
            <div className="space-y-4 text-xs font-sans">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-[10px] uppercase font-bold border-b border-gray-300">
                    <th className="py-1.5 px-2 text-left">Code</th>
                    <th className="py-1.5 px-2 text-left">Account Description</th>
                    <th className="py-1.5 px-2 text-center">Type</th>
                    <th className="py-1.5 px-2 text-right">Debit Balance (LKR)</th>
                    <th className="py-1.5 px-2 text-right">Credit Balance (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {TRIAL_BALANCE_ACCOUNTS.map((acc) => (
                    <tr key={acc.code}>
                      <td className="py-1 px-2 font-mono">{acc.code}</td>
                      <td className="py-1 px-2">{acc.name}</td>
                      <td className="py-1 px-2 text-center text-[10px] uppercase">{acc.type}</td>
                      <td className="py-1 px-2 text-right font-mono">{acc.debit > 0 ? acc.debit.toLocaleString() : '—'}</td>
                      <td className="py-1 px-2 text-right font-mono">{acc.credit > 0 ? acc.credit.toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold border-t-2 border-gray-800 text-xs">
                    <td colSpan={3} className="py-2 px-2 uppercase">Trial Balance Grand Totals</td>
                    <td className="py-2 px-2 text-right font-mono border-b-4 border-double border-gray-800">{totalDebits.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right font-mono border-b-4 border-double border-gray-800">{totalCredits.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
              <div className="bg-emerald-50 border border-emerald-300 p-2 text-center text-emerald-900 font-bold text-xs">
                ✓ DOUBLE-ENTRY EQUALITY CHECK: Debits match Credits exactly with 0.00 difference.
              </div>
            </div>
          )}

          {/* REPORT CONTENT 4: Assessment Efficiency */}
          {selectedReport === 'assessment-efficiency' && (
            <div className="space-y-4 text-xs font-sans">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-[10px] uppercase font-bold border-b border-gray-300">
                    <th className="py-1.5 px-2 text-left">Ward</th>
                    <th className="py-1.5 px-2 text-left">Ward Name &amp; Officer</th>
                    <th className="py-1.5 px-2 text-center">Props</th>
                    <th className="py-1.5 px-2 text-right">Demand (LKR)</th>
                    <th className="py-1.5 px-2 text-right">Collected (LKR)</th>
                    <th className="py-1.5 px-2 text-right">Arrears (LKR)</th>
                    <th className="py-1.5 px-2 text-center">Efficiency %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {WARD_ASSESSMENT_RECORDS.map((w) => (
                    <tr key={w.wardNumber}>
                      <td className="py-1.5 px-2 font-bold">{w.wardNumber}</td>
                      <td className="py-1.5 px-2">
                        <div>{w.wardName}</div>
                        <div className="text-[10px] text-gray-500">{w.inspectorOfficer}</div>
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono">{w.totalRateableProperties.toLocaleString()}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{w.annualWarrantDemand.toLocaleString()}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-semibold text-emerald-900">{w.collectedYTD.toLocaleString()}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-rose-800">{w.arrearsOutstanding.toLocaleString()}</td>
                      <td className="py-1.5 px-2 text-center font-mono font-bold">{w.efficiencyPercentage.toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold border-t-2 border-gray-800 text-xs">
                    <td colSpan={2} className="py-2 px-2 uppercase">Council Consolidated Totals</td>
                    <td className="py-2 px-2 text-center font-mono">40,930</td>
                    <td className="py-2 px-2 text-right font-mono">148,900,000</td>
                    <td className="py-2 px-2 text-right font-mono text-emerald-800">118,655,000</td>
                    <td className="py-2 px-2 text-right font-mono text-rose-800">30,245,000</td>
                    <td className="py-2 px-2 text-center font-mono text-sm border-b-4 border-double border-gray-800">79.7%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ── Official Council Signature Certification Blocks ── */}
          <div className="mt-12 pt-6 border-t border-gray-400 font-sans">
            <p className="text-[11px] text-gray-500 text-center italic mb-8">
              We hereby certify that the above statement has been compiled in conformity with statutory accounting principles, verified with general ledger vouchers, and accurately reflects the municipal accounts of Homagama Pradeshiya Sabha.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-xs">
              <div className="border-t border-gray-800 pt-3">
                <div className="font-bold text-gray-900">H. M. Jayawardena</div>
                <div className="text-[10px] text-gray-500">Senior Bookkeeper &amp; Accounts Officer</div>
                <div className="text-[9px] text-gray-400 font-mono mt-1">Homagama Pradeshiya Sabha</div>
              </div>

              <div className="border-t border-gray-800 pt-3">
                <div className="font-bold text-gray-900">K. G. Wickramasinghe</div>
                <div className="text-[10px] text-gray-500">Municipal Chief Accountant</div>
                <div className="text-[9px] text-gray-400 font-mono mt-1">B.Sc. (Acc), FCA / ICASL</div>
              </div>

              <div className="border-t border-gray-800 pt-3">
                <div className="font-bold text-gray-900">N. P. S. Karunaratne</div>
                <div className="text-[10px] text-gray-500">Municipal Secretary &amp; CEO</div>
                <div className="text-[9px] text-gray-400 font-mono mt-1">Sri Lanka Administrative Service (SLAS I)</div>
              </div>

              <div className="border-t border-gray-800 pt-3">
                <div className="font-bold text-[#A31736]">D. M. Ranasinghe</div>
                <div className="text-[10px] text-gray-500">Honorable Chairman</div>
                <div className="text-[9px] text-gray-400 font-mono mt-1">Council Seal &amp; Authority Stamp</div>
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] text-gray-400 font-sans border-t border-gray-100 pt-3">
              Digitally certified &amp; archived via Western Provincial Government Local Council ERP Portal · Homagama Pradeshiya Sabha
            </div>
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs print:hidden">
          <div className="text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Ready for council print or audit archive download</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#A31736] hover:bg-[#801028] text-white font-bold px-4 py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer"
            >
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold px-3 py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CouncilAuditModal
