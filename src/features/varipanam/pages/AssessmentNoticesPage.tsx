import React, { useState } from 'react'
import { Mail, Printer, CheckCircle, Eye } from 'lucide-react'
import { useVaripanam } from '../context/VaripanamContext'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'
import { formatLKR } from '../utils/formatters'
import type { Notice, Property } from '../types/varipanam'

export const AssessmentNoticesPage: React.FC = () => {
  const { properties, notices } = useVaripanam()

  const [selectedYear] = useState<number>(2026)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [previewNotice, setPreviewNotice] = useState<(Notice & { owner?: Property['currentOwner'] }) | null>(null)

  const handleGenerateBulk = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setSuccessMessage(`Assessment Roll & Annual Rate Notices prepared for Fiscal Year ${selectedYear}. ${properties.length} notice drafts generated with calculated quarterly breakdowns.`)
    }, 800)
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Assessment Roll & Annual Notices
            </h1>
            <NeedsConfirmationBadge tooltip="Notices for upcoming year are distributed before 31 December per approved annual schedule." />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Assessment roll preparation, bulk print notices, prompt payment discount schedules, and SMS/e-notice dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerateBulk}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>{isGenerating ? 'PREPARING ROLL...' : 'GENERATE ANNUAL ROLL NOTICES'}</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ── Roll Overview & Notice Dispatch Log ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#A31736]" />
            <span>Prepared Assessment Notices ({notices.length} Dispatched)</span>
          </h2>
          <span className="text-xs text-gray-500">Fiscal Year: {selectedYear}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3.5">Assessment No</th>
                <th className="p-3.5">Owner / Recipient</th>
                <th className="p-3.5">Notice Type</th>
                <th className="p-3.5">Calculated Charge</th>
                <th className="p-3.5">Delivery Channel</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {notices.map((n) => {
                const prop = properties.find((p) => p.id === n.propertyId)
                return (
                  <tr key={n.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 font-black text-gray-900">{n.assessmentNumber}</td>
                    <td className="p-3.5 font-semibold text-gray-800">{prop?.currentOwner.name || 'Owner of Record'}</td>
                    <td className="p-3.5 font-medium">{n.noticeType}</td>
                    <td className="p-3.5 font-bold text-gray-900">{formatLKR(n.amountDue)}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700">
                        {n.sentVia}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {n.deliveryStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setPreviewNotice({ ...n, owner: prop?.currentOwner })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#A31736] bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Notice</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Notice PDF / Print Preview Modal ── */}
      {previewNotice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-gray-200">
            <div className="text-center border-b border-gray-200 pb-4">
              <h3 className="text-base font-black text-gray-900 tracking-tight">
                HOMAGAMA PRADESHIYA SABHA
              </h3>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                Statutory Assessment Tax Notice — Year {previewNotice.year}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                <p>
                  <strong>Assessment Number:</strong> {previewNotice.assessmentNumber}
                </p>
                <p>
                  <strong>Owner:</strong> {previewNotice.owner?.name || 'Taxpayer of Record'}
                </p>
                <p>
                  <strong>Postal Address:</strong> {previewNotice.owner?.postalAddress || 'Homagama'}
                </p>
              </div>

              <div className="p-3 border border-gray-200 rounded-xl space-y-2">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total Calculated Annual Assessment:</span>
                  <span>{formatLKR(previewNotice.amountDue)}</span>
                </div>
                <div className="text-[11px] text-gray-600 space-y-0.5 pt-1 border-t border-gray-100">
                  <p>• Quarterly Installment: {formatLKR(previewNotice.amountDue / 4)}</p>
                  <p className="text-emerald-700 font-semibold">• 10% Prompt Payment Rebate if full year settled by Jan 31</p>
                  <p className="text-emerald-700 font-semibold">• 5% Rebate if settled in 1st month of respective quarter</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPreviewNotice(null)}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Statutory Notice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssessmentNoticesPage
