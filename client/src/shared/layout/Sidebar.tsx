import React from "react";
import { motion } from "motion/react";
import { LayoutDashboard, Package, ActivitySquare, Settings, LogOut, Truck } from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Dashboard",     Icon: LayoutDashboard },
  { id: "shipments", label: "Shipments",     Icon: Package },
  { id: "activity",  label: "Activity Logs", Icon: ActivitySquare },
  { id: "settings",  label: "Settings",      Icon: Settings },
];

interface SidebarProps {
  activeNav: string;
  setActiveNav: (id: string) => void;
  setMobileSidebar: (open: boolean) => void;
  onLogout: () => void;
}

export function Sidebar({ activeNav, setActiveNav, setMobileSidebar, onLogout }: SidebarProps) {
  return (
    <div className="flex flex-col h-full w-[240px] bg-gray-900">
      <div className="flex items-center gap-2.5 h-16 px-5 border-b border-white/[0.08]">
        <div className="w-8 h-8 rounded-full bg-black overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
          <img src="/logo.png" alt="LogiTrack Logo" className="w-full h-full object-cover" />
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">LogiTrack</span>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {NAV.map(({ id, label, Icon }) => {
          const active = activeNav === id;
          return (
            <button
              key={id}
              onClick={() => {
                setActiveNav(id);
                setMobileSidebar(false);
              }}
              className={`relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                active ? "bg-white/[0.10] text-white" : "text-white/55 hover:text-white/90 hover:bg-white/[0.05]"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 rounded-r-full"
                />
              )}
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/[0.08]">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-colors cursor-pointer text-left"
        >
          <LogOut size={16} strokeWidth={1.75} />
          Logout
        </button>
      </div>
    </div>
  );
}
