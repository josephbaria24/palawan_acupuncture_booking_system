"use client";

import { cn } from "@/lib/utils";
import type { BodyPainMarker } from "@/types/patient-intake";
import { Trash2 } from "lucide-react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

const VIEWS = ["back", "front", "side"] as const;
type BodyView = (typeof VIEWS)[number];

const VIEW_LABEL: Record<BodyView, string> = {
  back: "Back",
  front: "Front",
  side: "Side",
};

function newMarkerId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function clampPct(n: number): number {
  return Math.min(100, Math.max(0, n));
}

/** Pixel rect of the visible image (object-fit: contain) relative to the stage padding box. */
type FitRect = { left: number; top: number; width: number; height: number };

function computeObjectFitContainRect(stage: HTMLDivElement, img: HTMLImageElement): FitRect | null {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const iw = img.clientWidth;
  const ih = img.clientHeight;
  if (!nw || !nh || !iw || !ih) return null;

  const scale = Math.min(iw / nw, ih / nh);
  const fw = nw * scale;
  const fh = nh * scale;
  const insetX = (iw - fw) / 2;
  const insetY = (ih - fh) / 2;

  const stageRect = stage.getBoundingClientRect();
  const imgRect = img.getBoundingClientRect();
  const fitLeftViewport = imgRect.left + insetX;
  const fitTopViewport = imgRect.top + insetY;

  const cs = getComputedStyle(stage);
  const borderL = parseFloat(cs.borderLeftWidth) || 0;
  const borderT = parseFloat(cs.borderTopWidth) || 0;
  const padLeftViewport = stageRect.left + borderL;
  const padTopViewport = stageRect.top + borderT;

  return {
    left: fitLeftViewport - padLeftViewport,
    top: fitTopViewport - padTopViewport,
    width: fw,
    height: fh,
  };
}

function markerPositionPx(m: BodyPainMarker, fit: FitRect): { left: number; top: number } {
  const col = Math.max(0, VIEWS.indexOf(m.view));
  const x = fit.left + ((col + m.xPct / 100) / 3) * fit.width;
  const y = fit.top + (m.yPct / 100) * fit.height;
  return { left: x, top: y };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-neutral-900">{children}</span>;
}

const LEVELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;

type Props = {
  markers: BodyPainMarker[];
  painLevel: string;
  onPainLevel: (n: string) => void;
  onMarkersChange: (next: BodyPainMarker[]) => void;
};

