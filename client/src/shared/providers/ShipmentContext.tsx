"use client";

import { createContext, useContext } from "react";
import { User } from "firebase/auth";
import { Shipment, Status } from "@/features/shipments/types";
import { ActivityEntry } from "@/features/activity/types";

export interface ShipmentContextType {
  shipments: Shipment[];
  activities: ActivityEntry[];
  loading: boolean;
  createOpen: boolean;
  setCreateOpen: (o: boolean) => void;
  detailsShip: Shipment | null;
  setDetailsShip: (s: Shipment | null) => void;
  editStatusShip: Shipment | null;
  setEditStatusShip: (s: Shipment | null) => void;
  deleteTarget: string | null;
  setDeleteTarget: (id: string | null) => void;
  addShipment: (s: Omit<Shipment, "id" | "createdAt" | "status">) => Promise<void>;
  updateStatus: (id: string, newStatus: Status, prevStatus: Status) => Promise<void>;
  removeShipment: (id: string) => Promise<void>;
  user: User | null;
}

export const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export function useShipmentContext() {
  const ctx = useContext(ShipmentContext);
  if (!ctx) throw new Error("useShipmentContext must be used within ShipmentProvider");
  return ctx;
}
