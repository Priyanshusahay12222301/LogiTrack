import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ActivityEntry } from "@/features/activity/types";

const ACT_DOT: Record<ActivityEntry["type"], string> = {
  created: "bg-blue-500",
  status: "bg-amber-400",
  delivered: "bg-green-500",
  delayed: "bg-red-500",
};

interface ActivityFeedProps {
  activities: ActivityEntry[];
  onOpenShipment?: (id: string) => void;
}

export function ActivityFeed({ activities, onOpenShipment }: ActivityFeedProps) {
  return (
    <div className="flex flex-col">
      <AnimatePresence>
        {activities.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
            onClick={() => a.shipmentId && onOpenShipment?.(a.shipmentId)}
            className="relative flex gap-4 pb-4 cursor-pointer group"
          >
            {i < activities.length - 1 && <div className="absolute left-[7px] top-4 bottom-0 w-px bg-gray-100" />}
            <motion.div
              whileHover={{ scale: 1.2 }}
              className={`mt-0.5 w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-white ${ACT_DOT[a.type]}`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {a.title}
                </p>
                <span className="text-[11px] text-gray-400 shrink-0">{a.time}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{a.detail}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
