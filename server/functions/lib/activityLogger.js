"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();
exports.logActivity = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Only authenticated dispatchers can log activities.");
    }
    const { shipmentId, action, previousStatus, currentStatus, type, senderCity, receiverCity, weight } = data;
    const username = context.auth.token.email ? context.auth.token.email.split("@")[0] : "Dispatcher";
    await db.collection("activities").add({
        shipmentId,
        action,
        previousStatus: previousStatus || "",
        currentStatus: currentStatus || "",
        updatedBy: username,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        senderCity: senderCity || "",
        receiverCity: receiverCity || "",
        weight: weight || 0,
        type,
    });
    return { success: true };
});
//# sourceMappingURL=activityLogger.js.map