"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/lib/toast";
import { ClipboardList, Save } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { TEN_QUESTION_KEYS } from "@/lib/intake-form-definitions";
import { clearIntakeDraftLocal, loadIntakeDraftLocal, saveIntakeDraftLocal } from "@/lib/intake-draft-storage";
import { defaultFollowUp, defaultNewPatient, mergeFollowUp, mergeNewPatient } from "@/lib/patient-intake-defaults";
import { useClientIntake, useSaveClientIntake } from "@/hooks/use-client-intake";
import type { FollowUpIntakePayload, NewPatientIntakePayload, WomenIntakeFields } from "@/types/patient-intake";
import { cn } from "@/lib/utils";
import { NewPatientIntakePaperForm } from "@/components/admin/new-patient-intake-paper";

type Props = {
  isActive: boolean;
  clientKey: string;
  clientName: string;
  phone: string;
  email: string;
};

function CheckRow({
  label,
  checked,
  onChecked,
  className,
}: {
  label: string;
  checked: boolean;
  onChecked: (v: boolean) => void;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-2 rounded-sm border border-transparent px-1.5 py-1 text-[11px] leading-snug hover:border-[#4472C4]/25",
        className,
      )}
    >
      <Checkbox checked={checked} onCheckedChange={(v) => onChecked(v === true)} className="mt-0.5 border-[#44546A]/40 data-[state=checked]:border-[#4472C4] data-[state=checked]:bg-[#4472C4]" />
      <span className="text-[#1a1a1a]">{label}</span>
    </label>
  );
}

/** Word form–style grey section band (Office theme dk2 / lt2). */
function IntakeDocSectionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-y border-[#4472C4]/20 bg-[#E7E6E6] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#44546A]">
      {children}
    </div>
  );
}

const PERIOD_DETAIL_ROWS = [
  ["normal", "Normal"],
  ["excessive", "Excessive"],
  ["scanty", "Scanty"],
  ["clotting", "Clotting"],
  ["cramping", "Cramping"],
  ["low_back", "Low back pain"],
  ["breast_tenderness", "Breast tenderness"],
] as const;

