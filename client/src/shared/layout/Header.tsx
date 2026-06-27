import React, { useState } from "react";
import { Menu, Bell } from "lucide-react";
import { motion } from "motion/react";
import { useOutsideClick } from "@/shared/hooks/useOutsideClick";
import { ActivityEntry } from "@/features/activity/types";

interface HeaderProps {
  title: string;
  description: string;
  setMobileSidebar: (open: boolean) => void;
  activities: ActivityEntry[];
  onOpenShipment: (id: string) => void;
  userEmail?: string | null;
}

const ACT_DOT: Record<ActivityEntry["type"], string> = {
  created: "bg-blue-500",
  status: "bg-amber-400",
  delivered: "bg-green-500",
  delayed: "bg-red-500",
};

function LiveIndicator() {
  return (
    <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      Live
    </span>
  );
}

export function Header({
  title,
  description,
  setMobileSidebar,
  activities,
  onOpenShipment,
  userEmail,
}: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useOutsideClick(() => setNotifOpen(false));

  const displayName = userEmail ? userEmail.split("@")[0] : "Dev";
  const avatarInitials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileSidebar(true)}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-[20px] font-semibold text-gray-900 leading-tight">{title}</h1>
          <p className="text-xs text-gray-500 hidden sm:block">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LiveIndicator />
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative w-9 h-9 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <Bell size={18} strokeWidth={1.75} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
          </button>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-md z-30 overflow-hidden text-gray-900"
            >
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <p className="text-sm font-semibold">Notifications</p>
                <span className="text-xs text-gray-500">Today</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {activities.slice(0, 4).map((a, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (a.shipmentId) {
                        onOpenShipment(a.shipmentId);
                        setNotifOpen(false);
                      }
                    }}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 cursor-pointer transition-colors"
                  >
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${ACT_DOT[a.type]}`} />
                    <div>
                      <p className="text-xs font-medium leading-snug">{a.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {a.time} · {a.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-2.5 pl-3 ml-1 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {avatarInitials}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-medium text-gray-900 capitalize">{displayName}</p>
            <p className="text-[11px] text-gray-500">Dispatcher</p>
          </div>
        </div>
      </div>
    </header>
  );
}
