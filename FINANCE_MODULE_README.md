# Finance Management Module — System Architecture & Feature Specification
> **Inspired by Xero Financial Platform** | Tailored for Local Government & Pradeshiya Sabha Administration

---

## Executive Summary

The **Finance Management Module** is designed to provide a comprehensive, modern, cloud-based financial accounting and treasury system for Pradeshiya Sabha staff. Inspired by **Xero’s** intuitive UX, robust double-entry foundation, and automated workflows, this module adapts Xero's core pillars to public-sector local council financial management—covering revenue collections (Assessment rates, business licenses, hall bookings), vendor payables & vouchers, bank reconciliation, budget fund allocations, chart of accounts, and statutory financial reporting.

---

## Sidebar Navigation Architecture

The Finance module will be integrated into the primary application sidebar under **"Finance Management"** (Route Prefix: `/finance`). Below is the complete sidebar sub-navigation hierarchy:

```
📁 Finance Management (/finance)
├── 📊 Finance Dashboard               -> /finance/overview
├── 🧾 Invoices & Revenues             -> /finance/invoices
├── 💳 Bills & Expense Vouchers        -> /finance/bills
├── 🏦 Bank Reconciliation            -> /finance/reconciliation
├── 📈 Budget & Fund Allocations       -> /finance/budgets
├── 🏛️ Chart of Accounts & General Ledger -> /finance/chart-of-accounts
├── 📑 Financial Reports               -> /finance/reports
└── 🏠 Assessment Rates & Taxes        -> /finance/assessment-rates
```

### Detailed Sub-Navigation Items & Role Access

| Sidebar Label | Route Path | Description | Access Roles (RBAC) | Xero Inspiration |
| :--- | :--- | :--- | :--- | :--- |
| **Finance Dashboard** | `/finance/overview` | Real-time cash flow graphs, revenue vs. expense metrics, account watchlist, and pending approvals queue. | Admin, Manager, Accountant | Xero Dashboard / Executive Summary |
| **Invoices & Revenues** | `/finance/invoices` | Creation, issuance, and tracking of revenue invoices (rates, utility fees, permits, market rentals) with receipting. | Admin, Manager, Cashier | Xero Sales & Invoicing |
| **Bills & Expenses** | `/finance/bills` | Vendor bill processing, purchase voucher creation, payment approvals, and staff expense claims. | Admin, Manager, Accountant | Xero Purchases & Bills |
| **Bank Reconciliation** | `/finance/reconciliation` | Automated & manual matching of bank statement lines with council Cash Book entries. | Admin, Accountant | Xero Bank Feeds & Rec |
| **Budget & Fund Allocations** | `/finance/budgets` | Annual municipal budget planning, ward fund allocations, and real-time budget vs. actual variance tracking. | Admin, Manager, Accountant | Xero Budget Manager |
| **Chart of Accounts** | `/finance/chart-of-accounts` | General ledger account hierarchy (Assets, Liabilities, Equity, Revenue, Expense) and manual journal adjustments. | Admin, Accountant | Xero Chart of Accounts & Manual Journals |
| **Financial Reports** | `/finance/reports` | Statutory financial statements: Income & Expenditure, Balance Sheet, Cash Flow, Trial Balance, and Tax Summaries. | Admin, Manager, Accountant, Superadmin | Xero Reports Center |
| **Assessment Rates & Taxes** | `/finance/assessment-rates` | Dedicated ledger for local property rates (Varipanam), business taxes, assessment serial lookup, and penalty calculation. | Admin, Manager, Cashier | Xero Recurring Invoices / Specialty Tax Billing |

---

## TypeScript Sidebar Code Integration

To integrate the new **Finance Management** module into `src/components/layout/Sidebar.tsx`, add the following icon SVG definition and navigation block:

### 1. Icon Definition (`FinanceIcon`)
```tsx
const FinanceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <circle cx="6" cy="15" r="1.5" />
    <path d="M14 15h4" />
  </svg>
)
```

### 2. `navItems` Entry
```tsx
  {
    label: 'Finance Management',
    path: '/finance',
    icon: <FinanceIcon />,
    children: [
      { label: 'Finance Dashboard', path: '/finance/overview', roles: ['admin', 'manager', 'accountant'] },
      { label: 'Invoices & Revenues', path: '/finance/invoices', roles: ['admin', 'manager', 'cashier'] },
      { label: 'Bills & Expenses', path: '/finance/bills', roles: ['admin', 'manager', 'accountant'] },
      { label: 'Bank Reconciliation', path: '/finance/reconciliation', roles: ['admin', 'accountant'] },
      { label: 'Budget & Fund Allocations', path: '/finance/budgets', roles: ['admin', 'manager', 'accountant'] },
      { label: 'Chart of Accounts', path: '/finance/chart-of-accounts', roles: ['admin', 'accountant'] },
      { label: 'Financial Reports', path: '/finance/reports', roles: ['admin', 'manager', 'accountant', 'superadmin'] },
      { label: 'Assessment Rates & Taxes', path: '/finance/assessment-rates', roles: ['admin', 'manager', 'cashier'] },
    ],
  },
```

