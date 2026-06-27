import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const onShipmentStatusUpdate = functions.firestore
  .document("shipments/{shipmentId}")
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    if (!beforeData || !afterData) return;

    if (beforeData.status !== afterData.status) {
      const shipmentId = context.params.shipmentId;
      const prevStatus = beforeData.status;
      const currentStatus = afterData.status;

      let type: "status" | "delivered" | "delayed" = "status";
      if (currentStatus === "Delivered") type = "delivered";
      else if (currentStatus === "Delayed") type = "delayed";

      await db.collection("activities").add({
        shipmentId,
        action: "Status Updated",
        previousStatus: prevStatus,
        currentStatus,
        updatedBy: "System Trigger",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        type,
      });
    }
  });
export const onShipmentDelete = functions.firestore
  .document("shipments/{shipmentId}")
  .onDelete(async (snapshot, context) => {
    const shipmentId = context.params.shipmentId;
    const data = snapshot.data();
    if (!data) return;

    await db.collection("activities").add({
      shipmentId,
      action: "Deleted",
      previousStatus: data.status || "",
      currentStatus: "",
      updatedBy: "System Trigger",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      type: "status",
    });
  });
