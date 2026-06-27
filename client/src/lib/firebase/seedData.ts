import { collection, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function seedData() {
  console.log("Seeding 15 more shipments...");
  const shipments = [
    { trackingId: "LT-22334", senderName: "TechGear", senderCity: "Noida", senderPhone: "9001122334", receiverName: "Alpha Store", receiverCity: "Gurgaon", receiverPhone: "9009988776", weight: 8, packageType: "Electronics", priority: "High", estimatedDelivery: "2026-06-27", status: "In Transit", notes: "Express tech delivery" },
    { trackingId: "LT-44556", senderName: "BakeHouse", senderCity: "Pune", senderPhone: "9988112233", receiverName: "Daily Needs", receiverCity: "Mumbai", receiverPhone: "9988445566", weight: 25, packageType: "Food", priority: "Standard", estimatedDelivery: "2026-06-29", status: "Pending", notes: "Fragile box" },
    { trackingId: "LT-77889", senderName: "Medicorp", senderCity: "Hyderabad", senderPhone: "9111222333", receiverName: "City Hospital", receiverCity: "Bangalore", receiverPhone: "9222333444", weight: 12, packageType: "Medical", priority: "Urgent", estimatedDelivery: "2026-06-26", status: "Delivered", notes: "Temperature controlled" },
    { trackingId: "LT-99001", senderName: "Books & Co", senderCity: "Delhi", senderPhone: "9333444555", receiverName: "Readers Club", receiverCity: "Jaipur", receiverPhone: "9444555666", weight: 45, packageType: "Documents", priority: "Standard", estimatedDelivery: "2026-07-01", status: "Pending", notes: "Heavy carton" },
    { trackingId: "LT-10020", senderName: "AutoParts Hub", senderCity: "Chennai", senderPhone: "9555666777", receiverName: "Speed Garage", receiverCity: "Kochi", receiverPhone: "9666777888", weight: 120, packageType: "Machinery", priority: "High", estimatedDelivery: "2026-06-30", status: "In Transit", notes: "Requires forklift" },
    { trackingId: "LT-20030", senderName: "Green Nursery", senderCity: "Kolkata", senderPhone: "9777888999", receiverName: "Eco Gardens", receiverCity: "Patna", receiverPhone: "9888999000", weight: 15, packageType: "Plants", priority: "Urgent", estimatedDelivery: "2026-06-28", status: "Delayed", notes: "Water before dispatch" },
    { trackingId: "LT-30040", senderName: "Sports World", senderCity: "Ahmedabad", senderPhone: "9999000111", receiverName: "Fit Gym", receiverCity: "Surat", receiverPhone: "9000111222", weight: 60, packageType: "Equipment", priority: "Standard", estimatedDelivery: "2026-07-02", status: "Pending", notes: "Handle with care" },
    { trackingId: "LT-40050", senderName: "Home Decor", senderCity: "Jaipur", senderPhone: "9112233445", receiverName: "Urban Living", receiverCity: "Delhi", receiverPhone: "9223344556", weight: 35, packageType: "Furniture", priority: "High", estimatedDelivery: "2026-06-29", status: "In Transit", notes: "Glass items included" },
    { trackingId: "LT-50060", senderName: "Pet Supplies", senderCity: "Bangalore", senderPhone: "9334455667", receiverName: "Happy Paws", receiverCity: "Mysore", receiverPhone: "9445566778", weight: 22, packageType: "Food", priority: "Standard", estimatedDelivery: "2026-06-27", status: "Delivered", notes: "Dog food bags" },
    { trackingId: "LT-60070", senderName: "Quick Print", senderCity: "Mumbai", senderPhone: "9556677889", receiverName: "Corporate Office", receiverCity: "Pune", receiverPhone: "9667788990", weight: 5, packageType: "Documents", priority: "Urgent", estimatedDelivery: "2026-06-26", status: "In Transit", notes: "Confidential" },
    { trackingId: "LT-70080", senderName: "Textile Mills", senderCity: "Surat", senderPhone: "9778899001", receiverName: "Fashion Outlet", receiverCity: "Ahmedabad", receiverPhone: "9889900112", weight: 85, packageType: "Clothing", priority: "Standard", estimatedDelivery: "2026-07-03", status: "Pending", notes: "Keep dry" },
    { trackingId: "LT-80090", senderName: "Gadget Store", senderCity: "Delhi", senderPhone: "9990011223", receiverName: "Tech Hub", receiverCity: "Chandigarh", receiverPhone: "9001122334", weight: 3, packageType: "Electronics", priority: "High", estimatedDelivery: "2026-06-27", status: "Delayed", notes: "High value items" },
    { trackingId: "LT-90100", senderName: "Farm Fresh", senderCity: "Nashik", senderPhone: "9112233445", receiverName: "Mega Mart", receiverCity: "Mumbai", receiverPhone: "9223344556", weight: 250, packageType: "Food", priority: "Urgent", estimatedDelivery: "2026-06-26", status: "In Transit", notes: "Perishable goods" },
    { trackingId: "LT-01234", senderName: "Toy Factory", senderCity: "Chennai", senderPhone: "9334455667", receiverName: "Kids Zone", receiverCity: "Madurai", receiverPhone: "9445566778", weight: 40, packageType: "Toys", priority: "Standard", estimatedDelivery: "2026-07-01", status: "Pending", notes: "Multiple cartons" },
    { trackingId: "LT-56789", senderName: "Shoe Maker", senderCity: "Agra", senderPhone: "9556677889", receiverName: "Footwear World", receiverCity: "Delhi", receiverPhone: "9667788990", weight: 18, packageType: "Clothing", priority: "Standard", estimatedDelivery: "2026-06-28", status: "Delivered", notes: "Standard boxes" }
  ];

  for (const shipment of shipments) {
    const docRef = doc(db, "shipments", shipment.trackingId);
    await setDoc(docRef, {
      ...shipment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Add activity log
    await addDoc(collection(db, "activities"), {
      shipmentId: shipment.trackingId,
      action: "Status Updated",
      previousStatus: "Pending",
      currentStatus: shipment.status,
      updatedBy: "System",
      senderCity: shipment.senderCity,
      receiverCity: shipment.receiverCity,
      weight: shipment.weight,
      type: shipment.status === "Delivered" ? "delivered" : "status",
      timestamp: serverTimestamp(),
    });
  }
  
  console.log("Seeding complete!");
}
