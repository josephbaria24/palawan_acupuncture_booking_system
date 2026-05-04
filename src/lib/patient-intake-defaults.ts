import {
  CONSENT_SPECIAL,
  FAMILY_HISTORY,
  mapFromDefs,
  mapFromSections,
  ORGAN_SECTIONS,
  PAST_MEDICAL,
  SAFETY_FLAGS,
  TEN_QUESTION_KEYS,
} from "@/lib/intake-form-definitions";
import type { FollowUpIntakePayload, NewPatientIntakePayload, WomenIntakeFields } from "@/types/patient-intake";

function emptyTenQuestionSong(): Record<string, string> {
  return TEN_QUESTION_KEYS.reduce<Record<string, string>>((acc, k) => {
    acc[k.id] = "";
    return acc;
  }, {});
}

function defaultWomenIntake(): WomenIntakeFields {
  return {
    pregnant: "",
    ageOfMenarche: "",
    lastPeriodDate: "",
    durationFlow: "",
    cycleDays: "",
    periodDetails: {
      normal: false,
      excessive: false,
      scanty: false,
      clotting: false,
      cramping: false,
      low_back: false,
      breast_tenderness: false,
    },
    periodColor: "",
  };
}

export function defaultFollowUp(name: string): FollowUpIntakePayload {
  return {
    intakeDate: "",
    patientName: name,
    age: "",
    sex: "",
    chiefComplaints: "",
    tonguePulse: "",
    presentIllnessHistory: "",
    tenQuestionSong: emptyTenQuestionSong(),
    painLevel: "",
    women: defaultWomenIntake(),
    tcmDiagnosis: "",
    treatmentPrinciple: "",
    treatmentMethods: "",
    notes: "",
  };
}

export function defaultNewPatient(name: string, phone: string): NewPatientIntakePayload {
  return {
    intakeDate: "",
    familyDiabetesType: "",
    personal: {
      name,
      age: "",
      dateOfBirth: "",
      address: "",
      sex: "",
      maritalStatus: "",
      contactNo: phone,
      occupation: "",
      emergencyContactName: "",
      emergencyContactNo: "",
    },
    familyHistory: mapFromDefs(FAMILY_HISTORY),
    pastMedical: mapFromDefs(PAST_MEDICAL),
    pastMedicalNotes: {
      cancer: "",
      diabetes: "",
      hepatitis: "",
      herpes: "",
      major_trauma: "",
      pacemaker: "",
      surgery: "",
      others: "",
    },
    safetyFlags: mapFromDefs(SAFETY_FLAGS),
    organSystems: mapFromSections(ORGAN_SECTIONS),
    consent: {
      acknowledged: false,
      specialConditions: mapFromDefs(CONSENT_SPECIAL),
      patientPrintedName: "",
      signerName: "",
      signerRole: "",
      signedDate: "",
    },
    clinical: {
      chiefComplaints: "",
      tonguePulse: "",
      presentIllnessHistory: "",
      tenQuestionSong: emptyTenQuestionSong(),
      painLevel: "",
      women: defaultWomenIntake(),
      tcmDiagnosis: "",
      treatmentMethods: "",
      treatmentPrinciples: "",
      notes: "",
      skinAcneLocation: "",
      skinEczemaLocation: "",
      skinRashesNotes: "",
      onSpecialDietNotes: "",
      bodyPainMarkers: [],
    },
  };
}

export function mergeFollowUp(base: FollowUpIntakePayload, saved: Partial<FollowUpIntakePayload> | null): FollowUpIntakePayload {
  if (!saved) return base;
  return {
    ...base,
    ...saved,
    tenQuestionSong: { ...base.tenQuestionSong, ...(saved.tenQuestionSong || {}) },
    women: {
      ...base.women,
      ...(saved.women || {}),
      periodDetails: {
        ...base.women.periodDetails,
        ...(saved.women?.periodDetails || {}),
      },
    },
  };
}

export function mergeNewPatient(base: NewPatientIntakePayload, saved: Partial<NewPatientIntakePayload> | null): NewPatientIntakePayload {
  if (!saved) return base;
  return {
    ...base,
    ...saved,
    familyDiabetesType: saved.familyDiabetesType ?? base.familyDiabetesType,
    personal: { ...base.personal, ...saved.personal },
    familyHistory: { ...base.familyHistory, ...saved.familyHistory },
    pastMedical: { ...base.pastMedical, ...saved.pastMedical },
    pastMedicalNotes: { ...base.pastMedicalNotes, ...saved.pastMedicalNotes },
    safetyFlags: { ...base.safetyFlags, ...saved.safetyFlags },
    organSystems: { ...base.organSystems, ...saved.organSystems },
    consent: {
      ...base.consent,
      ...saved.consent,
      specialConditions: { ...base.consent.specialConditions, ...saved.consent?.specialConditions },
    },
    clinical: {
      ...base.clinical,
      ...saved.clinical,
      tenQuestionSong: { ...base.clinical.tenQuestionSong, ...saved.clinical?.tenQuestionSong },
      bodyPainMarkers: Array.isArray(saved.clinical?.bodyPainMarkers)
        ? saved.clinical!.bodyPainMarkers
        : base.clinical.bodyPainMarkers,
      women: {
        ...base.clinical.women,
        ...saved.clinical?.women,
        periodDetails: {
          ...base.clinical.women.periodDetails,
          ...saved.clinical?.women?.periodDetails,
        },
      },
    },
  };
}
