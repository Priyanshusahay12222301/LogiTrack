"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  BarChart2,
  MapPin,
  Search,
  Filter,
  Download,
  Plus,
  ArrowRight,
  PackageOpen,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  LayoutDashboard,
  Package,
  ActivitySquare,
  Settings,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { useShipmentContext } from "@/shared/providers/ShipmentContext";
import { StatsCards } from "@/features/dashboard/components/StatsCards";
import { SearchBar } from "@/features/dashboard/components/SearchBar";
import { Filters } from "@/features/dashboard/components/Filters";
import { ShipmentTable } from "@/features/shipments/components/ShipmentTable";
import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { StatsSkeleton, ChartsSkeleton, TableSkeleton } from "@/shared/common/Loader";
import { Status, SortKey } from "@/features/shipments/types";
import { exportCSV } from "@/lib/export";

const STATUS_LIST: Status[] = ["Pending", "In Transit", "Delivered", "Delayed"];
const STATUS_COLOR: Record<Status, string> = {
  Pending: "#F59E0B",
  "In Transit": "#2563EB",
  Delivered: "#16A34A",
  Delayed: "#DC2626",
};

const WEEKLY = [
  { day: "Mon", shipments: 8, delivered: 5 },
  { day: "Tue", shipments: 14, delivered: 10 },
  { day: "Wed", shipments: 11, delivered: 8 },
  { day: "Thu", shipments: 18, delivered: 13 },
  { day: "Fri", shipments: 9, delivered: 7 },
  { day: "Sat", shipments: 6, delivered: 4 },
  { day: "Sun", shipments: 4, delivered: 3 },
];

const TOP_ROUTES = [
  { from: "Delhi", to: "Mumbai", count: 24, pct: 88 },
  { from: "Bangalore", to: "Chennai", count: 18, pct: 72 },
  { from: "Kolkata", to: "Hyderabad", count: 15, pct: 60 },
  { from: "Pune", to: "Ahmedabad", count: 11, pct: 44 },
  { from: "Jaipur", to: "Lucknow", count: 8, pct: 32 },
];

const PAGE_SIZE = 10;

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-white/10">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

