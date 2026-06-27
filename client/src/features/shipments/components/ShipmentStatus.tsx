import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Status } from "@/features/shipments/types";

const STATUS_PILL: Record<Status, string> = {
  Pending:      "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  "In Transit": "bg-blue-50  text-blue-700  ring-1 ring-inset ring-blue-200",
  Delivered:    "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  Delayed:      "bg-red-50   text-red-700   ring-1 ring-inset ring-red-200",
};

const STATUS_DOT: Record<Status, string> = {
  Pending: "bg-amber-400",
  "In Transit": "bg-blue-500",
  Delivered: "bg-green-500",
  Delayed: "bg-red-500",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_PILL[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}

export function StatusProgress({ status }: { status: Status }) {
  const steps: Status[] = ["Pending", "In Transit", "Delivered"];
  const idx = status === "Delayed" ? 1 : steps.indexOf(status);
  return (
    <div className="flex items-start w-full">
      {steps.map((step, i) => {
        const done = status !== "Delayed" && i < idx;
        const active = i === idx;
        const delayed = status === "Delayed" && i === 1;
        const isLast = i === steps.length - 1;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold border-2 ${
                  delayed
                    ? "bg-red-500 border-red-500 text-white"
                    : done || active
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {done && !delayed ? <CheckCircle2 size={12} /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap ${
                  delayed ? "text-red-600" : done || active ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {delayed ? "Delayed" : step}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${done && !delayed ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
