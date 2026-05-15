"use client";

import { useAllBookings, useClientDirectory, useDeleteBookingsBulk, useDeleteClientDirectory, useImportClientDirectory } from "@/hooks/use-acupuncture";
import { format } from "date-fns";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  ChevronDown, 
  Calendar as CalendarIcon, 
  Clock, 
  History,
  CheckCircle2,
  Clock3,
  XCircle,
  UserX,
  Trash2,
  ExternalLink,
  Upload,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { formatTime12h } from "@/utils/time";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ClientIntakeForms } from "@/components/admin/ClientIntakeForms";
import { PatientImportDialog } from "@/components/admin/patient-import-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/lib/toast";

function bookingContactKey(emailRaw: string, name: string, phone: string, bookingId: string): string {
  const email = emailRaw ? emailRaw.toLowerCase().trim() : "";
  const n = (name || "").trim();
  const p = (phone || "").trim();
  return email || (n && p ? `${n.toLowerCase()}-${p}` : `booking:${bookingId}`);
}

type UnifiedClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  bookings: any[];
  fromDirectory?: boolean;
  directoryCreatedAt?: string;
};

export default function AdminClients() {
  const HOLD_TO_DELETE_MS = 1200;
  const { data: bookings, isLoading } = useAllBookings();
  const { data: directoryRows = [], isLoading: directoryLoading } = useClientDirectory();
  const importDirectory = useImportClientDirectory();
  const deleteDirectory = useDeleteClientDirectory();
  const deleteBookingsBulk = useDeleteBookingsBulk();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Record<string, boolean>>({});
  const [holdProgress, setHoldProgress] = useState(0);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const holdIntervalRef = useRef<number | null>(null);
  const holdTimeoutRef = useRef<number | null>(null);

  const clients = useMemo(() => {
    if (!bookings) return [];

    const grouped = bookings.reduce((acc, booking) => {
      const email = booking.email ? booking.email.toLowerCase().trim() : "";
      const name = (booking.client_name || "").trim();
      const phone = (booking.phone || "").trim();
      const contactKey = bookingContactKey(booking.email || "", name, phone, booking.id);

      if (!acc[contactKey]) {
        acc[contactKey] = {
          id: contactKey,
          name: booking.client_name || "Unknown",
          email: booking.email || "No Email",
          phone: booking.phone || "",
          bookings: [],
        };
      }
      acc[contactKey].bookings.push(booking);
      return acc;
    }, {} as Record<string, any>);

    const fromBookings = Object.values(grouped) as UnifiedClient[];

    const seenKeys = new Set(fromBookings.map((c) => c.id));
    const merged: UnifiedClient[] = [...fromBookings];

    for (const d of directoryRows) {
      const emailForKey = d.email && d.email !== "No Email" ? d.email : "";
      const ck = bookingContactKey(emailForKey, d.client_name, d.phone, d.id);
      if (seenKeys.has(ck)) continue;
      seenKeys.add(ck);
      merged.push({
        id: d.id,
        name: d.client_name || "Unknown",
        email: d.email || "No Email",
        phone: d.phone || "",
        bookings: [],
        fromDirectory: true,
        directoryCreatedAt: d.created_at,
      } satisfies UnifiedClient);
    }

    return merged.sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings, directoryRows]);

  const filteredClients = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.email.toLowerCase().includes(q) || 
      c.phone.includes(q)
    );
  }, [clients, searchQuery]);

  const selectedIds = useMemo(
    () => Object.keys(selectedForDelete).filter((id) => selectedForDelete[id]),
    [selectedForDelete],
  );

  const clearHoldTimers = () => {
    if (holdIntervalRef.current) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    if (holdTimeoutRef.current) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  };

  const handleDeleteSelected = async (idsToDelete: string[]) => {
    try {
      const targets = clients.filter((c) => idsToDelete.includes(c.id));
      const directoryIds = targets.filter((c) => c.fromDirectory).map((c) => c.id);
      const bookingIds = Array.from(
        new Set(targets.flatMap((c) => c.bookings.map((b: any) => String(b.id))).filter(Boolean)),
      );

      let deletedPatients = 0;
      if (directoryIds.length > 0) {
        await deleteDirectory.mutateAsync(directoryIds);
      }
      if (bookingIds.length > 0) {
        await deleteBookingsBulk.mutateAsync(bookingIds);
      }
      deletedPatients = targets.length;
      toast.success(`Deleted ${deletedPatients} patient record${deletedPatients > 1 ? "s" : ""}`);
      setSelectedForDelete((prev) => {
        const next = { ...prev };
        idsToDelete.forEach((id) => delete next[id]);
        return next;
      });
      if (expandedClientId && idsToDelete.includes(expandedClientId)) setExpandedClientId(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setPendingDeleteIds([]);
      setConfirmDeleteOpen(false);
      setHoldProgress(0);
    }
  };

  const deletingNow = deleteDirectory.isPending || deleteBookingsBulk.isPending;

  const startHoldDelete = () => {
    if (selectedIds.length === 0 || deletingNow) return;
    clearHoldTimers();
    const start = Date.now();
    setHoldProgress(0);

    holdIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / HOLD_TO_DELETE_MS) * 100);
      setHoldProgress(pct);
    }, 16);

    holdTimeoutRef.current = window.setTimeout(() => {
      clearHoldTimers();
      setHoldProgress(100);
      setPendingDeleteIds(selectedIds);
      setConfirmDeleteOpen(true);
      setHoldProgress(0);
    }, HOLD_TO_DELETE_MS);
  };

  const stopHoldDelete = () => {
    if (deletingNow) return;
    clearHoldTimers();
    setHoldProgress(0);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading patient records...</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-w-5xl mx-auto pb-12",
        expandedClientId ? "flex min-h-0 flex-1 flex-col space-y-4 md:space-y-6" : "space-y-8",
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Users size={28} />
            </div>
            Patients
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            View and manage your patient database. Import paper lists with{" "}
            <span className="font-semibold text-foreground/80">Import patients</span>.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center md:w-auto md:max-w-xl">
          <Button
            type="button"
            variant="outline"
            className="h-12 shrink-0 rounded-2xl border-primary/25 bg-primary/5 px-4 text-sm font-bold text-primary hover:bg-primary/10"
            onClick={() => setImportOpen(true)}
            disabled={directoryLoading}
          >
            <Upload size={18} className="mr-2" />
            Import patients
          </Button>
          <div className="relative min-w-0 flex-1 shadow-sm rounded-2xl overflow-hidden bg-white border border-border/40">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search size={18} className="text-muted-foreground/60" />
            </div>
            <Input
              type="text"
              placeholder="Search patients..."
              className="w-full border-none bg-transparent py-6 pl-11 pr-4 text-sm font-medium focus-visible:ring-0 rounded-none shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <PatientImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        isPending={importDirectory.isPending}
        onImport={async (patients) => {
          try {
            const res = await importDirectory.mutateAsync(patients);
            toast.success(`Imported ${res.inserted} patient${res.inserted === 1 ? "" : "s"}`);
            setImportOpen(false);
          } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Import failed");
          }
        }}
      />

      {selectedIds.length > 0 && (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/50 bg-white px-3 py-2.5">
        <p className="text-xs font-medium text-muted-foreground">
          Select patients, then delete in bulk.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="relative h-8 overflow-hidden rounded-xl px-3 text-xs font-bold"
          disabled={selectedIds.length === 0 || deletingNow}
          onPointerDown={startHoldDelete}
          onPointerUp={stopHoldDelete}
          onPointerLeave={stopHoldDelete}
          onPointerCancel={stopHoldDelete}
        >
          <span
            className="absolute inset-y-0 left-0 bg-black/20 transition-none"
            style={{ width: `${holdProgress}%` }}
            aria-hidden
          />
          <span className="relative z-10 inline-flex items-center">
          <Trash2 size={14} className="mr-1.5" />
          {deletingNow
            ? "Deleting..."
            : holdProgress > 0
              ? `Hold... ${Math.floor(holdProgress)}%`
              : `Hold to Delete (${selectedIds.length})`}
          </span>
        </Button>
      </div>
      )}

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected patient records?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete {pendingDeleteIds.length} patient record
              {pendingDeleteIds.length === 1 ? "" : "s"}. This includes linked booking records for selected patients.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingNow}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteSelected(pendingDeleteIds);
              }}
              disabled={deletingNow || pendingDeleteIds.length === 0}
            >
              {deletingNow ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Client List */}
      <div
        className={cn(
          "grid min-h-0 grid-cols-1 gap-4",
          expandedClientId ? "flex-1" : "max-h-[68vh] overflow-y-auto pr-1 md:max-h-[74vh]",
        )}
      >
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-border/60">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No patients found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search query.</p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <div 
              key={client.id}
              className={cn(
                "group overflow-hidden rounded-[1.75rem] border border-border/40 bg-white transition-all duration-300",
                expandedClientId === client.id
                  ? "flex min-h-[calc(100dvh-10.5rem)] flex-1 flex-col ring-2 ring-primary/20 shadow-xl shadow-primary/5 md:min-h-[calc(100dvh-6.25rem)]"
                  : "hover:shadow-lg hover:shadow-black/5",
              )}
            >
              {/* Client Summary Row — div, not button, so the Radix checkbox is not nested inside a button */}
              <motion.div
                role="button"
                tabIndex={0}
                onClick={() => setExpandedClientId(expandedClientId === client.id ? null : client.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpandedClientId(expandedClientId === client.id ? null : client.id);
                  }
                }}
                className="flex w-full shrink-0 cursor-pointer items-center gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:p-6"
              >
                <div
                  className="shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={!!selectedForDelete[client.id]}
                    onCheckedChange={(v) =>
                      setSelectedForDelete((prev) => ({
                        ...prev,
                        [client.id]: v === true,
                      }))
                    }
                    aria-label={`Select ${client.name} for delete`}
                  />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary font-bold text-lg border border-secondary shadow-sm shrink-0">
                  {client.name.charAt(0)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground tracking-tight truncate">{client.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Mail size={12} className="shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Phone size={12} className="shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-6 shrink-0">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Records</span>
                    <span className="text-sm font-bold text-foreground">{client.bookings.length}</span>
                  </div>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    expandedClientId === client.id ? "bg-primary text-white rotate-180" : "bg-muted/30 text-muted-foreground"
                  )}>
                    <ChevronDown size={18} />
                  </div>
                </div>
              </motion.div>

              {/* Expanded Profile & History */}
              <AnimatePresence>
                {expandedClientId === client.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex min-h-0 flex-1 flex-col overflow-x-hidden border-t border-border/40 bg-muted/5"
                  >
                    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden p-6 md:p-8">
                      {/* Detailed Info Cards */}
                      <div className="grid shrink-0 grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="p-5 rounded-3xl bg-white border border-border/40 shadow-sm shadow-black/[0.02]">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                              <History size={16} />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Quick Statistics</h4>
                          </div>
                          <div className="space-y-3">
                            {(() => {
                              const sorted = [...client.bookings].sort(
                                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
                              );
                              const directoryCreated = client.directoryCreatedAt;
                              const accountDate =
                                sorted[0]?.created_at ?? directoryCreated ?? null;
                              const lastVisit =
                                sorted.length > 0 ? sorted[sorted.length - 1].created_at : null;
                              return (
                                <>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Account Created</span>
                                    <span className="text-foreground font-bold">
                                      {accountDate ? format(new Date(accountDate), "MMMM dd, yyyy") : "—"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Total Appointments</span>
                                    <span className="text-foreground font-bold">{client.bookings.length}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Last Visit</span>
                                    <span className="text-foreground font-bold">
                                      {lastVisit ? format(new Date(lastVisit), "MMM dd, yyyy") : "—"}
                                    </span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="p-5 rounded-3xl bg-white border border-border/40 shadow-sm shadow-black/[0.02]">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                              <CheckCircle2 size={16} />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Top Service</h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <p className="text-sm font-bold text-foreground">Acupuncture Therapy</p>
                              <p className="text-[11px] text-muted-foreground font-medium mt-0.5 whitespace-nowrap">Most frequently booked service.</p>
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 shadow-none border-emerald-100 rounded-lg py-1">Standard</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <ClientIntakeForms
                          isActive={expandedClientId === client.id}
                          clientKey={client.id}
                          clientName={client.name}
                          phone={client.phone}
                          email={client.email}
                        />
                      </div>

                      {/* Timeline */}
                      <div className="space-y-4">
                        <div className="flex shrink-0 items-center justify-between">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Booking History</h4>
                          <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-full">Sorted by newest</span>
                        </div>

                        <div className="space-y-3 pr-1">
                          {client.bookings.map((booking: any) => (
                            <div 
                              key={booking.id}
                              className="group/item flex items-start gap-4 p-4 rounded-2xl bg-white border border-border/40 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all"
                            >
                              <div className="shrink-0 mt-1">
                                {booking.status === 'confirmed' ? (
                                  <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                                    <CheckCircle2 size={16} />
                                  </div>
                                ) : booking.status === 'queued' ? (
                                  <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                                    <Clock3 size={16} />
                                  </div>
                                ) : booking.status === 'no-show' ? (
                                  <div className="p-2 bg-orange-500/10 text-orange-600 rounded-xl">
                                    <UserX size={16} />
                                  </div>
                                ) : (
                                  <div className="p-2 bg-red-500/10 text-red-600 rounded-xl">
                                    <XCircle size={16} />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <h5 className="text-sm font-bold text-foreground truncate">
                                    {booking.schedules?.title || "Regular Session"}
                                  </h5>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] font-bold h-5 px-1.5 rounded-md border-border/60 text-muted-foreground">
                                      {booking.reference_code}
                                    </Badge>
                                    <Link 
                                      href={`/admin/schedules/${booking.schedule_id}`}
                                      className="p-1.5 opacity-0 group-hover/item:opacity-100 text-primary hover:bg-primary/10 rounded-lg transition-all"
                                    >
                                      <ExternalLink size={14} />
                                    </Link>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <CalendarIcon size={12} className="text-muted-foreground/60" />
                                    <span>{format(new Date(booking.schedules?.date || booking.created_at), 'MMM dd, yyyy')}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock size={12} className="text-muted-foreground/60" />
                                    <span>{booking.schedules?.start_time ? formatTime12h(booking.schedules.start_time) : "N/A"}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <span className={cn(
                                      "w-1.5 h-1.5 rounded-full mt-0.5",
                                      booking.status === 'confirmed' ? "bg-emerald-500" : booking.status === 'queued' ? "bg-amber-500" : "bg-red-500"
                                    )} />
                                    <span className="font-bold text-muted-foreground capitalize">{booking.status}</span>
                                  </div>
                                </div>
                                {booking.notes && (
                                  <p className="mt-3 p-3 rounded-xl bg-muted/30 text-[11px] text-muted-foreground leading-relaxed italic border border-border/20">
                                    "{booking.notes}"
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