export function BodyDiagramPainMap({ markers, painLevel, onPainLevel, onMarkersChange }: Props) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [fitRect, setFitRect] = useState<FitRect>({ left: 0, top: 0, width: 0, height: 0 });

  /** Avoid stale closures: right after placing a point, pain-level clicks must see the new marker. */
  const markersRef = useRef(markers);
  const highlightedIdRef = useRef(highlightedId);
  markersRef.current = markers;
  highlightedIdRef.current = highlightedId;

  const measureFit = useCallback(() => {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img) return;
    const next = computeObjectFitContainRect(stage, img);
    if (next) setFitRect(next);
  }, []);

  useLayoutEffect(() => {
    measureFit();
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => measureFit());
    ro.observe(stage);
    return () => ro.disconnect();
  }, [measureFit]);

  const displayedPainLevel = useMemo(() => {
    if (!highlightedId) return painLevel;
    const pl = markers.find((m) => m.id === highlightedId)?.painLevel;
    if (pl === "") return "";
    return pl ?? painLevel;
  }, [highlightedId, markers, painLevel]);

  const applyPainLevel = useCallback(
    (n: string) => {
      const id = highlightedIdRef.current;
      const current = markersRef.current;
      if (id && current.some((m) => m.id === id)) {
        onMarkersChange(current.map((m) => (m.id === id ? { ...m, painLevel: n } : m)));
      }
      onPainLevel(n);
    },
    [onMarkersChange, onPainLevel],
  );

  const handleDiagramClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const layer = e.currentTarget;
    const w = layer.clientWidth;
    const h = layer.clientHeight;
    if (w < 8 || h < 8) return;

    const ox = e.nativeEvent.offsetX;
    const oy = e.nativeEvent.offsetY;
    const xNorm = Math.max(0, Math.min(1 - 1e-12, ox / w));
    const yNorm = Math.max(0, Math.min(1, oy / h));

    const col = Math.min(2, Math.floor(xNorm * 3));
    const view = VIEWS[col];
    const xPct = clampPct((xNorm * 3 - col) * 100);
    const yPct = clampPct(yNorm * 100);

    const id = newMarkerId();
    const current = markersRef.current;
    onMarkersChange([...current, { id, view, xPct, yPct, painLevel: "" }]);
    setHighlightedId(id);
  };

  const removeMarker = (id: string) => {
    onMarkersChange(markers.filter((m) => m.id !== id));
    setHighlightedId((cur) => (cur === id ? null : cur));
  };

  return (
    <div>
      <FieldLabel>Body diagram (click figure to add a point)</FieldLabel>
      <p className="mb-2 text-[10px] leading-snug text-neutral-600">
        Click back, front, or side to place a point, then press 1–10 for that point's severity. Click a list row to focus
        a point on the diagram.
      </p>
      <div
        ref={stageRef}
        className="relative w-full touch-manipulation border border-[#0f2942]/40 bg-white p-2 sm:p-3"
      >
        <img
          ref={imgRef}
          src="/images/body-diagram-intake.png"
          alt="Body diagram: back, front, and side views. Click to mark pain locations."
          className="pointer-events-none mx-auto block h-auto max-h-[min(42vh,320px)] w-full max-w-full select-none object-contain sm:max-h-[min(50vh,380px)]"
          draggable={false}
          onLoad={measureFit}
        />
        {fitRect.width > 0 && fitRect.height > 0 && (
          <div
            role="presentation"
            className="absolute z-[1] cursor-crosshair bg-transparent"
            style={{
              left: fitRect.left,
              top: fitRect.top,
              width: fitRect.width,
              height: fitRect.height,
            }}
            onClick={handleDiagramClick}
          />
        )}
        {fitRect.width > 0 &&
          fitRect.height > 0 &&
          markers.map((m) => {
            const { left, top } = markerPositionPx(m, fitRect);
            const isHi = m.id === highlightedId;
            return (
              <button
                key={m.id}
                type="button"
                title={`${VIEW_LABEL[m.view]} · level ${m.painLevel || "unset"}`}
                className={cn(
                  "absolute z-[2] size-3 origin-center -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-red-900 bg-red-600 p-0 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f2942]",
                  isHi && "animate-pain-marker-highlight",
                )}
                style={{ left, top }}
                onClick={(e) => {
                  e.stopPropagation();
                  setHighlightedId(m.id);
                }}
              />
            );
          })}
      </div>

      <div className="mt-4">
        <FieldLabel>Pain level (1 – 10)</FieldLabel>
        <p className="mb-1.5 text-[9px] text-neutral-500">
          {highlightedId
            ? "Sets severity for the selected point (or the one you just placed)."
            : "Select a point on the diagram or in the list, then choose a level."}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {LEVELS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => applyPainLevel(n)}
              className={cn(
                "min-w-[2rem] border-2 px-2 py-1 text-xs font-bold",
                displayedPainLevel !== "" && displayedPainLevel === n
                  ? "border-[#0f2942] bg-[#0f2942] text-white"
                  : "border-[#0f2942]/35 bg-white text-neutral-900",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {markers.length > 0 && (
        <div className="mt-4 border border-[#0f2942]/25 bg-white/90 p-2">
          <FieldLabel>Saved pain points</FieldLabel>
          <ul className="mt-1.5 max-h-40 space-y-1 overflow-y-auto text-[11px]">
            {markers.map((m) => {
              const active = m.id === highlightedId;
              return (
                <li key={m.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setHighlightedId(m.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setHighlightedId(m.id);
                      }
                    }}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-2 rounded border px-2 py-1.5 transition-colors",
                      active ? "border-red-600/60 bg-red-50" : "border-transparent bg-neutral-50/80 hover:bg-neutral-100",
                    )}
                  >
                    <span className="font-semibold text-neutral-900">
                      {VIEW_LABEL[m.view]} · Level {m.painLevel || "—"}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 rounded p-1 text-neutral-500 hover:bg-red-100 hover:text-red-700"
                      aria-label="Remove point"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMarker(m.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