function WomenHealthForm({
  women,
  setWomen,
}: {
  women: WomenIntakeFields;
  setWomen: (next: WomenIntakeFields) => void;
}) {
  return (
    <div className="space-y-3 border-b border-[#4472C4]/10 bg-[#fafafa] p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-[#44546A]">Pregnant?</Label>
          <RadioGroup
            value={women.pregnant || undefined}
            onValueChange={(v) => setWomen({ ...women, pregnant: (v as WomenIntakeFields["pregnant"]) || "" })}
            className="flex gap-4"
          >
            <label className="flex items-center gap-2 text-xs font-semibold">
              <RadioGroupItem value="yes" id="wh-preg-y" />
              Yes
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold">
              <RadioGroupItem value="no" id="wh-preg-n" />
              No
            </label>
          </RadioGroup>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase text-[#44546A]">Age of menarche</Label>
          <Input
            className="h-9 rounded-sm border-[#4472C4]/25 text-sm"
            value={women.ageOfMenarche}
            onChange={(e) => setWomen({ ...women, ageOfMenarche: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase text-[#44546A]">Last menstrual period date</Label>
          <Input
            type="date"
            className="h-9 rounded-sm border-[#4472C4]/25 text-sm"
            value={women.lastPeriodDate}
            onChange={(e) => setWomen({ ...women, lastPeriodDate: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase text-[#44546A]">Duration / flow (days)</Label>
          <Input
            className="h-9 rounded-sm border-[#4472C4]/25 text-sm"
            value={women.durationFlow}
            onChange={(e) => setWomen({ ...women, durationFlow: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase text-[#44546A]">General period cycle (days)</Label>
          <Input
            className="h-9 rounded-sm border-[#4472C4]/25 text-sm"
            value={women.cycleDays}
            onChange={(e) => setWomen({ ...women, cycleDays: e.target.value })}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-[10px] font-bold uppercase text-[#44546A]">Color</Label>
          <Input
            className="h-9 rounded-sm border-[#4472C4]/25 text-sm"
            value={women.periodColor}
            onChange={(e) => setWomen({ ...women, periodColor: e.target.value })}
          />
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#44546A]">Details of last period</p>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {PERIOD_DETAIL_ROWS.map(([id, label]) => (
          <CheckRow
            key={id}
            label={label}
            checked={!!women.periodDetails[id]}
            onChecked={(v) => setWomen({ ...women, periodDetails: { ...women.periodDetails, [id]: v } })}
          />
        ))}
      </div>
    </div>
  );
}

export function ClientIntakeForms({ isActive, clientKey, clientName, phone, email }: Props) {
  const { data: intakeData, isLoading, isFetching } = useClientIntake(clientKey, isActive);
  const save = useSaveClientIntake();

  const [followUp, setFollowUp] = useState<FollowUpIntakePayload>(() => defaultFollowUp(clientName));
  const [newPatient, setNewPatient] = useState<NewPatientIntakePayload>(() => defaultNewPatient(clientName, phone));
  const [draftReady, setDraftReady] = useState(false);
  const draftRestoreToastShown = useRef(false);
  const lastHydratedFingerprint = useRef<string>("");

  useEffect(() => {
    setDraftReady(false);
    draftRestoreToastShown.current = false;
    lastHydratedFingerprint.current = "";
    setFollowUp(defaultFollowUp(clientName));
    setNewPatient(defaultNewPatient(clientName, phone));
  }, [clientKey, clientName, phone]);

  const busy = isLoading || isFetching;

  useEffect(() => {
    if (busy) return;
    const bundle = intakeData ?? { new_patient: null, follow_up: null };
    const fingerprint = `${clientKey}|${clientName}|${phone}|${JSON.stringify(bundle)}`;
    if (fingerprint === lastHydratedFingerprint.current) return;
    lastHydratedFingerprint.current = fingerprint;

    const mergedF = mergeFollowUp(defaultFollowUp(clientName), bundle.follow_up as Partial<FollowUpIntakePayload> | null);
    const mergedN = mergeNewPatient(
      defaultNewPatient(clientName, phone),
      bundle.new_patient as Partial<NewPatientIntakePayload> | null,
    );
    const draftF = loadIntakeDraftLocal<FollowUpIntakePayload>(clientKey, "follow_up");
    const draftN = loadIntakeDraftLocal<NewPatientIntakePayload>(clientKey, "new_patient");
    setFollowUp(draftF ? mergeFollowUp(mergedF, draftF) : mergedF);
    setNewPatient(draftN ? mergeNewPatient(mergedN, draftN) : mergedN);
    if ((draftF || draftN) && !draftRestoreToastShown.current) {
      draftRestoreToastShown.current = true;
      toast.info("Restored an unsaved draft from this browser.");
    }
    setDraftReady(true);
  }, [busy, intakeData, clientName, phone, clientKey]);

  useEffect(() => {
    if (!draftReady || !clientKey || !isActive) return;
    const t = window.setTimeout(() => {
      saveIntakeDraftLocal(clientKey, "new_patient", newPatient);
    }, 750);
    return () => window.clearTimeout(t);
  }, [newPatient, clientKey, draftReady, isActive]);

  useEffect(() => {
    if (!draftReady || !clientKey || !isActive) return;
    const t = window.setTimeout(() => {
      saveIntakeDraftLocal(clientKey, "follow_up", followUp);
    }, 750);
    return () => window.clearTimeout(t);
  }, [followUp, clientKey, draftReady, isActive]);

  const emailHint = useMemo(() => (email && email !== "No Email" ? email : ""), [email]);

  const toggleMap = (section: "familyHistory" | "pastMedical" | "safetyFlags" | "organSystems", key: string, v: boolean) => {
    setNewPatient((prev) => {
      const cur = prev[section] as Record<string, boolean>;
      return { ...prev, [section]: { ...cur, [key]: v } };
    });
  };

  const saveFollow = async () => {
    try {
      await save.mutateAsync({ clientKey, formType: "follow_up", payload: followUp });
      clearIntakeDraftLocal(clientKey, "follow_up");
      toast.success("Follow-up intake saved");
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    }
  };

  const saveNew = async () => {
    try {
      await save.mutateAsync({ clientKey, formType: "new_patient", payload: newPatient });
      clearIntakeDraftLocal(clientKey, "new_patient");
      toast.success("New patient intake saved");
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    }
  };

  if (!isActive) return null;

  return (
    <div className="rounded-3xl border border-border/40 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <ClipboardList size={16} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Intake forms</h4>
            <p className="text-[11px] text-muted-foreground">
              Linked to this patient record{emailHint ? ` · ${emailHint}` : ""}. Drafts autosave in this browser
              (refresh-safe until you save to the server).
            </p>
          </div>
        </div>
        {busy && <span className="text-[10px] font-bold text-muted-foreground">Loading…</span>}
      </div>

      <Tabs defaultValue="follow_up" className="w-full">
        <TabsList className="grid h-10 w-full grid-cols-2 rounded-xl bg-muted/40 p-1">
          <TabsTrigger value="follow_up" className="rounded-lg text-xs font-bold">
            Follow-up
          </TabsTrigger>
          <TabsTrigger value="new_patient" className="rounded-lg text-xs font-bold">
            New patient
          </TabsTrigger>
        </TabsList>

        <TabsContent value="follow_up" className="mt-3 space-y-3">
          <div className="overflow-hidden rounded-sm border-2 border-[#4472C4] bg-white shadow-sm">
            <div className="bg-[#4472C4] px-4 py-2.5 text-center text-[13px] font-black uppercase tracking-wide text-white">Patient intake</div>
            <div className="space-y-0">
              <IntakeDocSectionBar>Visit & patient</IntakeDocSectionBar>
              <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-[#44546A]">Date</Label>
                  <Input
                    type="date"
                    className="h-9 rounded-sm border-[#4472C4]/25 text-sm"
                    value={followUp.intakeDate}
                    onChange={(e) => setFollowUp({ ...followUp, intakeDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-[#44546A]">Patient name</Label>
                  <Input
                    className="h-9 rounded-sm border-[#4472C4]/25 text-sm"
                    value={followUp.patientName}
                    onChange={(e) => setFollowUp({ ...followUp, patientName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-[#44546A]">Age</Label>
                  <Input
                    className="h-9 rounded-sm border-[#4472C4]/25 text-sm"
                    value={followUp.age}
                    onChange={(e) => setFollowUp({ ...followUp, age: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-[#44546A]">Sex</Label>
                  <RadioGroup
                    value={followUp.sex || undefined}
                    onValueChange={(v) => setFollowUp({ ...followUp, sex: (v as FollowUpIntakePayload["sex"]) || "" })}
                    className="flex gap-4"
                  >
                    <label className="flex items-center gap-2 text-xs font-semibold">
                      <RadioGroupItem value="M" id="follow-up-sex-m" />M
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold">
                      <RadioGroupItem value="F" id="follow-up-sex-f" />F
                    </label>
                  </RadioGroup>
                </div>
              </div>
              <IntakeDocSectionBar>Chief complaints · tongue & pulse · history</IntakeDocSectionBar>
              <div className="space-y-3 p-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-[#44546A]">Chief complaints</Label>
                  <Textarea
                    rows={3}
                    className="rounded-sm border-[#4472C4]/25 text-sm"
                    value={followUp.chiefComplaints}
                    onChange={(e) => setFollowUp({ ...followUp, chiefComplaints: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-[#44546A]">Tongue and pulse</Label>
                    <Textarea
                      rows={2}
                      className="rounded-sm border-[#4472C4]/25 text-sm"
                      value={followUp.tonguePulse}
                      onChange={(e) => setFollowUp({ ...followUp, tonguePulse: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-[#44546A]">Present illness history</Label>
                    <Textarea
                      rows={2}
                      className="rounded-sm border-[#4472C4]/25 text-sm"
                      value={followUp.presentIllnessHistory}
                      onChange={(e) => setFollowUp({ ...followUp, presentIllnessHistory: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <IntakeDocSectionBar>10 question song</IntakeDocSectionBar>
              <div className="space-y-3 border-b border-[#4472C4]/10 p-3">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-center text-[10px] font-black uppercase tracking-widest text-[#4472C4]">Cun · Guan · Chi (left)</p>
                    <div className="space-y-2">
                      {(["cun_l", "guan_l", "chi_l"] as const).map((id) => {
                        const k = TEN_QUESTION_KEYS.find((x) => x.id === id)!;
                        return (
                          <div key={id} className="space-y-1">
                            <Label className="text-[10px] font-bold text-[#44546A]">{k.label}</Label>
                            <Input
                              className="h-8 rounded-sm border-[#4472C4]/25 text-xs"
                              value={followUp.tenQuestionSong[id] || ""}
                              onChange={(e) =>
                                setFollowUp({
                                  ...followUp,
                                  tenQuestionSong: { ...followUp.tenQuestionSong, [id]: e.target.value },
                                })
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-center text-[10px] font-black uppercase tracking-widest text-[#4472C4]">Cun · Guan · Chi (right)</p>
                    <div className="space-y-2">
                      {(["cun_r", "guan_r", "chi_r"] as const).map((id) => {
                        const k = TEN_QUESTION_KEYS.find((x) => x.id === id)!;
                        return (
                          <div key={id} className="space-y-1">
                            <Label className="text-[10px] font-bold text-[#44546A]">{k.label}</Label>
                            <Input
                              className="h-8 rounded-sm border-[#4472C4]/25 text-xs"
                              value={followUp.tenQuestionSong[id] || ""}
                              onChange={(e) =>
                                setFollowUp({
                                  ...followUp,
                                  tenQuestionSong: { ...followUp.tenQuestionSong, [id]: e.target.value },
                                })
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="border-y border-[#4472C4]/15">
                  {TEN_QUESTION_KEYS.slice(6).map((k) => (
                    <div key={k.id} className="flex flex-row items-start gap-2 border-b border-[#4472C4]/10 py-2 last:border-b-0 sm:items-center sm:gap-3">
                      <Label className="w-[38%] max-w-[11.5rem] shrink-0 pt-0.5 text-[10px] font-bold leading-snug text-[#44546A] sm:w-[40%] sm:max-w-[14rem]">
                        {k.label}
                      </Label>
                      <Input
                        className="h-8 min-h-8 min-w-0 flex-1 rounded-sm border-[#4472C4]/25 text-xs"
                        value={followUp.tenQuestionSong[k.id] || ""}
                        onChange={(e) =>
                          setFollowUp({
                            ...followUp,
                            tenQuestionSong: { ...followUp.tenQuestionSong, [k.id]: e.target.value },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2 border-b border-[#4472C4]/10 p-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#44546A]">Pain level (1 – 10)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFollowUp({ ...followUp, painLevel: n })}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                        followUp.painLevel === n
                          ? "border-[#4472C4] bg-[#4472C4] text-white"
                          : "border-[#4472C4]/35 bg-white text-[#44546A] hover:border-[#4472C4]",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <IntakeDocSectionBar>Women</IntakeDocSectionBar>
              <WomenHealthForm
                women={followUp.women}
                setWomen={(next) => setFollowUp({ ...followUp, women: next })}
              />
              <IntakeDocSectionBar>TCM diagnosis · treatment methods · notes</IntakeDocSectionBar>
              <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-[#44546A]">TCM diagnosis</Label>
                  <Textarea
                    rows={2}
                    className="rounded-sm border-[#4472C4]/25 text-sm"
                    value={followUp.tcmDiagnosis}
                    onChange={(e) => setFollowUp({ ...followUp, tcmDiagnosis: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-[#44546A]">Treatment methods</Label>
                  <Textarea
                    rows={2}
                    className="rounded-sm border-[#4472C4]/25 text-sm"
                    value={followUp.treatmentMethods}
                    onChange={(e) => setFollowUp({ ...followUp, treatmentMethods: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-[10px] font-bold uppercase text-[#44546A]">Treatment principles</Label>
                  <Textarea
                    rows={2}
                    className="rounded-sm border-[#4472C4]/25 text-sm"
                    value={followUp.treatmentPrinciple}
                    onChange={(e) => setFollowUp({ ...followUp, treatmentPrinciple: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-[10px] font-bold uppercase text-[#44546A]">Notes</Label>
                  <Textarea
                    rows={3}
                    className="rounded-sm border-[#4472C4]/25 text-sm"
                    value={followUp.notes}
                    onChange={(e) => setFollowUp({ ...followUp, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end border-t border-[#4472C4]/15 p-3">
                <Button
                  size="sm"
                  className="h-9 rounded-sm bg-[#4472C4] px-4 font-bold hover:bg-[#3a63ad]"
                  onClick={saveFollow}
                  disabled={save.isPending}
                >
                  <Save size={14} className="mr-2" />
                  Save follow-up
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="new_patient" className="mt-3">
          <NewPatientIntakePaperForm
            newPatient={newPatient}
            setNewPatient={setNewPatient}
            toggleMap={toggleMap}
            onSave={saveNew}
            saving={save.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
