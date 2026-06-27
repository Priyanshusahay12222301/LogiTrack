import React, { useState, useLayoutEffect } from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { TrendingUp, TrendingDown, Package, Clock, Truck, CheckCircle2, AlertTriangle } from "lucide-react";
import { Shipment } from "@/features/shipments/types";

function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  useLayoutEffect(() => {
    if (target === 0) {
      setVal(0);
      return;
    }
    let start = 0;
    const step = Math.ceil(duration / target);
    const t = setInterval(() => {
      start += 1;
      setVal(start);
      if (start >= target) clearInterval(t);
    }, step);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

interface AnimStatCardProps {
  label: string;
  target: number;
  change: number;
  icon: React.ReactNode;
  iconBg: string;
  accent: string;
}

function AnimStatCard({ label, target, change, icon, iconBg, accent }: AnimStatCardProps) {
  const val = useCountUp(target);
  const up = change >= 0;
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 cursor-default select-none"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
      </div>
      <div>
        <div className="flex items-end gap-2">
          <span className="text-[36px] font-bold text-gray-900 leading-none tabular-nums">{val}</span>
          <span className={`flex items-center gap-0.5 text-xs font-semibold pb-1 ${up ? "text-green-600" : "text-red-600"}`}>
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{Math.abs(change)}%
          </span>
        </div>
        <div className="mt-3 h-1 rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((target / (target || 12)) * 100, 100)}%` }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="h-full rounded-full"
            style={{ background: accent }}
          />
        </div>
      </div>
    </motion.div>
  );
}

interface StatsCardsProps {
  shipments: Shipment[];
}

export function StatsCards({ shipments }: StatsCardsProps) {
  const counts = {
    total: shipments.length,
    pending: shipments.filter((s) => s.status === "Pending").length,
    inTransit: shipments.filter((s) => s.status === "In Transit").length,
    delivered: shipments.filter((s) => s.status === "Delivered").length,
    delayed: shipments.filter((s) => s.status === "Delayed").length,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <AnimStatCard
        label="Total"
        target={counts.total}
        change={12}
        iconBg="bg-blue-50"
        accent="#2563EB"
        icon={<Package size={16} className="text-blue-600" />}
      />
      <AnimStatCard
        label="Pending"
        target={counts.pending}
        change={-4}
        iconBg="bg-amber-50"
        accent="#F59E0B"
        icon={<Clock size={16} className="text-amber-600" />}
      />
      <AnimStatCard
        label="In Transit"
        target={counts.inTransit}
        change={8}
        iconBg="bg-blue-50"
        accent="#2563EB"
        icon={<Truck size={16} className="text-blue-600" />}
      />
      <AnimStatCard
        label="Delivered"
        target={counts.delivered}
        change={23}
        iconBg="bg-green-50"
        accent="#16A34A"
        icon={<CheckCircle2 size={16} className="text-green-600" />}
      />
      <AnimStatCard
        label="Delayed"
        target={counts.delayed}
        change={-2}
        iconBg="bg-red-50"
        accent="#DC2626"
        icon={<AlertTriangle size={16} className="text-red-600" />}
      />
    </div>
  );
}
