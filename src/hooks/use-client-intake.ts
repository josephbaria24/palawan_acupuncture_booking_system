import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { FollowUpIntakePayload, IntakeFormType, NewPatientIntakePayload } from "@/types/patient-intake";

export type ClientIntakeBundle = {
  new_patient: NewPatientIntakePayload | null;
  follow_up: FollowUpIntakePayload | null;
};

export function useClientIntake(clientKey: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["client-intake", clientKey],
    enabled: !!clientKey && enabled,
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/client-intake?clientKey=${encodeURIComponent(clientKey!)}`, {
        headers: {
          Authorization: session ? `Bearer ${session.access_token}` : "",
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load intake forms");
      }
      return (await res.json()) as ClientIntakeBundle;
    },
  });
}

export function useSaveClientIntake() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { clientKey: string; formType: IntakeFormType; payload: unknown }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/client-intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: session ? `Bearer ${session.access_token}` : "",
        },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save intake form");
      }
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["client-intake", vars.clientKey] });
    },
  });
}
