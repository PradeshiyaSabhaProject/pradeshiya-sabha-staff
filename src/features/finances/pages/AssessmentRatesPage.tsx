import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import PropertyAssessmentRegister from '../components/assessment-rates/PropertyAssessmentRegister'
import QuarterlyRateGenerator from '../components/assessment-rates/QuarterlyRateGenerator'
import PaymentHistoryLedger from '../components/assessment-rates/PaymentHistoryLedger'

type TabType = 'register' | 'rates' | 'ledger'

const AssessmentRatesPage: React.FC = () => {
  const { propertyAssessments, billingRuns, paymentHistories } = useFinance()
  const [activeTab, setActiveTab] = useState<TabType>('register')

  // Calculate summary statistics
  const totalAssessedProperties = propertyAssessments.length
  const activeProperties = propertyAssessments.filter((p) => p.status === 'Active').length
  const totalAssessedValue = propertyAssessments.reduce((sum, p) => sum + p.annualValue, 0)

  const totalOutstanding = paymentHistories
    .filter((ph) => ph.status === 'Pending' || ph.status === 'Overdue')
    .reduce((sum, ph) => sum + ph.remainingBalance, 0)

  const totalCollected = paymentHistories
    .filter((ph) => ph.status === 'Paid')
    .reduce((sum, ph) => sum + ph.paidAmount, 0)

  const currentBillingRun = billingRuns.find((br) => br.status === 'In Progress')

  const tabs = [
    { id: 'register', label: '🏘️ Property Register', icon: '📋' },
    { id: 'rates', label: '📊 Quarterly Billing', icon: '📈' },
    { id: 'ledger', label: '📑 Payment Ledger', icon: '💰' },
  ]

  return (
    <div className="space-y-6 text-left pb-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Assessment Rates & Taxes
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Property assessment register, quarterly billing management, and payment tracking ledger.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <SummaryCard
          title="Total Properties"
          value={totalAssessedProperties}
          subtext={`${activeProperties} active`}
          icon="🏠"
          color="bg-blue-50 border-blue-200"
        />
        <SummaryCard
          title="Total Assessed Value"
          value={`₨ ${(totalAssessedValue / 1000000).toFixed(1)}M`}
          subtext="Annual valuation"
          icon="💰"
          color="bg-emerald-50 border-emerald-200"
        />
        <SummaryCard
          title="Amount Collected (YTD)"
          value={`₨ ${(totalCollected / 1000000).toFixed(1)}M`}
          subtext="Payments received"
          icon="✅"
          color="bg-green-50 border-green-200"
        />
        <SummaryCard
          title="Outstanding Balance"
          value={`₨ ${(totalOutstanding / 1000000).toFixed(1)}M`}
          subtext={totalOutstanding > 5000000 ? '⚠️ High overdue' : 'Receivable'}
          icon="⏰"
          color="bg-amber-50 border-amber-200"
        />
      </div>

      {/* Quarterly Billing Status */}
      {currentBillingRun && (
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📋</span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">Current Billing Run</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                <strong>{currentBillingRun.billingRunNumber}</strong> - {currentBillingRun.quarter} {currentBillingRun.fiscalYear}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {currentBillingRun.totalPropertiesIncluded} properties • Due: {currentBillingRun.dueDate} •{' '}
                <span className="text-emerald-600 font-semibold">
                  {currentBillingRun.earlyPaymentDiscountPercent}% early payment discount
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0.5 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.icon}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'register' && <PropertyAssessmentRegister properties={propertyAssessments} />}
        {activeTab === 'rates' && <QuarterlyRateGenerator billingRuns={billingRuns} />}
        {activeTab === 'ledger' && <PaymentHistoryLedger paymentHistories={paymentHistories} />}
      </div>
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: string | number
  subtext: string
  icon: string
  color: string
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, subtext, icon, color }) => {
  return (
    <div className={`rounded-lg border p-3 sm:p-4 ${color}`}>
      <div className="flex items-start gap-2 sm:gap-3">
        <span className="text-2xl sm:text-3xl">{icon}</span>
        <div className="flex-1">
          <h4 className="text-xs text-gray-600 font-medium uppercase tracking-tight">{title}</h4>
          <p className="text-sm sm:text-lg font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{subtext}</p>
        </div>
      </div>
    </div>
  )
}

export default AssessmentRatesPage
