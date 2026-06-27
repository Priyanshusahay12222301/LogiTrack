"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onShipmentDelete = exports.onShipmentStatusUpdate = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();
exports.onShipmentStatusUpdate = functions.firestore
    .document("shipments/{shipmentId}")
    .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    if (!beforeData || !afterData)
        return;
    if (beforeData.status !== afterData.status) {
        const shipmentId = context.params.shipmentId;
        const prevStatus = beforeData.status;
        const currentStatus = afterData.status;
        let type = "status";
        if (currentStatus === "Delivered")
            type = "delivered";
        else if (currentStatus === "Delayed")
            type = "delayed";
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
exports.onShipmentDelete = functions.firestore
    .document("shipments/{shipmentId}")
    .onDelete(async (snapshot, context) => {
    const shipmentId = context.params.shipmentId;
    const data = snapshot.data();
    if (!data)
        return;
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
//# sourceMappingURL=shipmentTriggers.js.map