function etaMs(s: any) {
  const mo: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };
  const parts = s.estimatedDelivery.split(" ");
  if (parts.length < 2) return 0;
  const [d, m] = parts;
  return new Date(2026, mo[m] ?? 0, Number(d)).getTime();
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const {
    shipments,
    activities,
    loading,
    setCreateOpen,
    setDetailsShip,
    setEditStatusShip,
    setDeleteTarget,
  } = useShipmentContext();

  // Search & Filter state (used for shipments tab)
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // Reset page on search filters change
  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, sortKey, sortDir]);

  // Filter shipments
  const filtered = shipments.filter((s) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      [s.id, s.sender, s.receiver, s.senderCity, s.receiverCity].some((v) =>
        v.toLowerCase().includes(q)
      );
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  // Sort shipments
  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const cmp =
      sortKey === "id"
        ? a.id.localeCompare(b.id)
        : sortKey === "weight"
        ? a.weight - b.weight
        : etaMs(a) - etaMs(b);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(k: SortKey) {
    if (sortKey === k) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir("asc");
    }
  }

  // Stats Breakdown
  const counts = {
    total: shipments.length,
    pending: shipments.filter((s) => s.status === "Pending").length,
    inTransit: shipments.filter((s) => s.status === "In Transit").length,
    delivered: shipments.filter((s) => s.status === "Delivered").length,
    delayed: shipments.filter((s) => s.status === "Delayed").length,
  };

  const pieData = STATUS_LIST.map((s) => ({
    name: s,
    value: shipments.filter((sh) => sh.status === s).length,
    color: STATUS_COLOR[s],
  })).filter((d) => d.value > 0);

  const successRate =
    counts.delivered + counts.delayed > 0
      ? Math.round((counts.delivered / (counts.delivered + counts.delayed)) * 100)
      : 100;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Loading States
  if (loading) {
    return (
      <div className="p-6 flex flex-col gap-6 max-w-[1400px]">
        <StatsSkeleton />
        <ChartsSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-[1400px]">
      {/* ─── 1. Main Dashboard View ────────────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <>
          {/* Welcome banner */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{greeting}, Dispatcher 👋</h2>
              <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your shipments today.</p>
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 cursor-pointer"
            >
              <Plus size={15} />New Shipment
            </button>
          </div>

          {/* Stats Cards */}
          <StatsCards shipments={shipments} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Area Chart */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Weekly Shipment Volume</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Shipments created vs. delivered — this week</p>
                </div>
                <span className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded-full bg-blue-600 inline-block" />Created
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded-full bg-[#16A34A] inline-block" />Delivered
                  </span>
                </span>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={WEEKLY} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="shipments"
                      name="Created"
                      stroke="#2563EB"
                      strokeWidth={2}
                      fill="url(#gBlue)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#2563EB" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="delivered"
                      name="Delivered"
                      stroke="#16A34A"
                      strokeWidth={2}
                      fill="url(#gGreen)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#16A34A" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Status Distribution</h3>
                <p className="text-xs text-gray-500 mt-0.5">Breakdown of all {counts.total} shipments</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-4">
                {counts.total === 0 ? (
                  <p className="text-xs text-gray-400">No shipments to display</p>
                ) : (
                  <div className="relative">
                    <PieChart width={160} height={160}>
                      <Pie
                        data={pieData}
                        cx={75}
                        cy={75}
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                        animationBegin={200}
                        animationDuration={900}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-gray-900">{counts.total}</span>
                      <span className="text-[10px] text-gray-500 font-medium">total</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 w-full pt-2 border-t border-gray-100">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-gray-700">{d.name}</span>
                    </span>
                    <span className="font-semibold text-gray-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row: activity + metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Recent Activity Feed */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Timeline updates</p>
                </div>
              </div>
              <div className="p-5 flex flex-col max-h-[360px] overflow-y-auto">
                {activities.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No activity recorded yet.</p>
                ) : (
                  <ActivityFeed
                    activities={activities.slice(0, 5)}
                    onOpenShipment={(id) => {
                      const s = shipments.find((sh) => sh.id === id);
                      if (s) setDetailsShip(s);
                    }}
                  />
                )}
              </div>
            </div>

            {/* Performance + Top Routes */}
            <div className="flex flex-col gap-5">
              {/* KPIs */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Performance</h3>
                {[
                  {
                    label: "On-Time Rate",
                    value: `${successRate}%`,
                    icon: <Zap size={13} className="text-green-600" />,
                    color: "text-green-600",
                  },
                  {
                    label: "Active Routes",
                    value: counts.pending + counts.inTransit,
                    icon: <BarChart2 size={13} className="text-blue-600" />,
                    color: "text-blue-600",
                  },
                  {
                    label: "Avg. Delivery",
                    value: "2.4 days",
                    icon: <Clock size={13} className="text-amber-600" />,
                    color: "text-amber-600",
                  },
                ].map(({ label, value, icon, color }, i) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2.5 border-t border-gray-50 first:border-0 first:pt-0"
                  >
                    <div className="flex items-center gap-2">
                      {icon}
                      <span className="text-xs text-gray-500">{label}</span>
                    </div>
                    <span className={`text-sm font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Top Routes */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin size={13} className="text-gray-500" />
                  Top Routes
                </h3>
                {TOP_ROUTES.map((r, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 font-medium truncate">
                        {r.from} → {r.to}
                      </span>
                      <span className="text-gray-500 shrink-0 ml-2">{r.count}</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.pct}%` }}
                        transition={{ duration: 1, delay: 0.2 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-blue-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── 2. Shipments List View ────────────────────────────────────────── */}
      {activeTab === "shipments" && (
        <div className="flex flex-col gap-5">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <SearchBar query={query} setQuery={setQuery} />
            <Filters statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
            <div className="flex items-center gap-2 sm:ml-auto">
              <button
                onClick={() => exportCSV(filtered)}
                disabled={filtered.length === 0}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
              >
                <Download size={14} className="text-gray-500" />
                Export CSV
              </button>
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer shadow-sm shadow-blue-200"
              >
                <Plus size={14} />
                New Shipment
              </button>
            </div>
          </div>

          {/* Table */}
          <ShipmentTable
            filtered={filtered}
            paginated={paginated}
            loading={loading}
            sortKey={sortKey}
            sortDir={sortDir}
            toggleSort={toggleSort}
            page={page}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            setPage={setPage}
            onViewDetails={setDetailsShip}
            onEditStatus={setEditStatusShip}
            onDeleteTarget={setDeleteTarget}
            onCreateOpen={() => setCreateOpen(true)}
          />
        </div>
      )}

      {/* ─── 3. Full Activity Timeline View ────────────────────────────────── */}
      {activeTab === "activity" && (
        <div className="max-w-[860px]">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">All Activity</h2>
              <p className="text-xs text-gray-500 mt-0.5">Complete audit trail of shipment changes.</p>
            </div>
            <div className="p-6 flex flex-col">
              {activities.length === 0 ? (
                <p className="text-xs text-gray-400 py-12 text-center">No activity recorded yet.</p>
              ) : (
                <ActivityFeed
                  activities={activities}
                  onOpenShipment={(id) => {
                    const s = shipments.find((sh) => sh.id === id);
                    if (s) setDetailsShip(s);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. Settings View ──────────────────────────────────────────────── */}
      {activeTab === "settings" && (
        <div className="max-w-[680px] flex flex-col gap-5">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Dispatcher Profile</h2>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  DS
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Active Dispatcher</p>
                  <p className="text-xs text-gray-500">Mumbai Central Logistics Hub</p>
                </div>
              </div>
              {[
                ["Full Name", "Dev Singh"],
                ["Role", "Lead Dispatcher"],
                ["Hub Location", "Mumbai Central Hub"],
              ].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between py-2.5 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-500 w-28">{l}</span>
                  <span className="text-sm text-gray-900 flex-1">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">System Notifications</h2>
            </div>
            <div className="p-5 flex flex-col">
              {[
                ["Shipment status changes", "Get notified when a shipment status is updated", true],
                ["New shipment created", "Alert when a new shipment is added", true],
                ["Delivery delays", "Notify when estimated delivery is revised", false],
              ].map(([l, d, on], i) => (
                <div
                  key={i}
                  className={`flex items-start justify-between py-3.5 gap-4 ${
                    i > 0 ? "border-t border-gray-100" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{l}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{d}</p>
                  </div>
                  <div
                    className={`mt-0.5 relative w-9 h-5 rounded-full shrink-0 cursor-pointer ${
                      on ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        on ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile screens */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-5 right-5 md:hidden z-20 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
        aria-label="New Shipment"
      >
        <Plus size={20} />
      </button>
    </div>
  );
}

export default function DashboardFeature() {
  return (
    <Suspense
      fallback={
        <div className="p-6 flex flex-col gap-6 max-w-[1400px]">
          <div className="h-32 w-full animate-pulse bg-gray-200 rounded-xl" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
