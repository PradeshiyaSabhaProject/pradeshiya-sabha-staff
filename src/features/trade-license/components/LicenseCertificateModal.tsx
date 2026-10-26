import React from 'react'
import { Printer } from 'lucide-react'
import { useTradeLicense } from '../context/TradeLicenseContext'
import { chargeBalance } from '../rules/tradeLicenseRules'
import type { License } from '../types/tradeLicense'
import { InfoBanner, Modal, NeedsConfirmation, btnPrimary, btnSecondary, formatDate, formatLKR } from './ui'

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export const LicenseCertificateModal: React.FC<{ license: License; onClose: () => void }> = ({ license, onClose }) => {
  const { db } = useTradeLicense()
  if (!db) return null
  const app = db.applications.find((a) => a.id === license.applicationId)
  const business = db.businesses.find((b) => b.key === license.businessKey)
  const category = db.categories.find((c) => c.id === app?.categoryId)
  const approvals = db.approvals.filter((a) => a.applicationId === license.applicationId && a.decision === 'APPROVED')
  const lastBy = (stage: string) => [...approvals].reverse().find((a) => a.stage === stage)
  const secretary = lastBy('SECRETARY')
  const chairman = lastBy('CHAIRMAN')
  const outstanding = db.charges
    .filter((c) => c.applicationId === license.applicationId && c.status === 'ACTIVE' && c.type !== 'PROCESSING_FEE')
    .reduce((s, c) => s + chargeBalance(c, db.payments).outstanding, 0)

  const rows: [string, string][] = [
    ['Licence No.', license.licenseNo],
    ['Business ID', license.businessId],
    ['Business name', business?.name ?? ''],
    ['Nature of trade', business?.natureOfActivity ?? ''],
    ['Category', category?.name ?? ''],
    ['Owner / operator', `${business?.owner.name ?? ''} (NIC ${business?.owner.nic ?? ''})`],
    ['Premises', business?.premises.address ?? ''],
    ['Licence year', String(license.licenseYear)],
    ['Valid', `${formatDate(license.validFrom)} – ${formatDate(license.validUntil)}`],
    ['Licence fee', formatLKR(app?.feeAssessment?.licenseFee)],
    ['Stamp duty', formatLKR(app?.feeAssessment?.stampDuty)],
    ['Date of issue', formatDate(license.issueDate)],
  ]

  const print = () => {
    const w = window.open('', '_blank', 'width=820,height=1000')
    if (!w) return
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(license.licenseNo)}</title>
<style>
body{font-family:'Public Sans',system-ui,sans-serif;color:#111;margin:0;padding:32px}
.cert{border:6px double #A31736;padding:36px 40px;max-width:700px;margin:0 auto}
h1{font-size:20px;letter-spacing:.08em;margin:0;text-align:center;color:#A31736}
h2{font-size:15px;text-align:center;margin:6px 0 4px;letter-spacing:.12em}
p.sub{text-align:center;font-size:12px;color:#555;margin:0 0 24px}
table{width:100%;border-collapse:collapse;font-size:13px}
td{padding:7px 4px;border-bottom:1px solid #eee;vertical-align:top}
td:first-child{color:#555;width:38%}
td:last-child{font-weight:600}
.sig{display:flex;justify-content:space-between;margin-top:56px;font-size:12px;text-align:center}
.sig div{width:42%;border-top:1px solid #333;padding-top:6px}
.note{font-size:10px;color:#666;margin-top:24px;text-align:center}
@media print{body{padding:0}}
</style></head><body><div class="cert">
<h1>HOMAGAMA PRADESHIYA SABHA</h1>
<h2>TRADE LICENCE</h2>
<p class="sub">Issued under the Pradeshiya Sabha Act and the By-Laws of the Sabha</p>
<table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>
<div class="sig"><div>Secretary<br>${esc(secretary?.officer ?? '')}<br>${esc(secretary ? formatDate(secretary.at) : '')}</div>
<div>Chairman<br>${esc(chairman?.officer ?? '')}<br>${esc(chairman ? formatDate(chairman.at) : '')}</div></div>
<p class="note">This licence must be displayed at the business premises. Licence ${esc(license.licenseNo)} · Business ID ${esc(license.businessId)}</p>
</div><script>window.onload=function(){window.print()}</script></body></html>`)
    w.document.close()
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`Licence Certificate ${license.licenseNo}`}
      subtitle={`${business?.name ?? ''} · issued by ${license.issuedBy}`}
      footer={
        <>
          <button type="button" className={btnSecondary} onClick={onClose}>
            Close
          </button>
          <button type="button" className={btnPrimary} onClick={print}>
            <Printer className="w-3.5 h-3.5" /> Print Certificate
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {outstanding > 0 && (
          <InfoBanner tone="amber">
            Internal note: {formatLKR(outstanding)} licence fee / stamp duty is still outstanding. The certificate was issued as permitted by the requirements; the
            balance remains on the unpaid-fees report.
          </InfoBanner>
        )}
        {!license.validityConfirmed && (
          <div>
            <NeedsConfirmation label="Validity period not yet officially confirmed" tooltip="Annual cycle ending 31 December must be formally confirmed for each licence type." />
          </div>
        )}
        <div className="border-4 border-double border-[#A31736] rounded-xl p-6">
          <p className="text-center text-sm font-black tracking-widest text-[#A31736]">HOMAGAMA PRADESHIYA SABHA</p>
          <p className="text-center text-xs font-bold tracking-[0.2em] text-gray-800 mt-1 mb-4">TRADE LICENCE</p>
          <div className="divide-y divide-gray-100">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 py-1.5 text-xs">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-900 text-right">{v || '—'}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6 mt-8 text-[11px] text-center text-gray-600">
            <div className="border-t border-gray-400 pt-1">
              Secretary
              <br />
              {secretary?.officer ?? '—'}
            </div>
            <div className="border-t border-gray-400 pt-1">
              Chairman
              <br />
              {chairman?.officer ?? '—'}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default LicenseCertificateModal
