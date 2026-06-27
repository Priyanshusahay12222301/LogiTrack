import React, { useState } from "react";
import { motion } from "motion/react";
import { MoreHorizontal, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Edit2, Trash2 } from "lucide-react";
import { Shipment, SortKey } from "@/features/shipments/types";
import { StatusBadge } from "./ShipmentStatus";
import { useOutsideClick } from "@/shared/hooks/useOutsideClick";
import { EmptyState } from "@/shared/common/EmptyState";
import { Skeleton } from "@/shared/ui/skeleton";

// ─── Row Actions Menu ─────────────────────────────────────────────────────────

interface RowMenuProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function RowMenu({ onView, onEdit, onDelete, onClose }: RowMenuProps) {
  const ref = useOutsideClick(onClose);
  return (
    <div
      ref={ref}
      className="absolute right-3 top-full mt-0.5 w-40 z-30 bg-white border border-gray-200 rounded-lg shadow-sm py-1 text-sm text-gray-900"
    >
      <button
        onClick={onView}
        className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <Eye size={13} className="text-gray-500" />
        View Details
      </button>
      <button
        onClick={onEdit}
        className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <Edit2 size={13} className="text-gray-500" />
        Edit Status
      </button>
      <div className="my-1 border-t border-gray-200" />
      <button
        onClick={onDelete}
        className="flex items-center gap-2.5 w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
      >
        <Trash2 size={13} />
        Delete
      </button>
    </div>
  );
}

// ─── Sort TH ─────────────────────────────────────────────────────────────────

interface SortThProps {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}

function SortTh({ label, active, dir, onClick }: SortThProps) {
  return (
    <th
      onClick={onClick}
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-gray-700 select-none group"
    >
      <span className="flex items-center gap-1">
        {label}
        {active ? (
          dir === "asc" ? (
            <ArrowUp size={11} className="text-blue-600" />
          ) : (
            <ArrowDown size={11} className="text-blue-600" />
          )
        ) : (
          <ArrowUpDown size={11} className="opacity-0 group-hover:opacity-40" />
        )}
      </span>
    </th>
  );
}

// ─── Pager ────────────────────────────────────────────────────────────────────

interface PagerProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}

function Pager({ page, totalPages, total, pageSize, onPage }: PagerProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <p className="text-xs text-gray-500">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} shipments
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-colors cursor-pointer ${
              p === page ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {[80, 140, 140, 55, 80, 90, 24].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <Skeleton className="h-4 rounded" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ─── ShipmentTable ────────────────────────────────────────────────────────────

interface ShipmentTableProps {
  filtered: Shipment[];
  paginated: Shipment[];
  loading: boolean;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  toggleSort: (k: SortKey) => void;
  page: number;
  totalPages: number;
  pageSize: number;
  setPage: (p: number) => void;
  onViewDetails: (s: Shipment) => void;
  onEditStatus: (s: Shipment) => void;
  onDeleteTarget: (id: string) => void;
  onCreateOpen: () => void;
}

export function ShipmentTable({
  filtered,
  paginated,
  loading,
  sortKey,
  sortDir,
  toggleSort,
  page,
  totalPages,
  pageSize,
  setPage,
  onViewDetails,
  onEditStatus,
  onDeleteTarget,
  onCreateOpen,
}: ShipmentTableProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  if (!loading && filtered.length === 0) {
    return <EmptyState onNew={onCreateOpen} />;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Shipment Records</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {loading
              ? "Loading…"
              : `${filtered.length} ${filtered.length === 1 ? "entry" : "entries"}`}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <SortTh label="Tracking ID" active={sortKey === "id"} dir={sortDir} onClick={() => toggleSort("id")} />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Sender</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Receiver</th>
              <SortTh label="Weight" active={sortKey === "weight"} dir={sortDir} onClick={() => toggleSort("weight")} />
              <SortTh label="Est. Delivery" active={sortKey === "eta"} dir={sortDir} onClick={() => toggleSort("eta")} />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              : paginated.map((s, idx) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => onViewDetails(s)}
                    className={`border-b border-gray-100 hover:bg-[#FAFAFA] cursor-pointer transition-colors ${
                      idx === paginated.length - 1 ? "border-0" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                        {s.id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-medium text-gray-900">{s.sender}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.senderCity}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-medium text-gray-900">{s.receiver}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.receiverCity}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-gray-700">{s.weight} kg</td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-gray-700">{s.estimatedDelivery}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenMenu((p) => (p === s.id ? null : s.id))}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                      {openMenu === s.id && (
                        <RowMenu
                          onView={() => {
                            onViewDetails(s);
                            setOpenMenu(null);
                          }}
                          onEdit={() => {
                            onEditStatus(s);
                            setOpenMenu(null);
                          }}
                          onDelete={() => {
                            onDeleteTarget(s.id);
                            setOpenMenu(null);
                          }}
                          onClose={() => setOpenMenu(null)}
                        />
                      )}
                    </td>
                  </motion.tr>
                ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} totalPages={totalPages} total={filtered.length} pageSize={pageSize} onPage={setPage} />
    </div>
  );
}
