import React from 'react'

const formatLKR = (value: number) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(value)

type FundName = 'Recurrent Expenditure Fund' | 'Capital Development Fund' | 'Decentralized Ward Grants'

type BudgetLine = {
  headOfAccount: string
  department: string
  fund: FundName
  budgeted: number
  committed: number
  actualPaid: number
  remaining: number
  variance: number
  status: 'Healthy' | 'Watch' | 'Critical'
}

const budgetLines: BudgetLine[] = [
  {
    headOfAccount: '211-01-01: Salaries & Wages',
    department: 'Administration',
    fund: 'Recurrent Expenditure Fund',
    budgeted: 64000000,
    committed: 49200000,
    actualPaid: 46800000,
    remaining: 17200000,
    variance: 17200000,
    status: 'Healthy',
  },
  {
    headOfAccount: '212-03-02: Electricity & Street Lighting',
    department: 'Works & Utilities',
    fund: 'Recurrent Expenditure Fund',
    budgeted: 18000000,
    committed: 16500000,
    actualPaid: 14800000,
    remaining: 1500000,
    variance: -800000,
    status: 'Watch',
  },
  {
    headOfAccount: '214-04-07: Waste Collection Contract',
    department: 'Solid Waste Management',
    fund: 'Recurrent Expenditure Fund',
    budgeted: 14000000,
    committed: 14600000,
    actualPaid: 13200000,
    remaining: -600000,
    variance: -600000,
    status: 'Critical',
  },
  {
    headOfAccount: '311-02-01: Road Rehabilitation',
    department: 'Road Development',
    fund: 'Capital Development Fund',
    budgeted: 42000000,
    committed: 29500000,
    actualPaid: 24300000,
    remaining: 12500000,
    variance: 12500000,
    status: 'Healthy',
  },
  {
    headOfAccount: '312-05-03: Drainage Network Upgrade',
    department: 'Engineering',
    fund: 'Capital Development Fund',
    budgeted: 26000000,
    committed: 27100000,
    actualPaid: 19600000,
    remaining: -1100000,
    variance: -1100000,
    status: 'Critical',
  },
  {
    headOfAccount: '315-08-02: Ward Street Lighting',
    department: 'Ward Development',
    fund: 'Decentralized Ward Grants',
    budgeted: 9500000,
    committed: 8400000,
    actualPaid: 6700000,
    remaining: 1100000,
    variance: 1100000,
    status: 'Healthy',
  },
  {
    headOfAccount: '316-01-01: Community Premises Upgrade',
    department: 'Ward Infrastructure',
    fund: 'Decentralized Ward Grants',
    budgeted: 11800000,
    committed: 12350000,
    actualPaid: 9100000,
    remaining: -550000,
    variance: -550000,
    status: 'Critical',
  },
  {
    headOfAccount: '318-06-04: Public Toilet Renovation',
    department: 'Sanitation',
    fund: 'Decentralized Ward Grants',
    budgeted: 7600000,
    committed: 6000000,
    actualPaid: 4200000,
    remaining: 1600000,
    variance: 1600000,
    status: 'Healthy',
  },
]

const fundOverview: Array<{
  fund: FundName
  budgeted: number
  committed: number
  actualPaid: number
  remaining: number
  variance: number
}> = [
  {
    fund: 'Recurrent Expenditure Fund',
    budgeted: 96000000,
    committed: 80300000,
    actualPaid: 74800000,
    remaining: 15700000,
    variance: 15700000,
  },
  {
    fund: 'Capital Development Fund',
    budgeted: 68000000,
    committed: 56600000,
    actualPaid: 43900000,
    remaining: 11400000,
    variance: 11400000,
  },
  {
    fund: 'Decentralized Ward Grants',
    budgeted: 28900000,
    committed: 26750000,
    actualPaid: 20200000,
    remaining: 2200000,
    variance: 2200000,
  },
]

const statusClasses: Record<BudgetLine['status'], string> = {
  Healthy: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  Watch: 'bg-amber-50 text-amber-800 border border-amber-200',
  Critical: 'bg-rose-50 text-rose-800 border border-rose-200',
}

