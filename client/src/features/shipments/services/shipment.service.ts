import { collection, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Shipment, Status } from "@/features/shipments/types";

export async function createShipment(shipment: Partial<Shipment>) {
  try {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const customId = `LT-${randomNum}`;
    const docRef = doc(db, "shipments", customId);
    
    await setDoc(docRef, {
      ...shipment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return customId;
  } catch (error) {
    console.error("Error creating shipment:", error);
    throw error;
  }
}

export async function updateShipmentStatus(id: string, status: Status, prevStatus?: Status) {
  try {
    const docRef = doc(db, "shipments", id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating shipment status:", error);
    throw error;
  }
}

export async function deleteShipment(id: string) {
  try {
    const docRef = doc(db, "shipments", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting shipment:", error);
    throw error;
  }
}
