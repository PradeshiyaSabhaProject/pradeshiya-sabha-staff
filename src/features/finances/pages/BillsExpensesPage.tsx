import React, { useMemo, useState } from 'react'

type DocumentKind = 'Vendor invoice' | 'Contractor certificate' | 'Expense reimbursement'
type DocumentStatus = 'Draft' | 'Pending approval' | 'Approved' | 'Paid'

type ExpenseDocument = {
  id: string
  reference: string
  payee: string
  kind: DocumentKind
  source: 'Manual entry' | 'Fleet Maintenance' | 'Inventory Management'
  amount: number
  submitted: string
  status: DocumentStatus
  currentStep: string
  description: string
}

const initialDocuments: ExpenseDocument[] = [
  { id: 'VE-2026-0048', reference: 'INV-CEB-0926', payee: 'Ceylon Electricity Board', kind: 'Vendor invoice', source: 'Manual entry', amount: 126400, submitted: '18 Sep 2026', status: 'Pending approval', currentStep: 'Finance Officer', description: 'Council office electricity - September billing cycle' },
  { id: 'VE-2026-0047', reference: 'FM-REP-1182', payee: 'Municipal Workshop', kind: 'Contractor certificate', source: 'Fleet Maintenance', amount: 84200, submitted: '17 Sep 2026', status: 'Pending approval', currentStep: 'Secretary / Chairman', description: 'Tipper truck HPS-32-1842 brake repair certificate' },
  { id: 'VE-2026-0046', reference: 'PO-INV-2409', payee: 'Lanka Office Supplies', kind: 'Vendor invoice', source: 'Inventory Management', amount: 196500, submitted: '16 Sep 2026', status: 'Approved', currentStep: 'Payment desk', description: 'Stationery restock linked to purchase order PO-2026-2409' },
  { id: 'VE-2026-0045', reference: 'ER-SEP-017', payee: 'N. Fernando - Revenue Officer', kind: 'Expense reimbursement', source: 'Manual entry', amount: 12850, submitted: '16 Sep 2026', status: 'Draft', currentStep: 'Account Clerk', description: 'Field collection travel and communication expenses' },
  { id: 'VE-2026-0044', reference: 'FUEL-SEP-884', payee: 'IOC Homagama Depot', kind: 'Vendor invoice', source: 'Fleet Maintenance', amount: 214700, submitted: '15 Sep 2026', status: 'Paid', currentStep: 'Completed', description: 'Auto-imported fuel issue batch for 12 vehicles' },
]

const formatLKR = (amount: number) => `LKR ${amount.toLocaleString('en-US')}`

const statusStyles: Record<DocumentStatus, string> = {
  Draft: 'bg-gray-100 text-gray-700 border-gray-200',
  'Pending approval': 'bg-amber-50 text-amber-800 border-amber-200',
  Approved: 'bg-blue-50 text-blue-800 border-blue-200',
  Paid: 'bg-emerald-50 text-emerald-800 border-emerald-200',
}

const sourceStyles: Record<ExpenseDocument['source'], string> = {
  'Manual entry': 'bg-gray-50 text-gray-600 border-gray-200',
  'Fleet Maintenance': 'bg-orange-50 text-orange-800 border-orange-200',
  'Inventory Management': 'bg-cyan-50 text-cyan-800 border-cyan-200',
}

