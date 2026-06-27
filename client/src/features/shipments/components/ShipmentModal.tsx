import React, { useState, useEffect } from "react";
import { X, ChevronDown, CheckCircle2, Clock, Truck, AlertTriangle, Eye, Edit2, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Status, PackageType, Priority, Shipment } from "@/features/shipments/types";
import { ActivityEntry } from "@/features/activity/types";
import { StatusBadge, StatusProgress } from "./ShipmentStatus";
import { useOutsideClick } from "@/shared/hooks/useOutsideClick";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/ui/alert-dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/shared/ui/sheet";

// ─── Details Sheet ────────────────────────────────────────────────────────────

interface DetailsSheetProps {
  shipment: Shipment | null;
  onClose: () => void;
  onStatusChange: (id: string, s: Status) => void;
  activities: ActivityEntry[];
}

const ACT_DOT: Record<ActivityEntry["type"], string> = {
  created: "bg-blue-500",
  status: "bg-amber-400",
  delivered: "bg-green-500",
  delayed: "bg-red-500",
};

const STATUS_LIST: Status[] = ["Pending", "In Transit", "Delivered", "Delayed"];
const STATUS_DOT: Record<Status, string> = {
  Pending: "bg-amber-400",
  "In Transit": "bg-blue-500",
  Delivered: "bg-green-500",
  Delayed: "bg-red-500",
};

