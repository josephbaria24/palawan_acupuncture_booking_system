import type { FollowUpIntakePayload, NewPatientIntakePayload } from "@/types/patient-intake";

const VERSION = "v1";

function key(clientKey: string, formType: "new_patient" | "follow_up"): string {
  return `acupuncture-intake-draft:${VERSION}:${encodeURIComponent(clientKey)}:${formType}`;
}

export function saveIntakeDraftLocal(
  clientKey: string,
  formType: "new_patient" | "follow_up",
  payload: NewPatientIntakePayload | FollowUpIntakePayload,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(clientKey, formType), JSON.stringify({ savedAt: Date.now(), payload }));
  } catch {
    // QuotaExceeded or private mode
  }
}

export function loadIntakeDraftLocal<T extends NewPatientIntakePayload | FollowUpIntakePayload>(
  clientKey: string,
  formType: "new_patient" | "follow_up",
): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(clientKey, formType));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt?: number; payload?: unknown };
    if (!parsed || typeof parsed !== "object" || parsed.payload === undefined || parsed.payload === null) {
      return null;
    }
    return parsed.payload as T;
  } catch {
    return null;
  }
}

export function clearIntakeDraftLocal(clientKey: string, formType: "new_patient" | "follow_up"): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(clientKey, formType));
  } catch {
    /* ignore */
  }
}
