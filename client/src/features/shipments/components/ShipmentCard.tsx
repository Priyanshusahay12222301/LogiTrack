import React from "react";
import { ArrowRight } from "lucide-react";
import { Shipment } from "@/features/shipments/types";
import { StatusBadge } from "./ShipmentStatus";

interface ShipmentCardProps {
  s: Shipment;
  onView: () => void;
  onDelete: () => void;
}

export function ShipmentCard({ s, onView, onDelete }: ShipmentCardProps) {
  return (
    <div
      onClick={onView}
      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-600/30 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-mono text-xs font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
          {s.id}
        </span>
        <StatusBadge status={s.status} />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{s.sender}</p>
          <p className="text-xs text-gray-500">{s.senderCity}</p>
        </div>
        <ArrowRight size={13} className="text-gray-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{s.receiver}</p>
          <p className="text-xs text-gray-500">{s.receiverCity}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
        <span>
          {s.weight} kg · {s.packageType} · Est. {s.estimatedDelivery}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
