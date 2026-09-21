import React, { useState } from 'react'
import IncomeExpenditureReport from '../components/reports/IncomeExpenditureReport'
import BalanceSheetReport from '../components/reports/BalanceSheetReport'
import TrialBalanceReport from '../components/reports/TrialBalanceReport'
import AssessmentEfficiencyReport from '../components/reports/AssessmentEfficiencyReport'
import CouncilAuditModal from '../components/reports/CouncilAuditModal'
import {
  exportIncomeExpenditureReport,
  exportBalanceSheetReport,
  exportTrialBalanceReport,
  exportAssessmentEfficiencyReport,
  exportAllReportsWorkbook,
} from '../utils/financialExportUtils'

type ReportTab = 'income-expenditure' | 'balance-sheet' | 'trial-balance' | 'assessment-efficiency'

export const FinancialReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('income-expenditure')
  const [period, setPeriod] = useState<'YTD' | 'Q1' | 'Q2' | 'Q3' | 'FY2025'>('YTD')
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setNotice(msg)
    window.setTimeout(() => setNotice(null), 3500)
  }

  // 1-click Download as PDF (Opens audit dialog formatted for council audit)
  const handleDownloadPDF = () => {
    setIsAuditModalOpen(true)
    showNotification('Council Audit Certificate loaded. Click "Print / Save PDF" to generate statutory PDF.')
  }

  // 1-click Download as Excel (XLSX)
  const handleDownloadExcel = () => {
    switch (activeTab) {
      case 'income-expenditure':
        exportIncomeExpenditureReport('xlsx', period)
        showNotification('Income & Expenditure Statement exported as Excel XLSX.')
        break
      case 'balance-sheet':
        exportBalanceSheetReport('xlsx')
        showNotification('Balance Sheet (Statement of Financial Position) exported as Excel XLSX.')
        break
      case 'trial-balance':
        exportTrialBalanceReport('xlsx')
        showNotification('General Ledger Trial Balance exported as Excel XLSX.')
        break
      case 'assessment-efficiency':
        exportAssessmentEfficiencyReport('xlsx')
        showNotification('Ward Assessment Collection Efficiency Report exported as Excel XLSX.')
        break
    }
  }

  // 1-click Download as CSV
  const handleDownloadCSV = () => {
    switch (activeTab) {
      case 'income-expenditure':
        exportIncomeExpenditureReport('csv', period)
        showNotification('Income & Expenditure Statement exported as CSV.')
        break
      case 'balance-sheet':
        exportBalanceSheetReport('csv')
        showNotification('Balance Sheet exported as CSV.')
        break
      case 'trial-balance':
        exportTrialBalanceReport('csv')
        showNotification('Trial Balance exported as CSV.')
        break
      case 'assessment-efficiency':
        exportAssessmentEfficiencyReport('csv')
        showNotification('Assessment Efficiency Report exported as CSV.')
        break
    }
  }

  // Download entire statutory bundle
  const handleDownloadAllBundle = () => {
    exportAllReportsWorkbook()
    showNotification('Complete Statutory Financial Accounts Workbook (all 4 statements) downloaded as Excel XLSX.')
  }

  return (
    <div className="space-y-6 text-left pb-10 animate-fade-in">
      {/* ── 1. Page Header (Government Standard) ─────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A31736]">
            <span className="w-2 h-2 rounded-full bg-[#A31736]" /> Finance Management / Statutory Reporting
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase mt-1">
            Financial Reports &amp; Statements
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Statutory accounts for Homagama Pradeshiya Sabha: Income &amp; Expenditure, Statement of Financial Position, Trial Balance, and Ward Collection Performance.
          </p>
        </div>

        {/* Action Toolbar: One-Click Downloads for PDF, Excel (XLSX), CSV */}
        <div className="flex flex-wrap items-center gap-2">
          {/* PDF Audit Download */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-3 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Download formatted for Council Audit as PDF"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <span>Download PDF (Audit)</span>
          </button>

          {/* Excel XLSX Download */}
          <button
            type="button"
            onClick={handleDownloadExcel}
            className="border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Download active report as formatted Excel XLSX"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-emerald-700">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M8 13h8M8 17h8M10 9h4" />
            </svg>
            <span>Excel (XLSX)</span>
          </button>

          {/* CSV Download */}
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Download raw statement data as CSV"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-500">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>CSV</span>
          </button>

          {/* Complete Bundle XLSX */}
          <button
            type="button"
            onClick={handleDownloadAllBundle}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Download all 4 reports in a single multi-worksheet Excel workbook"
          >
            <span>📦 Full Bundle</span>
          </button>
        </div>
      </div>

      {/* ── Notification Banner ── */}
      {notice && (
        <div
          className="border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-2.5 rounded text-xs font-semibold flex items-center justify-between shadow-2xs"
          role="status"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 2. Report Sub-Section Tab Navigation ──────────────────────────── */}
      <div className="border-b border-gray-300 bg-white rounded-t shadow-2xs px-2 sm:px-4">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto" aria-label="Financial Reports Tabs">
          {[
            {
              id: 'income-expenditure',
              label: 'Income & Expenditure',
              badge: 'Surplus / Deficit',
            },
            {
              id: 'balance-sheet',
              label: 'Balance Sheet',
              badge: 'Financial Position',
            },
            {
              id: 'trial-balance',
              label: 'Trial Balance',
              badge: 'Debit = Credit',
            },
            {
              id: 'assessment-efficiency',
              label: 'Assessment Efficiency',
              badge: 'Ward Performance',
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ReportTab)}
                className={`py-3.5 px-3 border-b-2 font-bold text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 ${
                  isActive
                    ? 'border-[#A31736] text-[#A31736]'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-normal transition-colors ${
                    isActive
                      ? 'bg-rose-50 text-[#A31736] font-bold border border-rose-200'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* ── 3. Active Report Content ──────────────────────────────────────── */}
      <main>
        {activeTab === 'income-expenditure' && (
          <IncomeExpenditureReport
            period={period}
            onPeriodChange={setPeriod}
            onOpenAuditModal={() => setIsAuditModalOpen(true)}
          />
        )}

        {activeTab === 'balance-sheet' && (
          <BalanceSheetReport onOpenAuditModal={() => setIsAuditModalOpen(true)} />
        )}

        {activeTab === 'trial-balance' && (
          <TrialBalanceReport onOpenAuditModal={() => setIsAuditModalOpen(true)} />
        )}

        {activeTab === 'assessment-efficiency' && (
          <AssessmentEfficiencyReport onOpenAuditModal={() => setIsAuditModalOpen(true)} />
        )}
      </main>

      {/* ── 4. Council Audit Printable Modal ───────────────────────────────── */}
      <CouncilAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        initialReportType={activeTab}
      />
    </div>
  )
}

export default FinancialReportsPage
