import React, { useState } from 'react'
import type { DepartmentOption, SentLetterAttachment } from '../hooks/useWriteLetterData'

interface WriteLetterModalProps {
  isOpen: boolean
  onClose: () => void
  departments: DepartmentOption[]
  onSubmit: (letterData: {
    department: string
    recipientOfficer: string
    subject: string
    body: string
    attachments: SentLetterAttachment[]
  }) => void
}

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-amber-500">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const WriteLetterModal: React.FC<WriteLetterModalProps> = ({ isOpen, onClose, departments, onSubmit }) => {
  const [selectedDept, setSelectedDept] = useState(departments[0]?.name || '')
  const [selectedOfficer, setSelectedOfficer] = useState(departments[0]?.officers[0] || '')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState<SentLetterAttachment[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update officers list when department changes
  const currentDeptObj = departments.find(d => d.name === selectedDept)
  const officersList = currentDeptObj?.officers || []

  const [prevDept, setPrevDept] = useState(selectedDept)
  if (selectedDept !== prevDept) {
    setPrevDept(selectedDept)
    if (officersList.length > 0 && !officersList.includes(selectedOfficer)) {
      setSelectedOfficer(officersList[0])
    }
  }

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const newAtt: SentLetterAttachment = {
        id: Date.now().toString(),
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        type: file.name.endsWith('.pdf') ? 'pdf' : 'image',
        url: '#'
      }
      setAttachments(prev => [...prev, newAtt])
    }
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  const handleAutoFillSample = () => {
    setSelectedDept('Engineering & Works')
    setTimeout(() => {
      setSelectedOfficer('S. Kumara (Chief Engineer)')
    }, 100)
    setSubject('Request for Technical Valuation & Site Clearance Permit')
    setBody('This is to formally request an expedited technical valuation and site clearance inspection for the newly acquired council storage facility lot in Sector 2. All preliminary environmental impact assessment reports have been verified and enclosed herewith.')
    if (attachments.length === 0) {
      setAttachments([
        { id: 'sample-1', name: 'Site_Plan_Sector2.pdf', size: '1.4 MB', type: 'pdf', url: '#' }
      ])
    }
  }

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !body.trim() || !selectedOfficer) {
      alert('Please fill in Subject, Letter Body, and select a Recipient Officer.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      onSubmit({
        department: selectedDept,
        recipientOfficer: selectedOfficer,
        subject,
        body,
        attachments
      })
      setIsSubmitting(false)
      onClose()
      // Reset form
      setSubject('')
      setBody('')
      setAttachments([])
    }, 500)
  }

  // Current formatted timestamp
  const now = new Date()
  const currentTimeStr = `${now.toISOString().split('T')[0]} | ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[92vh] overflow-hidden my-auto border border-gray-200">
        
        {/* Header */}
        <div className="bg-[#801028] text-white px-6 py-5 flex items-center justify-between shrink-0 shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 block animate-pulse"></span>
              <h2 className="text-lg font-bold tracking-wide">Write Official Letter</h2>
            </div>
            <p className="text-xs text-white/80 mt-0.5">
              Compose and dispatch formal correspondence to internal municipal departments &amp; officers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoFillSample}
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
              title="Fill sample letter data"
            >
              <SparklesIcon />
              <span className="hidden sm:inline">Auto-Fill Sample</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-lg transition-colors hover:bg-white/10 cursor-pointer"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Auto-Filled System Data Banner */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs md:text-sm text-gray-800 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
              <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                <span>⚡</span> SYSTEM AUTO-FILLED METADATA
              </span>
              <span className="text-[11px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full uppercase">
                Verified Sender
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4">
              <div>
                <span className="text-gray-500 block text-[11px] uppercase font-bold">Reference No:</span>
                <span className="font-mono font-bold text-[#801028]">[Auto-Generated]</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px] uppercase font-bold">Date &amp; Time:</span>
                <span className="font-semibold text-gray-800">{currentTimeStr}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px] uppercase font-bold">Initial Status:</span>
                <span className="font-bold text-green-700">SENT</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px] uppercase font-bold">Sender Name:</span>
                <span className="font-bold text-gray-900">Anuradha Wijesinghe</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500 block text-[11px] uppercase font-bold">Sender ID &amp; Role:</span>
                <span className="font-semibold text-gray-800">EMP-2023-042 (Staff Administration Officer)</span>
              </div>
            </div>
          </div>

          {/* Department and Officer Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-200">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Select Department <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#801028] focus:ring-2 focus:ring-[#801028]/20 transition-all cursor-pointer shadow-2xs"
                required
              >
                {departments.map(d => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                To Department Person (Officer) <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#801028] focus:ring-2 focus:ring-[#801028]/20 transition-all cursor-pointer shadow-2xs"
                required
              >
                {officersList.map(officer => (
                  <option key={officer} value={officer}>{officer}</option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1.5">
                ℹ️ Recipient information is dynamically routed to the selected departmental officer.
              </p>
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Letter Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter official subject line (e.g. Request for Inspection / Submission of Reports)..."
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:border-[#801028] focus:ring-2 focus:ring-[#801028]/20 transition-all shadow-2xs"
              required
            />
          </div>

          {/* Letter Body */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Letter Body <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Write the full content of the letter here. Paragraphs will be preserved and formatted according to the official Pradeshiya Sabha document standards..."
              className="w-full bg-white border border-gray-300 rounded-xl p-4 text-sm font-serif text-gray-800 focus:outline-none focus:border-[#801028] focus:ring-2 focus:ring-[#801028]/20 transition-all leading-relaxed shadow-2xs"
              required
            />
          </div>

          {/* Attachments (Optional) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Attachments (Optional)
              </label>
              <span className="text-xs text-gray-400">Supported: PDF, JPG, PNG, DOC</span>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#801028] transition-colors bg-gray-50/50">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center text-gray-600 hover:text-[#801028]"
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center mb-2 text-lg">
                  📎
                </div>
                <span className="text-sm font-semibold">Click to attach supporting documents</span>
                <span className="text-xs text-gray-400 mt-0.5">Maximum file size: 10MB</span>
              </label>
            </div>

            {/* Attachment Chips */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {attachments.map(att => (
                  <div key={att.id} className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-800 shadow-2xs">
                    <span>{att.type === 'pdf' ? '📕' : '🖼️'}</span>
                    <span className="font-bold">{att.name}</span>
                    <span className="text-gray-400">({att.size})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-gray-400 hover:text-red-600 ml-1 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#801028] hover:bg-[#600a1c] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Dispatching Letter...</span>
                </>
              ) : (
                <>
                  <span>📨</span>
                  <span>Submit Letter</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}

export default WriteLetterModal
