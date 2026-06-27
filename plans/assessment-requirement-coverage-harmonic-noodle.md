# Plan: LogiTrack — Full Assessment Compliance Upgrade

## Context

The current LogiTrack dashboard has excellent UI but is incomplete for the assessment. The reviewer's primary check will be **Firestore + onSnapshot real-time updates**. Data still comes from a static `INITIAL_SHIPMENTS` array. This plan upgrades the app to pass every assessment requirement and adds the highest-value bonus features.

---

## What Gets Added

### 🔴 Critical (assessment blockers)
| Feature | Approach |
|---|---|
| Status update (working) | Updates local state immediately; badge changes live |
| Loading skeletons | Simulate 1.2s load on mount, then show data |
| Empty state | Wire to filtered results being empty |
| Error handling | Try/catch around mutations with toast.error |

### 🟠 High-value additions
| Feature | Approach |
|---|---|
| Shipment Details Drawer | Right-side sheet showing all fields + mini timeline |
| Delete Confirmation Dialog | Radix AlertDialog (already in component lib) |
| Live indicator | Green pulse dot "● Live" in header |
| Toast notifications | Sonner (already installed): Create / Update / Delete |
| Sortable table columns | Client-side sort by ID, Weight, ETA — toggle asc/desc |
| Pagination | 10 per page, client-side, page controls at table bottom |
| Export CSV | `window.URL.createObjectURL` blob download |
| Better Create Drawer | Add Phone, Package Type (Standard/Express/Fragile), Priority, Notes |

### 🟡 Nice-to-have
| Feature | Approach |
|---|---|
| Ctrl+K search focus | `useEffect` keydown listener |
| Analytics section | Computed from shipments: avg delivery time, success rate |
| Progress bar per shipment | Status step indicator in details drawer |
| Activity entries clickable | Opens details drawer for that shipment |

---

## Files to Modify

- `src/app/App.tsx` — full rewrite with all new features (Firebase left for user to wire up separately)

> Firebase integration is skipped — user will handle `src/lib/firebase.ts` and `src/lib/firestore.ts` themselves and plug the real-time listener into the state already shaped for it.

---

## Implementation Steps

### Step 1 — App.tsx state shape (Firebase-ready)
Data stays in `useState<Shipment[]>(INITIAL_SHIPMENTS)` for now, but state + mutations are structured so user can swap in Firestore calls without touching UI:
```ts
// These functions are the only places that touch shipment data —
// user replaces their bodies with Firestore calls
function addShipment(data) { setShipments(p => [data, ...p]); }
function updateStatus(id, status) { setShipments(p => p.map(...)); }
function removeShipment(id) { setShipments(p => p.filter(...)); }
```
Also: `const [loading, setLoading] = useState(true)` — simulated 1.2 s skeleton on mount via `setTimeout`, trivially replaced by Firestore's first snapshot callback.

### Step 2 — Skeleton loader
While `loading === true`, render 6 `<SkeletonRow />` components inside the table `<tbody>` using the existing `src/app/components/ui/skeleton.tsx` component.

### Step 6 — Status update (working)
"Edit Status" in the row menu opens a small inline dropdown (Radix Select or custom). On selection: calls `updateShipmentStatus(id, newStatus)` → Firestore write → onSnapshot fires → UI updates instantly. Toast: "Status updated to In Transit".

### Step 7 — Shipment Details Drawer
Uses existing `src/app/components/ui/sheet.tsx` (Radix Sheet). Triggered by "View" in row menu or clicking a row. Displays:
- Header: tracking ID + status badge
- All fields in a two-column grid
- Mini 4-step progress bar (Pending → In Transit → Delivered, red branch for Delayed)
- Activity timeline filtered to that shipment

### Step 8 — Delete Confirmation Dialog
Uses existing `src/app/components/ui/alert-dialog.tsx`. Fires before `deleteShipment`. Shows shipment ID. Two buttons: Cancel / Delete (red).

### Step 9 — Live Indicator
Top-right of header (left of notification bell):
```tsx
<span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
  </span>
  Live
</span>
```
Shows "Demo" (amber) when Firebase not configured.

### Step 10 — Toast Notifications
Import `toast` from `sonner`. Add `<Toaster position="bottom-right" />` at app root.
- Create: `toast.success("Shipment LT-XXXXX created")`
- Status update: `toast.success("Status updated to In Transit")`
- Delete: `toast.success("Shipment deleted")`
- Error: `toast.error("Failed to connect to Firestore")`

### Step 11 — Sortable table
Add `sortKey` and `sortDir` state. Clicking a column header toggles asc/desc. Columns: Tracking ID, Weight, Est. Delivery. Show `↑`/`↓` arrow next to sorted header.

### Step 12 — Pagination
10 rows per page. Bottom of table: "Showing 1–10 of 42 shipments" + prev/next page buttons + page number pills. Computed from `filtered` array after sort.

### Step 13 — Export CSV
Button next to "New Shipment" in toolbar. Builds a CSV string from `filtered` shipments, triggers browser download via `URL.createObjectURL`.

### Step 14 — Better Create Drawer
Add to the form:
- Phone (optional)
- Package Type: Standard / Express / Fragile (radio/select)
- Priority: Normal / High (toggle)
- Notes (textarea, optional)

### Step 15 — Analytics section (Dashboard only)
Below stat cards, small inline metrics row:
- Avg. Delivery Time (computed from createdAt vs estimatedDelivery)
- On-Time Rate (Delivered / (Delivered + Delayed) × 100)
- Active Routes (Pending + In Transit)

### Step 16 — Ctrl+K shortcut
```ts
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      searchRef.current?.focus();
    }
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);
```

---

## Reused existing components
- `src/app/components/ui/skeleton.tsx` → SkeletonRow
- `src/app/components/ui/alert-dialog.tsx` → DeleteConfirmDialog
- `src/app/components/ui/sheet.tsx` → ShipmentDetailsDrawer
- `src/app/components/ui/sonner.tsx` → Toaster (already wired to theme)
- `src/app/components/ui/select.tsx` → Status dropdown in Edit Status

---

## Verification

1. **Demo Mode** (no .env): App loads with amber "Demo" indicator, static data, all UI works, toasts fire, sort/filter/pagination work.
2. **Live Mode** (with .env): 
   - On first load: collection is empty → seed runs → 10 shipments appear
   - Open two browser tabs → update status in one → both update instantly (onSnapshot)
   - Create a shipment → appears in both tabs
   - Delete → disappears in both tabs
3. Skeleton rows visible during initial Firestore fetch (simulate with network throttle)
4. Ctrl+K focuses search input
5. Export CSV downloads a valid file with current filtered rows
6. Toasts appear bottom-right for all mutations
