import {
  REVENUE_ITEMS,
  EXPENDITURE_ITEMS,
  BALANCE_SHEET_SECTIONS,
  TRIAL_BALANCE_ACCOUNTS,
  WARD_ASSESSMENT_RECORDS,
} from '../data/financialReportsData'

/**
 * Universal CSV file download helper conforming to RFC 4180
 */
export const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const escapeCell = (val: string | number): string => {
    const str = String(val ?? '')
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\r\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Universal Excel XML Spreadsheet download helper
 * Generates an XML Spreadsheet 2003 file that Microsoft Excel and Google Sheets open natively
 * with formatted cells, bold column titles, numbers, and multiple worksheets.
 */
export const downloadExcelXML = (
  filename: string,
  sheets: { name: string; headers: string[]; rows: (string | number)[][] }[]
) => {
  const escapeXML = (val: string | number): string => {
    return String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  const formatCell = (val: string | number) => {
    const isNum = typeof val === 'number'
    const type = isNum ? 'Number' : 'String'
    return `<Cell><Data ss:Type="${type}">${escapeXML(val)}</Data></Cell>`
  }

  const xmlSheets = sheets
    .map((sheet) => {
      const headerRow = `<Row ss:StyleID="Header">${sheet.headers
        .map((h) => `<Cell><Data ss:Type="String">${escapeXML(h)}</Data></Cell>`)
        .join('')}</Row>`

      const dataRows = sheet.rows
        .map((row) => `<Row>${row.map(formatCell).join('')}</Row>`)
        .join('')

      return `
    <Worksheet ss:Name="${escapeXML(sheet.name.slice(0, 30))}">
      <Table>
        ${headerRow}
        ${dataRows}
      </Table>
    </Worksheet>`
    })
    .join('\n')

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Bottom"/>
      <Borders/>
      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="Header">
      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#A31736" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
  </Styles>
  ${xmlSheets}
</Workbook>`

  const blob = new Blob([xmlContent], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8',
  })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ── Specialized Export Handlers for the 4 Reports ──────────────────────────

export const exportIncomeExpenditureReport = (format: 'csv' | 'xlsx', period: string = 'YTD') => {
  const headers = ['Account Code', 'Classification', 'Line Item Description', 'Budget Target (LKR)', 'Actual Realized (LKR)', 'Variance (LKR)', 'Realization %', 'Statutory Notes']

  const revRows = REVENUE_ITEMS.map((item) => {
    const actual = period === 'Q1' ? item.q1Actual : period === 'Q2' ? item.q2Actual : period === 'Q3' ? item.q3Actual : item.actualYTD
    const variance = actual - item.budgetAnnual
    const pct = item.budgetAnnual > 0 ? ((actual / item.budgetAnnual) * 100).toFixed(1) : '0.0'
    return [item.code, `Revenue - ${item.category}`, item.title, item.budgetAnnual, actual, variance, `${pct}%`, item.notes]
  })

  const expRows = EXPENDITURE_ITEMS.map((item) => {
    const actual = period === 'Q1' ? item.q1Actual : period === 'Q2' ? item.q2Actual : period === 'Q3' ? item.q3Actual : item.actualYTD
    const variance = item.budgetAnnual - actual
    const pct = item.budgetAnnual > 0 ? ((actual / item.budgetAnnual) * 100).toFixed(1) : '0.0'
    return [item.code, `Expenditure - ${item.category}`, item.title, item.budgetAnnual, actual, variance, `${pct}%`, item.notes]
  })

  const allRows = [...revRows, ...expRows]
  const filename = `HOMAGAMA_PS_INCOME_EXPENDITURE_${period}_2026`

  if (format === 'csv') {
    downloadCSV(filename, headers, allRows)
  } else {
    downloadExcelXML(filename, [
      { name: 'Income & Expenditure', headers, rows: allRows },
      { name: 'Revenue Breakdown', headers, rows: revRows },
      { name: 'Expenditure Breakdown', headers, rows: expRows },
    ])
  }
}

export const exportBalanceSheetReport = (format: 'csv' | 'xlsx') => {
  const headers = ['Account Code', 'Category', 'Balance Sheet Item', 'As at 30 Sep 2026 (LKR)', 'As at 31 Dec 2025 (LKR)', 'Auditor Note']

  const rows: (string | number)[][] = []
  BALANCE_SHEET_SECTIONS.forEach((section) => {
    section.items.forEach((item) => {
      rows.push([item.code, section.category, item.name, item.currentYearAmount, item.priorYearAmount, item.noteNumber || '-'])
    })
  })

  const filename = 'HOMAGAMA_PS_BALANCE_SHEET_2026'

  if (format === 'csv') {
    downloadCSV(filename, headers, rows)
  } else {
    downloadExcelXML(filename, [{ name: 'Statement of Financial Position', headers, rows }])
  }
}

export const exportTrialBalanceReport = (format: 'csv' | 'xlsx') => {
  const headers = ['Account Code', 'Account Name', 'Classification', 'Debit Balance (LKR)', 'Credit Balance (LKR)']

  const rows = TRIAL_BALANCE_ACCOUNTS.map((acc) => [
    acc.code,
    acc.name,
    acc.type,
    acc.debit,
    acc.credit,
  ])

  const totalDebit = TRIAL_BALANCE_ACCOUNTS.reduce((sum, a) => sum + a.debit, 0)
  const totalCredit = TRIAL_BALANCE_ACCOUNTS.reduce((sum, a) => sum + a.credit, 0)
  rows.push(['TOTALS', 'Equality Verification Check', 'Summary', totalDebit, totalCredit])

  const filename = 'HOMAGAMA_PS_TRIAL_BALANCE_2026'

  if (format === 'csv') {
    downloadCSV(filename, headers, rows)
  } else {
    downloadExcelXML(filename, [{ name: 'Trial Balance Ledger', headers, rows }])
  }
}

export const exportAssessmentEfficiencyReport = (format: 'csv' | 'xlsx') => {
  const headers = [
    'Ward Number',
    'Ward Designation',
    'Designated Revenue Officer',
    'Rateable Properties',
    'Annual Rate Demand (LKR)',
    'Collected YTD (LKR)',
    'Arrears Outstanding (LKR)',
    'Efficiency %',
    'Audit Status',
    'Last Audit Verified',
  ]

  const rows = WARD_ASSESSMENT_RECORDS.map((w) => [
    w.wardNumber,
    w.wardName,
    w.inspectorOfficer,
    w.totalRateableProperties,
    w.annualWarrantDemand,
    w.collectedYTD,
    w.arrearsOutstanding,
    `${w.efficiencyPercentage.toFixed(1)}%`,
    w.status,
    w.lastAuditDate,
  ])

  const totalProps = WARD_ASSESSMENT_RECORDS.reduce((sum, w) => sum + w.totalRateableProperties, 0)
  const totalDemand = WARD_ASSESSMENT_RECORDS.reduce((sum, w) => sum + w.annualWarrantDemand, 0)
  const totalCollected = WARD_ASSESSMENT_RECORDS.reduce((sum, w) => sum + w.collectedYTD, 0)
  const totalArrears = WARD_ASSESSMENT_RECORDS.reduce((sum, w) => sum + w.arrearsOutstanding, 0)
  const avgEfficiency = ((totalCollected / totalDemand) * 100).toFixed(1)

  rows.push([
    'TOTALS',
    'All 12 Council Wards Consolidated',
    'Municipal Revenue Department',
    totalProps,
    totalDemand,
    totalCollected,
    totalArrears,
    `${avgEfficiency}%`,
    'Consolidated',
    new Date().toISOString().split('T')[0],
  ])

  const filename = 'HOMAGAMA_PS_ASSESSMENT_COLLECTION_EFFICIENCY_2026'

  if (format === 'csv') {
    downloadCSV(filename, headers, rows)
  } else {
    downloadExcelXML(filename, [{ name: 'Assessment Rate Efficiency', headers, rows }])
  }
}

export const exportAllReportsWorkbook = () => {
  // Generates comprehensive multi-sheet Excel file containing all 4 financial reports
  const ieHeaders = ['Code', 'Type', 'Title', 'Budget (LKR)', 'Actual (LKR)', 'Variance (LKR)']
  const ieRows = [
    ...REVENUE_ITEMS.map((r) => [r.code, 'Revenue', r.title, r.budgetAnnual, r.actualYTD, r.actualYTD - r.budgetAnnual]),
    ...EXPENDITURE_ITEMS.map((e) => [e.code, 'Expenditure', e.title, e.budgetAnnual, e.actualYTD, e.budgetAnnual - e.actualYTD]),
  ]

  const bsHeaders = ['Code', 'Category', 'Line Item', 'As at Sep 2026 (LKR)', 'As at Dec 2025 (LKR)']
  const bsRows: (string | number)[][] = []
  BALANCE_SHEET_SECTIONS.forEach((s) => {
    s.items.forEach((i) => bsRows.push([i.code, s.category, i.name, i.currentYearAmount, i.priorYearAmount]))
  })

  const tbHeaders = ['Code', 'Account Name', 'Type', 'Debit (LKR)', 'Credit (LKR)']
  const tbRows = TRIAL_BALANCE_ACCOUNTS.map((a) => [a.code, a.name, a.type, a.debit, a.credit])

  const wardHeaders = ['Ward', 'Name', 'Officer', 'Properties', 'Demand (LKR)', 'Collected (LKR)', 'Arrears (LKR)', 'Efficiency %']
  const wardRows = WARD_ASSESSMENT_RECORDS.map((w) => [
    w.wardNumber,
    w.wardName,
    w.inspectorOfficer,
    w.totalRateableProperties,
    w.annualWarrantDemand,
    w.collectedYTD,
    w.arrearsOutstanding,
    `${w.efficiencyPercentage}%`,
  ])

  downloadExcelXML('HOMAGAMA_PRADESHIYA_SABHA_ANNUAL_STATUTORY_ACCOUNTS_2026', [
    { name: 'Income & Expenditure', headers: ieHeaders, rows: ieRows },
    { name: 'Balance Sheet', headers: bsHeaders, rows: bsRows },
    { name: 'Trial Balance', headers: tbHeaders, rows: tbRows },
    { name: 'Ward Assessment Efficiency', headers: wardHeaders, rows: wardRows },
  ])
}
