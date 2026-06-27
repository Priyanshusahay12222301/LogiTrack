"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { Sidebar } from "@/shared/layout/Sidebar";
import { Header } from "@/shared/layout/Header";
import { useRealtime } from "@/shared/hooks/useRealtime";
import { useShipments } from "@/shared/hooks/useShipments";
import { Shipment, Status } from "@/features/shipments/types";
import { ActivityEntry } from "@/features/activity/types";
import { Loader } from "@/shared/common/Loader";
import { CreateDrawer, DetailsSheet, EditStatusSheet, DeleteDialog } from "@/features/shipments/components/ShipmentModal";

import { ShipmentContext } from "@/shared/providers/ShipmentContext";

// ─── Layout Component ──────────────────────────────────────────────────────────

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Shipment & Activity state
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog/Modal states
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsShip, setDetailsShip] = useState<Shipment | null>(null);
  const [editStatusShip, setEditStatusShip] = useState<Shipment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { createShipment, updateShipment, deleteShipment } = useShipments();

  // Track Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        router.replace("/login");
      }
    });
    return unsubscribe;
  }, [router]);

  // Listen to Firestore real-time updates when authenticated
  useRealtime({
    setShipments,
    setActivities,
    setLoading: (l) => {
      // Only set loading to false when we have records or finish fetching
      setLoading(l);
    },
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const addShipment = async (s: Omit<Shipment, "id" | "createdAt" | "status">) => {
    try {
      const trackingId = await createShipment(s);
      toast.success(`Shipment ${trackingId} created successfully`);
    } catch (err) {
      toast.error("Failed to create shipment");
      throw err;
    }
  };

  const updateStatus = async (id: string, newStatus: Status, prevStatus: Status) => {
    try {
      await updateShipment(id, newStatus, prevStatus);
      
      // Update details drawer state if open
      if (detailsShip?.id === id) {
        setDetailsShip((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      toast.success(`Shipment ${id} updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
      throw err;
    }
  };

  const removeShipment = async (id: string) => {
    try {
      await deleteShipment(id);
      setDeleteTarget(null);
      toast.success(`Shipment ${id} deleted successfully`);
    } catch (err) {
      toast.error("Failed to delete shipment");
      throw err;
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  // Determine current active nav tab based on search params or route
  const activeNav = searchParams.get("tab") || "dashboard";

  const handleNavChange = (id: string) => {
    if (id === "dashboard") router.push("/dashboard");
    else if (id === "activity") router.push("/dashboard?tab=activity");
    else if (id === "settings") router.push("/dashboard?tab=settings");
    else if (id === "shipments") router.push("/dashboard?tab=shipments");
  };

  return (
    <ShipmentContext.Provider
      value={{
        shipments,
        activities,
        loading,
        createOpen,
        setCreateOpen,
        detailsShip,
        setDetailsShip,
        editStatusShip,
        setEditStatusShip,
        deleteTarget,
        setDeleteTarget,
        addShipment,
        updateStatus,
        removeShipment,
        user,
      }}
    >
      <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <Toaster position="bottom-right" richColors closeButton />

        {/* Desktop Sidebar */}
        <div className="hidden md:flex shrink-0">
          <Sidebar
            activeNav={activeNav}
            setActiveNav={handleNavChange}
            setMobileSidebar={setMobileSidebar}
            onLogout={handleLogout}
          />
        </div>

        {/* Mobile Sidebar slide-over */}
        {mobileSidebar && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebar(false)} />
            <div className="relative">
              <Sidebar
                activeNav={activeNav}
                setActiveNav={handleNavChange}
                setMobileSidebar={setMobileSidebar}
                onLogout={handleLogout}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header
            title={activeNav === "dashboard" ? "Dashboard" : activeNav === "activity" ? "Activity Logs" : "Settings"}
            description={
              activeNav === "dashboard"
                ? "Monitor and manage all shipments in real time."
                : activeNav === "activity"
                ? "Full audit trail of all shipment events."
                : "Manage your account and workspace preferences."
            }
            setMobileSidebar={setMobileSidebar}
            activities={activities}
            onOpenShipment={(id) => {
              const s = shipments.find((sh) => sh.id === id);
              if (s) setDetailsShip(s);
            }}
            userEmail={user.email || ""}
          />

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Modals and Drawers */}
        <CreateDrawer
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreate={addShipment}
        />
        <DetailsSheet
          shipment={detailsShip}
          onClose={() => setDetailsShip(null)}
          onStatusChange={(id, status) => {
            const s = shipments.find((sh) => sh.id === id);
            if (s) updateStatus(id, status, s.status);
          }}
          activities={activities}
        />
        <EditStatusSheet
          shipment={editStatusShip}
          onClose={() => setEditStatusShip(null)}
          onSave={(id, status) => {
            const s = shipments.find((sh) => sh.id === id);
            if (s) updateStatus(id, status, s.status);
          }}
        />
        <DeleteDialog
          shipmentId={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget) removeShipment(deleteTarget);
          }}
        />
      </div>
    </ShipmentContext.Provider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <Loader />
        </div>
      }
    >
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
