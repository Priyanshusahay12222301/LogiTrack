import { createShipment, updateShipmentStatus, deleteShipment } from "@/features/shipments/services/shipment.service";
import { Status, Shipment } from "@/features/shipments/types";

export function useShipments() {
  return {
    createShipment,
    updateShipment: updateShipmentStatus,
    deleteShipment,
  };
}
