import React, { useMemo, useState } from 'react'

type StatementLine = {
  id: string
  date: string
  description: string
  reference: string
  amount: number
  status: 'Suggested' | 'Unmatched' | 'Reconciled'
}

type CashBookMatch = {
  id: string
  date: string
  description: string
  reference: string
  amount: number
  confidence: number
}

const statementLines: StatementLine[] = [
  { id: 'ST-1048', date: '18 Sep 2026', description: 'HPS ASSESSMENT TAX / WARD 04', reference: 'TXN-884201', amount: 48500, status: 'Suggested' },
  { id: 'ST-1047', date: '18 Sep 2026', description: 'CEYLON ELECTRICITY BOARD', reference: 'CEB-SEP-884', amount: -126400, status: 'Suggested' },
  { id: 'ST-1046', date: '17 Sep 2026', description: 'S. PERERA - ASSESSMENT 2026', reference: 'ASMT-22091', amount: 12500, status: 'Unmatched' },
  { id: 'ST-1045', date: '17 Sep 2026', description: 'SALARY TRANSFER - SEPTEMBER', reference: 'PAY-SEP-2026', amount: -1842500, status: 'Suggested' },
  { id: 'ST-1044', date: '16 Sep 2026', description: 'MUNICIPAL RATES COLLECTION', reference: 'TXN-883796', amount: 34200, status: 'Suggested' },
]

const cashBookMatches: Record<string, CashBookMatch[]> = {
  'ST-1048': [{ id: 'CB-2091', date: '18 Sep 2026', description: 'Assessment tax receipt - Ward 04 consolidated', reference: 'TXN-884201', amount: 48500, confidence: 99 }],
  'ST-1047': [{ id: 'CB-2088', date: '18 Sep 2026', description: 'Electricity account - council offices', reference: 'CEB-SEP-884', amount: -126400, confidence: 96 }],
  'ST-1046': [{ id: 'CB-2086', date: '17 Sep 2026', description: 'Assessment receipt - S. Perera', reference: 'ASMT-22091', amount: 12500, confidence: 91 }],
  'ST-1045': [{ id: 'CB-2083', date: '17 Sep 2026', description: 'Monthly staff payroll transfer', reference: 'PAY-SEP-2026', amount: -1842500, confidence: 98 }],
  'ST-1044': [{ id: 'CB-2079', date: '16 Sep 2026', description: 'Assessment tax receipt batch', reference: 'TXN-883796', amount: 34200, confidence: 94 }],
}

const formatLKR = (amount: number) => `${amount < 0 ? '-' : ''}LKR ${Math.abs(amount).toLocaleString('en-US')}`

