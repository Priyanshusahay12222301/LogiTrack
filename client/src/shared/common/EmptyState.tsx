import React from "react";
import { PackageOpen, Plus } from "lucide-react";

interface EmptyStateProps {
  onNew: () => void;
}

export function EmptyState({ onNew }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
        <PackageOpen size={20} className="text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">No shipments found</h3>
      <p className="text-sm text-gray-500 max-w-[240px] mb-5 leading-relaxed">
        Create your first shipment to start tracking deliveries.
      </p>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
      >
        <Plus size={14} />Create Shipment
      </button>
    </div>
  );
}
