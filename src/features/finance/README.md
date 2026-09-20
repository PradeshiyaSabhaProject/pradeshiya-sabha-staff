# Finance Management Feature Module

This directory contains the source code for the Xero-inspired **Finance Management Module** of the Pradeshiya Sabha Staff Web Application.

Refer to the main [FINANCE_MODULE_README.md](../../../FINANCE_MODULE_README.md) for full architectural specifications, data schemas, and design guidelines.

## Directory Structure Strategy

```
src/features/finance/
├── components/           # Reusable finance components (MetricCards, StatusBadges, MatcherCard)
│   ├── FinanceMetricCard.tsx
│   ├── InvoiceStatusBadge.tsx
│   ├── BillStatusBadge.tsx
│   └── BankMatchRow.tsx
├── data/                 # Initial mock data & general ledger account lists
│   └── initialFinanceData.ts
├── hooks/                # Custom React state management hook with localStorage persistence
│   └── useFinanceData.ts
├── modals/               # Action modals (Create Invoice, Voucher Approval, Bank Match)
│   ├── CreateInvoiceModal.tsx
│   ├── RecordVoucherModal.tsx
│   └── ReconcileRuleModal.tsx
├── pages/                # Page components for each sidebar section
│   ├── FinanceOverviewPage.tsx
│   ├── InvoicesPage.tsx
│   ├── BillsPage.tsx
│   ├── BankReconciliationPage.tsx
│   ├── BudgetManagementPage.tsx
│   ├── ChartOfAccountsPage.tsx
│   ├── FinancialReportsPage.tsx
│   └── AssessmentRatesPage.tsx
├── types/                # TypeScript interfaces for financial entities
│   └── finance.ts
├── financeRoutes.tsx     # Sub-routes configuration
└── README.md             # Developer documentation
```
