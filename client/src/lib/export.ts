import { toast } from "sonner";
import { Shipment } from "@/features/shipments/types";

export function exportCSV(rows: Shipment[]) {
  const hdr = [
    "ID",
    "Sender",
    "Origin",
    "Receiver",
    "Destination",
    "Weight (kg)",
    "Type",
    "Priority",
    "ETA",
    "Status",
    "Created Date",
    "Notes",
  ];
  const lines = rows.map((s) =>
    [
      s.id,
      s.sender,
      s.senderCity,
      s.receiver,
      s.receiverCity,
      s.weight,
      s.packageType,
      s.priority,
      s.estimatedDelivery,
      s.status,
      s.createdAt,
      `"${s.notes.replace(/"/g, '""')}"`,
    ].join(",")
  );

  const blob = new Blob([[hdr.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `logitrack-shipments-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("Shipments exported as CSV");
}
