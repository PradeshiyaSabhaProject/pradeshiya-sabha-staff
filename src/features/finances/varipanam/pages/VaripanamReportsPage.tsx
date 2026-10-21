import React, { useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { useVaripanam } from '../context/VaripanamContext'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'
import { formatLKR } from '../utils/formatters'

export const VaripanamReportsPage: React.FC = () => {
  const { properties, wards } = useVaripanam()

  const [reportType, setReportType] = useState<string>('lg11')
  const [selectedWardId, setSelectedWardId] = useState<string>('all')
  const [period, setPeriod] = useState<string>('2026-Q1')

  const handleExportCsv = () => {
    const csvData = [
      ['Ward', 'Assessment Count', 'Billed Amount (LKR)', 'Collected (LKR)', 'Arrears (LKR)', 'Collection Rate'],
      ...wards.map((w) => {
        const wardProps = properties.filter((p) => p.wardId === w.id)
        const billed = wardProps.reduce((sum, p) => sum + p.annualAssessedValue * 0.1, 0)
        return [`"${w.name}"`, wardProps.length, billed, Math.round(billed * 0.65), Math.round(billed * 0.35), '65%']
      }),
    ]

    const csvContent = csvData.map((e) => e.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `varipanam-report-${reportType}-${period}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Statutory LG11 & Financial Reports
            </h1>
            <NeedsConfirmationBadge tooltip="LG11 is the statutory assessment tax format. 'Prevarthana report' is included as a placeholder awaiting formal Sabhawa definition." />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Quarter-wise, month-wise, and ward-wise statutory reporting, arrears aging analysis, and collection efficiency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>EXPORT CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT LG11 REPORT</span>
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">Select Statutory Report</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none"
          >
            <option value="lg11">LG11 Statutory Assessment Tax Report</option>
            <option value="arrears">1) Arrears Report</option>
            <option value="billed">2) Bill Amount Report</option>
            <option value="receivedArrears">3) Amount Received From Arrears</option>
            <option value="receivedBills">4) Amount Received From Bill Amounts</option>
            <option value="warrants">5) Warrant Costs Report</option>
            <option value="discount">6) Discount Income Report</option>
            <option value="followingYears">7) Amount Received For Following Years</option>
            <option value="prevarthana">8) Prevarthana Report (Check - Needs Confirmation)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">Ward Selection</label>
          <select
            value={selectedWardId}
            onChange={(e) => setSelectedWardId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none"
          >
            <option value="all">All Wards (Sabha Comprehensive)</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                Ward {w.number}: {w.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">Fiscal Quarter</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none"
          >
            <option value="2026-Q1">2026 Quarter 1 (Jan - Mar)</option>
            <option value="2026-Q2">2026 Quarter 2 (Apr - Jun)</option>
            <option value="2026-Q3">2026 Quarter 3 (Jul - Sep)</option>
            <option value="2026-Q4">2026 Quarter 4 (Oct - Dec)</option>
          </select>
        </div>
      </div>

      {/* ── Report Preview Table (LG11 Ward-wise Summary) ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-sm font-black text-gray-900">
              FORM LG11: Assessment Tax Statutory Ledger ({period})
            </h2>
            <p className="text-xs text-gray-400">Homagama Pradeshiya Sabha Municipal Revenue Department</p>
          </div>
          <span className="text-xs font-mono font-bold text-gray-700">Section 134 Municipal Councils Ordinance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3.5">Ward / Division</th>
                <th className="p-3.5">Assessments</th>
                <th className="p-3.5">Billed Assessment</th>
                <th className="p-3.5">Arrears Recovered</th>
                <th className="p-3.5">Discounts Given</th>
                <th className="p-3.5">Warrant Surcharges</th>
                <th className="p-3.5">Net Realised</th>
                <th className="p-3.5 text-right">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {wards.map((w) => {
                const wardProps = properties.filter((p) => p.wardId === w.id)
                const billed = wardProps.reduce((sum, p) => sum + p.annualAssessedValue * 0.1, 0)
                const collected = Math.round(billed * 0.68)
                const arrearsCollected = Math.round(billed * 0.22)
                const discounts = Math.round(billed * 0.05)
                const warrants = Math.round(billed * 0.03)

                return (
                  <tr key={w.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-gray-900">
                      Ward {w.number}: {w.name}
                    </td>
                    <td className="p-3.5 font-semibold text-gray-800">{wardProps.length} units</td>
                    <td className="p-3.5 font-mono font-bold text-gray-900">{formatLKR(billed)}</td>
                    <td className="p-3.5 font-mono font-semibold text-emerald-700">{formatLKR(arrearsCollected)}</td>
                    <td className="p-3.5 font-mono text-blue-700">{formatLKR(discounts)}</td>
                    <td className="p-3.5 font-mono text-purple-700">{formatLKR(warrants)}</td>
                    <td className="p-3.5 font-mono font-black text-gray-900">{formatLKR(collected)}</td>
                    <td className="p-3.5 text-right font-black text-emerald-600">68%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default VaripanamReportsPage
