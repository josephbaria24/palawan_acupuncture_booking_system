"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

export type PatientImportRowPayload = {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
};

type GridRow = { id: string; name: string; phone: string; email: string; notes: string };

const COLS = ["name", "phone", "email", "notes"] as const;
const DEFAULT_ROW_COUNT = 16;

function emptyRow(): GridRow {
  return { id: crypto.randomUUID(), name: "", phone: "", email: "", notes: "" };
}

function focusCell(rowIndex: number, colIndex: number) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelector<HTMLInputElement>(`[data-import-cell="${rowIndex}-${colIndex}"]`)?.focus();
    });
  });
}

export function PatientImportDialog({
  open,
  onOpenChange,
  onImport,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (rows: PatientImportRowPayload[]) => Promise<void>;
  isPending: boolean;
}) {
  const [rows, setRows] = useState<GridRow[]>(() => Array.from({ length: DEFAULT_ROW_COUNT }, emptyRow));

  useEffect(() => {
    if (open) {
      setRows(Array.from({ length: DEFAULT_ROW_COUNT }, emptyRow));
    }
  }, [open]);

  const updateCell = (id: string, field: (typeof COLS)[number], value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const addBlankRows = (n: number) => setRows((prev) => [...prev, ...Array.from({ length: n }, emptyRow)]);

  const removeRowAt = (index: number) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearTable = () => setRows(Array.from({ length: DEFAULT_ROW_COUNT }, emptyRow));

  const buildPayload = (): PatientImportRowPayload[] => {
    const out: PatientImportRowPayload[] = [];
    for (const r of rows) {
      const name = r.name.trim();
      const phone = r.phone.trim();
      const email = r.email.trim();
      const notes = r.notes.trim();
      if (!name || !phone) continue;
      out.push({
        name,
        phone,
        ...(email ? { email } : {}),
        ...(notes ? { notes } : {}),
      });
    }
    return out;
  };

  const handleImport = async () => {
    const payload = buildPayload();
    if (payload.length === 0) {
      toast.error("No rows to import", "Enter at least one full name and phone.");
      return;
    }
    await onImport(payload);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, startRow: number) => {
    const text = e.clipboardData.getData("text/plain");
    if (!text) return;
    const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const isGrid = normalized.includes("\t") || normalized.includes("\n");
    if (!isGrid) return;
    e.preventDefault();
    const lines = normalized.split("\n");
    while (lines.length && lines[lines.length - 1] === "") lines.pop();
    if (lines.length === 0) return;

    flushSync(() => {
      setRows((prev) => {
        const next = prev.map((r) => ({ ...r }));
        let rIdx = startRow;
        for (const line of lines) {
          const parts = line.split("\t").map((s) => s.trim());
          const name = (parts[0] ?? "").trim();
          const phone = (parts[1] ?? "").trim();
          const email = (parts[2] ?? "").trim();
          const notes = parts.slice(3).join(" ").trim();
          while (rIdx >= next.length) {
            next.push(emptyRow());
          }
          next[rIdx] = { ...next[rIdx], name, phone, email, notes };
          rIdx++;
        }
        return next;
      });
    });
  };

  const onCellKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const nextRow = rowIndex + 1;
    flushSync(() => {
      setRows((prev) => {
        if (nextRow < prev.length) return prev;
        return [...prev, ...Array.from({ length: 5 }, emptyRow)];
      });
    });
    focusCell(nextRow, colIndex);
  };

  const hasAnyFilled = rows.some((r) => r.name.trim() && r.phone.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[min(100vw-1rem,56rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="shrink-0 border-b border-border/60 px-5 py-4 text-left sm:px-6">
          <DialogTitle>Import patients</DialogTitle>
          <DialogDescription className="text-left text-sm leading-relaxed">
            Click a cell and type like Excel. <strong>Tab</strong> moves across columns; <strong>Enter</strong> moves
            down. You can also <strong>paste</strong> a block copied from a spreadsheet (tab/newline separated). Name and
            phone are required to import a row.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs font-bold" onClick={() => addBlankRows(5)}>
              <Plus size={14} className="mr-1" />
              Add 5 rows
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 text-xs font-semibold text-muted-foreground" onClick={clearTable}>
              Clear table
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border/60 bg-muted/20">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm shadow-[0_1px_0_0_hsl(var(--border))]">
                <tr>
                  <th className="w-10 border-b border-r border-border/60 px-1 py-2 text-center text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    #
                  </th>
                  <th className="min-w-[140px] border-b border-r border-border/60 px-2 py-2 text-left text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Name <span className="text-destructive">*</span>
                  </th>
                  <th className="min-w-[120px] border-b border-r border-border/60 px-2 py-2 text-left text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Phone <span className="text-destructive">*</span>
                  </th>
                  <th className="min-w-[160px] border-b border-r border-border/60 px-2 py-2 text-left text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Email
                  </th>
                  <th className="min-w-[180px] border-b border-border/60 px-2 py-2 text-left text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Notes
                  </th>
                  <th
                    className="w-12 border-b border-border/60 px-1 py-2 text-center text-[10px] font-black uppercase tracking-wider text-muted-foreground"
                    aria-label="Remove row"
                  >
                    {" "}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={row.id} className="bg-background hover:bg-muted/30">
                    <td className="border-b border-r border-border/50 px-1 py-0 text-center text-[11px] font-medium text-muted-foreground">
                      {rowIndex + 1}
                    </td>
                    {COLS.map((field, colIndex) => (
                      <td key={field} className="border-b border-r border-border/50 p-0">
                        <Input
                          data-import-cell={`${rowIndex}-${colIndex}`}
                          value={row[field]}
                          onChange={(e) => updateCell(row.id, field, e.target.value)}
                          onPaste={(e) => handlePaste(e, rowIndex)}
                          onKeyDown={(e) => onCellKeyDown(e, rowIndex, colIndex)}
                          className={cn(
                            "h-9 min-h-9 w-full min-w-0 rounded-none border-0 bg-transparent px-2 py-1 text-sm shadow-none",
                            "focus-visible:z-[1] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                          )}
                          placeholder={field === "name" ? "Full name" : field === "phone" ? "Number" : field === "email" ? "Optional" : ""}
                          autoComplete="off"
                        />
                      </td>
                    ))}
                    <td className="border-b border-border/50 p-0 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeRowAt(rowIndex)}
                        aria-label={`Remove row ${rowIndex + 1}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            Rows with empty name or phone are skipped. Imported patients show in the list without a booking; expand a row for intake
            forms.
          </p>
        </div>

        <DialogFooter className="shrink-0 border-t border-border/60 bg-muted/20 px-5 py-4 sm:px-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="font-bold" disabled={isPending || !hasAnyFilled} onClick={() => void handleImport()}>
            {isPending ? "Importing…" : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
