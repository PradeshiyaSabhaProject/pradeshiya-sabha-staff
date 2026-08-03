import React from 'react'
import type { SentLetter } from '../hooks/useWriteLetterData'

interface LetterDocumentModalProps {
  letter: SentLetter | null
  onClose: () => void
}

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const PrinterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
)

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const LetterDocumentModal: React.FC<LetterDocumentModalProps> = ({ letter, onClose }) => {
  if (!letter) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadFile = () => {
    const docContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Official Letter - ${letter.refNo}</title>
  <style>
    body { font-family: 'Times New Roman', Times, serif; color: #1a1a1a; margin: 40px; line-height: 1.6; }
    .header { text-align: center; border-bottom: 3px double #801028; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #801028; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
    .header h2 { font-size: 16px; margin: 5px 0 0 0; color: #4a4a4a; font-weight: normal; }
    .meta-table { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
    .meta-table td { padding: 6px 10px; font-size: 14px; vertical-align: top; }
    .meta-label { font-weight: bold; color: #555; width: 180px; }
    .subject { font-size: 16px; font-weight: bold; text-decoration: underline; margin: 30px 0 20px 0; color: #000; }
    .body-content { font-size: 15px; text-align: justify; white-space: pre-line; margin-bottom: 50px; }
    .signature { margin-top: 60px; font-size: 15px; }
    .signature .name { font-weight: bold; margin-bottom: 2px; }
    .signature .title { color: #555; font-size: 14px; }
    .footer { margin-top: 80px; font-size: 11px; text-align: center; color: #888; border-top: 1px solid #ccc; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Homagama Pradeshiya Sabha</h1>
    <h2>Official Municipal Correspondence &amp; Departmental Dispatch</h2>
  </div>
  <table class="meta-table">
    <tr>
      <td class="meta-label">Reference Number:</td>
      <td><strong>${letter.refNo}</strong></td>
      <td class="meta-label">Date &amp; Time:</td>
      <td>${letter.dateTime}</td>
    </tr>
    <tr>
      <td class="meta-label">Sender Name &amp; ID:</td>
      <td>${letter.senderName} (${letter.senderId})</td>
      <td class="meta-label">Status:</td>
      <td><span style="color: #801028; font-weight: bold;">${letter.status}</span></td>
    </tr>
    <tr>
      <td class="meta-label">To Department:</td>
      <td><strong>${letter.department}</strong></td>
      <td class="meta-label">Recipient Officer:</td>
      <td><strong>${letter.recipientOfficer}</strong></td>
    </tr>
  </table>
  <div class="subject">SUBJECT: ${letter.subject}</div>
  <div class="body-content">${letter.body}</div>
  ${letter.attachments.length > 0 ? `
  <div style="margin-top: 30px; font-size: 13px; color: #555;">
    <strong>Enclosed Attachments (${letter.attachments.length}):</strong>
    <ul>
      ${letter.attachments.map(a => `<li>${a.name} (${a.size})</li>`).join('')}
    </ul>
  </div>
  ` : ''}
  <div class="signature">
    <p>Yours faithfully,</p>
    <br/><br/>
    <div class="name">${letter.senderName}</div>
    <div class="title">Staff Officer • Homagama Pradeshiya Sabha</div>
    <div class="title">ID: ${letter.senderId}</div>
  </div>
  <div class="footer">
    This document was digitally issued via the Homagama Pradeshiya Sabha Staff Portal. System verification ID: ${letter.id}
  </div>
</body>
</html>
    `

    const blob = new Blob([docContent], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Official_Letter_${letter.refNo.replace('#', '')}.html`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in print:p-0 print:bg-white print:static">
      <div className="bg-white rounded shadow-lg w-full max-w-3xl flex flex-col max-h-[92vh] overflow-hidden print:shadow-none print:max-h-none print:max-w-none print:w-full print:rounded-none border border-gray-300">
        
        {/* Modal Toolbar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white border-b border-gray-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[#801028] inline-block"></span>
            <h2 className="text-sm font-bold tracking-wider uppercase text-gray-200">
              Official Letter Document Preview
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-3.5 py-2 rounded transition-colors cursor-pointer border border-gray-700 shadow-sm uppercase tracking-wider"
              title="Print letter directly"
            >
              <PrinterIcon />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadFile}
              className="flex items-center gap-2 bg-[#801028] hover:bg-[#600a1c] text-white text-xs font-semibold px-4 py-2 rounded transition-colors cursor-pointer shadow-md uppercase tracking-wider"
              title="Download formatted document"
            >
              <DownloadIcon />
              <span>Download Letter</span>
            </button>
            <div className="h-5 w-px bg-gray-700 mx-1"></div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded transition-colors cursor-pointer hover:bg-gray-800"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Printable Official Letter Paper View */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-[#fdfdfc] text-gray-900 font-serif print:p-8 print:overflow-visible">
          
          {/* Letterhead Banner */}
          <div className="text-center border-b-4 border-[#801028] pb-6 mb-8 relative">
            <div className="absolute left-0 top-0 hidden sm:block">
              <div className="w-12 h-12 rounded-full border-2 border-[#801028] flex items-center justify-center text-[#801028] font-extrabold text-xs tracking-tighter">
                HPS
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#801028] tracking-wide uppercase font-sans">
              Homagama Pradeshiya Sabha
            </h1>
            <p className="text-sm md:text-base text-gray-600 font-sans mt-1 font-semibold">
              Official Municipal Correspondence &amp; Departmental Dispatch
            </p>
            <p className="text-xs text-gray-400 font-sans mt-0.5">
              Court Road, Homagama • Tel: +94 11 285 5230 • Email: homagamapradeshiyasabawa@gmail.com
            </p>
          </div>

          {/* Auto-Filled Metadata Card Grid */}
          <div className="bg-gray-50/80 border-2 border-gray-200 rounded-xl p-5 mb-8 font-sans text-xs md:text-sm grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 shadow-xs">
            <div className="flex justify-between border-b border-gray-200/60 pb-2 md:border-0 md:pb-0">
              <span className="font-bold text-gray-500 uppercase">Reference No:</span>
              <span className="font-extrabold text-[#801028] font-mono text-base">{letter.refNo}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2 md:border-0 md:pb-0">
              <span className="font-bold text-gray-500 uppercase">Date &amp; Time:</span>
              <span className="font-semibold text-gray-800">{letter.dateTime}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2 md:border-0 md:pb-0">
              <span className="font-bold text-gray-500 uppercase">Sender:</span>
              <span className="font-semibold text-gray-900">{letter.senderName} <span className="text-gray-400">({letter.senderId})</span></span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2 md:border-0 md:pb-0">
              <span className="font-bold text-gray-500 uppercase">Status:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 font-bold text-xs uppercase tracking-wider">
                {letter.status}
              </span>
            </div>
            <div className="flex justify-between md:col-span-2 pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-500 uppercase">To Department:</span>
              <span className="font-extrabold text-gray-900">{letter.department}</span>
            </div>
            <div className="flex justify-between md:col-span-2">
              <span className="font-bold text-gray-500 uppercase">Recipient Officer:</span>
              <span className="font-bold text-[#801028]">{letter.recipientOfficer}</span>
            </div>
          </div>

          {/* Subject Line */}
          <div className="mb-6">
            <p className="text-base md:text-lg font-bold text-gray-900 underline underline-offset-4 decoration-[#801028] decoration-2 leading-relaxed">
              SUBJECT: {letter.subject}
            </p>
          </div>

          {/* Letter Body */}
          <div className="text-base md:text-lg text-gray-800 leading-relaxed space-y-4 text-justify whitespace-pre-line min-h-[160px]">
            {letter.body}
          </div>

          {/* Attachments Section if any */}
          {letter.attachments.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 font-sans">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                ENCLOSED ATTACHMENTS ({letter.attachments.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {letter.attachments.map(att => (
                  <span key={att.id} className="inline-flex items-center gap-2 bg-gray-100 border border-gray-300 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg">
                    <span>ðŸ“„</span>
                    <span className="font-bold">{att.name}</span>
                    <span className="text-gray-400">({att.size})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Signature Block */}
          <div className="mt-12 pt-8 flex items-end justify-between font-sans">
            <div>
              <p className="text-sm font-serif italic text-gray-600 mb-6">Yours faithfully,</p>
              <div className="w-48 border-b-2 border-gray-900 mb-2"></div>
              <p className="font-extrabold text-gray-900 text-base">{letter.senderName}</p>
              <p className="text-xs font-semibold text-gray-500">Staff Officer • Homagama Pradeshiya Sabha</p>
              <p className="text-xs text-gray-400">Employee ID: {letter.senderId}</p>
            </div>
            <div className="hidden sm:block text-right">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-300 text-[10px] font-bold uppercase text-center p-2 transform -rotate-12">
                Official<br/>Municipal<br/>Stamp
              </div>
            </div>
          </div>

          {/* Document Footer */}
          <div className="mt-16 pt-4 border-t border-gray-200 text-center font-sans text-[10px] text-gray-400">
            This document is an official digital record generated from the Homagama Pradeshiya Sabha Staff Administration Portal. System Reference ID: {letter.id}
          </div>

        </div>

        {/* Modal Footer Toolbar (Hidden when printing) */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0 print:hidden font-sans">
          <span className="text-xs text-gray-500 font-medium">
            ðŸ’¡ Click <strong>Download Letter</strong> to save a standalone HTML document or <strong>Print</strong> for PDF save.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-sm rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  )
}

export default LetterDocumentModal

