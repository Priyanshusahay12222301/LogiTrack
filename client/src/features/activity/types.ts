export interface ActivityEntry {
  time: string;
  title: string;
  detail: string;
  type: "created" | "status" | "delivered" | "delayed";
  shipmentId?: string;
}
