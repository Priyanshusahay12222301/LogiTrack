import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp({
  projectId: "logitrack-priya-12345"
});
const db = getFirestore(app);

async function main() {
  const ids = ["LT-30417", "LT-73014", "LT-56789"];
  for (const id of ids) {
    const docRef = db.collection("shipments").doc(id);
    const doc = await docRef.get();
    console.log(`${id} data:`, doc.data());
  }
}
main().catch(console.error);
