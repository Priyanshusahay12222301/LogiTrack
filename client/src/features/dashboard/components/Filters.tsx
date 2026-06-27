import React, { useState } from "react";
import { Filter, ChevronDown } from "lucide-react";
import { Status } from "@/features/shipments/types";
import { useOutsideClick } from "@/shared/hooks/useOutsideClick";

const STATUS_LIST: Status[] = ["Pending", "In Transit", "Delivered", "Delayed"];
const STATUS_OPTS: Array<"All" | Status> = ["All", ...STATUS_LIST];

const STATUS_DOT: Record<Status, string> = {
  Pending: "bg-amber-400",
  "In Transit": "bg-blue-500",
  Delivered: "bg-green-500",
  Delayed: "bg-red-500",
};

interface FiltersProps {
  statusFilter: "All" | Status;
  setStatusFilter: (filter: "All" | Status) => void;
}

export function Filters({ statusFilter, setStatusFilter }: FiltersProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useOutsideClick(() => setFilterOpen(false));

  return (
    <div className="relative" ref={filterRef}>
      <button
        onClick={() => setFilterOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
      >
        <Filter size={13} className="text-gray-400" />
        {statusFilter === "All" ? "All Statuses" : statusFilter}
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform ${filterOpen ? "rotate-180" : ""}`}
        />
      </button>
      {filterOpen && (
        <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-md z-20 py-1 text-sm">
          {STATUS_OPTS.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                setStatusFilter(opt);
                setFilterOpen(false);
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors cursor-pointer ${
                statusFilter === opt
                  ? "text-blue-600 bg-blue-50 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  opt !== "All" ? STATUS_DOT[opt as Status] : "bg-transparent"
                }`}
              />
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
