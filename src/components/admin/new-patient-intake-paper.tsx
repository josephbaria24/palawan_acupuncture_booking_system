"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CONSENT_SPECIAL,
  FAMILY_HISTORY,
  ORGAN_SECTIONS,
  PAST_MEDICAL,
  PAST_MEDICAL_NOTE_KEYS,
  SAFETY_FLAGS,
  TEN_QUESTION_KEYS,
} from "@/lib/intake-form-definitions";
import {
  CONSENT_SIGNATURE_BLOCK,
  CONSENT_STATEMENT_INTRO,
  INFORMED_CONSENT_ACUPUNCTURE_HTML,
  PAST_MEDICAL_INTRO,
} from "@/lib/intake-form-copy";
import { BodyDiagramPainMap } from "@/components/admin/body-diagram-pain-map";
import type { NewPatientIntakePayload, WomenIntakeFields } from "@/types/patient-intake";
import { cn } from "@/lib/utils";
import { Save } from "lucide-react";

type PaperTone = "navy" | "forest";

const PAPER: Record<PaperTone, { head: string; body: string; ring: string; input: string }> = {
  navy: {
    head: "bg-[#0f2942] text-white",
    body: "bg-[#e8f0fc]",
    ring: "border-[#0f2942]",
    input:
      "rounded-none border-0 border-b-2 border-[#0f2942]/30 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
  },
  forest: {
    head: "bg-[#14532d] text-white",
    body: "bg-[#e8f8ec]",
    ring: "border-[#14532d]",
    input:
      "rounded-none border-0 border-b-2 border-[#14532d]/30 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
  },
};

function PaperFormSection({
  tone,
  title,
  children,
  bodyClassName,
}: {
  tone: PaperTone;
  title: string;
  children: React.ReactNode;
  bodyClassName?: string;
}) {
  const t = PAPER[tone];
  return (
    <section className={cn("overflow-hidden border-2 shadow-sm", t.ring)}>
      <div className={cn("px-2 py-2 text-center text-[11px] font-black uppercase leading-tight tracking-wide", t.head)}>{title}</div>
      <div className={cn("border-t-2 p-3 text-[12px] leading-snug text-neutral-900", t.ring, t.body, bodyClassName)}>{children}</div>
    </section>
  );
}

function PaperFieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-neutral-900">{children}</span>;
}

function tin(tone: PaperTone) {
  return PAPER[tone].input;
}

