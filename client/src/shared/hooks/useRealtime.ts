import { useEffect } from "react";
import { collection, query, orderBy, onSnapshot, Timestamp, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Shipment } from "@/features/shipments/types";
import { ActivityEntry } from "@/features/activity/types";

function mapDocToShipment(docId: string, data: any): Shipment {
  let createdAtStr = "TBD";
  if (data.createdAt) {
    const date = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt.seconds * 1000);
    createdAtStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  return {
    id: docId,
    sender: data.senderName || data.sender || "",
    senderCity: data.senderCity || "",
    senderPhone: data.senderPhone || "",
    receiver: data.receiverName || data.receiver || "",
    receiverCity: data.receiverCity || "",
    receiverPhone: data.receiverPhone || "",
    weight: Number(data.weight) || 0,
    packageType: data.packageType || "Standard",
    priority: data.priority || "Normal",
    estimatedDelivery: data.estimatedDelivery || "",
    status: data.status || "Pending",
    createdAt: createdAtStr,
    notes: data.notes || "",
  };
}

function mapDocToActivity(data: any): ActivityEntry {
  let timeStr = "Just now";
  if (data.timestamp) {
    const date = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp.seconds * 1000);
    timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }

  let title = `Shipment ${data.shipmentId} updated`;
  let detail = `${data.previousStatus || "Created"} → ${data.currentStatus}`;

  if (data.type === "created") {
    title = `Shipment ${data.shipmentId} created`;
    detail = `${data.senderCity || ""} → ${data.receiverCity || ""} · ${data.weight || 0} kg`;
  } else if (data.type === "delivered") {
    title = `${data.shipmentId} delivered`;
    detail = `Received by ${data.receiverName || "recipient"}`;
  } else if (data.type === "delayed") {
    title = `${data.shipmentId} marked delayed`;
    detail = `Rerouted due to delay`;
  } else if (data.type === "status") {
    title = `${data.shipmentId} status updated`;
    detail = `${data.previousStatus} → ${data.currentStatus}`;
  }

  return {
    shipmentId: data.shipmentId || "",
    title,
    detail,
    type: data.type || "status",
    time: timeStr,
  };
}

interface UseRealtimeProps {
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
  setActivities: React.Dispatch<React.SetStateAction<ActivityEntry[]>>;
  setLoading: (l: boolean) => void;
}

export function useRealtime({ setShipments, setActivities, setLoading }: UseRealtimeProps) {
  useEffect(() => {
    // 1. Subscribe to Shipments
    const shipmentsQuery = query(
      collection(db, "shipments"),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const unsubShipments = onSnapshot(shipmentsQuery, (snapshot) => {
      const items: Shipment[] = [];
      snapshot.forEach((doc) => {
        items.push(mapDocToShipment(doc.id, doc.data()));
      });
      setShipments(items);
      setLoading(false);
    }, (error) => {
      console.error("Firestore shipments subscription failed:", error);
    });

    // 2. Subscribe to Activities
    const activitiesQuery = query(
      collection(db, "activities"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    const unsubActivities = onSnapshot(activitiesQuery, (snapshot) => {
      const items: ActivityEntry[] = [];
      snapshot.forEach((doc) => {
        items.push(mapDocToActivity(doc.data()));
      });
      setActivities(items);
    }, (error) => {
      console.error("Firestore activities subscription failed:", error);
    });

    return () => {
      unsubShipments();
      unsubActivities();
    };
  }, [setShipments, setActivities, setLoading]);
}
