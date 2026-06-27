import { initializeApp } from "firebase/admin/app";
import { getFirestore } from "firebase/admin/firestore";

const app = initializeApp({
  projectId: "logitrack-priya-12345"
});
const db = getFirestore(app);

async function main() {
  const docRef = db.collection("shipments").doc("LT-73014");
  const doc = await docRef.get();
  console.log("LT-73014 data:", doc.data());
  
  const docRef2 = db.collection("shipments").doc("x6xgYDvckpYIGzY9Spaq");
  const doc2 = await docRef2.get();
  console.log("x6xg... data:", doc2.data());
}
main().catch(console.error);