const statusStyles: Record<StatementLine['status'], string> = {
  Suggested: 'bg-blue-50 text-blue-700 border-blue-200',
  Unmatched: 'bg-amber-50 text-amber-700 border-amber-200',
  Reconciled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export const BankReconciliationPage: React.FC = () => {
  const [selectedLineId, setSelectedLineId] = useState(statementLines[0].id)
  const [lines, setLines] = useState(statementLines)
  const [fileType, setFileType] = useState('CSV')
  const [importedFile, setImportedFile] = useState('No file selected')
  const [activeTab, setActiveTab] = useState<'matcher' | 'rules' | 'exceptions'>('matcher')
  const [enabledRules, setEnabledRules] = useState([true, true, false])
  const [notice, setNotice] = useState('')

  const selectedLine = lines.find((line) => line.id === selectedLineId) ?? lines[0]
  const suggestions = useMemo(() => cashBookMatches[selectedLine.id] ?? [], [selectedLine.id])
  const unmatchedCount = lines.filter((line) => line.status === 'Unmatched').length
  const reconciledCount = lines.filter((line) => line.status === 'Reconciled').length

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2800)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImportedFile(file.name)
    showNotice(`${fileType} statement loaded and ready to review.`)
  }

  const reconcileSelected = () => {
    setLines((current) => current.map((line) => line.id === selectedLine.id ? { ...line, status: 'Reconciled' } : line))
    showNotice(`${selectedLine.reference} reconciled successfully.`)
  }

  return (
    <div className="space-y-5 text-left pb-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A31736]">
            <span className="w-2 h-2 rounded-full bg-[#A31736]" /> Finance Management / Control Desk
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase mt-1">Bank Reconciliation</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Match bank activity to the municipal cash book and clear exceptions before period close.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded uppercase tracking-wider cursor-pointer flex items-center gap-2 shadow-xs">
            <span className="text-base leading-none">↑</span> Import statement
            <input type="file" accept=".csv,.ofx,.mt940,.sta" onChange={handleImport} className="hidden" />
          </label>
          <button type="button" onClick={() => showNotice('Reconciliation report prepared for export.')} className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-3 py-2 rounded uppercase tracking-wider cursor-pointer shadow-sm">Export report</button>
        </div>
      </div>

      {notice && <div className="border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-2.5 rounded text-xs font-semibold" role="status">{notice}</div>}

      <section className="bg-white border border-gray-300 rounded shadow-sm p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Bank statement import</h2>
            <p className="text-xs text-gray-500 mt-1">Load a statement to create a review batch. Supported formats: CSV, OFX, and MT940.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['CSV', 'OFX', 'MT940'].map((type) => <button key={type} type="button" onClick={() => setFileType(type)} className={`px-3 py-1.5 rounded border text-[10px] font-bold tracking-wider cursor-pointer ${fileType === type ? 'bg-[#A31736] text-white border-[#A31736]' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>{type}</button>)}
            <span className="text-[11px] text-gray-500 border-l border-gray-200 pl-3 max-w-[180px] truncate" title={importedFile}>{importedFile}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-100">
          {[
            ['Statement balance', 'LKR 28,406,720', 'As at 18 Sep 2026'],
            ['Cash book balance', 'LKR 28,362,020', 'As at 18 Sep 2026'],
            ['Unreconciled', `${unmatchedCount + 4} lines`, 'Requires attention'],
            ['Reconciled this batch', `${reconciledCount + 42} lines`, '91.4% complete'],
          ].map(([label, value, note]) => <div key={label} className="border-l-2 border-gray-200 pl-3"><p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{label}</p><p className="text-sm font-mono font-bold text-gray-900 mt-1">{value}</p><p className="text-[10px] text-gray-400 mt-0.5">{note}</p></div>)}
        </div>
      </section>

      <div className="flex items-center gap-1 border-b border-gray-300">
        {([['matcher', 'Side-by-side matcher'], ['rules', 'Automated match rules'], ['exceptions', `Exception queue (${unmatchedCount + 4})`]] as const).map(([tab, label]) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer ${activeTab === tab ? 'text-[#A31736] border-[#A31736]' : 'text-gray-500 border-transparent hover:text-gray-800'}`}>{label}</button>)}
      </div>

      {activeTab === 'matcher' && <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between"><div><h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Bank statement lines</h2><p className="text-[11px] text-gray-500 mt-0.5">18 Sep 2026 · HNB Current Account **** 4821</p></div><span className="text-[10px] font-bold text-gray-500 uppercase">{lines.length} shown</span></div>
          <div className="divide-y divide-gray-100">{lines.map((line) => <button key={line.id} type="button" onClick={() => setSelectedLineId(line.id)} className={`w-full text-left p-3.5 cursor-pointer transition-colors ${selectedLineId === line.id ? 'bg-rose-50 border-l-4 border-[#A31736]' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}><div className="flex justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><span className="font-mono text-[10px] text-gray-400">{line.id}</span><span className="text-[10px] text-gray-500">{line.date}</span></div><p className="text-xs font-semibold text-gray-800 truncate mt-1">{line.description}</p><p className="text-[10px] font-mono text-gray-400 mt-1">Ref: {line.reference}</p></div><div className="text-right shrink-0"><p className={`text-xs font-mono font-bold ${line.amount < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{formatLKR(line.amount)}</p><span className={`inline-block mt-1 px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase ${statusStyles[line.status]}`}>{line.status}</span></div></div></button>)}</div>
        </div>
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between"><div><h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Suggested cash book matches</h2><p className="text-[11px] text-gray-500 mt-0.5">{selectedLine.description}</p></div><span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded">AI SUGGESTION</span></div>
          <div className="p-4">{suggestions.map((match) => <div key={match.id} className="border border-blue-200 bg-blue-50/40 rounded p-4"><div className="flex justify-between gap-3"><div><span className="font-mono text-[10px] text-blue-700">{match.id}</span><p className="text-sm font-semibold text-gray-900 mt-1">{match.description}</p><p className="text-[11px] text-gray-500 mt-1">{match.date} · Ref: {match.reference}</p></div><p className="text-sm font-mono font-bold text-gray-900">{formatLKR(match.amount)}</p></div><div className="flex items-center justify-between mt-5 pt-3 border-t border-blue-200"><span className="text-[11px] text-blue-800 font-semibold">{match.confidence}% match confidence · Exact reference</span><button type="button" onClick={reconcileSelected} className="bg-[#A31736] hover:bg-[#801028] text-white text-[10px] font-bold px-3 py-2 rounded uppercase tracking-wider cursor-pointer">Reconcile</button></div></div>)}{suggestions.length === 0 && <div className="py-12 text-center text-gray-400 text-xs">No automatic match found. Review this line in the exception queue.</div>}<div className="mt-4 flex items-center justify-between text-[11px] text-gray-500"><span>Selected bank line: <strong className="text-gray-800">{selectedLine.reference}</strong></span><button type="button" onClick={() => showNotice('Manual match workflow opened.')} className="text-[#A31736] font-bold hover:underline cursor-pointer">Find another transaction</button></div></div>
        </div>
      </section>}

      {activeTab === 'rules' && <section className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden"><div className="p-4 border-b border-gray-200"><h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Automated match rules</h2><p className="text-xs text-gray-500 mt-1">Rules run in order on every imported statement. Exact references take precedence over recurring patterns.</p></div><div className="divide-y divide-gray-100">{[['Exact reference number', 'Match bank reference to cash book reference exactly', 'HIGH'], ['Assessment transfer pattern', 'Match recurring assessment deposits by payer and amount', 'MEDIUM'], ['Payroll batch reference', 'Match approved payroll transfers with the monthly batch number', 'HIGH']].map(([name, description, confidence], index) => <div key={name} className="flex items-center justify-between gap-4 p-4"><div className="flex items-start gap-3"><span className="w-6 h-6 rounded bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center">0{index + 1}</span><div><p className="text-xs font-bold text-gray-900">{name}<span className="ml-2 text-[9px] text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded">{confidence} CONFIDENCE</span></p><p className="text-[11px] text-gray-500 mt-1">{description}</p></div></div><button type="button" aria-label={`Toggle ${name}`} onClick={() => setEnabledRules((rules) => rules.map((enabled, ruleIndex) => ruleIndex === index ? !enabled : enabled))} className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${enabledRules[index] ? 'bg-emerald-500' : 'bg-gray-300'}`}><span className={`block w-4 h-4 bg-white rounded-full transition-transform ${enabledRules[index] ? 'translate-x-5' : ''}`} /></button></div>)}</div><div className="p-4 bg-gray-50 border-t border-gray-200"><button type="button" onClick={() => showNotice('New rule builder opened.')} className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold px-3 py-2 rounded uppercase tracking-wider cursor-pointer">+ Create custom rule</button></div></section>}

      {activeTab === 'exceptions' && <section className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden"><div className="p-4 border-b border-gray-200 flex items-center justify-between"><div><h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Unreconciled exception queue</h2><p className="text-xs text-gray-500 mt-1">Deposits and disputed entries requiring an officer decision.</p></div><span className="bg-amber-50 text-amber-700 border border-amber-200 rounded px-2 py-1 text-[10px] font-bold uppercase">{unmatchedCount + 4} open</span></div><div className="divide-y divide-gray-100"><div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"><div><div className="flex items-center gap-2"><span className="font-mono text-[10px] text-gray-400">EX-0192</span><span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">UNIDENTIFIED DEPOSIT</span></div><p className="text-xs font-semibold text-gray-900 mt-1">S. PERERA - ASSESSMENT 2026</p><p className="text-[11px] text-gray-500 mt-1">17 Sep 2026 · Ref ASMT-22091 · Deposit has no approved receipt linked.</p></div><div className="flex items-center gap-3"><span className="font-mono font-bold text-emerald-700 text-sm">LKR 12,500</span><button type="button" onClick={() => showNotice('Exception assigned to the Finance Investigation Desk.')} className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-[10px] font-bold px-2.5 py-1.5 rounded uppercase cursor-pointer">Investigate</button></div></div><div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"><div><div className="flex items-center gap-2"><span className="font-mono text-[10px] text-gray-400">EX-0191</span><span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">DISPUTED WITHDRAWAL</span></div><p className="text-xs font-semibold text-gray-900 mt-1">ATM CASH WITHDRAWAL - UNRECOGNISED</p><p className="text-[11px] text-gray-500 mt-1">16 Sep 2026 · Ref ATM-662801 · Awaiting branch confirmation.</p></div><div className="flex items-center gap-3"><span className="font-mono font-bold text-rose-700 text-sm">-LKR 25,000</span><button type="button" onClick={() => showNotice('Exception assigned to the Finance Investigation Desk.')} className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-[10px] font-bold px-2.5 py-1.5 rounded uppercase cursor-pointer">Investigate</button></div></div></div></section>}
    </div>
  )
}

export default BankReconciliationPage