export const BillsExpensesPage: React.FC = () => {
  const [documents, setDocuments] = useState(initialDocuments)
  const [activeView, setActiveView] = useState<'desk' | 'approvals' | 'links'>('desk')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'All' | DocumentStatus>('All')
  const [notice, setNotice] = useState('')

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2800)
  }

  const filteredDocuments = useMemo(() => documents.filter((document) => {
    const matchesFilter = filter === 'All' || document.status === filter
    const query = search.trim().toLowerCase()
    return matchesFilter && (!query || `${document.reference} ${document.payee} ${document.description}`.toLowerCase().includes(query))
  }), [documents, filter, search])

  const pendingCount = documents.filter((document) => document.status === 'Pending approval').length
  const approvalAmount = documents.filter((document) => document.status === 'Pending approval').reduce((sum, document) => sum + document.amount, 0)
  const moveToNextStep = (id: string) => {
    setDocuments((current) => current.map((document) => document.id !== id ? document : {
      ...document,
      status: document.currentStep === 'Secretary / Chairman' ? 'Approved' : 'Pending approval',
      currentStep: document.currentStep === 'Account Clerk' ? 'Finance Officer' : document.currentStep === 'Finance Officer' ? 'Secretary / Chairman' : 'Payment desk',
    }))
    showNotice('Approval step recorded and audit trail updated.')
  }

  const captureDocument = () => {
    setDocuments((current) => [{
      id: `VE-2026-${String(49 + current.length).padStart(4, '0')}`,
      reference: 'NEW-DRAFT',
      payee: 'New payee to be entered',
      kind: 'Vendor invoice',
      source: 'Manual entry',
      amount: 0,
      submitted: '22 Sep 2026',
      status: 'Draft',
      currentStep: 'Account Clerk',
      description: 'New expense document awaiting details',
    }, ...current])
    showNotice('New expense document created in Draft status.')
  }

  return (
    <div className="space-y-5 text-left pb-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A31736]"><span className="w-2 h-2 rounded-full bg-[#A31736]" /> Finance Management / Control Desk</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase mt-1">Bills &amp; Expenses</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Capture bills, route payment vouchers through dual control, and keep every operational expense traceable.</p>
        </div>
        <button type="button" onClick={captureDocument} className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-3 py-2 rounded uppercase tracking-wider cursor-pointer shadow-sm">+ Capture document</button>
      </div>

      {notice && <div className="border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-2.5 rounded text-xs font-semibold" role="status">{notice}</div>}

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          ['Open desk queue', `${documents.filter((document) => document.status !== 'Paid').length}`, 'Bills and vouchers'],
          ['Awaiting approval', `${pendingCount}`, formatLKR(approvalAmount)],
          ['Linked from operations', `${documents.filter((document) => document.source !== 'Manual entry').length}`, 'Fleet + inventory'],
          ['Paid this period', `${documents.filter((document) => document.status === 'Paid').length}`, 'Ready for ledger post'],
        ].map(([label, value, note]) => <div key={label} className="bg-white border border-gray-300 rounded shadow-sm p-3.5"><p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{label}</p><p className="text-xl font-mono font-bold text-gray-900 mt-1">{value}</p><p className="text-[10px] text-gray-400 mt-0.5">{note}</p></div>)}
      </section>

      <div className="flex items-center gap-1 border-b border-gray-300 overflow-x-auto">
        {([['desk', 'Bill & voucher desk'], ['approvals', `Approval workflow (${pendingCount})`], ['links', 'Cross-module linkage']] as const).map(([view, label]) => <button key={view} type="button" onClick={() => setActiveView(view)} className={`whitespace-nowrap px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer ${activeView === view ? 'text-[#A31736] border-[#A31736]' : 'text-gray-500 border-transparent hover:text-gray-800'}`}>{label}</button>)}
      </div>

      {activeView === 'desk' && <section className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Vendor bills &amp; payment vouchers</h2><p className="text-xs text-gray-500 mt-1">One intake queue for invoices, certificates, and staff expense claims.</p></div><div className="flex flex-wrap gap-2"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search payee or reference" className="border border-gray-300 rounded px-3 py-2 text-xs w-56 focus:outline-none focus:border-[#A31736]" /><select value={filter} onChange={(event) => setFilter(event.target.value as 'All' | DocumentStatus)} className="border border-gray-300 rounded px-2 py-2 text-xs bg-white"><option value="All">All statuses</option><option value="Draft">Draft</option><option value="Pending approval">Pending approval</option><option value="Approved">Approved</option><option value="Paid">Paid</option></select></div></div>
        <div className="divide-y divide-gray-100">{filteredDocuments.map((document) => <div key={document.id} className="p-4 hover:bg-gray-50 transition-colors"><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] text-gray-400">{document.id}</span><span className="font-mono font-bold text-[11px] text-gray-900">{document.reference}</span><span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase ${statusStyles[document.status]}`}>{document.status}</span></div><p className="text-xs font-semibold text-gray-900 mt-1">{document.payee}</p><p className="text-[11px] text-gray-500 mt-1">{document.kind} · {document.description}</p></div><div className="flex items-center gap-4 shrink-0"><div className="text-right"><p className="font-mono font-bold text-sm text-gray-900">{formatLKR(document.amount)}</p><p className="text-[10px] text-gray-400">Submitted {document.submitted}</p></div>{document.status !== 'Paid' && <button type="button" onClick={() => showNotice(`${document.reference} opened for review.`)} className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-1.5 rounded uppercase cursor-pointer">Review</button>}</div></div></div>)}{filteredDocuments.length === 0 && <div className="p-10 text-center text-xs text-gray-400">No expense documents match this view.</div>}</div>
      </section>}

      {activeView === 'approvals' && <section className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4"><div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden"><div className="p-4 border-b border-gray-200"><h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Dual-control approval queue</h2><p className="text-xs text-gray-500 mt-1">Each document must pass the Account Clerk, Finance Officer, and Secretary / Chairman checkpoints.</p></div><div className="divide-y divide-gray-100">{documents.filter((document) => document.status === 'Pending approval').map((document) => <div key={document.id} className="p-4"><div className="flex flex-col md:flex-row md:items-center justify-between gap-3"><div><span className="font-mono text-[10px] text-gray-400">{document.reference}</span><p className="text-xs font-semibold text-gray-900 mt-1">{document.payee}</p><p className="text-[11px] text-gray-500 mt-1">{document.description}</p></div><div className="flex items-center gap-3"><span className="font-mono font-bold text-sm text-rose-800">{formatLKR(document.amount)}</span><button type="button" onClick={() => moveToNextStep(document.id)} className="bg-[#A31736] hover:bg-[#801028] text-white text-[10px] font-bold px-2.5 py-1.5 rounded uppercase cursor-pointer">Record approval</button></div></div><div className="flex items-center gap-1 mt-4">{['Account Clerk', 'Finance Officer', 'Secretary / Chairman'].map((step, index) => <React.Fragment key={step}><div className={`flex-1 border rounded px-2 py-2 ${document.currentStep === step ? 'border-amber-300 bg-amber-50' : index < ['Account Clerk', 'Finance Officer', 'Secretary / Chairman'].indexOf(document.currentStep) ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}><p className="text-[9px] font-bold uppercase text-gray-600">{step}</p><p className="text-[9px] text-gray-500 mt-0.5">{document.currentStep === step ? 'Current action' : index < ['Account Clerk', 'Finance Officer', 'Secretary / Chairman'].indexOf(document.currentStep) ? 'Approved' : 'Pending'}</p></div>{index < 2 && <span className="text-gray-300 text-xs">&gt;</span>}</React.Fragment>)}</div></div>)}</div></div><div className="bg-[#3E151D] text-white rounded shadow-sm p-5"><p className="text-[10px] uppercase tracking-[0.18em] text-rose-200 font-bold">Control rule</p><h3 className="text-lg font-bold mt-2">No self-approval</h3><p className="text-xs text-rose-100/80 mt-2 leading-relaxed">The person who captures a bill cannot approve the same document. Every transition is recorded against the acting officer.</p><div className="border-t border-white/15 mt-5 pt-4"><p className="text-[10px] uppercase tracking-wider text-rose-200 font-bold">Current exposure</p><p className="font-mono text-2xl font-bold mt-1">{formatLKR(approvalAmount)}</p><p className="text-[11px] text-rose-100/70 mt-1">Across {pendingCount} documents</p></div></div></section>}

      {activeView === 'links' && <section className="grid grid-cols-1 lg:grid-cols-2 gap-4"><div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden"><div className="p-4 border-b border-gray-200"><div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Fleet Management</h2><p className="text-xs text-gray-500 mt-1">Maintenance logs ready to become finance documents.</p></div><span className="bg-orange-50 text-orange-800 border border-orange-200 rounded px-2 py-1 text-[9px] font-bold uppercase">2 linked</span></div></div><div className="p-4 space-y-3">{documents.filter((document) => document.source === 'Fleet Maintenance').map((document) => <div key={document.id} className="border border-orange-200 bg-orange-50/40 rounded p-3 flex items-center justify-between gap-3"><div><span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase ${sourceStyles[document.source]}`}>{document.source}</span><p className="text-xs font-semibold text-gray-900 mt-2">{document.description}</p><p className="text-[10px] text-gray-500 mt-1">{document.reference} · {formatLKR(document.amount)}</p></div><button type="button" onClick={() => showNotice(`${document.reference} linked to the expense queue.`)} className="text-[#A31736] text-[10px] font-bold uppercase hover:underline cursor-pointer">View link</button></div>)}</div></div><div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden"><div className="p-4 border-b border-gray-200"><div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Inventory Management</h2><p className="text-xs text-gray-500 mt-1">Purchase order vouchers matched to stock restock events.</p></div><span className="bg-cyan-50 text-cyan-800 border border-cyan-200 rounded px-2 py-1 text-[9px] font-bold uppercase">1 linked</span></div></div><div className="p-4 space-y-3">{documents.filter((document) => document.source === 'Inventory Management').map((document) => <div key={document.id} className="border border-cyan-200 bg-cyan-50/40 rounded p-3 flex items-center justify-between gap-3"><div><span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase ${sourceStyles[document.source]}`}>{document.source}</span><p className="text-xs font-semibold text-gray-900 mt-2">{document.description}</p><p className="text-[10px] text-gray-500 mt-1">{document.reference} · {formatLKR(document.amount)}</p></div><button type="button" onClick={() => showNotice(`${document.reference} stock receipt confirmed.`)} className="text-[#A31736] text-[10px] font-bold uppercase hover:underline cursor-pointer">View link</button></div>)}</div></div></section>}
    </div>
  )
}

export default BillsExpensesPage