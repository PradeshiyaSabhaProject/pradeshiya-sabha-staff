/*
 * Read-only derivations used by the dashboard and the statutory reports.
 */
import type { Application, Business, TradeLicenseDb } from '../types/tradeLicense'
import { chargeBalance, isApplicationOpen, isApplicationOverdue, paymentStatusFor } from './tradeLicenseRules'

export function applicationPayments(db: TradeLicenseDb, app: Application) {
  return {
    processing: paymentStatusFor(app.id, ['PROCESSING_FEE'], db.charges, db.payments),
    license: paymentStatusFor(app.id, ['LICENSE_FEE', 'STAMP_DUTY'], db.charges, db.payments),
  }
}

export function outstandingCharges(db: TradeLicenseDb) {
  return db.charges
    .filter((c) => c.status === 'ACTIVE')
    .map((c) => ({ charge: c, ...chargeBalance(c, db.payments) }))
    .filter((x) => x.outstanding > 0)
}

export function dashboardMetrics(db: TradeLicenseDb, todayIso: string, year: number) {
  const yearApps = db.applications.filter((a) => a.licenseYear === year)
  const unpaid = outstandingCharges(db)
  const statusCounts: Record<string, number> = {}
  yearApps.forEach((a) => {
    statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1
  })
  return {
    totalBusinesses: db.businesses.filter((b) => b.status === 'ACTIVE').length,
    submittedApplications: yearApps.length,
    openApplications: db.applications.filter(isApplicationOpen).length,
    pendingInspections: db.inspections.filter((i) => i.status === 'ASSIGNED').length,
    pendingMohSignOff: db.inspections.filter((i) => {
      const app = db.applications.find((a) => a.id === i.applicationId)
      return i.type === 'PHI' && i.status === 'REPORT_SUBMITTED' && !i.mohSignOff && !!app?.mohSignOffRequired && app.status === 'UNDER_INSPECTION'
    }).length,
    pendingApprovals: db.applications.filter((a) => a.status === 'IN_APPROVAL').length,
    awaitingIssuance: db.applications.filter((a) => a.status === 'APPROVED').length,
    issuedLicenses: db.licenses.filter((l) => l.status === 'ACTIVE' && l.licenseYear === year).length,
    unpaidCount: unpaid.length,
    unpaidAmount: unpaid.reduce((s, x) => s + x.outstanding, 0),
    unpaidLicenseAmount: unpaid.filter((x) => x.charge.type !== 'PROCESSING_FEE').reduce((s, x) => s + x.outstanding, 0),
    overdueApplications: db.applications.filter((a) => isApplicationOverdue(a, todayIso, db.settings)).length,
    activeNotices: db.notices.filter((n) => ['ISSUED', 'REFERRED_TO_LEGAL', 'COURT_ACTION'].includes(n.status)).length,
    statusCounts,
    collectedThisYear: db.payments.filter((p) => p.date.startsWith(String(year))).reduce((s, p) => s + p.amount, 0),
  }
}

const liable = (b: Business) => b.status === 'ACTIVE' && b.liabilities.includes('TRADE_LICENSE')

/** Report 1 – businesses that have not taken the licence for the year. */
export function reportNotLicensed(db: TradeLicenseDb, year: number) {
  return db.businesses
    .filter(liable)
    .filter((b) => !db.licenses.some((l) => l.businessKey === b.key && l.licenseYear === year && l.status === 'ACTIVE'))
    .map((b) => {
      const app = db.applications
        .filter((a) => a.businessKey === b.key && a.licenseYear === year)
        .sort((x, y) => y.createdAt.localeCompare(x.createdAt))[0]
      return { business: b, application: app }
    })
}

/** Report 2 – licence fee / stamp duty not (fully) paid. */
export function reportUnpaid(db: TradeLicenseDb) {
  return db.applications
    .filter((a) => a.feeAssessment && (a.status === 'LICENSED' || a.status === 'APPROVED'))
    .map((a) => ({
      application: a,
      business: db.businesses.find((b) => b.key === a.businessKey),
      license: db.licenses.find((l) => l.id === a.licenseId),
      balance: paymentStatusFor(a.id, ['LICENSE_FEE', 'STAMP_DUTY'], db.charges, db.payments),
    }))
    .filter((r) => r.balance.outstanding > 0)
}

/** Report 3 – businesses with issues (corrections, failed inspections, rejections, notices). */
export function reportIssues(db: TradeLicenseDb, todayIso: string) {
  const rows: { business: Business | undefined; application?: Application; issue: string; severity: 'high' | 'medium' }[] = []
  db.applications.forEach((a) => {
    const business = db.businesses.find((b) => b.key === a.businessKey)
    a.correctionRequests.forEach((c) => {
      if (c.status === 'DEADLINE_MISSED') rows.push({ business, application: a, issue: `Rectification deadline missed (${c.deadline})`, severity: 'high' })
      else if (c.status === 'OPEN')
        rows.push({
          business,
          application: a,
          issue: c.deadline < todayIso.slice(0, 10) ? `Rectification overdue since ${c.deadline}` : `Corrections pending until ${c.deadline}`,
          severity: c.deadline < todayIso.slice(0, 10) ? 'high' : 'medium',
        })
    })
    if (a.status === 'REJECTED') rows.push({ business, application: a, issue: `Application rejected: ${a.rejectionReason ?? ''}`, severity: 'high' })
  })
  db.notices
    .filter((n) => ['ISSUED', 'REFERRED_TO_LEGAL', 'COURT_ACTION'].includes(n.status))
    .forEach((n) =>
      rows.push({
        business: db.businesses.find((b) => b.key === n.businessKey),
        issue: `Legal notice ${n.noticeNo} – ${n.status.replace(/_/g, ' ').toLowerCase()}`,
        severity: n.status === 'ISSUED' ? 'medium' : 'high',
      })
    )
  return rows
}

/** Report 4 – liable businesses that have not submitted an application for the year. */
export function reportNotApplied(db: TradeLicenseDb, year: number) {
  return db.businesses.filter(liable).filter((b) => !db.applications.some((a) => a.businessKey === b.key && a.licenseYear === year && a.status !== 'WITHDRAWN'))
}