---

## Detailed Feature Specifications per Sidebar Sub-Module

### 1. Finance Dashboard (`/finance/overview`)
* **Cash Flow Visualizer**: Interactive line/bar chart rendering monthly inflows (revenue collected) vs. outflows (vouchers paid).
* **Key Financial KPI Cards**: Total Revenue YTD, Total Expenditures YTD, Net Operating Surplus/Deficit, Bank Cash Balance.
* **Accounts Watchlist**: Quick-view table tracking high-priority ledger accounts (e.g., Assessment Rates Receivable, Fuel Expense Account, Capital Development Fund).
* **Quick Action Hub**: 1-click modals for *Create Invoice*, *Record Payment Voucher*, *Import Bank Statement*, and *Post Journal*.

### 2. Invoices & Revenues (`/finance/invoices`)
* **Multi-channel Billing**: Generate bills for citizen Assessment Rates, Shop/Stall Rentals, Building Approvals, Trade Licenses, and Equipment Rent.
* **Status Lifecycle**: `Draft` ➔ `Approved & Issued` ➔ `Partially Paid` ➔ `Paid` ➔ `Overdue`.
* **Receipting & Payment Collection**: Integrated payment recording (Cash, Cheque, Bank Transfer, Online Gateway) with auto-generated official counterfoil receipts.
* **Aging Analysis**: Overdue receivables breakdown (Current, 30 days, 60 days, 90+ days) with automated SMS/email reminder triggers.

### 3. Bills & Expenses (`/finance/bills`)
* **Vendor Bill & Payment Voucher Desk**: Capture vendor invoices, contractor certificates, and internal expense reimbursement vouchers.
* **Approval Workflow**: Dual-control approval chain (Account Clerk ➔ Finance Officer ➔ Secretary/Chairman Approval).
* **Cross-Module Linkage**:
  * **Fleet Management**: Auto-populate fuel and vehicle repair bills from Fleet Maintenance logs.
  * **Inventory Management**: Link purchase order vouchers to inventory stock restock events.

### 4. Bank Reconciliation (`/finance/reconciliation`)
* **Bank Statement Import**: CSV / OFX / MT940 bank feed importer.
* **Xero-style Side-by-Side Matcher**: Left panel shows bank statement lines; Right panel suggests matching Cash Book transactions.
* **Automated Match Rules**: Custom rules (e.g., auto-reconcile transactions matching exact reference numbers or recurring assessment bank transfers).
* **Unreconciled Exception Queue**: Flag disputed or unidentified deposits for investigation.

### 5. Budget & Fund Allocations (`/finance/budgets`)
* **Municipal Budget Manager**: Multi-fund budget builder (Recurrent Expenditure Fund, Capital Development Fund, Decentralized Ward Grants).
* **Real-time Variance Analysis**: Compare budgeted allocations vs. committed expenditures vs. actual payouts.
* **Over-budget Warning System**: Prevents voucher approval if a budget line item (Head of Account) has insufficient remaining funds.

### 6. Chart of Accounts & General Ledger (`/finance/chart-of-accounts`)
* **Standard Municipal COA**: Hierarchical numbering system (1000 Assets, 2000 Liabilities, 3000 Fund Balances, 4000 Revenue, 5000 Expenses).
* **Manual Journals**: Support for adjusting journals, year-end accruals, depreciation postings, and fund transfers.
* **Audit Log**: Immutable history of every ledger posting with timestamp, user ID, and source document reference.

### 7. Financial Reports (`/finance/reports`)
* **Income & Expenditure Statement**: Detailed revenue breakdown minus operating expenses showing net surplus/deficit.
* **Balance Sheet (Statement of Financial Position)**: Municipal assets (Cash, Receivables, Property/Fleet Assets) vs. liabilities & fund balances.
* **Trial Balance**: Instant verification of debit and credit equality across all ledger accounts.
* **Assessment Collection Efficiency Report**: Ward-by-ward collection performance percentage.
* **Export Formats**: One-click download as PDF (formatted for council audit), Excel (XLSX), and CSV.

