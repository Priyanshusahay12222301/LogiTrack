export type Status = "Pending" | "In Transit" | "Delivered" | "Delayed";
export type PackageType = "Standard" | "Express" | "Fragile";
export type Priority = "Normal" | "High";
export type SortKey = "id" | "weight" | "eta" | null;

export interface Shipment {
  id: string;
  sender: string;
  senderCity: string;
  senderPhone: string;
  receiver: string;
  receiverCity: string;
  receiverPhone: string;
  weight: number;
  packageType: PackageType;
  priority: Priority;
  estimatedDelivery: string;
  status: Status;
  createdAt: string;
  createdAtISO: string;
  updatedAt?: string;
  notes: string;
}
