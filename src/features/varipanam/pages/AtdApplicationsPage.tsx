import React, { useState } from 'react'
import {
  FileText,
  Search,
  Eye,
  Plus,
  X,
  Paperclip,
  Check,
} from 'lucide-react'
import { useVaripanam } from '../context/VaripanamContext'
import type { AtdApplication } from '../types/varipanam'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'
import { formatLKR } from '../utils/formatters'

export const AtdApplicationsPage: React.FC = () => {
  const { atdApplications, properties } = useVaripanam()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [selectedAtd, setSelectedAtd] = useState<AtdApplication | null>(null)
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false)

  // New ATD form states
  const [newPropertyId, setNewPropertyId] = useState('')
  const [newApplicantName, setNewApplicantName] = useState('')
  const [newApplicantNic, setNewApplicantNic] = useState('')
  const [newApplicantMobile, setNewApplicantMobile] = useState('')
  const [newRequestType, setNewRequestType] = useState<'NewNumber' | 'OwnershipChange' | 'DescriptionChange'>('OwnershipChange')
  const [newReceiptNumber, setNewReceiptNumber] = useState('')
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const filteredApplications = atdApplications.filter((app) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const match =
        app.atdNumber.toLowerCase().includes(q) ||
        app.atdReceiptNumber.toLowerCase().includes(q) ||
        app.applicantName.toLowerCase().includes(q) ||
        app.applicantNic.toLowerCase().includes(q) ||
        (app.assessmentNumber && app.assessmentNumber.toLowerCase().includes(q))
      if (!match) return false
    }

    if (filterType !== 'ALL' && app.requestType !== filterType) return false
    if (filterStatus !== 'ALL' && app.status !== filterStatus) return false

    return true
  })

  const handleCreateAtd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newApplicantName.trim() || !newApplicantNic.trim()) return

    const atdNo = `ATD/2026/${Math.floor(1000 + Math.random() * 9000)}`

    setFormSuccess(`ATD Application ${atdNo} created successfully!`)
    setTimeout(() => {
      setFormSuccess(null)
      setShowCreateModal(false)
      setNewApplicantName('')
      setNewApplicantNic('')
      setNewApplicantMobile('')
      setNewReceiptNumber('')
      setNewPropertyId('')
    }, 1500)
  }

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Statutory ATD Applications
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-[#A31736] border border-rose-200">
              {atdApplications.length} Registered
            </span>
            <NeedsConfirmationBadge tooltip="Assessment Title Deeds (ATD) govern statutory transfer, alteration, and subdivision endorsements under the Pradeshiya Sabha Act." />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Application for Transfer / Alteration of Assessment Description (Form ATD-1) lifecycle & ledger verification.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>New ATD Application</span>
        </button>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ATD number, receipt no, applicant name, NIC, or assessment number..."
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736] focus:bg-white transition-all font-medium placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-[#A31736] focus:bg-white transition-all cursor-pointer"
            >
              <option value="ALL">All Request Types</option>
              <option value="OwnershipChange">Ownership Change</option>
              <option value="DescriptionChange">Description Change</option>
              <option value="NewNumber">New Assessment Number</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-[#A31736] focus:bg-white transition-all cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {(searchQuery || filterType !== 'ALL' || filterStatus !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setFilterType('ALL')
                  setFilterStatus('ALL')
                }}
                className="px-3 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="text-[11px] text-gray-500 pt-2 border-t border-gray-100 flex items-center justify-between">
          <span>
            Showing <strong>{filteredApplications.length}</strong> of <strong>{atdApplications.length}</strong> ATD records.
          </span>
          <span className="text-[#A31736] font-semibold">Form ATD-1 Statutory Register</span>
        </div>
      </div>

      {/* ── ATD Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3.5">ATD Ref / Receipt</th>
                <th className="p-3.5">Assessment No</th>
                <th className="p-3.5">Applicant Details</th>
                <th className="p-3.5">Request Type</th>
                <th className="p-3.5">Processing Stage</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-medium">
                    No statutory ATD applications matched your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5">
                      <span className="font-mono font-black text-gray-900 block">{app.atdNumber}</span>
                      <span className="text-[10px] text-gray-400 font-mono">Rec: {app.atdReceiptNumber}</span>
                    </td>
                    <td className="p-3.5 font-bold text-gray-900">
                      {app.assessmentNumber || 'New Unit'}
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-gray-800">{app.applicantName}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{app.applicantNic} • {app.applicantMobile}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {app.requestType === 'OwnershipChange'
                          ? 'Ownership Change'
                          : app.requestType === 'DescriptionChange'
                            ? 'Description Change'
                            : 'New Number'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-gray-800 font-semibold">{app.stage}</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${app.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedAtd(app)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#A31736] bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Inspection Modal ── */}
      {selectedAtd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#A31736] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">
                    ATD Application Dossier: {selectedAtd.atdNumber}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Receipt Ref: <strong className="font-mono text-gray-700">{selectedAtd.atdReceiptNumber}</strong> • Status:{' '}
                    <strong className="text-[#A31736]">{selectedAtd.status}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAtd(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Applicant Name</span>
                <span className="font-bold text-gray-900">{selectedAtd.applicantName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Applicant NIC</span>
                <span className="font-mono font-bold text-gray-900">{selectedAtd.applicantNic}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Assessment No</span>
                <span className="font-bold text-gray-900">{selectedAtd.assessmentNumber || 'New Cadastre Unit'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Request Category</span>
                <span className="font-bold text-[#A31736]">{selectedAtd.requestType}</span>
              </div>
            </div>

            {selectedAtd.valuationReport && (
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 text-xs space-y-1.5">
                <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wide">
                  Revenue Inspector Valuation Assessment
                </span>
                <div className="flex justify-between">
                  <span className="text-gray-600">Assessed Value Recommendation:</span>
                  <span className="font-bold text-gray-900">{formatLKR(selectedAtd.valuationReport.recommendedValue)}</span>
                </div>
                <p className="text-gray-700 text-[11px]">{selectedAtd.valuationReport.notes}</p>
                <p className="text-[10px] text-gray-400 pt-1">
                  Inspected by {selectedAtd.valuationReport.officer} on {selectedAtd.valuationReport.date}
                </p>
              </div>
            )}

            {selectedAtd.documents && selectedAtd.documents.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Attached Statutory Documents ({selectedAtd.documents.length})
                </h4>
                <div className="space-y-1.5">
                  {selectedAtd.documents.map((doc) => (
                    <div key={doc.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-bold text-gray-900">{doc.name}</span>
                        <span className="text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                          {doc.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{doc.fileSize}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedAtd(null)}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create ATD Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900">
                Lodge New Statutory ATD Application (Form ATD-1)
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateAtd} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Request Category *</label>
                <select
                  value={newRequestType}
                  onChange={(e) => setNewRequestType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                >
                  <option value="OwnershipChange">Ownership Title Transfer</option>
                  <option value="DescriptionChange">Assessment Description Alteration</option>
                  <option value="NewNumber">New Cadastral Assessment Number</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Target Property</label>
                <select
                  value={newPropertyId}
                  onChange={(e) => setNewPropertyId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                >
                  <option value="">-- Select registered property (optional) --</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.assessmentNumber} - {p.propertyNumber} ({p.currentOwner.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Applicant Name *</label>
                  <input
                    type="text"
                    required
                    value={newApplicantName}
                    onChange={(e) => setNewApplicantName(e.target.value)}
                    placeholder="Full legal name"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Applicant NIC *</label>
                  <input
                    type="text"
                    required
                    value={newApplicantNic}
                    onChange={(e) => setNewApplicantNic(e.target.value)}
                    placeholder="NIC number"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={newApplicantMobile}
                    onChange={(e) => setNewApplicantMobile(e.target.value)}
                    placeholder="+94 77 ..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Counter Receipt No</label>
                  <input
                    type="text"
                    value={newReceiptNumber}
                    onChange={(e) => setNewReceiptNumber(e.target.value)}
                    placeholder="ATD-REC-..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Lodge ATD Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AtdApplicationsPage
