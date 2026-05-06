import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import type { FollowUpIntakePayload, IntakeFormType, NewPatientIntakePayload } from "@/types/patient-intake";

export type ClientIntakeBundle = {
  new_patient: NewPatientIntakePayload | null;
  follow_up: FollowUpIntakePayload | null;
};

export function usePublicIntake(clientKey: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["public-client-intake", clientKey],
    enabled: !!clientKey && enabled,
    queryFn: async () => {
      const res = await fetch(`/api/public/client-intake?clientKey=${encodeURIComponent(clientKey!)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load intake forms");
      }
      return (await res.json()) as ClientIntakeBundle;
    },
  });
}

export function useSavePublicIntake() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { clientKey: string; formType: IntakeFormType; payload: unknown }) => {
      const res = await fetch("/api/public/client-intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      queryClient.invalidateQueries({ queryKey: ["public-client-intake", vars.clientKey] });
      toast.success("Progress saved securely");
    },
  });
}
