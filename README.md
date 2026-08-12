# Inventory Management — Rebuilt (v2)

This replaces the Copilot-generated version with one that matches
`fleet-management`'s level of polish: modal-based actions, a full
request → approve/reject → stock-updated lifecycle, and a visual
availability indicator.

## What changed vs. the old version

| Old version | New version |
|---|---|
| Inline forms on each page | Modal dialogs (`RecordUsageModal`, `RequestStockModal`, `RejectRequestModal`), matching fleet-management's exact modal pattern (overlay, header dot, info banner, footer buttons) |
| Plain text status (`Pending`/`Approved`/`Rejected`) | Colour-coded status badges (`ItemStatusBadge`, `ApprovalStatusBadge`), matching fleet-management's pill style |
| No way to *see* stock level at a glance | `AvailabilityBar` — a visual bar per item showing current quantity vs. a reorder threshold marker, colour-coded green/orange/red |
| Approving a request did nothing to stock | Approving now **actually increases the matching item's quantity** and recalculates its status (In Stock / Low Stock / Out of Stock) |
| Rejecting had no reason captured | Rejection now opens a modal requiring a reason, stored on the request and shown in the history |
| No overview/landing page | New `InventoryOverviewPage` with summary cards (total items, low stock, out of stock, pending requests) and quick links |
| Flat item fields | Items now have `itemCode`, `department`, `reorderLevel`, `maxStock`, and a `usageHistory` log, matching the depth of `VehicleRecord` in fleet-management |
| No usage history table | `StockUsagePage` now shows an aggregated, sorted usage history table across all items, matching `FleetMaintenancePage`'s history table pattern |
| No category filter | `AllInventoryPage` now has a category filter alongside search |
| No way to see what's unavailable, or who used it | **New:** `UnavailableItemsPanel` on the Overview page lists every Low Stock / Out of Stock item along with **who last used it, their department, how much, and when** (pulled from that item's usage history) — so shortages are traceable at a glance. `AllInventoryPage` also got a "Show Unavailable Only" toggle for a quick filtered view |

## Files

```
inventory-management-v2/
  data/
    initialInventoryData.ts     — types, computeItemStatus(), mock data
  hooks/
    useInventoryData.ts         — state + full request/approve/reject/usage logic
  components/
    StatusBadges.tsx            — ItemStatusBadge, ApprovalStatusBadge
    AvailabilityBar.tsx         — visual stock-level bar
    RecordUsageModal.tsx
    RequestStockModal.tsx
    RejectRequestModal.tsx
  pages/
    InventoryOverviewPage.tsx   — NEW
    AllInventoryPage.tsx        — rebuilt
    StockUsagePage.tsx          — rebuilt
    InventoryRequestPage.tsx    — rebuilt
    InventoryApprovePage.tsx    — rebuilt
  inventoryRoutes.tsx           — updated with the new overview route
```

## How to install

1. Copy the entire `inventory-management-v2` folder's contents into
   `src/features/inventory-management/`, **replacing** the existing
   `data/`, `hooks/`, `components/`, `pages/`, and `inventoryRoutes.tsx`.
2. Check the import path in `InventoryApprovePage.tsx`:
   ```ts
   import { useAuth } from '../../../context/AuthContext'
   ```
   This assumes the same relative path used elsewhere in your project
   (three levels up from `pages/`). Adjust it if your actual
   `AuthContext` lives somewhere else — check how `fleet-management`'s
   pages import it, if any of them do, and match that instead.
3. If your sidebar previously linked to `/inventory-management`
   directly, it will still work — that route now redirects to
   `/inventory-management/overview`. Consider adding an "Overview"
   sub-link in the sidebar alongside All Inventory / Stock Usage /
   Request / Approvals.
4. Run `npm run build` and `npm run lint` and fix anything that
   doesn't match your project's exact conventions (e.g. if
   `useAuth()`'s `user` object doesn't have a `role` or `name` field
   exactly like this, adjust `InventoryApprovePage.tsx` accordingly).

## Still mock/prototype (same as before)

- Data persists to `localStorage` only (key: `pradeshiya_inventory_data_v2`) — no backend yet
- Approving a request only updates stock if an item with a **matching
  name** already exists; a real backend would handle creating brand
  new items too
- The admin-only guard on the Approvals page is a placeholder
  (`user?.role === 'admin'`) — needs real role-based access control