const BudgetManagerPage: React.FC = () => {
  const totalBudget = budgetLines.reduce((sum, item) => sum + item.budgeted, 0)
  const totalCommitted = budgetLines.reduce((sum, item) => sum + item.committed, 0)
  const totalActualPaid = budgetLines.reduce((sum, item) => sum + item.actualPaid, 0)
  const totalRemaining = budgetLines.reduce((sum, item) => sum + item.remaining, 0)
  const atRisk = budgetLines.filter((item) => item.remaining <= 0 || item.status === 'Critical')

  return (
    <div className="space-y-6 pb-10 animate-fade-in text-left">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#A31736] uppercase">Finance Control Desk</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 uppercase tracking-tight">Municipal Budget Manager</h1>
          <p className="mt-1 text-sm text-gray-500">
            Multi-fund budget planning, variance monitoring, and pre-approval control for Head of Account commitments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="border border-gray-300 bg-white text-gray-700 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded transition hover:bg-gray-50"
          >
            Export Budget Pack
          </button>
          <button
            type="button"
            className="bg-[#A31736] text-white text-xs font-bold uppercase tracking-wider px-3 py-2 rounded transition hover:bg-[#801028]"
          >
            Lock Budget Cycle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Total Budgeted</p>
          <p className="mt-3 text-2xl font-bold text-gray-900">{formatLKR(totalBudget)}</p>
          <p className="mt-2 text-xs text-emerald-700">Across 3 municipal funds</p>
        </div>
        <div className="rounded border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Committed</p>
          <p className="mt-3 text-2xl font-bold text-gray-900">{formatLKR(totalCommitted)}</p>
          <p className="mt-2 text-xs text-amber-700">{Math.round((totalCommitted / totalBudget) * 100)}% allocated</p>
        </div>
        <div className="rounded border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Actual Payouts</p>
          <p className="mt-3 text-2xl font-bold text-gray-900">{formatLKR(totalActualPaid)}</p>
          <p className="mt-2 text-xs text-blue-700">{Math.round((totalActualPaid / totalBudget) * 100)}% disbursed</p>
        </div>
        <div className="rounded border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Remaining Headroom</p>
          <p className="mt-3 text-2xl font-bold text-gray-900">{formatLKR(totalRemaining)}</p>
          <p className="mt-2 text-xs text-rose-700">{atRisk.length} lines under review</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900">Multi-fund Budget Snapshot</h2>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Live funding status</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 p-4">
          {fundOverview.map((fund) => (
            <div key={fund.fund} className="rounded border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-gray-900 leading-snug">{fund.fund}</h3>
                <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                  Active
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Budgeted</span>
                  <span className="font-bold text-gray-900">{formatLKR(fund.budgeted)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Committed</span>
                  <span className="font-bold text-amber-800">{formatLKR(fund.committed)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Actual Paid</span>
                  <span className="font-bold text-blue-800">{formatLKR(fund.actualPaid)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span>Remaining</span>
                  <span className="font-bold text-emerald-800">{formatLKR(fund.remaining)}</span>
                </div>
              </div>

              <div className="mt-4 h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#A31736]"
                  style={{ width: `${Math.min((fund.committed / fund.budgeted) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900">Real-time Variance Analysis</h2>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Budget vs committed vs payout</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-700 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 font-bold">Head of Account</th>
                <th className="px-4 py-3 font-bold">Fund</th>
                <th className="px-4 py-3 font-bold text-right">Budgeted</th>
                <th className="px-4 py-3 font-bold text-right">Committed</th>
                <th className="px-4 py-3 font-bold text-right">Actual Paid</th>
                <th className="px-4 py-3 font-bold text-right">Remaining</th>
                <th className="px-4 py-3 font-bold text-right">Variance</th>
                <th className="px-4 py-3 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {budgetLines.map((item) => (
                <tr key={item.headOfAccount} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{item.headOfAccount}</div>
                    <div className="text-[11px] text-gray-500">{item.department}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.fund}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">{formatLKR(item.budgeted)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-amber-800">{formatLKR(item.committed)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-blue-800">{formatLKR(item.actualPaid)}</td>
                  <td className={`px-4 py-3 text-right font-mono font-bold ${item.remaining < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {formatLKR(item.remaining)}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-bold ${item.variance < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {formatLKR(item.variance)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClasses[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-4">
        <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900">Overbudget Warning System</h2>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Voucher approval guard</span>
          </div>

          <div className="mt-4 space-y-3">
            {budgetLines
              .filter((item) => item.remaining <= 0 || item.status === 'Critical')
              .map((item) => (
                <div key={item.headOfAccount} className="rounded border border-rose-200 bg-rose-50 p-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-rose-700">Approval blocked</p>
                      <p className="mt-1 text-sm font-bold text-gray-900">{item.headOfAccount}</p>
                    </div>
                    <span className="inline-flex rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-rose-100 text-rose-800 border border-rose-200">
                      Insufficient remaining funds
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-gray-700">
                    <div>
                      <p className="text-gray-500">Budgeted</p>
                      <p className="font-bold text-gray-900">{formatLKR(item.budgeted)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Committed</p>
                      <p className="font-bold text-amber-800">{formatLKR(item.committed)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Actual Paid</p>
                      <p className="font-bold text-blue-800">{formatLKR(item.actualPaid)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Remaining</p>
                      <p className="font-bold text-rose-700">{formatLKR(item.remaining)}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900">Approval Control Logic</h2>

          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <div className="rounded border border-gray-200 bg-gray-50 p-3">
              <p className="font-bold text-gray-900">Rule 1</p>
              <p className="mt-1">A voucher cannot be approved when remaining funds for the Head of Account are below zero.</p>
            </div>
            <div className="rounded border border-gray-200 bg-gray-50 p-3">
              <p className="font-bold text-gray-900">Rule 2</p>
              <p className="mt-1">System compares budgeted, committed, and actual payout values in real time before authorization.</p>
            </div>
            <div className="rounded border border-gray-200 bg-gray-50 p-3">
              <p className="font-bold text-gray-900">Rule 3</p>
              <p className="mt-1">If a fund line is overdrawn, the approval workflow escalates for finance controller review.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BudgetManagerPage