function CheckRowPaper({
  label,
  checked,
  onChecked,
  tone,
}: {
  label: string;
  checked: boolean;
  onChecked: (v: boolean) => void;
  tone: PaperTone;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-2 px-1 py-0.5 text-[11px] leading-snug text-neutral-900",
        tone === "navy" ? "hover:bg-[#0f2942]/5" : "hover:bg-[#14532d]/5",
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChecked(v === true)}
        className={cn(
          "mt-0.5 rounded-sm border-2",
          tone === "navy"
            ? "border-[#0f2942]/50 data-[state=checked]:border-[#0f2942] data-[state=checked]:bg-[#0f2942]"
            : "border-[#14532d]/50 data-[state=checked]:border-[#14532d] data-[state=checked]:bg-[#14532d]",
        )}
      />
      <span>{label}</span>
    </label>
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

function WomenHealthPaperForm({ women, setWomen }: { women: WomenIntakeFields; setWomen: (w: WomenIntakeFields) => void }) {
  return (
    <div className="space-y-3 border-2 border-[#c2410c]/30 bg-[#ffedd5] p-3">
      <div className="text-[11px] font-black uppercase tracking-widest text-[#7c2d12]">Women</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <PaperFieldLabel>Pregnant?</PaperFieldLabel>
          <RadioGroup
            value={women.pregnant || undefined}
            onValueChange={(v) => setWomen({ ...women, pregnant: (v as WomenIntakeFields["pregnant"]) || "" })}
            className="flex gap-4"
          >
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
              <RadioGroupItem value="yes" id="np-paper-preg-y" className="border-[#9a3412]" />
              Yes
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
              <RadioGroupItem value="no" id="np-paper-preg-n" className="border-[#9a3412]" />
              No
            </label>
          </RadioGroup>
        </div>
        <div>
          <PaperFieldLabel>Age of menarche</PaperFieldLabel>
          <Input className={cn(tin("navy"), "h-9 w-full border-b-2 border-[#9a3412]/40")} value={women.ageOfMenarche} onChange={(e) => setWomen({ ...women, ageOfMenarche: e.target.value })} />
        </div>
        <div>
          <PaperFieldLabel>Last menstrual period date</PaperFieldLabel>
          <Input type="date" className={cn(tin("navy"), "h-9 w-full border-b-2 border-[#9a3412]/40")} value={women.lastPeriodDate} onChange={(e) => setWomen({ ...women, lastPeriodDate: e.target.value })} />
        </div>
        <div>
          <PaperFieldLabel>Duration / flow (days)</PaperFieldLabel>
          <Input className={cn(tin("navy"), "h-9 w-full border-b-2 border-[#9a3412]/40")} value={women.durationFlow} onChange={(e) => setWomen({ ...women, durationFlow: e.target.value })} />
        </div>
        <div>
          <PaperFieldLabel>General period cycle (days)</PaperFieldLabel>
          <Input className={cn(tin("navy"), "h-9 w-full border-b-2 border-[#9a3412]/40")} value={women.cycleDays} onChange={(e) => setWomen({ ...women, cycleDays: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <PaperFieldLabel>Color</PaperFieldLabel>
          <Input className={cn(tin("navy"), "h-9 w-full border-b-2 border-[#9a3412]/40")} value={women.periodColor} onChange={(e) => setWomen({ ...women, periodColor: e.target.value })} />
        </div>
      </div>
      <PaperFieldLabel>Details of last period</PaperFieldLabel>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-7">
        {PERIOD_DETAIL_ROWS.map(([id, label]) => (
          <CheckRowPaper
            key={id}
            tone="navy"
            label={label}
            checked={!!women.periodDetails[id]}
            onChecked={(v) => setWomen({ ...women, periodDetails: { ...women.periodDetails, [id]: v } })}
          />
        ))}
      </div>
    </div>
  );
}

function organTone(title: string): PaperTone {
  const m: Record<string, PaperTone> = {
    "LUNG SYSTEM": "forest",
    "KIDNEYS/ BLADDER": "navy",
    "SPLEEN SYSTEM": "forest",
    "STOMACH SYSTEM": "navy",
    "LARGE INTESTINE": "forest",
    "VISION AND HEARING": "forest",
    "SKIN HEALTH": "navy",
  };
  return m[title] ?? "navy";
}

export function NewPatientIntakePaperForm({
  newPatient,
  setNewPatient,
  toggleMap,
  onSave,
  saving,
}: {
  newPatient: NewPatientIntakePayload;
  setNewPatient: React.Dispatch<React.SetStateAction<NewPatientIntakePayload>>;
  toggleMap: (section: "familyHistory" | "pastMedical" | "safetyFlags" | "organSystems", key: string, v: boolean) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="border-[3px] border-[#0c2340] bg-white shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#0c2340] bg-[#0f2942] px-3 py-2.5 text-white">
        <span className="text-[12px] font-black uppercase tracking-wide">New patient intake form</span>
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span>Date:</span>
          <Input
            type="date"
            value={newPatient.intakeDate}
            onChange={(e) => setNewPatient({ ...newPatient, intakeDate: e.target.value })}
            className="h-8 w-[150px] rounded border border-white/40 bg-white/95 text-neutral-900"
          />
        </div>
      </div>
      {/* <div className="flex justify-center border-b-2 border-[#0c2340] bg-[#f0f4fa] px-2 py-2">
        <img src="/images/new-patient-intake-header.jpeg" alt="" className="max-h-20 w-auto max-w-full object-contain" />
      </div> */}

      <div className="space-y-4 p-3 sm:p-4">
        <PaperFormSection tone="navy" title="Personal information">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-7">
              <PaperFieldLabel>Name</PaperFieldLabel>
              <Input className={cn(tin("navy"), "w-full")} value={newPatient.personal.name} onChange={(e) => setNewPatient({ ...newPatient, personal: { ...newPatient.personal, name: e.target.value } })} />
            </div>
            <div className="md:col-span-2">
              <PaperFieldLabel>Age</PaperFieldLabel>
              <Input className={cn(tin("navy"), "w-full")} value={newPatient.personal.age} onChange={(e) => setNewPatient({ ...newPatient, personal: { ...newPatient.personal, age: e.target.value } })} />
            </div>
            <div className="md:col-span-3">
              <PaperFieldLabel>Date of birth</PaperFieldLabel>
              <Input type="date" className={cn(tin("navy"), "w-full")} value={newPatient.personal.dateOfBirth} onChange={(e) => setNewPatient({ ...newPatient, personal: { ...newPatient.personal, dateOfBirth: e.target.value } })} />
            </div>
            <div className="md:col-span-12">
              <PaperFieldLabel>Address</PaperFieldLabel>
              <Textarea rows={2} className={cn(tin("navy"), "min-h-[52px] w-full resize-none")} value={newPatient.personal.address} onChange={(e) => setNewPatient({ ...newPatient, personal: { ...newPatient.personal, address: e.target.value } })} />
            </div>
            <div className="md:col-span-4">
              <PaperFieldLabel>Sex</PaperFieldLabel>
              <RadioGroup
                value={newPatient.personal.sex || undefined}
                onValueChange={(v) =>
                  setNewPatient({
                    ...newPatient,
                    personal: { ...newPatient.personal, sex: (v as NewPatientIntakePayload["personal"]["sex"]) || "" },
                  })
                }
                className="flex flex-wrap gap-4 pt-1"
              >
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <RadioGroupItem value="male" id="np-paper-m" className="border-[#0f2942]" />
                  Male
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <RadioGroupItem value="female" id="np-paper-f" className="border-[#0f2942]" />
                  Female
                </label>
              </RadioGroup>
            </div>
            <div className="md:col-span-4">
              <PaperFieldLabel>Marital status</PaperFieldLabel>
              <Input className={cn(tin("navy"), "w-full")} value={newPatient.personal.maritalStatus} onChange={(e) => setNewPatient({ ...newPatient, personal: { ...newPatient.personal, maritalStatus: e.target.value } })} />
            </div>
            <div className="md:col-span-4">
              <PaperFieldLabel>Contact no.</PaperFieldLabel>
              <Input className={cn(tin("navy"), "w-full")} value={newPatient.personal.contactNo} onChange={(e) => setNewPatient({ ...newPatient, personal: { ...newPatient.personal, contactNo: e.target.value } })} />
            </div>
            <div className="md:col-span-6">
              <PaperFieldLabel>Occupation</PaperFieldLabel>
              <Input className={cn(tin("navy"), "w-full")} value={newPatient.personal.occupation} onChange={(e) => setNewPatient({ ...newPatient, personal: { ...newPatient.personal, occupation: e.target.value } })} />
            </div>
            <div className="md:col-span-6">
              <PaperFieldLabel>Emergency contact name</PaperFieldLabel>
              <Input className={cn(tin("navy"), "w-full")} value={newPatient.personal.emergencyContactName} onChange={(e) => setNewPatient({ ...newPatient, personal: { ...newPatient.personal, emergencyContactName: e.target.value } })} />
            </div>
            <div className="md:col-span-12">
              <PaperFieldLabel>Emergency contact no.</PaperFieldLabel>
              <Input className={cn(tin("navy"), "w-full")} value={newPatient.personal.emergencyContactNo} onChange={(e) => setNewPatient({ ...newPatient, personal: { ...newPatient.personal, emergencyContactNo: e.target.value } })} />
            </div>
          </div>
        </PaperFormSection>

        <PaperFormSection tone="forest" title="Family medical history">
          <div className="grid grid-cols-1 gap-x-2 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-3">
            {FAMILY_HISTORY.map((item) => (
              <CheckRowPaper key={item.id} tone="forest" label={item.label} checked={!!newPatient.familyHistory[item.id]} onChecked={(v) => toggleMap("familyHistory", item.id, v)} />
            ))}
          </div>
          <div className="mt-3 border-t border-[#14532d]/25 pt-2">
            <PaperFieldLabel>Diabetes – type</PaperFieldLabel>
            <Input className={cn(tin("forest"), "mt-1 w-full max-w-md")} value={newPatient.familyDiabetesType} onChange={(e) => setNewPatient({ ...newPatient, familyDiabetesType: e.target.value })} />
          </div>
        </PaperFormSection>

        <PaperFormSection tone="forest" title="Past medical history">
          <p className="mb-3 border-l-4 border-[#14532d]/40 pl-2 text-[10px] italic leading-relaxed text-neutral-800">{PAST_MEDICAL_INTRO}</p>
          <div className="grid grid-cols-1 gap-x-2 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-4">
            {PAST_MEDICAL.map((item) => (
              <CheckRowPaper key={item.id} tone="forest" label={item.label} checked={!!newPatient.pastMedical[item.id]} onChecked={(v) => toggleMap("pastMedical", item.id, v)} />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 border-t border-[#14532d]/25 pt-3 sm:grid-cols-2">
            {PAST_MEDICAL_NOTE_KEYS.map((k) => (
              <div key={k.id}>
                <PaperFieldLabel>{k.label}</PaperFieldLabel>
                <Input className={cn(tin("forest"), "w-full")} value={newPatient.pastMedicalNotes[k.id] || ""} onChange={(e) => setNewPatient({ ...newPatient, pastMedicalNotes: { ...newPatient.pastMedicalNotes, [k.id]: e.target.value } })} />
              </div>
            ))}
          </div>
        </PaperFormSection>

        <PaperFormSection tone="navy" title="Do any of the following apply to you?">
          <div className="grid grid-cols-1 gap-x-2 sm:grid-cols-2 lg:grid-cols-3">
            {SAFETY_FLAGS.map((item) => (
              <CheckRowPaper key={item.id} tone="navy" label={item.label} checked={!!newPatient.safetyFlags[item.id]} onChecked={(v) => toggleMap("safetyFlags", item.id, v)} />
            ))}
          </div>
        </PaperFormSection>

        {ORGAN_SECTIONS.map((sec) => {
          const tone = organTone(sec.title);
          return (
            <PaperFormSection key={sec.title} tone={tone} title={sec.title}>
              <div className="grid grid-cols-1 gap-x-2 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-3">
                {sec.items.map((item) => (
                  <CheckRowPaper key={item.id} tone={tone} label={item.label} checked={!!newPatient.organSystems[item.id]} onChecked={(v) => toggleMap("organSystems", item.id, v)} />
                ))}
              </div>
              {sec.title === "SPLEEN SYSTEM" && (
                <div className="mt-3 border-t border-black/10 pt-2">
                  <PaperFieldLabel>On a special diet</PaperFieldLabel>
                  <Input className={cn(tin(tone), "mt-1 w-full max-w-lg")} placeholder="Describe" value={newPatient.clinical.onSpecialDietNotes} onChange={(e) => setNewPatient({ ...newPatient, clinical: { ...newPatient.clinical, onSpecialDietNotes: e.target.value } })} />
                </div>
              )}
              {sec.title === "SKIN HEALTH" && (
                <div className="mt-3 grid gap-2 border-t border-black/10 pt-3 sm:grid-cols-3">
                  <div>
                    <PaperFieldLabel>Acne — location</PaperFieldLabel>
                    <Input className={cn(tin(tone), "w-full")} value={newPatient.clinical.skinAcneLocation} onChange={(e) => setNewPatient({ ...newPatient, clinical: { ...newPatient.clinical, skinAcneLocation: e.target.value } })} />
                  </div>
                  <div>
                    <PaperFieldLabel>Eczema — location</PaperFieldLabel>
                    <Input className={cn(tin(tone), "w-full")} value={newPatient.clinical.skinEczemaLocation} onChange={(e) => setNewPatient({ ...newPatient, clinical: { ...newPatient.clinical, skinEczemaLocation: e.target.value } })} />
                  </div>
                  <div>
                    <PaperFieldLabel>Rashes</PaperFieldLabel>
                    <Input className={cn(tin(tone), "w-full")} value={newPatient.clinical.skinRashesNotes} onChange={(e) => setNewPatient({ ...newPatient, clinical: { ...newPatient.clinical, skinRashesNotes: e.target.value } })} />
                  </div>
                </div>
              )}
            </PaperFormSection>
          );
        })}

        <section className="overflow-hidden border-2 border-neutral-900 shadow-sm">
          <p className="bg-white px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-neutral-800">Signature over printed name / date</p>
          <div className="border-t-2 border-neutral-900 bg-white px-3 py-2 text-center text-[12px] font-black uppercase tracking-wide text-neutral-900">
            Informed consent for acupuncture treatment
          </div>
          <div className="max-h-[min(52vh,480px)] overflow-y-auto border-t border-neutral-900 px-3 py-2 text-justify text-[11px] leading-relaxed text-neutral-900" dangerouslySetInnerHTML={{ __html: INFORMED_CONSENT_ACUPUNCTURE_HTML }} />
          <div className="my-2 border-t-2 border-dashed border-neutral-700" />
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wide text-neutral-900">{CONSENT_STATEMENT_INTRO}</p>
          <div className="grid grid-cols-2 gap-1 px-3 pb-3 sm:grid-cols-3 md:grid-cols-5">
            {CONSENT_SPECIAL.map((item) => (
              <CheckRowPaper key={item.id} tone="navy" label={item.label} checked={!!newPatient.consent.specialConditions[item.id]} onChecked={(v) => setNewPatient({ ...newPatient, consent: { ...newPatient.consent, specialConditions: { ...newPatient.consent.specialConditions, [item.id]: v } } })} />
            ))}
          </div>
          <div className="my-2 border-t-2 border-dashed border-neutral-700" />
          <div className="whitespace-pre-wrap px-3 pb-3 text-center text-[11px] leading-relaxed text-neutral-900">{CONSENT_SIGNATURE_BLOCK}</div>
          <div className="grid gap-3 border-t-2 border-neutral-900 bg-neutral-50 p-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-[10px] font-bold uppercase text-neutral-800">Printed name (“the patient”)</Label>
              <Input className="mt-1 h-9 w-full rounded-none border-0 border-b-2 border-neutral-800 bg-transparent" value={newPatient.consent.patientPrintedName} onChange={(e) => setNewPatient({ ...newPatient, consent: { ...newPatient.consent, patientPrintedName: e.target.value } })} />
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase text-neutral-800">Name</Label>
              <Input className="mt-1 h-9 w-full rounded-none border-0 border-b-2 border-neutral-800 bg-transparent" value={newPatient.consent.signerName} onChange={(e) => setNewPatient({ ...newPatient, consent: { ...newPatient.consent, signerName: e.target.value } })} />
              <p className="mt-1 text-center text-[9px] text-neutral-600">Patient / parent / guardian</p>
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase text-neutral-800">Date</Label>
              <Input type="date" className="mt-1 h-9 w-full rounded-none border-0 border-b-2 border-neutral-800 bg-transparent" value={newPatient.consent.signedDate} onChange={(e) => setNewPatient({ ...newPatient, consent: { ...newPatient.consent, signedDate: e.target.value } })} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-[10px] font-bold uppercase text-neutral-800">Role</Label>
              <Input className="mt-1 h-9 w-full rounded-none border-0 border-b-2 border-neutral-800 bg-transparent" value={newPatient.consent.signerRole} onChange={(e) => setNewPatient({ ...newPatient, consent: { ...newPatient.consent, signerRole: e.target.value } })} />
            </div>
          </div>
          <label className="flex cursor-pointer items-start gap-2 border-t border-neutral-300 bg-neutral-100/80 p-3 text-[11px] text-neutral-800">
            <Checkbox checked={newPatient.consent.acknowledged} onCheckedChange={(v) => setNewPatient({ ...newPatient, consent: { ...newPatient.consent, acknowledged: v === true } })} className="mt-0.5" />
            <span>Staff confirm: risks and benefits were reviewed with the patient (or guardian); this record is accurate to the best of our knowledge.</span>
          </label>
        </section>

        <PaperFormSection tone="navy" title="Patient intake" bodyClassName="bg-white">
          <div className="grid gap-0 border-2 border-[#0f2942] md:grid-cols-2">
            <div className="space-y-3 border-b border-[#0f2942] p-3 md:border-b-0 md:border-r">
              <div>
                <PaperFieldLabel>Chief complaints</PaperFieldLabel>
                <Textarea rows={6} className={cn(tin("navy"), "mt-1 min-h-[140px] w-full")} value={newPatient.clinical.chiefComplaints} onChange={(e) => setNewPatient({ ...newPatient, clinical: { ...newPatient.clinical, chiefComplaints: e.target.value } })} />
              </div>
              <div>
                <PaperFieldLabel>Present illness history</PaperFieldLabel>
                <Textarea rows={7} className={cn(tin("navy"), "mt-1 min-h-[160px] w-full")} value={newPatient.clinical.presentIllnessHistory} onChange={(e) => setNewPatient({ ...newPatient, clinical: { ...newPatient.clinical, presentIllnessHistory: e.target.value } })} />
              </div>
            </div>
            <div className="space-y-3 p-3">
              <PaperFieldLabel>Tongue and pulse</PaperFieldLabel>
              <Textarea rows={8} className={cn("min-h-[180px] w-full rounded-sm border-2 border-[#0f2942]/40 bg-white p-2 text-sm")} value={newPatient.clinical.tonguePulse} onChange={(e) => setNewPatient({ ...newPatient, clinical: { ...newPatient.clinical, tonguePulse: e.target.value } })} />
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-[#0f2942]/40 p-2">
                  <p className="mb-2 text-center text-[9px] font-bold uppercase text-[#0f2942]">Left</p>
                  {(["cun_l", "guan_l", "chi_l"] as const).map((id) => {
                    const k = TEN_QUESTION_KEYS.find((x) => x.id === id)!;
                    return (
                      <div key={id} className="mb-2">
                        <span className="text-[10px] font-bold">{k.label}:</span>
                        <Input className={cn(tin("navy"), "h-7 w-full")} value={newPatient.clinical.tenQuestionSong[id] || ""} onChange={(e) => setNewPatient({ ...newPatient, clinical: { ...newPatient.clinical, tenQuestionSong: { ...newPatient.clinical.tenQuestionSong, [id]: e.target.value } } })} />
                      </div>
                    );
                  })}
                </div>
                <div className="border border-[#0f2942]/40 p-2">
                  <p className="mb-2 text-center text-[9px] font-bold uppercase text-[#0f2942]">Right</p>
                  {(["cun_r", "guan_r", "chi_r"] as const).map((id) => {
                    const k = TEN_QUESTION_KEYS.find((x) => x.id === id)!;
                    return (
                      <div key={id} className="mb-2">
                        <span className="text-[10px] font-bold">{k.label}:</span>
                        <Input className={cn(tin("navy"), "h-7 w-full")} value={newPatient.clinical.tenQuestionSong[id] || ""} onChange={(e) => setNewPatient({ ...newPatient, clinical: { ...newPatient.clinical, tenQuestionSong: { ...newPatient.clinical.tenQuestionSong, [id]: e.target.value } } })} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-0 border-2 border-[#0f2942] md:grid-cols-2">
            <div className="border-b border-[#0f2942] p-3 md:border-b-0 md:border-r">
              <PaperFieldLabel>10 question song</PaperFieldLabel>
              <div className="mt-2 border-y border-[#0f2942]/15">
                {TEN_QUESTION_KEYS.slice(6).map((k) => (
                  <div key={k.id} className="flex flex-row items-start gap-2 border-b border-[#0f2942]/10 py-2 last:border-b-0 sm:items-center sm:gap-3">
                    <span className="w-[38%] max-w-[11.5rem] shrink-0 pt-0.5 text-[10px] font-semibold leading-snug text-neutral-800 sm:w-[40%] sm:max-w-[14rem]">
                      {k.label}
                    </span>
                    <Input
                      className={cn(tin("navy"), "h-8 min-h-8 min-w-0 flex-1")}
                      value={newPatient.clinical.tenQuestionSong[k.id] || ""}
                      onChange={(e) =>
                        setNewPatient({
                          ...newPatient,
                          clinical: {
                            ...newPatient.clinical,
                            tenQuestionSong: { ...newPatient.clinical.tenQuestionSong, [k.id]: e.target.value },
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3">
              <BodyDiagramPainMap
                markers={newPatient.clinical.bodyPainMarkers}
                painLevel={newPatient.clinical.painLevel}
                onPainLevel={(n) =>
                  setNewPatient((prev) => ({
                    ...prev,
                    clinical: { ...prev.clinical, painLevel: n },
                  }))
                }
                onMarkersChange={(bodyPainMarkers) =>
                  setNewPatient((prev) => ({
                    ...prev,
                    clinical: { ...prev.clinical, bodyPainMarkers },
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-3">
            <WomenHealthPaperForm women={newPatient.clinical.women} setWomen={(next) => setNewPatient({ ...newPatient, clinical: { ...newPatient.clinical, women: next } })} />
          </div>

          <div className="mt-3 grid gap-0 border-2 border-[#0f2942] md:grid-cols-2">
            <div className="space-y-3 border-b border-[#0f2942] p-3 md:border-b-0 md:border-r">
              <div>
                <PaperFieldLabel>TCM diagnosis</PaperFieldLabel>
                <Textarea rows={5} className={cn("mt-1 w-full rounded-sm border-2 border-[#0f2942]/30 bg-white p-2 text-sm")} value={newPatient.clinical.tcmDiagnosis} onChange={(e) => setNewPatient({ ...newPatient, clinical: { ...newPatient.clinical, tcmDiagnosis: e.target.value } })} />
              </div>
              <div>
                <PaperFieldLabel>Treatment principles</PaperFieldLabel>
                <Textarea rows={5} className={cn("mt-1 w-full rounded-sm border-2 border-[#0f2942]/30 bg-white p-2 text-sm")} value={newPatient.clinical.treatmentPrinciples} onChange={(e) => setNewPatient({ ...newPatient, clinical: { ...newPatient.clinical, treatmentPrinciples: e.target.value } })} />
              </div>
            </div>
            <div className="p-3">
              <PaperFieldLabel>Treatment methods</PaperFieldLabel>
              <Textarea rows={14} className={cn("mt-1 w-full rounded-sm border-2 border-[#0f2942]/30 bg-white p-2 text-sm")} value={newPatient.clinical.treatmentMethods} onChange={(e) => setNewPatient({ ...newPatient, clinical: { ...newPatient.clinical, treatmentMethods: e.target.value } })} />
            </div>
          </div>

          <div className="mt-3 grid border-2 border-[#0f2942] md:grid-cols-2">
            <div className="border-b border-[#0f2942] p-3 md:border-b-0 md:border-r">
              <PaperFieldLabel>Notes</PaperFieldLabel>
              <Textarea rows={6} className={cn("mt-1 w-full rounded-sm border-2 border-[#0f2942]/25 bg-white p-2 text-sm")} value={newPatient.clinical.notes} onChange={(e) => setNewPatient({ ...newPatient, clinical: { ...newPatient.clinical, notes: e.target.value } })} />
            </div>
            <div className="min-h-[120px] bg-[#fafafa] p-3 text-[10px] text-neutral-400">Additional notes / continuation</div>
          </div>
        </PaperFormSection>

        <div className="flex justify-end border-t-2 border-[#0c2340] pt-4">
          <Button type="button" size="sm" className="h-10 rounded-sm bg-[#0f2942] px-6 font-bold hover:bg-[#0a1f33]" onClick={onSave} disabled={saving}>
            <Save size={16} className="mr-2" />
            Save new patient intake
          </Button>
        </div>
      </div>
    </div>
  );
}