export function DetailsSheet({ shipment, onClose, onStatusChange, activities }: DetailsSheetProps) {
  const [statusDrop, setStatusDrop] = useState(false);
  const dropRef = useOutsideClick(() => setStatusDrop(false));
  const rel = activities.filter((a) => a.shipmentId === shipment?.id);

  return (
    <Sheet open={!!shipment} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] p-0 flex flex-col overflow-hidden bg-white">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between pr-6">
            <div>
              <SheetTitle className="text-base font-semibold text-gray-900 font-mono">{shipment?.id}</SheetTitle>
              <SheetDescription className="text-xs text-gray-500 mt-0.5">
                Created {shipment?.createdAt} · {shipment?.packageType} · {shipment?.priority} Priority
              </SheetDescription>
            </div>
            {shipment && (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setStatusDrop((v) => !v)}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <StatusBadge status={shipment.status} />
                  <ChevronDown size={12} className="text-gray-500" />
                </button>
                {statusDrop && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-md z-10 py-1 text-sm">
                    {STATUS_LIST.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          onStatusChange(shipment.id, s);
                          setStatusDrop(false);
                        }}
                        className={`flex items-center gap-2 w-full px-3 py-2 text-left transition-colors cursor-pointer ${
                          shipment.status === s ? "text-blue-600 bg-blue-50 font-medium" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s]}`} />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {shipment && (
          <div className="px-6 py-5 border-b border-gray-200">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Shipment Progress</p>
            <StatusProgress status={shipment.status} />
          </div>
        )}
        {shipment && (
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
            {[
              [
                "Sender",
                [
                  ["Name", shipment.sender],
                  ["City", shipment.senderCity],
                  ["Phone", shipment.senderPhone],
                ],
              ],
              [
                "Receiver",
                [
                  ["Name", shipment.receiver],
                  ["City", shipment.receiverCity],
                  ["Phone", shipment.receiverPhone],
                ],
              ],
            ].map(([sec, fields]) => (
              <section key={sec as string}>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">{sec as string}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {(fields as [string, string][]).map(([l, v]) => (
                    <div key={l}>
                      <p className="text-[11px] text-gray-400 mb-0.5">{l}</p>
                      <p className="text-sm font-medium text-gray-900">{v}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
            <div className="border-t border-gray-100" />
            <section>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Package Details</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  ["Weight", `${shipment.weight} kg`],
                  ["Type", shipment.packageType],
                  ["Priority", shipment.priority],
                  ["Est. Delivery", shipment.estimatedDelivery],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-[11px] text-gray-400 mb-0.5">{l}</p>
                    <p className="text-sm font-medium text-gray-900">{v}</p>
                  </div>
                ))}
              </div>
              {shipment.notes && (
                <div className="mt-3">
                  <p className="text-[11px] text-gray-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    {shipment.notes}
                  </p>
                </div>
              )}
            </section>
            <div className="border-t border-gray-100" />
            <section>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Activity</p>
              {rel.length === 0 ? (
                <p className="text-xs text-gray-400">No activity recorded yet.</p>
              ) : (
                rel.map((a, i, arr) => (
                  <div key={i} className="relative flex gap-3 pb-4">
                    {i < arr.length - 1 && <div className="absolute left-[6px] top-3.5 bottom-0 w-px bg-gray-200" />}
                    <div className={`mt-1 w-3 h-3 rounded-full shrink-0 ring-2 ring-white ${ACT_DOT[a.type]}`} />
                    <div>
                      <p className="text-xs font-medium text-gray-900">{a.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.detail}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{a.time}</p>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Edit Status Sheet ────────────────────────────────────────────────────────

interface EditStatusSheetProps {
  shipment: Shipment | null;
  onClose: () => void;
  onSave: (id: string, s: Status) => void;
}

export function EditStatusSheet({ shipment, onClose, onSave }: EditStatusSheetProps) {
  const [selected, setSelected] = useState<Status>("Pending");
  useEffect(() => {
    if (shipment) setSelected(shipment.status);
  }, [shipment]);

  return (
    <Sheet open={!!shipment} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col bg-white">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 pr-12">
          <SheetTitle className="text-base font-semibold text-gray-900">Edit Status</SheetTitle>
          <SheetDescription className="text-xs text-gray-500 mt-0.5 font-mono">{shipment?.id}</SheetDescription>
        </div>
        <div className="flex-1 px-6 py-5 flex flex-col gap-2">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Select new status</p>
          {STATUS_LIST.map((s) => (
            <label
              key={s}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selected === s ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input type="radio" className="sr-only" checked={selected === s} onChange={() => setSelected(s)} />
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selected === s ? "border-blue-600" : "border-gray-300"
                }`}
              >
                {selected === s && <div className="w-2 h-2 rounded-full bg-blue-600" />}
              </div>
              <StatusBadge status={s} />
            </label>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (shipment) {
                onSave(shipment.id, selected);
                onClose();
              }
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────

interface DeleteDialogProps {
  shipmentId: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteDialog({ shipmentId, onCancel, onConfirm }: DeleteDialogProps) {
  return (
    <AlertDialog open={!!shipmentId} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <AlertDialogContent className="max-w-sm bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-semibold text-gray-900">Delete Shipment</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-500">
            Are you sure you want to delete <span className="font-semibold font-mono text-gray-700">{shipmentId}</span>? This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} className="text-sm cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white text-sm border-0 cursor-pointer">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Create Drawer ────────────────────────────────────────────────────────────

const BLANK = {
  sender: "",
  senderCity: "",
  senderPhone: "",
  receiver: "",
  receiverCity: "",
  receiverPhone: "",
  weight: "",
  packageType: "Standard" as PackageType,
  priority: "Normal" as Priority,
  date: "",
  notes: "",
};

interface CreateDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreate: (s: Omit<Shipment, "id" | "createdAt" | "status" | "createdAtISO">) => Promise<void>;
}

export function CreateDrawer({ open, onClose, onCreate }: CreateDrawerProps) {
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const set = (k: keyof typeof BLANK) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    // Clear error for that field
    if (errors[k]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[k];
        return next;
      });
    }
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate Sender Name: Minimum 3 characters
    if (!form.sender || form.sender.trim().length < 3) {
      newErrors.sender = "Sender Name must be at least 3 characters.";
    }

    // Validate Receiver City / Name Address: Address field in PRD requires maximum 300 characters.
    // In our form senderCity and receiverCity are cities. Let's validate receiverCity max 300 chars.
    if (!form.receiverCity || form.receiverCity.trim().length > 300) {
      newErrors.receiverCity = "Receiver City / Address must not exceed 300 characters.";
    }
    if (!form.senderCity || form.senderCity.trim().length > 300) {
      newErrors.senderCity = "Origin City / Address must not exceed 300 characters.";
    }

    // Validate Weight: Must be greater than zero
    const weightNum = parseFloat(form.weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      newErrors.weight = "Weight must be greater than zero.";
    }

    // Validate Delivery Date: Cannot select previous date
    if (form.date) {
      const selectedDate = new Date(form.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // local midnight
      if (selectedDate < today) {
        newErrors.date = "Delivery date cannot be in the past.";
      }
    } else {
      newErrors.date = "Estimated delivery date is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Validation failed. Please highlight and fix invalid fields.");
      return;
    }

    const eta = form.date
      ? new Date(form.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
      : "TBD";

    try {
      await onCreate({
        sender: form.sender,
        senderCity: form.senderCity,
        senderPhone: form.senderPhone || "—",
        receiver: form.receiver,
        receiverCity: form.receiverCity,
        receiverPhone: form.receiverPhone || "—",
        weight: weightNum,
        packageType: form.packageType,
        priority: form.priority,
        estimatedDelivery: eta,
        notes: form.notes,
      });
      setForm(BLANK);
      onClose();
    } catch (err) {
      toast.error("Failed to save shipment to Firestore.");
    }
  }

  const inp = (hasError: boolean) =>
    `w-full px-3 py-2 rounded-lg border ${
      hasError ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-gray-200 focus:ring-blue-600/20 focus:border-blue-600"
    } bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors`;
  const lbl = "text-sm font-medium text-gray-700";

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/25 z-40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-[460px] bg-white border-l border-gray-200 shadow-xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">New Shipment</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill in details to create a shipment record.</p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
        <form id="create-form" onSubmit={submit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 flex flex-col gap-5">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Sender</p>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={lbl}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.sender}
                    onChange={set("sender")}
                    placeholder="e.g. Rahul Sharma"
                    className={inp(!!errors.sender)}
                  />
                  {errors.sender && <p className="text-xs text-red-500 font-medium">{errors.sender}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={lbl}>
                      Origin City <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={form.senderCity}
                      onChange={set("senderCity")}
                      placeholder="e.g. Delhi"
                      className={inp(!!errors.senderCity)}
                    />
                    {errors.senderCity && <p className="text-xs text-red-500 font-medium">{errors.senderCity}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={lbl}>Phone</label>
                    <input
                      value={form.senderPhone}
                      onChange={set("senderPhone")}
                      placeholder="+91 98…"
                      className={inp(false)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200" />
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Receiver</p>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={lbl}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.receiver}
                    onChange={set("receiver")}
                    placeholder="e.g. Priya Mehta"
                    className={inp(false)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={lbl}>
                      Delivery City <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={form.receiverCity}
                      onChange={set("receiverCity")}
                      placeholder="e.g. Mumbai"
                      className={inp(!!errors.receiverCity)}
                    />
                    {errors.receiverCity && <p className="text-xs text-red-500 font-medium">{errors.receiverCity}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={lbl}>Phone</label>
                    <input
                      value={form.receiverPhone}
                      onChange={set("receiverPhone")}
                      placeholder="+91 90…"
                      className={inp(false)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200" />
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Package Details</p>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={lbl}>
                      Weight (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      required
                      value={form.weight}
                      onChange={set("weight")}
                      placeholder="e.g. 12"
                      className={inp(!!errors.weight)}
                    />
                    {errors.weight && <p className="text-xs text-red-500 font-medium">{errors.weight}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={lbl}>
                      Est. Delivery <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={set("date")}
                      className={inp(!!errors.date)}
                    />
                    {errors.date && <p className="text-xs text-red-500 font-medium">{errors.date}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={lbl}>Package Type</label>
                    <select value={form.packageType} onChange={set("packageType")} className={inp(false)}>
                      <option>Standard</option>
                      <option>Express</option>
                      <option>Fragile</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={lbl}>Priority</label>
                    <div className="flex gap-2">
                      {(["Normal", "High"] as Priority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, priority: p }))}
                          className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                            form.priority === p
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={lbl}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={set("notes")}
                    placeholder="Optional — e.g. Handle with care"
                    rows={2}
                    className={`${inp(false)} resize-none`}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-form"
            className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Create Shipment
          </button>
        </div>
      </aside>
    </>
  );
}