### 8. Assessment Rates & Taxes (`/finance/assessment-rates`)
* **Property Assessment Register**: Searchable database of rateable properties (Assessment No, Ward, Property Owner, Annual Value, Percentage Rate).
* **Quarterly Rate Generation**: Automated quarterly billing run (Q1, Q2, Q3, Q4) with early-payment discount (e.g., 10% discount) or late-payment surcharge (e.g., 10% penalty).
* **Payment History Ledger**: Comprehensive citizen payment timeline per property.

---

## Core Data Schema & Interfaces (`src/features/finance/types/finance.ts`)

```typescript
export type InvoiceStatus = 'Draft' | 'Issued' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';
export type BillStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Paid' | 'Rejected';
export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface ChartOfAccount {
  id: string;
  code: string; // e.g., "4101"
  name: string; // e.g., "Assessment Rates Revenue"
  type: AccountType;
  category: string;
  balance: number;
  isActive: boolean;
}

export interface FinanceInvoice {
  id: string;
  invoiceNumber: string; // e.g., "INV-2026-0042"
  taxpayerOrCustomerName: string;
  assessmentNo?: string;
  issueDate: string;
  dueDate: string;
  items: {
    description: string;
    accountCode: string;
    amount: number;
  }[];
  subtotal: number;
  discountOrPenalty: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
}

export interface FinanceBill {
  id: string;
  voucherNumber: string; // e.g., "VOU-2026-0108"
  vendorName: string;
  invoiceReference: string;
  budgetHeadCode: string;
  date: string;
  dueDate: string;
  amount: number;
  status: BillStatus;
  approvedBy?: string;
  rejectionReason?: string;
  relatedModule?: 'fleet' | 'inventory' | 'assets';
  relatedEntityId?: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  payeeOrPayer: string;
  reference: string;
  amount: number; // positive for deposit, negative for withdrawal
  isReconciled: boolean;
  matchedLedgerEntryId?: string;
}

export interface BudgetAllocation {
  id: string;
  budgetHeadCode: string; // e.g., "5201"
  title: string; // e.g., "Road Maintenance & Repairs"
  allocatedAmount: number;
  committedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  fiscalYear: string;
}
```

---

## UI/UX Design Guidelines (Xero-Inspired Aesthetics)

1. **Color System & Visual Identity**:
   * **Primary Brand Accent**: Xero Cyan `#0284C7` (Sky blue) combined with Deep Navy `#0F172A` for headers and sidebars.
   * **Status Pills**:
     * Paid / Reconciled: Green badge (`bg-emerald-100 text-emerald-800 border-emerald-200`)
     * Pending / Issued: Amber badge (`bg-amber-100 text-amber-800 border-amber-200`)
     * Overdue / Rejected: Red badge (`bg-rose-100 text-rose-800 border-rose-200`)
2. **Interactive Layout Components**:
   * **Summary Metric Cards**: Top banner with icon badge, bold value, percentage trend comparison, and sparkline visualization.
   * **Side-by-Side Reconciliation Split**: Responsive 2-column container with drag-and-drop or click-to-match rows.
   * **Drawer & Modal Workflows**: Fast keyboard-friendly quick entry drawers for invoices and payment vouchers matching the application's existing modal guidelines.

---

## Implementation Plan & Roadmap

- [x] **Phase 1: Research & Sidebar Architecture (Completed)**
  - Define Xero-inspired features tailored for Pradeshiya Sabha.
  - Finalize sidebar sub-menu structure & RBAC rules.
  - Document TypeScript data structures and interfaces.

- [ ] **Phase 2: Core Data Hooks & Mock Store (`src/features/finance/`)**
  - Implement `useFinanceData` custom hook with `localStorage` persistence.
  - Populate realistic mock data for Invoices, Bills, Budgets, and Chart of Accounts.

- [ ] **Phase 3: Sub-Pages Development**
  - `FinanceOverviewPage.tsx` (Dashboard with cash flow chart and accounts watchlist)
  - `InvoicesPage.tsx` & `CreateInvoiceModal.tsx`
  - `BillsPage.tsx` & `VoucherApprovalModal.tsx`
  - `BankReconciliationPage.tsx` (Side-by-side reconciliation interface)
  - `BudgetManagementPage.tsx` (Budget heads & allocation progress bars)
  - `ChartOfAccountsPage.tsx` & `FinancialReportsPage.tsx`
  - `AssessmentRatesPage.tsx`

- [ ] **Phase 4: Routing & Integration**
  - Register `/finance/*` routes in `src/routes/appRoutes.tsx`.
  - Wire up `Sidebar.tsx` navigation items.
  - Connect cross-module hooks with Fleet and Inventory expense logs.

---

*Documentation prepared for Pradeshiya Sabha Staff Portal — Finance Module Architecture.*
